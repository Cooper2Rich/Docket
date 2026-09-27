import { afterEach, describe, expect, it } from "vitest";
import {
  CommunicationsService,
  InMemoryCommunicationsStore,
} from "@docket/communications";
import { createDocketClient, type ContractTransport } from "@docket/contracts";
import type { ClerkIdentity } from "@docket/identity-access";
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
const identity: ClerkIdentity = {
  userId: "clerk-user-communications",
  sessionId: "clerk-session-communications",
  verifiedEmail: "communications@example.test",
  profileName: "Communications Account",
  signInMethod: "verified_email_code",
  expiresAt: new Date("2026-09-27T20:00:00.000Z"),
};

function harness() {
  let sequence = 0;
  const service = new CommunicationsService({
    store: new InMemoryCommunicationsStore(),
    authority: {
      resolve: (actor, recipientAccountId) =>
        Promise.resolve({
          allowed:
            actor.accountId === "account-communications" &&
            recipientAccountId === "account-communications",
          authorityVersion: 4,
        }),
    },
    provider: {
      deliver: ({ idempotencyKey }) =>
        Promise.resolve({ providerMessageId: `api:${idempotencyKey}` }),
    },
    now: () => new Date("2026-09-26T20:00:00.000Z"),
    nextId: (kind) => `${kind}_api_${String(++sequence).padStart(3, "0")}`,
  });
  return service;
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

describe("generated Communications API", () => {
  it("serves only the authenticated recipient projection", async () => {
    const service = harness();
    const app = await buildApiApp(environment, {
      authenticateIdentity: () => identity,
      resolveCommunicationsActor: () => ({
        accountId: "account-communications",
      }),
      communicationsService: service,
    });
    apps.push(app);
    const client = clientFor(app);
    const created = await client.createNoticeIntent({
      noticeIntentId: "notice_api_001",
      recipientAccountId: "account-communications",
      subject: "Tournament update",
      body: "Round one is ready.",
      expectedAuthorityVersion: 4,
      expectedVersion: 0,
      idempotencyKey: "notice-api-create-001",
      correlationId: "correlation_api_001",
      causationId: "causation_api_001",
    });

    await service.deliverNotice(created.outbox);
    await expect(
      client.readAccessInbox({
        recipientAccountId: "account-communications",
      }),
    ).resolves.toMatchObject({
      items: [
        {
          noticeIntentId: "notice_api_001",
          recipientAccountId: "account-communications",
          deliveryState: "delivered",
        },
      ],
    });
    await expect(
      client.readAccessInbox({ recipientAccountId: "account-private" }),
    ).rejects.toMatchObject({ code: "RECIPIENT_UNAUTHORIZED" });
  }, 30_000);

  it("maps anonymous and stale authority failures to safe stable errors", async () => {
    const service = harness();
    const anonymous = await buildApiApp(environment, {
      authenticateIdentity: () => null,
      communicationsService: service,
    });
    const authenticated = await buildApiApp(environment, {
      authenticateIdentity: () => identity,
      resolveCommunicationsActor: () => ({
        accountId: "account-communications",
      }),
      communicationsService: service,
    });
    apps.push(anonymous, authenticated);

    await expect(
      clientFor(anonymous).readAccessInbox({
        recipientAccountId: "account-private-secret",
      }),
    ).rejects.toMatchObject({
      code: "RECIPIENT_UNAUTHORIZED",
      message: "The requested recipient is unavailable.",
    });
    await expect(
      clientFor(authenticated).createNoticeIntent({
        noticeIntentId: "notice_api_stale_001",
        recipientAccountId: "account-communications",
        subject: "Stale update",
        body: "This request uses old authority.",
        expectedAuthorityVersion: 3,
        expectedVersion: 0,
        idempotencyKey: "notice-api-stale-001",
        correlationId: "correlation_api_stale_001",
        causationId: "causation_api_stale_001",
      }),
    ).rejects.toMatchObject({
      code: "STALE_VERSION",
      message: "The notice state changed; refresh before retrying.",
    });
  }, 30_000);
});
