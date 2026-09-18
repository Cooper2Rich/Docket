# R1-FND-003-B: Isolate database integration fixtures and compatibility checks

Parent: R1-FND-003 · Order: 60 · Owner: database · Stage: 01 Foundations

Release requirements: R1-DATA-001, R1-CONS-001, R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-FND-003-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-003-B/AC-01** — Testcontainers creates isolated real PostgreSQL databases for integration tests; two suites cannot see each other's data, and failed tests release their resources.
- **R1-FND-003-B/AC-02** — pnpm test:integration and the migration checks exercise empty-to-head, previous-to-head, repeat execution, transaction rollback, and adjacent-version application/schema compatibility with nonempty assertions.
- **R1-FND-003-B/AC-03** — Document forward-repair and compatibility evidence; a migration that would make the adjacent deployed application unreadable is rejected without claiming destructive rollback is safe.
- **R1-FND-003-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: migration runner; ownership validator; migration journal; test database harness.
- Interfaces: MigrationPlan; MigrationResult; TestDatabase.
- Schemas: migration metadata.
- Tables: platform_migration_journal.
- Events: MigrationApplied.
- Errors: MIGRATION_OWNER_INVALID; MIGRATION_ORDER_INVALID; SCHEMA_INCOMPATIBLE.
- Audiences: developers; release operators; audit.
- Risks: foreign table writes; destructive change; rollback incompatibility.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-003-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |

Write machine evidence to `.ralph/evidence/R1-FND-003-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/contracts/executable-contracts.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/contracts/executable-contracts.md): Executable Domain Contract; Authority by concern; Module source layout; Command contract; Query contract; State and authorization coverage; Events and asynchronous work; HTTP and error contracts; Persistence contracts; Golden vectors; Traceability manifest; Change rules. Clauses: SRC-b126aa62-001, SRC-b126aa62-002, SRC-b126aa62-003, SRC-b126aa62-004, SRC-b126aa62-005, SRC-b126aa62-006, SRC-b126aa62-007, SRC-b126aa62-008, SRC-b126aa62-009, SRC-b126aa62-010, SRC-b126aa62-011, SRC-b126aa62-012, SRC-b126aa62-013, SRC-b126aa62-014, SRC-b126aa62-015, SRC-b126aa62-016, SRC-b126aa62-017, SRC-b126aa62-018, SRC-b126aa62-019, SRC-b126aa62-020, SRC-b126aa62-021, SRC-b126aa62-022, SRC-b126aa62-023, SRC-b126aa62-024, SRC-b126aa62-025, SRC-b126aa62-026, SRC-b126aa62-027, SRC-b126aa62-028, SRC-b126aa62-029, SRC-b126aa62-030, SRC-b126aa62-031, SRC-b126aa62-032, SRC-b126aa62-033, SRC-b126aa62-034, SRC-b126aa62-035, SRC-b126aa62-036, SRC-b126aa62-037, SRC-b126aa62-038, SRC-b126aa62-039, SRC-b126aa62-040, SRC-b126aa62-041, SRC-b126aa62-042, SRC-b126aa62-043, SRC-b126aa62-044, SRC-b126aa62-045, SRC-b126aa62-046, SRC-b126aa62-047, SRC-b126aa62-048, SRC-b126aa62-049, SRC-b126aa62-050, SRC-b126aa62-051.
- [docs/development.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/development.md): Reproducible Development Contract; Host prerequisites; Frontend generator policy; Reserved workspace commands; Local infrastructure; Database migrations; Executable contract generation; Identity in development and tests; Environment configuration; Deterministic fixtures; Continuous integration. Clauses: SRC-97db29a7-001, SRC-97db29a7-002, SRC-97db29a7-003, SRC-97db29a7-004, SRC-97db29a7-005, SRC-97db29a7-006, SRC-97db29a7-007, SRC-97db29a7-008, SRC-97db29a7-009, SRC-97db29a7-010, SRC-97db29a7-011, SRC-97db29a7-012, SRC-97db29a7-013, SRC-97db29a7-014, SRC-97db29a7-015, SRC-97db29a7-016, SRC-97db29a7-017, SRC-97db29a7-018, SRC-97db29a7-019, SRC-97db29a7-020, SRC-97db29a7-021, SRC-97db29a7-022, SRC-97db29a7-023, SRC-97db29a7-024, SRC-97db29a7-025, SRC-97db29a7-026, SRC-97db29a7-027, SRC-97db29a7-028, SRC-97db29a7-029, SRC-97db29a7-030, SRC-97db29a7-031, SRC-97db29a7-032, SRC-97db29a7-033, SRC-97db29a7-034, SRC-97db29a7-035, SRC-97db29a7-036, SRC-97db29a7-037, SRC-97db29a7-038, SRC-97db29a7-039.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
