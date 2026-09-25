import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { applicationEnvironment } from "../lib/workspace.mjs";
import {
  auditSummary,
  SecurityPolicyError,
  validateStaticSecurity,
} from "./policy.mjs";

async function dependencyAudit(workspaceRoot) {
  const pnpmCli = process.env.npm_execpath;
  const command = pnpmCli
    ? process.execPath
    : process.platform === "win32"
      ? "pnpm.cmd"
      : "pnpm";
  const arguments_ = ["audit", "--audit-level", "high", "--json"];
  const child = spawn(
    command,
    pnpmCli ? [pnpmCli, ...arguments_] : arguments_,
    {
      cwd: workspaceRoot,
      env: applicationEnvironment(process.env),
      shell: process.platform === "win32" && !pnpmCli,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    throw new SecurityPolicyError(
      "SECURITY_AUDIT_UNAVAILABLE",
      stderr.trim() || "pnpm audit returned no JSON report",
    );
  }
  const summary = auditSummary(report);
  if (summary.blocked > 0 || exitCode !== 0) {
    throw new SecurityPolicyError(
      "VULNERABLE_DEPENDENCY",
      `${summary.high} high and ${summary.critical} critical findings`,
    );
  }
  return summary;
}

export async function runSecurityCheck(
  workspaceRoot,
  {
    audit = dependencyAudit,
    stdout = (message) => console.log(message),
    stderr = (message) => console.error(message),
  } = {},
) {
  try {
    await validateStaticSecurity(workspaceRoot);
    const summary = await audit(workspaceRoot);
    stdout(
      `SECURITY_OK: credential and immutable-action scans passed; dependency audit found ${summary.high} high and ${summary.critical} critical vulnerabilities`,
    );
    return 0;
  } catch (error) {
    const code =
      error instanceof SecurityPolicyError
        ? error.code
        : (error.code ?? "SECURITY_CHECK_FAILED");
    stderr(`${code}: ${error.message}`);
    return 1;
  }
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  process.exitCode = await runSecurityCheck(process.cwd());
}
