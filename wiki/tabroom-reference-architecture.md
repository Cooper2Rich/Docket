# Tabroom reference architecture

This page preserves the durable conclusions of the September 12, 2026 source-level Tabroom investigation. It is **nonnormative competitive research**: it does not alter Docket's accepted requirements, domain vocabulary, ADRs, work graph, or implementation authorization. See the [full investigation](../docs/research/tabroom-architecture-investigation.md) for evidence, diagrams, route and entity inventories, strategy comparison, risks, and pinned source links.

## What the source establishes

- Production-era Tabroom is a feature-frozen Perl/Apache/mod_perl/Mason application over a shared MariaDB/MySQL schema. Mason pages commonly combine rendering, business rules, authorization checks, ORM calls, and raw SQL.
- The schema contains 108 tables at the inspected revision, but only 35 declared foreign-key clauses. Much of the effective relational model lives in naming conventions, indexes, Perl Class::DBI relationships, generated Sequelize associations, and application behavior.
- Core competition flow is Tournament → Event → Round → Panel, with Entries and Judges assigned through Ballots and per-competitor Scores. Persistent Chapters and Students are distinct from tournament-local Schools, Entries, and Judges.
- Generic tag/value setting tables are a major extension mechanism. Published standings and results are represented separately through Result Set, Result Key, Result, and Result Value records.
- Files use S3-compatible object storage with database metadata. Background work is primarily a database-backed `autoqueue` polled by cron. No explicit Redis or dedicated message broker was identified.
- The newer `indexcards` Express API and `schemats` SvelteKit client are a transitional modernization layer over the same legacy MariaDB model. `indexcards` mixes generated Sequelize models, manually repaired associations, repository helpers, and raw SQL. Its `/v1` OpenAPI surface is useful evidence, not a stable contract that Docket should assume wholesale.
- Authentication uses database sessions and a `TabroomToken` cookie, with additional API-key and bearer-session paths. Authorization is role/capability based, resource scoped, and includes administrator bypass and impersonation behavior that Docket should not copy automatically.

## Durable architectural conclusion

Docket can reproduce Tabroom's tournament-management capabilities with a redesigned backend and independent frontend. The preferred strategy is **Restructure with bounded Emulation**:

- Preserve domain lessons such as persistent organizations versus tournament-local delegations, entry composition, round/panel/ballot/score progression, configurable ranking protocols, explicit publication snapshots, and scoped authority.
- Keep PostgreSQL and Docket's module-owned schemas as the only internal source of truth.
- Place compatibility at the edge through import/export translators, legacy-ID mappings, reconciliation reports, and only demonstrably needed compatibility endpoints.
- Do not adopt the legacy schema, EAV settings, sparse constraints, integer identities, Perl/Mason presentation model, generated Sequelize domain model, polling queue, or superuser impersonation behavior as Docket internals.
- Keep using the accepted boundaries in [[backend-architecture]] and the [repository map](../docs/architecture/repository-map.md): domain services own invariants; persistence adapters own SQL; a versioned REST/OpenAPI boundary serves an independent React frontend; Docket owns authorization and audit policy.

The Reciprocal Public License 1.5 reported by Tabroom is an additional reason to obtain legal review before copying deployable code, schema/interface definitions, or modified components. An independently designed implementation based on observed behavior and separately authored contracts is architecturally cleaner and reduces—but does not itself resolve—licensing risk.

## Compatibility boundary

Tabroom compatibility should be treated as a replaceable adapter, not as Docket's domain model:

```text
Tabroom dump/export/API
        ↓
immutable staging → validation → translation → Docket services → PostgreSQL
                                      ↓
                         legacy-ID map + reconciliation

Docket API → optional compatibility projection → proven legacy consumers
Docket API → generated client → independent Docket frontend
```

Before promising compatibility, inventory real exports and consumers, freeze the exact Tabroom revision and semantics being targeted, and define fixture-backed field mappings. Unknown operational conventions and production data quality cannot be established from the public repositories alone.
