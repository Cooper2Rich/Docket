import { spawnSync } from "node:child_process";

const arguments_ = [
  "compose",
  "--project-name",
  "docket-local",
  "--file",
  "compose.yaml",
  "down",
  "--volumes",
  "--remove-orphans",
];

const result = spawnSync("docker", arguments_, {
  cwd: process.cwd(),
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error || result.status !== 0) {
  console.error(
    `INFRA_RESET_FAILED: only Docker Compose project docket-local was targeted; ${result.error?.message ?? "see command output"}`,
  );
  process.exitCode = result.status || 1;
} else {
  console.log(
    "INFRA_RESET_COMPLETE: removed only docket-local containers, networks, and named volumes.",
  );
}
