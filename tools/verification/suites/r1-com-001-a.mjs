import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-COM-001-A";
const contractSha256 =
  "1dc2b89e2dd3ce8a642b1a85be242f6a1c3ba1295fd6d69057f03dcc3f973076";

function passing(assertions, observations) {
  return { assertions, observations };
}

async function runCommand(workspaceRoot, executable, args, label) {
  try {
    const result = await execFileAsync(executable, args, {
      cwd: workspaceRoot,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 30 * 1024 * 1024,
      env: applicationEnvironment(process.env),
    });
    return `${result.stdout ?? ""}${result.stderr ?? ""}`;
  } catch (error) {
    throw new Error(
      `${label} failed: ${`${error.stdout ?? ""}${error.stderr ?? ""}`.slice(-10_000)}`,
      { cause: error },
    );
  }
}

function requireObservedTests(output, expectedTests, label) {
  const missing = expectedTests.filter((test) => !output.includes(test));
  if (missing.length > 0)
    throw new Error(`${label} omitted: ${missing.join(", ")}`);
  return passing(expectedTests.length, expectedTests);
}

async function runVitest(
  workspaceRoot,
  { config = "vitest.config.mts", files, expectedTests },
) {
  const output = await runCommand(
    workspaceRoot,
    process.execPath,
    [
      path.join(workspaceRoot, "node_modules/vitest/vitest.mjs"),
      "run",
      "--config",
      config,
      ...files,
      "--testNamePattern",
      expectedTests.join("|"),
      "--testTimeout=90000",
      "--reporter=verbose",
    ],
    "communications behavior tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "communications behavior tests",
  );
}

async function transactionalOutbox({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: ["packages/communications/src/communications-service.test.ts"],
    expectedTests: [
      "commits notice intent and outbox atomically or rolls back both",
      "preserves one logical effect across timeout, duplicate delivery and worker restart",
    ],
  });
}

async function durableQueueRecovery({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    config: "vitest.integration.config.mts",
    files: [
      "packages/communications/src/postgres-communications-store.integration.test.ts",
      "apps/worker/src/index.integration.test.ts",
    ],
    expectedTests: [
      "persists idempotent delivery and retry history across service restarts",
      "reclaims an abandoned outbox lease and deletes only expired data not under Legal Hold",
      "claims a committed outbox event, retries delivery and remains idempotent after worker restart",
    ],
  });
}

async function contractTelemetryAndBoundaries({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/communications/src/communications-service.test.ts",
      "apps/api/src/communications-routes.test.ts",
    ],
    expectedTests: [
      "records bounded retry history and redacts telemetry",
      "serves only the authenticated recipient projection",
      "maps anonymous and stale authority failures to safe stable errors",
    ],
  });
}

async function authoritativeFailureMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/communications/src/communications-service.test.ts",
      "apps/api/src/communications-routes.test.ts",
      "apps/web/app/routes/communications-inbox.test.tsx",
    ],
    expectedTests: [
      "returns equivalent retry and rejects conflicting idempotency reuse",
      "rejects denied and stale authority and foreign inbox reads",
      "preserves in-app delivery and escalates after provider failure",
      "keeps the in-app projection available for pending and failed provider delivery",
      "provides a native keyboard-focusable refresh control",
    ],
  });
}

async function durablePostgresqlBoundary({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    config: "vitest.integration.config.mts",
    files: [
      "packages/communications/src/postgres-communications-store.integration.test.ts",
    ],
    expectedTests: [
      "commits intent and outbox together, rolls back a partial transaction and rejects a conflicting concurrent action",
      "persists idempotent delivery and retry history across service restarts",
      "reclaims an abandoned outbox lease and deletes only expired data not under Legal Hold",
    ],
  });
}

async function renderedInboxJourney({ workspaceRoot }) {
  const expectedTests = [
    "server renders the recipient-scoped Communications Inbox",
    "Communications Inbox renders loading then the authorized recipient projection",
    "Communications Inbox renders its empty state",
    "Communications Inbox renders its error state",
    "Communications Inbox renders its denied state",
    "Communications Inbox renders its stale state",
    "Communications Inbox reflows on mobile and has no automated WCAG 2.2 AA violation",
  ];
  const output = await runCommand(
    workspaceRoot,
    process.execPath,
    [
      path.join(workspaceRoot, "node_modules/@playwright/test/cli.js"),
      "test",
      "apps/web/e2e/foundation.spec.ts",
      "--grep",
      "Communications Inbox|recipient-scoped Communications Inbox",
      "--reporter=line",
    ],
    "rendered Communications Inbox browser tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "rendered Communications Inbox browser tests",
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "deterministic-communications-outbox-and-recipient-inbox-v1",
  environment:
    "local-node-24-isolated-postgresql-pg-boss-and-rendered-chromium",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "atomic-outbox-and-one-logical-effect",
          testName:
            "commits domain state and outbox together and applies an at-least-once job once logically",
          run: transactionalOutbox,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "crash-retry-restart-and-abandoned-lease",
          testName:
            "recovers retries, restart, duplicate delivery and abandoned queue leases durably",
          run: durableQueueRecovery,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "versioned-contract-safe-telemetry-and-module-boundaries",
          testName:
            "publishes stable interfaces and records correlated retry telemetry without message content",
          run: contractTelemetryAndBoundaries,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-retry-conflict-and-delivery-matrix",
          testName:
            "proves authority, staleness, retry equivalence, conflict and degraded in-app delivery",
          run: authoritativeFailureMatrix,
        },
        {
          id: "durable-postgresql-concurrency-retention-and-legal-hold",
          testName:
            "proves PostgreSQL concurrency, rollback, restart, retention and Legal Hold",
          run: durablePostgresqlBoundary,
        },
        {
          id: "real-rendered-communications-inbox-journey",
          testName:
            "exercises the real inbox across required states, mobile, keyboard and accessibility",
          run: renderedInboxJourney,
        },
      ],
    },
  ],
};
