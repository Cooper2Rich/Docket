import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { applicationEnvironment, readJson } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-002-A";
const contractSha256 =
  "18298c20e64ec99bfb6e30945f03de2ae122830835652b32cc461b1290d813cc";
const composeArguments = [
  "compose",
  "--project-name",
  "docket-local",
  "--file",
  "compose.yaml",
];

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function command(workspaceRoot, executable, arguments_, options = {}) {
  try {
    const result = await execFileAsync(executable, arguments_, {
      cwd: workspaceRoot,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
      shell: process.platform === "win32" && executable.endsWith(".cmd"),
      env: applicationEnvironment(process.env),
      ...options,
    });
    return {
      exitCode: 0,
      output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
    };
  } catch (error) {
    return {
      exitCode: Number.isInteger(error.code) ? error.code : 1,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`,
    };
  }
}

async function requireSuccess(workspaceRoot, executable, arguments_, label) {
  const result = await command(workspaceRoot, executable, arguments_);
  if (result.exitCode !== 0) {
    throw new Error(`${label} failed: ${result.output.slice(-3000)}`);
  }
  return result.output;
}

async function pinnedLocalTopology({ workspaceRoot }) {
  const [manifest, compose, environment, bootstrap] = await Promise.all([
    readJson(path.join(workspaceRoot, "package.json")),
    readFile(path.join(workspaceRoot, "compose.yaml"), "utf8"),
    readFile(path.join(workspaceRoot, ".env.example"), "utf8"),
    readFile(path.join(workspaceRoot, "tools/bootstrap.mjs"), "utf8"),
  ]);
  const assertions = [
    compose.includes("postgres:17.6-alpine3.22"),
    compose.includes("quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z"),
    compose.includes("axllent/mailpit:v1.27.8"),
    ["postgres-data", "minio-data", "mailpit-data"].every((volume) =>
      compose.includes(`${volume}:`),
    ),
    (compose.match(/healthcheck:/gu) ?? []).length === 3,
    manifest.scripts?.bootstrap === "node tools/bootstrap.mjs",
    manifest.scripts?.["infra:up"]?.includes("up -d --wait"),
    manifest.scripts?.["infra:down"]?.endsWith(" down"),
    !manifest.scripts?.bootstrap.includes("reset"),
    environment.includes("DOCKET_ENV=development"),
    bootstrap.includes("BOOTSTRAP_PREREQUISITE_FAILED"),
    bootstrap.includes("BOOTSTRAP_READY"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the pinned local-service bootstrap topology drifted");
  }
  return passing(assertions.length, [
    "three pinned service images",
    "three named volumes and health checks",
    "wait-for-health startup and data-preserving shutdown",
    "actionable prerequisite and readiness diagnostics",
  ]);
}

async function volumeIdentity(workspaceRoot) {
  return requireSuccess(
    workspaceRoot,
    "docker",
    [
      "volume",
      "inspect",
      "docket-local_postgres-data",
      "docket-local_minio-data",
      "docket-local_mailpit-data",
      "--format",
      "{{.Name}}={{.Mountpoint}}",
    ],
    "named-volume inspection",
  );
}

async function postgres(workspaceRoot, sql) {
  return requireSuccess(
    workspaceRoot,
    "docker",
    [
      ...composeArguments,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "docket",
      "-d",
      "docket",
      "-v",
      "ON_ERROR_STOP=1",
      "-tAc",
      sql,
    ],
    "PostgreSQL persistence probe",
  );
}

async function idempotentBootstrap({ workspaceRoot }) {
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  await requireSuccess(workspaceRoot, pnpm, ["bootstrap"], "first bootstrap");
  const before = await volumeIdentity(workspaceRoot);
  try {
    await postgres(
      workspaceRoot,
      "CREATE TABLE IF NOT EXISTS public.ralph_bootstrap_probe (id text PRIMARY KEY); INSERT INTO public.ralph_bootstrap_probe (id) VALUES ('r1-fnd-002-a') ON CONFLICT DO NOTHING;",
    );
    await requireSuccess(
      workspaceRoot,
      pnpm,
      ["bootstrap"],
      "second bootstrap",
    );
    const after = await volumeIdentity(workspaceRoot);
    const marker = await postgres(
      workspaceRoot,
      "SELECT id FROM public.ralph_bootstrap_probe WHERE id = 'r1-fnd-002-a';",
    );
    if (before.trim() !== after.trim() || !marker.includes("r1-fnd-002-a")) {
      throw new Error("a second bootstrap did not preserve service data");
    }
  } finally {
    await command(workspaceRoot, "docker", [
      ...composeArguments,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "docket",
      "-d",
      "docket",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      "DROP TABLE IF EXISTS public.ralph_bootstrap_probe;",
    ]);
  }
  return passing(5, [
    "first bootstrap succeeded",
    "second bootstrap succeeded",
    "PostgreSQL marker survived the second run",
    "PostgreSQL, MinIO, and Mailpit volume identities were preserved",
    "verification marker was removed",
  ]);
}

async function runtimeSchemasAndHealth({ workspaceRoot }) {
  const vitest = path.join(workspaceRoot, "node_modules/vitest/vitest.mjs");
  const output = await requireSuccess(
    workspaceRoot,
    process.execPath,
    [
      vitest,
      "run",
      "packages/runtime/src/index.test.ts",
      "tools/bootstrap.test.mjs",
      "--reporter=verbose",
    ],
    "runtime and bootstrap behavior tests",
  );
  const expectedTests = [
    "accepts the complete production api environment",
    "accepts the complete production worker environment",
    "accepts the complete production web environment",
    "accepts the complete production migration environment",
    "rejects unknown and malformed values without reflecting secrets",
    "rejects local adapters before production startup",
    "keeps liveness healthy while a dependency is unavailable",
    "recovers readiness when the dependency returns",
    "preserves volumes while validating every service-dependent process",
  ];
  if (!expectedTests.every((test) => output.includes(test))) {
    throw new Error(
      "runtime behavior tests omitted a required process or state",
    );
  }
  return passing(expectedTests.length, expectedTests);
}

async function dependencyReadinessRecovery({ workspaceRoot }) {
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  await requireSuccess(
    workspaceRoot,
    "docker",
    [...composeArguments, "stop", "postgres"],
    "PostgreSQL stop",
  );
  let unavailable;
  try {
    unavailable = await command(workspaceRoot, pnpm, [
      "health:check",
      "--process",
      "migration",
    ]);
    if (
      unavailable.exitCode === 0 ||
      !unavailable.output.includes('"status":"unready"') ||
      !unavailable.output.includes("DEPENDENCY_UNREADY") ||
      unavailable.output.includes("docket-local-only")
    ) {
      throw new Error("dependency outage did not fail readiness safely");
    }
  } finally {
    await requireSuccess(
      workspaceRoot,
      "docker",
      [...composeArguments, "up", "-d", "--wait", "postgres"],
      "PostgreSQL recovery",
    );
  }
  const recovered = await requireSuccess(
    workspaceRoot,
    pnpm,
    ["health:check", "--process", "migration"],
    "recovered migration readiness",
  );
  if (
    !recovered.includes('"status":"ready"') ||
    recovered.includes("docket-local-only")
  ) {
    throw new Error("readiness did not recover safely");
  }
  return passing(5, [
    "PostgreSQL stopped without terminating the process probe",
    "migration readiness failed closed with DEPENDENCY_UNREADY",
    "readiness output omitted credentials",
    "PostgreSQL restarted and reached Compose health",
    "migration readiness recovered",
  ]);
}

async function secretFreeDeterministicInstructions({ workspaceRoot }) {
  const [environment, instructions, reset] = await Promise.all([
    readFile(path.join(workspaceRoot, ".env.example"), "utf8"),
    readFile(path.join(workspaceRoot, "docs/local-development.md"), "utf8"),
    readFile(path.join(workspaceRoot, "tools/infra-reset.mjs"), "utf8"),
  ]);
  const assertions = [
    environment.includes("Synthetic local-only values"),
    !/sk_(?:live|prod)_[A-Za-z0-9_-]+/u.test(environment),
    !/AKIA[0-9A-Z]{16}/u.test(environment),
    instructions.includes("pnpm bootstrap"),
    instructions.includes("pnpm infra:down"),
    instructions.includes("pnpm infra:up"),
    instructions.includes("pnpm infra:reset"),
    instructions.includes("DEPENDENCY_UNREADY"),
    reset.includes('"docket-local"'),
    reset.includes('"--volumes"'),
  ];
  if (assertions.includes(false)) {
    throw new Error("local configuration or operating instructions drifted");
  }
  return passing(assertions.length, [
    "only synthetic local values are committed",
    "startup, data-preserving shutdown, recovery, and destructive reset are explicit",
    "reset is scoped to the fixed docket-local Compose project",
  ]);
}

async function domainCategoriesInapplicable({ workspaceRoot }) {
  const [item, repositoryMap] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-002-A.md"),
      "utf8",
    ),
    readFile(
      path.join(workspaceRoot, "docs/architecture/repository-map.md"),
      "utf8",
    ),
  ]);
  const assertions = [
    item.includes("Tables: No new tables specified"),
    item.includes("Events: No new events specified"),
    item.includes("Audiences: developers; operators"),
    repositoryMap.includes("`runtime`"),
    repositoryMap.includes("contains no domain defaults"),
    repositoryMap.includes("Applications own no authoritative domain tables"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "runtime owns process configuration and health only",
      "this leaf introduces no authoritative actor, command, table, event, delivery, retention record, or user journey",
      "bootstrap persistence and dependency recovery are exercised by AC-01 and AC-03",
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
          "R1-FND-002-A creates only developer/operator local-service, process-configuration, and health seams. The accepted runtime package owns no domain defaults or authoritative data, and the leaf defines no user-facing journey.",
        sources: [
          "docs/implementation/items/R1-FND-002-A.md#affected-design-contracts",
          "docs/architecture/repository-map.md#runtime",
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
  fixture: "foundation-local-services-v1",
  environment: "local-node-24-docker-compose",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "pinned-local-service-topology",
          testName:
            "pins PostgreSQL MinIO and Mailpit with health checks and preserved volumes",
          run: pinnedLocalTopology,
        },
        {
          id: "idempotent-data-preserving-bootstrap",
          testName:
            "runs bootstrap twice and preserves service volumes and PostgreSQL data",
          run: idempotentBootstrap,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "process-scoped-redacted-runtime-validation",
          testName:
            "executes API worker web and migration schemas plus liveness and readiness behavior",
          run: runtimeSchemasAndHealth,
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "dependency-outage-and-recovery",
          testName:
            "stops PostgreSQL and proves redacted readiness failure and recovery",
          run: dependencyReadinessRecovery,
        },
        {
          id: "secret-free-deterministic-local-operations",
          testName:
            "commits synthetic configuration and exact startup shutdown recovery and reset instructions",
          run: secretFreeDeterministicInstructions,
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
