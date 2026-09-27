import {
  IdentityService,
  IdentityWebhookHintService,
  PostgresIdentityStore,
  PostgresIdentityWebhookHintStore,
} from "@docket/identity-access";
import {
  CommunicationsService,
  PostgresCommunicationsStore,
} from "@docket/communications";
import { PgBoss } from "pg-boss";
import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import {
  createAccountSecurityHistoryRetentionWorker,
  communicationsNoticeQueue,
  createCommunicationsQueueWorker,
  createIdentityHintWorker,
  runIdentityHintConsumer,
} from "./index.js";

async function waitFor(
  assertion: () => Promise<boolean>,
  timeoutMilliseconds = 20_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    if (await assertion()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("TIMED_OUT_WAITING_FOR_WORKER");
}

describe("executable identity hint consumer", () => {
  it("deletes expired history on the worker path while preserving Legal Hold across leap-day and DST cases", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const nonUtcUrl = new URL(database.databaseUrl);
        nonUtcUrl.searchParams.set("options", "-c TimeZone=America/Chicago");
        const databaseUrl = nonUtcUrl.toString();
        const createService = (clock: Date, suffix: string) => {
          const counters = { account: 0, session: 0, event: 0 };
          return new IdentityService({
            store: new PostgresIdentityStore(databaseUrl),
            now: () => new Date(clock),
            nextId: (kind) =>
              `${kind}_worker_retention_${suffix}_${String(++counters[kind])}`,
          });
        };

        await createService(
          new Date("2028-02-29T12:00:00.000Z"),
          "leap",
        ).createDocketSession({
          identity: {
            userId: "user_worker_retention_leap",
            sessionId: "session_worker_retention_leap",
            verifiedEmail: "leap@example.test",
            profileName: "Leap Example",
            signInMethod: "google",
            expiresAt: new Date("2028-03-07T12:00:00.000Z"),
          },
          idempotencyKey: "worker-retention-leap-create",
        });
        await createService(
          new Date("2026-03-10T12:00:00.000Z"),
          "dst",
        ).createDocketSession({
          identity: {
            userId: "user_worker_retention_dst",
            sessionId: "session_worker_retention_dst",
            verifiedEmail: "dst@example.test",
            profileName: "DST Example",
            signInMethod: "google",
            expiresAt: new Date("2026-03-17T12:00:00.000Z"),
          },
          idempotencyKey: "worker-retention-dst-create",
        });

        const deadlines = await database.query<{
          history_id: string;
          retained_until: Date;
        }>(
          "select history_id, retained_until from identity_account_security_history order by history_id",
        );
        expect(deadlines.rows).toEqual([
          {
            history_id: "event_worker_retention_dst_3",
            retained_until: new Date("2028-03-10T12:00:00.000Z"),
          },
          {
            history_id: "event_worker_retention_leap_3",
            retained_until: new Date("2030-02-28T12:00:00.000Z"),
          },
        ]);

        await database.query(
          "update identity_account_security_history set legal_hold = true where history_id = $1",
          ["event_worker_retention_leap_3"],
        );
        const cleanupTime = new Date("2030-03-10T12:00:00.000Z");
        const worker = createAccountSecurityHistoryRetentionWorker(
          createService(cleanupTime, "cleanup"),
          { now: () => cleanupTime },
        );
        await expect(worker.runOnce()).resolves.toEqual({
          status: "completed",
          deleted: 1,
        });
        const retained = await database.query<{
          history_id: string;
          legal_hold: boolean;
        }>(
          "select history_id, legal_hold from identity_account_security_history order by history_id",
        );
        expect(retained.rows).toEqual([
          {
            history_id: "event_worker_retention_leap_3",
            legal_hold: true,
          },
        ]);
      },
    );
  });

  it("retries and completes a durable PostgreSQL hint through the polling lifecycle", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let now = new Date("2026-09-25T19:00:00.000Z");
        const service = new IdentityWebhookHintService(
          new PostgresIdentityWebhookHintStore(database.databaseUrl),
          () => now,
        );
        await service.enqueueVerifiedHint({
          deliveryId: "msg_worker_consumer_001",
          type: "user.updated",
          clerkObjectId: "user_worker_consumer_001",
          occurredAt: now,
        });

        const shutdown = new AbortController();
        let attempts = 0;
        const worker = createIdentityHintWorker(service, () => {
          attempts += 1;
          if (attempts === 1) {
            return Promise.reject(new Error("simulated provider outage"));
          }
          shutdown.abort();
          return Promise.resolve();
        });

        await runIdentityHintConsumer(worker, {
          signal: shutdown.signal,
          wait: () => {
            now = new Date(now.getTime() + 60_000);
            return Promise.resolve();
          },
        });

        const persisted = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_webhook_hints where delivery_id = $1",
          ["msg_worker_consumer_001"],
        );
        expect(attempts).toBe(2);
        expect(persisted.rows[0]).toMatchObject({
          attempt_count: 2,
          last_error_code: null,
        });
        expect(persisted.rows[0]?.delivered_at).toBeInstanceOf(Date);
      },
    );
  });
});

describe("pg-boss communications worker", () => {
  it("claims a committed outbox event, retries delivery and remains idempotent after worker restart", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const store = new PostgresCommunicationsStore(database.databaseUrl);
        let id = 0;
        let providerCalls = 0;
        const service = new CommunicationsService({
          store,
          authority: {
            resolve: () =>
              Promise.resolve({ allowed: true, authorityVersion: 2 }),
          },
          provider: {
            deliver: ({ idempotencyKey }) => {
              providerCalls += 1;
              if (providerCalls === 1) {
                return Promise.reject(
                  Object.assign(new Error("temporary provider failure"), {
                    code: "PROVIDER_TEMPORARY",
                  }),
                );
              }
              return Promise.resolve({
                providerMessageId: `provider:${idempotencyKey}`,
              });
            },
          },
          now: () => new Date(),
          nextId: (kind) => `${kind}_boss_${String(++id)}`,
        });
        const created = await service.createNoticeIntent(
          { accountId: "account_boss_sender_001" },
          {
            noticeIntentId: "notice_boss_001",
            recipientAccountId: "account_boss_recipient_001",
            subject: "Committed notice",
            body: "This delivery came from the committed outbox.",
            expectedAuthorityVersion: 2,
            expectedVersion: 0,
            idempotencyKey: "notice-boss-create-001",
            correlationId: "request-boss-001",
            causationId: "command-boss-001",
          },
        );

        const boss = await new PgBoss({
          connectionString: database.databaseUrl,
        }).start();
        const worker = createCommunicationsQueueWorker(boss, store, service, {
          owner: "worker-boss-first",
        });
        try {
          await worker.start();
          await expect(worker.dispatchOnce()).resolves.toMatchObject({
            status: "published",
            eventId: created.outbox.id,
          });
          await waitFor(async () => {
            const row = await database.query<{ delivery_state: string }>(
              "select delivery_state from communications_notice_intents where notice_intent_id=$1",
              [created.intent.id],
            );
            return row.rows[0]?.delivery_state === "delivered";
          });
        } finally {
          await boss.stop({ graceful: true, timeout: 30_000 });
        }

        expect(providerCalls).toBe(2);
        const firstRun = await database.query<{
          attempt_number: number;
          delivery_state: string;
        }>(
          "select attempt_number, delivery_state from communications_delivery_attempts order by attempt_number",
        );
        expect(firstRun.rows).toEqual([
          { attempt_number: 1, delivery_state: "failed" },
          { attempt_number: 2, delivery_state: "delivered" },
        ]);

        let restartedProviderCalls = 0;
        const restartedService = new CommunicationsService({
          store: new PostgresCommunicationsStore(database.databaseUrl),
          authority: {
            resolve: () =>
              Promise.resolve({ allowed: false, authorityVersion: 0 }),
          },
          provider: {
            deliver: () => {
              restartedProviderCalls += 1;
              return Promise.resolve({ providerMessageId: "unexpected" });
            },
          },
        });
        const restartedBoss = await new PgBoss({
          connectionString: database.databaseUrl,
        }).start();
        const restartedWorker = createCommunicationsQueueWorker(
          restartedBoss,
          store,
          restartedService,
          { owner: "worker-boss-restarted" },
        );
        try {
          await restartedWorker.start();
          const duplicateJobId = await restartedBoss.send(
            communicationsNoticeQueue,
            created.outbox,
          );
          if (!duplicateJobId) throw new Error("duplicate job was not queued");
          await waitFor(async () => {
            const jobs = await restartedBoss.findJobs(
              communicationsNoticeQueue,
              {
                id: duplicateJobId,
              },
            );
            return jobs[0]?.state === "completed";
          });
        } finally {
          await restartedBoss.stop({ graceful: true, timeout: 30_000 });
        }
        expect(restartedProviderCalls).toBe(0);
        const logicalEffects = await database.query<{ count: number }>(
          "select count(*)::int as count from communications_inbox_items where notice_intent_id=$1",
          [created.intent.id],
        );
        expect(logicalEffects.rows[0]?.count).toBe(1);
      },
    );
  }, 90_000);
});
