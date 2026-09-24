import { afterEach, describe, expect, it } from "vitest";
import { TestDatabase, withTestDatabase } from "./index.js";

const databases: TestDatabase[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map((database) => database.stop()));
});

describe("isolated PostgreSQL test databases", () => {
  it("isolates concurrently running suites in separate real databases", async () => {
    const [first, second] = await Promise.all([
      TestDatabase.start({ migrate: false }),
      TestDatabase.start({ migrate: false }),
    ]);
    databases.push(first, second);

    await first.query(
      "create table platform_first_suite_only (id text primary key)",
    );
    await first.query(
      "insert into platform_first_suite_only (id) values ('first')",
    );

    const firstRows = await first.query<{ count: number }>(
      "select count(*)::integer as count from platform_first_suite_only",
    );
    const secondRelation = await second.query<{ relation: string | null }>(
      "select to_regclass('public.platform_first_suite_only')::text as relation",
    );

    expect(first.databaseUrl).not.toBe(second.databaseUrl);
    expect(firstRows.rows).toEqual([{ count: 1 }]);
    expect(secondRelation.rows).toEqual([{ relation: null }]);
  });

  it("releases its real container when a test callback fails", async () => {
    let failedDatabase: TestDatabase | undefined;

    await expect(
      withTestDatabase({ migrate: false }, async (database) => {
        failedDatabase = database;
        await database.query(
          "create table platform_failed_suite_resource (id text primary key)",
        );
        throw new Error("synthetic failed test");
      }),
    ).rejects.toThrow("synthetic failed test");

    expect(failedDatabase?.stopped).toBe(true);
    await expect(failedDatabase?.query("select 1")).rejects.toThrow(
      "TEST_DATABASE_STOPPED",
    );
  });
});
