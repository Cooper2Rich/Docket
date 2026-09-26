import { createServer } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertNoFixtureAdapterRequestOverride,
  ConfigValidationError,
  createProcessHealth,
  createTcpProbe,
  createUuidV7Generator,
  dependencyProbes,
  parseRuntimeConfig,
  redactedAdapterLogRecord,
  systemIdGenerator,
} from "./index.js";

const productionBase = {
  DOCKET_ENV: "production",
  DOCKET_DATABASE_URL: "postgresql://service:redacted@db.internal:5432/docket",
  DOCKET_OBJECT_STORAGE_ENDPOINT: "https://objects.example.test",
  DOCKET_SMTP_URL: "smtps://email.example.test:465",
  DOCKET_API_BASE_URL: "https://api.example.test",
  DOCKET_IDENTITY_ADAPTER: "clerk",
  DOCKET_OBJECT_STORAGE_ADAPTER: "s3",
  DOCKET_EMAIL_ADAPTER: "ses",
  DOCKET_API_HOST: "0.0.0.0",
  DOCKET_API_PORT: "3001",
  DOCKET_WORKER_CONCURRENCY: "4",
  CLERK_PUBLISHABLE_KEY: "publishable-placeholder",
  CLERK_SECRET_KEY: "sensitive-value-that-must-not-appear",
  DOCKET_CLERK_ISSUER: "https://clerk.example.test",
  DOCKET_CLERK_AUDIENCE: "docket-api",
  DOCKET_CLERK_AUTHORIZED_PARTIES: "https://docket.example.test",
  DOCKET_CLERK_ALLOWED_ORIGINS: "https://docket.example.test",
} as const;

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        }),
    ),
  );
});

describe("process-scoped runtime configuration", () => {
  for (const kind of ["api", "worker", "web", "migration"] as const) {
    it(`accepts the complete production ${kind} environment`, () => {
      expect(parseRuntimeConfig(kind, productionBase).process).toBe(kind);
    });
  }

  it("requires only the selected production process schema", () => {
    expect(
      parseRuntimeConfig("api", {
        DOCKET_ENV: "production",
        DOCKET_DATABASE_URL: productionBase.DOCKET_DATABASE_URL,
        DOCKET_OBJECT_STORAGE_ENDPOINT:
          productionBase.DOCKET_OBJECT_STORAGE_ENDPOINT,
        DOCKET_IDENTITY_ADAPTER: "clerk",
        DOCKET_OBJECT_STORAGE_ADAPTER: "s3",
        DOCKET_API_HOST: "0.0.0.0",
        DOCKET_API_PORT: "3001",
        CLERK_PUBLISHABLE_KEY: "publishable-placeholder",
        CLERK_SECRET_KEY: "secret-placeholder",
        DOCKET_CLERK_ISSUER: productionBase.DOCKET_CLERK_ISSUER,
        DOCKET_CLERK_AUDIENCE: productionBase.DOCKET_CLERK_AUDIENCE,
        DOCKET_CLERK_AUTHORIZED_PARTIES:
          productionBase.DOCKET_CLERK_AUTHORIZED_PARTIES,
        DOCKET_CLERK_ALLOWED_ORIGINS:
          productionBase.DOCKET_CLERK_ALLOWED_ORIGINS,
      }).process,
    ).toBe("api");
    expect(
      parseRuntimeConfig("worker", {
        DOCKET_ENV: "production",
        DOCKET_DATABASE_URL: productionBase.DOCKET_DATABASE_URL,
        DOCKET_OBJECT_STORAGE_ENDPOINT:
          productionBase.DOCKET_OBJECT_STORAGE_ENDPOINT,
        DOCKET_SMTP_URL: productionBase.DOCKET_SMTP_URL,
        DOCKET_OBJECT_STORAGE_ADAPTER: "s3",
        DOCKET_EMAIL_ADAPTER: "ses",
        DOCKET_WORKER_CONCURRENCY: "4",
        CLERK_SECRET_KEY: "secret-placeholder",
      }).process,
    ).toBe("worker");
    expect(
      parseRuntimeConfig("web", {
        DOCKET_ENV: "production",
        DOCKET_API_BASE_URL: productionBase.DOCKET_API_BASE_URL,
        DOCKET_IDENTITY_ADAPTER: "clerk",
        CLERK_PUBLISHABLE_KEY: "publishable-placeholder",
        DOCKET_CLERK_AUDIENCE: productionBase.DOCKET_CLERK_AUDIENCE,
        DOCKET_CLERK_AUTHORIZED_PARTIES:
          productionBase.DOCKET_CLERK_AUTHORIZED_PARTIES,
        DOCKET_CLERK_ALLOWED_ORIGINS:
          productionBase.DOCKET_CLERK_ALLOWED_ORIGINS,
      }).process,
    ).toBe("web");
    expect(
      parseRuntimeConfig("migration", {
        DOCKET_ENV: "production",
        DOCKET_DATABASE_URL: productionBase.DOCKET_DATABASE_URL,
      }).process,
    ).toBe("migration");
  });

  it("uses synthetic development defaults", () => {
    const config = parseRuntimeConfig("worker", {});
    expect(config.environment).toBe("development");
    expect(config.adapters.email).toBe("mailpit");
  });

  it("rejects unknown and malformed values without reflecting secrets", () => {
    const secret = "never-print-this-value";
    expect(() =>
      parseRuntimeConfig("api", {
        ...productionBase,
        DOCKET_API_PORT: secret,
        DOCKET_UNEXPECTED: secret,
      }),
    ).toThrow(ConfigValidationError);
    try {
      parseRuntimeConfig("api", {
        ...productionBase,
        DOCKET_API_PORT: secret,
        DOCKET_UNEXPECTED: secret,
      });
    } catch (error) {
      expect(String(error)).toContain("DOCKET_UNEXPECTED");
      expect(String(error)).not.toContain(secret);
    }
  });

  it("rejects local adapters before production startup", () => {
    expect(() =>
      parseRuntimeConfig("worker", {
        ...productionBase,
        DOCKET_EMAIL_ADAPTER: "mailpit",
      }),
    ).toThrow(/ADAPTER_FORBIDDEN_IN_ENVIRONMENT.*DOCKET_EMAIL_ADAPTER/u);
  });

  it("rejects alternate fixed-identity environment variables", () => {
    for (const alias of [
      "FIXED_IDENTITY",
      "IDENTITY_ADAPTER",
      "USE_FIXED_IDENTITY",
      "DOCKET_FIXED_IDENTITY",
      "DOCKET_TEST_IDENTITY",
    ]) {
      expect(() =>
        parseRuntimeConfig("api", {
          ...productionBase,
          [alias]: "fixed",
        }),
      ).toThrow(new RegExp(`CONFIG_INVALID.*${alias}`, "u"));
    }
  });

  it("probes only dependencies required by the selected process", () => {
    const dependencyNames = (process: "api" | "worker" | "web" | "migration") =>
      dependencyProbes(parseRuntimeConfig(process, {})).map(({ name }) => name);

    expect(dependencyNames("api")).toEqual(["postgresql", "object-storage"]);
    expect(dependencyNames("worker")).toEqual([
      "postgresql",
      "object-storage",
      "email",
    ]);
    expect(dependencyNames("web")).toEqual(["api"]);
    expect(dependencyNames("migration")).toEqual(["postgresql"]);
  });
});

describe("clock, identifier and adapter seams", () => {
  it("generates production UUIDv7 identifiers with current timestamp bits", () => {
    const before = Date.now();
    const identifier = systemIdGenerator.next();
    const after = Date.now();
    expect(identifier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
    const timestamp = Number.parseInt(
      identifier.replaceAll("-", "").slice(0, 12),
      16,
    );
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it("injects Clock and entropy into UUIDv7 generation", () => {
    const generator = createUuidV7Generator({
      clock: { now: () => new Date("2026-09-24T12:00:00.000Z") },
      randomBytes: (size) => new Uint8Array(size).fill(0x2a),
    });
    expect(generator.next()).toBe("01a0d349-6e00-7a2a-aa2a-2a2a2a2a2a2a");
  });

  it("rejects request-level fixed identity controls", () => {
    expect(() => {
      assertNoFixtureAdapterRequestOverride({
        headers: { "x-docket-identity-adapter": "fixed" },
      });
    }).toThrow(/ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u);
    expect(() => {
      assertNoFixtureAdapterRequestOverride({
        headers: {},
        query: { identity_adapter: "fixed" },
      });
    }).toThrow(/ADAPTER_FORBIDDEN_IN_ENVIRONMENT/u);
  });

  it("constructs redacted adapter log records", () => {
    const record = redactedAdapterLogRecord("fixed-identity", "request-52");
    expect(record).toEqual({
      adapter_identity: "fixed-identity",
      correlation_id: "request-52",
    });
    expect(JSON.stringify(record)).not.toContain("identity@example.test");
  });
});

describe("liveness and readiness", () => {
  it("keeps liveness healthy while a dependency is unavailable", async () => {
    const health = createProcessHealth("worker", [
      { name: "postgresql", check: () => Promise.resolve() },
      {
        name: "email",
        check: () => Promise.reject(new Error("offline")),
      },
    ]);
    expect(health.liveness()).toEqual({ status: "live", process: "worker" });
    await expect(health.readiness()).resolves.toEqual({
      status: "unready",
      process: "worker",
      dependencies: [
        { name: "postgresql", ready: true },
        { name: "email", ready: false, code: "DEPENDENCY_UNREADY" },
      ],
    });
  });

  it("recovers readiness when the dependency returns", async () => {
    const server = createServer();
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("no port");
    const probe = createTcpProbe(
      "dependency",
      `http://127.0.0.1:${String(address.port)}`,
      100,
    );
    await expect(probe.check()).resolves.toBeUndefined();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    servers.pop();
    await expect(probe.check()).rejects.toBeDefined();
  });
});
