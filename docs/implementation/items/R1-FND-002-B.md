# R1-FND-002-B: Provide deterministic clocks, identifiers, and guarded adapters

Parent: R1-FND-002 · Order: 40 · Owner: runtime · Stage: 01 Foundations

Release requirements: R1-LIFE-001, R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-FND-002-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-002-B/AC-01** — Runtime Clock and UUIDv7 identifier adapters are injectable; deterministic fixtures reproduce instants and identifiers across fresh runs without affecting production generation.
- **R1-FND-002-B/AC-02** — Fixed identity, synthetic Competitor fixtures, fake mail, and provider fixtures are permitted only in declared nonproduction modes. Production startup and every production fixture boundary reject test authority and real-contact fixture payloads.
- **R1-FND-002-B/AC-03** — Configuration-negative tests prove fixed identity cannot be enabled through an alternate environment variable or web request. Logs contain only redacted adapter identity and correlation data.
- **R1-FND-002-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: compose configuration; .env.example; runtime adapters; health checks; pnpm bootstrap.
- Interfaces: RuntimeConfig; Clock; IdGenerator; Readiness; Liveness.
- Schemas: environment configuration.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: No new events specified by the parent; add only when required by this leaf and document why..
- Errors: CONFIG_INVALID; ADAPTER_FORBIDDEN_IN_ENVIRONMENT; DEPENDENCY_UNREADY.
- Audiences: developers; operators.
- Risks: secret leakage; production test adapter; nonrepeatable setup.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-002-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |

Write machine evidence to `.ralph/evidence/R1-FND-002-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0029-use-clerk-for-managed-authentication.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0029-use-clerk-for-managed-authentication.md): ADR 0029: Use Clerk for managed authentication; Context; Decision; Consequences. Clauses: SRC-73056a95-001, SRC-73056a95-002, SRC-73056a95-003, SRC-73056a95-004, SRC-73056a95-005, SRC-73056a95-006, SRC-73056a95-007, SRC-73056a95-008, SRC-73056a95-009, SRC-73056a95-010, SRC-73056a95-011, SRC-73056a95-012, SRC-73056a95-013, SRC-73056a95-014, SRC-73056a95-015, SRC-73056a95-016, SRC-73056a95-017, SRC-73056a95-018, SRC-73056a95-019, SRC-73056a95-020, SRC-73056a95-021, SRC-73056a95-022, SRC-73056a95-023, SRC-73056a95-024, SRC-73056a95-025, SRC-73056a95-026, SRC-73056a95-027, SRC-73056a95-028, SRC-73056a95-029, SRC-73056a95-030, SRC-73056a95-031, SRC-73056a95-032, SRC-73056a95-033, SRC-73056a95-034, SRC-73056a95-035.
- [docs/development.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/development.md): Reproducible Development Contract; Host prerequisites; Frontend generator policy; Reserved workspace commands; Local infrastructure; Database migrations; Executable contract generation; Identity in development and tests; Environment configuration; Deterministic fixtures; Continuous integration. Clauses: SRC-97db29a7-001, SRC-97db29a7-002, SRC-97db29a7-003, SRC-97db29a7-004, SRC-97db29a7-005, SRC-97db29a7-006, SRC-97db29a7-007, SRC-97db29a7-008, SRC-97db29a7-009, SRC-97db29a7-010, SRC-97db29a7-011, SRC-97db29a7-012, SRC-97db29a7-013, SRC-97db29a7-014, SRC-97db29a7-015, SRC-97db29a7-016, SRC-97db29a7-017, SRC-97db29a7-018, SRC-97db29a7-019, SRC-97db29a7-020, SRC-97db29a7-021, SRC-97db29a7-022, SRC-97db29a7-023, SRC-97db29a7-024, SRC-97db29a7-025, SRC-97db29a7-026, SRC-97db29a7-027, SRC-97db29a7-028, SRC-97db29a7-029, SRC-97db29a7-030, SRC-97db29a7-031, SRC-97db29a7-032, SRC-97db29a7-033, SRC-97db29a7-034, SRC-97db29a7-035, SRC-97db29a7-036, SRC-97db29a7-037, SRC-97db29a7-038, SRC-97db29a7-039.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/backend-architecture.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/backend-architecture.md): Concurrent writes; Privileged audit; Time and identity. Clauses: SRC-3a042821-020, SRC-3a042821-021, SRC-3a042821-022, SRC-3a042821-023.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
