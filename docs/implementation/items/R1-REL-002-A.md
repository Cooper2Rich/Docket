# R1-REL-002-A: Provision isolated AWS and Vercel environments through Terraform

Parent: R1-REL-002 · Order: 1090 · Owner: runtime · Stage: 08 Governance and release

Release requirements: R1-OPS-001, R1-CONS-001, R1-MSG-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-REL-001-C.
- External/decision gates: GATE-ENVIRONMENTS.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-REL-002-A/AC-01** — Implement the accepted isolated environments with WAF/ALB, ECS API and worker, explicit migration task, Multi-AZ RDS, encrypted/versioned S3, SES, KMS/Secrets and web-only Vercel deployment through reviewed Terraform.
- **R1-REL-002-A/AC-02** — Use least-privilege OIDC and environment-specific identities with no committed credentials. Web uses generated API clients and has no direct database access; network and storage boundaries are verified.
- **R1-REL-002-A/AC-03** — Read back actual environment configuration, TLS/domain/mail readiness and resource ownership from the authorized accounts. A missing account, DNS authority, billing or quota is an external gate rather than assumed infrastructure.
- **R1-REL-002-A/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: load suite; restore record; deployment compatibility evidence; rollback record; capacity and alert dashboards.
- Interfaces: ReleaseGateEvidence.
- Schemas: LoadReport; RestoreReport; DeploymentReport.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: ReleaseGateEvaluated.
- Errors: QUALITY_GATE_FAILED; RECOVERY_OBJECTIVE_MISSED; DEPLOYMENT_INCOMPATIBLE.
- Audiences: release operators; reviewers.
- Risks: unrepresentative load; untested restore; schema rollout outage.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-REL-002-A --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-REL-002-A/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0034-deploy-release-1-on-aws.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0034-deploy-release-1-on-aws.md): ADR 0034: Deploy the web application on Vercel and durable services on AWS; Context; Decision; Consequences. Clauses: SRC-04f5b474-001, SRC-04f5b474-002, SRC-04f5b474-003, SRC-04f5b474-004, SRC-04f5b474-005, SRC-04f5b474-006, SRC-04f5b474-007, SRC-04f5b474-008, SRC-04f5b474-009, SRC-04f5b474-010, SRC-04f5b474-011, SRC-04f5b474-012, SRC-04f5b474-013, SRC-04f5b474-014, SRC-04f5b474-015, SRC-04f5b474-016, SRC-04f5b474-017, SRC-04f5b474-018, SRC-04f5b474-019.
- [docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md): Organize the monolith by deep domain modules; Consequences. Clauses: SRC-cf3657b8-001, SRC-cf3657b8-002, SRC-cf3657b8-003.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/operations/release-1.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/operations/release-1.md): Release 1 Operations Contract; Environments; Runtime topology; Deployment; Recovery; Observability and privacy; Degraded operation. Clauses: SRC-d49f936b-001, SRC-d49f936b-002, SRC-d49f936b-003, SRC-d49f936b-004, SRC-d49f936b-005, SRC-d49f936b-006, SRC-d49f936b-007, SRC-d49f936b-008, SRC-d49f936b-009, SRC-d49f936b-010, SRC-d49f936b-011, SRC-d49f936b-012, SRC-d49f936b-013, SRC-d49f936b-014, SRC-d49f936b-015, SRC-d49f936b-016, SRC-d49f936b-017, SRC-d49f936b-018, SRC-d49f936b-019, SRC-d49f936b-020, SRC-d49f936b-021, SRC-d49f936b-022, SRC-d49f936b-023, SRC-d49f936b-024, SRC-d49f936b-025, SRC-d49f936b-026, SRC-d49f936b-027.
- [wiki/backend-architecture.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/backend-architecture.md): Backend Architecture; Repository and module boundaries; Persistence and files; Asynchronous work; Client API; Deployment safety; Runtime operations; Authentication and authorization; Concurrent writes; Privileged audit; Time and identity; Accepted implementation stack. Clauses: SRC-3a042821-001, SRC-3a042821-002, SRC-3a042821-003, SRC-3a042821-004, SRC-3a042821-005, SRC-3a042821-006, SRC-3a042821-007, SRC-3a042821-008, SRC-3a042821-009, SRC-3a042821-010, SRC-3a042821-011, SRC-3a042821-012, SRC-3a042821-013, SRC-3a042821-014, SRC-3a042821-015, SRC-3a042821-016, SRC-3a042821-017, SRC-3a042821-018, SRC-3a042821-019, SRC-3a042821-020, SRC-3a042821-021, SRC-3a042821-022, SRC-3a042821-023, SRC-3a042821-024, SRC-3a042821-025, SRC-3a042821-026, SRC-3a042821-027, SRC-3a042821-028, SRC-3a042821-029, SRC-3a042821-030, SRC-3a042821-031.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
