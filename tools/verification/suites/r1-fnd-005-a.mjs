import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { validateRequiredWorkflowFile } from "../../ci/policy.mjs";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-005-A";
const contractSha256 =
  "5f08bd5b75c24475fe2e621d4cc02c3cc501ccfd6fc7613422c71cafb95a3d6a";

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
      `required-check behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-8000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(
      `required-check behavior tests omitted: ${missing.join(", ")}`,
    );
  }
  return passing(expectedTests.length, expectedTests);
}

async function exactContextsAndLocalParity({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    ["tools/ci/policy.test.mjs", "tools/ci/full.test.mjs"],
    [
      "publishes every exact context with frozen local-command parity",
      "runs the frozen install and all ten required local gates in order",
    ],
  );
}

async function immutableDependenciesCacheAndArtifacts({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    ["tools/ci/policy.test.mjs", "tools/artifacts/policy.test.mjs"],
    [
      "rejects mutable actions, broader permissions, unsafe caches, and weakened artifacts",
      "hashes distinct server, worker, migration, and rendered-web outputs",
    ],
  );
}

async function failClosedRequiredChecks({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "tools/ci/full.test.mjs",
      "tools/contracts/generator.test.mjs",
      "tools/security/policy.test.mjs",
      "tools/artifacts/policy.test.mjs",
      "tools/verification/verify-item.test.mjs",
    ],
    [
      "stops at the deliberately failing check and does not supersede it",
      "writes atomically and reports changed source as contract drift",
      "blocks the checked-in vulnerable dependency fixture",
      "fails when any required evidence output is omitted",
      "exits nonzero for a skipped required scenario",
      "exits nonzero when a required check artifact is missing",
      "rejects nonpassing, skipped, and superseded-head check receipts",
    ],
  );
}

async function deterministicAuthorityAndDeliveryBoundary({ workspaceRoot }) {
  const [policyTests, policy] = await Promise.all([
    runUnitTests(
      workspaceRoot,
      ["tools/ci/policy.test.mjs", "tools/artifacts/policy.test.mjs"],
      [
        "matches the generated workflow byte-for-byte",
        "fails when any required evidence output is omitted",
        "rejects secret-bearing file types",
      ],
    ),
    validateRequiredWorkflowFile(workspaceRoot),
  ]);
  const workflow = JSON.parse(
    await readFile(
      path.join(workspaceRoot, ".github/workflows/required-checks.yml"),
      "utf8",
    ),
  );
  const assertions = [
    JSON.stringify(workflow.on?.pull_request) ===
      JSON.stringify({ branches: ["main"] }),
    JSON.stringify(workflow.on?.push) ===
      JSON.stringify({ branches: ["main"] }),
    JSON.stringify(workflow.on?.workflow_dispatch) === JSON.stringify({}),
    JSON.stringify(workflow.permissions) ===
      JSON.stringify({ contents: "read" }),
    policy.checkNames.length === 11,
    policy.actionPins.every((reference) => /@[0-9a-f]{40}$/u.test(reference)),
  ];
  if (assertions.includes(false)) {
    throw new Error("the CI trigger or read-only authority boundary changed");
  }
  return passing(policyTests.assertions + assertions.length, [
    ...policyTests.observations,
    "pull requests, main pushes, and explicit dispatch may execute the deterministic workflow",
    "the workflow token has read-only contents authority and cannot write or deploy",
    "missing or secret-bearing evidence fails before artifact delivery",
  ]);
}

async function domainAndJourneyApplicability({ workspaceRoot }) {
  const [item, development, branchProtection, verification] = await Promise.all(
    [
      readFile(
        path.join(workspaceRoot, "docs/implementation/items/R1-FND-005-A.md"),
        "utf8",
      ),
      readFile(path.join(workspaceRoot, "docs/development.md"), "utf8"),
      readFile(
        path.join(workspaceRoot, "docs/operations/github-branch-protection.md"),
        "utf8",
      ),
      readFile(
        path.join(
          workspaceRoot,
          "docs/implementation/verification-protocol.md",
        ),
        "utf8",
      ),
    ],
  );
  const assertions = [
    item.includes(
      "no user-facing domain feature is implied beyond the named outcome",
    ),
    item.includes("Tables: No new tables specified by the parent"),
    item.includes("Events: No new events specified by the parent"),
    development.includes(
      "The CI policy's checked-in negative fixture removes and mutates every required check in turn",
    ),
    branchProtection.includes(
      "Fork-originated code receives no deployment or repository-writing authority.",
    ),
    branchProtection.includes(
      "uploads one immutable `docket-build-<commit SHA>` artifact",
    ),
    branchProtection.includes(
      "hidden files disabled, and a seven-day retention period",
    ),
    verification.includes(
      "Missing, skipped, cancelled, neutral or stale checks fail.",
    ),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed CI applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "allowed CI triggers, denied write authority, stale-head rejection, deterministic retry, artifact delivery failure, permitted evidence content, and seven-day retention are applicable and executable",
      "the external controller, not a local fixture, validates hosted current-head status and the accepted review mode",
      "this operational leaf owns no domain command, shared domain mutation, transaction, domain table/event, or rendered user journey",
    ],
    {
      inapplicable: {
        categories: [
          "conflicting-concurrent-domain-action",
          "transaction-rollback",
          "authoritative-domain-persistence-retention-hold",
          "rendered-user-journey-states",
        ],
        reason:
          "R1-FND-005-A adds developer/reviewer/release-operator CI policy and evidence handling. Its accepted item adds no user-facing domain feature, domain command, table, or event. Conflicting domain mutation, transaction rollback, participant-data persistence/hold, and rendered loading/empty/error/denied/stale/mobile/keyboard states therefore do not exist in this slice. CI evidence delivery, permitted artifact content, and seven-day artifact retention remain applicable and are tested.",
        sources: [
          "docs/implementation/items/R1-FND-005-A.md#outcome-and-scope",
          "docs/implementation/items/R1-FND-005-A.md#affected-design-contracts",
          "docs/development.md#continuous-integration",
          "docs/operations/github-branch-protection.md#foundation-bootstrap-protection",
          "docs/operations/github-branch-protection.md#artifact-retention-policy",
          "docs/implementation/verification-protocol.md#integration",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "required-checks-policy-and-negative-fixtures-v1",
  environment: "local-node-24-github-actions-policy",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "exact-contexts-frozen-install-and-local-parity",
          testName:
            "publishes all eleven exact contexts and executes their documented commands serially after a frozen install",
          run: exactContextsAndLocalParity,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "immutable-actions-read-only-cache-and-artifact-policy",
          testName:
            "enforces immutable actions, read-only permissions, exact-lock pnpm caching, and SHA-named seven-day visible evidence",
          run: immutableDependenciesCacheAndArtifacts,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "negative-fixtures-and-current-head-fail-closed",
          testName:
            "rejects failing tests, contract drift, vulnerable dependencies, omitted evidence, skipped scenarios, and superseded heads",
          run: failClosedRequiredChecks,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "deterministic-ci-authority-and-evidence-delivery-boundary",
          testName:
            "proves allowed triggers, denied write authority, deterministic retry, and fail-closed evidence delivery",
          run: deterministicAuthorityAndDeliveryBoundary,
        },
        {
          id: "domain-persistence-concurrency-and-journey-applicability",
          testName:
            "records the reviewed source-backed non-domain, non-transactional, and non-rendered applicability boundary",
          run: domainAndJourneyApplicability,
        },
      ],
    },
  ],
};
