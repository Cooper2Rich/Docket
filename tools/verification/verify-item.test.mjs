import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { sha256, writeJsonAtomic } from "../lib/workspace.mjs";
import {
  executeSuite,
  loadContract,
  validateCheckReceipts,
  validateSuiteContract,
} from "./core.mjs";
import { runCli, verifyItem } from "./verify-item.mjs";

const item = {
  id: "R1-FND-001-A",
  acceptance_ids: [
    "R1-FND-001-A/AC-01",
    "R1-FND-001-A/AC-02",
    "R1-FND-001-A/AC-03",
    "R1-FND-001-A/AC-04",
  ],
  checks: ["item", "build", "check", "unit"].map((id) => ({
    id,
    command: `pnpm ${id}`,
    ...(id === "item" ? { acceptance_ids: [] } : {}),
  })),
  contract_sha256: "fixture-contract-digest",
};
item.checks[0].acceptance_ids = item.acceptance_ids;

function contractFixture() {
  return {
    items: { [item.id]: item },
    execution_graph: {
      items: [
        {
          id: item.id,
          kind: "leaf",
          owner: "foundation",
          stage: "01 Foundations",
          requirements: [
            "R1-AUTH-001",
            "R1-COMP-001",
            "R1-CONS-001",
            "R1-DATA-001",
            "R1-LIFE-001",
            "R1-MSG-001",
            "R1-OPS-001",
            "R1-PRIV-001",
          ],
        },
      ],
    },
  };
}

function passingSuite() {
  return {
    itemId: item.id,
    contractSha256: item.contract_sha256,
    fixture: "foundation-verification-fixture-v1",
    environment: "unit",
    criteria: item.acceptance_ids.map((id, index) => ({
      id,
      scenarios: [
        {
          id: `scenario-${index + 1}`,
          testName: `foundation behavior ${index + 1}`,
          run: async () => ({
            assertions: index + 1,
            observations: [`observed-${index + 1}`],
          }),
        },
      ],
    })),
  };
}

async function captureExit(verifier) {
  const errors = [];
  const exitCode = await runCli(
    ["--id", item.id, "--contract", "contract.json"],
    {
      verifier,
      stdout: () => undefined,
      stderr: (message) => errors.push(message),
    },
  );
  return { exitCode, errors };
}

describe("verify:item fail-closed behavior", () => {
  it("exits nonzero for an unknown item", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "docket-verify-"));
    const contractPath = path.join(root, "contract.json");
    await writeJsonAtomic(contractPath, contractFixture());
    const result = await captureExit(() =>
      loadContract(contractPath, "R1-UNKNOWN-001-A"),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("UNKNOWN_ITEM");
  });

  it("exits nonzero when an acceptance ID is omitted", async () => {
    const suite = passingSuite();
    suite.criteria.pop();
    const result = await captureExit(async () =>
      validateSuiteContract(item, suite),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("ACCEPTANCE_ID_SET_MISMATCH");
  });

  it("exits nonzero when an acceptance ID is duplicated", async () => {
    const suite = passingSuite();
    suite.criteria[3] = suite.criteria[0];
    const result = await captureExit(async () =>
      validateSuiteContract(item, suite),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("ACCEPTANCE_ID_SET_MISMATCH_DUPLICATE");
  });

  it("exits nonzero for an empty selected suite", async () => {
    const suite = passingSuite();
    suite.criteria[0].scenarios = [];
    const result = await captureExit(async () =>
      validateSuiteContract(item, suite),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("EMPTY_SELECTED_SUITE");
  });

  it("exits nonzero for a skipped required scenario", async () => {
    const suite = passingSuite();
    suite.criteria[0].scenarios[0].run = async () => ({
      status: "skipped",
      assertions: 0,
    });
    const result = await captureExit(() => executeSuite(item, suite, {}));
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("REQUIRED_SCENARIO_SKIPPED");
  });

  it("exits nonzero for a pending required scenario", async () => {
    const suite = passingSuite();
    suite.criteria[0].scenarios[0].run = async () => ({
      status: "pending",
      assertions: 0,
    });
    const result = await captureExit(() => executeSuite(item, suite, {}));
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("REQUIRED_SCENARIO_PENDING");
  });

  it("exits nonzero for a failing assertion", async () => {
    const suite = passingSuite();
    suite.criteria[0].scenarios[0].run = async () => ({
      status: "failed",
      assertions: 1,
    });
    const result = await captureExit(() => executeSuite(item, suite, {}));
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("ASSERTION_FAILED");
  });

  it("exits nonzero for a stale contract digest", async () => {
    const suite = passingSuite();
    suite.contractSha256 = "stale";
    const result = await captureExit(async () =>
      validateSuiteContract(item, suite),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("STALE_CONTRACT_DIGEST");
  });

  it("exits nonzero when a required check artifact is missing", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "docket-verify-"));
    const contractPath = path.join(root, "contract.json");
    await writeJsonAtomic(contractPath, contractFixture());
    const result = await captureExit(() =>
      verifyItem({
        workspaceRoot: root,
        itemId: item.id,
        contractPath,
        evidenceRoot: path.join(root, ".ralph", "evidence"),
        suiteLoader: async () => passingSuite(),
        testedHead: "a".repeat(40),
      }),
    );
    expect(result.exitCode).toBe(1);
    expect(result.errors[0]).toContain("MISSING_CHECK_ARTIFACT");
  });

  it("rejects nonpassing, skipped, and superseded-head check receipts", () => {
    const passingReceipt = (checkId) => ({
      check_id: checkId,
      tested_head: "current-head",
      passed: true,
      exit_code: 0,
      assertions: 1,
      skipped: 0,
      test_names: [checkId],
    });
    const receipts = Object.fromEntries(
      item.checks.map(({ id }) => [id, passingReceipt(id)]),
    );

    receipts.build.passed = false;
    expect(() =>
      validateCheckReceipts(item, receipts, "current-head"),
    ).toThrowError(expect.objectContaining({ code: "CHECK_FAILED" }));

    receipts.build = passingReceipt("build");
    receipts.build.skipped = 1;
    expect(() =>
      validateCheckReceipts(item, receipts, "current-head"),
    ).toThrowError(expect.objectContaining({ code: "CHECK_FAILED" }));

    receipts.build = passingReceipt("build");
    receipts.build.tested_head = "superseded-head";
    expect(() =>
      validateCheckReceipts(item, receipts, "current-head"),
    ).toThrowError(expect.objectContaining({ code: "STALE_CHECK_RECEIPT" }));
  });
});

describe("verify:item passing evidence", () => {
  it("emits exact IDs, test names, counts, revision, and artifact hashes", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "docket-verify-"));
    const contractPath = path.join(root, "contract.json");
    const evidenceRoot = path.join(root, ".ralph", "evidence");
    const evidenceDirectory = path.join(evidenceRoot, item.id);
    const testedHead = "b".repeat(40);
    await writeJsonAtomic(contractPath, contractFixture());
    for (const checkId of ["build", "check", "unit"]) {
      await writeJsonAtomic(path.join(evidenceDirectory, `${checkId}.json`), {
        item_id: item.id,
        check_id: checkId,
        tested_head: testedHead,
        passed: true,
        exit_code: 0,
        assertions: 1,
        skipped: 0,
        test_names: [`${checkId} fixture`],
      });
    }

    const { acceptance, acceptancePath } = await verifyItem({
      workspaceRoot: root,
      itemId: item.id,
      contractPath,
      evidenceRoot,
      suiteLoader: async () => passingSuite(),
      testedHead,
      prNumber: 49,
    });

    expect(acceptance.item_id).toBe(item.id);
    expect(acceptance.contract_sha256).toBe(item.contract_sha256);
    expect(acceptance.tested_head).toBe(testedHead);
    expect(acceptance.pr_number).toBe(49);
    expect(acceptance.acceptance_criteria.map(({ id }) => id)).toEqual(
      item.acceptance_ids,
    );
    expect(acceptance.checks.map(({ id }) => id)).toEqual(
      item.checks.map(({ id }) => id),
    );
    expect(
      acceptance.acceptance_criteria.flatMap(({ test_names: names }) => names),
    ).toEqual(
      passingSuite().criteria.flatMap(({ scenarios }) =>
        scenarios.map(({ testName }) => testName),
      ),
    );
    expect(
      acceptance.acceptance_criteria.reduce(
        (total, criterion) => total + criterion.assertions,
        0,
      ),
    ).toBe(10);

    for (const artifact of [
      ...acceptance.acceptance_criteria,
      ...acceptance.checks,
    ]) {
      const content = await readFile(path.join(root, artifact.artifact));
      expect(artifact.sha256).toBe(sha256(content));
    }
    expect(JSON.parse(await readFile(acceptancePath, "utf8"))).toEqual(
      acceptance,
    );
  });
});
