import { afterEach, describe, expect, it } from "vitest";
import { createDocketClient, type ContractTransport } from "@docket/contracts";
import {
  InMemoryRoleContextStore,
  RoleContextService,
  type AuthorityGrant,
  type ClerkIdentity,
  type RoleContextActor,
} from "@docket/identity-access";
import { buildApiApp } from "./server.js";

const environment = {
  DOCKET_ENV: "test",
  DOCKET_DATABASE_URL: "postgresql://service:redacted@db.internal:5432/docket",
  DOCKET_OBJECT_STORAGE_ENDPOINT: "https://objects.example.test",
  DOCKET_IDENTITY_ADAPTER: "fixed",
  DOCKET_OBJECT_STORAGE_ADAPTER: "minio",
  DOCKET_API_HOST: "127.0.0.1",
  DOCKET_API_PORT: "3001",
} as const;

const now = new Date("2026-09-26T20:00:00.000Z");
const identity: ClerkIdentity = {
  userId: "clerk-user-role-context",
  sessionId: "clerk-session-role-context",
  verifiedEmail: "roles@example.test",
  profileName: "Role Context Account",
  signInMethod: "verified_email_code",
  expiresAt: new Date("2026-09-27T20:00:00.000Z"),
};
const actor: RoleContextActor = {
  accountId: "account-role-context",
  docketSessionId: "docket-session-role-context",
  clerkSessionId: identity.sessionId,
  device: "Firefox on Windows",
  approximateLocation: "Austin, US",
};

function grant(changes: Partial<AuthorityGrant> = {}): AuthorityGrant {
  return {
    id: "grant-school",
    accountId: actor.accountId,
    contextKind: "school",
    scopeId: "school-central",
    scopeLabel: "Central High School",
    permissions: ["manage_roster"],
    privileged: false,
    status: "active",
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...changes,
  };
}

function roleContextHarness() {
  const store = new InMemoryRoleContextStore();
  let sequence = 0;
  const service = new RoleContextService({
    store,
    now: () => now,
    nextId: (kind) => `${kind}-api-${String(++sequence)}`,
  });
  return { store, service };
}

function clientFor(app: Awaited<ReturnType<typeof buildApiApp>>) {
  const transport: ContractTransport = async (request) => {
    const response = await app.inject({
      method: request.method as "GET" | "POST",
      url: request.path,
      ...(request.body === undefined
        ? {}
        : { payload: request.body as Record<string, unknown> }),
    });
    return { status: response.statusCode, body: response.json() };
  };
  return createDocketClient(transport);
}

const apps: Awaited<ReturnType<typeof buildApiApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("generated Active Role Context API", () => {
  it("lists, inspects, enters, switches and leaves one context for the authenticated tab", async () => {
    const { store, service } = roleContextHarness();
    const school = grant();
    const tournament = grant({
      id: "grant-tournament",
      contextKind: "tournament",
      scopeId: "tournament-invitational",
      scopeLabel: "Docket Invitational",
      permissions: ["read_tournament"],
    });
    const foreign = grant({
      id: "grant-foreign",
      accountId: "account-foreign",
      scopeId: "private-scope",
      scopeLabel: "Private scope",
    });
    store.seedGrant(school);
    store.seedGrant(tournament);
    store.seedGrant(foreign);
    const app = await buildApiApp(environment, {
      authenticateIdentity: () => identity,
      resolveRoleContextActor: () => actor,
      roleContextService: service,
    });
    apps.push(app);
    const client = clientFor(app);

    await expect(
      client.listRoleContexts({ tabId: "tab-one" }),
    ).resolves.toEqual({
      contexts: [
        expect.objectContaining({ grantId: school.id }),
        expect.objectContaining({ grantId: tournament.id }),
      ],
    });
    const entered = await client.enterActiveRoleContext({
      tabId: "tab-one",
      grantId: school.id,
      switchDecision: "discard",
      idempotencyKey: "api-enter-school",
    });
    await expect(
      client.inspectRoleContextDeepLink({
        tabId: "tab-one",
        requiredGrantId: tournament.id,
      }),
    ).resolves.toEqual({ decision: "switch_required" });
    await expect(
      client.inspectRoleContextDeepLink({
        tabId: "tab-one",
        requiredGrantId: foreign.id,
      }),
    ).resolves.toEqual({ decision: "denied" });

    const switched = await client.enterActiveRoleContext({
      tabId: "tab-one",
      grantId: tournament.id,
      switchDecision: "save",
      expectedCurrentContextId: entered.context.id,
      expectedCurrentVersion: entered.context.version,
      idempotencyKey: "api-enter-tournament",
    });
    expect(switched.cacheInvalidation).toEqual({
      previousContextId: entered.context.id,
      destroyProtectedCache: true,
      closeOpenViews: true,
    });
    await expect(
      client.listRoleContexts({ tabId: "tab-one" }),
    ).resolves.toMatchObject({ current: switched.context });
    await expect(
      client.leaveActiveRoleContext({
        tabId: "tab-one",
        expectedCurrentContextId: switched.context.id,
        expectedCurrentVersion: switched.context.version,
      }),
    ).resolves.toEqual({
      cacheInvalidation: {
        previousContextId: switched.context.id,
        destroyProtectedCache: true,
        closeOpenViews: true,
      },
    });
    await expect(
      client.restoreMostRecentRoleContext({
        tabId: "tab-two",
        idempotencyKey: "api-restore-tournament",
      }),
    ).resolves.toMatchObject({
      current: {
        grantId: tournament.id,
        scopeId: tournament.scopeId,
      },
    });
  }, 30_000);

  it("returns stable denial for anonymous, revoked and cancelled context entry", async () => {
    const { store, service } = roleContextHarness();
    const revoked = grant({ status: "revoked" });
    store.seedGrant(revoked);
    const anonymous = await buildApiApp(environment, {
      authenticateIdentity: () => null,
      roleContextService: service,
    });
    const authenticated = await buildApiApp(environment, {
      authenticateIdentity: () => identity,
      resolveRoleContextActor: () => actor,
      roleContextService: service,
    });
    apps.push(anonymous, authenticated);

    await expect(
      clientFor(anonymous).listRoleContexts({ tabId: "tab-one" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
    await expect(
      clientFor(authenticated).enterActiveRoleContext({
        tabId: "tab-one",
        grantId: revoked.id,
        switchDecision: "discard",
        idempotencyKey: "api-revoked",
      }),
    ).rejects.toMatchObject({ code: "CONTEXT_STALE" });
    await expect(
      clientFor(authenticated).enterActiveRoleContext({
        tabId: "tab-one",
        grantId: revoked.id,
        switchDecision: "cancel",
        idempotencyKey: "api-cancelled",
      }),
    ).rejects.toMatchObject({ code: "ROLE_SWITCH_BLOCKED" });
  }, 30_000);
});
