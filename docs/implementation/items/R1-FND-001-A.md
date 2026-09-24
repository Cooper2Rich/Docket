# R1-FND-001-A: Create the pinned workspace and executable item-verification entry point

Parent: R1-FND-001 · Order: 10 · Owner: runtime · Stage: 01 Foundations

Release requirements: R1-LIFE-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: none; this is the first foundation leaf.
- External/decision gates: GATE-BOOTSTRAP.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-001-A/AC-01** — From a clean supported machine, the pinned Node and pnpm versions install the frozen lockfile and build/check the strict ESM workspace. Public package exports enforce the nine domain boundaries; a forbidden import and an undeclared dependency each fail check.
- **R1-FND-001-A/AC-02** — Create pnpm verify:item with the engineering verification protocol: an unknown item, omitted acceptance ID, empty selected suite, skipped required scenario, failing assertion, or stale contract digest exits nonzero. A passing nonempty foundation fixture emits the exact item, criterion/check IDs, test names, counts, code revision, and artifact hashes.
- **R1-FND-001-A/AC-03** — Create only the accepted app/package shells and working build, check, unit, and verification commands. An unavailable future command is reported unavailable, never implemented as a success-only placeholder. Record resolved package compatibility and the selected lockfile.
- **R1-FND-001-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: package.json; pnpm-workspace.yaml; pnpm-lock.yaml; nx.json; tsconfig files; apps and packages shells; apps/web/components.json; React Router Vercel preset and checked-in deployment configuration; initial shadcn/ui source and tokens.
- Interfaces: root build and check scripts; pinned ui:add script; package public export seams.
- Schemas: workspace configuration.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: No new events specified by the parent; add only when required by this leaf and document why..
- Errors: invalid prerequisite version; prohibited package dependency.
- Audiences: developers; CI.
- Risks: version drift; accidental framework coupling; unenforced package seams; unpinned registry generation; inaccessible primitive customization.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-001-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |

Write machine evidence to `.ralph/evidence/R1-FND-001-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0016-use-typescript-across-docket.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0016-use-typescript-across-docket.md): ; Use TypeScript across Docket; Consequences. Clauses: SRC-938b2450-001, SRC-938b2450-002, SRC-938b2450-003, SRC-938b2450-004, SRC-938b2450-005, SRC-938b2450-006, SRC-938b2450-007, SRC-938b2450-008.
- [docs/adr/0031-start-with-a-modular-typescript-monolith.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0031-start-with-a-modular-typescript-monolith.md): ; Start with a modular TypeScript monolith; Considered Options; Consequences. Clauses: SRC-adf4c1c6-001, SRC-adf4c1c6-002, SRC-adf4c1c6-003, SRC-adf4c1c6-004, SRC-adf4c1c6-005, SRC-adf4c1c6-006, SRC-adf4c1c6-007, SRC-adf4c1c6-008, SRC-adf4c1c6-009.
- [docs/adr/0032-adopt-the-initial-application-stack.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0032-adopt-the-initial-application-stack.md): Adopt the initial application stack; Considered Options; Consequences. Clauses: SRC-ec556b6b-001, SRC-ec556b6b-002, SRC-ec556b6b-003, SRC-ec556b6b-004, SRC-ec556b6b-005, SRC-ec556b6b-006, SRC-ec556b6b-007.
- [docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md): Organize the monolith by deep domain modules; Consequences. Clauses: SRC-cf3657b8-001, SRC-cf3657b8-002, SRC-cf3657b8-003.
- [docs/architecture/repository-map.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/architecture/repository-map.md): Repository and Module Map; Top-level topology; `apps/web`; `apps/api`; `apps/worker`; `apps/migrate`; Domain modules; `identity-access`; `schools`; `tournaments`; `registration`; `competition`; `publication`; `communications`; `governance`; `workflows`; `contracts`; `database`; `runtime`; `observability`; `testkit`; Dependency direction; Data ownership; Interface and adapter rules; Prohibited structures; Extraction rule. Clauses: SRC-8483f98a-001, SRC-8483f98a-002, SRC-8483f98a-003, SRC-8483f98a-004, SRC-8483f98a-005, SRC-8483f98a-006, SRC-8483f98a-007, SRC-8483f98a-008, SRC-8483f98a-009, SRC-8483f98a-010, SRC-8483f98a-011, SRC-8483f98a-012, SRC-8483f98a-013, SRC-8483f98a-014, SRC-8483f98a-015, SRC-8483f98a-016, SRC-8483f98a-017, SRC-8483f98a-018, SRC-8483f98a-019, SRC-8483f98a-020, SRC-8483f98a-021, SRC-8483f98a-022, SRC-8483f98a-023, SRC-8483f98a-024, SRC-8483f98a-025, SRC-8483f98a-026, SRC-8483f98a-027, SRC-8483f98a-028, SRC-8483f98a-029, SRC-8483f98a-030, SRC-8483f98a-031, SRC-8483f98a-032, SRC-8483f98a-033, SRC-8483f98a-034, SRC-8483f98a-035, SRC-8483f98a-036, SRC-8483f98a-037, SRC-8483f98a-038, SRC-8483f98a-039, SRC-8483f98a-040, SRC-8483f98a-041, SRC-8483f98a-042, SRC-8483f98a-043, SRC-8483f98a-044, SRC-8483f98a-045, SRC-8483f98a-046, SRC-8483f98a-047, SRC-8483f98a-048, SRC-8483f98a-049, SRC-8483f98a-050, SRC-8483f98a-051, SRC-8483f98a-052, SRC-8483f98a-053, SRC-8483f98a-054, SRC-8483f98a-055, SRC-8483f98a-056.
- [docs/development.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/development.md): Reproducible Development Contract; Host prerequisites; Frontend generator policy; Reserved workspace commands; Local infrastructure; Database migrations; Executable contract generation; Identity in development and tests; Environment configuration; Deterministic fixtures; Continuous integration. Clauses: SRC-97db29a7-001, SRC-97db29a7-002, SRC-97db29a7-003, SRC-97db29a7-004, SRC-97db29a7-005, SRC-97db29a7-006, SRC-97db29a7-007, SRC-97db29a7-008, SRC-97db29a7-009, SRC-97db29a7-010, SRC-97db29a7-011, SRC-97db29a7-012, SRC-97db29a7-013, SRC-97db29a7-014, SRC-97db29a7-015, SRC-97db29a7-016, SRC-97db29a7-017, SRC-97db29a7-018, SRC-97db29a7-019, SRC-97db29a7-020, SRC-97db29a7-021, SRC-97db29a7-022, SRC-97db29a7-023, SRC-97db29a7-024, SRC-97db29a7-025, SRC-97db29a7-026, SRC-97db29a7-027, SRC-97db29a7-028, SRC-97db29a7-029, SRC-97db29a7-030, SRC-97db29a7-031, SRC-97db29a7-032, SRC-97db29a7-033, SRC-97db29a7-034, SRC-97db29a7-035, SRC-97db29a7-036, SRC-97db29a7-037, SRC-97db29a7-038, SRC-97db29a7-039.
- [docs/implementation/bootstrap-baseline.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/bootstrap-baseline.md): Bootstrap baseline. Clauses: SRC-48cf8fc8-001, SRC-48cf8fc8-002, SRC-48cf8fc8-003, SRC-48cf8fc8-004, SRC-48cf8fc8-005.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
