import { describe, expect, it } from "vitest";
import {
  InMemoryRoleContextStore,
  RoleContextError,
  RoleContextService,
  type AuthorityGrant,
  type RoleContextActor,
} from "./role-context.js";

const now = new Date("2026-09-26T18:00:00.000Z");
const actor: RoleContextActor = {
  accountId: "account-1",
  docketSessionId: "session-1",
  clerkSessionId: "clerk-session-1",
  device: "Firefox on Windows",
  approximateLocation: "Austin, US",
};

function grant(changes: Partial<AuthorityGrant> = {}): AuthorityGrant {
  return {
    id: "grant-school",
    accountId: actor.accountId,
    contextKind: "school",
    scopeId: "school-1",
    scopeLabel: "Central High School",
    permissions: ["read_roster", "manage_roster"],
    privileged: false,
    status: "active",
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...changes,
  };
}

function harness() {
  const store = new InMemoryRoleContextStore();
  let sequence = 0;
  const service = new RoleContextService({
    store,
    now: () => now,
    nextId: (kind) => `${kind}-${String(++sequence)}`,
  });
  return { store, service };
}

describe("Active Role Context authority", () => {
  it("keeps one visible selection per tab and restores a remembered privileged context", async () => {
    const { store, service } = harness();
    const school = grant();
    const platform = grant({
      id: "grant-platform",
      contextKind: "platform_administrator",
      scopeId: "platform",
      scopeLabel: "Docket platform",
      permissions: ["platform_diagnostics"],
      privileged: true,
    });
    store.seedGrant(school);
    store.seedGrant(platform);

    const tabOne = await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "enter-school",
    });
    const tabTwo = await service.enterActiveRoleContext({
      actor,
      tabId: "tab-two",
      grantId: platform.id,
      switchDecision: "discard",
      idempotencyKey: "enter-platform",
    });

    expect(tabOne.context.scopeId).toBe("school-1");
    expect(tabTwo.context.scopeId).toBe("platform");
    expect(tabTwo.context.privileged).toBe(true);
    expect(
      [...store.snapshot().contexts.values()].filter(
        (context) => context.status === "active",
      ),
    ).toHaveLength(2);

    const restored = await service.restoreMostRecentContext(
      { ...actor, docketSessionId: "session-2" },
      "new-tab",
      "restore-platform",
    );
    expect(restored?.context.grantId).toBe(platform.id);
    expect(restored?.events[0]?.retentionClass).toBe("restricted_seven_year");
    expect(store.snapshot().privilegedContextRestoredAlerts).toEqual([
      expect.objectContaining({
        accountId: actor.accountId,
        contextId: restored?.context.id,
        contextKind: "platform_administrator",
        device: actor.device,
        approximateLocation: actor.approximateLocation,
        restoredAt: now,
        terminationPath: "/account/sessions",
      }),
    ]);
  });

  it("returns an invalid remembered choice to selection without borrowing another grant", async () => {
    const { store, service } = harness();
    const school = grant();
    const revoked = grant({
      id: "grant-revoked",
      contextKind: "tournament",
      scopeId: "tournament-1",
      scopeLabel: "Invitational",
      permissions: ["read_tournament"],
      status: "revoked",
    });
    store.seedGrant(school);
    store.seedGrant(revoked);
    store.remember(actor.accountId, revoked.id);

    await expect(
      service.restoreMostRecentContext(actor, "tab-one", "restore-revoked"),
    ).resolves.toBeUndefined();
    expect(store.snapshot().remembered.get(actor.accountId)).toBeUndefined();
    expect(store.snapshot().contexts.size).toBe(0);
  });

  it("prompts for an authorized deep-link switch without resolving private data and denies foreign grants", async () => {
    const { store, service } = harness();
    const school = grant();
    const tournament = grant({
      id: "grant-tournament",
      contextKind: "tournament",
      scopeId: "tournament-1",
      scopeLabel: "Invitational",
      permissions: ["read_tournament"],
    });
    const foreign = grant({
      id: "grant-foreign",
      accountId: "account-2",
      scopeId: "secret-tournament",
      scopeLabel: "Private tournament",
    });
    store.seedGrant(school);
    store.seedGrant(tournament);
    store.seedGrant(foreign);
    await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "enter-school",
    });

    await expect(
      service.inspectDeepLink(actor, "tab-one", tournament.id),
    ).resolves.toBe("switch_required");
    await expect(
      service.inspectDeepLink(actor, "tab-one", foreign.id),
    ).resolves.toBe("denied");
  });

  it("blocks cancelled unsaved work and atomically exits, clears and closes on a confirmed switch", async () => {
    const { store, service } = harness();
    const school = grant();
    const tournament = grant({
      id: "grant-tournament",
      contextKind: "tournament",
      scopeId: "tournament-1",
      scopeLabel: "Invitational",
      permissions: ["read_tournament"],
    });
    store.seedGrant(school);
    store.seedGrant(tournament);
    const entered = await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "enter-school",
    });

    await expect(
      service.enterActiveRoleContext({
        actor,
        tabId: "tab-one",
        grantId: tournament.id,
        switchDecision: "cancel",
        expectedCurrentContextId: entered.context.id,
        expectedCurrentVersion: entered.context.version,
        idempotencyKey: "cancel-switch",
      }),
    ).rejects.toMatchObject({ code: "ROLE_SWITCH_BLOCKED" });
    expect(store.snapshot().contexts.get(entered.context.id)?.status).toBe(
      "active",
    );

    const switched = await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: tournament.id,
      switchDecision: "save",
      expectedCurrentContextId: entered.context.id,
      expectedCurrentVersion: entered.context.version,
      idempotencyKey: "confirmed-switch",
    });
    expect(switched.cacheInvalidation).toEqual({
      previousContextId: entered.context.id,
      destroyProtectedCache: true,
      closeOpenViews: true,
    });
    expect(switched.events.map(({ name }) => name)).toEqual([
      "RoleContextExited",
      "RoleContextEntered",
    ]);

    const left = await service.leaveActiveRoleContext({
      actor,
      tabId: "tab-one",
      expectedCurrentContextId: switched.context.id,
      expectedCurrentVersion: switched.context.version,
    });
    expect(left.cacheInvalidation).toEqual({
      previousContextId: switched.context.id,
      destroyProtectedCache: true,
      closeOpenViews: true,
    });
    expect(left.events.map(({ name }) => name)).toEqual(["RoleContextExited"]);
    await expect(
      service.leaveActiveRoleContext({
        actor,
        tabId: "tab-one",
        expectedCurrentContextId: switched.context.id,
        expectedCurrentVersion: switched.context.version,
      }),
    ).resolves.toMatchObject({ events: [] });
  });

  it("returns only current Account options and the tab-local active projection", async () => {
    const { store, service } = harness();
    const school = grant();
    const revoked = grant({ id: "grant-revoked", status: "revoked" });
    const foreign = grant({ id: "grant-foreign", accountId: "account-2" });
    store.seedGrant(school);
    store.seedGrant(revoked);
    store.seedGrant(foreign);
    const entered = await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "enter-selector",
    });

    await expect(
      service.getRoleContextState(actor, "tab-one"),
    ).resolves.toEqual({
      contexts: [
        {
          grantId: school.id,
          contextKind: school.contextKind,
          scopeId: school.scopeId,
          scopeLabel: school.scopeLabel,
          privileged: false,
          authorityVersion: 1,
        },
      ],
      current: entered.context,
    });
    await expect(
      service.getRoleContextState(actor, "tab-two"),
    ).resolves.toEqual({
      contexts: [expect.objectContaining({ grantId: school.id })],
    });
  });

  it("resolves current permission and scope server-side and denies stale, revoked and nearby authority", async () => {
    const { store, service } = harness();
    const school = grant();
    store.seedGrant(school);
    await service.enterActiveRoleContext({
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "enter-school",
    });

    await expect(
      service.resolveAuthority({
        actor,
        tabId: "tab-one",
        permission: "manage_roster",
        scopeId: school.scopeId,
      }),
    ).resolves.toMatchObject({ grantId: school.id });
    await expect(
      service.resolveAuthority({
        actor,
        tabId: "tab-one",
        permission: "manage_roster",
        scopeId: "school-2",
      }),
    ).rejects.toMatchObject({ code: "AUTHORITY_DENIED" });

    store.replaceGrant({ ...school, version: 2, updatedAt: now });
    await expect(
      service.resolveAuthority({
        actor,
        tabId: "tab-one",
        permission: "manage_roster",
        scopeId: school.scopeId,
      }),
    ).rejects.toMatchObject({ code: "CONTEXT_STALE" });
    store.replaceGrant({ ...school, version: 2, status: "revoked" });
    await expect(
      service.resolveAuthority({
        actor,
        tabId: "tab-one",
        permission: "manage_roster",
        scopeId: school.scopeId,
      }),
    ).rejects.toMatchObject({ code: "CONTEXT_STALE" });
  });

  it("accepts signed same-session Clerk Reverification for ten minutes exactly once", async () => {
    const { service } = harness();
    const evidence = {
      verificationId: "verification-1",
      clerkSessionId: actor.clerkSessionId,
      signatureValidated: true,
      verifiedAt: new Date(now.getTime() - 10 * 60 * 1_000),
    } as const;

    const accepted = await service.requireRecentClerkReverification({
      actor,
      commandId: "change-role:grant-school",
      evidence,
    });
    expect(accepted.verificationId).toBe(evidence.verificationId);
    await expect(
      service.requireRecentClerkReverification({
        actor,
        commandId: "change-role:another-grant",
        evidence,
      }),
    ).rejects.toMatchObject({ code: "REAUTHENTICATION_REQUIRED" });
    await expect(
      service.requireRecentClerkReverification({
        actor,
        commandId: "change-role:stale",
        evidence: {
          ...evidence,
          verificationId: "verification-stale",
          verifiedAt: new Date(now.getTime() - 10 * 60 * 1_000 - 1),
        },
      }),
    ).rejects.toMatchObject({ code: "REAUTHENTICATION_REQUIRED" });
  });

  it("returns an equivalent retry, rejects conflicting reuse and rolls back failed switch writes", async () => {
    const { store, service } = harness();
    const school = grant();
    const tournament = grant({
      id: "grant-tournament",
      contextKind: "tournament",
      scopeId: "tournament-1",
      scopeLabel: "Invitational",
      permissions: ["read_tournament"],
    });
    store.seedGrant(school);
    store.seedGrant(tournament);
    const input = {
      actor,
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard" as const,
      idempotencyKey: "enter-once",
    };
    const first = await service.enterActiveRoleContext(input);
    await expect(service.enterActiveRoleContext(input)).resolves.toEqual(first);
    await expect(
      service.enterActiveRoleContext({ ...input, grantId: tournament.id }),
    ).rejects.toMatchObject({ code: "ROLE_SWITCH_BLOCKED" });

    const before = store.snapshot();
    await expect(
      service.enterActiveRoleContext({
        actor,
        tabId: "tab-one",
        grantId: tournament.id,
        switchDecision: "save",
        expectedCurrentContextId: first.context.id,
        expectedCurrentVersion: 99,
        idempotencyKey: "stale-switch",
      }),
    ).rejects.toBeInstanceOf(RoleContextError);
    const after = store.snapshot();
    expect([...after.contexts.entries()]).toEqual([
      ...before.contexts.entries(),
    ]);
    expect(after.events).toEqual(before.events);
  });
});
