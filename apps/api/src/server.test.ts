import { afterEach, describe, expect, it } from "vitest";
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
  });
});
