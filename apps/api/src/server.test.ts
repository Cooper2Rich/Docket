import { generateKeyPairSync, sign } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ContractClientError,
  createDocketClient,
  type ContractTransport,
} from "@docket/contracts";
import {
  IdentityError,
  IdentityService,
  IdentityWebhookHintService,
  InMemoryIdentityStore,
  InMemoryIdentityWebhookHintStore,
  type ClerkIdentity,
} from "@docket/identity-access";
import { buildApiApp } from "./server.js";

const productionApi = {
  DOCKET_ENV: "production",
  DOCKET_DATABASE_URL: "postgresql://service:redacted@db.internal:5432/docket",
  DOCKET_OBJECT_STORAGE_ENDPOINT: "https://objects.example.test",
  DOCKET_IDENTITY_ADAPTER: "clerk",
  DOCKET_OBJECT_STORAGE_ADAPTER: "s3",
  DOCKET_API_HOST: "0.0.0.0",
  DOCKET_API_PORT: "3001",
  CLERK_PUBLISHABLE_KEY: "pk_live_ZG9ja2V0LmV4YW1wbGUuY29tJA",
  CLERK_SECRET_KEY: "sk_live_synthetic_test_value",
  DOCKET_CLERK_ISSUER: "https://docket.example.com",
  DOCKET_CLERK_AUDIENCE: "docket-api",
  DOCKET_CLERK_AUTHORIZED_PARTIES: "https://docket.example.com",
  DOCKET_CLERK_ALLOWED_ORIGINS: "https://docket.example.com",
} as const;

const clerkSigningKeys = generateKeyPairSync("rsa", {
  modulusLength: 2_048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
const untrustedSigningKeys = generateKeyPairSync("rsa", {
  modulusLength: 2_048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

type SessionTokenClaims = Readonly<{
  aud: string;
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  nbf: number;
  sid: string;
  sub: string;
}>;

function sessionTokenClaims(now: Date): SessionTokenClaims {
  const nowSeconds = Math.floor(now.getTime() / 1_000);
  return {
    aud: productionApi.DOCKET_CLERK_AUDIENCE,
    azp: productionApi.DOCKET_CLERK_AUTHORIZED_PARTIES,
    exp: nowSeconds + 5 * 60,
    iat: nowSeconds,
    iss: productionApi.DOCKET_CLERK_ISSUER,
    nbf: nowSeconds - 1,
    sid: "session_clerk_middleware_001",
    sub: "user_clerk_middleware_001",
  };
}

function signSessionToken(
  claims: SessionTokenClaims,
  privateKey = clerkSigningKeys.privateKey,
): string {
  const encodedHeader = Buffer.from(
    JSON.stringify({ alg: "RS256", kid: "docket-test-key", typ: "JWT" }),
  ).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(claims)).toString(
    "base64url",
  );
  const input = `${encodedHeader}.${encodedPayload}`;
  const signature = sign("RSA-SHA256", Buffer.from(input), privateKey).toString(
    "base64url",
  );
  return `${input}.${signature}`;
}

function clerkMiddlewareResources(now: Date) {
  const state = {
    sessionStatus: "active",
    sessionExpiresAt: now.getTime() + 7 * 24 * 60 * 60 * 1_000,
  };
  return {
    state,
    sdk: {
      getUser: () =>
        Promise.resolve({
          banned: false,
          locked: false,
          primaryEmailAddressId: "email_middleware_001",
          emailAddresses: [
            {
              id: "email_middleware_001",
              emailAddress: "middleware@example.test",
              verification: { status: "verified" },
            },
          ],
          externalAccounts: [{ provider: "oauth_google" }],
          firstName: "Middleware",
          lastName: "Account",
          username: null,
        }),
      getSession: () =>
        Promise.resolve({
          id: "session_clerk_middleware_001",
          userId: "user_clerk_middleware_001",
          status: state.sessionStatus,
          expireAt: state.sessionExpiresAt,
        }),
    },
  };
}

function signedMiddlewareEnvironment() {
  return { ...productionApi, CLERK_JWT_KEY: clerkSigningKeys.publicKey };
}

const apps: Awaited<ReturnType<typeof buildApiApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("request-scoped adapter guards", () => {
  it("rejects fixed identity requested through a header or query parameter", async () => {
    const app = await buildApiApp(productionApi);
    apps.push(app);

    const headerAttempt = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "x-docket-identity-adapter": "fixed" },
    });
    expect(headerAttempt.statusCode).toBe(400);
    expect(headerAttempt.json()).toMatchObject({
      code: "ADAPTER_FORBIDDEN_IN_ENVIRONMENT",
    });

    const queryAttempt = await app.inject({
      method: "GET",
      url: "/health?identity_adapter=fixed",
    });
    expect(queryAttempt.statusCode).toBe(400);
    expect(queryAttempt.body).not.toContain("fixed");
  }, 30_000);
});

function clientFor(
  app: Awaited<ReturnType<typeof buildApiApp>>,
  headers: Readonly<Record<string, string>> = {},
): ReturnType<typeof createDocketClient> {
  const transport: ContractTransport = async ({ method, path, body }) => {
    const response = await app.inject({
      method: method as "GET" | "POST",
      url: path,
      headers,
      ...(body === undefined
        ? {}
        : { payload: body as Record<string, unknown> }),
    });
    return { status: response.statusCode, body: response.json() };
  };
  return createDocketClient(transport);
}

function clerkRequestSdkFixture() {
  const state = {
    auth: {
      userId: "user_clerk_boundary_001" as string | null,
      sessionId: "session_clerk_boundary_001" as string | null,
      sessionClaims: {
        aud: productionApi.DOCKET_CLERK_AUDIENCE as string | readonly string[],
        azp: productionApi.DOCKET_CLERK_AUTHORIZED_PARTIES as string,
        exp: Math.floor((Date.now() + 5 * 60 * 1_000) / 1_000),
        iss: productionApi.DOCKET_CLERK_ISSUER as string,
        nbf: Math.floor((Date.now() - 60 * 1_000) / 1_000),
      },
    },
    providerError: undefined as Error | undefined,
    userError: undefined as Error | undefined,
    sessionError: undefined as Error | undefined,
    userBanned: false,
    userLocked: false,
    sessionStatus: "active",
    sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1_000,
  };
  return {
    state,
    sdk: {
      getAuth: () => state.auth,
      getUser: () => {
        const error = state.userError ?? state.providerError;
        if (error) return Promise.reject(error);
        return Promise.resolve({
          banned: state.userBanned,
          locked: state.userLocked,
          primaryEmailAddressId: "email_boundary_001",
          emailAddresses: [
            {
              id: "email_boundary_001",
              emailAddress: "boundary@example.test",
              verification: { status: "verified" },
            },
          ],
          externalAccounts: [{ provider: "oauth_google" }],
          firstName: "Boundary",
          lastName: "Account",
          username: null,
        });
      },
      getSession: () => {
        const error = state.sessionError ?? state.providerError;
        if (error) return Promise.reject(error);
        return Promise.resolve({
          id: "session_clerk_boundary_001",
          userId: "user_clerk_boundary_001",
          status: state.sessionStatus,
          expireAt: state.sessionExpiresAt,
        });
      },
    },
  };
}

function sessionFixture() {
  const store = new InMemoryIdentityStore();
  let sequence = 0;
  const service = new IdentityService({
    store,
    now: () => new Date("2026-09-25T16:00:00.000Z"),
    nextId: (kind) => `${kind}_api_${String(++sequence).padStart(3, "0")}`,
  });
  const identity: ClerkIdentity = {
    userId: "user_api_001",
    sessionId: "clerk_session_api_001",
    verifiedEmail: "account-holder@identity.example.test",
    profileName: "API Account Holder",
    signInMethod: "google",
    expiresAt: new Date("2026-10-02T16:00:00.000Z"),
  };
  return { service, identity };
}

describe("generated identity-session client and runtime boundary", () => {
  it("rejects signed-token boundary failures through the actual Clerk middleware", async () => {
    const now = new Date();
    const resources = clerkMiddlewareResources(now);
    const fixture = sessionFixture();
    const listDocketSessions = vi.spyOn(fixture.service, "listDocketSessions");
    const app = await buildApiApp(signedMiddlewareEnvironment(), {
      clerkRequestSdk: resources.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const claims = sessionTokenClaims(now);
    const validToken = signSessionToken(claims);
    const trustedHeaders = {
      authorization: `Bearer ${validToken}`,
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    };
    const client = clientFor(app, trustedHeaders);
    await client.createDocketSession({
      idempotencyKey: "command_real_middleware_create_001",
    });
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).resolves.toMatchObject({ sessions: [expect.any(Object)] });

    const rejectedCases = [
      {
        label: "tampered signature",
        token: signSessionToken(claims, untrustedSigningKeys.privateKey),
      },
      {
        label: "issuer",
        token: signSessionToken({
          ...claims,
          iss: "https://attacker.example.test",
        }),
      },
      {
        label: "audience",
        token: signSessionToken({ ...claims, aud: "another-api" }),
      },
      {
        label: "authorized party",
        token: signSessionToken({
          ...claims,
          azp: "https://attacker.example.test",
        }),
      },
      {
        label: "expired token",
        token: signSessionToken({ ...claims, exp: claims.iat - 10 * 60 }),
      },
      {
        label: "future token",
        token: signSessionToken({ ...claims, nbf: claims.iat + 10 * 60 }),
      },
      {
        label: "inactive session",
        token: validToken,
        sessionStatus: "revoked",
      },
      {
        label: "browser origin",
        token: validToken,
        origin: "https://attacker.example.test",
      },
    ] as const;

    for (const rejected of rejectedCases) {
      listDocketSessions.mockClear();
      resources.state.sessionStatus =
        "sessionStatus" in rejected ? rejected.sessionStatus : "active";
      const response = await app.inject({
        method: "GET",
        url: "/v1/docket-sessions?audience=self",
        headers: {
          authorization: `Bearer ${rejected.token}`,
          origin:
            "origin" in rejected
              ? rejected.origin
              : productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
        },
      });
      expect(response.statusCode, rejected.label).toBe(401);
      expect(listDocketSessions, rejected.label).not.toHaveBeenCalled();
    }
  });

  it("advances beyond the first signed token expiry and accepts a refreshed token for the same Docket Session", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const firstIssuedAt = new Date("2026-09-25T16:00:00.000Z");
    vi.setSystemTime(firstIssuedAt);
    const resources = clerkMiddlewareResources(firstIssuedAt);
    const store = new InMemoryIdentityStore();
    let sequence = 0;
    const service = new IdentityService({
      store,
      now: () => new Date(),
      nextId: (kind) =>
        `${kind}_middleware_${String(++sequence).padStart(3, "0")}`,
    });
    const app = await buildApiApp(signedMiddlewareEnvironment(), {
      clerkRequestSdk: resources.sdk,
      identityService: service,
    });
    apps.push(app);
    const firstClaims = sessionTokenClaims(firstIssuedAt);
    const firstToken = signSessionToken({
      ...firstClaims,
      exp: firstClaims.iat + 60,
    });
    const firstClient = clientFor(app, {
      authorization: `Bearer ${firstToken}`,
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    const created = await firstClient.createDocketSession({
      idempotencyKey: "command_middleware_refresh_create_001",
    });

    const afterFirstExpiry = new Date(firstIssuedAt.getTime() + 2 * 60 * 1_000);
    vi.setSystemTime(afterFirstExpiry);
    await expect(
      firstClient.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });

    const refreshedClient = clientFor(app, {
      authorization: `Bearer ${signSessionToken(sessionTokenClaims(afterFirstExpiry))}`,
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await expect(
      refreshedClient.listDocketSessions({ audience: "self" }),
    ).resolves.toEqual({ sessions: [created.session] });
    expect(created.session.expiresAt).toBe(
      new Date(resources.state.sessionExpiresAt).toISOString(),
    );
  });

  it("validates Clerk SDK evidence on both session route generations and persists the live session lifetime", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });

    const created = await client.createDocketSession({
      idempotencyKey: "command_boundary_create_001",
    });
    expect(created.session.expiresAt).toBe(
      new Date(clerk.state.sessionExpiresAt).toISOString(),
    );
    await expect(
      client.getIdentitySession({ audience: "self" }),
    ).resolves.toMatchObject({
      authenticated: true,
      userId: "user_clerk_boundary_001",
    });

    clerk.state.auth.sessionClaims.exp = Math.floor(
      (Date.now() + 10 * 60 * 1_000) / 1_000,
    );
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).resolves.toEqual({ sessions: [created.session] });
  });

  it.each([
    [
      "signature",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.auth.userId = null;
      },
    ],
    [
      "issuer",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.auth.sessionClaims.iss = "https://attacker.example.test";
      },
    ],
    [
      "audience",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.auth.sessionClaims.aud = "another-api";
      },
    ],
    [
      "authorized party",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.auth.sessionClaims.azp = "https://attacker.example.test";
      },
    ],
    [
      "expiry",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.auth.sessionClaims.exp = 1;
      },
    ],
    [
      "inactive session",
      (clerk: ReturnType<typeof clerkRequestSdkFixture>) => {
        clerk.state.sessionStatus = "revoked";
      },
    ],
  ])(
    "rejects invalid %s evidence at the Clerk SDK request boundary",
    async (_label, invalidate) => {
      const clerk = clerkRequestSdkFixture();
      invalidate(clerk);
      const listDocketSessions = vi.fn();
      const app = await buildApiApp(productionApi, {
        clerkRequestSdk: clerk.sdk,
        identityService: {
          createDocketSession: vi.fn(),
          listDocketSessions,
          resumeDocketSession: vi.fn(),
          revokeDocketSession: vi.fn(),
        },
      });
      apps.push(app);
      const client = clientFor(app, {
        origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
      });

      await expect(
        client.listDocketSessions({ audience: "self" }),
      ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
      await expect(
        client.getIdentitySession({ audience: "self" }),
      ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
      expect(listDocketSessions).not.toHaveBeenCalled();
    },
  );

  it("rejects an untrusted request origin before invoking a session command", async () => {
    const clerk = clerkRequestSdkFixture();
    const listDocketSessions = vi.fn();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: {
        createDocketSession: vi.fn(),
        listDocketSessions,
        resumeDocketSession: vi.fn(),
        revokeDocketSession: vi.fn(),
      },
    });
    apps.push(app);

    await expect(
      clientFor(app, {
        origin: "https://attacker.example.test",
      }).listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
    expect(listDocketSessions).not.toHaveBeenCalled();
  });

  it("continues an existing Docket session during a Clerk outage without creating new authority", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    const created = await client.createDocketSession({
      idempotencyKey: "command_before_clerk_outage",
    });

    clerk.state.providerError = Object.assign(
      new Error("simulated Clerk outage"),
      { status: 503 },
    );
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).resolves.toEqual({ sessions: [created.session] });

    const newFixture = sessionFixture();
    const denied = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: newFixture.service,
    });
    apps.push(denied);
    await expect(
      clientFor(denied, {
        origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
      }).createDocketSession({ idempotencyKey: "outage_cannot_sign_in" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("continues an existing Docket session for the installed Clerk SDK network-error shape", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const now = new Date("2026-09-25T16:00:00.000Z");
    vi.setSystemTime(now);
    const resources = clerkMiddlewareResources(now);
    const store = new InMemoryIdentityStore();
    let sequence = 0;
    const service = new IdentityService({
      store,
      now: () => new Date(),
      nextId: (kind) =>
        `${kind}_sdk_outage_${String(++sequence).padStart(3, "0")}`,
    });
    const onlineApp = await buildApiApp(signedMiddlewareEnvironment(), {
      clerkRequestSdk: resources.sdk,
      identityService: service,
    });
    apps.push(onlineApp);
    const token = signSessionToken(sessionTokenClaims(now));
    const headers = {
      authorization: `Bearer ${token}`,
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    };
    const created = await clientFor(onlineApp, headers).createDocketSession({
      idempotencyKey: "command_before_sdk_network_failure",
    });

    const fetchRequest = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new TypeError("fetch failed"));
    const outageApp = await buildApiApp(signedMiddlewareEnvironment(), {
      identityService: service,
    });
    apps.push(outageApp);

    await expect(
      clientFor(outageApp, headers).listDocketSessions({ audience: "self" }),
    ).resolves.toEqual({ sessions: [created.session] });
    expect(fetchRequest).toHaveBeenCalledTimes(2);
  });

  it("does not treat an inaccessible Clerk identity as a provider outage", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_identity_inaccessible",
    });

    clerk.state.providerError = Object.assign(new Error("identity not found"), {
      status: 404,
    });
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("lets an inactive provider session deny access when the User lookup is unavailable", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_mixed_provider_result",
    });

    clerk.state.userError = Object.assign(new Error("provider unavailable"), {
      status: 503,
    });
    clerk.state.sessionStatus = "revoked";
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("denies fallback for elapsed and invalid provider-session lifetimes when the User lookup is unavailable", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_provider_expiry",
    });

    clerk.state.userError = Object.assign(new Error("provider unavailable"), {
      status: 503,
    });
    for (const expireAt of [
      new Date("2026-09-25T15:59:59.999Z").getTime(),
      Number.NaN,
    ]) {
      clerk.state.sessionExpiresAt = expireAt;
      await expect(
        client.listDocketSessions({ audience: "self" }),
      ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
    }
  });

  it("lets a banned provider User deny access when the Session lookup is unavailable", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_provider_ban",
    });

    clerk.state.userBanned = true;
    clerk.state.sessionError = Object.assign(
      new Error("provider unavailable"),
      { status: 503 },
    );
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("does not classify an unknown provider exception as an outage", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_unknown_provider_exception",
    });

    clerk.state.userError = new Error("unexpected provider client failure");
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("does not classify an arbitrary Clerk unexpected error as an outage", async () => {
    const fixture = sessionFixture();
    const clerk = clerkRequestSdkFixture();
    const app = await buildApiApp(productionApi, {
      clerkRequestSdk: clerk.sdk,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app, {
      origin: productionApi.DOCKET_CLERK_ALLOWED_ORIGINS,
    });
    await client.createDocketSession({
      idempotencyKey: "command_before_clerk_payload_error",
    });

    clerk.state.userError = Object.assign(new Error(""), {
      name: "ClerkAPIResponseError",
      clerkError: true,
      code: "api_response_error",
      errors: [
        {
          code: "unexpected_error",
          message: "Unexpected end of JSON input",
        },
      ],
    });
    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).rejects.toMatchObject({ code: "AUTHENTICATION_REQUIRED" });
  });

  it("validates input and an account-self projection across the real API route", async () => {
    const app = await buildApiApp(productionApi, {
      resolveSessionAuthority: () => ({
        userId: "account_fixture_001",
        sessionId: "session_fixture_001",
        authorityVersion: "authority-v1",
        currentAuthorityVersion: "authority-v1",
      }),
    });
    apps.push(app);

    await expect(
      clientFor(app).getIdentitySession({ audience: "self" }),
    ).resolves.toEqual({
      authenticated: true,
      userId: "account_fixture_001",
      audience: "self",
    });
  }, 30_000);

  it("returns the stable envelope for denied and stale server authority", async () => {
    const denied = await buildApiApp(productionApi, {
      resolveSessionAuthority: () => null,
    });
    const stale = await buildApiApp(productionApi, {
      resolveSessionAuthority: () => ({
        userId: "account_fixture_001",
        sessionId: "session_fixture_001",
        authorityVersion: "authority-v1",
        currentAuthorityVersion: "authority-v2",
      }),
    });
    apps.push(denied, stale);

    await expect(
      clientFor(denied).getIdentitySession({ audience: "self" }),
    ).rejects.toMatchObject({
      name: "ContractClientError",
      code: "AUTHENTICATION_REQUIRED",
    });
    await expect(
      clientFor(stale).getIdentitySession({ audience: "self" }),
    ).rejects.toMatchObject({
      name: "ContractClientError",
      code: "AUTHORITY_STALE",
    });
  });

  it("rejects asserted invalid input before transport and invalid audience output after transport", async () => {
    let requests = 0;
    const invalidInputClient = createDocketClient(() => {
      requests += 1;
      return Promise.resolve({ status: 200, body: {} });
    });
    const asserted = { audience: "administrator" } as unknown as {
      audience: "self";
    };

    await expect(
      invalidInputClient.getIdentitySession(asserted),
    ).rejects.toMatchObject({
      name: "ContractClientError",
      code: "REQUEST_INVALID",
    });
    expect(requests).toBe(0);

    const invalidOutputClient = createDocketClient(() =>
      Promise.resolve({
        status: 200,
        body: {
          authenticated: true,
          userId: "account_fixture_001",
          audience: "administrator",
          privateAuthority: "must-not-cross-the-projection",
        },
      }),
    );
    await expect(
      invalidOutputClient.getIdentitySession({ audience: "self" }),
    ).rejects.toBeInstanceOf(ContractClientError);
    await expect(
      invalidOutputClient.getIdentitySession({ audience: "self" }),
    ).rejects.toMatchObject({ code: "RESPONSE_INVALID" });
  });

  it("treats equivalent read retries as deterministic and side-effect free", async () => {
    const app = await buildApiApp(productionApi, {
      resolveSessionAuthority: () => ({
        userId: "account_fixture_001",
        sessionId: "session_fixture_001",
        authorityVersion: "authority-v1",
        currentAuthorityVersion: "authority-v1",
      }),
    });
    apps.push(app);
    const client = clientFor(app);

    const [first, second] = await Promise.all([
      client.getIdentitySession({ audience: "self" }),
      client.getIdentitySession({ audience: "self" }),
    ]);
    expect(first).toEqual(second);
    expect(first.userId).toBe("account_fixture_001");
  });

  it("creates, lists, and revokes Docket Sessions through generated body-aware client methods", async () => {
    const fixture = sessionFixture();
    const app = await buildApiApp(productionApi, {
      authenticateIdentity: () => fixture.identity,
      identityService: fixture.service,
    });
    apps.push(app);
    const client = clientFor(app);

    const created = await client.createDocketSession({
      idempotencyKey: "command_api_create_001",
    });
    expect(created.account).toMatchObject({
      displayName: "API Account Holder",
      verifiedEmail: "account-holder@identity.example.test",
      authority: [],
    });
    expect(created.session).toMatchObject({ status: "active", version: 1 });

    await expect(
      client.listDocketSessions({ audience: "self" }),
    ).resolves.toEqual({ sessions: [created.session] });

    const revoked = await client.revokeDocketSession({
      sessionId: created.session.id,
      expectedVersion: created.session.version,
      idempotencyKey: "command_api_revoke_001",
    });
    expect(revoked.session).toMatchObject({
      id: created.session.id,
      status: "revoked",
      version: 2,
    });
  });

  it("returns the stable stale-authority response for a conflicting session version", async () => {
    const fixture = sessionFixture();
    vi.spyOn(fixture.service, "revokeDocketSession").mockRejectedValue(
      new IdentityError("AUTHORITY_STALE", "simulated stale version"),
    );
    const app = await buildApiApp(productionApi, {
      authenticateIdentity: () => fixture.identity,
      identityService: fixture.service,
    });
    apps.push(app);

    await expect(
      clientFor(app).revokeDocketSession({
        sessionId: "session_api_stale_001",
        expectedVersion: 1,
        idempotencyKey: "command_api_stale_001",
      }),
    ).rejects.toMatchObject({
      name: "ContractClientError",
      code: "AUTHORITY_STALE",
    });
  });

  it("returns the stable authentication error without invoking session commands", async () => {
    const fixture = sessionFixture();
    const app = await buildApiApp(productionApi, {
      authenticateIdentity: () => null,
      identityService: fixture.service,
    });
    apps.push(app);

    await expect(
      clientFor(app).createDocketSession({
        idempotencyKey: "command_api_denied_001",
      }),
    ).rejects.toMatchObject({
      name: "ContractClientError",
      code: "AUTHENTICATION_REQUIRED",
    });
  });
});

describe("verified Clerk webhook hint boundary", () => {
  it("verifies and idempotently records a sanitized hint without creating request authority", async () => {
    const store = new InMemoryIdentityWebhookHintStore();
    const hintService = new IdentityWebhookHintService(
      store,
      () => new Date("2026-09-25T18:00:00.000Z"),
    );
    const app = await buildApiApp(productionApi, {
      webhookHintService: hintService,
      verifyClerkWebhook: () =>
        Promise.resolve({
          type: "user.updated",
          data: { id: "user_webhook_001" },
        }),
    });
    apps.push(app);

    const request = {
      method: "POST" as const,
      url: "/v1/provider-events/clerk",
      headers: {
        "svix-id": "msg_webhook_001",
        "svix-timestamp": "1790362800",
      },
      payload: { private_payload: "must-not-be-persisted" },
    };
    const first = await app.inject(request);
    const retry = await app.inject(request);

    expect(first.statusCode).toBe(202);
    expect(first.json()).toEqual({ status: "accepted" });
    expect(retry.json()).toEqual({ status: "duplicate" });
    expect(store.snapshot()).toHaveLength(1);
    expect(JSON.stringify(store.snapshot())).not.toContain("private_payload");
  });

  it("rejects an unverified event before it reaches the durable hint queue", async () => {
    const store = new InMemoryIdentityWebhookHintStore();
    const app = await buildApiApp(productionApi, {
      webhookHintService: new IdentityWebhookHintService(
        store,
        () => new Date(),
      ),
      verifyClerkWebhook: () => Promise.reject(new Error("invalid signature")),
    });
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/provider-events/clerk",
      headers: {
        "svix-id": "msg_invalid",
        "svix-timestamp": "1790362800",
      },
      payload: {},
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "WEBHOOK_INVALID" });
    expect(store.snapshot()).toHaveLength(0);
  });
});
