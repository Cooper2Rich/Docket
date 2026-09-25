import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createCriterionRegistry,
  CriterionRegistryError,
  RELEASE_REQUIREMENT_IDS,
} from "./criterion-registry.mjs";
import { registeredSuiteContracts } from "./registry.mjs";

let queueContract;
let sourceCoverage;
let suites;

beforeAll(async () => {
  [queueContract, sourceCoverage, suites] = await Promise.all([
    readFile("docs/implementation/queue-contract.json", "utf8").then(
      JSON.parse,
    ),
    readFile("docs/implementation/source-coverage.json", "utf8").then(
      JSON.parse,
    ),
    registeredSuiteContracts(),
  ]);
});

function expectRegistryError(action, code) {
  expect(action).toThrowError(CriterionRegistryError);
  try {
    action();
  } catch (error) {
    expect(error).toMatchObject({ code });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe("canonical acceptance-criterion registry", () => {
  it("indexes all release requirements, leaf criteria, evidence seams, and explicit exclusions", () => {
    const registry = createCriterionRegistry(queueContract, {
      sourceCoverage,
      suites,
    });

    expect(RELEASE_REQUIREMENT_IDS).toHaveLength(8);
    expect(registry.criteria.size).toBe(460);
    expect(Object.keys(registry.excludedSources)).toHaveLength(98);
    for (const requirement of RELEASE_REQUIREMENT_IDS) {
      expect(
        registry.criterionIdsForRequirement(requirement).length,
      ).toBeGreaterThan(0);
    }
    for (const criterion of registry.criteria.values()) {
      expect(criterion.contract).toMatchObject({
        path: expect.stringMatching(/^docs\/implementation\/items\/.+\.md$/u),
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/u),
      });
      expect(criterion.test.command).toContain(
        `pnpm verify:item --id ${criterion.itemId}`,
      );
      expect(criterion.evidence.acceptance).toBe(
        `.ralph/evidence/${criterion.itemId}/acceptance.json`,
      );
      expect([
        "implemented_foundation",
        "pending_foundation",
        "pending_domain",
      ]).toContain(criterion.coverageStatus);
    }
  });

  it("rejects missing release requirements and missing criterion evidence", () => {
    const withoutOperations = clone(queueContract);
    for (const graphItem of withoutOperations.execution_graph.items) {
      graphItem.requirements = graphItem.requirements.filter(
        (requirement) => requirement !== "R1-OPS-001",
      );
    }
    expectRegistryError(
      () => createCriterionRegistry(withoutOperations),
      "REQUIREMENT_UNTRACED",
    );

    const missingCriterion = clone(queueContract);
    missingCriterion.items["R1-FND-004-B"].checks
      .find(({ id }) => id === "item")
      .acceptance_ids.pop();
    expectRegistryError(
      () => createCriterionRegistry(missingCriterion),
      "CRITERION_EVIDENCE_MISSING",
    );
  });

  it("rejects stale suite hashes and a selected suite that substitutes a subset", () => {
    const stale = clone(suites);
    stale[0].contractSha256 = "stale";
    expectRegistryError(
      () => createCriterionRegistry(queueContract, { suites: stale }),
      "STALE_CONTRACT_DIGEST",
    );

    const subset = clone(suites);
    const selected = subset.find(({ itemId }) => itemId === "R1-FND-004-B");
    selected.acceptanceIds.pop();
    expectRegistryError(
      () => createCriterionRegistry(queueContract, { suites: subset }),
      "CRITERION_EVIDENCE_MISSING",
    );
  });

  it("rejects a deferred source row unless its exclusion is explicit", () => {
    const invalidCoverage = clone(sourceCoverage);
    const excluded = invalidCoverage.rows.find(
      ({ disposition }) => disposition === "deferred_or_superseded",
    );
    excluded.reason = "";
    expectRegistryError(
      () =>
        createCriterionRegistry(queueContract, {
          sourceCoverage: invalidCoverage,
        }),
      "SOURCE_EXCLUSION_INVALID",
    );
  });
});
