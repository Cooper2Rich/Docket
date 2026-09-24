import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-003-A";
const contractSha256 =
  "a5fc52bdb4b38b533bc68e4fc9fdde1f7f398ad218fb2ee0a58b544e89da39d9";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function runMigrationTests(
  workspaceRoot,
  testNamePattern,
  expectedTests,
) {
  const vitest = path.join(workspaceRoot, "node_modules/vitest/vitest.mjs");
  let output;
  try {
    const result = await execFileAsync(
      process.execPath,
      [
        vitest,
        "run",
        "--config",
        "vitest.migrations.config.mts",
        "--testNamePattern",
        testNamePattern,
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
      `migration behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-4000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(`migration behavior tests omitted: ${missing.join(", ")}`);
  }
  return passing(expectedTests.length, expectedTests);
}

async function orderedIdempotentMigration({ workspaceRoot }) {
  const expectedTests = [
    "migrates an empty database once and treats an equivalent retry as a no-op",
    "serializes equivalent concurrent migration attempts without double application",
  ];
  return runMigrationTests(
    workspaceRoot,
    expectedTests.join("|"),
    expectedTests,
  );
}

async function ownedCompatiblePlan({ workspaceRoot }) {
  const expectedTests = [
    "loads one ordered migration and every package-local owner declaration",
    "rejects a cross-owner write before application startup",
    "rejects duplicate order and identity metadata",
    "rejects destructive and mutating verification SQL",
  ];
  return runMigrationTests(
    workspaceRoot,
    expectedTests.join("|"),
    expectedTests,
  );
}

async function explicitTransactionalProcess({ workspaceRoot }) {
  const expectedTests = [
    "runs migrations through the explicit release process",
    "keeps schema mutation out of API and worker startup",
    "rolls back a failed migration and retains immutable failure evidence",
  ];
  return runMigrationTests(
    workspaceRoot,
    expectedTests.join("|"),
    expectedTests,
  );
}

async function authoritativeBoundaryMatrix({ workspaceRoot }) {
  const expectedTests = [
    "migrates an empty database once and treats an equivalent retry as a no-op",
    "denies invalid authority and rejects one stale conflicting concurrent action",
    "rolls back a failed migration and retains immutable failure evidence",
    "exposes the migrated journal through the pinned Kysely database seam",
  ];
  return runMigrationTests(
    workspaceRoot,
    expectedTests.join("|"),
    expectedTests,
  );
}

async function nonDeliveryAndJourneyApplicability({ workspaceRoot }) {
  const [item, repositoryMap, development] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-003-A.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/architecture/repository-map.md"),
      "utf8",
    ),
    readFile(path.join(workspaceRoot, "docs/development.md"), "utf8"),
  ]);
  const assertions = [
    item.includes("Audiences: developers; release operators; audit"),
    item.includes("Events: MigrationApplied"),
    repositoryMap.includes("The explicit release-time migration runner"),
    repositoryMap.includes("exposes no application traffic"),
    development.includes("appends a checksummed `MigrationApplied` row"),
    development.includes("Applied rows are immutable"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "allowed and denied authority, stale and concurrent actions, retry, rollback, and permitted immutable journal persistence are exercised by the behavioral matrix",
      "MigrationApplied is the local checksummed journal outcome of an explicit release process, not an asynchronously delivered domain notification",
      "the developer/operator migration process exposes no application traffic or rendered user journey",
    ],
    {
      inapplicable: {
        categories: ["delivery-failure", "rendered-user-journey-states"],
        reason:
          "R1-FND-003-A is an explicit developer/release-operator process with an immutable local migration journal and no application traffic. Its MigrationApplied outcome is recorded locally; the accepted contracts define no recipient delivery or rendered route for this leaf.",
        sources: [
          "docs/implementation/items/R1-FND-003-A.md#affected-design-contracts",
          "docs/architecture/repository-map.md#apps-migrate",
          "docs/development.md#database-migrations",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "isolated-postgresql-migration-boundary-v1",
  environment: "local-node-24-testcontainers-postgresql-17.6",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "ordered-idempotent-concurrent-migration",
          testName:
            "migrates empty PostgreSQL to head once and serializes equivalent attempts",
          run: orderedIdempotentMigration,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "module-owner-order-and-compatibility-validation",
          testName:
            "rejects foreign ownership, duplicate order, and incompatible SQL before startup",
          run: ownedCompatiblePlan,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "explicit-process-transaction-and-failure-journal",
          testName:
            "runs only through the explicit process and rolls back while retaining immutable failure evidence",
          run: explicitTransactionalProcess,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-migration-boundary-matrix",
          testName:
            "proves authority, stale, retry, concurrency, rollback, and permitted journal persistence",
          run: authoritativeBoundaryMatrix,
        },
        {
          id: "delivery-and-rendered-journey-applicability",
          testName:
            "records the source-backed non-delivery and non-rendered applicability boundary",
          run: nonDeliveryAndJourneyApplicability,
        },
      ],
    },
  ],
};
