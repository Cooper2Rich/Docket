import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function sha256File(filePath) {
  return sha256(await readFile(filePath));
}

export function applicationEnvironment(environment) {
  const childEnvironment = { ...environment };
  delete childEnvironment.DOCKET_PR_NUMBER;
  delete childEnvironment.DOCKET_VERIFY_ITEM;
  return childEnvironment;
}

export function gitHead(workspaceRoot) {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: workspaceRoot,
    encoding: "utf8",
  }).trim();
}

export async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export function repositoryRoot(importMetaUrl) {
  return path.resolve(path.dirname(new URL(importMetaUrl).pathname), "../..");
}
