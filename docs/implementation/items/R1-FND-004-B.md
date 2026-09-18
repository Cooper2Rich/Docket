# R1-FND-004-B: Connect requirements, acceptance evidence, and generated traceability

Parent: R1-FND-004 · Order: 80 · Owner: contracts · Stage: 01 Foundations

Release requirements: R1-AUTH-001, R1-COMP-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-FND-004-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-004-B/AC-01** — The traceability schema maps all eight release umbrella IDs and each active leaf acceptance ID to owned contracts, tests, and evidence; deferred source rows remain explicitly excluded.
- **R1-FND-004-B/AC-02** — Missing requirements, unowned artifacts, missing criterion evidence, stale contract hashes, and an empty golden corpus each fail validation. Initial coverage honestly distinguishes implemented foundation from pending domain work.
- **R1-FND-004-B/AC-03** — pnpm contracts check generates and drift-checks the trace report and indexes; verify:item consumes the same criterion registry and cannot substitute a subset.
- **R1-FND-004-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: contract generator; traceability schema; generated artifact directories; pnpm contracts check.
- Interfaces: ContractSource; GeneratorResult; TraceabilityManifest.
- Schemas: traceability manifest; golden vector envelope; stable error envelope.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: No new events specified by the parent; add only when required by this leaf and document why..
- Errors: CONTRACT_DRIFT; REQUIREMENT_UNTRACED; ARTIFACT_UNOWNED; CONTRACT_BREAKING_CHANGE.
- Audiences: developers; clients; reviewers.
- Risks: duplicate truth; nondeterministic generation; missing coverage.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-004-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |

Write machine evidence to `.ralph/evidence/R1-FND-004-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/contracts/executable-contracts.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/contracts/executable-contracts.md): Executable Domain Contract; Authority by concern; Module source layout; Command contract; Query contract; State and authorization coverage; Events and asynchronous work; HTTP and error contracts; Persistence contracts; Golden vectors; Traceability manifest; Change rules. Clauses: SRC-b126aa62-001, SRC-b126aa62-002, SRC-b126aa62-003, SRC-b126aa62-004, SRC-b126aa62-005, SRC-b126aa62-006, SRC-b126aa62-007, SRC-b126aa62-008, SRC-b126aa62-009, SRC-b126aa62-010, SRC-b126aa62-011, SRC-b126aa62-012, SRC-b126aa62-013, SRC-b126aa62-014, SRC-b126aa62-015, SRC-b126aa62-016, SRC-b126aa62-017, SRC-b126aa62-018, SRC-b126aa62-019, SRC-b126aa62-020, SRC-b126aa62-021, SRC-b126aa62-022, SRC-b126aa62-023, SRC-b126aa62-024, SRC-b126aa62-025, SRC-b126aa62-026, SRC-b126aa62-027, SRC-b126aa62-028, SRC-b126aa62-029, SRC-b126aa62-030, SRC-b126aa62-031, SRC-b126aa62-032, SRC-b126aa62-033, SRC-b126aa62-034, SRC-b126aa62-035, SRC-b126aa62-036, SRC-b126aa62-037, SRC-b126aa62-038, SRC-b126aa62-039, SRC-b126aa62-040, SRC-b126aa62-041, SRC-b126aa62-042, SRC-b126aa62-043, SRC-b126aa62-044, SRC-b126aa62-045, SRC-b126aa62-046, SRC-b126aa62-047, SRC-b126aa62-048, SRC-b126aa62-049, SRC-b126aa62-050, SRC-b126aa62-051.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/releases/release-1.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/releases/release-1.md): Release 1: Operable Lincoln-Douglas Tournament; Included actors; Included lifecycle; Explicit non-goals; Release requirements; Required product outcomes; Governing sources. Clauses: SRC-aa1bb991-001, SRC-aa1bb991-002, SRC-aa1bb991-003, SRC-aa1bb991-004, SRC-aa1bb991-005, SRC-aa1bb991-006, SRC-aa1bb991-007, SRC-aa1bb991-008, SRC-aa1bb991-009, SRC-aa1bb991-010, SRC-aa1bb991-011, SRC-aa1bb991-012, SRC-aa1bb991-013, SRC-aa1bb991-014, SRC-aa1bb991-015, SRC-aa1bb991-016, SRC-aa1bb991-017, SRC-aa1bb991-018, SRC-aa1bb991-019, SRC-aa1bb991-020, SRC-aa1bb991-021, SRC-aa1bb991-022, SRC-aa1bb991-023, SRC-aa1bb991-024, SRC-aa1bb991-025, SRC-aa1bb991-026, SRC-aa1bb991-027, SRC-aa1bb991-028, SRC-aa1bb991-029, SRC-aa1bb991-030, SRC-aa1bb991-031, SRC-aa1bb991-032, SRC-aa1bb991-033, SRC-aa1bb991-034, SRC-aa1bb991-035, SRC-aa1bb991-036, SRC-aa1bb991-037, SRC-aa1bb991-038, SRC-aa1bb991-039, SRC-aa1bb991-040, SRC-aa1bb991-041, SRC-aa1bb991-042, SRC-aa1bb991-043, SRC-aa1bb991-044, SRC-aa1bb991-045, SRC-aa1bb991-046, SRC-aa1bb991-047, SRC-aa1bb991-048, SRC-aa1bb991-049, SRC-aa1bb991-050, SRC-aa1bb991-051, SRC-aa1bb991-052, SRC-aa1bb991-053, SRC-aa1bb991-054, SRC-aa1bb991-055, SRC-aa1bb991-056, SRC-aa1bb991-057, SRC-aa1bb991-058, SRC-aa1bb991-059, SRC-aa1bb991-060.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
