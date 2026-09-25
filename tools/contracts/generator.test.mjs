import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { identityAccessContractSource } from "../../packages/identity-access/src/contracts.ts";
import { runContractsCli } from "./cli.mjs";
import {
  assertBackwardCompatible,
  checkArtifacts,
  ContractGenerationError,
  generateArtifacts,
  writeArtifacts,
} from "./generator.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

async function temporaryWorkspace() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "docket-contracts-"));
  temporaryDirectories.push(directory);
  return directory;
}

function expectContractError(action, code) {
  expect(action).toThrowError(ContractGenerationError);
  try {
    action();
  } catch (error) {
    expect(error).toMatchObject({ code });
  }
}

describe("module-owned contract generation", () => {
  it("produces every deterministic review artifact from the same source bytes", () => {
    const first = generateArtifacts([identityAccessContractSource]);
    const second = generateArtifacts([identityAccessContractSource]);

    expect([...first.artifacts]).toEqual([...second.artifacts]);
    expect([...first.artifacts.keys()].sort()).toEqual([
      "contracts/diagrams/identity-access-states.mmd",
      "contracts/json-schema/identity-access.v1.json",
      "contracts/matrices/identity-access-audiences.md",
      "contracts/matrices/identity-access-authorization.md",
      "contracts/matrices/identity-access-states.md",
      "contracts/openapi/v1.json",
      "contracts/reference/identity-access.md",
      "contracts/traceability.json",
      "contracts/vectors/index.json",
      "packages/contracts/src/generated.ts",
    ]);
    expect(
      JSON.parse(first.artifacts.get("contracts/traceability.json")),
    ).toMatchObject({
      schemaVersion: 1,
      requirements: {
        "R1-AUTH-001": {
          module: "identity-access",
          operations: ["getIdentitySession"],
        },
        "R1-PRIV-001": {
          module: "identity-access",
          operations: ["getIdentitySession"],
        },
      },
    });
  });

  it("writes atomically and reports changed source as contract drift", async () => {
    const workspace = await temporaryWorkspace();
    await writeArtifacts(workspace, [identityAccessContractSource]);
    await expect(
      checkArtifacts(workspace, [identityAccessContractSource]),
    ).resolves.toMatchObject({ sourceModules: ["identity-access"] });

    const changedSource = {
      ...identityAccessContractSource,
      version: "1.0.1",
    };
    await expect(
      checkArtifacts(workspace, [changedSource]),
    ).rejects.toMatchObject({ code: "CONTRACT_DRIFT" });

    const checkedIn = await readFile(
      path.join(workspace, "contracts/json-schema/identity-access.v1.json"),
      "utf8",
    );
    expect(JSON.parse(checkedIn).version).toBe("1.0.0");
  });

  it("rejects invalid schemas and untraced requirements with named errors", () => {
    expectContractError(
      () =>
        generateArtifacts([
          {
            ...identityAccessContractSource,
            schemas: [
              ...identityAccessContractSource.schemas,
              identityAccessContractSource.schemas[0],
            ],
          },
        ]),
      "CONTRACT_SCHEMA_INVALID",
    );
    expectContractError(
      () =>
        generateArtifacts([
          {
            ...identityAccessContractSource,
            requirements: [
              ...identityAccessContractSource.requirements,
              "R1-COMP-001",
            ],
          },
        ]),
      "REQUIREMENT_UNTRACED",
    );
  });

  it("blocks an incompatible public contract change with a named error", () => {
    const previous = JSON.parse(
      generateArtifacts([identityAccessContractSource]).artifacts.get(
        "contracts/openapi/v1.json",
      ),
    );
    const next = JSON.parse(JSON.stringify(previous));
    delete next.components.schemas.IdentitySessionProjection.properties.userId;
    next.components.schemas.IdentitySessionProjection.required =
      next.components.schemas.IdentitySessionProjection.required.filter(
        (property) => property !== "userId",
      );

    expectContractError(
      () => assertBackwardCompatible(previous, next),
      "CONTRACT_BREAKING_CHANGE",
    );
  });

  it("detects checked-in artifact tampering without accepting permissive output", async () => {
    const workspace = await temporaryWorkspace();
    await writeArtifacts(workspace, [identityAccessContractSource]);
    const target = path.join(workspace, "contracts/vectors/index.json");
    await writeFile(target, "{}\n", "utf8");

    await expect(
      checkArtifacts(workspace, [identityAccessContractSource]),
    ).rejects.toMatchObject({
      code: "CONTRACT_DRIFT",
      details: ["contracts/vectors/index.json"],
    });
  });

  it("records a current-item receipt when the drift check passes", async () => {
    const workspace = await temporaryWorkspace();
    await writeArtifacts(workspace, [identityAccessContractSource]);

    await expect(
      runContractsCli(["check"], {
        workspaceRoot: workspace,
        itemId: "R1-FND-004-A",
        testedHead: "test-head",
        now: () => "2026-09-24T00:00:00.000Z",
        stdout: () => undefined,
      }),
    ).resolves.toBe(0);

    const receipt = JSON.parse(
      await readFile(
        path.join(workspace, ".ralph/evidence/R1-FND-004-A/contracts.json"),
        "utf8",
      ),
    );
    expect(receipt).toMatchObject({
      item_id: "R1-FND-004-A",
      check_id: "contracts",
      command: "pnpm contracts check",
      tested_head: "test-head",
      passed: true,
      exit_code: 0,
      assertions: 10,
      skipped: 0,
    });
    expect(receipt.test_names).toHaveLength(10);
  });
});
