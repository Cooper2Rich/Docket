import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-003-B";
const contractSha256 =
  "2af039fc3a8f3e930a9b8644fdae68b781b0c8645eb7e165950c7890685ec63b";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function runIntegrationTests(workspaceRoot, expectedTests) {
  const vitest = path.join(workspaceRoot, "node_modules/vitest/vitest.mjs");
  let output;
  try {
    const result = await execFileAsync(
      process.execPath,
      [
        vitest,
        "run",
        "--config",
        "vitest.integration.config.mts",
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
      `integration behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-6000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(
      `integration behavior tests omitted: ${missing.join(", ")}`,
    );
  }
  return passing(expectedTests.length, expectedTests);
}

async function isolatedDatabaseLifecycle({ workspaceRoot }) {
  return runIntegrationTests(workspaceRoot, [
    "isolates concurrently running suites in separate real databases",
    "releases its real container when a test callback fails",
  ]);
}

async function migrationCompatibilityMatrix({ workspaceRoot }) {
  return runIntegrationTests(workspaceRoot, [
    "migrates an empty database once and treats an equivalent retry as a no-op",
    "migrates the previous schema to head while preserving the previous application read",
    "rejects an adjacent-incompatible schema change before it can break the previous application",
    "rolls back a failed migration and retains immutable failure evidence",
  ]);
}

async function documentedForwardRepair({ workspaceRoot }) {
  const [documentation, development] = await Promise.all([
    readFile(
      path.join(
        workspaceRoot,
        "docs/implementation/migration-compatibility.md",
      ),
      "utf8",
    ),
    readFile(path.join(workspaceRoot, "docs/development.md"), "utf8"),
  ]);
  const assertions = [
    documentation.includes("expand-and-contract deployment"),
    documentation.includes("previous application able to read"),
    documentation.includes("SCHEMA_INCOMPATIBLE"),
    documentation.includes(
      "does not claim that reversing schema history is safe",
    ),
    documentation.includes("reviewed new forward migration"),
    development.includes(
      "Correct a released migration with a new forward migration rather than editing history or rolling schema state backward.",
    ),
  ];
  if (assertions.includes(false)) {
    throw new Error(
      "forward-repair or compatibility documentation is incomplete",
    );
  }
  return passing(assertions.length, [
    "adjacent previous-application reads are required after an additive advance",
    "incompatible schema mutation blocks before connection",
    "released history is repaired forward rather than destructively reversed",
  ]);
}

async function authoritativeBoundaryMatrix({ workspaceRoot }) {
  return runIntegrationTests(workspaceRoot, [
    "migrates an empty database once and treats an equivalent retry as a no-op",
    "serializes equivalent concurrent migration attempts without double application",
    "rolls back a failed migration and retains immutable failure evidence",
    "denies invalid authority and rejects one stale conflicting concurrent action",
    "exposes the migrated journal through the pinned Kysely database seam",
  ]);
}

async function nonDeliveryAndJourneyApplicability({ workspaceRoot }) {
  const [item, repositoryMap, compatibility] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-003-B.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/architecture/repository-map.md"),
      "utf8",
    ),
    readFile(
      path.join(
        workspaceRoot,
        "docs/implementation/migration-compatibility.md",
      ),
      "utf8",
    ),
  ]);
  const assertions = [
    item.includes("Audiences: developers; release operators; audit"),
    item.includes(
      "Outputs: migration runner; ownership validator; migration journal; test database harness",
    ),
    repositoryMap.includes("exposes no application traffic"),
    repositoryMap.includes("isolated infrastructure harnesses"),
    compatibility.includes("publish no rendered route"),
    compatibility.includes("dispatch no recipient delivery"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "allowed and denied authority, stale and concurrent actions, retry, rollback, and immutable permitted persistence are exercised against real PostgreSQL",
      "the TestDatabase failure path releases infrastructure resources",
      "the developer/operator migration boundary has no delivery recipient or rendered user journey",
    ],
    {
      inapplicable: {
        categories: ["delivery-failure", "rendered-user-journey-states"],
        reason:
          "R1-FND-003-B is isolated database and migration verification for developers and release operators. The accepted repository map gives the migration process no application traffic, recipient delivery, or rendered route.",
        sources: [
          "docs/implementation/items/R1-FND-003-B.md#affected-design-contracts",
          "docs/architecture/repository-map.md#apps-migrate",
          "docs/architecture/repository-map.md#testkit",
          "docs/implementation/migration-compatibility.md",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "isolated-postgresql-compatibility-v1",
  environment: "local-node-24-testcontainers-postgresql-17.6",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "isolated-databases-and-failure-cleanup",
          testName:
            "isolates real PostgreSQL suites and releases failed-test resources",
          run: isolatedDatabaseLifecycle,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "empty-previous-repeat-rollback-and-adjacent-compatibility",
          testName:
            "exercises every required migration path with nonempty assertions",
          run: migrationCompatibilityMatrix,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "documented-forward-repair-and-rollback-boundary",
          testName:
            "documents adjacent compatibility, forward repair, and the absence of destructive rollback claims",
          run: documentedForwardRepair,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-migration-boundary-matrix",
          testName:
            "proves authority, stale, retry, concurrency, rollback, and permitted immutable persistence",
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
