import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import {
  IdentityService,
  type ClerkIdentity,
  type IdentityStore,
} from "./identity-service.js";
import { PostgresIdentityStore } from "./postgres-identity-store.js";
import {
  IdentityWebhookHintService,
  PostgresIdentityWebhookHintStore,
  WebhookHintConflictError,
} from "./webhook-hints.js";

const now = new Date("2026-09-25T18:00:00.000Z");

function identity(changes: Partial<ClerkIdentity> = {}): ClerkIdentity {
  return {
    userId: "user_clerk_001",
    sessionId: "session_clerk_001",
    verifiedEmail: "person@example.test",
    profileName: "Example Person",
    signInMethod: "google",
    expiresAt: new Date("2026-09-25T19:00:00.000Z"),
    ...changes,
  };
}

function service(databaseUrl: string, processId: string): IdentityService {
  const counters = { account: 0, session: 0, event: 0 };
  return new IdentityService({
    store: new PostgresIdentityStore(databaseUrl),
    now: () => new Date(now),
    nextId: (kind) =>
      `${kind}_postgres_${processId}_${String(++counters[kind])}`,
  });
}

describe("PostgreSQL identity persistence", () => {
  it("persists one stable Account, sessions, immutable events, and equivalent receipts", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const firstService = service(database.databaseUrl, "first");
        const first = await firstService.createDocketSession({
          identity: identity(),
          idempotencyKey: "create-session-001",
        });
        const retry = await firstService.createDocketSession({
          identity: identity(),
          idempotencyKey: "create-session-001",
        });

        expect(retry).toEqual(first);
        expect(first.account.authority).toEqual([]);

        const secondIdentity = identity({ sessionId: "session_clerk_002" });
        const second = await firstService.createDocketSession({
          identity: secondIdentity,
          idempotencyKey: "create-session-002",
        });

        const restartedService = service(database.databaseUrl, "restarted");
        await expect(
          restartedService.listDocketSessions(identity()),
        ).resolves.toEqual([first.session, second.session]);

        const revoked = await restartedService.revokeDocketSession({
          identity: identity(),
          sessionId: second.session.id,
          expectedVersion: 1,
          idempotencyKey: "revoke-session-001",
        });
        const revokeRetry = await restartedService.revokeDocketSession({
          identity: identity(),
          sessionId: second.session.id,
          expectedVersion: 1,
          idempotencyKey: "revoke-session-001",
        });
        expect(revokeRetry).toEqual(revoked);
        expect(revoked.session).toMatchObject({
          status: "revoked",
          version: 2,
        });

        const counts = await database.query<{
          accounts: number;
          links: number;
          sessions: number;
          receipts: number;
          events: number;
        }>(
          "select (select count(*)::integer from identity_accounts) as accounts, (select count(*)::integer from identity_clerk_links) as links, (select count(*)::integer from identity_sessions) as sessions, (select count(*)::integer from identity_command_receipts) as receipts, (select count(*)::integer from identity_events) as events",
        );
        expect(counts.rows[0]).toEqual({
          accounts: 1,
          links: 1,
          sessions: 2,
          receipts: 3,
          events: 4,
        });
      },
    );
  });

  it("rejects one of two truly overlapping revocations at the PostgreSQL boundary", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const setup = service(database.databaseUrl, "overlap-setup");
        const actorIdentity = identity();
        await setup.createDocketSession({
          identity: actorIdentity,
          idempotencyKey: "overlap-create-actor",
        });
        const target = await setup.createDocketSession({
          identity: identity({ sessionId: "session_clerk_overlap_target" }),
          idempotencyKey: "overlap-create-target",
        });

        let arrivals = 0;
        let release!: () => void;
        const bothReadTarget = new Promise<void>((resolve) => {
          release = resolve;
        });
        const overlappingStore = (): IdentityStore => {
          const postgres = new PostgresIdentityStore(database.databaseUrl);
          return {
            transaction: (work) =>
              postgres.transaction((transaction) =>
                work({
                  ...transaction,
                  getSession: async (sessionId) => {
                    const current = await transaction.getSession(sessionId);
                    if (sessionId === target.session.id) {
                      arrivals += 1;
                      if (arrivals === 2) release();
                      await bothReadTarget;
                    }
                    return current;
                  },
                }),
              ),
          };
        };
        const contender = (processId: string, idempotencyKey: string) => {
          const counters = { account: 0, session: 0, event: 0 };
          const identityService = new IdentityService({
            store: overlappingStore(),
            now: () => new Date(now),
            nextId: (kind) =>
              `${kind}_postgres_${processId}_${String(++counters[kind])}`,
          });
          return identityService.revokeDocketSession({
            identity: actorIdentity,
            sessionId: target.session.id,
            expectedVersion: 1,
            idempotencyKey,
          });
        };

        const outcomes = await Promise.allSettled([
          contender("overlap-left", "overlap-revoke-left"),
          contender("overlap-right", "overlap-revoke-right"),
        ]);
        expect(
          outcomes.filter(({ status }) => status === "fulfilled"),
        ).toHaveLength(1);
        expect(
          outcomes.filter(({ status }) => status === "rejected"),
        ).toHaveLength(1);
        expect(
          outcomes.find(({ status }) => status === "rejected"),
        ).toMatchObject({
          status: "rejected",
          reason: { code: "AUTHORITY_STALE" },
        });

        const persisted = await database.query<{
          status: string;
          record_version: number;
          events: number;
          receipts: number;
        }>(
          "select status, record_version, (select count(*)::integer from identity_events where event_name = 'SessionRevoked' and aggregate_id = $1) as events, (select count(*)::integer from identity_command_receipts where session_id = $1 and idempotency_key like 'overlap-revoke-%') as receipts from identity_sessions where session_id = $1",
          [target.session.id],
        );
        expect(persisted.rows).toEqual([
          {
            status: "revoked",
            record_version: 2,
            events: 1,
            receipts: 1,
          },
        ]);
      },
    );
  });

  it("rolls back every write when authoritative work fails", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        const store = new PostgresIdentityStore(database.databaseUrl);
        await expect(
          store.transaction(async (transaction) => {
            await transaction.saveAccount({
              id: "account_rollback",
              displayName: "Rollback Person",
              verifiedEmail: "rollback@example.test",
              version: 1,
              createdAt: now,
              updatedAt: now,
            });
            throw new Error("simulated downstream failure");
          }),
        ).rejects.toThrow("simulated downstream failure");

        const accounts = await database.query<{ count: number }>(
          "select count(*)::integer as count from identity_accounts where account_id = 'account_rollback'",
        );
        expect(accounts.rows[0]?.count).toBe(0);
      },
    );
  });

  it("persists idempotent webhook hints and retries delivery failure after restart", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let clock = new Date(now);
        const input = {
          deliveryId: "msg_postgres_001",
          type: "user.updated" as const,
          clerkObjectId: "user_clerk_001",
          occurredAt: new Date(now),
        };
        const firstService = new IdentityWebhookHintService(
          new PostgresIdentityWebhookHintStore(database.databaseUrl),
          () => clock,
        );

        await expect(firstService.enqueueVerifiedHint(input)).resolves.toBe(
          "accepted",
        );
        await expect(firstService.enqueueVerifiedHint(input)).resolves.toBe(
          "duplicate",
        );
        await expect(
          firstService.enqueueVerifiedHint({
            ...input,
            clerkObjectId: "user_conflicting",
          }),
        ).rejects.toBeInstanceOf(WebhookHintConflictError);
        await expect(
          firstService.deliverNext(() =>
            Promise.reject(new Error("provider unavailable")),
          ),
        ).resolves.toEqual({
          status: "failed",
          deliveryId: input.deliveryId,
        });

        const failed = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_webhook_hints where delivery_id = $1",
          [input.deliveryId],
        );
        expect(failed.rows).toEqual([
          {
            attempt_count: 1,
            delivered_at: null,
            last_error_code: "DELIVERY_FAILED",
          },
        ]);

        clock = new Date(clock.getTime() + 60_000);
        const restartedService = new IdentityWebhookHintService(
          new PostgresIdentityWebhookHintStore(database.databaseUrl),
          () => clock,
        );
        const observed: string[] = [];
        await expect(
          restartedService.deliverNext((hint) => {
            observed.push(hint.clerkObjectId);
            return Promise.resolve();
          }),
        ).resolves.toEqual({
          status: "delivered",
          deliveryId: input.deliveryId,
        });
        expect(observed).toEqual([input.clerkObjectId]);

        const delivered = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_webhook_hints where delivery_id = $1",
          [input.deliveryId],
        );
        expect(delivered.rows[0]).toMatchObject({
          attempt_count: 2,
          last_error_code: null,
        });
        expect(delivered.rows[0]?.delivered_at).toBeInstanceOf(Date);
      },
    );
  });
});
