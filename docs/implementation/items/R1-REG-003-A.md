# R1-REG-003-A: Operate roster and six-state Entry lifecycle

Parent: R1-REG-003 · Order: 320 · Owner: registration · Stage: 03 Configuration and registration

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-REG-001-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-REG-003-A/AC-01** — Entry Managers prepare their School's roster and may create/edit/submit/withdraw; authorized registration staff return Submitted to Draft with specified corrections or decide Submitted/Waitlisted admission.
- **R1-REG-003-A/AC-02** — Draft, Submitted, Waitlisted and Accepted enforce one active LD Entry per Competitor/tournament, while Withdrawn/Rejected preserve identity/history. Registration state and Competitive Eligibility never substitute for one another.
- **R1-REG-003-A/AC-03** — Every transition records actor, permission, reason and version; stale concurrent requests fail without changing Competitor identity or represented School. Private Entry Error Reports never mutate the Entry.
- **R1-REG-003-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: transition tables; migrations; role-scoped roster and Entry screens; notice events.
- Interfaces: PlaceOnTournamentRoster; SignOffEntry; TransitionEntryState; RestoreEntry; CorrectEntryAttribution; FileEntryErrorReport.
- Schemas: TournamentRoster; EntryRegistrationState; EntryRestoration; EntryErrorReport.
- Tables: registration_rosters; registration_entry_transitions; registration_restorations; registration_error_reports.
- Events: RosterChanged; EntryStateChanged; EntryRestored; EntryErrorReported.
- Errors: ENTRY_TRANSITION_INVALID; ROSTER_AUTHORITY_DENIED; RESTORATION_TOO_LATE; REPRESENTED_SCHOOL_CONFLICT.
- Audiences: Competitor; responsible Coach; School staff; registration staff.
- Risks: historical rewrite; role confusion; post-start restoration.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-REG-003-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-REG-003-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0021-separate-entry-registration-from-eligibility.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0021-separate-entry-registration-from-eligibility.md): ; Separate Entry registration state from Competitive Eligibility; Consequences. Clauses: SRC-05c354d1-001, SRC-05c354d1-002, SRC-05c354d1-003, SRC-05c354d1-004, SRC-05c354d1-005, SRC-05c354d1-006, SRC-05c354d1-007, SRC-05c354d1-008, SRC-05c354d1-009, SRC-05c354d1-010, SRC-05c354d1-011, SRC-05c354d1-012, SRC-05c354d1-013, SRC-05c354d1-014, SRC-05c354d1-015, SRC-05c354d1-016.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/registration-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/registration-model.md): Lincoln-Douglas Entry identity; Entry registration lifecycle; Normal transition authority; Entry Restoration; Competitor identity. Clauses: SRC-751d83c0-002, SRC-751d83c0-003, SRC-751d83c0-004, SRC-751d83c0-005, SRC-751d83c0-006, SRC-751d83c0-007, SRC-751d83c0-008, SRC-751d83c0-009, SRC-751d83c0-010, SRC-751d83c0-011, SRC-751d83c0-012, SRC-751d83c0-013, SRC-751d83c0-014, SRC-751d83c0-015, SRC-751d83c0-016, SRC-751d83c0-017, SRC-751d83c0-018, SRC-751d83c0-019, SRC-751d83c0-020, SRC-751d83c0-021, SRC-751d83c0-022, SRC-751d83c0-023, SRC-751d83c0-024, SRC-751d83c0-025, SRC-751d83c0-026, SRC-751d83c0-027, SRC-751d83c0-028, SRC-751d83c0-029, SRC-751d83c0-030, SRC-751d83c0-099, SRC-751d83c0-100, SRC-751d83c0-101, SRC-751d83c0-102, SRC-751d83c0-103, SRC-751d83c0-104, SRC-751d83c0-105.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
