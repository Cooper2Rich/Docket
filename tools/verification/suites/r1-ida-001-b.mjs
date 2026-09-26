import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-IDA-001-B";
const contractSha256 =
  "dd65941fbcafe1b108c9a56434efc5cc7ce2fc3a7943353e5b68569c0d16d991";

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
      "--testTimeout=30000",
      "--reporter=verbose",
    ],
    "session security behavior tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "session security behavior tests",
  );
}

async function sessionPolicyMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: ["packages/identity-access/src/identity-service.test.ts"],
    expectedTests: [
      "ends the oldest ordinary session when a sixth ordinary session starts",
      "ends the prior privileged session when a second privileged session starts",
      "enforces ordinary inactivity and absolute limits while activity refreshes only the inactivity deadline",
      "enforces privileged 30-minute inactivity and 12-hour absolute limits",
      "does not count expired sessions toward the ordinary session limit",
    ],
  });
}

async function accountSecurityCommands({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "packages/identity-access/src/session-terminations.test.ts",
      "apps/api/src/server.test.ts",
      "apps/worker/src/index.test.ts",
      "apps/web/app/routes/account-sessions.test.tsx",
    ],
    expectedTests: [
      "lists only the Account holder's sessions and rejects stale revocation",
      "keeps activity freshness separate from command version for self-revocation",
      "logs out everywhere atomically and queues every associated Clerk session",
      "records a delivery failure and retries the same minimized command",
      "logs out every Docket and associated Clerk session through the generated API",
      "revokes only the associated Clerk session without an upstream-provider call",
      "offers keyboard controls for current-device and all-session logout",
      "renders a prominent privileged banner with immediate session termination",
    ],
  });
}

async function accountHistoryAndProfile({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "apps/worker/src/index.test.ts",
      "apps/web/app/routes/account-sessions.test.tsx",
    ],
    expectedTests: [
      "records only minimized accepted sign-ins in the two-year Account Security History",
      "idempotently ingests only trusted reverification and suspension history",
      "deletes expired Account Security History while keeping current records",
      "governs Docket Display Name changes independently of Clerk profile recovery",
      "allows an idempotent documented early correction only through current Platform approval",
      "reads updated users and accepts only the same current Clerk object",
      "renders the fresh Account version, editable Display Name, and permitted Security History",
      "offers a native keyboard-focusable Display Name control",
    ],
  });
}

async function authoritativeFailureMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "packages/identity-access/src/session-terminations.test.ts",
      "apps/api/src/server.test.ts",
      "apps/worker/src/index.test.ts",
    ],
    expectedTests: [
      "returns an equivalent retry and rejects conflicting reuse of its command key",
      "rejects stale concurrent Display Name changes and rolls failed writes back",
      "rejects a revocation when the acting Docket Session is not active",
      "requires live session authority before replaying a revocation receipt",
      "rolls back logout everywhere including provider deliveries",
      "requires live Docket authority before API receipt replay while Clerk termination is failed",
      "records a delivery failure and retries the same minimized command",
      "requires the backend session to be revoked or absent",
      "confirms deletion through a Clerk backend not-found response",
    ],
  });
}

async function durableSecurityBoundary({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    config: "vitest.integration.config.mts",
    files: [
      "packages/identity-access/src/postgres-identity-store.integration.test.ts",
      "apps/worker/src/index.integration.test.ts",
    ],
    expectedTests: [
      "refreshes activity without staling a time-advanced self-revocation",
      "persists governed Display Names and deletes only unheld expired Security History",
      "persists trusted privileged restoration, security outcomes, and reviewed name correction",
      "caps pre-migration sessions to 168 elapsed hours across DST and projects the effective deadline",
      "rejects one of two truly overlapping revocations at the PostgreSQL boundary",
      "rolls back every write when authoritative work fails",
      "commits logout with a durable Clerk termination and retries provider failure after restart",
      "deletes expired history on the worker path while preserving Legal Hold across leap-day and DST cases",
    ],
  });
}

async function renderedAccountSecurityJourney({ workspaceRoot }) {
  const expectedTests = [
    "server renders the Account Session journey without server secrets",
    "Account profile uses a fresh version and survives route revalidation and reload",
    "Account Session revocation persists through PostgreSQL after reload and a fresh API connection",
    "Account Session renders its loading state",
    "Account Session renders its empty state",
    "Account Session renders its error state",
    "Account Session renders its denied state",
    "Account Session renders its stale state",
    "Account Session reflows at a narrow mobile viewport",
    "API-backed Account Session route has no automated WCAG 2.2 AA violation",
  ];
  const output = await runCommand(
    workspaceRoot,
    process.execPath,
    [
      path.join(workspaceRoot, "node_modules/@playwright/test/cli.js"),
      "test",
      "apps/web/e2e/foundation.spec.ts",
      "--grep",
      "Account (Session|profile)|API-backed Account Session",
      "--reporter=line",
    ],
    "rendered Account security browser tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "rendered Account security browser tests",
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "deterministic-account-session-security-history-and-profile-v1",
  environment: "local-node-24-isolated-postgresql-and-rendered-chromium",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "ordinary-and-privileged-session-policy",
          testName:
            "enforces ordinary and privileged inactivity, absolute, and oldest-session limits",
          run: sessionPolicyMatrix,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "account-session-inspection-and-logout",
          testName:
            "inspects minimized session activity and ends one or all Docket and associated Clerk sessions",
          run: accountSecurityCommands,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "security-history-display-name-and-recovery",
          testName:
            "retains only permitted Account Security History and governs names without privileged recovery rewrites",
          run: accountHistoryAndProfile,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-allowed-denied-retry-and-failure-matrix",
          testName:
            "proves authority, stale versions, retries, conflicts, rollback, and delivery failure",
          run: authoritativeFailureMatrix,
        },
        {
          id: "durable-postgresql-retention-and-concurrency",
          testName:
            "proves durable concurrency, rollback, retention, Legal Hold, and provider retry",
          run: durableSecurityBoundary,
        },
        {
          id: "real-rendered-account-security-journey",
          testName:
            "exercises the real Account route across required states, reload, mobile, keyboard, and accessibility",
          run: renderedAccountSecurityJourney,
        },
      ],
    },
  ],
};
