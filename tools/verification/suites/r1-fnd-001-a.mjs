import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { acceptedApps, acceptedPackages } from "../../check-boundaries.mjs";
import { readJson } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-001-A";
const contractSha256 =
  "46620829f2d8e73bdd1c9dae66ed18c4de511ee2c0a185c9490bf8ed4994979e";

async function runNode(workspaceRoot, arguments_) {
  try {
    const result = await execFileAsync(process.execPath, arguments_, {
      cwd: workspaceRoot,
      encoding: "utf8",
      windowsHide: true,
    });
    return { exitCode: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return {
      exitCode: error.code ?? 1,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`,
    };
  }
}

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function workspaceBaseline({ workspaceRoot }) {
  const manifest = await readJson(path.join(workspaceRoot, "package.json"));
  const lockfile = await readFile(
    path.join(workspaceRoot, "pnpm-lock.yaml"),
    "utf8",
  );
  const apps = await readdir(path.join(workspaceRoot, "apps"));
  const packages = await readdir(path.join(workspaceRoot, "packages"));
  const assertions = [
    process.versions.node.startsWith("24."),
    manifest.packageManager === "pnpm@11.19.0",
    manifest.type === "module",
    /^lockfileVersion: ["']9\.0["']/u.test(lockfile),
    acceptedApps.every((name) => apps.includes(name)),
    acceptedPackages.every((name) => packages.includes(name)),
  ];
  if (assertions.includes(false)) throw new Error("workspace baseline drifted");
  return passing(assertions.length, [
    `node ${process.versions.node}`,
    manifest.packageManager,
    `${acceptedApps.length} accepted apps`,
    `${acceptedPackages.length} accepted packages`,
  ]);
}

async function focusedVitest(workspaceRoot, file, expectedText) {
  const result = await runNode(workspaceRoot, [
    path.join(workspaceRoot, "node_modules/vitest/vitest.mjs"),
    "run",
    file,
    "--reporter=verbose",
  ]);
  if (result.exitCode !== 0 || !result.output.includes(expectedText)) {
    throw new Error(
      `${file} failed or omitted ${expectedText}: ${result.output.slice(-2000)}`,
    );
  }
  return passing(2, [file, expectedText]);
}

async function acceptedShells({ workspaceRoot }) {
  const expected = [
    ...acceptedApps.map((name) => `apps/${name}/package.json`),
    ...acceptedPackages.map((name) => `packages/${name}/package.json`),
  ];
  const manifests = await Promise.all(
    expected.map((relativePath) =>
      readJson(path.join(workspaceRoot, relativePath)),
    ),
  );
  if (manifests.some((manifest) => manifest.type !== "module")) {
    throw new Error("an accepted shell is not strict ESM");
  }
  return passing(expected.length, expected);
}

async function unavailableFutureCommand({ workspaceRoot }) {
  const result = await execFileAsync(
    process.execPath,
    ["tools/unavailable-command.mjs", "migration:check", "R1-FND-002-A"],
    { cwd: workspaceRoot, encoding: "utf8", windowsHide: true },
  ).catch((error) => error);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.code === 0 || !output.includes("COMMAND_UNAVAILABLE")) {
    throw new Error("future command did not fail honestly");
  }
  return passing(2, ["nonzero exit", "COMMAND_UNAVAILABLE diagnostic"]);
}

async function domainCategoriesInapplicable({ workspaceRoot }) {
  const item = await readFile(
    path.join(workspaceRoot, "docs/implementation/items/R1-FND-001-A.md"),
    "utf8",
  );
  const repositoryMap = await readFile(
    path.join(workspaceRoot, "docs/architecture/repository-map.md"),
    "utf8",
  );
  const assertions = [
    item.includes("Tables: No new tables specified"),
    item.includes("Events: No new events specified"),
    repositoryMap.includes("Applications own no authoritative domain tables"),
    repositoryMap.includes("`database`"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "no authoritative command or actor is introduced by this workspace leaf",
      "no tables, durable events, delivery operation, retention record, or Legal Hold is introduced",
      "denied and stale presentation states are exercised separately without claiming backend authority",
    ],
    {
      inapplicable: {
        categories: [
          "allowed-and-denied-authoritative-actors",
          "stale-authority",
          "equivalent-retry",
          "conflicting-concurrent-action",
          "transaction-rollback",
          "delivery-failure",
          "persistence-retention-and-legal-hold",
        ],
        reason:
          "R1-FND-001-A creates developer/CI workspace seams only and defines no authoritative domain command, table, event, or delivery operation.",
        sources: [
          "docs/implementation/items/R1-FND-001-A.md#affected-design-contracts",
          "docs/architecture/repository-map.md#applications",
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
  fixture: "foundation-workspace-v1",
  environment: "local-node-24",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "pinned-workspace-baseline",
          testName: "pins the strict ESM workspace and accepted topology",
          run: workspaceBaseline,
        },
        {
          id: "boundary-negative-fixtures",
          testName: "rejects forbidden imports and undeclared dependencies",
          run: ({ workspaceRoot }) =>
            focusedVitest(
              workspaceRoot,
              "tools/check-boundaries.test.mjs",
              "3 passed",
            ),
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "dispatcher-fail-closed",
          testName:
            "verification dispatcher rejects every required negative fixture",
          run: ({ workspaceRoot }) =>
            focusedVitest(
              workspaceRoot,
              "tools/verification/verify-item.test.mjs",
              "10 passed",
            ),
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "accepted-application-and-package-shells",
          testName: "contains only accepted strict ESM workspace shells",
          run: acceptedShells,
        },
        {
          id: "future-command-unavailable",
          testName: "future commands fail with an owning-item diagnostic",
          run: unavailableFutureCommand,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "rendered-route-state-matrix",
          testName:
            "renders loading empty error denied stale mobile and keyboard states",
          run: ({ workspaceRoot }) =>
            focusedVitest(
              workspaceRoot,
              "apps/web/app/routes/home.test.tsx",
              "9 passed",
            ),
        },
        {
          id: "domain-behavior-applicability",
          testName:
            "records the source-backed domain behavior applicability boundary",
          run: domainCategoriesInapplicable,
        },
      ],
    },
  ],
};
