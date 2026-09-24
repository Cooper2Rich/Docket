import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-002-B";
const contractSha256 =
  "ec1d2a241a8fd5db446d1090240ec2041c6a8c3b9cd5101da3b37622bb3ffe5a";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function runVitest(workspaceRoot, files, expectedTests) {
  const vitest = path.join(workspaceRoot, "node_modules/vitest/vitest.mjs");
  let output;
  try {
    const result = await execFileAsync(
      process.execPath,
      [vitest, "run", ...files, "--reporter=verbose"],
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
      `behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-4000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(`behavior tests omitted: ${missing.join(", ")}`);
  }
  return passing(expectedTests.length, expectedTests);
}

async function deterministicClockAndIdentifiers({ workspaceRoot }) {
  return runVitest(
    workspaceRoot,
    [
      "packages/runtime/src/index.test.ts",
      "packages/testkit/src/index.test.ts",
    ],
    [
      "generates production UUIDv7 identifiers with current timestamp bits",
      "injects Clock and entropy into UUIDv7 generation",
      "reproduces instants and UUIDv7 identifiers across fresh runs",
    ],
  );
}

async function guardedFixtureAdapters({ workspaceRoot }) {
  return runVitest(
    workspaceRoot,
    ["packages/testkit/src/index.test.ts"],
    [
      "keeps fixed identities and synthetic Competitors authority-free",
      "rejects every test adapter boundary in staging and production",
      "rejects real contact data and authority at every fixture boundary",
    ],
  );
}

async function negativeConfigurationAndRedaction({ workspaceRoot }) {
  return runVitest(
    workspaceRoot,
    [
      "packages/runtime/src/index.test.ts",
      "packages/testkit/src/index.test.ts",
      "apps/api/src/server.test.ts",
    ],
    [
      "rejects alternate fixed-identity environment variables",
      "rejects fixed identity requested through a header or query parameter",
      "logs only adapter identity and correlation data",
      "constructs redacted adapter log records",
    ],
  );
}

async function domainCategoriesInapplicable({ workspaceRoot }) {
  const [item, repositoryMap, development] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-002-B.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/architecture/repository-map.md"),
      "utf8",
    ),
    readFile(path.join(workspaceRoot, "docs/development.md"), "utf8"),
  ]);
  const assertions = [
    item.includes("Tables: No new tables specified"),
    item.includes("Events: No new events specified"),
    item.includes("Audiences: developers; operators"),
    repositoryMap.includes("`runtime`"),
    repositoryMap.includes("contains no domain defaults"),
    repositoryMap.includes("`testkit`"),
    repositoryMap.includes(
      "available only to tests and explicit development tooling",
    ),
    development.includes("versioned, synthetic, repeatable"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "runtime and testkit own clocks, identifiers, guards, and synthetic adapters only",
      "this leaf introduces no authoritative actor, command, table, event, delivery obligation, retained domain record, or user journey",
      "production and nonproduction guard behavior is exercised by AC-01 through AC-03",
    ],
    {
      inapplicable: {
        categories: [
          "allowed-and-denied-authoritative-actors",
          "stale-version-or-authority",
          "equivalent-retry",
          "conflicting-concurrent-action",
          "transaction-rollback",
          "delivery-failure",
          "authoritative-persistence-retention-and-legal-hold",
          "rendered-user-journey-states",
        ],
        reason:
          "R1-FND-002-B creates only developer/operator runtime and test-fixture seams. The accepted runtime and testkit packages own no domain defaults or authoritative data, and the leaf defines no user-facing journey.",
        sources: [
          "docs/implementation/items/R1-FND-002-B.md#affected-design-contracts",
          "docs/architecture/repository-map.md#runtime",
          "docs/architecture/repository-map.md#testkit",
          "docs/architecture/repository-map.md#data-ownership",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "guarded-runtime-fixtures-v1",
  environment: "local-node-24-synthetic-only",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "injectable-clock-and-uuidv7-reproduction",
          testName:
            "reproduces deterministic Clock and UUIDv7 sequences without replacing production generation",
          run: deterministicClockAndIdentifiers,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "nonproduction-fixture-boundaries",
          testName:
            "permits authority-free synthetic fixtures only in declared nonproduction environments",
          run: guardedFixtureAdapters,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "alternate-configuration-request-and-log-guards",
          testName:
            "rejects alternate fixed-identity controls and emits only redacted adapter logs",
          run: negativeConfigurationAndRedaction,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-domain-and-user-journey-applicability",
          testName:
            "records the source-backed domain and rendered-journey applicability boundary",
          run: domainCategoriesInapplicable,
        },
      ],
    },
  ],
};
