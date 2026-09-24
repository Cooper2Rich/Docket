import { parseRuntimeConfig } from "@docket/runtime";

export function validateMigrationRuntime(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return parseRuntimeConfig("migration", environment);
}

export const migrationRuntimeConfig = validateMigrationRuntime();

export const migrationRunnerStatus = {
  command: "migrate",
  available: false,
  owningWorkItem: "R1-FND-002-A",
} as const;
