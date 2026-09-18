# R1-TRN-001-A: Create Draft tournaments and delegate scoped staff authority

Parent: R1-TRN-001 · Order: 230 · Owner: tournaments · Stage: 02 Walking skeleton

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-SCH-002-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-TRN-001-A/AC-01** — An authenticated Account creates name and valid IANA timezone; one UUIDv7 Tournament and its sole Owner assignment commit atomically. The Owner also holds Director authority.
- **R1-TRN-001-A/AC-02** — Only the Owner appoints/removes Directors; Directors manage explicit tournament staff bundles through accepted Access Offers. Staff cannot self-grant or delegate authority they do not hold.
- **R1-TRN-001-A/AC-03** — Revocation and scope changes apply server-side immediately. Concurrent creation/appointment cannot produce a second Owner, and operations never infer scope from a supplied Tournament ID.
- **R1-TRN-001-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: Tournament interface; migrations; create and staff-management routes and screens.
- Interfaces: CreateTournament; IssueTournamentAccessOffer; AcceptTournamentAccessOffer; DelegateTournamentPermission.
- Schemas: Tournament; TournamentStaffAssignment; TournamentPermission.
- Tables: tournaments_tournaments; tournaments_staff_assignments; tournaments_access_offers.
- Events: TournamentCreated; TournamentStaffAssigned; TournamentPermissionChanged.
- Errors: OWNER_CONFLICT; TOURNAMENT_SCOPE_DENIED; TIMEZONE_INVALID; STAFF_PERMISSION_INVALID; TOURNAMENT_COMMAND_CONFLICT.
- Audiences: Owner; Director; assigned staff; audit.
- Risks: owner race; scope spoofing; timezone ambiguity.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-TRN-001-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-TRN-001-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0006-delegate-tabulation-permissions.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0006-delegate-tabulation-permissions.md): ; Delegate tabulation permissions explicitly; Consequences. Clauses: SRC-2fda530d-001, SRC-2fda530d-002, SRC-2fda530d-003, SRC-2fda530d-004, SRC-2fda530d-005, SRC-2fda530d-006, SRC-2fda530d-007.
- [docs/adr/0007-single-owner-multiple-directors.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0007-single-owner-multiple-directors.md): ; Require one owner and allow multiple directors; Consequences. Clauses: SRC-429f52d4-001, SRC-429f52d4-002, SRC-429f52d4-003, SRC-429f52d4-004, SRC-429f52d4-005, SRC-429f52d4-006, SRC-429f52d4-007, SRC-429f52d4-008, SRC-429f52d4-009, SRC-429f52d4-010.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Tournament operations delegation; Tournament ownership. Clauses: SRC-3aa2b898-162, SRC-3aa2b898-163, SRC-3aa2b898-164, SRC-3aa2b898-165, SRC-3aa2b898-166, SRC-3aa2b898-167, SRC-3aa2b898-168, SRC-3aa2b898-169, SRC-3aa2b898-170, SRC-3aa2b898-171, SRC-3aa2b898-172, SRC-3aa2b898-173, SRC-3aa2b898-174, SRC-3aa2b898-175, SRC-3aa2b898-208, SRC-3aa2b898-209, SRC-3aa2b898-210, SRC-3aa2b898-211, SRC-3aa2b898-212, SRC-3aa2b898-213.
- [wiki/tournament-lifecycle-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/tournament-lifecycle-model.md): Initial Draft creation. Clauses: SRC-9867cf56-001, SRC-9867cf56-002.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
