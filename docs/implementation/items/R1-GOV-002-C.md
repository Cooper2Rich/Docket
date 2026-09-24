# R1-GOV-002-C: Enforce security boundaries and degraded-service behavior

Parent: R1-GOV-002 · Order: 1040 · Owner: governance · Stage: 08 Governance and release

Release requirements: R1-AUTH-001, R1-PRIV-001, R1-OPS-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Full usable vertical slice: domain commands/queries, runtime schemas, persistence/migrations, adapters, API, required worker deliveries and accessible web route/states.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and controller-verified leaves: R1-GOV-002-B.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-GOV-002-C/AC-01** — Exercise every role/context/state authorization matrix through real command boundaries, including stale authority, cross-School/tournament object IDs, revoked sessions and Closed-state background retries.
- **R1-GOV-002-C/AC-02** — Enforce accepted request limits, secure headers/origins, secret redaction and dependency-outage behavior with actionable errors; duplicate or delayed delivery cannot broaden access or double-apply a write.
- **R1-GOV-002-C/AC-03** — Run the complete privacy/security regression and verify caches, logs, traces, notifications and browser payloads against audience contracts. Any unresolved material finding blocks release.
- **R1-GOV-002-C/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: security review interfaces; support union; rate-limit policies; telemetry schemas; degraded-mode tests and runbooks.
- Interfaces: OpenIntegrityReview; DecideIntegrityReview; ExecuteSupportAction; EvaluateRateLimit.
- Schemas: IntegrityReview; SupportActionCommand; SecurityAlert; RateLimitDecision.
- Tables: governance_integrity_reviews; governance_support_actions; governance_security_alerts.
- Events: IntegrityReviewOpened; SupportActionExecuted; SecurityAlertRaised.
- Errors: SUPPORT_ACTION_PROHIBITED; REVIEW_INDEPENDENCE_REQUIRED; RATE_LIMITED.
- Audiences: affected Account; authorized Platform staff; operations.
- Risks: administrator impersonation; source mutation; sensitive telemetry; critical traffic starvation.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-GOV-002-C --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| integration | `pnpm test:integration` | R1-FND-003-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| contracts | `pnpm contracts check` | R1-FND-004-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| ci-full | `pnpm ci:full` | R1-FND-005-A | All eleven commands pass locally; separately verify all eleven exact current-head CI contexts and the accepted review mode. |

Write machine evidence to `.ralph/evidence/R1-GOV-002-C/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and the accepted controller-evidence review mode are required for ordinary main integration. The resolved GATE-BOOTSTRAP policy narrowly permits protected bootstrap integration through R1-FND-005-A and one all-checks promotion in R1-FND-005-B. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/operations/release-1.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/operations/release-1.md): Release 1 Operations Contract; Environments; Runtime topology; Deployment; Recovery; Observability and privacy; Degraded operation. Clauses: SRC-d49f936b-001, SRC-d49f936b-002, SRC-d49f936b-003, SRC-d49f936b-004, SRC-d49f936b-005, SRC-d49f936b-006, SRC-d49f936b-007, SRC-d49f936b-008, SRC-d49f936b-009, SRC-d49f936b-010, SRC-d49f936b-011, SRC-d49f936b-012, SRC-d49f936b-013, SRC-d49f936b-014, SRC-d49f936b-015, SRC-d49f936b-016, SRC-d49f936b-017, SRC-d49f936b-018, SRC-d49f936b-019, SRC-d49f936b-020, SRC-d49f936b-021, SRC-d49f936b-022, SRC-d49f936b-023, SRC-d49f936b-024, SRC-d49f936b-025, SRC-d49f936b-026, SRC-d49f936b-027.
- [wiki/access-model.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/access-model.md): First-slice actors; Clerk authentication boundary; Access Offers; Docket Account status; Authentication profile and Account transparency; Legal and Privacy Operations; Ordinary Platform Support Actions; Competitor Account boundary; Coach authorization; School Membership roles; Platform governance authority; Tournament operations delegation; Tournament ownership; Judge access lifecycle; Open decisions. Clauses: SRC-3aa2b898-001, SRC-3aa2b898-002, SRC-3aa2b898-003, SRC-3aa2b898-004, SRC-3aa2b898-005, SRC-3aa2b898-006, SRC-3aa2b898-007, SRC-3aa2b898-008, SRC-3aa2b898-009, SRC-3aa2b898-010, SRC-3aa2b898-011, SRC-3aa2b898-012, SRC-3aa2b898-013, SRC-3aa2b898-014, SRC-3aa2b898-015, SRC-3aa2b898-016, SRC-3aa2b898-017, SRC-3aa2b898-018, SRC-3aa2b898-019, SRC-3aa2b898-020, SRC-3aa2b898-021, SRC-3aa2b898-022, SRC-3aa2b898-023, SRC-3aa2b898-024, SRC-3aa2b898-025, SRC-3aa2b898-026, SRC-3aa2b898-027, SRC-3aa2b898-028, SRC-3aa2b898-029, SRC-3aa2b898-030, SRC-3aa2b898-031, SRC-3aa2b898-032, SRC-3aa2b898-033, SRC-3aa2b898-034, SRC-3aa2b898-035, SRC-3aa2b898-036, SRC-3aa2b898-037, SRC-3aa2b898-038, SRC-3aa2b898-039, SRC-3aa2b898-040, SRC-3aa2b898-041, SRC-3aa2b898-042, SRC-3aa2b898-043, SRC-3aa2b898-044, SRC-3aa2b898-045, SRC-3aa2b898-046, SRC-3aa2b898-047, SRC-3aa2b898-048, SRC-3aa2b898-049, SRC-3aa2b898-050, SRC-3aa2b898-051, SRC-3aa2b898-052, SRC-3aa2b898-053, SRC-3aa2b898-054, SRC-3aa2b898-055, SRC-3aa2b898-056, SRC-3aa2b898-057, SRC-3aa2b898-058, SRC-3aa2b898-059, SRC-3aa2b898-060, SRC-3aa2b898-061, SRC-3aa2b898-062, SRC-3aa2b898-064, SRC-3aa2b898-065, SRC-3aa2b898-066, SRC-3aa2b898-067, SRC-3aa2b898-068, SRC-3aa2b898-069, SRC-3aa2b898-070, SRC-3aa2b898-071, SRC-3aa2b898-072, SRC-3aa2b898-073, SRC-3aa2b898-074, SRC-3aa2b898-075, SRC-3aa2b898-076, SRC-3aa2b898-077, SRC-3aa2b898-078, SRC-3aa2b898-079, SRC-3aa2b898-080, SRC-3aa2b898-081, SRC-3aa2b898-082, SRC-3aa2b898-083, SRC-3aa2b898-084, SRC-3aa2b898-085, SRC-3aa2b898-086, SRC-3aa2b898-087, SRC-3aa2b898-088, SRC-3aa2b898-089, SRC-3aa2b898-090, SRC-3aa2b898-091, SRC-3aa2b898-092, SRC-3aa2b898-099, SRC-3aa2b898-100, SRC-3aa2b898-101, SRC-3aa2b898-102, SRC-3aa2b898-103, SRC-3aa2b898-104, SRC-3aa2b898-105, SRC-3aa2b898-106, SRC-3aa2b898-124, SRC-3aa2b898-125, SRC-3aa2b898-126, SRC-3aa2b898-127, SRC-3aa2b898-128, SRC-3aa2b898-129, SRC-3aa2b898-130, SRC-3aa2b898-131, SRC-3aa2b898-132, SRC-3aa2b898-133, SRC-3aa2b898-134, SRC-3aa2b898-135, SRC-3aa2b898-136, SRC-3aa2b898-137, SRC-3aa2b898-138, SRC-3aa2b898-139, SRC-3aa2b898-140, SRC-3aa2b898-141, SRC-3aa2b898-142, SRC-3aa2b898-143, SRC-3aa2b898-144, SRC-3aa2b898-145, SRC-3aa2b898-146, SRC-3aa2b898-147, SRC-3aa2b898-148, SRC-3aa2b898-149, SRC-3aa2b898-150, SRC-3aa2b898-151, SRC-3aa2b898-152, SRC-3aa2b898-153, SRC-3aa2b898-154, SRC-3aa2b898-155, SRC-3aa2b898-156, SRC-3aa2b898-157, SRC-3aa2b898-158, SRC-3aa2b898-159, SRC-3aa2b898-160, SRC-3aa2b898-161, SRC-3aa2b898-162, SRC-3aa2b898-163, SRC-3aa2b898-164, SRC-3aa2b898-165, SRC-3aa2b898-166, SRC-3aa2b898-167, SRC-3aa2b898-168, SRC-3aa2b898-169, SRC-3aa2b898-170, SRC-3aa2b898-171, SRC-3aa2b898-172, SRC-3aa2b898-173, SRC-3aa2b898-174, SRC-3aa2b898-175, SRC-3aa2b898-176, SRC-3aa2b898-177, SRC-3aa2b898-178, SRC-3aa2b898-179, SRC-3aa2b898-180, SRC-3aa2b898-181, SRC-3aa2b898-182, SRC-3aa2b898-183, SRC-3aa2b898-184, SRC-3aa2b898-185, SRC-3aa2b898-186, SRC-3aa2b898-187, SRC-3aa2b898-188, SRC-3aa2b898-189, SRC-3aa2b898-190, SRC-3aa2b898-191, SRC-3aa2b898-192, SRC-3aa2b898-193, SRC-3aa2b898-194, SRC-3aa2b898-195, SRC-3aa2b898-196, SRC-3aa2b898-197, SRC-3aa2b898-198, SRC-3aa2b898-199, SRC-3aa2b898-200, SRC-3aa2b898-201, SRC-3aa2b898-202, SRC-3aa2b898-203, SRC-3aa2b898-204, SRC-3aa2b898-205, SRC-3aa2b898-206, SRC-3aa2b898-207, SRC-3aa2b898-208, SRC-3aa2b898-209, SRC-3aa2b898-210, SRC-3aa2b898-211, SRC-3aa2b898-212, SRC-3aa2b898-213, SRC-3aa2b898-214, SRC-3aa2b898-215, SRC-3aa2b898-216, SRC-3aa2b898-217, SRC-3aa2b898-218, SRC-3aa2b898-219, SRC-3aa2b898-220, SRC-3aa2b898-221, SRC-3aa2b898-222, SRC-3aa2b898-223, SRC-3aa2b898-224, SRC-3aa2b898-225, SRC-3aa2b898-226, SRC-3aa2b898-227, SRC-3aa2b898-228, SRC-3aa2b898-229, SRC-3aa2b898-230, SRC-3aa2b898-231, SRC-3aa2b898-232, SRC-3aa2b898-233, SRC-3aa2b898-234, SRC-3aa2b898-235, SRC-3aa2b898-236, SRC-3aa2b898-237, SRC-3aa2b898-238, SRC-3aa2b898-239, SRC-3aa2b898-240, SRC-3aa2b898-241, SRC-3aa2b898-242, SRC-3aa2b898-243.
- [wiki/backend-architecture.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/wiki/backend-architecture.md): Backend Architecture; Repository and module boundaries; Persistence and files; Asynchronous work; Client API; Deployment safety; Runtime operations; Authentication and authorization; Concurrent writes; Privileged audit; Time and identity; Accepted implementation stack. Clauses: SRC-3a042821-001, SRC-3a042821-002, SRC-3a042821-003, SRC-3a042821-004, SRC-3a042821-005, SRC-3a042821-006, SRC-3a042821-007, SRC-3a042821-008, SRC-3a042821-009, SRC-3a042821-010, SRC-3a042821-011, SRC-3a042821-012, SRC-3a042821-013, SRC-3a042821-014, SRC-3a042821-015, SRC-3a042821-016, SRC-3a042821-017, SRC-3a042821-018, SRC-3a042821-019, SRC-3a042821-020, SRC-3a042821-021, SRC-3a042821-022, SRC-3a042821-023, SRC-3a042821-024, SRC-3a042821-025, SRC-3a042821-026, SRC-3a042821-027, SRC-3a042821-028, SRC-3a042821-029, SRC-3a042821-030, SRC-3a042821-031.

## Completion and handoff

Create one PR to the integration target selected by the accepted policy, referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but only controller-verified protected-target integration establishes completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, accepted review mode and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
