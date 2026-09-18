# R1-CMP-003-B: Account for School-supplied Judges and obligation deficits

Parent: R1-CMP-003 · Order: 420 · Owner: competition · Stage: 04 Scheduling and Judge operations

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-CMP-003-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-003-B/AC-01** — School Judge Manager nomination counts only after Judge relationship confirmation and tournament acceptance; source never alters qualification.
- **R1-CMP-003-B/AC-02** — Pre-lock source correction follows the Judge/School request; after lock require reasoned Director or Judge/room approval. Concurrent source changes cannot count one relationship twice.
- **R1-CMP-003-B/AC-03** — Removing a counted Judge immediately marks the School deficient and notifies the Manager, Judge Manager, Entry Manager and staff. Replacement follows the published deadline and only a pre-disclosed locked-policy remedy can follow.
- **R1-CMP-003-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: Judge Pool interface; migrations; participation and staff screens; pool projection.
- Interfaces: RequestJudgePoolParticipation; DecideJudgePoolParticipation; CorrectJudgeSource; WithdrawJudgePoolParticipation.
- Schemas: JudgePoolParticipation; JudgeSource; SpecialCircumstanceWithdrawal; JudgeReliabilityRecord.
- Tables: competition_judge_pool; competition_judge_sources; competition_judge_withdrawals; competition_judge_reliability.
- Events: JudgePoolParticipationAccepted; JudgeSourceCorrected; JudgeWithdrawn.
- Errors: JUDGE_NOT_QUALIFIED; WITHDRAWAL_LOCKED; SOURCE_UNCONFIRMED; JUDGE_POOL_SCOPE_DENIED.
- Audiences: Judge; authenticated participants limited pool; operations staff.
- Risks: qualification disclosure; source miscount; hidden staffing deficit.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-003-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-CMP-003-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Judge access lifecycle. Clauses: SRC-3aa2b898-225, SRC-3aa2b898-226.
- [wiki/judge-qualification-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/judge-qualification-model.md): Tournament participation interest. Clauses: SRC-12b08e9d-004, SRC-12b08e9d-005.
- [wiki/tournament-directory-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/tournament-directory-model.md): Purpose. Clauses: SRC-f290e4f2-021, SRC-f290e4f2-022.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
