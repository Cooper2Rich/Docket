import { readFile } from "node:fs/promises";
import {
  createCriterionRegistry,
  CriterionRegistryError,
} from "./criterion-registry.mjs";

export class VerificationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "VerificationError";
    this.code = code;
  }
}

export function exactSet(actual, expected, code, label) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  if (new Set(actual).size !== actual.length)
    throw new VerificationError(
      `${code}_DUPLICATE`,
      `${label} contains a duplicate ID`,
    );
  if (
    actualSorted.length !== expectedSorted.length ||
    actualSorted.some((value, index) => value !== expectedSorted[index])
  ) {
    throw new VerificationError(
      code,
      `${label} expected [${expectedSorted.join(", ")}], received [${actualSorted.join(", ")}]`,
    );
  }
}

export async function loadContract(contractPath, itemId, registryOptions = {}) {
  let contract;
  try {
    contract = JSON.parse(await readFile(contractPath, "utf8"));
  } catch (error) {
    throw new VerificationError("CONTRACT_INVALID", error.message);
  }
  if (
    !contract.items ||
    Array.isArray(contract.items) ||
    typeof contract.items !== "object"
  ) {
    throw new VerificationError(
      "CONTRACT_INVALID",
      "items must be an object keyed by item ID",
    );
  }
  const item = contract.items[itemId];
  if (!item)
    throw new VerificationError(
      "UNKNOWN_ITEM",
      `No contract exists for ${itemId}`,
    );
  if (item.id !== itemId)
    throw new VerificationError(
      "CONTRACT_ITEM_MISMATCH",
      `${itemId} resolves to ${item.id ?? "<missing>"}`,
    );
  let criterionRegistry;
  try {
    criterionRegistry = createCriterionRegistry(contract, registryOptions);
  } catch (error) {
    if (error instanceof CriterionRegistryError) {
      throw new VerificationError(error.code, error.message);
    }
    throw error;
  }
  return { contract, item, criterionRegistry };
}

export function validateSuiteContract(
  item,
  suite,
  expectedAcceptanceIds = item.acceptance_ids,
) {
  if (!suite || suite.itemId !== item.id)
    throw new VerificationError(
      "SUITE_ITEM_MISMATCH",
      `suite does not select ${item.id}`,
    );
  if (suite.contractSha256 !== item.contract_sha256) {
    throw new VerificationError(
      "STALE_CONTRACT_DIGEST",
      `suite ${suite.contractSha256 ?? "<missing>"}; contract ${item.contract_sha256}`,
    );
  }
  if (!Array.isArray(suite.criteria))
    throw new VerificationError("SUITE_INVALID", "criteria must be an array");
  exactSet(
    suite.criteria.map(({ id }) => id),
    expectedAcceptanceIds,
    "ACCEPTANCE_ID_SET_MISMATCH",
    "acceptance criteria",
  );
  for (const criterion of suite.criteria) {
    if (
      !Array.isArray(criterion.scenarios) ||
      criterion.scenarios.length === 0
    ) {
      throw new VerificationError(
        "EMPTY_SELECTED_SUITE",
        `${criterion.id} has no scenarios`,
      );
    }
    const scenarioIds = criterion.scenarios.map(({ id }) => id);
    if (new Set(scenarioIds).size !== scenarioIds.length) {
      throw new VerificationError(
        "SCENARIO_ID_SET_INVALID",
        `${criterion.id} scenarios contains a duplicate ID`,
      );
    }
    for (const scenario of criterion.scenarios) {
      if (
        !scenario.id ||
        !scenario.testName ||
        typeof scenario.run !== "function"
      ) {
        throw new VerificationError(
          "SCENARIO_INVALID",
          `${criterion.id} contains a scenario without id, testName, or runner`,
        );
      }
    }
  }
}

export function validateScenarioResult(criterionId, scenario, result) {
  if (result?.status === "skipped" || result?.skipped > 0) {
    throw new VerificationError(
      "REQUIRED_SCENARIO_SKIPPED",
      `${criterionId}/${scenario.id}`,
    );
  }
  if (result?.status === "pending" || result?.pending > 0) {
    throw new VerificationError(
      "REQUIRED_SCENARIO_PENDING",
      `${criterionId}/${scenario.id}`,
    );
  }
  if (
    result?.status === "failed" ||
    result?.failed > 0 ||
    result?.passed === false
  ) {
    throw new VerificationError(
      "ASSERTION_FAILED",
      `${criterionId}/${scenario.id}`,
    );
  }
  if (!Number.isInteger(result?.assertions) || result.assertions < 1) {
    throw new VerificationError(
      "EMPTY_SCENARIO_ASSERTIONS",
      `${criterionId}/${scenario.id}`,
    );
  }
  return {
    id: scenario.id,
    test_name: scenario.testName,
    passed: true,
    assertions: result.assertions,
    skipped: 0,
    observations: result.observations ?? [],
    ...(result.inapplicable ? { inapplicable: result.inapplicable } : {}),
  };
}

export async function executeSuite(
  item,
  suite,
  context,
  expectedAcceptanceIds = item.acceptance_ids,
) {
  validateSuiteContract(item, suite, expectedAcceptanceIds);
  const criteria = [];
  for (const criterion of suite.criteria) {
    const scenarios = [];
    for (const scenario of criterion.scenarios) {
      let result;
      try {
        result = await scenario.run(context);
      } catch (error) {
        throw new VerificationError(
          "ASSERTION_FAILED",
          `${criterion.id}/${scenario.id}: ${error.message}`,
        );
      }
      scenarios.push(validateScenarioResult(criterion.id, scenario, result));
    }
    criteria.push({
      id: criterion.id,
      passed: true,
      assertions: scenarios.reduce(
        (total, scenario) => total + scenario.assertions,
        0,
      ),
      skipped: 0,
      scenarios,
    });
  }
  return criteria;
}

export function validateCheckReceipts(item, receipts, testedHead) {
  const expectedCheckIds = item.checks.map(({ id }) => id);
  exactSet(
    Object.keys(receipts),
    expectedCheckIds,
    "CHECK_ID_SET_MISMATCH",
    "checks",
  );
  for (const check of item.checks) {
    const receipt = receipts[check.id];
    if (
      !receipt.passed ||
      receipt.exit_code !== 0 ||
      receipt.skipped !== 0 ||
      receipt.assertions < 1
    ) {
      throw new VerificationError("CHECK_FAILED", check.id);
    }
    if (!Array.isArray(receipt.test_names))
      throw new VerificationError("CHECK_TEST_NAMES_MISSING", check.id);
    if (receipt.tested_head !== testedHead)
      throw new VerificationError(
        "STALE_CHECK_RECEIPT",
        `${check.id} tested ${receipt.tested_head}`,
      );
    if (receipt.check_id !== check.id)
      throw new VerificationError(
        "CHECK_ID_MISMATCH",
        `${check.id} artifact reports ${receipt.check_id}`,
      );
  }
}
