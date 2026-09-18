# R1-REG-001-A: Submit one valid Entry through the complete delivery path

Parent: R1-REG-001 · Order: 310 · Owner: registration · Stage: 02 Walking skeleton

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-DATA-001, R1-MSG-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-REG-002-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-REG-001-A/AC-01** — In a seeded browser journey, an active Entry Manager selects an affiliated authorized Competitor, prepares complete data and supplies final School sign-off; submission commits Draft to Submitted and returns a durable receipt.
- **R1-REG-001-A/AC-02** — One trace proves browser to generated client/API, module, PostgreSQL, outbox, real worker, Account inbox and Mailpit confirmation for the responsible Coach. No separate Competitor Entry Confirmation or Competitor admission notice is added.
- **R1-REG-001-A/AC-03** — Duplicate submission returns the same effect and receipt; a transaction failure commits neither Entry transition nor event. Wrong School, revoked role, absent authorization and concurrent duplicate active Entry are rejected.
- **R1-REG-001-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: minimal Entry aggregate; migration; submission API and web form; confirmation notification; end-to-end fixture.
- Interfaces: CreateDraftEntry; SubmitEntry; GetEntry.
- Schemas: CoreEntryRegistrationData; DraftEntry; SubmittedEntry.
- Tables: registration_entries; registration_entry_versions; registration_eligibility_attestations.
- Events: EntryDrafted; EntrySubmitted; EntryConfirmationRequested.
- Errors: ENTRY_DUPLICATE; ENTRY_INCOMPLETE; AFFILIATION_REQUIRED; ENTRY_VERSION_STALE.
- Audiences: responsible Coach; Competitor limited view; registration staff.
- Risks: foreign-School submission; duplicate Entry; lost confirmation; partial workflow.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-REG-001-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-REG-001-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0023-minimize-core-entry-data.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0023-minimize-core-entry-data.md): ; Minimize Core Entry Data; Consequences. Clauses: SRC-435dae21-001, SRC-435dae21-002, SRC-435dae21-003, SRC-435dae21-004, SRC-435dae21-005, SRC-435dae21-006, SRC-435dae21-007, SRC-435dae21-008, SRC-435dae21-009, SRC-435dae21-010, SRC-435dae21-011.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): Competitor Account boundary. Clauses: SRC-3aa2b898-089.
- [wiki/registration-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/registration-model.md): Registration Model; Lincoln-Douglas Entry identity; Entry registration lifecycle; Normal transition authority; Minimum Entry data and projections; Competitor identity. Clauses: SRC-751d83c0-001, SRC-751d83c0-002, SRC-751d83c0-003, SRC-751d83c0-004, SRC-751d83c0-005, SRC-751d83c0-006, SRC-751d83c0-007, SRC-751d83c0-008, SRC-751d83c0-009, SRC-751d83c0-010, SRC-751d83c0-011, SRC-751d83c0-012, SRC-751d83c0-013, SRC-751d83c0-014, SRC-751d83c0-015, SRC-751d83c0-016, SRC-751d83c0-017, SRC-751d83c0-018, SRC-751d83c0-019, SRC-751d83c0-020, SRC-751d83c0-021, SRC-751d83c0-022, SRC-751d83c0-023, SRC-751d83c0-024, SRC-751d83c0-025, SRC-751d83c0-026, SRC-751d83c0-027, SRC-751d83c0-045, SRC-751d83c0-046, SRC-751d83c0-047, SRC-751d83c0-048, SRC-751d83c0-049, SRC-751d83c0-050, SRC-751d83c0-051, SRC-751d83c0-052, SRC-751d83c0-053, SRC-751d83c0-054, SRC-751d83c0-055, SRC-751d83c0-056, SRC-751d83c0-105.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
