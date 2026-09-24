import { randomBytes as secureRandomBytes } from "node:crypto";
import { createConnection } from "node:net";
import { Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export const runtimePackage = "@docket/runtime" as const;

export type ProcessKind = "api" | "worker" | "web" | "migration";
export type RuntimeEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export type RandomBytes = (size: number) => Uint8Array;

export function createUuidV7Generator({
  clock = systemClock,
  randomBytes = secureRandomBytes,
}: Readonly<{ clock?: Clock; randomBytes?: RandomBytes }> = {}): IdGenerator {
  return {
    next: () => {
      const milliseconds = clock.now().getTime();
      if (
        !Number.isSafeInteger(milliseconds) ||
        milliseconds < 0 ||
        milliseconds > 0xffff_ffff_ffff
      ) {
        throw new RangeError("UUIDV7_TIMESTAMP_OUT_OF_RANGE");
      }
      const bytes = randomBytes(16);
      if (bytes.length !== 16) {
        throw new RangeError("UUIDV7_RANDOM_BYTES_INVALID");
      }
      let timestamp = milliseconds;
      for (let index = 5; index >= 0; index -= 1) {
        bytes[index] = timestamp & 0xff;
        timestamp = Math.floor(timestamp / 0x100);
      }
      bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
      bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);
      const hexadecimal = [...bytes]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
    },
  };
}

export const systemIdGenerator: IdGenerator = createUuidV7Generator();

const EnvironmentSchema = Type.Union([
  Type.Literal("development"),
  Type.Literal("test"),
  Type.Literal("staging"),
  Type.Literal("production"),
]);
const AdapterSchema = Type.Object(
  {
    identity: Type.Optional(
      Type.Union([Type.Literal("fixed"), Type.Literal("clerk")]),
    ),
    objectStorage: Type.Optional(
      Type.Union([Type.Literal("minio"), Type.Literal("s3")]),
    ),
    email: Type.Optional(
      Type.Union([Type.Literal("mailpit"), Type.Literal("ses")]),
    ),
  },
  { additionalProperties: false },
);

const RuntimeConfigSchema = Type.Object(
  {
    process: Type.Union([
      Type.Literal("api"),
      Type.Literal("worker"),
      Type.Literal("web"),
      Type.Literal("migration"),
    ]),
    environment: EnvironmentSchema,
    adapters: AdapterSchema,
    databaseUrl: Type.Optional(Type.String({ minLength: 1 })),
    objectStorageEndpoint: Type.Optional(Type.String({ minLength: 1 })),
    smtpUrl: Type.Optional(Type.String({ minLength: 1 })),
    apiBaseUrl: Type.Optional(Type.String({ minLength: 1 })),
    apiHost: Type.Optional(Type.String({ minLength: 1 })),
    apiPort: Type.Optional(Type.Integer({ minimum: 1, maximum: 65535 })),
    workerConcurrency: Type.Optional(Type.Integer({ minimum: 1, maximum: 64 })),
    clerkPublishableKey: Type.Optional(Type.String({ minLength: 1 })),
    clerkSecretKey: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false },
);

export type RuntimeConfig = Static<typeof RuntimeConfigSchema>;

export interface ConfigIssue {
  readonly key: string;
  readonly reason:
    | "missing"
    | "malformed"
    | "unknown"
    | "forbidden_in_environment"
    | "real_contact_forbidden"
    | "test_authority_forbidden";
}

export class ConfigValidationError extends Error {
  readonly code: "CONFIG_INVALID" | "ADAPTER_FORBIDDEN_IN_ENVIRONMENT";
  readonly issues: readonly ConfigIssue[];

  constructor(
    code: "CONFIG_INVALID" | "ADAPTER_FORBIDDEN_IN_ENVIRONMENT",
    issues: readonly ConfigIssue[],
  ) {
    super(
      `${code}: ${issues.map(({ key, reason }) => `${key} (${reason})`).join(", ")}`,
    );
    this.name = "ConfigValidationError";
    this.code = code;
    this.issues = issues;
  }
}

const knownKeys = new Set([
  "DOCKET_ENV",
  "DOCKET_DATABASE_URL",
  "DOCKET_OBJECT_STORAGE_ENDPOINT",
  "DOCKET_SMTP_URL",
  "DOCKET_API_BASE_URL",
  "DOCKET_IDENTITY_ADAPTER",
  "DOCKET_OBJECT_STORAGE_ADAPTER",
  "DOCKET_EMAIL_ADAPTER",
  "DOCKET_API_HOST",
  "DOCKET_API_PORT",
  "DOCKET_WORKER_CONCURRENCY",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
]);

const forbiddenIdentityAliasKeys = new Set([
  "FIXED_IDENTITY",
  "IDENTITY_ADAPTER",
  "USE_FIXED_IDENTITY",
  "DOCKET_FIXED_IDENTITY",
  "DOCKET_TEST_IDENTITY",
]);

const localDefaults: Readonly<Record<string, string>> = {
  DOCKET_DATABASE_URL:
    "postgresql://docket:docket-local-only@127.0.0.1:5432/docket",
  DOCKET_OBJECT_STORAGE_ENDPOINT: "http://127.0.0.1:9000",
  DOCKET_SMTP_URL: "smtp://127.0.0.1:1025",
  DOCKET_API_BASE_URL: "http://127.0.0.1:3001",
  DOCKET_IDENTITY_ADAPTER: "fixed",
  DOCKET_OBJECT_STORAGE_ADAPTER: "minio",
  DOCKET_EMAIL_ADAPTER: "mailpit",
  DOCKET_API_HOST: "127.0.0.1",
  DOCKET_API_PORT: "3001",
  DOCKET_WORKER_CONCURRENCY: "2",
  CLERK_PUBLISHABLE_KEY: "pk_test_ZG9ja2V0LmxvY2FsJA",
  CLERK_SECRET_KEY: "sk_test_docket_local_only",
};

const processRequirements: Readonly<Record<ProcessKind, readonly string[]>> = {
  api: [
    "DOCKET_DATABASE_URL",
    "DOCKET_OBJECT_STORAGE_ENDPOINT",
    "DOCKET_IDENTITY_ADAPTER",
    "DOCKET_OBJECT_STORAGE_ADAPTER",
    "DOCKET_API_HOST",
    "DOCKET_API_PORT",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ],
  worker: [
    "DOCKET_DATABASE_URL",
    "DOCKET_OBJECT_STORAGE_ENDPOINT",
    "DOCKET_SMTP_URL",
    "DOCKET_OBJECT_STORAGE_ADAPTER",
    "DOCKET_EMAIL_ADAPTER",
    "DOCKET_WORKER_CONCURRENCY",
  ],
  web: [
    "DOCKET_API_BASE_URL",
    "DOCKET_IDENTITY_ADAPTER",
    "CLERK_PUBLISHABLE_KEY",
  ],
  migration: ["DOCKET_DATABASE_URL"],
};

const propertyEnvironmentKeys: Readonly<Record<string, string>> = {
  identity: "DOCKET_IDENTITY_ADAPTER",
  objectStorage: "DOCKET_OBJECT_STORAGE_ADAPTER",
  email: "DOCKET_EMAIL_ADAPTER",
  apiHost: "DOCKET_API_HOST",
  apiPort: "DOCKET_API_PORT",
  workerConcurrency: "DOCKET_WORKER_CONCURRENCY",
};

function integer(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/u.test(value)) return undefined;
  return Number(value);
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.hostname);
  } catch {
    return false;
  }
}

function withLocalDefaults(
  source: Readonly<Record<string, string | undefined>>,
  environment: RuntimeEnvironment,
): Readonly<Record<string, string | undefined>> {
  return environment === "development" || environment === "test"
    ? { ...localDefaults, ...source }
    : source;
}

export function parseRuntimeConfig(
  process: ProcessKind,
  source: Readonly<Record<string, string | undefined>>,
): RuntimeConfig {
  const environmentValue = source.DOCKET_ENV ?? "development";
  if (!Value.Check(EnvironmentSchema, environmentValue)) {
    throw new ConfigValidationError("CONFIG_INVALID", [
      { key: "DOCKET_ENV", reason: "malformed" },
    ]);
  }
  const environment = environmentValue;
  const values = withLocalDefaults(source, environment);
  const apiPort = integer(values.DOCKET_API_PORT);
  const workerConcurrency = integer(values.DOCKET_WORKER_CONCURRENCY);
  const unknown = Object.keys(source)
    .filter(
      (key) =>
        forbiddenIdentityAliasKeys.has(key) ||
        (key.startsWith("DOCKET_") && !knownKeys.has(key)),
    )
    .map((key): ConfigIssue => ({ key, reason: "unknown" }));
  if (unknown.length > 0) {
    throw new ConfigValidationError("CONFIG_INVALID", unknown);
  }

  const candidate: RuntimeConfig = {
    process,
    environment,
    adapters: {
      ...(values.DOCKET_IDENTITY_ADAPTER
        ? {
            identity: values.DOCKET_IDENTITY_ADAPTER as "fixed" | "clerk",
          }
        : {}),
      ...(values.DOCKET_OBJECT_STORAGE_ADAPTER
        ? {
            objectStorage: values.DOCKET_OBJECT_STORAGE_ADAPTER as
              | "minio"
              | "s3",
          }
        : {}),
      ...(values.DOCKET_EMAIL_ADAPTER
        ? { email: values.DOCKET_EMAIL_ADAPTER as "mailpit" | "ses" }
        : {}),
    },
    ...(values.DOCKET_DATABASE_URL
      ? { databaseUrl: values.DOCKET_DATABASE_URL }
      : {}),
    ...(values.DOCKET_OBJECT_STORAGE_ENDPOINT
      ? { objectStorageEndpoint: values.DOCKET_OBJECT_STORAGE_ENDPOINT }
      : {}),
    ...(values.DOCKET_SMTP_URL ? { smtpUrl: values.DOCKET_SMTP_URL } : {}),
    ...(values.DOCKET_API_BASE_URL
      ? { apiBaseUrl: values.DOCKET_API_BASE_URL }
      : {}),
    ...(values.DOCKET_API_HOST ? { apiHost: values.DOCKET_API_HOST } : {}),
    ...(apiPort === undefined ? {} : { apiPort }),
    ...(workerConcurrency === undefined ? {} : { workerConcurrency }),
    ...(values.CLERK_PUBLISHABLE_KEY
      ? { clerkPublishableKey: values.CLERK_PUBLISHABLE_KEY }
      : {}),
    ...(values.CLERK_SECRET_KEY
      ? { clerkSecretKey: values.CLERK_SECRET_KEY }
      : {}),
  };

  const issues: ConfigIssue[] = [];
  if (!Value.Check(RuntimeConfigSchema, candidate)) {
    for (const error of Value.Errors(RuntimeConfigSchema, candidate)) {
      const property = error.path.split("/").at(-1) ?? "configuration";
      const key = propertyEnvironmentKeys[property] ?? property;
      issues.push({ key, reason: "malformed" });
    }
  }
  for (const [key, value] of [
    ["DOCKET_DATABASE_URL", candidate.databaseUrl],
    ["DOCKET_OBJECT_STORAGE_ENDPOINT", candidate.objectStorageEndpoint],
    ["DOCKET_SMTP_URL", candidate.smtpUrl],
    ["DOCKET_API_BASE_URL", candidate.apiBaseUrl],
  ] as const) {
    if (value !== undefined && !isUrl(value)) {
      issues.push({ key, reason: "malformed" });
    }
  }
  if (
    values.DOCKET_API_PORT !== undefined &&
    integer(values.DOCKET_API_PORT) === undefined
  ) {
    issues.push({ key: "DOCKET_API_PORT", reason: "malformed" });
  }
  if (
    values.DOCKET_WORKER_CONCURRENCY !== undefined &&
    integer(values.DOCKET_WORKER_CONCURRENCY) === undefined
  ) {
    issues.push({ key: "DOCKET_WORKER_CONCURRENCY", reason: "malformed" });
  }
  for (const key of processRequirements[process]) {
    if (!values[key]) issues.push({ key, reason: "missing" });
  }
  if (issues.length > 0) {
    throw new ConfigValidationError(
      "CONFIG_INVALID",
      deduplicateIssues(issues),
    );
  }

  if (environment === "staging" || environment === "production") {
    const forbidden: ConfigIssue[] = [];
    if (candidate.adapters.identity === "fixed")
      forbidden.push({
        key: "DOCKET_IDENTITY_ADAPTER",
        reason: "forbidden_in_environment",
      });
    if (candidate.adapters.objectStorage === "minio")
      forbidden.push({
        key: "DOCKET_OBJECT_STORAGE_ADAPTER",
        reason: "forbidden_in_environment",
      });
    if (candidate.adapters.email === "mailpit")
      forbidden.push({
        key: "DOCKET_EMAIL_ADAPTER",
        reason: "forbidden_in_environment",
      });
    if (forbidden.length > 0) {
      throw new ConfigValidationError(
        "ADAPTER_FORBIDDEN_IN_ENVIRONMENT",
        forbidden,
      );
    }
  }

  return candidate;
}

export type FixtureAdapterIdentity =
  | "fixed-identity"
  | "synthetic-competitor"
  | "fake-mail"
  | "provider-fixture";

export interface FixtureDescriptor {
  readonly adapter: FixtureAdapterIdentity;
  readonly fixtureId: string;
  readonly payload: unknown;
}

function isSyntheticEmail(value: string): boolean {
  const domain = value.toLowerCase().split("@").at(-1);
  return Boolean(
    domain &&
      (domain === "example.com" ||
        domain === "example.net" ||
        domain === "example.org" ||
        domain.endsWith(".example") ||
        domain.endsWith(".invalid") ||
        domain.endsWith(".test")),
  );
}

function fixturePayloadIssues(
  value: unknown,
  path = "fixture.payload",
): ConfigIssue[] {
  if (typeof value === "string") {
    const emails = value.match(
      /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
    );
    return (emails ?? [])
      .filter((email) => !isSyntheticEmail(email))
      .map(() => ({ key: path, reason: "real_contact_forbidden" as const }));
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      fixturePayloadIssues(entry, `${path}[${String(index)}]`),
    );
  }
  if (!value || typeof value !== "object") return [];

  const issues: ConfigIssue[] = [];
  for (const [key, entry] of Object.entries(value)) {
    const entryPath = `${path}.${key}`;
    if (
      /^(?:authorit(?:y|ies)|permissions?|roles?)$/iu.test(key) &&
      ((Array.isArray(entry) && entry.length > 0) ||
        (!Array.isArray(entry) && Boolean(entry)))
    ) {
      issues.push({ key: entryPath, reason: "test_authority_forbidden" });
    }
    if (
      /(?:phone|mobile)/iu.test(key) &&
      typeof entry === "string" &&
      entry.length > 0 &&
      !/^\+1(?:[ -]?555[ -]?01\d{2})$/u.test(entry)
    ) {
      issues.push({ key: entryPath, reason: "real_contact_forbidden" });
    }
    issues.push(...fixturePayloadIssues(entry, entryPath));
  }
  return issues;
}

export function assertFixtureAllowed(
  environment: RuntimeEnvironment,
  fixture: FixtureDescriptor,
): void {
  const issues: ConfigIssue[] = [];
  if (environment === "staging" || environment === "production") {
    issues.push({
      key: `fixture.${fixture.adapter}`,
      reason: "forbidden_in_environment",
    });
  }
  issues.push(...fixturePayloadIssues(fixture.payload));
  if (issues.length > 0) {
    throw new ConfigValidationError(
      "ADAPTER_FORBIDDEN_IN_ENVIRONMENT",
      deduplicateIssues(issues),
    );
  }
}

export interface AdapterRequestInput {
  readonly headers: Readonly<
    Record<string, string | readonly string[] | undefined>
  >;
  readonly query?: unknown;
}

export function assertNoFixtureAdapterRequestOverride(
  request: AdapterRequestInput,
): void {
  const forbiddenKeys = new Set([
    "docket_identity_adapter",
    "fixed_identity",
    "identity_adapter",
    "use_fixed_identity",
    "x-docket-identity-adapter",
  ]);
  const attemptedKeys = Object.keys(request.headers).filter((key) =>
    forbiddenKeys.has(key.toLowerCase()),
  );
  if (request.query && typeof request.query === "object") {
    attemptedKeys.push(
      ...Object.keys(request.query).filter((key) =>
        forbiddenKeys.has(key.toLowerCase()),
      ),
    );
  }
  if (attemptedKeys.length > 0) {
    throw new ConfigValidationError(
      "ADAPTER_FORBIDDEN_IN_ENVIRONMENT",
      attemptedKeys.map((key) => ({
        key,
        reason: "forbidden_in_environment",
      })),
    );
  }
}

export interface AdapterLogRecord {
  readonly adapter_identity: FixtureAdapterIdentity;
  readonly correlation_id: string;
}

export function redactedAdapterLogRecord(
  adapter: FixtureAdapterIdentity,
  correlationId: string,
): AdapterLogRecord {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(correlationId)) {
    throw new TypeError("CORRELATION_ID_INVALID");
  }
  return { adapter_identity: adapter, correlation_id: correlationId };
}

function deduplicateIssues(issues: readonly ConfigIssue[]): ConfigIssue[] {
  const seen = new Set<string>();
  return issues.filter(({ key, reason }) => {
    const identity = `${key}:${reason}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

export interface Liveness {
  readonly status: "live";
  readonly process: ProcessKind;
}

export interface DependencyStatus {
  readonly name: string;
  readonly ready: boolean;
  readonly code?: "DEPENDENCY_UNREADY";
}

export interface Readiness {
  readonly status: "ready" | "unready";
  readonly process: ProcessKind;
  readonly dependencies: readonly DependencyStatus[];
}

export interface DependencyProbe {
  readonly name: string;
  check(): Promise<void>;
}

export interface ProcessHealth {
  liveness(): Liveness;
  readiness(): Promise<Readiness>;
}

export function createProcessHealth(
  process: ProcessKind,
  dependencies: readonly DependencyProbe[],
): ProcessHealth {
  return {
    liveness: () => ({ status: "live", process }),
    readiness: async () => {
      const statuses = await Promise.all(
        dependencies.map(async (dependency) => {
          try {
            await dependency.check();
            return {
              name: dependency.name,
              ready: true,
            } satisfies DependencyStatus;
          } catch {
            return {
              name: dependency.name,
              ready: false,
              code: "DEPENDENCY_UNREADY",
            } satisfies DependencyStatus;
          }
        }),
      );
      return {
        status: statuses.every(({ ready }) => ready) ? "ready" : "unready",
        process,
        dependencies: statuses,
      };
    },
  };
}

export function createTcpProbe(
  name: string,
  endpoint: string,
  timeoutMilliseconds = 1_000,
): DependencyProbe {
  const url = new URL(endpoint);
  const port = Number(
    url.port ||
      (url.protocol === "https:"
        ? "443"
        : url.protocol === "smtp:"
          ? "25"
          : "80"),
  );
  return {
    name,
    check: () =>
      new Promise<void>((resolve, reject) => {
        const socket = createConnection({ host: url.hostname, port });
        const finish = (error?: Error): void => {
          socket.removeAllListeners();
          socket.destroy();
          if (error) reject(error);
          else resolve();
        };
        socket.setTimeout(timeoutMilliseconds);
        socket.once("connect", () => {
          finish();
        });
        socket.once("timeout", () => {
          finish(new Error("probe timed out"));
        });
        socket.once("error", (error) => {
          finish(error);
        });
      }),
  };
}

export function dependencyProbes(config: RuntimeConfig): DependencyProbe[] {
  const probes: DependencyProbe[] = [];
  if (
    (config.process === "api" ||
      config.process === "worker" ||
      config.process === "migration") &&
    config.databaseUrl
  )
    probes.push(createTcpProbe("postgresql", config.databaseUrl));
  if (
    (config.process === "api" || config.process === "worker") &&
    config.objectStorageEndpoint
  )
    probes.push(createTcpProbe("object-storage", config.objectStorageEndpoint));
  if (config.process === "worker" && config.smtpUrl)
    probes.push(createTcpProbe("email", config.smtpUrl));
  if (config.process === "web" && config.apiBaseUrl)
    probes.push(createTcpProbe("api", config.apiBaseUrl));
  return probes;
}

export function safeConfigSummary(config: RuntimeConfig): Readonly<{
  process: ProcessKind;
  environment: RuntimeEnvironment;
  adapters: RuntimeConfig["adapters"];
}> {
  return {
    process: config.process,
    environment: config.environment,
    adapters: config.adapters,
  };
}
