# Wiki Index

Read this content map before navigating or updating the wiki. Every durable wiki page belongs here with an Obsidian link and a one-line summary.

PRD means Project Resource Document; see [[project-context]] for its design-only boundary. Product pages describe intended behavior and accepted decisions, not an existing implementation. See [[build-readiness]] for current state.

## System

- [[log|Activity log]] - Chronological record of ingests, queries, lint passes, automatic checkpoints, and schema changes.
- [Documentation map](../docs/README.md) - Concern-based routes to the requirements, design contracts, and build instructions.
- [Build guide](../BUILD.md) - Authoritative build entry point, source precedence, current release, and current implementation readiness.
- [[repository-navigation|Repository navigation]] - Canonical source tree, folder roles, agent reading path, and Obsidian navigation after the implementation reset.
- [Release 1 Project Resource Document](../docs/releases/release-1.md) - Product scope, actors, design requirements, capability targets, and required outcomes; testing procedures are separate later engineering work.
- [Repository and Module Map](../docs/architecture/repository-map.md) - Accepted application, domain-module, foundation-package, ownership, dependency, interface, adapter, and extraction topology.
- [Executable Domain Contract](../docs/contracts/executable-contracts.md) - Authoritative module definitions and migrations, generated views, golden vectors, traceability, and compatible change rules.
- [Release 1 Capability Targets](../docs/quality/release-1-gates.md) - Required capacity, latency, queue, availability, recovery, behavior, security, accessibility, and compatibility outcomes without testing methodology.
- [Release 1 Work Graph](../docs/implementation/work-graph.md) - Readable dependency-ordered implementation queue whose authoritative source is the linked YAML graph.
- [Work Item Contract](../docs/implementation/work-item-contract.md) - Selection, status, required-field, vertical-slice, sizing, and completion rules for agent-runnable work.
- [GitHub issue order](../docs/implementation/issue-order.md) - Pinned index for all work issues, verified child/dependency order, and an oldest-first implementation view.
- [Completed issue setup](../docs/implementation/setup-report.md) - Verified GitHub queue, 39 external-controller tests, review provenance, remaining activation gates and exact launch guide.
- [Implementation issue audit](../docs/implementation/source-audit.md) - Option-B decomposition into 115 leaves, source dispositions, eight explicit gates and verification boundaries; [launch guide](../docs/implementation/launch-guide.md) and [GitHub mapping](../docs/implementation/github-issues.json).
- [Sol-Only Ralph Build Orchestration](../docs/implementation/agent-orchestration.md) - Sequential GPT-5.6 Sol implementation with externally bounded fresh processes, durable handoffs, and one dependency-ordered work item per Ralph run.
- [Development contract](../docs/development.md) - Reserved workspace commands, local infrastructure, fixed test identity, fixtures, environment validation, and GitHub Actions parity.
- [Product Experience Contract](../docs/product/experience-contract.md) - Server-rendered React delivery, pinned shadcn/ui foundation, role-scoped information architecture, required states, accessibility, responsive behavior, and browser support.
- [Release 1 Operations Contract](../docs/operations/release-1.md) - Split Vercel web and Terraform-managed AWS durable-service topology, deployment, recovery, telemetry, privacy, and degraded-operation rules.
- [GitHub Required Checks and Branch Protection](../docs/operations/github-branch-protection.md) - Exact protected check contexts, local-command parity, immutable action pins, cache boundaries, seven-day verification artifacts, and ruleset change procedure.
- [Reference sources](../docs/reference-sources.md) - Provenance and nonnormative-use rules for local competitive research material.
- [[tabroom-reference-architecture|Tabroom reference architecture]] - Nonnormative source-level findings, compatibility boundaries, and the Restructure-with-bounded-Emulation recommendation.
- [[tabroom-data-clone-capacity|Tabroom data clone capacity]] - Measured scale signals, cloud-versus-local decision, retrieval boundary, migration inputs, and workload ranges.
- [[texas-statewide-launch-plan|Texas statewide launch plan]] - Twenty-week full-Release-1 feasibility audit, selective T1/T2 migration seam, capacity reservations, staffing, parallel delivery lanes, and hard launch gates.

## Product

- [[project-context|DOCKET project context]] — Settled identity, competitive objective, TypeScript direction, product intent, provisional scope, principles, and open product-definition gaps.
- [[backend-architecture|Backend architecture]] - Accepted modular-monolith, TypeScript/React stack, Vercel web and AWS durable-service topology, Clerk authentication, PostgreSQL queue and outbox, REST/OpenAPI, recovery, deployment, observability, authorization, and audit.
- [[backend-roadmap|Backend roadmap]] — Release 1 backend narrative aligned to Clerk authentication and the Vercel web/AWS durable-service split, spanning authenticated participants, School roster controls, conflict-safe event scheduling, tournament operations, and external Judge assessments.
- [[build-readiness|Build readiness]] - Build and Sol/high authorized; bootstrap policy direction approved, with controller implementation and private-repository protection still blocking the first leaf.
- [[access-model|Access model]] - Clerk-managed authentication and Sessions, Clerk-recognized verified-email invitation matching, PostgreSQL-backed scoped authorization, School authority and affiliation, and Tournament staff authority.
- [[tournament-directory-model|Tournament discovery and participation]] — Authenticated active discovery, the public archive, saved searches, current Judge Pool views, Judge striking, and No-Show entry points.
- [[registration-model|Registration model]] - Required affiliation and transfer boundaries, Coach-approved Rosters, represented-School history, later-release School export design inputs, registration, admission, and correction.
- [[pairing-model|Pairing model]] — Built-in methods, Judge striking, pending native out-round reviews, governed verification exceptions, corrections, and notices.
- [[ballot-model|Ballot model]] — Cohort-pinned rubrics, Director-owned rubric-defect rulings, 24-hour Platform integrity review, signed web/offline verifier conformance, exact multipart validity, historical root trust, and protected Judges.
- [[standings-model|Standings model]] — Uploaded rules, explicit Administrative Outcome treatment for rubric-defect rulings and No-Show byes, locked releases, transparent metrics, private calculations, and defect-only correction.
- [[advancement-model|Advancement model]] — Declarative Plan, Director-approved Field, Out-Round Verification Gates with governed exceptions and overrides, public qualifier summary, and immutable bracket controls.
- [[award-model|Award model]] — Public placement and Speaker Awards governed by a locked Plan, verified out-round inputs, emergency correction, and Final Results publication.
- [[final-results-model|Final results model]] — Competitive-completeness gate, public placements and brackets, current-first history, and seven-day post-Closure No-Show corrections.
- [[tournament-lifecycle-model|Tournament lifecycle model]] - Required Draft creation and ownership, delegated staff authority, Closure, archive transition, and scoped correction cases.
- [[retention-model|Tournament record retention model]] — Permanent publications, restricted seven-year Competitor evidence, two-year Judge reliability and practice-safety records, later-release generated School-file retention inputs, and privacy exceptions.
- [[scheduling-model|Scheduling model]] — Native schedules, executable cross-entry holds, role-scoped Event Workspaces, private Practice Workspaces with governed standbys and Google Meet lifecycle, agenda alerts, revisions, and breaks.
- [[judge-qualification-model|Judge qualification model]] — Current Judge Pool visibility, source accounting, withdrawal and No-Show reliability, external results, and minimized assessment retention.
