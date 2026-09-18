# R1-CMP-008-B: Classify Competitor and Judge No-Shows with contact evidence

Parent: R1-CMP-008 · Order: 660 · Owner: competition · Stage: 05 Preliminary competition

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-CMP-008-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-008-B/AC-01** — Use the prepublished grace policy, default ten minutes, and required in-app/email and responsible Coach or Judge operational contact attempts. Staff records Excused/Unexcused and evidence; no medical record or minor phone contact is required.
- **R1-CMP-008-B/AC-02** — Absent acknowledgment or failed delivery alone cannot classify a No-Show. A cross-entry hold expiry enters the accepted No-Show path without a second grace interval.
- **R1-CMP-008-B/AC-03** — Restrict individual status and notices to accepted audiences. Unexcused Judge reliability is restricted for two years and cannot lower qualification or trigger automatic platform exclusion.
- **R1-CMP-008-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: round and No-Show transitions; replacement selector; migrations; live operations and dispute UI.
- Interfaces: StartRound; CompleteRound; ClassifyNoShow; FileNoShowDispute; DecideNoShowDispute; GenerateReplacementCandidates; AdmitEmergencyReplacementJudge.
- Schemas: RoundState; NoShow; NoShowDispute; ReplacementCandidatePool; EmergencyReplacementJudge.
- Tables: competition_rounds; competition_no_shows; competition_no_show_disputes; competition_replacements.
- Events: RoundStarted; NoShowClassified; NoShowCorrected; ReplacementApproved.
- Errors: NO_SHOW_EVIDENCE_INCOMPLETE; DISPUTE_WINDOW_CLOSED; REPLACEMENT_INVALID; ROUND_STATE_INVALID.
- Audiences: affected Competitor and Coach; assigned Judge; operations; minimized public correction.
- Risks: automatic competitive outcome; private absence disclosure; deadline race.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-008-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-CMP-008-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0015-use-director-uploaded-standings-rules.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0015-use-director-uploaded-standings-rules.md): ; Use Tournament Director-uploaded standings rules; Consequences. Clauses: SRC-1ad5279c-001, SRC-1ad5279c-002, SRC-1ad5279c-003, SRC-1ad5279c-004, SRC-1ad5279c-005, SRC-1ad5279c-006, SRC-1ad5279c-007, SRC-1ad5279c-008, SRC-1ad5279c-009, SRC-1ad5279c-010, SRC-1ad5279c-011, SRC-1ad5279c-012, SRC-1ad5279c-013, SRC-1ad5279c-014, SRC-1ad5279c-015, SRC-1ad5279c-016, SRC-1ad5279c-017, SRC-1ad5279c-018, SRC-1ad5279c-019, SRC-1ad5279c-020, SRC-1ad5279c-021, SRC-1ad5279c-022, SRC-1ad5279c-023, SRC-1ad5279c-024, SRC-1ad5279c-025, SRC-1ad5279c-026, SRC-1ad5279c-027, SRC-1ad5279c-028, SRC-1ad5279c-029, SRC-1ad5279c-030, SRC-1ad5279c-031, SRC-1ad5279c-032, SRC-1ad5279c-033, SRC-1ad5279c-034, SRC-1ad5279c-035, SRC-1ad5279c-036, SRC-1ad5279c-037.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/pairing-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/pairing-model.md): Schedule and invitation-page alignment. Clauses: SRC-5312731b-046, SRC-5312731b-047, SRC-5312731b-048, SRC-5312731b-049, SRC-5312731b-050, SRC-5312731b-051.
- [wiki/tournament-directory-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/tournament-directory-model.md): Purpose. Clauses: SRC-f290e4f2-027.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
