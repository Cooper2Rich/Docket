import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  readJson,
  gitHead,
  sha256,
  writeJsonAtomic,
} from "../lib/workspace.mjs";
import {
  executeSuite,
  loadContract,
  validateCheckReceipts,
  VerificationError,
} from "./core.mjs";
import { loadRegisteredSuite } from "./registry.mjs";

function relativeArtifact(workspaceRoot, artifactPath) {
  return path.relative(workspaceRoot, artifactPath).replaceAll(path.sep, "/");
}

function serializedJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || !value || value.startsWith("--")) {
      throw new VerificationError(
        "VERIFY_ITEM_USAGE",
        "expected --id <item> --contract <path>",
      );
    }
    if (values.has(flag))
      throw new VerificationError(
        "VERIFY_ITEM_USAGE",
        `duplicate argument ${flag}`,
      );
    values.set(flag, value);
  }
  const unexpected = [...values.keys()].filter(
    (flag) => flag !== "--id" && flag !== "--contract",
  );
  if (
    unexpected.length > 0 ||
    !values.get("--id") ||
    !values.get("--contract")
  ) {
    throw new VerificationError(
      "VERIFY_ITEM_USAGE",
      "expected --id <item> --contract <path>",
    );
  }
  return { itemId: values.get("--id"), contractPath: values.get("--contract") };
}

async function readExistingCheckReceipts(item, evidenceDirectory) {
  const receipts = {};
  for (const check of item.checks) {
    if (check.id === "item") continue;
    try {
      receipts[check.id] = await readJson(
        path.join(evidenceDirectory, `${check.id}.json`),
      );
    } catch (error) {
      throw new VerificationError(
        "MISSING_CHECK_ARTIFACT",
        `${check.id}: ${error.message}`,
      );
    }
  }
  return receipts;
}

export async function verifyItem({
  workspaceRoot,
  itemId,
  contractPath,
  evidenceRoot = path.join(workspaceRoot, ".ralph", "evidence"),
  suiteLoader = loadRegisteredSuite,
  testedHead = gitHead(workspaceRoot),
  checkReceipts,
  prNumber = process.env.DOCKET_PR_NUMBER
    ? Number(process.env.DOCKET_PR_NUMBER)
    : null,
}) {
  const resolvedContractPath = path.resolve(workspaceRoot, contractPath);
  const { item } = await loadContract(resolvedContractPath, itemId);
  const suite = await suiteLoader(itemId);
  const criteria = await executeSuite(item, suite, {
    workspaceRoot,
    item,
    testedHead,
  });
  const evidenceDirectory = path.join(evidenceRoot, itemId);
  const receipts =
    checkReceipts ?? (await readExistingCheckReceipts(item, evidenceDirectory));
  const criterionArtifacts = [];

  for (const criterion of criteria) {
    const artifactPath = path.join(
      evidenceDirectory,
      `${criterion.id.slice(criterion.id.lastIndexOf("/") + 1).toLowerCase()}.json`,
    );
    const artifact = {
      item_id: itemId,
      acceptance_id: criterion.id,
      contract_sha256: item.contract_sha256,
      tested_head: testedHead,
      fixture: suite.fixture,
      environment: suite.environment,
      passed: true,
      assertions: criterion.assertions,
      skipped: 0,
      scenarios: criterion.scenarios,
    };
    criterionArtifacts.push({ criterion, artifactPath, artifact });
  }

  const itemCheck = item.checks.find(({ id }) => id === "item");
  if (!itemCheck)
    throw new VerificationError(
      "CHECK_ID_SET_MISMATCH",
      "contract does not define the item check",
    );
  const itemArtifactPath = path.join(evidenceDirectory, "item.json");
  receipts.item = {
    item_id: itemId,
    check_id: "item",
    command: itemCheck.command,
    tested_head: testedHead,
    passed: true,
    exit_code: 0,
    assertions: criteria.reduce(
      (total, criterion) => total + criterion.assertions,
      0,
    ),
    skipped: 0,
    test_names: criteria.flatMap(({ scenarios }) =>
      scenarios.map(({ test_name: testName }) => testName),
    ),
  };
  validateCheckReceipts(item, receipts, testedHead);

  for (const { artifactPath, artifact } of criterionArtifacts)
    await writeJsonAtomic(artifactPath, artifact);
  await writeJsonAtomic(itemArtifactPath, receipts.item);

  const acceptance = {
    item_id: itemId,
    contract_sha256: item.contract_sha256,
    tested_head: testedHead,
    pr_number: Number.isInteger(prNumber) && prNumber > 0 ? prNumber : null,
    acceptance_criteria: criterionArtifacts.map(
      ({ criterion, artifactPath, artifact }) => ({
        id: criterion.id,
        passed: true,
        scenario_ids: criterion.scenarios.map(({ id }) => id),
        test_names: criterion.scenarios.map(
          ({ test_name: testName }) => testName,
        ),
        assertions: criterion.assertions,
        skipped: 0,
        artifact: relativeArtifact(workspaceRoot, artifactPath),
        sha256: sha256(serializedJson(artifact)),
      }),
    ),
    checks: item.checks.map((check) => {
      const receipt = receipts[check.id];
      const artifactPath = path.join(evidenceDirectory, `${check.id}.json`);
      return {
        id: check.id,
        command: check.command,
        passed: true,
        exit_code: 0,
        artifact: relativeArtifact(workspaceRoot, artifactPath),
        sha256: sha256(serializedJson(receipt)),
      };
    }),
  };
  const acceptancePath = path.join(evidenceDirectory, "acceptance.json");
  await writeJsonAtomic(acceptancePath, acceptance);
  return { acceptance, acceptancePath };
}

export async function runCli(
  argv,
  {
    workspaceRoot = process.cwd(),
    verifier = verifyItem,
    stdout = (message) => console.log(message),
    stderr = (message) => console.error(message),
  } = {},
) {
  try {
    const { itemId, contractPath } = parseArguments(argv);
    const { acceptance, acceptancePath } = await verifier({
      workspaceRoot,
      itemId,
      contractPath,
    });
    const assertions = acceptance.acceptance_criteria.reduce(
      (total, criterion) => total + criterion.assertions,
      0,
    );
    stdout(
      `ITEM_VERIFIED: ${itemId}; ${assertions} assertions; evidence ${relativeArtifact(workspaceRoot, acceptancePath)}`,
    );
    return 0;
  } catch (error) {
    const code =
      error instanceof VerificationError ? error.code : "VERIFY_ITEM_FAILED";
    stderr(`${code}: ${error.message}`);
    return 1;
  }
}

if (
  import.meta.url ===
  pathToFileURL(process.argv[1] ? path.resolve(process.argv[1]) : "").href
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
