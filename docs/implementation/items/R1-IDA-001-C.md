# R1-IDA-001-C: Recover Clerk linkage with independent evidence and review

Parent: R1-IDA-001 · Order: 950 · Owner: identity-access · Stage: 02 Walking skeleton

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-PUB-001-C.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-IDA-001-C/AC-01** — Try the Clerk recovery path first; reassociation requires two independent linkage proofs plus control of the new Clerk identity, never email/name matching alone.
- **R1-IDA-001-C/AC-02** — Ordinary recovery needs one authorized reviewer; Owner/platform-sensitive recovery needs two distinct reviewers under the accepted policy. Preserve Account identity and historical actors while revoking superseded sessions/linkage.
- **R1-IDA-001-C/AC-03** — One reconsideration within 14 days uses different eligible reviewers. Delete evidence after 30 days and retain the appropriate two-/seven-year decision stub; notices expose no sensitive recovery evidence.
- **R1-IDA-001-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: identity interface; migrations; adapters; session routes and screens; audit and fixture coverage.
- Interfaces: AuthenticateClerkSession; AuthenticateFixedIdentity; CreateDocketSession; RevokeDocketSession; ListDocketSessions.
- Schemas: ClerkIdentity; ClerkSessionEvidence; DocketSession; session projections.
- Tables: identity_accounts; identity_clerk_links; identity_sessions.
- Events: AccountCreated; SessionCreated; SessionRevoked.
- Errors: IDENTITY_INVALID; SESSION_EXPIRED; SESSION_LIMIT_REACHED; FIXED_IDENTITY_FORBIDDEN.
- Audiences: Account holder; Platform audit.
- Risks: account collision; token leakage; provider outage; session fixation.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-IDA-001-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-IDA-001-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0029-use-clerk-for-managed-authentication.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0029-use-clerk-for-managed-authentication.md): ADR 0029: Use Clerk for managed authentication; Context; Decision; Consequences. Clauses: SRC-73056a95-001, SRC-73056a95-002, SRC-73056a95-003, SRC-73056a95-004, SRC-73056a95-005, SRC-73056a95-006, SRC-73056a95-007, SRC-73056a95-008, SRC-73056a95-009, SRC-73056a95-010, SRC-73056a95-011, SRC-73056a95-012, SRC-73056a95-013, SRC-73056a95-014, SRC-73056a95-015, SRC-73056a95-016, SRC-73056a95-017, SRC-73056a95-018, SRC-73056a95-019, SRC-73056a95-020, SRC-73056a95-021, SRC-73056a95-022, SRC-73056a95-023, SRC-73056a95-024, SRC-73056a95-025, SRC-73056a95-026, SRC-73056a95-027, SRC-73056a95-028, SRC-73056a95-029, SRC-73056a95-030, SRC-73056a95-031, SRC-73056a95-032, SRC-73056a95-033, SRC-73056a95-034, SRC-73056a95-035.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Clerk authentication boundary. Clauses: SRC-3aa2b898-033, SRC-3aa2b898-034, SRC-3aa2b898-035, SRC-3aa2b898-036, SRC-3aa2b898-037, SRC-3aa2b898-038.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
