import { TestDatabase } from "@docket/testkit";
import { afterEach, describe, expect, it } from "vitest";
import { runMigrationProcess } from "./index.js";

const databases: TestDatabase[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.stop()));
});

describe("migration release process", () => {
  it("runs migrations through the explicit release process", async () => {
    const database = await TestDatabase.start({ migrate: false });
    databases.push(database);

    const result = await runMigrationProcess(
      {
        DOCKET_ENV: "test",
        DOCKET_DATABASE_URL: database.databaseUrl,
      },
      process.cwd(),
    );
    const journal = await database.query<{ applied: number }>(
      "select count(*)::integer as applied from platform_migration_journal where outcome = 'applied'",
    );

    expect(result.status).toBe("applied");
    expect(result.applied).toHaveLength(1);
    expect(journal.rows[0]?.applied).toBe(1);
  }, 120_000);
});
