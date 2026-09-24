# R1-TRN-004-A: Preview and execute Owner-only Tournament Closure

Parent: R1-TRN-004 · Order: 900 · Owner: tournaments · Stage: 07 Awards and closure

Release requirements: R1-LIFE-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-016-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-TRN-004-A/AC-01** — Only current Owner can preview and confirm Closure. Block unpublished Final Results, open rounds, unexpired feedback windows, timely unresolved No-Show disputes and outcome-affecting downstream conflicts.
- **R1-TRN-004-A/AC-02** — Show optional omissions and acknowledgment warnings separately; Owner records the required reason/confirmation without treating optional work as a hard blocker.
- **R1-TRN-004-A/AC-03** — Confirmation rechecks the exact current state transactionally, records the immutable Closure instant and emits one audited event. Concurrent blockers prevent partial Closure or duplicate events.
- **R1-TRN-004-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: lifecycle transitions; Closure Readiness Review; migrations; Owner Closure UI.
- Interfaces: MarkCompetitiveCompletion; EvaluateClosureReadiness; CloseTournament.
- Schemas: CompetitiveCompletion; ClosureReadinessReview; TournamentClosure.
- Tables: tournaments_completion; tournaments_closure_reviews; tournaments_closures.
- Events: CompetitiveCompletionReached; TournamentClosed.
- Errors: CLOSURE_OWNER_REQUIRED; CLOSURE_BLOCKED; WARNING_ACKNOWLEDGMENT_REQUIRED.
- Audiences: Owner; Directors and staff; participants; Public Viewer archive status.
- Risks: automatic Closure; waived dispute; premature retention clock.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-TRN-004-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-TRN-004-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0020-separate-competitive-completion-from-closure.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0020-separate-competitive-completion-from-closure.md): ; Separate competitive completion from tournament closure; Consequences. Clauses: SRC-e064ab78-001, SRC-e064ab78-002, SRC-e064ab78-003, SRC-e064ab78-004, SRC-e064ab78-005, SRC-e064ab78-006, SRC-e064ab78-007, SRC-e064ab78-008, SRC-e064ab78-009, SRC-e064ab78-010, SRC-e064ab78-011, SRC-e064ab78-012, SRC-e064ab78-013, SRC-e064ab78-014, SRC-e064ab78-015.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/tournament-lifecycle-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/tournament-lifecycle-model.md): Initial Draft creation; Competitive completion; Tournament Closure; Closure Readiness Review; Post-closure access and operations; Post-Closure Correction Case. Clauses: SRC-9867cf56-001, SRC-9867cf56-002, SRC-9867cf56-003, SRC-9867cf56-004, SRC-9867cf56-005, SRC-9867cf56-006, SRC-9867cf56-007, SRC-9867cf56-008, SRC-9867cf56-009, SRC-9867cf56-010, SRC-9867cf56-011, SRC-9867cf56-012, SRC-9867cf56-013, SRC-9867cf56-014, SRC-9867cf56-015, SRC-9867cf56-016, SRC-9867cf56-017, SRC-9867cf56-018, SRC-9867cf56-019, SRC-9867cf56-020, SRC-9867cf56-021, SRC-9867cf56-022, SRC-9867cf56-023, SRC-9867cf56-024, SRC-9867cf56-025, SRC-9867cf56-026, SRC-9867cf56-027, SRC-9867cf56-028, SRC-9867cf56-029, SRC-9867cf56-030, SRC-9867cf56-031, SRC-9867cf56-032, SRC-9867cf56-033, SRC-9867cf56-034, SRC-9867cf56-035, SRC-9867cf56-036, SRC-9867cf56-037, SRC-9867cf56-038.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
