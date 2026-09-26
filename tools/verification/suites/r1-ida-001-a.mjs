import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-IDA-001-A";
const contractSha256 =
  "4289a9651290c09d8f9fa90988a57ce2b1dc1a1c82011a0baa8964f6abb930a4";

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
    "identity behavior tests",
  );
  return requireObservedTests(output, expectedTests, "identity behavior tests");
}

async function stableAccountMapping({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "apps/api/src/server.test.ts",
    ],
    expectedTests: [
      "maps one stable Clerk user to one role-free Account across mutable profile changes",
      "accepts a refreshed token for the same live Clerk and Docket session",
      "advances beyond the first signed token expiry and accepts a refreshed token for the same Docket Session",
      "creates, lists, and revokes Docket Sessions through generated body-aware client methods",
    ],
  });
}

async function requestAuthenticationAndWebhookBoundary({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "apps/api/src/server.test.ts",
      "apps/web/app/routes/account-sessions.test.tsx",
    ],
    expectedTests: [
      "accepts Google and verified-email identities only from signed request-time evidence",
      "rejects invalid signature evidence",
      "rejects invalid issuer evidence",
      "rejects invalid audience evidence",
      "rejects invalid authorized party evidence",
      "rejects invalid inactive session evidence",
      "rejects invalid origin evidence",
      "distinguishes expired session evidence",
      "uses the live Clerk session lifetime rather than the short-lived token lifetime",
      "accepts a refreshed token for the same live Clerk and Docket session",
      "resumes only an already-active Docket session during provider unavailability",
      "rejects signed-token boundary failures through the actual Clerk middleware",
      "advances beyond the first signed token expiry and accepts a refreshed token for the same Docket Session",
      "validates Clerk SDK evidence on both session route generations and persists the live session lifetime",
      "rejects invalid signature evidence at the Clerk SDK request boundary",
      "rejects invalid issuer evidence at the Clerk SDK request boundary",
      "rejects invalid audience evidence at the Clerk SDK request boundary",
      "rejects invalid authorized party evidence at the Clerk SDK request boundary",
      "rejects invalid expiry evidence at the Clerk SDK request boundary",
      "rejects invalid inactive session evidence at the Clerk SDK request boundary",
      "rejects an untrusted request origin before invoking a session command",
      "continues an existing Docket session during a Clerk outage without creating new authority",
      "continues an existing Docket session for the installed Clerk SDK network-error shape",
      "does not treat an inaccessible Clerk identity as a provider outage",
      "lets an inactive provider session deny access when the User lookup is unavailable",
      "denies fallback for elapsed and invalid provider-session lifetimes when the User lookup is unavailable",
      "lets a banned provider User deny access when the Session lookup is unavailable",
      "does not classify an unknown provider exception as an outage",
      "does not classify an arbitrary Clerk unexpected error as an outage",
      "forwards the native Clerk session token without requesting a custom JWT template",
      "rejects a hostile browser origin before parsing or dispatching the mutation",
      "verifies and idempotently records a sanitized hint without creating request authority",
      "rejects an unverified event before it reaches the durable hint queue",
    ],
  });
}

async function basicAccountAndFixedIdentityBoundary({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "apps/api/src/server.test.ts",
      "apps/api/src/e2e-server-policy.test.ts",
    ],
    expectedTests: [
      "accepts Google and verified-email identities only from signed request-time evidence",
      "maps one stable Clerk user to one role-free Account across mutable profile changes",
      "forbids the fixed adapter before staging or production can serve",
      "rejects fixed identity requested through a header or query parameter",
      "rejects staging and production before the fixed identity server starts",
    ],
  });
}

async function authoritativeCommandMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    files: [
      "packages/identity-access/src/identity-service.test.ts",
      "packages/identity-access/src/webhook-hints.test.ts",
      "apps/api/src/server.test.ts",
      "apps/worker/src/index.test.ts",
    ],
    expectedTests: [
      "returns an equivalent retry and rejects conflicting reuse of its command key",
      "rolls Account, link, Session, receipt, and event writes back atomically",
      "lists only the Account holder's sessions and rejects stale revocation",
      "rejects a revocation when the acting Docket Session is not active",
      "accepts an equivalent delivery once without storing provider payload or authority",
      "rejects a conflicting reuse of the provider delivery identifier",
      "records a delivery failure and makes the hint available for retry",
      "returns the stable authentication error without invoking session commands",
      "returns the stable stale-authority response for a conflicting session version",
      "delivers one sanitized hint through the worker boundary",
      "keeps polling across transient infrastructure failure and stops cleanly",
    ],
  });
}

async function durablePersistenceMatrix({ workspaceRoot }) {
  return runVitest(workspaceRoot, {
    config: "vitest.integration.config.mts",
    files: [
      "packages/identity-access/src/postgres-identity-store.integration.test.ts",
      "apps/worker/src/index.integration.test.ts",
    ],
    expectedTests: [
      "persists one stable Account, sessions, immutable events, and equivalent receipts",
      "rejects one of two truly overlapping revocations at the PostgreSQL boundary",
      "rolls back every write when authoritative work fails",
      "persists idempotent webhook hints and retries delivery failure after restart",
      "retries and completes a durable PostgreSQL hint through the polling lifecycle",
    ],
  });
}

async function renderedAccountSessionJourney({ workspaceRoot }) {
  const expectedTests = [
    "server renders the Account Session journey without server secrets",
    "Account Session renders its loading state",
    "Account Session renders its empty state",
    "Account Session renders its error state",
    "Account Session renders its denied state",
    "Account Session renders its stale state",
    "Account Session revocation persists through PostgreSQL after reload and a fresh API connection",
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
      "Account Session",
      "--reporter=line",
    ],
    "rendered Account Session browser tests",
  );
  return requireObservedTests(
    output,
    expectedTests,
    "rendered Account Session browser tests",
  );
}

export default {
  itemId,
  contractSha256,
  fixture: "deterministic-clerk-account-session-and-webhook-v1",
  environment: "local-node-24-isolated-postgresql-and-rendered-chromium",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "stable-clerk-account-mapping",
          testName:
            "preserves one Docket Account across mutable Clerk profile data and session API use",
          run: stableAccountMapping,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "request-evidence-and-advisory-webhooks",
          testName:
            "rejects invalid request-time Clerk evidence and keeps verified webhooks idempotent and non-authoritative",
          run: requestAuthenticationAndWebhookBoundary,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "role-free-basic-account-and-environment-gate",
          testName:
            "accepts supported Clerk sign-in methods without authority and rejects fixed identity in production",
          run: basicAccountAndFixedIdentityBoundary,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "authoritative-command-concurrency-and-delivery",
          testName:
            "proves allowed and denied commands, stale versions, equivalent retries, conflicts, rollback, and delivery failure",
          run: authoritativeCommandMatrix,
        },
        {
          id: "durable-postgresql-restart-boundary",
          testName:
            "proves persistence, rollback, sanitized storage, immutable events, and delivery retry after restart",
          run: durablePersistenceMatrix,
        },
        {
          id: "real-rendered-session-route",
          testName:
            "exercises the real server-rendered Account Session route across required states, mobile, keyboard, and accessibility",
          run: renderedAccountSessionJourney,
        },
      ],
    },
  ],
};
