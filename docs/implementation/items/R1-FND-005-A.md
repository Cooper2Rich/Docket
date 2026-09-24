# R1-FND-005-A: Run the eleven required checks on current pull-request heads

Parent: R1-FND-005 · Order: 90 · Owner: runtime · Stage: 01 Foundations

Release requirements: R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-FND-004-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-005-A/AC-01** — GitHub Actions reports every exact Required / context from the branch-protection contract on the actual PR head and runs its documented local command with the frozen install.
- **R1-FND-005-A/AC-02** — Pin actions to immutable revisions, default permissions to read-only, cache only the pnpm store with an exact lock key, and publish distinct SHA-named evidence artifacts for seven days with hidden files disabled.
- **R1-FND-005-A/AC-03** — A deliberately failing test, contract drift, vulnerable fixture, and omitted evidence each fail their intended check; skipped, neutral, absent, or superseded-head results cannot satisfy completion.
- **R1-FND-005-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: required CI workflows; cache policy; artifact retention policy; branch protection documentation.
- Interfaces: CI check names.
- Schemas: workflow configuration.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: No new events specified by the parent; add only when required by this leaf and document why..
- Errors: CI_LOCAL_PARITY_FAILED; REQUIRED_CHECK_MISSING.
- Audiences: developers; reviewers; release operators.
- Risks: CI-only behavior; mutable dependencies; skipped release gate.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-005-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-FND-005-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/development.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/development.md): Reproducible Development Contract; Host prerequisites; Frontend generator policy; Reserved workspace commands; Local infrastructure; Database migrations; Executable contract generation; Identity in development and tests; Environment configuration; Deterministic fixtures; Continuous integration. Clauses: SRC-97db29a7-001, SRC-97db29a7-002, SRC-97db29a7-003, SRC-97db29a7-004, SRC-97db29a7-005, SRC-97db29a7-006, SRC-97db29a7-007, SRC-97db29a7-008, SRC-97db29a7-009, SRC-97db29a7-010, SRC-97db29a7-011, SRC-97db29a7-012, SRC-97db29a7-013, SRC-97db29a7-014, SRC-97db29a7-015, SRC-97db29a7-016, SRC-97db29a7-017, SRC-97db29a7-018, SRC-97db29a7-019, SRC-97db29a7-020, SRC-97db29a7-021, SRC-97db29a7-022, SRC-97db29a7-023, SRC-97db29a7-024, SRC-97db29a7-025, SRC-97db29a7-026, SRC-97db29a7-027, SRC-97db29a7-028, SRC-97db29a7-029, SRC-97db29a7-030, SRC-97db29a7-031, SRC-97db29a7-032, SRC-97db29a7-033, SRC-97db29a7-034, SRC-97db29a7-035, SRC-97db29a7-036, SRC-97db29a7-037, SRC-97db29a7-038, SRC-97db29a7-039.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/operations/github-branch-protection.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/operations/github-branch-protection.md): GitHub Required Checks and Branch Protection; Required check contexts; Foundation bootstrap protection; Local-command parity; Cache policy; Artifact retention policy; Change procedure. Clauses: SRC-4485609c-001, SRC-4485609c-002, SRC-4485609c-003, SRC-4485609c-004, SRC-4485609c-005, SRC-4485609c-006, SRC-4485609c-007, SRC-4485609c-008, SRC-4485609c-009, SRC-4485609c-010, SRC-4485609c-011, SRC-4485609c-012, SRC-4485609c-013, SRC-4485609c-014, SRC-4485609c-015, SRC-4485609c-016, SRC-4485609c-017, SRC-4485609c-018, SRC-4485609c-019, SRC-4485609c-020, SRC-4485609c-021, SRC-4485609c-022, SRC-4485609c-023, SRC-4485609c-024, SRC-4485609c-025.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
