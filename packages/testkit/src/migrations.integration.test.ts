import {
  calculateMigrationChecksum,
  createDatabase,
  loadMigrationPlan,
  MigrationError,
  runMigrations,
  type MigrationMetadata,
  type MigrationPlan,
} from "@docket/database";
import { afterEach, describe, expect, it } from "vitest";
import { TestDatabase } from "./index.js";

const databases: TestDatabase[] = [];

async function emptyDatabase(): Promise<TestDatabase> {
  const database = await TestDatabase.start({ migrate: false });
  databases.push(database);
  return database;
}

async function plan(): Promise<MigrationPlan> {
  return loadMigrationPlan(process.cwd());
}

function failingPlan(base: MigrationPlan): MigrationPlan {
  const metadata: MigrationMetadata = {
    schema_version: 1,
    id: "0002_platform_rollback_probe",
    order: 2,
    owner: "database",
    description: "Prove rollback and durable failure evidence",
    sql_file: "0002_platform_rollback_probe.sql",
    verify_sql: "select 1 where false",
    compatibility: "additive",
    requirements: ["R1-DATA-001", "R1-CONS-001", "R1-OPS-001"],
  };
  const sql = "create table platform_rollback_probe (id text primary key);";
  const migration = {
    ...metadata,
    sql,
    checksum: calculateMigrationChecksum(metadata, sql),
    source: "synthetic/0002_platform_rollback_probe.migration.json",
  };
  return {
    migrations: [...base.migrations, migration],
    owners: base.owners,
    digest: "synthetic-failing-plan",
    head: migration.id,
  };
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.stop()));
});

describe("PostgreSQL migration boundary", () => {
  it("migrates an empty database once and treats an equivalent retry as a no-op", async () => {
    const database = await emptyDatabase();
    const migrationPlan = await plan();

    const first = await runMigrations({
      databaseUrl: database.databaseUrl,
      plan: migrationPlan,
      authority: { actor: "release-operator", authorityVersion: 1 },
    });
    const retry = await runMigrations({
      databaseUrl: database.databaseUrl,
      plan: migrationPlan,
      authority: {
        actor: "release-operator",
        authorityVersion: 1,
        expectedHead: migrationPlan.head,
      },
    });
    const journal = await database.query<{ applied: number }>(
      "select count(*)::integer as applied from platform_migration_journal where outcome = 'applied'",
    );

    expect(first.status).toBe("applied");
    expect(first.applied).toHaveLength(1);
    expect(first.applied[0]?.name).toBe("MigrationApplied");
    expect(retry).toMatchObject({ status: "noop", applied: [] });
    expect(journal.rows[0]?.applied).toBe(1);
  }, 120_000);

  it("serializes equivalent concurrent migration attempts without double application", async () => {
    const database = await emptyDatabase();
    const migrationPlan = await plan();
    const options = {
      databaseUrl: database.databaseUrl,
      plan: migrationPlan,
      authority: {
        actor: "release-operator" as const,
        authorityVersion: 1 as const,
      },
    };

    const results = await Promise.all([
      runMigrations(options),
      runMigrations(options),
    ]);
    const journal = await database.query<{ applied: number }>(
      "select count(*)::integer as applied from platform_migration_journal where outcome = 'applied'",
    );

    expect(results.map(({ status }) => status).sort()).toEqual([
      "applied",
      "noop",
    ]);
    expect(journal.rows[0]?.applied).toBe(1);
  }, 120_000);

  it("rolls back a failed migration and retains immutable failure evidence", async () => {
    const database = await emptyDatabase();
    const base = await plan();
    await runMigrations({
      databaseUrl: database.databaseUrl,
      plan: base,
      authority: { actor: "release-operator", authorityVersion: 1 },
    });

    await expect(
      runMigrations({
        databaseUrl: database.databaseUrl,
        plan: failingPlan(base),
        authority: {
          actor: "release-operator",
          authorityVersion: 1,
          expectedHead: base.head,
        },
      }),
    ).rejects.toMatchObject({ code: "MIGRATION_APPLY_FAILED" });

    const rollback = await database.query<{
      probe: string | null;
      failures: number;
    }>(
      "select to_regclass('public.platform_rollback_probe')::text as probe, (select count(*)::integer from platform_migration_journal where migration_id = '0002_platform_rollback_probe' and outcome = 'failed') as failures",
    );
    expect(rollback.rows[0]).toEqual({ probe: null, failures: 1 });
    await expect(
      database.query(
        "delete from platform_migration_journal where migration_id = '0002_platform_rollback_probe'",
      ),
    ).rejects.toMatchObject({ code: "55000" });
  }, 120_000);

  it("denies invalid authority and rejects one stale conflicting concurrent action", async () => {
    const migrationPlan = await plan();
    await expect(
      runMigrations({
        databaseUrl: "postgresql://unused.invalid/docket",
        plan: migrationPlan,
        authority: {
          actor: "release-operator",
          authorityVersion: 2,
        } as never,
      }),
    ).rejects.toMatchObject({ code: "MIGRATION_AUTHORITY_INVALID" });

    const database = await emptyDatabase();
    const options = {
      databaseUrl: database.databaseUrl,
      plan: migrationPlan,
      authority: {
        actor: "release-operator" as const,
        authorityVersion: 1 as const,
        expectedHead: null,
      },
    };
    const outcomes = await Promise.allSettled([
      runMigrations(options),
      runMigrations(options),
    ]);
    const fulfilled = outcomes.filter(({ status }) => status === "fulfilled");
    const rejected = outcomes.filter(({ status }) => status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      MigrationError,
    );
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
      code: "STALE_MIGRATION_HEAD",
    });
  }, 120_000);

  it("exposes the migrated journal through the pinned Kysely database seam", async () => {
    const database = await emptyDatabase();
    await runMigrations({
      databaseUrl: database.databaseUrl,
      plan: await plan(),
      authority: { actor: "release-operator", authorityVersion: 1 },
    });
    const queryBuilder = createDatabase(database.databaseUrl);
    try {
      const rows = await queryBuilder
        .selectFrom("platform_migration_journal")
        .select(["migration_id", "owner", "outcome"])
        .execute();
      expect(rows).toEqual([
        {
          migration_id: "0001_platform_migration_journal",
          owner: "database",
          outcome: "applied",
        },
      ]);
    } finally {
      await queryBuilder.destroy();
    }
  }, 120_000);
});
