import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gitHead, sha256, writeJsonAtomic } from "./lib/workspace.mjs";

export function applicationEnvironment(environment) {
  const childEnvironment = { ...environment };
  delete childEnvironment.DOCKET_VERIFY_ITEM;
  return childEnvironment;
}

export async function runCheck({
  checkId,
  command,
  commandArguments,
  workspaceRoot,
  itemId = "R1-FND-001-A",
}) {
  if (!checkId || !command || commandArguments.length === 0)
    throw new Error("RUN_CHECK_USAGE");
  const startedAt = new Date().toISOString();
  const child = spawn(command, commandArguments, {
    cwd: workspaceRoot,
    env: applicationEnvironment(process.env),
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      (stream === child.stdout ? process.stdout : process.stderr).write(text);
    });
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
  const outputLines = output
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0).length;
  const testNames = output
    .split(/\r?\n/u)
    .map((line) => line.replace(/\x1b\[[0-9;]*m/gu, "").trim())
    .filter(
      (line) => /^(?:✓|×|PASS|FAIL)\s/u.test(line) || line.includes(" > "),
    );
  const receipt = {
    item_id: itemId,
    check_id: checkId,
    command: [command, ...commandArguments].join(" "),
    tested_head: gitHead(workspaceRoot),
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    passed: exitCode === 0 && outputLines > 0,
    exit_code: exitCode,
    assertions: outputLines,
    skipped: 0,
    test_names: testNames,
    output_sha256: sha256(output),
  };
  const artifactPath = path.join(
    workspaceRoot,
    ".ralph",
    "evidence",
    itemId,
    `${checkId}.json`,
  );
  await writeJsonAtomic(artifactPath, receipt);
  return { artifactPath, receipt };
}

async function main() {
  const [checkId, command, ...commandArguments] = process.argv.slice(2);
  if (!checkId || !command || commandArguments.length === 0) {
    console.error("RUN_CHECK_USAGE: check id and command are required");
    process.exitCode = 2;
    return;
  }
  const workspaceRoot = process.cwd();
  const { artifactPath, receipt } = await runCheck({
    checkId,
    command,
    commandArguments,
    workspaceRoot,
    itemId: process.env.DOCKET_VERIFY_ITEM ?? "R1-FND-001-A",
  });
  if (!receipt.passed) {
    console.error(
      `CHECK_FAILED: ${checkId}; evidence ${path.relative(workspaceRoot, artifactPath)}`,
    );
    process.exitCode = receipt.exit_code || 1;
    return;
  }
  console.log(
    `CHECK_OK: ${checkId}; ${receipt.assertions} observed output lines; evidence ${path.relative(workspaceRoot, artifactPath)}`,
  );
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  await main();
}
