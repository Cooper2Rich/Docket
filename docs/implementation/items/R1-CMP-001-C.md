# R1-CMP-001-C: Provide Event Workspaces and the personal tournament agenda

Parent: R1-CMP-001 · Order: 520 · Owner: competition · Stage: 04 Scheduling and Judge operations

Release requirements: R1-LIFE-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-001-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-001-C/AC-01** — Event Workspace shows staff operations, own/School assignments to Competitors/Coaches, assigned rounds to Judges and only public artifacts to visitors; it is not a second schedule source.
- **R1-CMP-001-C/AC-02** — The personal agenda combines only currently authorized assignments across events, highlights conflicts and sends required new/cancelled/material-change alerts with accepted audience restrictions.
- **R1-CMP-001-C/AC-03** — Check-in, room, acknowledgment and Scheduled/Started/Completed/Result Pending views have loading, empty, validation, stale, denied and unavailable states; keyboard/mobile views disclose no private conflicts, ballots, assessments or unrelated School status.
- **R1-CMP-001-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: schedule interface; migrations; algorithms and vectors; operations and participant screens.
- Interfaces: GenerateScheduleCandidates; SelectSchedule; PublishSchedule; ReviseSchedule; ActivateCrossEntryHold.
- Schemas: TournamentSchedule; ScheduleCandidate; ScheduleRevision; Room; CrossEntryHold.
- Tables: competition_schedules; competition_schedule_versions; competition_rooms; competition_cross_entry_holds.
- Events: ScheduleSelected; SchedulePublished; ScheduleRevised; CrossEntryHoldActivated.
- Errors: SCHEDULE_INFEASIBLE; SCHEDULE_SOURCE_STALE; REVISION_UNAPPROVED; CROSS_ENTRY_CONFLICT.
- Audiences: Competitor; Coach; Judge; tournament staff; Public Viewer limited schedule.
- Risks: overlap; timezone error; unnoticed live change.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-001-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-CMP-001-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/product/experience-contract.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/product/experience-contract.md): Product Experience Contract; Delivery model; Information architecture; Required screen states; Design system; Accessibility; Responsive and browser support; Design catalog. Clauses: SRC-b67853a4-001, SRC-b67853a4-002, SRC-b67853a4-003, SRC-b67853a4-004, SRC-b67853a4-005, SRC-b67853a4-006, SRC-b67853a4-007, SRC-b67853a4-008, SRC-b67853a4-009, SRC-b67853a4-010, SRC-b67853a4-011, SRC-b67853a4-012, SRC-b67853a4-013, SRC-b67853a4-014, SRC-b67853a4-015, SRC-b67853a4-016, SRC-b67853a4-017, SRC-b67853a4-018, SRC-b67853a4-019.
- [wiki/scheduling-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/scheduling-model.md): Event Workspaces. Clauses: SRC-480fc114-024, SRC-480fc114-025, SRC-480fc114-051.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
