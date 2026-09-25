import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { validateRequiredWorkflowFile } from "../ci/policy.mjs";

const execFileAsync = promisify(execFile);

export class SecurityPolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SecurityPolicyError";
    this.code = code;
  }
}

const credentialPatterns = [
  ["AWS_ACCESS_KEY", /\bAKIA[0-9A-Z]{16}\b/u],
  ["GITHUB_TOKEN", /\bgh[opsu]_[A-Za-z0-9]{30,}\b/u],
  ["OPENAI_API_KEY", /\bsk-proj-[A-Za-z0-9_-]{20,}\b/u],
  ["CLERK_SECRET_KEY", /\bsk_(?:live|test)_[A-Za-z0-9]{24,}\b/u],
  ["PRIVATE_KEY", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u],
];

function isText(content) {
  return !content.subarray(0, 8_192).includes(0);
}

export function scanCredentialEntries(entries) {
  const findings = [];
  for (const { file, content } of entries) {
    if (!isText(content)) continue;
    const text = content.toString("utf8");
    for (const [kind, pattern] of credentialPatterns) {
      if (pattern.test(text)) findings.push({ file, kind });
    }
  }
  return findings;
}

export function auditSummary(report) {
  const counts = report?.metadata?.vulnerabilities ?? {};
  const high = Number(counts.high ?? 0);
  const critical = Number(counts.critical ?? 0);
  if (!Number.isInteger(high) || !Number.isInteger(critical)) {
    throw new SecurityPolicyError(
      "SECURITY_AUDIT_INVALID",
      "dependency audit did not report integer high and critical counts",
    );
  }
  return { high, critical, blocked: high + critical };
}

export async function trackedCredentialFindings(workspaceRoot) {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    cwd: workspaceRoot,
    encoding: "buffer",
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  const files = stdout.toString("utf8").split("\0").filter(Boolean);
  const entries = await Promise.all(
    files.map(async (file) => ({
      file,
      content: await readFile(path.join(workspaceRoot, file)),
    })),
  );
  return scanCredentialEntries(entries);
}

export async function validateStaticSecurity(workspaceRoot) {
  const findings = await trackedCredentialFindings(workspaceRoot);
  if (findings.length > 0) {
    throw new SecurityPolicyError(
      "CREDENTIAL_PATTERN_DETECTED",
      findings.map(({ file, kind }) => `${file}:${kind}`).join(", "),
    );
  }
  await validateRequiredWorkflowFile(workspaceRoot);
  return { scannedCredentials: true, immutableActions: true };
}
