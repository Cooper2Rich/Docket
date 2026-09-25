import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-005-B";
const contractSha256 =
  "492416336522b7c5191200288233da81b6ddbd8c6cbd9c2219bebb2cae1fb251";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function runPolicyTests(workspaceRoot, expectedTests) {
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
        "tools/ci/promotion-policy.test.mjs",
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
      `promotion policy tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-8000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(`promotion policy tests omitted: ${missing.join(", ")}`);
  }
  return passing(expectedTests.length, expectedTests);
}

async function exactMainProtection({ workspaceRoot }) {
  return runPolicyTests(workspaceRoot, [
    "accepts all eleven exact contexts and the zero-approval protected policy",
    "rejects weakened protection, private visibility, and bypass actors",
  ]);
}

async function failClosedPromotion({ workspaceRoot }) {
  return runPolicyTests(workspaceRoot, [
    "blocks merge when any current-head required check is absent or unsuccessful",
    "accepts the exact completed bootstrap head only for the promotion item",
    "verifies main ancestry and makes equivalent completion retries idempotent",
  ]);
}

async function publicEvidenceBoundary({ workspaceRoot }) {
  return runPolicyTests(workspaceRoot, [
    "returns allowlisted public metadata without copying secrets",
    "rejects weakened protection, private visibility, and bypass actors",
  ]);
}

async function operationalApplicability({ workspaceRoot }) {
  const [item, protection, verification] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-005-B.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/operations/github-branch-protection.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/implementation/verification-protocol.md"),
      "utf8",
    ),
  ]);
  const assertions = [
    item.includes(
      "no user-facing domain feature is implied beyond the named outcome",
    ),
    item.includes("Tables: No new tables specified by the parent"),
    item.includes("Events: No new events specified by the parent"),
    protection.includes("define no bypass actor"),
    protection.includes("requires zero GitHub approvals"),
    protection.includes(
      "promotes the accumulated foundation history to `main`",
    ),
    verification.includes(
      "An inaccessible or unsupported protection API is a blocker.",
    ),
    verification.includes(
      "The issue closes and its dependent becomes eligible only after the verified PR is merged into `main`",
    ),
  ];
  if (assertions.includes(false)) {
    throw new Error(
      "the source-backed promotion applicability boundary changed",
    );
  }
  const policyTests = await runPolicyTests(workspaceRoot, [
    "blocks merge when any current-head required check is absent or unsuccessful",
    "accepts the exact completed bootstrap head only for the promotion item",
    "verifies main ancestry and makes equivalent completion retries idempotent",
  ]);
  return passing(
    assertions.length + policyTests.assertions,
    [
      ...policyTests.observations,
      "the controller is the allowed integration actor; bypass actors and later leaves are denied",
      "stale heads, missing delivery checks, and conflicting completion receipts fail closed while equivalent retries are idempotent",
      "the external controller performs live read-back and post-merge ancestry validation; local fixtures do not claim hosted success",
    ],
    {
      inapplicable: {
        categories: [
          "authoritative-domain-transaction-rollback",
          "domain-record-retention-and-legal-hold",
          "rendered-user-journey-states",
        ],
        reason:
          "R1-FND-005-B is a developer/reviewer/release-operator protection and integration boundary. Its accepted item defines no domain command, table, event, participant-data persistence, or rendered route. Domain transaction rollback, domain retention/legal hold, and loading/empty/error/denied/stale/mobile/keyboard UI states therefore do not exist in this slice. Operational authority, stale-head rejection, deterministic retry, concurrent completion conflict, and required-check delivery failure remain applicable and are executable.",
        sources: [
          "docs/implementation/items/R1-FND-005-B.md#outcome-and-scope",
          "docs/implementation/items/R1-FND-005-B.md#affected-design-contracts",
          "docs/operations/github-branch-protection.md#required-check-contexts",
          "docs/operations/github-branch-protection.md#foundation-bootstrap-protection",
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
  fixture: "main-protection-and-bootstrap-promotion-policy-v1",
  environment: "local-node-24-sanitized-github-policy",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "exact-main-protection-read-back-policy",
          testName:
            "proves the exact strict contexts, pull-request boundary, resolved conversations, destructive-action blocks, administrator enforcement, zero approvals, and no bypass actors",
          run: exactMainProtection,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "fail-closed-one-time-bootstrap-promotion",
          testName:
            "blocks incomplete or stale checks, restricts the promotion exception, verifies ancestry, and rejects conflicting completion",
          run: failClosedPromotion,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "public-secret-free-protection-evidence",
          testName:
            "records only allowlisted public protection facts and fails closed when protection is unavailable or weakened",
          run: publicEvidenceBoundary,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "operational-authority-staleness-retry-conflict-and-delivery",
          testName:
            "proves the operational boundary and records reviewed source-backed domain and journey inapplicability",
          run: operationalApplicability,
        },
      ],
    },
  ],
};
