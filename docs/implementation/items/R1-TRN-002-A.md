# R1-TRN-002-A: Adopt immutable Rulesets and allowlisted overrides

Parent: R1-TRN-002 · Order: 250 · Owner: tournaments · Stage: 03 Configuration and registration

Release requirements: R1-LIFE-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-TRN-001-B.
- External/decision gates: GATE-RULESET.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-TRN-002-A/AC-01** — Import a provenance-verified NSDA Lincoln-Douglas edition as an immutable Ruleset version and choose the verified current edition for creation; future source updates never mutate existing tournaments.
- **R1-TRN-002-A/AC-02** — Director configuration accepts only the documented override categories and validates hard integrity constraints. No override may change the fixed Feedback Deadline or the already-started pairing policy.
- **R1-TRN-002-A/AC-03** — Versioned Ruleset/override output has source references and a deterministic validation report; production cannot silently use a synthetic fixture or unverified competitive rule.
- **R1-TRN-002-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: Ruleset contracts; migration; configuration UI; diff and impact previews; golden validation vectors.
- Interfaces: AdoptRuleset; ConfigureTournamentOverride; MigrateRuleset; LockRuleset; EmergencyAmendRuleset.
- Schemas: Ruleset; TournamentOverride; RulesetMigration; EmergencyAmendment.
- Tables: tournaments_rulesets; tournaments_rule_adoptions; tournaments_overrides; tournaments_emergency_amendments.
- Events: RulesetAdopted; RulesetLocked; RulesetAmended.
- Errors: RULESET_INVALID; OVERRIDE_PROHIBITED; RULESET_LOCKED; MIGRATION_INCOMPATIBLE.
- Audiences: Director; authorized staff; public human-readable summary; audit.
- Risks: unversioned external rules; silent outcome change; prohibited override.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-TRN-002-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-TRN-002-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0001-versioned-rulesets-with-audited-overrides.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0001-versioned-rulesets-with-audited-overrides.md): ; Use versioned rulesets with audited tournament overrides; Consequences. Clauses: SRC-fc3898f8-001, SRC-fc3898f8-002, SRC-fc3898f8-003, SRC-fc3898f8-004, SRC-fc3898f8-005, SRC-fc3898f8-006, SRC-fc3898f8-007, SRC-fc3898f8-008, SRC-fc3898f8-009, SRC-fc3898f8-010, SRC-fc3898f8-011, SRC-fc3898f8-012, SRC-fc3898f8-013, SRC-fc3898f8-014.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/backend-roadmap.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/backend-roadmap.md): Governing rules. Clauses: SRC-e9849887-114, SRC-e9849887-115, SRC-e9849887-116, SRC-e9849887-117, SRC-e9849887-118, SRC-e9849887-119.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
