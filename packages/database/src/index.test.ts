import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadMigrationPlan,
  MigrationError,
  validateMigrationPlan,
  type Migration,
} from "./index.js";

const workspaceRoot = path.resolve(import.meta.dirname, "../../..");

async function baseMigration(): Promise<{
  migration: Migration;
  owners: Awaited<ReturnType<typeof loadMigrationPlan>>["owners"];
}> {
  const plan = await loadMigrationPlan(workspaceRoot);
  const migration = plan.migrations[0];
  if (!migration) throw new Error("expected the journal migration");
  return { migration, owners: plan.owners };
}

function expectCode(action: () => void, code: string): void {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(MigrationError);
    expect((error as MigrationError).code).toBe(code);
    return;
  }
  throw new Error(`expected ${code}`);
}

describe("module-owned migration plan", () => {
  it("loads one ordered migration and every package-local owner declaration", async () => {
    const plan = await loadMigrationPlan(workspaceRoot);

    expect(plan.migrations.map(({ id }) => id)).toEqual([
      "0001_platform_migration_journal",
    ]);
    expect(plan.head).toBe("0001_platform_migration_journal");
    expect(plan.owners.size).toBe(10);
    expect(plan.digest).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("rejects a cross-owner write before application startup", async () => {
    const { migration, owners } = await baseMigration();
    const crossOwner: Migration = {
      ...migration,
      sql: "create table schools_intrusion (id text primary key);",
    };

    expectCode(() => {
      validateMigrationPlan([crossOwner], owners);
    }, "MIGRATION_OWNER_INVALID");
  });

  it("rejects duplicate order and identity metadata", async () => {
    const { migration, owners } = await baseMigration();
    const duplicate: Migration = {
      ...migration,
      source: "synthetic-duplicate.migration.json",
    };

    expectCode(() => {
      validateMigrationPlan([migration, duplicate], owners);
    }, "MIGRATION_ORDER_INVALID");
  });

  it("rejects destructive and mutating verification SQL", async () => {
    const { migration, owners } = await baseMigration();
    const destructive: Migration = {
      ...migration,
      sql: "drop table platform_migration_journal;",
    };
    const mutatingVerification: Migration = {
      ...migration,
      verify_sql: "delete from platform_migration_journal returning event_id",
    };

    expectCode(() => {
      validateMigrationPlan([destructive], owners);
    }, "SCHEMA_INCOMPATIBLE");
    expectCode(() => {
      validateMigrationPlan([mutatingVerification], owners);
    }, "SCHEMA_INCOMPATIBLE");
  }, 30_000);

  it("keeps schema mutation out of API and worker startup", async () => {
    const manifests = await Promise.all(
      ["apps/api/package.json", "apps/worker/package.json"].map(
        async (relativePath) =>
          JSON.parse(
            await readFile(path.join(workspaceRoot, relativePath), "utf8"),
          ) as { dependencies?: Record<string, string> },
      ),
    );
    const [apiSource, workerSource] = await Promise.all([
      readFile(path.join(workspaceRoot, "apps/api/src/server.ts"), "utf8"),
      readFile(path.join(workspaceRoot, "apps/worker/src/index.ts"), "utf8"),
    ]);

    expect(
      manifests.every(
        ({ dependencies }) => !("@docket/database" in (dependencies ?? {})),
      ),
    ).toBe(true);
    expect(`${apiSource}\n${workerSource}`).not.toMatch(
      /runMigrations|loadMigrationPlan|\bmigrate\b/u,
    );
  });
});
