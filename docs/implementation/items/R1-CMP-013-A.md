# R1-CMP-013-A: Validate and preview advancement policy and cut ties

Parent: R1-CMP-013 · Order: 470 · Owner: competition · Stage: 06 Standings and eliminations

Release requirements: R1-LIFE-001, R1-COMP-001, R1-CONS-001, R1-PRIV-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-CMP-012-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-CMP-013-A/AC-01** — Director controls/upload validate a separate plan tied to the accepted standings fingerprint, integer break 2..eligible count, eligibility, seed and bye rules with no executable operations.
- **R1-CMP-013-A/AC-02** — Preview smaller/equal/larger fields, ineligible near-cut Entries, complete cut ties and byes. Expand Field needs feasible resources; Play-In needs reserved contingency blocks; Seeded Draw publishes seed/algorithm before competition. Never silently switch policy.
- **R1-CMP-013-A/AC-03** — Director accepts an exact previewed version and publishes its human-readable summary. Standings and advancement remain separate; final schedule feasibility is checked at Schedule Selection and all policy references lock atomically at first pairing.
- **R1-CMP-013-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: advancement schema; calculator and vectors; migrations; approval and publication UI.
- Interfaces: ValidateAdvancementPlan; AcceptAdvancementPlan; CalculateAdvancementField; ApproveAdvancementField; PublishAdvancementField.
- Schemas: DocketAdvancementPlan; AdvancementField; TieAtCutDecision.
- Tables: competition_advancement_plans; competition_advancement_fields; competition_advancement_publications.
- Events: AdvancementPlanLocked; AdvancementFieldCalculated; AdvancementFieldPublished.
- Errors: ADVANCEMENT_PLAN_INVALID; FIELD_SOURCE_STALE; TIE_POLICY_INFEASIBLE.
- Audiences: public qualifiers; School-private exclusion; authorized staff.
- Risks: subjective cut selection; wrong byes; unpublished source drift.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-CMP-013-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-CMP-013-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0017-separate-standings-from-advancement.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0017-separate-standings-from-advancement.md): ; Separate standings from advancement; Consequences. Clauses: SRC-0831430f-001, SRC-0831430f-002, SRC-0831430f-003, SRC-0831430f-004, SRC-0831430f-005, SRC-0831430f-006, SRC-0831430f-007, SRC-0831430f-008, SRC-0831430f-009, SRC-0831430f-010, SRC-0831430f-011, SRC-0831430f-012, SRC-0831430f-013, SRC-0831430f-014, SRC-0831430f-015, SRC-0831430f-016, SRC-0831430f-017, SRC-0831430f-018, SRC-0831430f-019, SRC-0831430f-020, SRC-0831430f-021, SRC-0831430f-022, SRC-0831430f-023, SRC-0831430f-024, SRC-0831430f-025, SRC-0831430f-026, SRC-0831430f-027, SRC-0831430f-028, SRC-0831430f-029, SRC-0831430f-030, SRC-0831430f-031, SRC-0831430f-032, SRC-0831430f-033, SRC-0831430f-034, SRC-0831430f-035, SRC-0831430f-036.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/advancement-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/advancement-model.md): Separate advancement policy; Upload contract and validation; Tie at the qualification cut; Break size and partial brackets; Acceptance, publication, and lock. Clauses: SRC-17086540-001, SRC-17086540-002, SRC-17086540-003, SRC-17086540-004, SRC-17086540-005, SRC-17086540-006, SRC-17086540-007, SRC-17086540-008, SRC-17086540-009, SRC-17086540-010, SRC-17086540-011, SRC-17086540-012, SRC-17086540-013, SRC-17086540-014, SRC-17086540-015, SRC-17086540-016, SRC-17086540-017, SRC-17086540-018, SRC-17086540-019, SRC-17086540-020, SRC-17086540-021, SRC-17086540-022, SRC-17086540-032, SRC-17086540-033, SRC-17086540-034.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
