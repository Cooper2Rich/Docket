import path from "node:path";
import { pathToFileURL } from "node:url";
import { CiPolicyError, validateRequiredWorkflowFile } from "./policy.mjs";

export async function runCiCheck(
  workspaceRoot,
  {
    stdout = (message) => console.log(message),
    stderr = (message) => console.error(message),
  } = {},
) {
  try {
    const result = await validateRequiredWorkflowFile(workspaceRoot);
    stdout(
      `CI_POLICY_OK: ${result.checkNames.length} exact required contexts; ${result.actionPins.length} immutable action uses`,
    );
    return 0;
  } catch (error) {
    const code =
      error instanceof CiPolicyError ? error.code : "CI_CHECK_FAILED";
    stderr(`${code}: ${error.message}`);
    return 1;
  }
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  process.exitCode = await runCiCheck(process.cwd());
}
