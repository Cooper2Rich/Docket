# Tabroom data clone capacity

This page preserves the durable, nonnormative conclusions of the September 12, 2026 Tabroom capacity and migration-sizing study. See the [full capacity and workload report](../docs/research/tabroom-data-clone-capacity-and-workload.md) and [[tabroom-reference-architecture]]. It does not authorize implementation or alter accepted Docket requirements, ADRs, retention rules, or the work graph.

## Core conclusion

Tabroom-scale data is feasible within Docket's accepted PostgreSQL architecture. Storage technology and hard capacity are not the constraint. The principal constraints are authorized access to the complete source data, interpretation of settings and historical anomalies, permission/privacy translation, file inventory, result reconciliation, and cutover coordination.

The source repositories contain no full production dump or S3 inventory, so the exact production byte count is unknown. Measured source evidence includes:

- 108 tables in a roughly 101 KB legacy schema definition;
- about 94 MB of combined legacy and Tabroomv4 working files;
- a 43.8 MB raw / 7.9 MB gzip test database containing about 365,000 selected rows across 88 populated tables;
- retained identity counters on the order of 40,000 Tournaments, 7.3 million Entries, 52 million Ballots, and 65 million Scores.

Those counters establish a plausible tens-of-millions-of-records migration but are cumulative identifiers, not live row counts. A complete size must come from MariaDB table data/index bytes and an S3 object inventory.

## Capacity envelope

- Plan on 100–300 GiB as a broad relational migration case until source measurements exist, with 500 GiB–1 TiB as a conservative high envelope.
- Reserve approximately 2.5–4 times the expected final PostgreSQL footprint during migration for immutable staging, indexes, WAL, reconciliation, and headroom.
- Size file storage independently from an S3 inventory; file objects may dominate total bytes.
- Keep PostgreSQL authoritative records, indexes, durable jobs, and transactional outbox in managed PostgreSQL. Keep file bodies in private object storage.
- Use cloud production storage and local generated/sanitized development data. A single local production server does not satisfy Docket's accepted concurrency, availability, or recovery targets.

## Access and retrieval

People and clients use Docket's permission-filtered API, never direct database access. Application and worker processes connect privately to PostgreSQL. Public results come from immutable, cacheable publication projections. File downloads require API authorization followed by short-lived object access. Analytics and read replicas are later measured optimizations, not a reason to redesign the source of truth.

## Progressive launch without historical migration

Docket can launch usable software without first migrating Tabroom's historical production data or reproducing all 108 legacy tables. The safe pattern is progressive schema evolution: implement one production-quality vertical slice, store all new Docket activity in the canonical PostgreSQL model, then add module-owned tables, constraints, commands, queries, and projections through backward-compatible migrations as later use cases become active.

The initial foundation cannot be postponed. Stable identifiers, Account and authority scope, School and Tournament ownership, schema-migration discipline, audit and correction history, retention classification, source provenance, API versioning, backups, and recovery must be correct before real user data depends on them. Each initial entity should also tolerate later relationships through stable IDs and explicit lifecycle state rather than embedding assumptions that all future capabilities already exist.

Historical import remains a separate adapter at the system edge. A later importer should load an immutable source extract into staging, validate and translate it through Docket services, retain source-system and legacy-ID mappings, and reconcile counts and competitive outcomes. It must not give legacy jobs or users direct write access to Docket's authoritative tables. New writes may continue during a staged backfill if the importer is idempotent and the cutover or merge rules are explicit.

Live schema changes follow the accepted expand-and-contract rule: add backward-compatible structure, deploy code that understands both forms, backfill and verify existing records, switch reads and writes, and remove obsolete structure only in a later compatible release. This avoids requiring a complete future schema on day one while preventing ad hoc production redesign.

This approach defers migration workload; it does not eliminate it. The later cost depends on whether Docket must import only identity and participation history, published results, complete ballots and scores, files, or near-total Tabroom behavior. Defining that compatibility tier before each import increment prevents the legacy model from becoming Docket's internal architecture.

For one capable full-time owner working intensively with AI, estimate four to eight weeks for the permanent data foundation and representative spine, three to five months cumulative for one narrow production-usable workflow, and six to ten months cumulative for a broad Docket-native core without historical data. Adding a broad Tabroom migration after launch is a further five to ten months, for roughly eleven to twenty months total. At about twenty owner-hours per week, roughly double those calendar ranges. This can deliver a narrow usable workflow seven to thirteen months earlier than a migration-first launch, but later live backfills and compatibility periods can make the total broad-migration effort approximately five to twenty percent higher. Omitting historical migration avoids that later increment.

## Texas-first planning target

On September 12, 2026, the owner selected a provisional 4.5-month target for a production-usable backend pilot and live-safe selective importer focused first on Texas Schools. This records planning direction only; it does not authorize implementation or alter the accepted complete Release 1 lifecycle or work graph.

The owner subsequently set the stronger target of a complete Texas statewide Release 1 deployment in the same period. The architecture, capacity, staffing, sequencing, and hard-gate implications are audited in [[texas-statewide-launch-plan]]. The narrower single-owner pilot below remains the fallback under the currently accepted sequential Sol-only process; it must not be represented as complete Release 1.

The bounded scope is the permanent PostgreSQL, identity/authority, audit/provenance, retention, migration, backup, and recovery foundation; one Account-to-School-to-Tournament/Event-to-Entry workflow; and a reusable staged importer that selects source Schools, seasons, and migration tiers. Texas School History v1 means reviewed canonical Texas Schools and aliases plus public or otherwise authorized participation and published-result history. It excludes named Competitor identity history, complete Pairings, Ballots, Scores, Judge-linked evidence, private feedback, contacts, billing, and files until separately authorized and designed.

The full-time plan consumes approximately 800 owner-hours across twenty weeks: two weeks for source/scope contracts, four for platform foundations, four for the Docket-native vertical slice, four for the selective migration framework, three for the Texas pilot dataset, and three for live coexistence and hardening. The same scope takes roughly six to seven months at 30 owner-hours per week or nine to ten months at 20 hours per week. At 20 hours per week, meeting the 4.5-month date requires reducing real-data acceptance to roughly three to ten reviewed Texas Schools and public-history fixtures.

Selective migration is defined as immutable, idempotent, reconciled batches while Docket remains live—not direct Tabroom database writes or promised real-time replication. Periodic watermarked deltas may be added only if the authorized source supports them. Texas scope follows canonical School location and imports only the minimum authorized Tournament, Event, season, and opponent context needed to understand those Schools' history.

## Workload estimate

The estimates assume modern tooling and ordinary AI assistance; they are not estimates for manually typing every artifact. AI can accelerate mechanical schema, adapter, fixture, mapping, and documentation work by roughly 1.5–4× depending on regularity, but it does little to shorten source authorization, domain-policy decisions, privacy review, real performance/recovery exercises, anomaly adjudication, or production cutover. Across the complete project, plan on roughly 30–50% less calendar time for one capable owner working closely with AI than for the same owner using conventional tooling alone.

- Exact legacy schema plus a basic loader: one to two months for one experienced engineer, but this is not a safe Docket backend.
- Docket canonical schema plus core importer: eight to twelve months solo or four to six months for a focused three-engineer team.
- Production-grade core backend and broad historical migration: eighteen to thirty months solo or seven to twelve months with that team and part-time domain, SRE/security, and privacy support.
- Near-complete Tabroom backend parity: thirty to forty-eight or more months solo, or twelve to twenty or more months with three to four engineers and supporting reviewers.

For one full-time capable owner using AI intensively, the adjusted planning ranges are four to eight weeks for the data-spine proof, five to eight months for the canonical schema and core importer, ten to eighteen months for the production-grade core backend and broad migration, and eighteen to thirty or more months for near-complete long-tail parity. At approximately twenty owner-hours per week, roughly double those calendar ranges. AI does not substitute for independent production review or domain, security, privacy, and cutover support.

Before implementation, obtain an authorized source inventory, exact table bytes/rows/growth, S3 current and version bytes, three representative tournaments, a settings catalogue, permitted-data classifications, and a freeze or change-capture plan. A six-to-ten-week data-spine proof can then establish the canonical relationships, representative import, anomaly ledger, legacy-ID mapping, measured PostgreSQL footprint, and a defensible full estimate.
