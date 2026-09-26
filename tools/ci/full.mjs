import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  applicationEnvironment,
  verificationEnvironment,
} from "../lib/workspace.mjs";

export const REQUIRED_LOCAL_COMMANDS = Object.freeze([
  ["install", "--frozen-lockfile"],
  ["build"],
  ["check"],
  ["test:unit"],
  ["test:integration"],
  ["test:e2e"],
  ["contracts", "check"],
  ["migration:check"],
  ["security:check"],
  ["accessibility:check"],
  ["artifacts:check"],
]);

const RECEIPT_PRODUCING_COMMANDS = new Set([
  "build",
  "check",
  "test:unit",
  "test:integration",
  "test:e2e",
  "contracts",
]);

export function environmentForFullCiCommand(environment, command) {
  return RECEIPT_PRODUCING_COMMANDS.has(command[0])
    ? verificationEnvironment(environment)
    : applicationEnvironment(environment);
}

async function spawnPnpm(workspaceRoot, arguments_, environment) {
  const pnpmCli = process.env.npm_execpath;
  const command = pnpmCli
    ? process.execPath
    : process.platform === "win32"
      ? "pnpm.cmd"
      : "pnpm";
  const child = spawn(
    command,
    pnpmCli ? [pnpmCli, ...arguments_] : arguments_,
    {
      cwd: workspaceRoot,
      env: environment,
      shell: process.platform === "win32" && !pnpmCli,
      windowsHide: true,
      stdio: "inherit",
    },
  );
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
}

export async function runFullCi(
  workspaceRoot,
  {
    run = spawnPnpm,
    stdout = (message) => console.log(message),
    environment = process.env,
  } = {},
) {
  let completed = 0;
  for (const command of REQUIRED_LOCAL_COMMANDS) {
    stdout(`CI_FULL_STEP: pnpm ${command.join(" ")}`);
    const exitCode = await run(
      workspaceRoot,
      command,
      environmentForFullCiCommand(environment, command),
    );
    if (exitCode !== 0) {
      throw new Error(
        `CI_FULL_FAILED: pnpm ${command.join(" ")} exited ${exitCode}`,
      );
    }
    completed += 1;
  }
  stdout(`CI_FULL_OK: ${completed} required commands passed serially`);
  return completed;
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  try {
    await runFullCi(process.cwd());
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
