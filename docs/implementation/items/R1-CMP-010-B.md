# R1-CMP-010-B: Draft and publish feedback under the hard seven-day deadline

Parent: R1-CMP-010 · Order: 720 · Owner: competition · Stage: 05 Preliminary competition

Release requirements: R1-LIFE-001, R1-COMP-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-010-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-010-B/AC-01** — Assigned Judge drafts privately and explicitly publishes immutable feedback versions; editing a published version leaves the previous published version visible until republication. Competitive result lock is independent.
- **R1-CMP-010-B/AC-02** — Deadline is seven calendar days in the tournament named timezone from the currently published final scheduled round end, frozen when the round ends. Prove DST and revision boundary cases; no actor may extend or bypass it.
- **R1-CMP-010-B/AC-03** — At expiry unpublished drafts remain private/incomplete with no automatic publication. Deny every write/publication after the deadline while preserving authorized historical reads; feedback does not block Final Results.
- **R1-CMP-010-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: panel calculator and vectors; Feedback transitions; migrations; participant and staff views.
- Interfaces: CalculatePanelDecision; PublishBallotFeedback; ReviseBallotFeedback; CloseFeedbackWindow.
- Schemas: PanelDecision; IrreversibleMajority; BallotFeedback; FeedbackPublication.
- Tables: competition_panel_decisions; competition_feedback_versions; competition_feedback_publications.
- Events: PanelDecisionLocked; FeedbackPublished; FeedbackDeadlineReached.
- Errors: PANEL_INCOMPLETE; FEEDBACK_DEADLINE_PASSED; JUDGE_BLINDNESS_VIOLATION.
- Audiences: individual Judge; adjudicated Competitor; current Coaching Staff; Ballot operations.
- Risks: cross-Judge disclosure; point leakage; deadline timezone error.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-010-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-CMP-010-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0009-separate-results-from-feedback.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0009-separate-results-from-feedback.md): ; Separate competitive results from ballot feedback; Consequences. Clauses: SRC-1491b3b2-001, SRC-1491b3b2-002, SRC-1491b3b2-003, SRC-1491b3b2-004, SRC-1491b3b2-005, SRC-1491b3b2-006, SRC-1491b3b2-007, SRC-1491b3b2-008, SRC-1491b3b2-009, SRC-1491b3b2-010, SRC-1491b3b2-011, SRC-1491b3b2-012, SRC-1491b3b2-013, SRC-1491b3b2-014, SRC-1491b3b2-015, SRC-1491b3b2-016, SRC-1491b3b2-017, SRC-1491b3b2-018, SRC-1491b3b2-019, SRC-1491b3b2-020, SRC-1491b3b2-021, SRC-1491b3b2-022, SRC-1491b3b2-023, SRC-1491b3b2-024, SRC-1491b3b2-025, SRC-1491b3b2-026, SRC-1491b3b2-027, SRC-1491b3b2-028, SRC-1491b3b2-029, SRC-1491b3b2-030, SRC-1491b3b2-031, SRC-1491b3b2-032, SRC-1491b3b2-033, SRC-1491b3b2-034, SRC-1491b3b2-035, SRC-1491b3b2-036, SRC-1491b3b2-037, SRC-1491b3b2-038, SRC-1491b3b2-039, SRC-1491b3b2-040, SRC-1491b3b2-041, SRC-1491b3b2-042, SRC-1491b3b2-043, SRC-1491b3b2-044, SRC-1491b3b2-045, SRC-1491b3b2-046, SRC-1491b3b2-047, SRC-1491b3b2-048, SRC-1491b3b2-049, SRC-1491b3b2-050, SRC-1491b3b2-051, SRC-1491b3b2-052, SRC-1491b3b2-053, SRC-1491b3b2-054, SRC-1491b3b2-055, SRC-1491b3b2-056, SRC-1491b3b2-057, SRC-1491b3b2-058, SRC-1491b3b2-059, SRC-1491b3b2-060, SRC-1491b3b2-061, SRC-1491b3b2-062, SRC-1491b3b2-063, SRC-1491b3b2-064, SRC-1491b3b2-065, SRC-1491b3b2-066, SRC-1491b3b2-067, SRC-1491b3b2-068, SRC-1491b3b2-069, SRC-1491b3b2-070, SRC-1491b3b2-071, SRC-1491b3b2-072, SRC-1491b3b2-073, SRC-1491b3b2-074, SRC-1491b3b2-075, SRC-1491b3b2-076, SRC-1491b3b2-077, SRC-1491b3b2-078, SRC-1491b3b2-079, SRC-1491b3b2-080, SRC-1491b3b2-081, SRC-1491b3b2-082, SRC-1491b3b2-083, SRC-1491b3b2-084, SRC-1491b3b2-085, SRC-1491b3b2-086, SRC-1491b3b2-087, SRC-1491b3b2-088, SRC-1491b3b2-089.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Judge access lifecycle. Clauses: SRC-3aa2b898-238.
- [wiki/ballot-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/ballot-model.md): Ballot components; Submission and editing; Feedback publication; Practice Ballots and feedback. Clauses: SRC-43f3ef1f-001, SRC-43f3ef1f-002, SRC-43f3ef1f-003, SRC-43f3ef1f-004, SRC-43f3ef1f-005, SRC-43f3ef1f-006, SRC-43f3ef1f-007, SRC-43f3ef1f-008, SRC-43f3ef1f-009, SRC-43f3ef1f-010, SRC-43f3ef1f-011, SRC-43f3ef1f-012, SRC-43f3ef1f-013, SRC-43f3ef1f-014, SRC-43f3ef1f-015, SRC-43f3ef1f-016, SRC-43f3ef1f-017, SRC-43f3ef1f-018, SRC-43f3ef1f-019, SRC-43f3ef1f-020, SRC-43f3ef1f-021, SRC-43f3ef1f-022, SRC-43f3ef1f-023, SRC-43f3ef1f-056, SRC-43f3ef1f-057, SRC-43f3ef1f-058.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
