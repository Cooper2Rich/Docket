import {
  loadMigrationPlan,
  runMigrations,
  type MigrationPlan,
} from "@docket/database";
import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import {
  IdentityService,
  type ClerkIdentity,
  type IdentityStore,
} from "./identity-service.js";
import { PostgresIdentityStore } from "./postgres-identity-store.js";
import {
  ClerkSessionTerminationService,
  PostgresClerkSessionTerminationStore,
} from "./session-terminations.js";
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

function service(
  databaseUrl: string,
  processId: string,
  clock: () => Date = () => new Date(now),
): IdentityService {
  const counters = { account: 0, session: 0, event: 0 };
  return new IdentityService({
    store: new PostgresIdentityStore(databaseUrl),
    now: clock,
    nextId: (kind) =>
      `${kind}_postgres_${processId}_${String(++counters[kind])}`,
  });
}

function privilegedDecision(accountId: string, clerkSessionId: string) {
  return {
    decisionId: "postgres-privileged-decision",
    accountId,
    clerkSessionId,
    contextId: "postgres-platform-context",
    contextKind: "platform_administrator" as const,
    authorityVersion: 2,
    currentAuthorityVersion: 2,
    status: "active" as const,
    activation: "restore" as const,
  };
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

  it("refreshes activity without staling a time-advanced self-revocation", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let clock = new Date(now);
        const postgresService = service(
          database.databaseUrl,
          "activity-self-revoke",
          () => new Date(clock),
        );
        const actorIdentity = identity({
          expiresAt: new Date("2026-10-02T18:00:00.000Z"),
        });
        const created = await postgresService.createDocketSession({
          identity: actorIdentity,
          idempotencyKey: "postgres-active-self-create",
        });

        clock = new Date("2026-09-25T18:30:00.000Z");
        await expect(
          postgresService.listDocketSessions(actorIdentity),
        ).resolves.toMatchObject([
          {
            id: created.session.id,
            version: created.session.version,
            lastActivityAt: "2026-09-25T18:30:00.000Z",
          },
        ]);
        clock = new Date("2026-09-25T18:31:00.000Z");
        await expect(
          postgresService.revokeDocketSession({
            identity: actorIdentity,
            sessionId: created.session.id,
            expectedVersion: created.session.version,
            idempotencyKey: "postgres-active-self-revoke",
          }),
        ).resolves.toMatchObject({
          session: { status: "revoked", version: 2 },
        });

        const persisted = await database.query<{
          status: string;
          record_version: number;
        }>(
          "select status, record_version from identity_sessions where session_id = $1",
          [created.session.id],
        );
        expect(persisted.rows).toEqual([
          { status: "revoked", record_version: 2 },
        ]);
      },
    );
  });

  it("persists governed Display Names and deletes only unheld expired Security History", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let clock = new Date(now);
        const postgresService = service(
          database.databaseUrl,
          "account-security",
          () => new Date(clock),
        );
        const actor = identity({
          expiresAt: new Date("2026-10-02T18:00:00.000Z"),
          sessionMetadata: {
            device: "Firefox on desktop",
            approximateLocation: "Austin, US",
          },
        });
        const created = await postgresService.createDocketSession({
          identity: actor,
          idempotencyKey: "account-security-create",
        });
        await postgresService.changeDisplayName({
          identity: actor,
          displayName: "Governed Name",
          expectedVersion: created.account.version,
          idempotencyKey: "account-security-display",
        });

        clock = new Date("2026-10-25T18:00:00.000Z");
        const recoveredIdentity = identity({
          sessionId: "session_clerk_recovered",
          profileName: "Changed Clerk Profile",
          expiresAt: new Date("2026-11-01T18:00:00.000Z"),
        });
        const recovered = await postgresService.createDocketSession({
          identity: recoveredIdentity,
          idempotencyKey: "account-security-recovery",
        });
        expect(recovered.account.displayName).toBe("Governed Name");

        const names = await database.query<{
          display_name: string;
        }>(
          "select display_name from identity_display_name_history order by effective_at, history_id",
        );
        expect(names.rows).toEqual([
          { display_name: "Example Person" },
          { display_name: "Governed Name" },
        ]);
        await expect(
          postgresService.listAccountSecurityHistory(recoveredIdentity),
        ).resolves.toEqual([
          expect.objectContaining({
            kind: "accepted_sign_in",
            occurredAt: "2026-10-25T18:00:00.000Z",
          }),
          expect.objectContaining({
            kind: "accepted_sign_in",
            occurredAt: now.toISOString(),
            device: "Firefox on desktop",
            approximateLocation: "Austin, US",
          }),
        ]);

        await database.query(
          "update identity_account_security_history set legal_hold = true where occurred_at = $1",
          [now],
        );
        clock = new Date("2028-10-25T18:00:00.000Z");
        await expect(
          postgresService.deleteExpiredAccountSecurityHistory(),
        ).resolves.toBe(1);
        const retained = await database.query<{
          occurred_at: Date;
          legal_hold: boolean;
        }>(
          "select occurred_at, legal_hold from identity_account_security_history",
        );
        expect(retained.rows).toEqual([{ occurred_at: now, legal_hold: true }]);
      },
    );
  });

  it("persists trusted privileged restoration, security outcomes, and reviewed name correction", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let clock = new Date(now);
        const actor = identity({
          expiresAt: new Date("2026-10-02T18:00:00.000Z"),
          sessionMetadata: {
            device: "Firefox on desktop",
            approximateLocation: "Austin, US",
          },
        });
        const firstService = service(
          database.databaseUrl,
          "trusted-seams",
          () => new Date(clock),
        );
        const created = await firstService.createDocketSession({
          identity: actor,
          idempotencyKey: "postgres-trusted-create",
        });
        const activationCommand = {
          identity: actor,
          authorization: privilegedDecision(
            created.account.id,
            actor.sessionId,
          ),
          expectedVersion: created.session.version,
          idempotencyKey: "postgres-trusted-activate",
        } as const;
        const activated =
          await firstService.activatePrivilegedDocketSession(activationCommand);
        const restarted = service(
          database.databaseUrl,
          "trusted-restarted",
          () => new Date(clock),
        );
        await expect(
          restarted.activatePrivilegedDocketSession(activationCommand),
        ).resolves.toEqual(activated);
        clock = new Date("2026-09-25T18:20:00.000Z");
        await expect(restarted.listDocketSessions(actor)).resolves.toEqual([
          expect.objectContaining({
            lastActivityAt: "2026-09-25T18:20:00.000Z",
            privilegedActivatedAt: "2026-09-25T18:00:00.000Z",
          }),
        ]);

        const reverification = {
          eventId: "postgres-reverification-001",
          accountId: created.account.id,
          kind: "clerk_reverification" as const,
          source: "validated_clerk_reverification" as const,
          signatureValidated: true as const,
          occurredAt: now,
        };
        const recorded =
          await restarted.recordTrustedAccountSecurityHistory(reverification);
        await database.query(
          "update identity_account_security_history set legal_hold = true where history_id = $1",
          [reverification.eventId],
        );
        await expect(
          restarted.recordTrustedAccountSecurityHistory(reverification),
        ).resolves.toEqual(recorded);
        await expect(
          restarted.recordTrustedAccountSecurityHistory({
            ...reverification,
            occurredAt: new Date("2026-09-25T17:59:59.000Z"),
          }),
        ).rejects.toMatchObject({ code: "IDENTITY_INVALID" });
        await restarted.recordTrustedAccountSecurityHistory({
          eventId: "postgres-suspension-001",
          accountId: created.account.id,
          kind: "account_suspension",
          source: "account_suspension_workflow",
          decisionVersion: 7,
          currentDecisionVersion: 7,
          suspensionStatus: "reinstated",
          occurredAt: now,
        });

        const selfChanged = await restarted.changeDisplayName({
          identity: actor,
          displayName: "Governed Public Name",
          expectedVersion: created.account.version,
          idempotencyKey: "postgres-trusted-self-name",
        });
        const approval = {
          reviewId: "postgres-name-review-001",
          targetAccountId: created.account.id,
          approvedByAccountId: created.account.id,
          permission: "platform_administrator" as const,
          authorityVersion: 9,
          currentAuthorityVersion: 9,
          status: "approved" as const,
          decidedAt: now,
        };
        const corrected =
          await restarted.changeDisplayNameAfterReviewedCorrection({
            displayName: "Reviewed Safety Name",
            expectedVersion: selfChanged.account.version,
            approval,
          });
        await expect(
          restarted.changeDisplayNameAfterReviewedCorrection({
            displayName: "Reviewed Safety Name",
            expectedVersion: selfChanged.account.version,
            approval,
          }),
        ).resolves.toEqual(corrected);

        const persistedSession = await database.query<{
          session_class: string;
          record_version: number;
          last_activity_at: Date;
          privileged_activated_at: Date;
          expires_at: Date;
        }>(
          "select session_class, record_version, last_activity_at, privileged_activated_at, expires_at from identity_sessions where session_id = $1",
          [created.session.id],
        );
        expect(persistedSession.rows).toEqual([
          {
            session_class: "privileged",
            record_version: 2,
            last_activity_at: new Date("2026-09-25T18:20:00.000Z"),
            privileged_activated_at: new Date("2026-09-25T18:00:00.000Z"),
            expires_at: new Date("2026-09-26T06:00:00.000Z"),
          },
        ]);
        const historyKinds = await database.query<{
          history_kind: string;
          legal_hold: boolean;
          suspension_status: string | null;
        }>(
          "select history_kind, legal_hold, suspension_status from identity_account_security_history order by history_id",
        );
        expect(historyKinds.rows).toEqual([
          {
            history_kind: "accepted_sign_in",
            legal_hold: false,
            suspension_status: null,
          },
          {
            history_kind: "clerk_reverification",
            legal_hold: true,
            suspension_status: null,
          },
          {
            history_kind: "account_suspension",
            legal_hold: false,
            suspension_status: "reinstated",
          },
        ]);
        const names = await database.query<{
          display_name: string;
          change_kind: string;
          review_id: string | null;
        }>(
          "select display_name, change_kind, review_id from identity_display_name_history order by case change_kind when 'initial' then 1 when 'self_service' then 2 else 3 end, history_id",
        );
        expect(names.rows).toEqual([
          {
            display_name: "Example Person",
            change_kind: "initial",
            review_id: null,
          },
          {
            display_name: "Governed Public Name",
            change_kind: "self_service",
            review_id: null,
          },
          {
            display_name: "Reviewed Safety Name",
            change_kind: "reviewed_correction",
            review_id: approval.reviewId,
          },
        ]);
      },
    );
  });

  it("caps pre-migration sessions to 168 elapsed hours across DST and projects the effective deadline", async () => {
    await withTestDatabase({ migrate: false }, async (database) => {
      const nonUtcUrl = new URL(database.databaseUrl);
      nonUtcUrl.searchParams.set("options", "-c TimeZone=America/Chicago");
      const nonUtcDatabaseUrl = nonUtcUrl.toString();
      const fullPlan = await loadMigrationPlan(process.cwd());
      const preSecurityMigrations = fullPlan.migrations.slice(0, 2);
      const preSecurityPlan: MigrationPlan = {
        ...fullPlan,
        migrations: preSecurityMigrations,
        digest: "pre-security-test-plan",
        head: preSecurityMigrations.at(-1)?.id ?? null,
      };
      await runMigrations({
        databaseUrl: nonUtcDatabaseUrl,
        plan: preSecurityPlan,
        authority: { actor: "release-operator", authorityVersion: 1 },
      });
      await database.query(
        "insert into identity_accounts (account_id, display_name, verified_email, record_version, created_at, updated_at) values ('account_legacy', 'Legacy Person', 'legacy@example.test', 1, '2026-09-10T18:00:00Z', '2026-09-10T18:00:00Z')",
      );
      await database.query(
        "insert into identity_clerk_links (clerk_user_id, account_id, verified_email, profile_name, record_version, created_at, updated_at) values ('user_legacy', 'account_legacy', 'legacy@example.test', 'Legacy Person', 1, '2026-09-10T18:00:00Z', '2026-09-10T18:00:00Z')",
      );
      await database.query(
        "insert into identity_sessions (session_id, account_id, clerk_user_id, clerk_session_id, status, record_version, created_at, last_activity_at, expires_at, revoked_at) values ('session_legacy_actor', 'account_legacy', 'user_legacy', 'clerk_legacy_actor', 'active', 1, '2026-09-24T18:00:00Z', '2026-09-25T17:30:00Z', '2026-10-10T18:00:00Z', null), ('session_legacy_expired', 'account_legacy', 'user_legacy', 'clerk_legacy_expired', 'active', 1, '2026-09-10T18:00:00Z', '2026-09-25T17:30:00Z', '2026-10-10T18:00:00Z', null), ('session_dst_spring', 'account_legacy', 'user_legacy', 'clerk_dst_spring', 'active', 1, '2026-03-04T18:00:00Z', '2026-03-04T18:00:00Z', '2027-01-01T00:00:00Z', null), ('session_dst_fall', 'account_legacy', 'user_legacy', 'clerk_dst_fall', 'active', 1, '2026-10-28T17:00:00Z', '2026-10-28T17:00:00Z', '2027-01-01T00:00:00Z', null)",
      );
      await runMigrations({
        databaseUrl: nonUtcDatabaseUrl,
        plan: fullPlan,
        authority: {
          actor: "release-operator",
          authorityVersion: 1,
          expectedHead: preSecurityPlan.head,
        },
      });

      const dstDeadlines = await database.query<{
        session_id: string;
        expires_at: Date;
      }>(
        "select session_id, expires_at from identity_sessions where session_id in ('session_dst_spring', 'session_dst_fall') order by session_id",
      );
      expect(dstDeadlines.rows).toEqual([
        {
          session_id: "session_dst_fall",
          expires_at: new Date("2026-11-04T17:00:00.000Z"),
        },
        {
          session_id: "session_dst_spring",
          expires_at: new Date("2026-03-11T18:00:00.000Z"),
        },
      ]);

      const legacyIdentity = identity({
        userId: "user_legacy",
        sessionId: "clerk_legacy_actor",
        verifiedEmail: "legacy@example.test",
        profileName: "Legacy Person",
        expiresAt: new Date("2026-10-10T18:00:00.000Z"),
      });
      const projections = await service(
        database.databaseUrl,
        "legacy-projection",
      ).listDocketSessions(legacyIdentity);
      expect(projections).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "session_legacy_actor",
            status: "active",
            expiresAt: "2026-10-01T18:00:00.000Z",
          }),
          expect.objectContaining({
            id: "session_legacy_expired",
            status: "expired",
            expiresAt: "2026-09-17T18:00:00.000Z",
          }),
        ]),
      );
    });
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

  it("commits logout with a durable Clerk termination and retries provider failure after restart", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let clock = new Date(now);
        const identityService = service(
          database.databaseUrl,
          "termination",
          () => clock,
        );
        await identityService.createDocketSession({
          identity: identity(),
          idempotencyKey: "create-before-termination",
        });
        const logout = await identityService.revokeAllDocketSessions({
          identity: identity(),
          idempotencyKey: "logout-with-termination",
        });
        expect(logout.session.status).toBe("revoked");

        const firstDelivery = new ClerkSessionTerminationService(
          new PostgresClerkSessionTerminationStore(database.databaseUrl),
          () => clock,
        );
        await expect(
          firstDelivery.deliverNext(() =>
            Promise.reject(new Error("Clerk unavailable")),
          ),
        ).resolves.toMatchObject({ status: "failed" });
        const failed = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_clerk_session_terminations",
        );
        expect(failed.rows).toEqual([
          {
            attempt_count: 1,
            delivered_at: null,
            last_error_code: "DELIVERY_FAILED",
          },
        ]);

        clock = new Date(clock.getTime() + 60_000);
        const restartedDelivery = new ClerkSessionTerminationService(
          new PostgresClerkSessionTerminationStore(database.databaseUrl),
          () => clock,
        );
        const terminated: string[] = [];
        await expect(
          restartedDelivery.deliverNext((clerkSessionId) => {
            terminated.push(clerkSessionId);
            return Promise.resolve();
          }),
        ).resolves.toMatchObject({ status: "delivered" });
        expect(terminated).toEqual([identity().sessionId]);
        const delivered = await database.query<{
          attempt_count: number;
          delivered_at: Date | null;
          last_error_code: string | null;
        }>(
          "select attempt_count, delivered_at, last_error_code from identity_clerk_session_terminations",
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
