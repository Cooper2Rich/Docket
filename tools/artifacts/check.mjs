import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { applicationEnvironment } from "../lib/workspace.mjs";
import { ArtifactPolicyError, createArtifactBundle } from "./policy.mjs";

async function runBuild(workspaceRoot) {
  const pnpmCli = process.env.npm_execpath;
  const command = pnpmCli
    ? process.execPath
    : process.platform === "win32"
      ? "pnpm.cmd"
      : "pnpm";
  const arguments_ = ["build"];
  const child = spawn(
    command,
    pnpmCli ? [pnpmCli, ...arguments_] : arguments_,
    {
      cwd: workspaceRoot,
      env: applicationEnvironment(process.env),
      shell: process.platform === "win32" && !pnpmCli,
      windowsHide: true,
      stdio: "inherit",
    },
  );
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0)
    throw new ArtifactPolicyError("ARTIFACT_BUILD_FAILED", `${exitCode}`);
}

export async function runArtifactCheck(
  workspaceRoot,
  {
    build = runBuild,
    stdout = (message) => console.log(message),
    stderr = (message) => console.error(message),
  } = {},
) {
  try {
    await build(workspaceRoot);
    const manifest = await createArtifactBundle(workspaceRoot);
    stdout(
      `ARTIFACTS_OK: ${manifest.files.length} deployable files hashed in build-artifacts/sha256-manifest.json`,
    );
    return 0;
  } catch (error) {
    const code =
      error instanceof ArtifactPolicyError
        ? error.code
        : (error.code ?? "ARTIFACT_CHECK_FAILED");
    stderr(`${code}: ${error.message}`);
    return 1;
  }
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  process.exitCode = await runArtifactCheck(process.cwd());
}
