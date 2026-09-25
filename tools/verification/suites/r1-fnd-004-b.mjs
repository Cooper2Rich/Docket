import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-004-B";
const contractSha256 =
  "74378f5ed74e3ffc9f81ab0e591bac64258f01317cfe36c5ce6f78114f941116";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function runUnitTests(workspaceRoot, files, expectedTests) {
  const vitest = path.join(workspaceRoot, "node_modules/vitest/vitest.mjs");
  let output;
  try {
    const result = await execFileAsync(
      process.execPath,
      [
        vitest,
        "run",
        "--config",
        "vitest.config.mts",
        ...files,
        "--testNamePattern",
        expectedTests.join("|"),
        "--reporter=verbose",
      ],
      {
        cwd: workspaceRoot,
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024,
        env: applicationEnvironment(process.env),
      },
    );
    output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  } catch (error) {
    throw new Error(
      `traceability behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-8000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(
      `traceability behavior tests omitted: ${missing.join(", ")}`,
    );
  }
  return passing(expectedTests.length, expectedTests);
}

async function completeTraceabilityIndexes({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "tools/verification/criterion-registry.test.mjs",
      "tools/contracts/generator.test.mjs",
    ],
    [
      "indexes all release requirements, leaf criteria, evidence seams, and explicit exclusions",
      "produces every deterministic review artifact from the same source bytes",
    ],
  );
}

async function failClosedCoverage({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "tools/verification/criterion-registry.test.mjs",
      "tools/contracts/generator.test.mjs",
    ],
    [
      "rejects missing release requirements and missing criterion evidence",
      "rejects stale suite hashes and a selected suite that substitutes a subset",
      "rejects unowned artifacts and an empty golden corpus",
    ],
  );
}

async function sharedRegistryAndDriftCheck({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "tools/verification/criterion-registry.test.mjs",
      "tools/contracts/generator.test.mjs",
    ],
    [
      "writes atomically and reports changed source as contract drift",
      "rejects stale suite hashes and a selected suite that substitutes a subset",
    ],
  );
}

async function deterministicBoundaryMatrix({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "tools/verification/criterion-registry.test.mjs",
      "tools/contracts/generator.test.mjs",
    ],
    [
      "produces every deterministic review artifact from the same source bytes",
      "rejects invalid schemas and untraced requirements with named errors",
      "rejects stale suite hashes and a selected suite that substitutes a subset",
    ],
  );
}

async function mutationDeliveryAndJourneyApplicability({ workspaceRoot }) {
  const [item, executableContract, release] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-004-B.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/contracts/executable-contracts.md"),
      "utf8",
    ),
    readFile(path.join(workspaceRoot, "docs/releases/release-1.md"), "utf8"),
  ]);
  const assertions = [
    item.includes(
      "no user-facing domain feature is implied beyond the named outcome",
    ),
    item.includes("Tables: No new tables specified by the parent"),
    item.includes("Events: No new events specified by the parent"),
    executableContract.includes(
      "Requirement trace | Root Release 1 traceability manifest",
    ),
    executableContract.includes(
      "Fail CI when regeneration changes the working tree.",
    ),
    release.includes(
      "audience-safe projections and notifications required by those workflows",
    ),
  ];
  if (assertions.includes(false)) {
    throw new Error(
      "the source-backed traceability applicability boundary changed",
    );
  }
  return passing(
    assertions.length,
    [
      "valid generation, invalid inputs, stale contract authority, exact acceptance sets, and deterministic equivalent regeneration are exercised by executable unit scenarios",
      "the developer/reviewer traceability generator owns no domain command, table, event, recipient delivery, retention payload, or rendered route",
    ],
    {
      inapplicable: {
        categories: [
          "role-based-domain-actors",
          "conflicting-concurrent-domain-action",
          "transaction-rollback",
          "delivery-failure",
          "authoritative-persistence-retention-hold",
          "rendered-user-journey-states",
        ],
        reason:
          "R1-FND-004-B adds deterministic developer/reviewer traceability generation and validation. Its accepted item adds no domain command, table, event, recipient delivery, retained participant payload, or user-facing route. Actor authorization, concurrent domain mutation, transaction rollback, delivery, persistence retention/hold, and rendered loading/empty/error/denied/stale/mobile/keyboard states therefore do not exist in this slice.",
        sources: [
          "docs/implementation/items/R1-FND-004-B.md#outcome-and-scope",
          "docs/implementation/items/R1-FND-004-B.md#affected-design-contracts",
          "docs/contracts/executable-contracts.md#traceability-manifest",
          "docs/contracts/executable-contracts.md#change-rules",
          "docs/releases/release-1.md#included-lifecycle",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "release-1-criterion-registry-v1",
  environment: "local-node-24-generated-traceability",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "complete-requirement-criterion-and-exclusion-indexes",
          testName:
            "maps all release requirements and leaf criteria to owned contracts, tests, evidence, and explicit exclusions",
          run: completeTraceabilityIndexes,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "missing-stale-unowned-and-empty-fail-closed",
          testName:
            "rejects missing requirements or evidence, stale hashes, unowned artifacts, subsets, and an empty golden corpus",
          run: failClosedCoverage,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "shared-registry-generation-and-drift",
          testName:
            "uses one criterion registry for generated traceability, drift checks, and exact item verification",
          run: sharedRegistryAndDriftCheck,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "deterministic-validation-boundary",
          testName:
            "proves allowed generation, denied invalid input, stale contract rejection, exact sets, and equivalent retry behavior",
          run: deterministicBoundaryMatrix,
        },
        {
          id: "domain-mutation-delivery-persistence-and-journey-applicability",
          testName:
            "records the reviewed source-backed non-domain, non-persistent, non-delivery, and non-rendered applicability boundary",
          run: mutationDeliveryAndJourneyApplicability,
        },
      ],
    },
  ],
};
