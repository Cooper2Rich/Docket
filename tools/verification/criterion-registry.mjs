export const RELEASE_REQUIREMENT_IDS = Object.freeze([
  "R1-AUTH-001",
  "R1-COMP-001",
  "R1-CONS-001",
  "R1-DATA-001",
  "R1-LIFE-001",
  "R1-MSG-001",
  "R1-OPS-001",
  "R1-PRIV-001",
]);

const ACTIVE_SOURCE_DISPOSITIONS = new Set(["included", "included_mixed"]);

export class CriterionRegistryError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = "CriterionRegistryError";
    this.code = code;
    this.details = details;
  }
}

function exactValues(actual, expected, code, label) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  if (
    new Set(actual).size !== actual.length ||
    actualSorted.length !== expectedSorted.length ||
    actualSorted.some((value, index) => value !== expectedSorted[index])
  ) {
    throw new CriterionRegistryError(
      code,
      `${label} expected [${expectedSorted.join(", ")}], received [${actualSorted.join(", ")}]`,
    );
  }
}

function coverageStatus(graphItem, suite) {
  if (suite) return "implemented_foundation";
  return graphItem.stage === "01 Foundations"
    ? "pending_foundation"
    : "pending_domain";
}

function normalizeSuites(suites) {
  const normalized = new Map();
  for (const suite of suites ?? []) {
    if (!suite?.itemId || normalized.has(suite.itemId)) {
      throw new CriterionRegistryError(
        "CRITERION_REGISTRY_INVALID",
        `invalid or duplicate suite registration ${suite?.itemId ?? "<missing>"}`,
      );
    }
    normalized.set(suite.itemId, suite);
  }
  return normalized;
}

export function createCriterionRegistry(
  queueContract,
  { sourceCoverage = { rows: [] }, suites = [] } = {},
) {
  const items = queueContract?.items;
  const graphItems = queueContract?.execution_graph?.items;
  if (!items || Array.isArray(items) || !Array.isArray(graphItems)) {
    throw new CriterionRegistryError(
      "CRITERION_REGISTRY_INVALID",
      "queue contract must contain keyed items and execution graph items",
    );
  }
  const graphById = new Map(graphItems.map((item) => [item.id, item]));
  const suiteByItem = normalizeSuites(suites);
  const criteria = new Map();
  const requirementCriteria = new Map(
    RELEASE_REQUIREMENT_IDS.map((requirement) => [requirement, new Set()]),
  );

  for (const [itemId, item] of Object.entries(items).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const graphItem = graphById.get(itemId);
    if (!graphItem || graphItem.kind !== "leaf" || item.id !== itemId) {
      throw new CriterionRegistryError(
        "CRITERION_REGISTRY_INVALID",
        `${itemId} has no matching leaf in the execution graph`,
      );
    }
    if (
      !Array.isArray(item.acceptance_ids) ||
      item.acceptance_ids.length === 0
    ) {
      throw new CriterionRegistryError(
        "CRITERION_EVIDENCE_MISSING",
        `${itemId} has no acceptance criteria`,
      );
    }
    const itemCheck = item.checks?.find(({ id }) => id === "item");
    if (!itemCheck?.command || !Array.isArray(itemCheck.acceptance_ids)) {
      throw new CriterionRegistryError(
        "CRITERION_EVIDENCE_MISSING",
        `${itemId} has no criterion-bearing item check`,
      );
    }
    exactValues(
      itemCheck.acceptance_ids,
      item.acceptance_ids,
      "CRITERION_EVIDENCE_MISSING",
      `${itemId} item-check criteria`,
    );

    const suite = suiteByItem.get(itemId);
    if (suite) {
      if (suite.contractSha256 !== item.contract_sha256) {
        throw new CriterionRegistryError(
          "STALE_CONTRACT_DIGEST",
          `${itemId} suite ${suite.contractSha256 ?? "<missing>"}; contract ${item.contract_sha256}`,
        );
      }
      exactValues(
        suite.acceptanceIds,
        item.acceptance_ids,
        "CRITERION_EVIDENCE_MISSING",
        `${itemId} registered suite criteria`,
      );
    }

    for (const requirement of graphItem.requirements ?? []) {
      if (!requirementCriteria.has(requirement)) {
        throw new CriterionRegistryError(
          "REQUIREMENT_UNTRACED",
          `${itemId} references unknown release requirement ${requirement}`,
        );
      }
    }
    for (const criterionId of item.acceptance_ids) {
      if (criteria.has(criterionId)) {
        throw new CriterionRegistryError(
          "CRITERION_REGISTRY_INVALID",
          `duplicate acceptance criterion ${criterionId}`,
        );
      }
      const suffix = criterionId
        .slice(criterionId.lastIndexOf("/") + 1)
        .toLowerCase();
      const criterion = {
        id: criterionId,
        itemId,
        module: graphItem.owner,
        requirements: [...graphItem.requirements].sort(),
        contract: { path: item.spec, sha256: item.contract_sha256 },
        test: {
          checkId: "item",
          command: itemCheck.command,
          suite: `tools/verification/suites/${itemId.toLowerCase()}.mjs`,
          status: suite ? "registered" : "pending",
        },
        evidence: {
          criterion: `.ralph/evidence/${itemId}/${suffix}.json`,
          acceptance: `.ralph/evidence/${itemId}/acceptance.json`,
          status: suite ? "executable" : "pending",
        },
        coverageStatus: coverageStatus(graphItem, suite),
        sourceIds: [],
      };
      criteria.set(criterionId, criterion);
      for (const requirement of criterion.requirements)
        requirementCriteria.get(requirement).add(criterionId);
    }
  }

  for (const suiteItemId of suiteByItem.keys()) {
    if (!items[suiteItemId]) {
      throw new CriterionRegistryError(
        "CRITERION_REGISTRY_INVALID",
        `suite is registered for unknown item ${suiteItemId}`,
      );
    }
  }

  const excludedSources = {};
  for (const row of sourceCoverage?.rows ?? []) {
    if (row.disposition === "deferred_or_superseded") {
      if (
        row.owner !== null ||
        row.acceptance_ids?.length !== 0 ||
        !row.reason ||
        !row.authority
      ) {
        throw new CriterionRegistryError(
          "SOURCE_EXCLUSION_INVALID",
          `${row.id} is not an explicit source exclusion`,
        );
      }
      excludedSources[row.id] = {
        path: row.path,
        section: row.section,
        reason: row.reason,
        authority: row.authority,
      };
      continue;
    }
    if (!ACTIVE_SOURCE_DISPOSITIONS.has(row.disposition)) continue;
    if (!row.owner || !row.evidence || row.acceptance_ids?.length === 0) {
      throw new CriterionRegistryError(
        "CRITERION_EVIDENCE_MISSING",
        `${row.id} has no active criterion evidence`,
      );
    }
    for (const criterionId of row.acceptance_ids) {
      const criterion = criteria.get(criterionId);
      if (!criterion || criterion.itemId !== row.owner) {
        throw new CriterionRegistryError(
          "CRITERION_EVIDENCE_MISSING",
          `${row.id} references unknown or foreign criterion ${criterionId}`,
        );
      }
      if (row.evidence !== criterion.test.command) {
        throw new CriterionRegistryError(
          "CRITERION_EVIDENCE_MISSING",
          `${row.id} evidence does not match ${criterionId}`,
        );
      }
      criterion.sourceIds.push(row.id);
    }
  }
  for (const criterion of criteria.values()) criterion.sourceIds.sort();

  for (const requirement of RELEASE_REQUIREMENT_IDS) {
    if (requirementCriteria.get(requirement).size === 0) {
      throw new CriterionRegistryError(
        "REQUIREMENT_UNTRACED",
        `${requirement} has no acceptance criteria`,
      );
    }
  }

  return {
    criteria,
    excludedSources,
    acceptanceIdsForItem(itemId) {
      return [...criteria.values()]
        .filter((criterion) => criterion.itemId === itemId)
        .map(({ id }) => id);
    },
    criterionIdsForRequirement(requirement) {
      return [...(requirementCriteria.get(requirement) ?? [])].sort();
    },
  };
}
