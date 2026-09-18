# R1-CMP-011-C: Resolve downstream conflicts without rewriting played rounds

Parent: R1-CMP-011 · Order: 770 · Owner: competition · Stage: 05 Preliminary competition

Release requirements: R1-CONS-001, R1-PRIV-001, R1-MSG-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-CMP-011-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-011-C/AC-01** — Correction identifies every affected artifact and invalidates stale drafts/approvals by source fingerprint. Staff prepares impact; only Director approves the exact resolution.
- **R1-CMP-011-C/AC-02** — Regenerate unpublished artifacts; withdraw and republish published unstarted rounds with notices; retain Started/Completed pairings as played with a prospective administrative ruling. A round's own decision needs its separately justified correction.
- **R1-CMP-011-C/AC-03** — Retain every prior version and restricted evidence, publish only human-readable changed public values and required action, and block dependent outcome-sensitive work until its conflict is resolved. Failed notice delivery retries without rolling back the decision.
- **R1-CMP-011-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: correction and ruling transitions; migrations; restricted review UI; public Correction Notice inputs.
- Interfaces: OpenBallotCorrection; ApproveBallotReopening; CorrectCompetitiveResult; AssignRubricBlockedCase; PublishAdministrativeRuling.
- Schemas: BallotCorrectionCase; ResultCorrection; RubricBlockedAdministrativeRuling; DownstreamConflict.
- Tables: competition_ballot_corrections; competition_result_versions; competition_administrative_rulings.
- Events: BallotReopened; ResultCorrected; AdministrativeRulingPublished; DownstreamConflictOpened.
- Errors: CORRECTION_MERITS_APPEAL; RULING_EVIDENCE_INCOMPLETE; INDEPENDENCE_REQUIRED.
- Audiences: affected participants; assigned Judge; authorized staff; minimized public outcome.
- Risks: merits appeal; Judge punishment; secret evidence exposure; rewritten downstream state.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-011-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-CMP-011-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0010-version-results-and-surface-downstream-conflicts.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0010-version-results-and-surface-downstream-conflicts.md): ; Version result corrections and surface downstream conflicts; Consequences. Clauses: SRC-da232de5-001, SRC-da232de5-002, SRC-da232de5-003, SRC-da232de5-004, SRC-da232de5-005, SRC-da232de5-006, SRC-da232de5-007, SRC-da232de5-008, SRC-da232de5-009, SRC-da232de5-010, SRC-da232de5-011, SRC-da232de5-012, SRC-da232de5-013, SRC-da232de5-014, SRC-da232de5-015, SRC-da232de5-016, SRC-da232de5-017, SRC-da232de5-018, SRC-da232de5-019, SRC-da232de5-020, SRC-da232de5-021, SRC-da232de5-022, SRC-da232de5-023, SRC-da232de5-024, SRC-da232de5-025, SRC-da232de5-026, SRC-da232de5-027, SRC-da232de5-028, SRC-da232de5-029, SRC-da232de5-030, SRC-da232de5-031, SRC-da232de5-032, SRC-da232de5-033, SRC-da232de5-034.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Tournament operations delegation. Clauses: SRC-3aa2b898-193.
- [wiki/ballot-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/ballot-model.md): Downstream Conflict resolution. Clauses: SRC-43f3ef1f-111, SRC-43f3ef1f-112, SRC-43f3ef1f-113, SRC-43f3ef1f-114, SRC-43f3ef1f-115, SRC-43f3ef1f-116, SRC-43f3ef1f-117, SRC-43f3ef1f-118, SRC-43f3ef1f-119, SRC-43f3ef1f-120.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
