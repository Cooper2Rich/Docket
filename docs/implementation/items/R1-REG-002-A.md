# R1-REG-002-A: Publish coherent registration and admission policies

Parent: R1-REG-002 · Order: 290 · Owner: registration · Stage: 03 Configuration and registration

Release requirements: R1-LIFE-001, R1-PRIV-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-TRN-003-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-REG-002-A/AC-01** — A Director publishes coherent opening/submission/edit/admission/waitlist instants in the named tournament timezone, capacity, optional School caps, objective priority groups and the accommodation planning target before opening.
- **R1-REG-002-A/AC-02** — After opening, revision can extend or relax only, never shorten an instant, strengthen priority against existing submissions, or invalidate a complete Entry. Require exact impact confirmation and public/School notices.
- **R1-REG-002-A/AC-03** — First Pairing Publication ends policy revision. Timezone/DST cases compare real instants, and the accommodation request-by target cannot become an admission cutoff.
- **R1-REG-002-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: policy contracts; migrations; validation and preview UI; public summary.
- Interfaces: CreateRegistrationPolicy; ReviseRegistrationPolicy; GrantLateRegistrationException; PublishRegistrationSchema.
- Schemas: TournamentRegistrationPolicy; AdmissionPolicy; RegistrationDataSchema.
- Tables: registration_policies; registration_policy_versions; registration_data_schemas; registration_late_exceptions.
- Events: RegistrationPolicyPublished; RegistrationPolicyRevised; LateExceptionGranted.
- Errors: POLICY_REVISION_TIGHTENS_OBLIGATION; DEADLINE_PASSED; FIELD_PURPOSE_INVALID.
- Audiences: School staff; Director; registration staff; public summary.
- Risks: retroactive burden; unnecessary minor data; timezone deadline error.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-REG-002-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-REG-002-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0022-use-a-published-tournament-registration-policy.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0022-use-a-published-tournament-registration-policy.md): ; Use a published Tournament Registration Policy; Consequences. Clauses: SRC-36b1de95-001, SRC-36b1de95-002, SRC-36b1de95-003, SRC-36b1de95-004, SRC-36b1de95-005, SRC-36b1de95-006, SRC-36b1de95-007, SRC-36b1de95-008, SRC-36b1de95-009, SRC-36b1de95-010, SRC-36b1de95-011, SRC-36b1de95-012, SRC-36b1de95-013, SRC-36b1de95-014, SRC-36b1de95-015, SRC-36b1de95-016, SRC-36b1de95-017, SRC-36b1de95-018, SRC-36b1de95-019.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/registration-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/registration-model.md): Tournament Registration Policy; Admission Recommendation and waitlist; Accommodation timing and late handling. Clauses: SRC-751d83c0-031, SRC-751d83c0-032, SRC-751d83c0-033, SRC-751d83c0-034, SRC-751d83c0-035, SRC-751d83c0-036, SRC-751d83c0-037, SRC-751d83c0-038, SRC-751d83c0-039, SRC-751d83c0-040, SRC-751d83c0-041, SRC-751d83c0-042, SRC-751d83c0-043, SRC-751d83c0-044, SRC-751d83c0-085.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
