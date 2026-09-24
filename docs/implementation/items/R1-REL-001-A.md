# R1-REL-001-A: Verify the full multi-actor tournament journey

Parent: R1-REL-001 · Order: 1060 · Owner: workflows · Stage: 08 Governance and release

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-DATA-001, R1-COMP-001, R1-CONS-001, R1-MSG-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-002-E.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-REL-001-A/AC-01** — On a fresh isolated database run Account, School/Coach, Director, Competitor and Judge journeys through invitation, registration, admission, schedule, pairings, preliminaries, elimination, final results and Closure.
- **R1-REL-001-A/AC-02** — Each step uses the real UI/API/domain paths and confirms persisted results and correct notices, with denied role/context cases; no direct database shortcut supplies missing product behavior.
- **R1-REL-001-A/AC-03** — Trace every umbrella requirement and leaf acceptance ID to current evidence and report incomplete/blocked coverage honestly. A skipped actor path or empty test group fails the release journey.
- **R1-REL-001-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: complete fixture; Playwright journey suite; route and screen catalog; notification catalog; traceability report.
- Interfaces: Release1TournamentWorkflow.
- Schemas: Release1Fixture; JourneyEvidence.
- Tables: all Release 1 owned tables.
- Events: all Release 1 durable events.
- Errors: all Release 1 stable errors.
- Audiences: all Release 1 actors.
- Risks: happy-path-only proof; manual fixture repair; missing role or state.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-REL-001-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-REL-001-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/product/experience-contract.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/product/experience-contract.md): Product Experience Contract; Delivery model; Information architecture; Required screen states; Design system; Accessibility; Responsive and browser support; Design catalog. Clauses: SRC-b67853a4-001, SRC-b67853a4-002, SRC-b67853a4-003, SRC-b67853a4-004, SRC-b67853a4-005, SRC-b67853a4-006, SRC-b67853a4-007, SRC-b67853a4-008, SRC-b67853a4-009, SRC-b67853a4-010, SRC-b67853a4-011, SRC-b67853a4-012, SRC-b67853a4-013, SRC-b67853a4-014, SRC-b67853a4-015, SRC-b67853a4-016, SRC-b67853a4-017, SRC-b67853a4-018, SRC-b67853a4-019.
- [docs/quality/release-1-gates.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/quality/release-1-gates.md): Release 1 Capability Targets; Capacity; Latency; Availability and recovery; Behavioral integrity; Security and privacy; Accessibility and compatibility; Contract and migration integrity; Changing a target. Clauses: SRC-70917e75-001, SRC-70917e75-002, SRC-70917e75-003, SRC-70917e75-004, SRC-70917e75-005, SRC-70917e75-006, SRC-70917e75-007, SRC-70917e75-008, SRC-70917e75-009, SRC-70917e75-010, SRC-70917e75-011, SRC-70917e75-012, SRC-70917e75-013, SRC-70917e75-014, SRC-70917e75-015, SRC-70917e75-016, SRC-70917e75-017, SRC-70917e75-018, SRC-70917e75-019, SRC-70917e75-020, SRC-70917e75-021, SRC-70917e75-022, SRC-70917e75-023, SRC-70917e75-024, SRC-70917e75-025, SRC-70917e75-026, SRC-70917e75-027, SRC-70917e75-028.
- [docs/releases/release-1.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/releases/release-1.md): Release 1: Operable Lincoln-Douglas Tournament; Included actors; Included lifecycle; Explicit non-goals; Release requirements; Required product outcomes; Governing sources. Clauses: SRC-aa1bb991-001, SRC-aa1bb991-002, SRC-aa1bb991-003, SRC-aa1bb991-004, SRC-aa1bb991-005, SRC-aa1bb991-006, SRC-aa1bb991-007, SRC-aa1bb991-008, SRC-aa1bb991-009, SRC-aa1bb991-010, SRC-aa1bb991-011, SRC-aa1bb991-012, SRC-aa1bb991-013, SRC-aa1bb991-014, SRC-aa1bb991-015, SRC-aa1bb991-016, SRC-aa1bb991-017, SRC-aa1bb991-018, SRC-aa1bb991-019, SRC-aa1bb991-020, SRC-aa1bb991-021, SRC-aa1bb991-022, SRC-aa1bb991-023, SRC-aa1bb991-024, SRC-aa1bb991-025, SRC-aa1bb991-026, SRC-aa1bb991-027, SRC-aa1bb991-028, SRC-aa1bb991-029, SRC-aa1bb991-030, SRC-aa1bb991-031, SRC-aa1bb991-032, SRC-aa1bb991-033, SRC-aa1bb991-034, SRC-aa1bb991-035, SRC-aa1bb991-036, SRC-aa1bb991-037, SRC-aa1bb991-038, SRC-aa1bb991-039, SRC-aa1bb991-040, SRC-aa1bb991-041, SRC-aa1bb991-042, SRC-aa1bb991-043, SRC-aa1bb991-044, SRC-aa1bb991-045, SRC-aa1bb991-046, SRC-aa1bb991-047, SRC-aa1bb991-048, SRC-aa1bb991-049, SRC-aa1bb991-050, SRC-aa1bb991-051, SRC-aa1bb991-052, SRC-aa1bb991-053, SRC-aa1bb991-054, SRC-aa1bb991-055, SRC-aa1bb991-056, SRC-aa1bb991-057, SRC-aa1bb991-058, SRC-aa1bb991-059, SRC-aa1bb991-060.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
