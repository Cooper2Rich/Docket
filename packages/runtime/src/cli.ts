import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  createProcessHealth,
  dependencyProbes,
  parseRuntimeConfig,
  safeConfigSummary,
  type ProcessKind,
} from "./index.js";

function parseEnvironmentFile(contents: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [index, rawLine] of contents.split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/u.exec(line);
    if (!match?.[1] || match[2] === undefined) {
      throw new Error(
        `CONFIG_INVALID: malformed environment line ${String(index + 1)}`,
      );
    }
    values[match[1]] = match[2];
  }
  return values;
}

async function environmentSource(): Promise<
  Record<string, string | undefined>
> {
  let contents: string;
  try {
    contents = await readFile(path.resolve(".env"), "utf8");
  } catch {
    contents = await readFile(path.resolve(".env.example"), "utf8");
  }
  return { ...process.env, ...parseEnvironmentFile(contents) };
}

function processArgument(arguments_: readonly string[]): ProcessKind {
  const index = arguments_.indexOf("--process");
  const value = index >= 0 ? arguments_[index + 1] : undefined;
  if (
    value !== "api" &&
    value !== "worker" &&
    value !== "web" &&
    value !== "migration"
  ) {
    throw new Error(
      "CONFIG_INVALID: expected --process api|worker|web|migration",
    );
  }
  return value;
}

async function main(): Promise<void> {
  const [command, ...arguments_] = process.argv.slice(2);
  const source = await environmentSource();
  if (command === "config:validate") {
    const summaries = (["api", "worker", "web", "migration"] as const).map(
      (kind) => safeConfigSummary(parseRuntimeConfig(kind, source)),
    );
    console.log(`CONFIG_VALID: ${JSON.stringify(summaries)}`);
    return;
  }
  if (command === "health:check") {
    const kind = processArgument(arguments_);
    const config = parseRuntimeConfig(kind, source);
    const result = await createProcessHealth(
      kind,
      dependencyProbes(config),
    ).readiness();
    console.log(JSON.stringify(result));
    if (result.status !== "ready") process.exitCode = 1;
    return;
  }
  throw new Error("CONFIG_INVALID: expected config:validate or health:check");
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "CONFIG_INVALID");
  process.exitCode = 1;
});
