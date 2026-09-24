# R1-CMP-015-A: Validate and accept the two supported award families

Parent: R1-CMP-015 · Order: 480 · Owner: competition · Stage: 07 Awards and closure

Release requirements: R1-LIFE-001, R1-COMP-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-013-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-015-A/AC-01** — Director controls/upload create a separate declarative Award Plan with compatible standings/advancement references, stable categories, recipient counts/bands, eligibility and complete tie handling.
- **R1-CMP-015-A/AC-02** — Release 1 permits only elimination-placement and preliminary-Speaker awards, either disabled; reject School/team sweepstakes, narrative awards, arbitrary expressions, hidden recipients and elimination points.
- **R1-CMP-015-A/AC-03** — Synthetic preview exposes every candidate, exclusion, source, tie and recipient; Director accepts the exact version before first-pairing atomic lock. No separate award-publication authority is introduced.
- **R1-CMP-015-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: award schema; calculator and vectors; migrations; plan and preview UI.
- Interfaces: ValidateAwardPlan; AcceptAwardPlan; CalculateAwardResults; CorrectAwardPlan.
- Schemas: AwardPlan; AwardResult; SpeakerAward.
- Tables: competition_award_plans; competition_award_results.
- Events: AwardPlanLocked; AwardResultsCalculated; AwardResultsCorrected.
- Errors: AWARD_PLAN_INVALID; AWARD_SOURCE_INCOMPLETE; AWARD_CORRECTION_PROHIBITED.
- Audiences: Public Viewer; affected participants; authorized staff.
- Risks: subjective award; hidden recipient; stale result.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-015-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-CMP-015-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0019-use-a-separate-award-plan.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0019-use-a-separate-award-plan.md): ; Use a separate Award Plan; Consequences. Clauses: SRC-652a9c3d-001, SRC-652a9c3d-002, SRC-652a9c3d-003, SRC-652a9c3d-004, SRC-652a9c3d-005, SRC-652a9c3d-006, SRC-652a9c3d-007, SRC-652a9c3d-008, SRC-652a9c3d-009, SRC-652a9c3d-010, SRC-652a9c3d-011, SRC-652a9c3d-012, SRC-652a9c3d-013, SRC-652a9c3d-014, SRC-652a9c3d-015, SRC-652a9c3d-016, SRC-652a9c3d-017, SRC-652a9c3d-018, SRC-652a9c3d-019, SRC-652a9c3d-020.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Tournament operations delegation. Clauses: SRC-3aa2b898-183.
- [wiki/award-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/award-model.md): Separate award policy; Upload, validation, and preview; Acceptance and lock; First Lincoln-Douglas release. Clauses: SRC-353e0648-001, SRC-353e0648-002, SRC-353e0648-003, SRC-353e0648-004, SRC-353e0648-005, SRC-353e0648-006, SRC-353e0648-007, SRC-353e0648-008, SRC-353e0648-009, SRC-353e0648-010, SRC-353e0648-011, SRC-353e0648-012, SRC-353e0648-013, SRC-353e0648-022, SRC-353e0648-023, SRC-353e0648-024, SRC-353e0648-025, SRC-353e0648-026, SRC-353e0648-027.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
