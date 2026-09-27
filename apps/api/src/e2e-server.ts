import {
  CommunicationsError,
  CommunicationsService,
  PostgresCommunicationsStore,
} from "@docket/communications";
import {
  IdentityError,
  IdentityService,
  PostgresIdentityStore,
  PostgresRoleContextStore,
  RoleContextError,
  RoleContextService,
  type ClerkIdentity,
} from "@docket/identity-access";
import { TestDatabase } from "@docket/testkit";
import { assertE2eServerEnvironment } from "./e2e-server-policy.js";
import { buildApiApp } from "./server.js";

assertE2eServerEnvironment(process.env.DOCKET_ENV);

const database = await TestDatabase.start({ workspaceRoot: process.cwd() });
const environment = {
  ...process.env,
  DOCKET_ENV: "test",
  DOCKET_DATABASE_URL: database.databaseUrl,
  DOCKET_IDENTITY_ADAPTER: "fixed",
  DOCKET_CLERK_ALLOWED_ORIGINS: "http://127.0.0.1:4173",
};
let sequence = 0;
const identityService = new IdentityService({
  store: new PostgresIdentityStore(database.databaseUrl),
  now: () => new Date(),
  nextId: (kind) => `${kind}_e2e_${String(++sequence).padStart(3, "0")}`,
});
const fixtureIdentity = (sessionId: string): ClerkIdentity => ({
  userId: "user_fixture_local_001",
  sessionId,
  verifiedEmail: "local-001@identity.example.test",
  profileName: "Local Docket Account",
  signInMethod: "verified_email_code",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
});
const localSession = await identityService.createDocketSession({
  identity: fixtureIdentity("session_fixture_local_001"),
  idempotencyKey: "e2e-preseed-local-session",
});
await identityService.createDocketSession({
  identity: fixtureIdentity("session_fixture_other_001"),
  idempotencyKey: "e2e-preseed-other-session",
});
const communicationsService = new CommunicationsService({
  store: new PostgresCommunicationsStore(database.databaseUrl),
  authority: {
    resolve: (_actor, recipientAccountId) =>
      Promise.resolve({
        allowed: recipientAccountId === localSession.account.id,
        authorityVersion: localSession.account.version,
      }),
  },
  provider: {
    deliver: ({ idempotencyKey }) =>
      Promise.resolve({ providerMessageId: `e2e:${idempotencyKey}` }),
  },
  now: () => new Date(),
  nextId: (kind) => `${kind}_e2e_${String(++sequence).padStart(3, "0")}`,
});
const seededNotice = await communicationsService.createNoticeIntent(
  { accountId: localSession.account.id },
  {
    noticeIntentId: "notice_e2e_welcome_001",
    recipientAccountId: localSession.account.id,
    subject: "Tournament operations update",
    body: "Your Docket notice is available in this recipient-scoped inbox.",
    expectedAuthorityVersion: localSession.account.version,
    expectedVersion: 0,
    idempotencyKey: "e2e-welcome-notice",
    correlationId: "correlation_e2e_welcome_001",
    causationId: "causation_e2e_welcome_001",
  },
);
await communicationsService.deliverNotice(seededNotice.outbox);
const grantTime = new Date("2026-09-26T12:00:00.000Z");
await database.query(
  "insert into identity_authority_grants (grant_id, account_id, context_kind, scope_id, scope_label, permissions, privileged, status, record_version, created_at, updated_at) values ($1, $2, 'school', $3, $4, $5::jsonb, false, 'active', 1, $6, $6), ($7, $2, 'platform_administrator', $8, $9, $10::jsonb, true, 'active', 1, $6, $6)",
  [
    "grant_e2e_school_001",
    localSession.account.id,
    "school_e2e_001",
    "Central High School",
    JSON.stringify(["school:manage"]),
    grantTime,
    "grant_e2e_platform_001",
    "docket_platform",
    "Docket platform",
    JSON.stringify(["platform:support"]),
  ],
);

type E2eMode = "denied" | "delay" | "empty" | "error" | "normal" | "stale";
let mode: E2eMode = "normal";
const roleContextService = new RoleContextService({
  store: new PostgresRoleContextStore(database.databaseUrl),
  now: () => new Date(),
  nextId: (kind) => `${kind}_e2e_${String(++sequence).padStart(3, "0")}`,
});
const controlledIdentityService = {
  createDocketSession: (
    input: Parameters<IdentityService["createDocketSession"]>[0],
  ) => {
    if (mode === "denied") {
      return Promise.reject(
        new IdentityError("SESSION_EXPIRED", "simulated denied actor"),
      );
    }
    return identityService.createDocketSession(input);
  },
  listDocketSessions: async (
    identity: Parameters<IdentityService["listDocketSessions"]>[0],
  ) => {
    if (mode === "delay") {
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
    if (mode === "empty") return [];
    if (mode === "error") throw new Error("simulated service failure");
    if (mode === "stale") {
      throw new IdentityError("AUTHORITY_STALE", "simulated stale authority");
    }
    return identityService.listDocketSessions(identity);
  },
  resumeDocketSession: (
    input: Parameters<IdentityService["resumeDocketSession"]>[0],
  ) => identityService.resumeDocketSession(input),
  revokeDocketSession: (
    input: Parameters<IdentityService["revokeDocketSession"]>[0],
  ) => identityService.revokeDocketSession(input),
  revokeAllDocketSessions: (
    input: Parameters<IdentityService["revokeAllDocketSessions"]>[0],
  ) => identityService.revokeAllDocketSessions(input),
  listAccountSecurityHistory: (
    input: Parameters<IdentityService["listAccountSecurityHistory"]>[0],
  ) => identityService.listAccountSecurityHistory(input),
  getAccountProfile: (
    input: Parameters<IdentityService["getAccountProfile"]>[0],
  ) => identityService.getAccountProfile(input),
  changeDisplayName: (
    input: Parameters<IdentityService["changeDisplayName"]>[0],
  ) => identityService.changeDisplayName(input),
};
const controlledRoleContextService = {
  getRoleContextState: async (
    ...args: Parameters<RoleContextService["getRoleContextState"]>
  ) => {
    if (mode === "delay") {
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
    if (mode === "empty") return { contexts: [] };
    if (mode === "error") throw new Error("simulated role-context failure");
    if (mode === "stale") {
      throw new RoleContextError("CONTEXT_STALE", "simulated stale authority");
    }
    if (mode === "denied") {
      throw new RoleContextError("AUTHORITY_DENIED", "simulated denied actor");
    }
    return roleContextService.getRoleContextState(...args);
  },
  inspectDeepLink: (
    ...args: Parameters<RoleContextService["inspectDeepLink"]>
  ) => roleContextService.inspectDeepLink(...args),
  enterActiveRoleContext: (
    ...args: Parameters<RoleContextService["enterActiveRoleContext"]>
  ) => roleContextService.enterActiveRoleContext(...args),
  restoreMostRecentContext: (
    ...args: Parameters<RoleContextService["restoreMostRecentContext"]>
  ) => roleContextService.restoreMostRecentContext(...args),
  leaveActiveRoleContext: (
    ...args: Parameters<RoleContextService["leaveActiveRoleContext"]>
  ) => roleContextService.leaveActiveRoleContext(...args),
};
const controlledCommunicationsService = {
  createNoticeIntent: (
    ...args: Parameters<CommunicationsService["createNoticeIntent"]>
  ) => communicationsService.createNoticeIntent(...args),
  readAccessInbox: async (
    ...args: Parameters<CommunicationsService["readAccessInbox"]>
  ) => {
    if (mode === "delay") {
      await new Promise((resolve) => setTimeout(resolve, 750));
    }
    if (mode === "empty") return { items: [] };
    if (mode === "error") throw new Error("simulated inbox failure");
    if (mode === "stale") {
      throw new CommunicationsError("STALE_VERSION", "simulated stale inbox");
    }
    if (mode === "denied") {
      throw new CommunicationsError(
        "RECIPIENT_UNAUTHORIZED",
        "simulated denied recipient",
      );
    }
    return communicationsService.readAccessInbox(...args);
  },
};
const app = await buildApiApp(environment, {
  identityService: controlledIdentityService,
  roleContextService: controlledRoleContextService,
  resolveRoleContextActor: (identity) =>
    identityService.resolveRoleContextActor(identity),
  communicationsService: controlledCommunicationsService,
  resolveCommunicationsActor: () => ({ accountId: localSession.account.id }),
});
app.post<{ Body: { mode?: string } }>("/__e2e/mode", (request, reply) => {
  const accepted = [
    "denied",
    "delay",
    "empty",
    "error",
    "normal",
    "stale",
  ].find((candidate): candidate is E2eMode => candidate === request.body.mode);
  if (!accepted) return reply.code(400).send({ ok: false });
  mode = accepted;
  return reply.send({ ok: true, mode });
});

await app.listen({ host: "127.0.0.1", port: 3001 });

let stopping = false;
async function stop(): Promise<void> {
  if (stopping) return;
  stopping = true;
  await app.close();
  await database.stop();
}
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void stop().finally(() => process.exit(0));
  });
}
