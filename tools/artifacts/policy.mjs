import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../lib/workspace.mjs";

export const REQUIRED_ARTIFACT_INPUTS = Object.freeze([
  "apps/api/dist",
  "apps/worker/dist",
  "apps/migrate/dist",
  "apps/web/build/server",
  "apps/web/build/client",
  "packages/database/migrations",
]);

const forbiddenExtensions = new Set([".env", ".key", ".pem", ".p12", ".pfx"]);

export class ArtifactPolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ArtifactPolicyError";
    this.code = code;
  }
}

async function filesBelow(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory())
      files.push(...(await filesBelow(absolute, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

function portable(file) {
  return file.replaceAll(path.sep, "/");
}

export async function createArtifactBundle(
  workspaceRoot,
  { outputDirectory = path.join(workspaceRoot, "build-artifacts") } = {},
) {
  const root = path.resolve(workspaceRoot);
  const output = path.resolve(outputDirectory);
  if (output !== path.join(root, "build-artifacts")) {
    throw new ArtifactPolicyError(
      "ARTIFACT_OUTPUT_INVALID",
      "artifact output must be the workspace build-artifacts directory",
    );
  }

  const inputs = [];
  for (const relative of REQUIRED_ARTIFACT_INPUTS) {
    const source = path.join(root, relative);
    let sourceFiles;
    try {
      sourceFiles = await filesBelow(source);
    } catch {
      throw new ArtifactPolicyError("REQUIRED_ARTIFACT_MISSING", relative);
    }
    if (sourceFiles.length === 0) {
      throw new ArtifactPolicyError("REQUIRED_ARTIFACT_MISSING", relative);
    }
    inputs.push({ relative, source, sourceFiles });
  }

  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const { relative, source } of inputs) {
    await cp(source, path.join(output, relative), { recursive: true });
  }

  const files = (await filesBelow(output)).sort();
  const forbidden = files.filter((file) =>
    forbiddenExtensions.has(path.extname(file).toLowerCase()),
  );
  if (forbidden.length > 0) {
    await rm(output, { recursive: true, force: true });
    throw new ArtifactPolicyError(
      "SECRET_BEARING_ARTIFACT",
      forbidden.map(portable).join(", "),
    );
  }

  const manifestEntries = [];
  for (const file of files) {
    const absolute = path.join(output, file);
    const [content, metadata] = await Promise.all([
      readFile(absolute),
      stat(absolute),
    ]);
    manifestEntries.push({
      path: portable(file),
      bytes: metadata.size,
      sha256: sha256(content),
    });
  }
  const manifest = {
    schema_version: 1,
    algorithm: "sha256",
    inputs: REQUIRED_ARTIFACT_INPUTS,
    files: manifestEntries,
  };
  await writeFile(
    path.join(output, "sha256-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return manifest;
}
