import { afterEach, describe, expect, it } from "vitest";
import {
  ContractClientError,
  createDocketClient,
  type ContractTransport,
} from "@docket/contracts";
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
} as const;

const apps: Awaited<ReturnType<typeof buildApiApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
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
): ReturnType<typeof createDocketClient> {
  const transport: ContractTransport = async ({ method, path }) => {
    const response = await app.inject({
      method: method as "GET",
      url: path,
    });
    return { status: response.statusCode, body: response.json() };
  };
  return createDocketClient(transport);
}

describe("generated identity-session client and runtime boundary", () => {
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
});
