import { REQUIRED_CHECKS } from "./policy.mjs";

export const BOOTSTRAP_BRANCH = "codex/release-1-bootstrap";
export const PROMOTION_ITEM = "R1-FND-005-B";
export const MAIN_BRANCH = "main";
export const BOOTSTRAP_ITEMS = Object.freeze([
  "R1-FND-001-A",
  "R1-FND-001-B",
  "R1-FND-002-A",
  "R1-FND-002-B",
  "R1-FND-003-A",
  "R1-FND-003-B",
  "R1-FND-004-A",
  "R1-FND-004-B",
  "R1-FND-005-A",
]);

export class PromotionPolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PromotionPolicyError";
    this.code = code;
  }
}

function requirePolicy(condition, code, message) {
  if (!condition) throw new PromotionPolicyError(code, message);
}

function exactSet(actual, expected) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  return (
    left.length === right.length &&
    new Set(left).size === left.length &&
    left.every((value, index) => value === right[index])
  );
}

function noBypassActors(value) {
  const bypass = value ?? {};
  return ["users", "teams", "apps"].every(
    (key) => !Array.isArray(bypass[key]) || bypass[key].length === 0,
  );
}

function classicPullRequests(review) {
  return (
    review?.required_approving_review_count === 0 &&
    review.dismiss_stale_reviews === true &&
    noBypassActors(review.bypass_pull_request_allowances)
  );
}

function rulesetPullRequests(rulesets) {
  return rulesets.some((ruleset) => {
    if (
      ruleset.enforcement !== "active" ||
      !ruleset.conditions?.ref_name?.include?.includes("refs/heads/main")
    ) {
      return false;
    }
    return (ruleset.rules ?? []).some((rule) => {
      const parameters = rule.parameters ?? {};
      return (
        rule.type === "pull_request" &&
        parameters.required_approving_review_count === 0 &&
        parameters.dismiss_stale_reviews_on_push === true &&
        parameters.require_code_owner_review === false &&
        parameters.require_last_push_approval === false &&
        parameters.required_review_thread_resolution === true
      );
    });
  });
}

export function validateMainProtectionSnapshot({
  repository,
  branch,
  protection,
  rulesets = [],
}) {
  requirePolicy(
    repository?.visibility === "public" && repository.private === false,
    "PUBLIC_REPOSITORY_REQUIRED",
    "the repository must remain public for protection read-back",
  );
  requirePolicy(
    branch === MAIN_BRANCH,
    "PROTECTION_BRANCH_MISMATCH",
    "protection evidence must describe main",
  );
  const statusChecks = protection?.required_status_checks ?? {};
  const expectedContexts = REQUIRED_CHECKS.map(({ name }) => name);
  requirePolicy(
    statusChecks.strict === true &&
      exactSet(statusChecks.contexts ?? [], expectedContexts),
    "REQUIRED_CHECK_MISSING",
    "main must require the eleven exact current-head contexts",
  );
  requirePolicy(
    protection?.required_conversation_resolution?.enabled === true,
    "CONVERSATION_RESOLUTION_REQUIRED",
    "main must require resolved conversations",
  );
  requirePolicy(
    protection?.enforce_admins?.enabled === true,
    "ADMINISTRATOR_ENFORCEMENT_REQUIRED",
    "main protection must apply to administrators",
  );
  requirePolicy(
    protection?.allow_force_pushes?.enabled === false &&
      protection?.allow_deletions?.enabled === false,
    "DESTRUCTIVE_BRANCH_ACTION_ALLOWED",
    "main must block force pushes and deletion",
  );
  requirePolicy(
    rulesets.every(({ bypass_actors: bypassActors }) =>
      Array.isArray(bypassActors) ? bypassActors.length === 0 : true,
    ),
    "BYPASS_ACTOR_CONFIGURED",
    "main rulesets must not define bypass actors",
  );
  requirePolicy(
    classicPullRequests(protection.required_pull_request_reviews) ||
      rulesetPullRequests(rulesets),
    "PULL_REQUEST_REQUIRED",
    "main must require pull requests under the zero-approval policy",
  );

  return {
    repository: repository.full_name,
    visibility: "public",
    branch: MAIN_BRANCH,
    strict: true,
    required_contexts: expectedContexts,
    required_pull_requests: true,
    resolved_conversations: true,
    administrator_enforcement: true,
    force_pushes: false,
    deletions: false,
    bypass_actors: [],
    required_approvals: 0,
  };
}

export function validateCurrentHeadChecks({ head, checkRuns }) {
  requirePolicy(
    /^[0-9a-f]{40}$/u.test(head),
    "INVALID_HEAD",
    "candidate head must be a full commit SHA",
  );
  const latest = new Map();
  for (const run of checkRuns ?? []) {
    if (run.head_sha !== head) continue;
    const prior = latest.get(run.name);
    if (!prior || run.id > prior.id) latest.set(run.name, run);
  }
  for (const { name } of REQUIRED_CHECKS) {
    const run = latest.get(name);
    requirePolicy(
      run?.status === "completed" && run.conclusion === "success",
      "REQUIRED_CHECK_MISSING",
      `${name} is absent, stale, incomplete, or unsuccessful`,
    );
  }
  return { tested_head: head, required_contexts: [...latest.keys()].sort() };
}

export function validatePromotionCandidate({
  itemId,
  sourceBranch,
  targetBranch,
  branchBase,
  bootstrapHead,
  completedBootstrapItems,
  priorPromotion = null,
}) {
  requirePolicy(
    itemId === PROMOTION_ITEM,
    "BOOTSTRAP_EXCEPTION_EXPIRED",
    "only R1-FND-005-B may promote the bootstrap branch",
  );
  requirePolicy(
    sourceBranch === BOOTSTRAP_BRANCH && targetBranch === MAIN_BRANCH,
    "PROMOTION_ROUTE_INVALID",
    "the one-time promotion must route bootstrap to main",
  );
  requirePolicy(
    branchBase === bootstrapHead && /^[0-9a-f]{40}$/u.test(bootstrapHead),
    "STALE_BOOTSTRAP_HEAD",
    "the candidate must start from the exact completed bootstrap head",
  );
  requirePolicy(
    exactSet(completedBootstrapItems ?? [], BOOTSTRAP_ITEMS),
    "BOOTSTRAP_INCOMPLETE",
    "every bootstrap leaf must be integrated before promotion",
  );
  requirePolicy(
    priorPromotion === null,
    "PROMOTION_ALREADY_RECORDED",
    "the bootstrap history may be promoted only once",
  );
  return {
    item_id: itemId,
    source_branch: sourceBranch,
    target_branch: targetBranch,
    bootstrap_head: bootstrapHead,
  };
}

export function validateMainAncestry({ bootstrapHead, mergeCommit, ancestry }) {
  const commits = new Set(ancestry ?? []);
  requirePolicy(
    commits.has(bootstrapHead) && commits.has(mergeCommit),
    "PROMOTION_ANCESTRY_MISSING",
    "main must contain both the exact bootstrap head and promotion merge",
  );
  return { bootstrap_head: bootstrapHead, merge_commit: mergeCommit };
}

export function recordPromotionCompletion(existing, candidate) {
  if (existing === null) return { ...candidate };
  requirePolicy(
    JSON.stringify(existing) === JSON.stringify(candidate),
    "CONFLICTING_PROMOTION_COMPLETION",
    "a different promotion completion is already recorded",
  );
  return { ...existing };
}
