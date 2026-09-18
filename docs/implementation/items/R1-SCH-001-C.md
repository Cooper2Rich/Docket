# R1-SCH-001-C: Recover a School Manager without temporary authority

Parent: R1-SCH-001 · Order: 190 · Owner: schools · Stage: 02 Walking skeleton

Release requirements: R1-LIFE-001, R1-AUTH-001, R1-CONS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-SCH-001-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-SCH-001-C/AC-01** — Use normal Account recovery first. An existing member may request Manager recovery with institutional evidence and notice to the incumbent.
- **R1-SCH-001-C/AC-02** — Two distinct Platform Administrators approve and the eligible recipient accepts before one atomic replacement. Duplicate approvals, one actor in both slots, stale membership, and concurrent transfers cannot create zero or two Managers.
- **R1-SCH-001-C/AC-03** — Pending recovery creates no temporary Manager; permitted support actions retain their own identity and cannot perform membership edits outside the recovery scope.
- **R1-SCH-001-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: School module interface; migrations; API and web flows; authority events and tests.
- Interfaces: CreateProvisionalSchool; VerifySchool; IssueSchoolMembershipOffer; AcceptSchoolMembershipOffer; TransferSchoolManager.
- Schemas: School; SchoolMembership; SchoolRole; MembershipOffer; SchoolEvent.
- Tables: schools_schools; schools_aliases; schools_memberships; schools_membership_offers; schools_events; schools_command_receipts.
- Events: SchoolCreated; SchoolVerified; SchoolMembershipGranted; SchoolManagerChanged.
- Errors: SCHOOL_DUPLICATE; SCHOOL_UNVERIFIED; MANAGER_CONFLICT; OFFER_INVALID; IDEMPOTENCY_CONFLICT.
- Audiences: School staff; Account recipient; Platform administrator; Audit consumer.
- Risks: duplicate School; exclusive-role race; domain inference; foreign-School access.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-SCH-001-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and current-head approving review. |

Write machine evidence to `.ralph/evidence/R1-SCH-001-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0008-single-school-manager-with-composable-roles.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0008-single-school-manager-with-composable-roles.md): ; Use one school manager with composable membership roles; Consequences. Clauses: SRC-277a9422-001, SRC-277a9422-002, SRC-277a9422-003, SRC-277a9422-004, SRC-277a9422-005, SRC-277a9422-006, SRC-277a9422-007, SRC-277a9422-008, SRC-277a9422-009, SRC-277a9422-010, SRC-277a9422-011, SRC-277a9422-012.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): School Membership roles. Clauses: SRC-3aa2b898-155, SRC-3aa2b898-156.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
