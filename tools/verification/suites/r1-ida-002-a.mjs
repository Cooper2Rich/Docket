import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-IDA-002-A";
const contractSha256 =
  "d9dab3c323f4172290e01cb7cc7ace9a0d14ef3d8ead09342e0f21506adf3913";

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
  if (missing.length > 0) {
    throw new Error(`${label} omitted: ${missing.join(", ")}`);
  }
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
      "--testTimeout=60000",
      "--reporter=verbose",
    ],
    "Active Role Context behavior tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "Active Role Context behavior tests",
  );
}

async function tabLocalContextIsolation({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/role-context.test.ts",
      "apps/web/app/routes/role-contexts.test.tsx",
    ],
    expectedTests: [
      "keeps one visible selection per tab and restores a remembered privileged context",
      "returns an invalid remembered choice to selection without borrowing another grant",
      "returns only current Account options and the tab-local active projection",
      "persistently identifies the active role and exact scope",
      "gives a privileged context distinct treatment and termination control",
    ],
  });
}

async function safeDeepLinkAndSwitch({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/role-context.test.ts",
      "apps/web/app/routes/role-contexts.test.tsx",
    ],
    expectedTests: [
      "prompts for an authorized deep-link switch without resolving private data and denies foreign grants",
      "blocks cancelled unsaved work and atomically exits, clears and closes on a confirmed switch",
      "prompts for a deep-link switch before any protected workspace is opened",
      "offers save, discard, and cancel when a context-scoped draft is dirty",
      "destroys the previous protected cache when the server confirms invalidation",
    ],
  });
}

async function serverAuthorityAndReverification({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/role-context.test.ts",
      "apps/api/src/role-context-routes.test.ts",
    ],
    expectedTests: [
      "resolves current permission and scope server-side and denies stale, revoked and nearby authority",
      "accepts signed same-session Clerk Reverification for ten minutes exactly once",
      "lists, inspects, enters, switches and leaves one context for the authenticated tab",
      "returns stable denial for anonymous, revoked and cancelled context entry",
    ],
  });
}

async function authoritativeFailureMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/role-context.test.ts",
      "packages/identity-access/src/privileged-context-alerts.test.ts",
      "apps/worker/src/index.test.ts",
    ],
    expectedTests: [
      "returns an equivalent retry, rejects conflicting reuse and rolls back failed switch writes",
      "records failure without losing the minimized alert and retries it at least once",
      "publishes the device, approximate location, time and termination control",
    ],
  });
}

async function durablePostgresqlBoundary({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    config: "vitest.integration.config.mts",
    files: [
      "packages/identity-access/src/postgres-role-context-store.integration.test.ts",
    ],
    expectedTests: [
      "persists tab isolation, current grants, equivalent receipts and one-use reverification across restarts",
    ],
  });
}

async function renderedRoleContextJourney({ workspaceRoot }) {
  const expectedTests = [
    "server renders a safe role-context loading shell before tab-local bootstrap",
    "Active Role Context renders loading then the authoritative selector",
    "Active Role Context renders its empty state",
    "Active Role Context renders its error state",
    "Active Role Context renders its denied state",
    "Active Role Context renders its stale state",
    "Active Role Context switches with unsaved-work choices and destroys the prior tab cache",
    "role-context deep links prompt before protected data and deny unknown authority generically",
    "Active Role Context reflows on mobile and has no automated WCAG 2.2 AA violation",
  ];
  const output = await runCommand(
    workspaceRoot,
    process.execPath,
    [
      path.join(workspaceRoot, "node_modules/@playwright/test/cli.js"),
      "test",
      "apps/web/e2e/foundation.spec.ts",
      "--grep",
      "Active Role Context|role-context deep links|server renders a safe role-context",
      "--reporter=line",
    ],
    "rendered Active Role Context browser tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "rendered Active Role Context browser tests",
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "deterministic-active-role-context-authority-and-alert-v1",
  environment: "local-node-24-isolated-postgresql-and-rendered-chromium",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "tab-local-context-isolation-and-restoration",
          testName:
            "isolates one visible context per tab and safely restores the current remembered choice",
          run: tabLocalContextIsolation,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "safe-deep-link-and-unsaved-work-switch",
          testName:
            "prompts before deep-link resolution and blocks or clears context-scoped work during switching",
          run: safeDeepLinkAndSwitch,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "server-authority-and-clerk-reverification",
          testName:
            "resolves current grants and scope server-side and accepts only fresh one-use Clerk reverification",
          run: serverAuthorityAndReverification,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-retry-conflict-rollback-and-delivery",
          testName:
            "proves equivalent retry, conflict, transaction rollback, and durable alert delivery failure",
          run: authoritativeFailureMatrix,
        },
        {
          id: "durable-postgresql-concurrency-and-retention",
          testName:
            "proves PostgreSQL tab isolation, concurrent conflict, permitted retention classes, restart persistence, and alert retry",
          run: durablePostgresqlBoundary,
        },
        {
          id: "real-rendered-role-context-journey",
          testName:
            "exercises the real role-context route across required states, switching, mobile, keyboard, and accessibility",
          run: renderedRoleContextJourney,
        },
      ],
    },
  ],
};
