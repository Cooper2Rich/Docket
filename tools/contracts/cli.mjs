import path from "node:path";
import { pathToFileURL } from "node:url";
import { identityAccessContractSource } from "../../packages/identity-access/src/contracts.ts";
import {
  gitHead,
  readJson,
  sha256,
  writeJsonAtomic,
} from "../lib/workspace.mjs";
import { registeredSuiteContracts } from "../verification/registry.mjs";
import {
  checkArtifacts,
  ContractGenerationError,
  writeArtifacts,
} from "./generator.mjs";

export async function runContractsCli(
  argv,
  {
    workspaceRoot = process.cwd(),
    stdout = console.log,
    stderr = console.error,
    itemId = process.env.DOCKET_VERIFY_ITEM ?? "R1-FND-004-A",
    testedHead,
    now = () => new Date().toISOString(),
  } = {},
) {
  const [command, ...rest] = argv;
  if ((command !== "generate" && command !== "check") || rest.length > 0) {
    stderr("CONTRACTS_USAGE: expected generate or check");
    return 2;
  }
  try {
    const startedAt = now();
    const sources = [identityAccessContractSource];
    const traceability = {
      queueContract: await readJson(
        path.join(
          workspaceRoot,
          "docs",
          "implementation",
          "queue-contract.json",
        ),
      ),
      sourceCoverage: await readJson(
        path.join(
          workspaceRoot,
          "docs",
          "implementation",
          "source-coverage.json",
        ),
      ),
      suites: await registeredSuiteContracts(),
    };
    const result =
      command === "generate"
        ? await writeArtifacts(workspaceRoot, sources, traceability)
        : await checkArtifacts(workspaceRoot, sources, traceability);
    if (command === "check") {
      const artifactNames = [...result.artifacts.keys()].sort();
      await writeJsonAtomic(
        path.join(
          workspaceRoot,
          ".ralph",
          "evidence",
          itemId,
          "contracts.json",
        ),
        {
          item_id: itemId,
          check_id: "contracts",
          command: "pnpm contracts check",
          tested_head: testedHead ?? gitHead(workspaceRoot),
          started_at: startedAt,
          completed_at: now(),
          passed: true,
          exit_code: 0,
          assertions: artifactNames.length,
          skipped: 0,
          test_names: artifactNames.map(
            (artifact) => `contract artifact matches: ${artifact}`,
          ),
          output_sha256: sha256(JSON.stringify(artifactNames)),
        },
      );
    }
    stdout(
      `CONTRACTS_${command.toUpperCase()}_OK: ${result.artifacts.size} artifacts from ${result.sourceModules.join(", ")}`,
    );
    return 0;
  } catch (error) {
    const code =
      error instanceof ContractGenerationError
        ? error.code
        : "CONTRACT_GENERATION_FAILED";
    stderr(`${code}: ${error.message}`);
    return 1;
  }
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  process.exitCode = await runContractsCli(process.argv.slice(2));
}
