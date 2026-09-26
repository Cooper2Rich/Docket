import {
  IdentityError,
  IdentityService,
  PostgresIdentityStore,
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
await identityService.createDocketSession({
  identity: fixtureIdentity("session_fixture_other_001"),
  idempotencyKey: "e2e-preseed-other-session",
});

type E2eMode = "denied" | "delay" | "empty" | "error" | "normal" | "stale";
let mode: E2eMode = "normal";
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
};
const app = await buildApiApp(environment, {
  identityService: controlledIdentityService,
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
