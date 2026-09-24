import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const expectedNodeMajor = 24;
const expectedPnpmVersion = "11.19.0";

export function prerequisiteCommands() {
  return [
    ["docker", ["version", "--format", "{{.Server.Version}}"]],
    ["docker", ["compose", "version"]],
  ];
}

export function bootstrapCommands() {
  return [
    ["pnpm", ["install", "--frozen-lockfile"]],
    ["pnpm", ["config:validate"]],
    ["pnpm", ["infra:up"]],
    ["pnpm", ["health:check", "--process", "api"]],
    ["pnpm", ["health:check", "--process", "worker"]],
    ["pnpm", ["health:check", "--process", "migration"]],
  ];
}

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error || result.status !== 0) {
    const detail = options.capture
      ? `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
      : "see command output above";
    throw new Error(
      `BOOTSTRAP_PREREQUISITE_FAILED: ${command} ${arguments_.join(" ")}; ${detail || result.error?.message || "command failed"}`,
    );
  }
  return `${result.stdout ?? ""}`.trim();
}

export function validateHost() {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor !== expectedNodeMajor) {
    throw new Error(
      `BOOTSTRAP_PREREQUISITE_FAILED: Node.js ${expectedNodeMajor}.x is required; found ${process.versions.node}`,
    );
  }
  const pnpmVersion = run("pnpm", ["--version"], { capture: true });
  if (pnpmVersion !== expectedPnpmVersion) {
    throw new Error(
      `BOOTSTRAP_PREREQUISITE_FAILED: pnpm ${expectedPnpmVersion} is required; found ${pnpmVersion}`,
    );
  }
  for (const [command, arguments_] of prerequisiteCommands()) {
    run(command, arguments_, { capture: true });
  }
}

export function bootstrap() {
  validateHost();
  for (const [command, arguments_] of bootstrapCommands()) {
    console.log(`BOOTSTRAP_STEP: ${command} ${arguments_.join(" ")}`);
    run(command, arguments_);
  }
  console.log(
    "BOOTSTRAP_READY: PostgreSQL 127.0.0.1:5432; MinIO 127.0.0.1:9000; Mailpit 127.0.0.1:1025. Named volumes were preserved.",
  );
}

if (
  import.meta.url === pathToFileURL(process.argv[1] ? process.argv[1] : "").href
) {
  try {
    bootstrap();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "BOOTSTRAP_FAILED");
    process.exitCode = 1;
  }
}
