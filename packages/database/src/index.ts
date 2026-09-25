import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Type, type Static, type TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Kysely, PostgresDialect } from "kysely";
import { Pool, type PoolClient, type QueryResult } from "pg";

export const databasePackage = "@docket/database" as const;

const ownerPattern = "^[a-z][a-z0-9-]*$";
const tablePattern = "^[a-z][a-z0-9_]*_$";
const migrationIdPattern = "^[0-9]{4}_[a-z0-9_]+$";

export const MigrationOwnerSchema = Type.Object(
  {
    schema_version: Type.Literal(1),
    module: Type.String({ pattern: ownerPattern }),
    table_prefixes: Type.Array(Type.String({ pattern: tablePattern }), {
      minItems: 1,
      uniqueItems: true,
    }),
  },
  { additionalProperties: false },
);

export const MigrationMetadataSchema = Type.Object(
  {
    schema_version: Type.Literal(1),
    id: Type.String({ pattern: migrationIdPattern }),
    order: Type.Integer({ minimum: 1 }),
    owner: Type.String({ pattern: ownerPattern }),
    description: Type.String({ minLength: 1 }),
    sql_file: Type.String({ pattern: "^[a-zA-Z0-9._-]+\\.sql$" }),
    verify_sql: Type.String({ minLength: 1 }),
    compatibility: Type.Literal("additive"),
    requirements: Type.Array(Type.String({ minLength: 1 }), {
      minItems: 1,
      uniqueItems: true,
    }),
  },
  { additionalProperties: false },
);

export type MigrationOwner = Static<typeof MigrationOwnerSchema>;
export type MigrationMetadata = Static<typeof MigrationMetadataSchema>;

export interface Migration extends MigrationMetadata {
  readonly sql: string;
  readonly checksum: string;
  readonly source: string;
}

export interface MigrationPlan {
  readonly migrations: readonly Migration[];
  readonly owners: ReadonlyMap<string, MigrationOwner>;
  readonly digest: string;
  readonly head: string | null;
}

export interface MigrationAuthority {
  readonly actor: "release-operator";
  readonly authorityVersion: 1;
  readonly expectedHead?: string | null;
}

export interface MigrationApplied {
  readonly name: "MigrationApplied";
  readonly version: 1;
  readonly migrationId: string;
  readonly order: number;
  readonly owner: string;
  readonly checksum: string;
  readonly occurredAt: string;
}

export interface MigrationResult {
  readonly status: "applied" | "noop";
  readonly planDigest: string;
  readonly previousHead: string | null;
  readonly head: string | null;
  readonly applied: readonly MigrationApplied[];
}

export type MigrationErrorCode =
  | "MIGRATION_AUTHORITY_INVALID"
  | "MIGRATION_METADATA_INVALID"
  | "MIGRATION_ORDER_INVALID"
  | "MIGRATION_OWNER_INVALID"
  | "MIGRATION_APPLY_FAILED"
  | "SCHEMA_INCOMPATIBLE"
  | "STALE_MIGRATION_HEAD";

export class MigrationError extends Error {
  constructor(
    readonly code: MigrationErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(`${code}: ${message}`, options);
    this.name = "MigrationError";
  }
}

export interface MigrationSession {
  query<R extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<Pick<QueryResult<R>, "rowCount" | "rows">>;
  release(): void | Promise<void>;
}

export interface RunMigrationsOptions {
  readonly databaseUrl: string;
  readonly plan: MigrationPlan;
  readonly authority: MigrationAuthority;
  readonly now?: () => Date;
  readonly connect?: (databaseUrl: string) => Promise<MigrationSession>;
}

interface MigrationJournalRow extends Record<string, unknown> {
  migration_id: string;
  checksum: string;
}

interface MigrationDatabase {
  platform_migration_journal: {
    event_id: string;
    migration_order: number;
    migration_id: string;
    owner: string;
    checksum: string;
    outcome: "applied" | "failed";
    occurred_at: Date;
    failure_code: string | null;
  };
}

const advisoryLockKey = 4_449_675_354_507_315;
const destructiveSql =
  /\b(?:drop\s+(?:table|schema)|truncate|alter\s+table\b[\s\S]*?\bdrop\s+(?:column|constraint)|alter\s+table\b[\s\S]*?\balter\s+column\b[\s\S]*?\btype\b)\b/iu;
const mutatingVerificationSql =
  /\b(?:insert|update|delete|merge|create|alter|drop|truncate|grant|revoke|call|copy)\b/iu;
const targetPatterns = [
  /\b(?:create\s+table(?:\s+if\s+not\s+exists)?|alter\s+table|drop\s+table(?:\s+if\s+exists)?|insert\s+into|update(?!\s+or\b)|delete\s+from)\s+(?:public\.)?"?([a-z][a-z0-9_]*)"?/giu,
  /\bcreate\s+(?:unique\s+)?index(?:\s+if\s+not\s+exists)?\s+"?[a-z][a-z0-9_]*"?\s+on\s+(?:public\.)?"?([a-z][a-z0-9_]*)"?/giu,
  /\bcreate\s+trigger\s+"?[a-z][a-z0-9_]*"?[\s\S]*?\bon\s+(?:public\.)?"?([a-z][a-z0-9_]*)"?/giu,
  /\bcreate\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z][a-z0-9_]*)"?/giu,
];

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function calculateMigrationChecksum(
  metadata: MigrationMetadata,
  sql: string,
): string {
  return sha256(`${stableJson(metadata)}\n${sql}`);
}

function assertSchema<T extends TSchema>(
  schema: T,
  value: unknown,
  label: string,
): asserts value is Static<T> {
  if (Value.Check(schema, value)) return;
  const detail = [...Value.Errors(schema, value)]
    .map((error) => `${error.path || "/"} ${error.message}`)
    .join("; ");
  throw new MigrationError("MIGRATION_METADATA_INVALID", `${label}: ${detail}`);
}

function tableTargets(sql: string): readonly string[] {
  const targets = new Set<string>();
  for (const pattern of targetPatterns) {
    pattern.lastIndex = 0;
    for (const match of sql.matchAll(pattern)) {
      const target = match[1];
      if (target) targets.add(target);
    }
  }
  return [...targets].sort();
}

function migrationMetadata(migration: Migration): MigrationMetadata {
  return {
    schema_version: migration.schema_version,
    id: migration.id,
    order: migration.order,
    owner: migration.owner,
    description: migration.description,
    sql_file: migration.sql_file,
    verify_sql: migration.verify_sql,
    compatibility: migration.compatibility,
    requirements: migration.requirements,
  };
}

export function validateMigrationPlan(
  migrations: readonly Migration[],
  owners: ReadonlyMap<string, MigrationOwner>,
): void {
  const identities = new Set<string>();
  const orders = new Set<number>();
  const sorted = [...migrations].sort(
    (left, right) => left.order - right.order,
  );

  for (const [index, migration] of sorted.entries()) {
    const metadata = migrationMetadata(migration);
    assertSchema(MigrationMetadataSchema, metadata, migration.source);
    if (migration.order !== index + 1 || orders.has(migration.order)) {
      throw new MigrationError(
        "MIGRATION_ORDER_INVALID",
        `${migration.id} must occupy contiguous order ${String(index + 1)}`,
      );
    }
    if (identities.has(migration.id)) {
      throw new MigrationError(
        "MIGRATION_ORDER_INVALID",
        `duplicate migration identity ${migration.id}`,
      );
    }
    if (Number(migration.id.slice(0, 4)) !== migration.order) {
      throw new MigrationError(
        "MIGRATION_ORDER_INVALID",
        `${migration.id} does not encode order ${String(migration.order)}`,
      );
    }
    orders.add(migration.order);
    identities.add(migration.id);

    const owner = owners.get(migration.owner);
    if (!owner) {
      throw new MigrationError(
        "MIGRATION_OWNER_INVALID",
        `${migration.id} names undeclared owner ${migration.owner}`,
      );
    }
    const invalidTarget = tableTargets(migration.sql).find(
      (target) =>
        !owner.table_prefixes.some((prefix) => target.startsWith(prefix)),
    );
    if (invalidTarget) {
      throw new MigrationError(
        "MIGRATION_OWNER_INVALID",
        `${migration.id} owner ${migration.owner} cannot write ${invalidTarget}`,
      );
    }
    if (destructiveSql.test(migration.sql)) {
      throw new MigrationError(
        "SCHEMA_INCOMPATIBLE",
        `${migration.id} contains a destructive current-release change`,
      );
    }
    const verification = migration.verify_sql.trim();
    if (
      !/^select\b/iu.test(verification) ||
      mutatingVerificationSql.test(verification)
    ) {
      throw new MigrationError(
        "SCHEMA_INCOMPATIBLE",
        `${migration.id} verification query must be read-only`,
      );
    }
    const expectedChecksum = calculateMigrationChecksum(
      metadata,
      migration.sql,
    );
    if (migration.checksum !== expectedChecksum) {
      throw new MigrationError(
        "MIGRATION_METADATA_INVALID",
        `${migration.id} checksum does not match its metadata and SQL`,
      );
    }
  }
}

export async function loadMigrationPlan(
  workspaceRoot: string,
): Promise<MigrationPlan> {
  const packagesRoot = path.join(workspaceRoot, "packages");
  const packageEntries = await readdir(packagesRoot, { withFileTypes: true });
  const owners = new Map<string, MigrationOwner>();
  const migrations: Migration[] = [];

  for (const packageEntry of packageEntries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const migrationDirectory = path.join(
      packagesRoot,
      packageEntry.name,
      "migrations",
    );
    let entries;
    try {
      entries = await readdir(migrationDirectory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    const ownerPath = path.join(migrationDirectory, "owner.json");
    let ownerValue: unknown;
    try {
      ownerValue = JSON.parse(await readFile(ownerPath, "utf8"));
    } catch (error) {
      throw new MigrationError(
        "MIGRATION_METADATA_INVALID",
        `${path.relative(workspaceRoot, ownerPath)}: ${(error as Error).message}`,
        { cause: error },
      );
    }
    assertSchema(
      MigrationOwnerSchema,
      ownerValue,
      path.relative(workspaceRoot, ownerPath),
    );
    if (owners.has(ownerValue.module)) {
      throw new MigrationError(
        "MIGRATION_OWNER_INVALID",
        `duplicate owner declaration ${ownerValue.module}`,
      );
    }
    owners.set(ownerValue.module, ownerValue);

    for (const entry of entries
      .filter(
        (candidate) =>
          candidate.isFile() && candidate.name.endsWith(".migration.json"),
      )
      .sort((left, right) => left.name.localeCompare(right.name))) {
      const metadataPath = path.join(migrationDirectory, entry.name);
      let metadataValue: unknown;
      try {
        metadataValue = JSON.parse(await readFile(metadataPath, "utf8"));
      } catch (error) {
        throw new MigrationError(
          "MIGRATION_METADATA_INVALID",
          `${path.relative(workspaceRoot, metadataPath)}: ${(error as Error).message}`,
          { cause: error },
        );
      }
      assertSchema(
        MigrationMetadataSchema,
        metadataValue,
        path.relative(workspaceRoot, metadataPath),
      );
      if (metadataValue.owner !== ownerValue.module) {
        throw new MigrationError(
          "MIGRATION_OWNER_INVALID",
          `${metadataValue.id} is stored under ${ownerValue.module} but declares ${metadataValue.owner}`,
        );
      }
      const sqlPath = path.join(migrationDirectory, metadataValue.sql_file);
      const sql = await readFile(sqlPath, "utf8");
      const checksum = calculateMigrationChecksum(metadataValue, sql);
      migrations.push({
        ...metadataValue,
        sql,
        checksum,
        source: path
          .relative(workspaceRoot, metadataPath)
          .replaceAll("\\", "/"),
      });
    }
  }

  migrations.sort((left, right) => left.order - right.order);
  validateMigrationPlan(migrations, owners);
  return {
    migrations,
    owners,
    digest: sha256(
      migrations.map(({ id, checksum }) => `${id}:${checksum}`).join("\n"),
    ),
    head: migrations.at(-1)?.id ?? null,
  };
}

export function createDatabase(databaseUrl: string): Kysely<MigrationDatabase> {
  return new Kysely<MigrationDatabase>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: databaseUrl }),
    }),
  });
}

export async function connectMigrationSession(
  databaseUrl: string,
): Promise<MigrationSession> {
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });
  const client = await pool.connect();
  let released = false;
  return {
    query: <R extends Record<string, unknown>>(
      text: string,
      values?: readonly unknown[],
    ) => client.query<R>(text, values ? [...values] : undefined),
    release: async () => {
      if (released) return;
      released = true;
      client.release();
      await pool.end();
    },
  };
}

function safeFailureCode(error: unknown): string {
  if (error instanceof MigrationError) return error.code;
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && /^[A-Z0-9_]{1,64}$/u.test(code)
    ? code
    : "MIGRATION_STATEMENT_FAILED";
}

async function journalExists(session: MigrationSession): Promise<boolean> {
  const result = await session.query<{ journal: string | null }>(
    "select to_regclass('public.platform_migration_journal')::text as journal",
  );
  return result.rows[0]?.journal !== null;
}

async function currentHead(session: MigrationSession): Promise<string | null> {
  if (!(await journalExists(session))) return null;
  const result = await session.query<{ migration_id: string }>(
    "select migration_id from platform_migration_journal where outcome = 'applied' order by migration_order desc limit 1",
  );
  return result.rows[0]?.migration_id ?? null;
}

async function appliedMigration(
  session: MigrationSession,
  id: string,
): Promise<MigrationJournalRow | undefined> {
  if (!(await journalExists(session))) return undefined;
  const result = await session.query<MigrationJournalRow>(
    "select migration_id, checksum from platform_migration_journal where migration_id = $1 and outcome = 'applied'",
    [id],
  );
  return result.rows[0];
}

async function retainFailure(
  session: MigrationSession,
  migration: Migration,
  occurredAt: string,
  error: unknown,
): Promise<void> {
  if (!(await journalExists(session))) return;
  await session.query(
    "insert into platform_migration_journal (migration_order, migration_id, owner, checksum, outcome, occurred_at, failure_code) values ($1, $2, $3, $4, 'failed', $5, $6)",
    [
      migration.order,
      migration.id,
      migration.owner,
      migration.checksum,
      occurredAt,
      safeFailureCode(error),
    ],
  );
}

export async function runMigrations(
  options: RunMigrationsOptions,
): Promise<MigrationResult> {
  validateMigrationPlan(options.plan.migrations, options.plan.owners);
  const authority: { actor?: unknown; authorityVersion?: unknown } =
    options.authority;
  if (
    authority.actor !== "release-operator" ||
    authority.authorityVersion !== 1
  ) {
    throw new MigrationError(
      "MIGRATION_AUTHORITY_INVALID",
      "an active release-operator authority at version 1 is required",
    );
  }
  const now = options.now ?? (() => new Date());
  const session = await (options.connect ?? connectMigrationSession)(
    options.databaseUrl,
  );
  let locked = false;
  try {
    await session.query("select pg_advisory_lock($1)", [advisoryLockKey]);
    locked = true;
    const previousHead = await currentHead(session);
    if (
      Object.hasOwn(options.authority, "expectedHead") &&
      options.authority.expectedHead !== previousHead
    ) {
      throw new MigrationError(
        "STALE_MIGRATION_HEAD",
        `expected ${options.authority.expectedHead ?? "empty"}; found ${previousHead ?? "empty"}`,
      );
    }
    const applied: MigrationApplied[] = [];
    for (const migration of options.plan.migrations) {
      const existing = await appliedMigration(session, migration.id);
      if (existing) {
        if (existing.checksum !== migration.checksum) {
          throw new MigrationError(
            "SCHEMA_INCOMPATIBLE",
            `${migration.id} differs from the immutable applied checksum`,
          );
        }
        continue;
      }
      const occurredAt = now().toISOString();
      try {
        await session.query("begin");
        await session.query(migration.sql);
        const verification = await session.query(migration.verify_sql);
        if ((verification.rowCount ?? 0) < 1) {
          throw new MigrationError(
            "MIGRATION_APPLY_FAILED",
            `${migration.id} verification returned no rows`,
          );
        }
        await session.query(
          "insert into platform_migration_journal (migration_order, migration_id, owner, checksum, outcome, occurred_at) values ($1, $2, $3, $4, 'applied', $5)",
          [
            migration.order,
            migration.id,
            migration.owner,
            migration.checksum,
            occurredAt,
          ],
        );
        await session.query("commit");
      } catch (error) {
        await session.query("rollback");
        await retainFailure(session, migration, occurredAt, error);
        throw new MigrationError(
          "MIGRATION_APPLY_FAILED",
          `${migration.id} rolled back; failure ${safeFailureCode(error)} was retained`,
          { cause: error },
        );
      }
      applied.push({
        name: "MigrationApplied",
        version: 1,
        migrationId: migration.id,
        order: migration.order,
        owner: migration.owner,
        checksum: migration.checksum,
        occurredAt,
      });
    }
    return {
      status: applied.length > 0 ? "applied" : "noop",
      planDigest: options.plan.digest,
      previousHead,
      head: await currentHead(session),
      applied,
    };
  } finally {
    if (locked) {
      await session.query("select pg_advisory_unlock($1)", [advisoryLockKey]);
    }
    await session.release();
  }
}

export function asMigrationSession(client: PoolClient): MigrationSession {
  return client;
}
