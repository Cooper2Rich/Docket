import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-004-A";
const contractSha256 =
  "140045e4387d14bb8892246bc3c36cbaaf32efadc4661f96b27c84acb6c9b3de";

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
      `contract behavior tests failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-6000)}`,
      { cause: error },
    );
  }
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0) {
    throw new Error(`contract behavior tests omitted: ${missing.join(", ")}`);
  }
  return passing(expectedTests.length, expectedTests);
}

async function generatedViews({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    ["tools/contracts/generator.test.mjs"],
    ["produces every deterministic review artifact from the same source bytes"],
  );
}

async function deterministicDriftAndCompatibility({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    ["tools/contracts/generator.test.mjs"],
    [
      "writes atomically and reports changed source as contract drift",
      "rejects invalid schemas and untraced requirements with named errors",
      "blocks an incompatible public contract change with a named error",
      "detects checked-in artifact tampering without accepting permissive output",
    ],
  );
}

async function validatedApiAndClientBoundary({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    [
      "packages/identity-access/src/session-boundary.test.ts",
      "apps/api/src/server.test.ts",
    ],
    [
      "does not let a TypeScript assertion bypass runtime request validation",
      "fails output validation before an invalid projection crosses the boundary",
      "validates input and an account-self projection across the real API route",
      "rejects asserted invalid input before transport and invalid audience output after transport",
    ],
  );
}

async function authoritativeReadMatrix({ workspaceRoot }) {
  return runUnitTests(
    workspaceRoot,
    ["apps/api/src/server.test.ts"],
    [
      "validates input and an account-self projection across the real API route",
      "returns the stable envelope for denied and stale server authority",
      "treats equivalent read retries as deterministic and side-effect free",
    ],
  );
}

async function writeDeliveryAndJourneyApplicability({ workspaceRoot }) {
  const [item, executableContract, moduleSource] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-004-A.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/contracts/executable-contracts.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "packages/identity-access/src/contracts.ts"),
      "utf8",
    ),
  ]);
  const assertions = [
    item.includes(
      "no user-facing domain feature is implied beyond the named outcome",
    ),
    item.includes("Tables: No new tables specified by the parent"),
    item.includes("Events: No new events specified by the parent"),
    executableContract.includes(
      "A query never returns an unrestricted persistence row.",
    ),
    moduleSource.includes('method: "get"'),
    moduleSource.includes('operationId: "getIdentitySession"'),
  ];
  if (assertions.includes(false)) {
    throw new Error(
      "the source-backed read-only applicability boundary changed",
    );
  }
  return passing(
    assertions.length,
    [
      "allowed and denied actors, stale authority, and equivalent concurrent retries are exercised at the real API route",
      "the sample operation is a read-only session query with no authoritative write, transaction, persisted payload, outbox delivery, or rendered user journey",
    ],
    {
      inapplicable: {
        categories: [
          "conflicting-concurrent-write",
          "transaction-rollback",
          "delivery-failure",
          "authoritative-persistence-retention-hold",
          "rendered-user-journey-states",
        ],
        reason:
          "R1-FND-004-A introduces developer/reviewer contract generation and a read-only GET session boundary. The accepted item adds no table, event, or user-facing domain feature, so write-conflict, transaction rollback, persistence/hold, delivery, and rendered-route states do not exist in this slice.",
        sources: [
          "docs/implementation/items/R1-FND-004-A.md#outcome-and-scope",
          "docs/implementation/items/R1-FND-004-A.md#affected-design-contracts",
          "docs/contracts/executable-contracts.md#query-contract",
          "packages/identity-access/src/contracts.ts",
        ],
        review_required: true,
      },
    },
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "module-owned-contracts-and-session-query-v1",
  environment: "local-node-24-generated-contracts",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "module-owned-generated-views",
          testName:
            "generates every required review view from one module-owned definition",
          run: generatedViews,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "determinism-drift-and-named-errors",
          testName:
            "proves deterministic output, strict drift, invalid schema, and breaking-change failures",
          run: deterministicDriftAndCompatibility,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "runtime-validated-generated-client-boundary",
          testName:
            "exercises runtime request and audience projection validation through the generated client and real API route",
          run: validatedApiAndClientBoundary,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-read-boundary-matrix",
          testName:
            "proves allowed, denied, stale, and equivalent retry behavior at the authoritative route",
          run: authoritativeReadMatrix,
        },
        {
          id: "write-delivery-and-journey-applicability",
          testName:
            "records the source-backed read-only non-write, non-delivery, and non-rendered applicability boundary",
          run: writeDeliveryAndJourneyApplicability,
        },
      ],
    },
  ],
};
