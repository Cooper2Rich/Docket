# R1-IDA-002-A: Isolate Active Role Context and reverify sensitive actions

Parent: R1-IDA-002 · Order: 130 · Owner: identity-access · Stage: 02 Walking skeleton

Release requirements: R1-AUTH-001, R1-PRIV-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-IDA-001-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-IDA-002-A/AC-01** — Each tab has one visible Active Role Context with scoped cache isolation; the persisted most-recent choice may be privileged. An invalid choice returns to the selector rather than borrowing another role.
- **R1-IDA-002-A/AC-02** — A deep link that needs another context prompts a switch without fetching or revealing protected data. Unsaved work offers save/discard/cancel; switching clears the previous context's protected cache and open views.
- **R1-IDA-002-A/AC-03** — Every protected command resolves current grants and scope server-side. Sensitive accepted actions require Clerk Reverification within ten minutes, and stale/replayed evidence or a revoked grant is denied.
- **R1-IDA-002-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: authorization interface; context routes and persistent UI; context cache destruction; complete core authorization matrix.
- Interfaces: ResolveAuthority; EnterActiveRoleContext; LeaveActiveRoleContext; RequireRecentClerkReverification.
- Schemas: ActiveRoleContext; AuthorityDecision; ClerkReverificationEvidence.
- Tables: identity_role_contexts; identity_reauthentication_events; identity_authority_grants.
- Events: RoleContextEntered; RoleContextExited; AuthorityInvalidated.
- Errors: AUTHORITY_DENIED; CONTEXT_STALE; REAUTHENTICATION_REQUIRED; ROLE_SWITCH_BLOCKED.
- Audiences: Account holder; privileged Account holder; audit.
- Risks: context confusion; privilege retention; cross-tab leakage; existence disclosure.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-IDA-002-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-IDA-002-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Clerk authentication boundary; First-slice actors. Clauses: SRC-3aa2b898-020, SRC-3aa2b898-021, SRC-3aa2b898-022, SRC-3aa2b898-023, SRC-3aa2b898-024, SRC-3aa2b898-025, SRC-3aa2b898-026, SRC-3aa2b898-027, SRC-3aa2b898-028, SRC-3aa2b898-029, SRC-3aa2b898-030, SRC-3aa2b898-031, SRC-3aa2b898-032, SRC-3aa2b898-033, SRC-3aa2b898-034, SRC-3aa2b898-035, SRC-3aa2b898-036, SRC-3aa2b898-037, SRC-3aa2b898-038, SRC-3aa2b898-001, SRC-3aa2b898-002, SRC-3aa2b898-003, SRC-3aa2b898-004, SRC-3aa2b898-005, SRC-3aa2b898-006, SRC-3aa2b898-007, SRC-3aa2b898-008, SRC-3aa2b898-009, SRC-3aa2b898-010, SRC-3aa2b898-011.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
