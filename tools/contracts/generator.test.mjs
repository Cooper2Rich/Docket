import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { identityAccessContractSource } from "../../packages/identity-access/src/contracts.ts";
import { registeredSuiteContracts } from "../verification/registry.mjs";
import { runContractsCli } from "./cli.mjs";
import {
  assertArtifactOwnership,
  assertBackwardCompatible,
  checkArtifacts,
  ContractGenerationError,
  generateArtifacts,
  writeArtifacts,
} from "./generator.mjs";

const temporaryDirectories = [];
let traceability;

beforeAll(async () => {
  const [queueContract, sourceCoverage, suites] = await Promise.all([
    readFile("docs/implementation/queue-contract.json", "utf8").then(
      JSON.parse,
    ),
    readFile("docs/implementation/source-coverage.json", "utf8").then(
      JSON.parse,
    ),
    registeredSuiteContracts(),
  ]);
  traceability = { queueContract, sourceCoverage, suites };
});

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

async function seedTraceabilityInputs(workspace) {
  const directory = path.join(workspace, "docs", "implementation");
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(directory, "queue-contract.json"),
      `${JSON.stringify(traceability.queueContract, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      path.join(directory, "source-coverage.json"),
      `${JSON.stringify(traceability.sourceCoverage, null, 2)}\n`,
      "utf8",
    ),
  ]);
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
    const first = generateArtifacts(
      [identityAccessContractSource],
      traceability,
    );
    const second = generateArtifacts(
      [identityAccessContractSource],
      traceability,
    );

    expect([...first.artifacts]).toEqual([...second.artifacts]);
    expect([...first.artifacts.keys()].sort()).toEqual([
      "contracts/diagrams/identity-access-states.mmd",
      "contracts/json-schema/identity-access.v1.json",
      "contracts/matrices/identity-access-audiences.md",
      "contracts/matrices/identity-access-authorization.md",
      "contracts/matrices/identity-access-states.md",
      "contracts/openapi/v1.json",
      "contracts/reference/identity-access.md",
      "contracts/reference/traceability.md",
      "contracts/traceability.json",
      "contracts/vectors/index.json",
      "packages/contracts/src/generated.ts",
    ]);
    expect(
      JSON.parse(first.artifacts.get("contracts/traceability.json")),
    ).toMatchObject({
      schemaVersion: 2,
      summary: {
        requirements: 8,
        acceptanceCriteria: 460,
        excludedSources: 98,
      },
      requirements: {
        "R1-AUTH-001": {
          modules: expect.arrayContaining(["contracts", "identity-access"]),
          operations: [
            "changeDisplayName",
            "createDocketSession",
            "getAccountProfile",
            "getIdentitySession",
            "listAccountSecurityHistory",
            "listDocketSessions",
            "revokeAllDocketSessions",
            "revokeDocketSession",
          ],
        },
        "R1-PRIV-001": {
          modules: expect.arrayContaining(["contracts", "identity-access"]),
          operations: [
            "changeDisplayName",
            "createDocketSession",
            "getAccountProfile",
            "getIdentitySession",
            "listAccountSecurityHistory",
            "listDocketSessions",
            "revokeAllDocketSessions",
            "revokeDocketSession",
          ],
        },
      },
    });

    const openApi = JSON.parse(
      first.artifacts.get("contracts/openapi/v1.json"),
    );
    expect(openApi.paths["/v1/docket-sessions"].post).toMatchObject({
      parameters: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateDocketSessionRequest",
            },
          },
        },
      },
    });
    expect(
      first.artifacts.get("packages/contracts/src/generated.ts"),
    ).toContain('path: "/v1/docket-sessions", body: input');
  });

  it("writes atomically and reports changed source as contract drift", async () => {
    const workspace = await temporaryWorkspace();
    await writeArtifacts(
      workspace,
      [identityAccessContractSource],
      traceability,
    );
    await expect(
      checkArtifacts(workspace, [identityAccessContractSource], traceability),
    ).resolves.toMatchObject({ sourceModules: ["identity-access"] });

    const changedSource = {
      ...identityAccessContractSource,
      version: "1.0.1",
    };
    await expect(
      checkArtifacts(workspace, [changedSource], traceability),
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
        generateArtifacts(
          [
            {
              ...identityAccessContractSource,
              schemas: [
                ...identityAccessContractSource.schemas,
                identityAccessContractSource.schemas[0],
              ],
            },
          ],
          traceability,
        ),
      "CONTRACT_SCHEMA_INVALID",
    );
    expectContractError(
      () =>
        generateArtifacts(
          [
            {
              ...identityAccessContractSource,
              requirements: [
                ...identityAccessContractSource.requirements,
                "R1-COMP-001",
              ],
            },
          ],
          traceability,
        ),
      "REQUIREMENT_UNTRACED",
    );
  });

  it("blocks an incompatible public contract change with a named error", () => {
    const previous = JSON.parse(
      generateArtifacts(
        [identityAccessContractSource],
        traceability,
      ).artifacts.get("contracts/openapi/v1.json"),
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
    await writeArtifacts(
      workspace,
      [identityAccessContractSource],
      traceability,
    );
    const target = path.join(workspace, "contracts/vectors/index.json");
    await writeFile(target, "{}\n", "utf8");

    await expect(
      checkArtifacts(workspace, [identityAccessContractSource], traceability),
    ).rejects.toMatchObject({
      code: "CONTRACT_DRIFT",
      details: ["contracts/vectors/index.json"],
    });
  }, 30_000);

  it("records a current-item receipt when the drift check passes", async () => {
    const workspace = await temporaryWorkspace();
    await writeArtifacts(
      workspace,
      [identityAccessContractSource],
      traceability,
    );
    await seedTraceabilityInputs(workspace);

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
      assertions: 11,
      skipped: 0,
    });
    expect(receipt.test_names).toHaveLength(11);
  });

  it("rejects unowned artifacts and an empty golden corpus", () => {
    expectContractError(
      () =>
        assertArtifactOwnership(
          new Map([["contracts/unowned.json", "{}\n"]]),
          new Map(),
        ),
      "ARTIFACT_UNOWNED",
    );
    expectContractError(
      () =>
        generateArtifacts(
          [{ ...identityAccessContractSource, goldenVectors: [] }],
          traceability,
        ),
      "GOLDEN_CORPUS_EMPTY",
    );
  });
});
