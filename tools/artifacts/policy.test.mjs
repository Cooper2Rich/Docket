import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createArtifactBundle, REQUIRED_ARTIFACT_INPUTS } from "./policy.mjs";

async function syntheticWorkspace() {
  const root = await mkdtemp(path.join(tmpdir(), "docket-artifacts-"));
  for (const relative of REQUIRED_ARTIFACT_INPUTS) {
    const directory = path.join(root, relative);
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "output.js"),
      `export default ${JSON.stringify(relative)};\n`,
    );
  }
  return root;
}

describe("deployable artifact policy", () => {
  it("hashes distinct server, worker, migration, and rendered-web outputs", async () => {
    const root = await syntheticWorkspace();
    const manifest = await createArtifactBundle(root);
    expect(manifest.inputs).toEqual(REQUIRED_ARTIFACT_INPUTS);
    expect(manifest.files).toHaveLength(REQUIRED_ARTIFACT_INPUTS.length);
    expect(
      manifest.files.every(({ sha256 }) => /^[a-f0-9]{64}$/u.test(sha256)),
    ).toBe(true);
    await expect(
      readFile(
        path.join(root, "build-artifacts", "sha256-manifest.json"),
        "utf8",
      ),
    ).resolves.toContain('"algorithm": "sha256"');
  });

  it("fails when any required evidence output is omitted", async () => {
    const root = await syntheticWorkspace();
    const missing = path.join(root, REQUIRED_ARTIFACT_INPUTS[0]);
    const { rm } = await import("node:fs/promises");
    await rm(missing, { recursive: true });
    await expect(createArtifactBundle(root)).rejects.toMatchObject({
      code: "REQUIRED_ARTIFACT_MISSING",
    });
  });

  it("rejects secret-bearing file types", async () => {
    const root = await syntheticWorkspace();
    await writeFile(
      path.join(root, REQUIRED_ARTIFACT_INPUTS[0], "server.pem"),
      "fixture",
    );
    await expect(createArtifactBundle(root)).rejects.toMatchObject({
      code: "SECRET_BEARING_ARTIFACT",
    });
  });
});
