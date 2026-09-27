import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import {
  CommunicationsService,
  type CommunicationsTransaction,
} from "./communications-service.js";
import { PostgresCommunicationsStore } from "./postgres-communications-store.js";

const actor = { accountId: "account_pg_sender_001" } as const;
const baseInput = {
  noticeIntentId: "notice_pg_001",
  recipientAccountId: "account_pg_recipient_001",
  subject: "Round update",
  body: "Your round assignment has changed.",
  expectedAuthorityVersion: 7,
  expectedVersion: 0 as const,
  idempotencyKey: "notice-pg-command-001",
  correlationId: "request-pg-001",
  causationId: "pairing-pg-001",
};

function service(
  store: PostgresCommunicationsStore,
  now: Date,
  suffix: string,
) {
  let sequence = 0;
  return new CommunicationsService({
    store,
    authority: {
      resolve: () => Promise.resolve({ allowed: true, authorityVersion: 7 }),
    },
    provider: {
      deliver: ({ idempotencyKey }) =>
        Promise.resolve({ providerMessageId: `mail:${idempotencyKey}` }),
    },
    now: () => new Date(now),
    nextId: (kind) => `${kind}_${suffix}_${String(++sequence)}`,
    retentionMilliseconds: 60_000,
  });
}

describe("PostgreSQL communications boundary", () => {
  it("commits intent and outbox together, rolls back a partial transaction and rejects a conflicting concurrent action", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const store = new PostgresCommunicationsStore(database.databaseUrl);
        const now = new Date("2026-09-26T20:00:00.000Z");
        const first = service(store, now, "atomic_a");
        const second = service(store, now, "atomic_b");

        const results = await Promise.allSettled([
          first.createNoticeIntent(actor, baseInput),
          second.createNoticeIntent(actor, {
            ...baseInput,
            idempotencyKey: "notice-pg-command-conflict",
            body: "A conflicting concurrent body.",
          }),
        ]);
        expect(
          results.filter(({ status }) => status === "fulfilled"),
        ).toHaveLength(1);
        expect(
          results.filter(({ status }) => status === "rejected"),
        ).toHaveLength(1);
        const persisted = await database.query<{
          intents: number;
          outbox: number;
          receipts: number;
        }>(
          "select (select count(*)::int from communications_notice_intents) as intents, (select count(*)::int from communications_module_outbox) as outbox, (select count(*)::int from communications_notice_receipts) as receipts",
        );
        expect(persisted.rows[0]).toEqual({
          intents: 1,
          outbox: 1,
          receipts: 1,
        });

        await expect(
          store.transaction(async (transaction: CommunicationsTransaction) => {
            const existing = await transaction.getIntent("notice_pg_001");
            if (!existing) throw new Error("missing fixture intent");
            await transaction.saveIntent({
              ...existing,
              state: "retrying",
              version: existing.version + 1,
            });
            throw new Error("SIMULATED_AFTER_DOMAIN_WRITE");
          }),
        ).rejects.toThrow("SIMULATED_AFTER_DOMAIN_WRITE");
        const unchanged = await database.query<{
          delivery_state: string;
          record_version: number;
        }>(
          "select delivery_state, record_version from communications_notice_intents where notice_intent_id='notice_pg_001'",
        );
        expect(unchanged.rows[0]).toEqual({
          delivery_state: "queued",
          record_version: 1,
        });
      },
    );
  });

  it("persists idempotent delivery and retry history across service restarts", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const now = new Date("2026-09-26T20:00:00.000Z");
        const store = new PostgresCommunicationsStore(database.databaseUrl);
        const creator = service(store, now, "creator");
        const created = await creator.createNoticeIntent(actor, baseInput);

        const restarted = service(
          new PostgresCommunicationsStore(database.databaseUrl),
          now,
          "restarted",
        );
        await expect(
          restarted.deliverNotice(created.outbox),
        ).resolves.toMatchObject({
          state: "delivered",
          equivalentRetry: false,
        });
        await expect(
          restarted.deliverNotice(created.outbox),
        ).resolves.toMatchObject({ state: "delivered", equivalentRetry: true });
        await expect(
          restarted.readAccessInbox(
            { accountId: baseInput.recipientAccountId },
            baseInput.recipientAccountId,
          ),
        ).resolves.toMatchObject({
          items: [
            {
              noticeIntentId: "notice_pg_001",
              deliveryState: "delivered",
            },
          ],
        });
        const attempts = await database.query<{
          attempt_number: number;
          delivery_state: string;
        }>(
          "select attempt_number, delivery_state from communications_delivery_attempts order by attempt_number",
        );
        expect(attempts.rows).toEqual([
          { attempt_number: 1, delivery_state: "delivered" },
        ]);
      },
    );
  });

  it("reclaims an abandoned outbox lease and deletes only expired data not under Legal Hold", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const now = new Date("2026-09-26T20:00:00.000Z");
        const store = new PostgresCommunicationsStore(database.databaseUrl);
        const comms = service(store, now, "lease");
        await comms.createNoticeIntent(actor, baseInput);

        const first = await store.claimOutbox("worker-abandoned", now, 1_000);
        expect(first).toMatchObject({ state: "claimed", publishAttempts: 1 });
        await expect(
          store.claimOutbox(
            "worker-too-early",
            new Date(now.getTime() + 999),
            1_000,
          ),
        ).resolves.toBeUndefined();
        await expect(
          store.claimOutbox(
            "worker-replacement",
            new Date(now.getTime() + 1_001),
            1_000,
          ),
        ).resolves.toMatchObject({
          state: "claimed",
          claimOwner: "worker-replacement",
          publishAttempts: 2,
        });

        const cleanup = service(
          store,
          new Date(now.getTime() + 60_001),
          "cleanup",
        );
        await database.query(
          "update communications_notice_intents set legal_hold=true where notice_intent_id=$1",
          [baseInput.noticeIntentId],
        );
        await expect(cleanup.deleteExpired()).resolves.toEqual({
          intents: 0,
          attempts: 0,
          inboxItems: 0,
        });
        await database.query(
          "update communications_notice_intents set legal_hold=false where notice_intent_id=$1",
          [baseInput.noticeIntentId],
        );
        await expect(cleanup.deleteExpired()).resolves.toEqual({
          intents: 1,
          attempts: 0,
          inboxItems: 0,
        });
      },
    );
  });
});
