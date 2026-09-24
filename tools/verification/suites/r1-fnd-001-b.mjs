import { execFile } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { readJson } from "../../lib/workspace.mjs";

const execFileAsync = promisify(execFile);
const itemId = "R1-FND-001-B";
const contractSha256 =
  "50bca3acb9c07622afb4021c7d02c4c78bd9c680fd7cbee4ba4b588df3c1c9ca";

function passing(assertions, observations, extra = {}) {
  return { assertions, observations, ...extra };
}

async function checkedInWebFoundation({ workspaceRoot }) {
  const [rootManifest, webManifest, components, routerConfig, buttonSource] =
    await Promise.all([
      readJson(path.join(workspaceRoot, "package.json")),
      readJson(path.join(workspaceRoot, "apps/web/package.json")),
      readJson(path.join(workspaceRoot, "apps/web/components.json")),
      readFile(
        path.join(workspaceRoot, "apps/web/react-router.config.ts"),
        "utf8",
      ),
      readFile(
        path.join(workspaceRoot, "apps/web/app/components/ui/button.tsx"),
        "utf8",
      ),
    ]);
  const assertions = [
    components.style === "base-nova",
    components.rsc === false,
    components.tsx === true,
    components.tailwind?.baseColor === "neutral",
    components.tailwind?.cssVariables === true,
    components.iconLibrary === "lucide",
    webManifest.dependencies?.["@base-ui/react"] === "1.8.0",
    webManifest.dependencies?.["@vercel/react-router"] === "1.3.6",
    webManifest.dependencies?.["lucide-react"] === "1.41.0",
    webManifest.devDependencies?.tailwindcss === "4.3.3",
    rootManifest.scripts?.["ui:add"] === "pnpm --dir apps/web exec shadcn add",
    routerConfig.includes("ssr: true"),
    routerConfig.includes("vercelPreset()"),
    buttonSource.includes("@base-ui/react/button"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the pinned shadcn/React Router foundation drifted");
  }
  return passing(assertions.length, [
    "base-nova Base UI source with neutral CSS-variable tokens",
    "Tailwind 4 and Lucide pins",
    "rsc=false TypeScript configuration",
    "pinned ui:add command",
    "React Router SSR with the Vercel preset",
  ]);
}

async function vercelBuildOutput({ workspaceRoot }) {
  const resultPath = path.join(
    workspaceRoot,
    "apps/web/.vercel/react-router-build-result.json",
  );
  const clientDirectory = path.join(workspaceRoot, "apps/web/build/client");
  const serverDirectory = path.join(workspaceRoot, "apps/web/build/server");
  await Promise.all([
    access(resultPath),
    access(clientDirectory),
    access(serverDirectory),
  ]);
  const [result, clientFiles, serverFiles] = await Promise.all([
    readJson(resultPath),
    readdir(clientDirectory, { recursive: true }),
    readdir(serverDirectory, { recursive: true }),
  ]);
  const assertions = [
    Object.keys(result).length > 0,
    clientFiles.some((file) => file.endsWith(".js")),
    clientFiles.some((file) => file.endsWith(".css")),
    serverFiles.some((file) => file.endsWith("index.js")),
  ];
  if (assertions.includes(false)) {
    throw new Error("the Vercel SSR build output is incomplete");
  }
  return passing(assertions.length, [
    "apps/web/.vercel/react-router-build-result.json",
    `${clientFiles.length} client build entries`,
    `${serverFiles.length} server build entries`,
  ]);
}

async function runPlaywright(workspaceRoot, grep, expectedPasses) {
  const cli = path.join(workspaceRoot, "node_modules/@playwright/test/cli.js");
  try {
    const result = await execFileAsync(
      process.execPath,
      [
        cli,
        "test",
        "apps/web/e2e/foundation.spec.ts",
        "--reporter=line",
        "--grep",
        grep,
      ],
      {
        cwd: workspaceRoot,
        encoding: "utf8",
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    const output = `${result.stdout}${result.stderr}`;
    if (!new RegExp(`\\b${expectedPasses} passed\\b`, "u").test(output)) {
      throw new Error(
        `Playwright omitted the expected ${expectedPasses} passes: ${output.slice(-2000)}`,
      );
    }
    return passing(expectedPasses, [
      `Playwright ${expectedPasses} passed`,
      `grep: ${grep}`,
    ]);
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    throw new Error(
      `Playwright failed: ${output.slice(-3000) || error.message}`,
      { cause: error },
    );
  }
}

async function executableE2eSeam({ workspaceRoot }) {
  const [rootManifest, webManifest, config, spec] = await Promise.all([
    readJson(path.join(workspaceRoot, "package.json")),
    readJson(path.join(workspaceRoot, "apps/web/package.json")),
    readFile(path.join(workspaceRoot, "playwright.config.ts"), "utf8"),
    readFile(
      path.join(workspaceRoot, "apps/web/e2e/foundation.spec.ts"),
      "utf8",
    ),
  ]);
  const assertions = [
    rootManifest.scripts?.["test:e2e"] ===
      "node tools/run-check.mjs e2e pnpm exec playwright test",
    rootManifest.devDependencies?.["@playwright/test"] === "1.63.0",
    webManifest.devDependencies?.["@playwright/test"] === "1.63.0",
    webManifest.devDependencies?.["axe-core"] === "4.13.0",
    config.includes('testDir: "./apps/web/e2e"'),
    config.includes("webServer:"),
    spec.includes('from "@playwright/test"'),
    spec.includes('from "axe-core"'),
    spec.includes("engine.run(document"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the Playwright accessibility command seam drifted");
  }
  return passing(assertions.length, [
    "root test:e2e receipt-producing command",
    "pinned Playwright and axe dependencies",
    "real SSR/hydration/browser/accessibility test source",
  ]);
}

async function domainCategoriesInapplicable({ workspaceRoot }) {
  const [item, repositoryMap] = await Promise.all([
    readFile(
      path.join(workspaceRoot, "docs/implementation/items/R1-FND-001-B.md"),
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
    repositoryMap.includes("Applications own no authoritative domain tables"),
    repositoryMap.includes("no authoritative domain calculation"),
    repositoryMap.includes("authorization rule"),
    repositoryMap.includes("direct database access"),
  ];
  if (assertions.includes(false)) {
    throw new Error("the source-backed applicability boundary changed");
  }
  return passing(
    assertions.length,
    [
      "apps/web is a presentation adapter and introduces no authoritative command",
      "this leaf introduces no table, event, queue delivery, retention record, or Legal Hold",
      "denied and stale presentation states are browser-tested without claiming backend authority",
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
          "R1-FND-001-B creates only the server-rendered web presentation foundation; the accepted repository map forbids apps/web from owning authorization, authoritative domain behavior, direct persistence, durable delivery, or retention state.",
        sources: [
          "docs/implementation/items/R1-FND-001-B.md#affected-design-contracts",
          "docs/architecture/repository-map.md#appsweb",
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
  fixture: "foundation-web-v1",
  environment: "local-node-24-edge-playwright",
  criteria: [
    {
      id: `${itemId}/AC-01`,
      scenarios: [
        {
          id: "pinned-shadcn-react-router-foundation",
          testName:
            "pins the checked-in Base UI shadcn source and React Router Vercel SSR configuration",
          run: checkedInWebFoundation,
        },
        {
          id: "vercel-ssr-build-output",
          testName: "produces nonempty Vercel client and server build outputs",
          run: vercelBuildOutput,
        },
      ],
    },
    {
      id: `${itemId}/AC-02`,
      scenarios: [
        {
          id: "ssr-hydration-navigation-accessibility",
          testName:
            "executes SSR hydration keyboard navigation and WCAG 2.2 AA browser checks",
          run: ({ workspaceRoot }) =>
            runPlaywright(
              workspaceRoot,
              "server renders|hydrates and navigates|WCAG 2.2 AA",
              8,
            ),
        },
      ],
    },
    {
      id: `${itemId}/AC-03`,
      scenarios: [
        {
          id: "playwright-accessibility-command-seam",
          testName:
            "wires pinned Playwright and axe packages to a real root browser-test command",
          run: executableE2eSeam,
        },
      ],
    },
    {
      id: `${itemId}/AC-04`,
      scenarios: [
        {
          id: "rendered-boundary-state-journey",
          testName:
            "executes denied stale loading empty error mobile and keyboard browser states",
          run: ({ workspaceRoot }) =>
            runPlaywright(
              workspaceRoot,
              "hydrates and navigates|narrow mobile",
              2,
            ),
        },
        {
          id: "authoritative-domain-category-applicability",
          testName:
            "records the source-backed authoritative domain applicability boundary",
          run: domainCategoriesInapplicable,
        },
      ],
    },
  ],
};
