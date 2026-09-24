import { createServer } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import {
  ConfigValidationError,
  createProcessHealth,
  createTcpProbe,
  dependencyProbes,
  parseRuntimeConfig,
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
      }).process,
    ).toBe("worker");
    expect(
      parseRuntimeConfig("web", {
        DOCKET_ENV: "production",
        DOCKET_API_BASE_URL: productionBase.DOCKET_API_BASE_URL,
        DOCKET_IDENTITY_ADAPTER: "clerk",
        CLERK_PUBLISHABLE_KEY: "publishable-placeholder",
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
