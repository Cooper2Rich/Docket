# R1-CMP-016-B: Approve and publish unified Final Results

Parent: R1-CMP-016 · Order: 890 · Owner: competition · Stage: 07 Awards and closure

Release requirements: R1-LIFE-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-016-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-016-B/AC-01** — Director approves one exact ready artifact; Director or publication staff publishes standings, elimination outcomes and enabled awards as the same coherent Final Results version.
- **R1-CMP-016-B/AC-02** — Publish the allowed public projection and notifications, retain all prior versions and source lineage, and reject direct award publication or stale approval.
- **R1-CMP-016-B/AC-03** — A later authorized correction requires new readiness, approval, republication and public changed-value notice. Final Results publication is competitive completion and never implicitly closes the tournament.
- **R1-CMP-016-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: Final Results transitions; migrations; completeness review and approval UI.
- Interfaces: EvaluateCompetitiveCompleteness; PrepareFinalResults; ApproveFinalResults; PublishFinalResults.
- Schemas: CompetitiveCompletenessReview; FinalResultsDraft; FinalResultsProjection.
- Tables: competition_final_result_versions; competition_final_result_approvals.
- Events: FinalResultsPrepared; FinalResultsApproved; FinalResultsPublished.
- Errors: COMPETITION_INCOMPLETE; FINAL_RESULTS_SOURCE_STALE; FINAL_RESULTS_UNAPPROVED.
- Audiences: Public Viewer; participant; School; authorized staff.
- Risks: premature publication; private metadata exposure; stale approval.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-016-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-CMP-016-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0018-gate-and-version-final-results.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0018-gate-and-version-final-results.md): ; Gate and version final results; Consequences. Clauses: SRC-fede0133-001, SRC-fede0133-002, SRC-fede0133-003, SRC-fede0133-004, SRC-fede0133-005, SRC-fede0133-006, SRC-fede0133-007, SRC-fede0133-008, SRC-fede0133-009, SRC-fede0133-010, SRC-fede0133-011, SRC-fede0133-012, SRC-fede0133-013, SRC-fede0133-014, SRC-fede0133-015, SRC-fede0133-016, SRC-fede0133-017, SRC-fede0133-018, SRC-fede0133-019, SRC-fede0133-020, SRC-fede0133-021, SRC-fede0133-022, SRC-fede0133-023, SRC-fede0133-024, SRC-fede0133-025, SRC-fede0133-026.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Tournament operations delegation. Clauses: SRC-3aa2b898-190, SRC-3aa2b898-191, SRC-3aa2b898-192.
- [wiki/final-results-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/final-results-model.md): Publication readiness; Draft validation, approval, and publication; Public results and restricted evidence. Clauses: SRC-0475ebc0-001, SRC-0475ebc0-002, SRC-0475ebc0-003, SRC-0475ebc0-004, SRC-0475ebc0-005, SRC-0475ebc0-006, SRC-0475ebc0-007, SRC-0475ebc0-008, SRC-0475ebc0-009, SRC-0475ebc0-010, SRC-0475ebc0-011, SRC-0475ebc0-012, SRC-0475ebc0-013, SRC-0475ebc0-014, SRC-0475ebc0-015, SRC-0475ebc0-016, SRC-0475ebc0-017, SRC-0475ebc0-018, SRC-0475ebc0-019, SRC-0475ebc0-020, SRC-0475ebc0-021, SRC-0475ebc0-022, SRC-0475ebc0-023, SRC-0475ebc0-024, SRC-0475ebc0-025, SRC-0475ebc0-026, SRC-0475ebc0-027, SRC-0475ebc0-028, SRC-0475ebc0-029, SRC-0475ebc0-030, SRC-0475ebc0-031, SRC-0475ebc0-032, SRC-0475ebc0-033, SRC-0475ebc0-034, SRC-0475ebc0-035.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
