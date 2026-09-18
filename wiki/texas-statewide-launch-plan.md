# Texas statewide launch plan

Status: owner-directed planning target; not implementation authorization and not yet a normative change to the accepted Release 1 work graph or orchestration contract

This page records the September 12, 2026 architecture and feasibility audit for deploying Docket statewide in Texas within approximately 4.5 months. It integrates [[backend-architecture]], [[backend-roadmap]], [[tabroom-reference-architecture]], [[tabroom-data-clone-capacity]], the [Release 1 Project Resource Document](../docs/releases/release-1.md), and the [Release 1 work graph](../docs/implementation/work-graph.md).

## Precise launch target

The defensible interpretation of **Texas Statewide Launch** is:

- production Docket is available to authorized Texas high-school participants and tournament operators;
- the complete accepted single-format Lincoln-Douglas Release 1 lifecycle can operate without manual database edits;
- every authorized Texas institution can establish or claim one canonical School through the accepted verification process;
- the selective Tabroom importer can stage, dry-run, import, reconcile, and retry Texas School setup and authorized public-history batches while Docket remains live;
- School setup and public participation or published-result history may be imported statewide or on demand as source quality permits; and
- named historical Competitors, complete historical Pairings, Ballots, Scores, Judge-linked evidence, private feedback, billing, and files are later migration tiers rather than launch blockers.

This definition separates statewide product availability from preloading every historical Texas record. If “entirely deployed” instead requires every historical private record before launch, the twenty-week target is not credible without a complete authorized source package at project start and materially more migration staffing.

## Existing architecture audit

| Area | Finding | Launch treatment |
| --- | --- | --- |
| Modular TypeScript monolith | Correct for the deadline: one release and coherent transactions without microservice overhead. | Preserve. |
| Deep domain modules | Identity, Schools, Tournaments, Registration, Competition, Publication, Communications, Governance, and Workflows provide workable ownership seams. | Preserve; parallel teams work by owner interface, not shared table access. |
| PostgreSQL and Kysely | Suitable for Tabroom-scale relational state and explicit constraints. | Preserve as the sole authoritative transactional store. |
| S3-compatible object storage | Suitable for immutable source snapshots, generated files, and future imported objects. | Preserve; keep source snapshots outside the live database heap where practical. |
| Fastify, TypeBox, OpenAPI, generated clients | Supports independent web delivery and contract-controlled parallel work. | Preserve; generate per vertical slice rather than defer contract integration. |
| Separate web, API, worker, and schema-migration processes | Supports independent scaling and background imports. | Preserve. The data importer runs through an authenticated workflow and worker, not through the release-time schema-migration application. |
| Split Vercel/AWS deployment | Vercel web delivery plus managed Fargate, Multi-AZ RDS, S3, WAF, SES, KMS, and backend observability match statewide availability and recovery needs. | Preserve the accepted provider boundary. Establish isolated development, staging, and production environments in the first month. |
| Release capacity targets | 100 active tournaments, 20,000 Sessions, 1,000 requests/second, 100 critical writes/second, and a two-times burst provide meaningful Texas and growth headroom. | Preserve; do not reduce for the deadline. |
| Work graph | Forty vertical items form one dependency chain; 39 are blocked and only the scaffold is ready. No Tabroom historical-import item exists. | Schedule blocker. Recut into explicit parallel groups after shared foundations and add bounded import items before build authorization. |
| Sol-only orchestration | One lowest-order ready item, one Ralph run, no coding subagents, and no skip-ahead protects integration but prevents the parallel throughput required for full Release 1 in twenty weeks. | Either retain it and accept the narrower pilot, or explicitly approve a parallel human-team graph while keeping one owner and one review gate per item. Do not silently bypass it. |

The architecture is therefore buildable and capacity-suitable. The primary deadline risk is delivery topology, not PostgreSQL or cloud capacity.

## Import module seam

The selective importer should remain an internal deep module of `workflows`, with its long-running execution dispatched by the existing worker. Its small external interface is conceptually:

```text
plan(scope, source snapshot) -> plan and conflicts
dryRun(plan)                 -> projected writes and reconciliation preview
execute(approved plan)       -> durable import batch
reconcile(batch)             -> counts, mappings, anomalies, outcomes
resume(batch)                -> idempotent continuation
```

The workflow module owns source snapshots, import plans, batch state, dependency closure, source-record mappings, conflict quarantine, checkpoints, and reconciliation reports. Each domain module remains the only writer of its authoritative tables and exposes narrow import commands with the same invariants, retention, authorization, idempotency, audit, and version checks as native commands.

The import path is:

```text
authorized Tabroom snapshot or delta
               ↓
encrypted immutable S3 staging
               ↓
scope + dependency-closure planner
               ↓
validator and School matcher ──→ conflict quarantine
               ↓
workflow-orchestrated module import commands
               ↓
canonical PostgreSQL + audit/outbox
               ↓
reconciliation report
```

Native Docket writes continue throughout. The importer never writes domain tables directly, never merges Accounts by email, never overwrites a reviewed Docket correction, and never treats a Tabroom identifier as a Docket identity. Periodic watermarked batches are allowed when an authorized source exposes a trustworthy update field. Real-time database replication and Tabroom/Docket dual writes are not launch requirements.

## Texas migration tiers

| Tier | Scope | Twenty-week launch |
| --- | --- | --- |
| T1 School setup | Canonical Texas Schools, Provisional Schools, aliases, locality, source IDs, verification evidence, and merge candidates | Required where source authorization and quality permit |
| T2 public School history | Tournaments, Events, seasons, represented-School participation, Entries needed for public history, published results, placements, awards, and correction notices | Selective and on demand; representative statewide coverage required |
| T3 named participant history | Historical Competitors, complete Entry composition, affiliations, and identity matching | Deferred unless separately authorized and staffed |
| T4 competitive evidence | Pairings, Ballots, Scores, Judge and panel provenance, private corrections, and reproducibility evidence | Deferred |
| T5 private operations and files | Contacts, messages, feedback, finance, administrative data, and file objects | Deferred |

Texas selection begins from reviewed canonical School identity, not a blind `state = TX` filter. Dependency closure may add the minimum public Tournament, Event, season, and opponent context required to interpret a Texas School's history without importing unrelated private records.

## Capacity plan

The accepted Release 1 capacity profile remains the launch target: 100 simultaneous active tournaments, 20,000 authenticated Sessions, 1,000 aggregate requests per second, 100 tournament-critical writes per second for thirty minutes, and a five-minute two-times burst. Active-window availability remains 99.95%, with a five-minute database recovery-point objective and thirty-minute active-tournament recovery-time objective.

Until a production source inventory exists, capacity planning should use the existing conservative envelope rather than a Texas guess:

- reserve 500 GiB as the relational planning case and permit managed growth to at least 2 TiB without redesign;
- keep immutable import snapshots and large reconciliation artifacts in encrypted S3 rather than the primary database;
- retain 2.5–4 times the forecast imported relational footprint across staging, destination indexes, WAL, reconciliation, and safety headroom;
- treat object storage as elastic and maintain a 10 TiB stress envelope until the source object inventory proves a lower requirement;
- run at least three web tasks, three API tasks, and two workers across failure zones at launch, with tested autoscaling and reserved tournament-critical API capacity;
- isolate import-worker concurrency, throttle batches, and pause noncritical import work during tournament-critical saturation or release freezes;
- cache immutable public publications through Vercel's CDN while keeping authorization and authoritative writes on the AWS API; and
- select the production database compute class from early load evidence, budgeting for a 16-vCPU and 64–128-GiB-memory class rather than assuming a small starter database.

These are safe planning reservations, not measured Texas usage or a requirement to prepay every byte. Exact provisioning must be adjusted from representative imports and the accepted load profile before production promotion.

## Twenty-week delivery topology

A complete statewide Release 1 plus T1/T2 selective migration is not a credible one-owner project in twenty weeks, even with intensive AI. The accountability-adjusted workload is approximately 150–200 person-weeks. A credible schedule therefore needs eight to ten experienced full-time people using AI, plus part-time tournament-domain and privacy/legal review.

Recommended ownership:

- one technical lead and integration owner;
- two engineers for identity, Schools, Tournaments, Registration, Publication, and Communications;
- two engineers for Competition internals, including scheduling, judging, Pairing, Ballots, standings, advancement, awards, and Final Results;
- one web and accessibility engineer;
- one data-migration engineer;
- one platform, SRE, security, and observability engineer;
- one integration, quality, performance, and release engineer; and
- named part-time Tournament Director/tabulation, privacy/legal, and security reviewers.

The work graph must preserve foundations and interfaces while allowing explicit parallel groups:

| Weeks | Program outcome | Parallel lanes |
| --- | --- | --- |
| 1–2 | Scope, source, staffing, and interfaces frozen | Source authorization and inventory; Texas inclusion rules; architecture and contract skeleton; AWS account/bootstrap work |
| 1–4 | Shared foundations operational | Repository/runtime; PostgreSQL migrations; contract generation; CI; dev/staging infrastructure; observability baseline |
| 3–7 | Walking skeleton and School onboarding complete | Identity/authority; Schools; Tournament creation; Registration; communications; initial web shell |
| 5–11 | Tournament configuration and competition primitives integrated | Rules, publication, roster/admission; schedule/rooms; Judge qualifications/pool/conflicts/assignments; import framework |
| 8–14 | Full preliminary lifecycle integrated | Pairing methods and publication; rounds; No-Shows; Ballots; panels; feedback; corrections; Texas T1 matching |
| 11–16 | Elimination, publication, closure, and archive integrated | Standings; advancement; bracket; awards; Final Results; Closure; archive; T2 public-history import |
| 14–18 | Whole-product conformance and operational proof | Governance; retention; security; accessibility; browser journeys; load; recovery; deployment and rollback rehearsals |
| 18–20 | Controlled Texas launch | Pilot tournaments; defect burn-down; statewide School availability; selective migration batches; production go/no-go and contingency |

No lane may directly edit another module's tables or invent an interface locally. Interface changes merge through the technical lead and generated contracts. Integration occurs continuously in staging; week 18 cannot be the first complete tournament rehearsal.

## Hard launch gates

The date does not override these conditions:

1. An authorized source package and Texas inclusion rule exist by the end of week 2. Without them, Docket may launch but cannot claim migrated Texas history.
2. The work graph and orchestration contract are explicitly revised before parallel implementation. Otherwise the accepted sequential queue remains binding.
3. A complete seeded Lincoln-Douglas tournament reaches Closure in staging by week 14 and in a production-like rehearsal by week 17.
4. T1/T2 imports are idempotent, resumable, reconciled, privacy-classified, and unable to overwrite native corrections.
5. The accepted 2× burst, queue drain, latency, availability design, recovery, security, and accessibility targets are met before statewide promotion.
6. Launch has a rollback or forward-fix path, on-call ownership, and no unresolved critical/high security or data-integrity defect.

## Feasibility conclusion

The accepted architecture does not need a storage redesign. Full Texas statewide Release 1 in approximately 4.5 months is feasible only as a staffed parallel delivery program with selective T1/T2 history, immediate source access, and no expansion beyond Lincoln-Douglas Release 1. Under the current one-owner sequential Sol-only plan, the same date supports the narrower Texas data pilot described in [[tabroom-data-clone-capacity]], not the complete lifecycle.

The next planning decision is therefore organizational rather than technical: retain the sequential one-owner process and narrow the launch, or authorize a parallel eight-to-ten-person Release 1 program and revise the work graph and orchestration contract accordingly.
