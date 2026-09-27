import { connectDatabaseSession } from "@docket/database";
import { withTestDatabase } from "@docket/testkit";
import { describe, expect, it } from "vitest";
import { IdentityService, type ClerkIdentity } from "./identity-service.js";
import { PostgresIdentityStore } from "./postgres-identity-store.js";
import {
  PostgresAccountSecurityAlertPublisher,
  PostgresPrivilegedContextAlertStore,
  PrivilegedContextAlertService,
} from "./privileged-context-alerts.js";
import { PostgresRoleContextStore } from "./postgres-role-context-store.js";
import {
  RoleContextService,
  type AuthorityGrant,
  type RoleContextActor,
} from "./role-context.js";

const now = new Date("2026-09-26T18:00:00.000Z");

function identity(): ClerkIdentity {
  return {
    userId: "clerk-role-context-user",
    sessionId: "clerk-role-context-session",
    verifiedEmail: "role-context@example.test",
    profileName: "Role Context Fixture",
    signInMethod: "verified_email_code",
    expiresAt: new Date("2026-10-01T18:00:00.000Z"),
  };
}

function roleService(databaseUrl: string, processId: string) {
  let sequence = 0;
  return new RoleContextService({
    store: new PostgresRoleContextStore(databaseUrl),
    now: () => now,
    nextId: (kind) => `${kind}-${processId}-${String(++sequence)}`,
  });
}

async function seedGrant(
  databaseUrl: string,
  value: AuthorityGrant,
): Promise<void> {
  const connection = await connectDatabaseSession(databaseUrl);
  try {
    await connection.query(
      "insert into identity_authority_grants (grant_id, account_id, context_kind, scope_id, scope_label, permissions, privileged, status, record_version, created_at, updated_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        value.id,
        value.accountId,
        value.contextKind,
        value.scopeId,
        value.scopeLabel,
        JSON.stringify(value.permissions),
        value.privileged,
        value.status,
        value.version,
        value.createdAt,
        value.updatedAt,
      ],
    );
  } finally {
    await connection.release();
  }
}

describe("PostgreSQL Active Role Context persistence", () => {
  it("persists tab isolation, current grants, equivalent receipts and one-use reverification across restarts", async () => {
    await withTestDatabase(
      { workspaceRoot: process.cwd() },
      async (database) => {
        let identitySequence = 0;
        const identityService = new IdentityService({
          store: new PostgresIdentityStore(database.databaseUrl),
          now: () => now,
          nextId: (kind) => `identity-${kind}-${String(++identitySequence)}`,
        });
        const session = await identityService.createDocketSession({
          identity: identity(),
          idempotencyKey: "create-role-context-session",
        });
        const actor: RoleContextActor = {
          accountId: session.account.id,
          docketSessionId: session.session.id,
          clerkSessionId: identity().sessionId,
          device: session.session.device,
          approximateLocation: session.session.approximateLocation,
        };
        const school: AuthorityGrant = {
          id: "grant-school-postgres",
          accountId: actor.accountId,
          contextKind: "school",
          scopeId: "school-postgres",
          scopeLabel: "PostgreSQL High School",
          permissions: ["manage_roster"],
          privileged: false,
          status: "active",
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        const tournament: AuthorityGrant = {
          ...school,
          id: "grant-tournament-postgres",
          contextKind: "tournament",
          scopeId: "tournament-postgres",
          scopeLabel: "PostgreSQL Invitational",
          permissions: ["manage_tournament"],
        };
        const judge: AuthorityGrant = {
          ...school,
          id: "grant-judge-postgres",
          contextKind: "judge",
          scopeId: "judge-postgres",
          scopeLabel: "Judge assignment",
          permissions: ["read_assignment"],
        };
        await seedGrant(database.databaseUrl, school);
        await seedGrant(database.databaseUrl, tournament);
        await seedGrant(database.databaseUrl, judge);

        const firstService = roleService(database.databaseUrl, "first");
        const entered = await firstService.enterActiveRoleContext({
          actor,
          tabId: "tab-one",
          grantId: school.id,
          switchDecision: "discard",
          idempotencyKey: "enter-school-postgres",
        });
        const retry = await roleService(
          database.databaseUrl,
          "retry",
        ).enterActiveRoleContext({
          actor,
          tabId: "tab-one",
          grantId: school.id,
          switchDecision: "discard",
          idempotencyKey: "enter-school-postgres",
        });
        expect(retry).toEqual(entered);
        await expect(
          roleService(database.databaseUrl, "resolve").resolveAuthority({
            actor,
            tabId: "tab-one",
            permission: "manage_roster",
            scopeId: school.scopeId,
          }),
        ).resolves.toMatchObject({ grantId: school.id });

        const competing = await Promise.allSettled([
          roleService(database.databaseUrl, "switch-a").enterActiveRoleContext({
            actor,
            tabId: "tab-one",
            grantId: tournament.id,
            switchDecision: "save",
            expectedCurrentContextId: entered.context.id,
            expectedCurrentVersion: entered.context.version,
            idempotencyKey: "switch-tournament-postgres",
          }),
          roleService(database.databaseUrl, "switch-b").enterActiveRoleContext({
            actor,
            tabId: "tab-one",
            grantId: judge.id,
            switchDecision: "discard",
            expectedCurrentContextId: entered.context.id,
            expectedCurrentVersion: entered.context.version,
            idempotencyKey: "switch-judge-postgres",
          }),
        ]);
        expect(
          competing.filter(({ status }) => status === "fulfilled"),
        ).toHaveLength(1);
        expect(
          competing.filter(({ status }) => status === "rejected"),
        ).toHaveLength(1);
        expect(
          (
            competing.find(
              ({ status }) => status === "rejected",
            ) as PromiseRejectedResult
          ).reason,
        ).toMatchObject({ code: "CONTEXT_STALE" });

        const evidence = {
          verificationId: "postgres-verification-once",
          clerkSessionId: actor.clerkSessionId,
          signatureValidated: true,
          verifiedAt: now,
        } as const;
        await expect(
          firstService.requireRecentClerkReverification({
            actor,
            commandId: "change-role:postgres",
            evidence,
          }),
        ).resolves.toMatchObject({ verificationId: evidence.verificationId });
        await expect(
          roleService(
            database.databaseUrl,
            "restarted",
          ).requireRecentClerkReverification({
            actor,
            commandId: "change-role:replay",
            evidence,
          }),
        ).rejects.toMatchObject({ code: "REAUTHENTICATION_REQUIRED" });

        const platform: AuthorityGrant = {
          ...school,
          id: "grant-platform-postgres",
          contextKind: "platform_administrator",
          scopeId: "platform",
          scopeLabel: "Docket platform",
          permissions: ["platform_diagnostics"],
          privileged: true,
        };
        await seedGrant(database.databaseUrl, platform);
        await firstService.enterActiveRoleContext({
          actor,
          tabId: "tab-privileged",
          grantId: platform.id,
          switchDecision: "discard",
          idempotencyKey: "enter-platform-postgres",
        });
        const restored = await roleService(
          database.databaseUrl,
          "restore",
        ).restoreMostRecentContext(
          actor,
          "tab-restored",
          "restore-platform-postgres",
        );
        expect(restored?.context.grantId).toBe(platform.id);

        let deliveryNow = now;
        const failedDelivery = new PrivilegedContextAlertService(
          new PostgresPrivilegedContextAlertStore(database.databaseUrl),
          () => deliveryNow,
        );
        await expect(
          failedDelivery.deliverNext(() =>
            Promise.reject(new Error("simulated inbox failure")),
          ),
        ).resolves.toMatchObject({ status: "failed" });
        deliveryNow = new Date(now.getTime() + 60_000);
        const publisher = new PostgresAccountSecurityAlertPublisher(
          database.databaseUrl,
          () => deliveryNow,
        );
        await expect(
          new PrivilegedContextAlertService(
            new PostgresPrivilegedContextAlertStore(database.databaseUrl),
            () => deliveryNow,
          ).deliverNext((alert) => publisher.publish(alert)),
        ).resolves.toMatchObject({ status: "delivered" });

        const connection = await connectDatabaseSession(database.databaseUrl);
        try {
          const rows = await connection.query<{
            active_contexts: string;
            reauthentication_events: string;
            alert_attempts: number;
            alert_error: string | null;
            delivered_alerts: string;
            alert_device: string;
            alert_location: string;
            termination_path: string;
          }>(
            "select (select count(*) from identity_role_contexts where account_id = $1 and status = 'active')::text as active_contexts, (select count(*) from identity_reauthentication_events where account_id = $1)::text as reauthentication_events, outbox.attempt_count as alert_attempts, outbox.last_error_code as alert_error, (select count(*) from identity_account_security_alerts where account_id = $1)::text as delivered_alerts, inbox.device as alert_device, inbox.approximate_location as alert_location, inbox.termination_path from identity_privileged_context_alert_outbox outbox join identity_account_security_alerts inbox using (alert_id) where outbox.account_id = $1",
            [actor.accountId],
          );
          expect(rows.rows[0]).toEqual({
            active_contexts: "3",
            reauthentication_events: "1",
            alert_attempts: 2,
            alert_error: null,
            delivered_alerts: "1",
            alert_device: actor.device,
            alert_location: actor.approximateLocation,
            termination_path: "/account/sessions",
          });
        } finally {
          await connection.release();
        }
      },
    );
  });
});
