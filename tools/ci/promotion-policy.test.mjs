import { describe, expect, it } from "vitest";
import { REQUIRED_CHECKS } from "./policy.mjs";
import {
  BOOTSTRAP_BRANCH,
  BOOTSTRAP_ITEMS,
  recordPromotionCompletion,
  validateCurrentHeadChecks,
  validateMainAncestry,
  validateMainProtectionSnapshot,
  validatePromotionCandidate,
} from "./promotion-policy.mjs";

const head = "a".repeat(40);
const mergeCommit = "b".repeat(40);

function protectionFixture() {
  return {
    repository: {
      full_name: "Cooper2Rich/Docket",
      visibility: "public",
      private: false,
      token: "must-not-appear",
    },
    branch: "main",
    protection: {
      required_status_checks: {
        strict: true,
        contexts: REQUIRED_CHECKS.map(({ name }) => name),
      },
      required_pull_request_reviews: {
        required_approving_review_count: 0,
        dismiss_stale_reviews: true,
        bypass_pull_request_allowances: { users: [], teams: [], apps: [] },
      },
      required_conversation_resolution: { enabled: true },
      enforce_admins: { enabled: true },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
    },
    rulesets: [],
  };
}

function successfulRuns() {
  return REQUIRED_CHECKS.map(({ name }, index) => ({
    id: index + 1,
    name,
    head_sha: head,
    status: "completed",
    conclusion: "success",
  }));
}

describe("main protection read-back", () => {
  it("accepts all eleven exact contexts and the zero-approval protected policy", () => {
    const result = validateMainProtectionSnapshot(protectionFixture());

    expect(result.required_contexts).toEqual(
      REQUIRED_CHECKS.map(({ name }) => name),
    );
    expect(result).toMatchObject({
      repository: "Cooper2Rich/Docket",
      visibility: "public",
      required_pull_requests: true,
      required_approvals: 0,
      administrator_enforcement: true,
      bypass_actors: [],
    });
  });

  it("rejects weakened protection, private visibility, and bypass actors", () => {
    const cases = [
      (fixture) => fixture.protection.required_status_checks.contexts.pop(),
      (fixture) => (fixture.protection.required_status_checks.strict = false),
      (fixture) =>
        (fixture.protection.required_conversation_resolution.enabled = false),
      (fixture) => (fixture.protection.enforce_admins.enabled = false),
      (fixture) => (fixture.protection.allow_force_pushes.enabled = true),
      (fixture) => (fixture.protection.allow_deletions.enabled = true),
      (fixture) =>
        fixture.protection.required_pull_request_reviews.bypass_pull_request_allowances.users.push(
          { login: "owner" },
        ),
      (fixture) => (fixture.repository.private = true),
    ];

    for (const mutate of cases) {
      const fixture = protectionFixture();
      mutate(fixture);
      expect(() => validateMainProtectionSnapshot(fixture)).toThrow();
    }
  });

  it("returns allowlisted public metadata without copying secrets", () => {
    const result = validateMainProtectionSnapshot(protectionFixture());

    expect(JSON.stringify(result)).not.toContain("must-not-appear");
    expect(Object.keys(result).sort()).toEqual(
      [
        "administrator_enforcement",
        "branch",
        "bypass_actors",
        "deletions",
        "force_pushes",
        "repository",
        "required_approvals",
        "required_contexts",
        "required_pull_requests",
        "resolved_conversations",
        "strict",
        "visibility",
      ].sort(),
    );
  });
});

describe("bootstrap-to-main promotion", () => {
  it("blocks merge when any current-head required check is absent or unsuccessful", () => {
    const missing = successfulRuns();
    missing.pop();
    expect(() =>
      validateCurrentHeadChecks({ head, checkRuns: missing }),
    ).toThrowError(expect.objectContaining({ code: "REQUIRED_CHECK_MISSING" }));

    const failed = successfulRuns();
    failed[0].conclusion = "failure";
    expect(() =>
      validateCurrentHeadChecks({ head, checkRuns: failed }),
    ).toThrowError(expect.objectContaining({ code: "REQUIRED_CHECK_MISSING" }));

    const stale = successfulRuns();
    stale[0].head_sha = "c".repeat(40);
    expect(() =>
      validateCurrentHeadChecks({ head, checkRuns: stale }),
    ).toThrowError(expect.objectContaining({ code: "REQUIRED_CHECK_MISSING" }));
  });

  it("accepts the exact completed bootstrap head only for the promotion item", () => {
    const candidate = {
      itemId: "R1-FND-005-B",
      sourceBranch: BOOTSTRAP_BRANCH,
      targetBranch: "main",
      branchBase: head,
      bootstrapHead: head,
      completedBootstrapItems: BOOTSTRAP_ITEMS,
    };

    expect(validatePromotionCandidate(candidate)).toMatchObject({
      item_id: "R1-FND-005-B",
      bootstrap_head: head,
    });
    expect(() =>
      validatePromotionCandidate({ ...candidate, itemId: "R1-IDA-001-A" }),
    ).toThrowError(
      expect.objectContaining({ code: "BOOTSTRAP_EXCEPTION_EXPIRED" }),
    );
    expect(() =>
      validatePromotionCandidate({
        ...candidate,
        branchBase: "c".repeat(40),
      }),
    ).toThrowError(expect.objectContaining({ code: "STALE_BOOTSTRAP_HEAD" }));
  });

  it("verifies main ancestry and makes equivalent completion retries idempotent", () => {
    const completion = validateMainAncestry({
      bootstrapHead: head,
      mergeCommit,
      ancestry: [mergeCommit, head],
    });
    const first = recordPromotionCompletion(null, completion);
    const retry = recordPromotionCompletion(first, completion);

    expect(retry).toEqual(first);
    expect(() =>
      recordPromotionCompletion(first, {
        ...completion,
        merge_commit: "c".repeat(40),
      }),
    ).toThrowError(
      expect.objectContaining({ code: "CONFLICTING_PROMOTION_COMPLETION" }),
    );
    expect(() =>
      validateMainAncestry({
        bootstrapHead: head,
        mergeCommit,
        ancestry: [mergeCommit],
      }),
    ).toThrowError(
      expect.objectContaining({ code: "PROMOTION_ANCESTRY_MISSING" }),
    );
  });
});
