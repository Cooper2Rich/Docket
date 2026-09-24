import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadMigrationPlan, runMigrations } from "@docket/database";
import { parseRuntimeConfig } from "@docket/runtime";

export function validateMigrationRuntime(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return parseRuntimeConfig("migration", environment);
}

export const migrationRunnerStatus = {
  command: "migrate",
  available: true,
  owningWorkItem: "R1-FND-003-A",
} as const;

export async function runMigrationProcess(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  workspaceRoot = process.cwd(),
) {
  const config = validateMigrationRuntime(environment);
  if (!config.databaseUrl)
    throw new Error("CONFIG_INVALID: DOCKET_DATABASE_URL");
  const plan = await loadMigrationPlan(workspaceRoot);
  return runMigrations({
    databaseUrl: config.databaseUrl,
    plan,
    authority: { actor: "release-operator", authorityVersion: 1 },
  });
}

if (
  import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? "")).href
) {
  try {
    const result = await runMigrationProcess();
    console.log(
      `MIGRATION_OK: ${result.status}; ${String(result.applied.length)} applied; head ${result.head ?? "empty"}`,
    );
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}
