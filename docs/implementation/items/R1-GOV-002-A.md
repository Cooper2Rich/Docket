# R1-GOV-002-A: Expose only typed, evidenced support operations

Parent: R1-GOV-002 · Order: 1020 · Owner: governance · Stage: 08 Governance and release

Release requirements: R1-AUTH-001, R1-PRIV-001, R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-GOV-001-D.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-GOV-002-A/AC-01** — Support may use redacted diagnostics, resend the unchanged authorized notice, idempotently replay through original guards, rebuild an equivalent projection, or clear a proven ownerless expired lock using the accepted typed operations.
- **R1-GOV-002-A/AC-02** — Each operation requires ticket, reason, exact target, impact preview and attributed outcome/Owner notice; deny generic database commands, impersonation, arbitrary role grants and retention changes.
- **R1-GOV-002-A/AC-03** — Closed-state rebuild preserves the same projection and cannot rewrite history. Replays revalidate current authority and expiry; stale confirmation, changed payload and concurrent live-lock ownership are rejected.
- **R1-GOV-002-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: security review interfaces; support union; rate-limit policies; telemetry schemas; degraded-mode tests and runbooks.
- Interfaces: OpenIntegrityReview; DecideIntegrityReview; ExecuteSupportAction; EvaluateRateLimit.
- Schemas: IntegrityReview; SupportActionCommand; SecurityAlert; RateLimitDecision.
- Tables: governance_integrity_reviews; governance_support_actions; governance_security_alerts.
- Events: IntegrityReviewOpened; SupportActionExecuted; SecurityAlertRaised.
- Errors: SUPPORT_ACTION_PROHIBITED; REVIEW_INDEPENDENCE_REQUIRED; RATE_LIMITED.
- Audiences: affected Account; authorized Platform staff; operations.
- Risks: administrator impersonation; source mutation; sensitive telemetry; critical traffic starvation.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-GOV-002-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-GOV-002-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0005-prohibit-administrator-impersonation.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0005-prohibit-administrator-impersonation.md): ; Prohibit administrator impersonation; Consequences. Clauses: SRC-f24d03c3-001, SRC-f24d03c3-002, SRC-f24d03c3-003, SRC-f24d03c3-004, SRC-f24d03c3-005, SRC-f24d03c3-006, SRC-f24d03c3-007, SRC-f24d03c3-008, SRC-f24d03c3-009, SRC-f24d03c3-010, SRC-f24d03c3-011, SRC-f24d03c3-012, SRC-f24d03c3-013, SRC-f24d03c3-014, SRC-f24d03c3-015.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Ordinary Platform Support Actions. Clauses: SRC-3aa2b898-072, SRC-3aa2b898-073, SRC-3aa2b898-074, SRC-3aa2b898-075, SRC-3aa2b898-076, SRC-3aa2b898-077, SRC-3aa2b898-078, SRC-3aa2b898-079, SRC-3aa2b898-080, SRC-3aa2b898-081.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
