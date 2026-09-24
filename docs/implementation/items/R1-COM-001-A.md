# R1-COM-001-A: Commit outbox events and deliver idempotent work

Parent: R1-COM-001 · Order: 140 · Owner: communications · Stage: 02 Walking skeleton

Release requirements: R1-MSG-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-IDA-002-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-COM-001-A/AC-01** — A module transaction commits domain change and outbox event together or neither. A real worker claims committed events through pg-boss and delivers at least once without repeating the domain effect.
- **R1-COM-001-A/AC-02** — Crash after commit, duplicate delivery, retry after timeout, and worker restart preserve one logical effect and observable retry history; an abandoned lock cannot remain permanently held.
- **R1-COM-001-A/AC-03** — Correlation, causation, event version, delivery state, retry policy, and redacted telemetry follow the runtime contracts. Cross-module workflows use public interfaces and explicit compensation rather than foreign table writes.
- **R1-COM-001-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: outbox plumbing; communications interface; migrations; worker handlers; inbox UI.
- Interfaces: AppendOutboxMessage; CreateNoticeIntent; DeliverNotice; ReadAccessInbox.
- Schemas: OutboxEnvelope; NoticeIntent; DeliveryAttempt; InboxItem.
- Tables: communications_notice_intents; communications_delivery_attempts; communications_inbox_items; module_outbox tables.
- Events: NoticeRequested; NoticeDelivered; NoticeDeliveryFailed; NoticeEscalated.
- Errors: IDEMPOTENCY_CONFLICT; RECIPIENT_UNAUTHORIZED; DELIVERY_PROVIDER_FAILED.
- Audiences: authorized recipient; initiating actor where allowed; operations.
- Risks: lost message; duplicate external effect; private payload disclosure; API starvation.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-COM-001-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-COM-001-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/architecture/repository-map.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/architecture/repository-map.md): Repository and Module Map; Top-level topology; `apps/web`; `apps/api`; `apps/worker`; `apps/migrate`; Domain modules; `identity-access`; `schools`; `tournaments`; `registration`; `competition`; `publication`; `communications`; `governance`; `workflows`; `contracts`; `database`; `runtime`; `observability`; `testkit`; Dependency direction; Data ownership; Interface and adapter rules; Prohibited structures; Extraction rule. Clauses: SRC-8483f98a-001, SRC-8483f98a-002, SRC-8483f98a-003, SRC-8483f98a-004, SRC-8483f98a-005, SRC-8483f98a-006, SRC-8483f98a-007, SRC-8483f98a-008, SRC-8483f98a-009, SRC-8483f98a-010, SRC-8483f98a-011, SRC-8483f98a-012, SRC-8483f98a-013, SRC-8483f98a-014, SRC-8483f98a-015, SRC-8483f98a-016, SRC-8483f98a-017, SRC-8483f98a-018, SRC-8483f98a-019, SRC-8483f98a-020, SRC-8483f98a-021, SRC-8483f98a-022, SRC-8483f98a-023, SRC-8483f98a-024, SRC-8483f98a-025, SRC-8483f98a-026, SRC-8483f98a-027, SRC-8483f98a-028, SRC-8483f98a-029, SRC-8483f98a-030, SRC-8483f98a-031, SRC-8483f98a-032, SRC-8483f98a-033, SRC-8483f98a-034, SRC-8483f98a-035, SRC-8483f98a-036, SRC-8483f98a-037, SRC-8483f98a-038, SRC-8483f98a-039, SRC-8483f98a-040, SRC-8483f98a-041, SRC-8483f98a-042, SRC-8483f98a-043, SRC-8483f98a-044, SRC-8483f98a-045, SRC-8483f98a-046, SRC-8483f98a-047, SRC-8483f98a-048, SRC-8483f98a-049, SRC-8483f98a-050, SRC-8483f98a-051, SRC-8483f98a-052, SRC-8483f98a-053, SRC-8483f98a-054, SRC-8483f98a-055, SRC-8483f98a-056.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/backend-architecture.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/backend-architecture.md): Asynchronous work. Clauses: SRC-3a042821-007, SRC-3a042821-008, SRC-3a042821-009.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
