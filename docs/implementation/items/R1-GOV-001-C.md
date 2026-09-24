# R1-GOV-001-C: Make backup expiry and restoration honor privacy deadlines

Parent: R1-GOV-001 · Order: 1000 · Owner: governance · Stage: 08 Governance and release

Release requirements: R1-AUTH-001, R1-CONS-001, R1-PRIV-001, R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-GOV-001-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-GOV-001-C/AC-01** — Choose and implement a demonstrable recoverable-copy strategy that meets every deadline, including shorter-than-backup retention; cryptographic erasure is acceptable only with evidence that all usable keys/copies are erased.
- **R1-GOV-001-C/AC-02** — Restore to an isolated environment, replay elapsed deletion/hold-release obligations and prove expired data cannot be recovered or served before traffic is enabled.
- **R1-GOV-001-C/AC-03** — A failed erasure, unavailable key inventory or late backup copy is a visible blocker with retry/escalation, never a successful deletion receipt. Record redacted restore and erasure proof for release review.
- **R1-GOV-001-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: governance interfaces; migrations; retention jobs; Legal Hold UI; cross-module conformance suite.
- Interfaces: AppendPrivilegedAudit; ScheduleRetention; ExecuteDeletion; PrepareLegalHold; ApproveLegalHold; ReleaseLegalHold.
- Schemas: PrivilegedAuditEvent; RetentionSchedule; LegalHold.
- Tables: governance_audit_events; governance_retention_schedules; governance_legal_holds.
- Events: RetentionScheduled; ArtifactDeleted; LegalHoldActivated; LegalHoldReleased.
- Errors: LEGAL_HOLD_SECOND_ACTOR_REQUIRED; RETENTION_SCOPE_INVALID; DELETION_HELD.
- Audiences: record audience; Legal and Privacy Operations; restricted audit.
- Risks: over-retention; unsafe deletion; single-actor hold; backup resurrection.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-GOV-001-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-GOV-001-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/operations/release-1.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/operations/release-1.md): Release 1 Operations Contract; Environments; Runtime topology; Deployment; Recovery; Observability and privacy; Degraded operation. Clauses: SRC-d49f936b-001, SRC-d49f936b-002, SRC-d49f936b-003, SRC-d49f936b-004, SRC-d49f936b-005, SRC-d49f936b-006, SRC-d49f936b-007, SRC-d49f936b-008, SRC-d49f936b-009, SRC-d49f936b-010, SRC-d49f936b-011, SRC-d49f936b-012, SRC-d49f936b-013, SRC-d49f936b-014, SRC-d49f936b-015, SRC-d49f936b-016, SRC-d49f936b-017, SRC-d49f936b-018, SRC-d49f936b-019, SRC-d49f936b-020, SRC-d49f936b-021, SRC-d49f936b-022, SRC-d49f936b-023, SRC-d49f936b-024, SRC-d49f936b-025, SRC-d49f936b-026, SRC-d49f936b-027.
- [wiki/retention-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/retention-model.md): Scope and retention clock; Permanent Public Tournament Record; Seven-Year Competitive Evidence; Two-Year Routine Operational Telemetry; Specific-policy precedence. Clauses: SRC-272e4825-001, SRC-272e4825-002, SRC-272e4825-003, SRC-272e4825-004, SRC-272e4825-005, SRC-272e4825-006, SRC-272e4825-007, SRC-272e4825-008, SRC-272e4825-009, SRC-272e4825-010, SRC-272e4825-011, SRC-272e4825-012, SRC-272e4825-013, SRC-272e4825-014, SRC-272e4825-015, SRC-272e4825-016, SRC-272e4825-017, SRC-272e4825-018, SRC-272e4825-019, SRC-272e4825-020, SRC-272e4825-021, SRC-272e4825-022, SRC-272e4825-023, SRC-272e4825-024, SRC-272e4825-025, SRC-272e4825-026, SRC-272e4825-027, SRC-272e4825-028, SRC-272e4825-029, SRC-272e4825-030, SRC-272e4825-031, SRC-272e4825-032, SRC-272e4825-033, SRC-272e4825-034, SRC-272e4825-035, SRC-272e4825-036, SRC-272e4825-037, SRC-272e4825-038, SRC-272e4825-039, SRC-272e4825-040, SRC-272e4825-041, SRC-272e4825-042, SRC-272e4825-043, SRC-272e4825-044, SRC-272e4825-045, SRC-272e4825-046, SRC-272e4825-047.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
