# R1-TRN-003-B: Browse the active directory with accessible search and paging

Parent: R1-TRN-003 · Order: 280 · Owner: publication · Stage: 03 Configuration and registration

Release requirements: R1-LIFE-001, R1-PRIV-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-TRN-003-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-TRN-003-B/AC-01** — Directory access requires authentication while a direct Invitation Page remains public; every active published tournament is listed with the accepted summary fields and no implicit role grant.
- **R1-TRN-003-B/AC-02** — Implement name/host search, allowed date/location/status/event filters and underway-first, nearest-start, recent and alphabetical sorts with cursor pages of 50; returning from a page restores search and list position.
- **R1-TRN-003-B/AC-03** — Keyboard/screen-reader paging and user-entered postal radius work without required geolocation or imported Google location. Saved filters, saved tournaments and optional subscriptions are excluded from Release 1.
- **R1-TRN-003-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: publication interface; migrations; public SSR route; directory projection; correction history.
- Interfaces: PrepareTournamentInvitation; ApprovePublication; PublishTournamentInvitation; WithdrawPublicPublication.
- Schemas: TournamentInvitationProjection; PublicationVersion; PublicPublicationWithdrawal.
- Tables: publication_versions; publication_current_pointers; publication_withdrawals.
- Events: TournamentInvitationPublished; PublicPublicationWithdrawn.
- Errors: PUBLICATION_UNAPPROVED; PUBLICATION_SOURCE_STALE; WITHDRAWAL_REASON_INVALID.
- Audiences: Public Viewer; Director; publication staff; audit.
- Risks: private-field exposure; stale publication; silent deletion.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-TRN-003-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-TRN-003-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/product/experience-contract.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/product/experience-contract.md): Product Experience Contract; Delivery model; Information architecture; Required screen states; Design system; Accessibility; Responsive and browser support; Design catalog. Clauses: SRC-b67853a4-001, SRC-b67853a4-002, SRC-b67853a4-003, SRC-b67853a4-004, SRC-b67853a4-005, SRC-b67853a4-006, SRC-b67853a4-007, SRC-b67853a4-008, SRC-b67853a4-009, SRC-b67853a4-010, SRC-b67853a4-011, SRC-b67853a4-012, SRC-b67853a4-013, SRC-b67853a4-014, SRC-b67853a4-015, SRC-b67853a4-016, SRC-b67853a4-017, SRC-b67853a4-018, SRC-b67853a4-019.
- [wiki/tournament-directory-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/tournament-directory-model.md): Purpose. Clauses: SRC-f290e4f2-001, SRC-f290e4f2-002, SRC-f290e4f2-003, SRC-f290e4f2-004, SRC-f290e4f2-005, SRC-f290e4f2-006, SRC-f290e4f2-007, SRC-f290e4f2-008, SRC-f290e4f2-009, SRC-f290e4f2-010, SRC-f290e4f2-011, SRC-f290e4f2-012, SRC-f290e4f2-013, SRC-f290e4f2-014.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
