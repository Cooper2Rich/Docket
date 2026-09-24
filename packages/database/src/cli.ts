import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadMigrationPlan } from "./index.js";

export async function runMigrationCheck(
  workspaceRoot = process.cwd(),
): Promise<void> {
  const plan = await loadMigrationPlan(workspaceRoot);
  console.log(
    `MIGRATION_PLAN_OK: ${String(plan.migrations.length)} ordered migrations; head ${plan.head ?? "empty"}; digest ${plan.digest}`,
  );
}

if (
  import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? "")).href
) {
  const command = process.argv[2];
  if (command !== "check") {
    console.error("MIGRATION_CLI_USAGE: expected check");
    process.exitCode = 2;
  } else {
    try {
      await runMigrationCheck();
    } catch (error) {
      console.error((error as Error).message);
      process.exitCode = 1;
    }
  }
}
