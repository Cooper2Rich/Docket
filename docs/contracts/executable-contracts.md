# Executable Domain Contract

Status: accepted design contract; executable sources and generated outputs must be recreated after the September 9, 2026 reset.

This document identifies the authoritative representation and generated views for every Release 1 interface. It implements ADR 0036.

## Authority by concern

| Concern | Authoritative source | Generated or verified views |
| --- | --- | --- |
| Command, query, outcome, event, and external or stored payload shape | Owning module's runtime TypeBox schema | JSON Schema, OpenAPI operations, generated TypeScript clients, readable field reference |
| Domain interface and behavior | Owning module's exported TypeScript interface and implementation | Interface inventory and dependency graph |
| State transitions and guards | Owning module's typed transition table and guard functions | State diagram, transition matrix, positive and negative conformance cases |
| Authorization | Owning module's typed actor-context-command-resource decision table | Actor-by-command matrix and positive/negative test inventory |
| Audience projection | Owning module's runtime projection schema and serializer | Audience-field matrix and serialization vectors |
| Stable failures | Owning module's entries in the typed error registry | OpenAPI error responses and error catalog |
| Persisted relational structure | Owning module's ordered PostgreSQL migrations and constraints | Schema ownership report and migration compatibility report |
| Durable calculation | Versioned implementation plus JSON golden vectors | Human-readable examples and cross-adapter conformance report |
| Requirement trace | Root Release 1 traceability manifest | Coverage report linking requirements, interfaces, migrations, vectors, tests, and work items |

No generated or readable view can silently change the authoritative source. When two authoritative concerns conflict, implementation stops under [BUILD.md](../../BUILD.md) until the source specifications are reconciled.

## Module source layout

Each domain package uses the following conceptual layout. A module may collapse empty directories, but it cannot relocate ownership to a generic package.

```text
packages/<module>/
  src/
    public.ts
    commands/
    queries/
    model/
      states.ts
      invariants.ts
    contracts/
      payloads.ts
      events.ts
      errors.ts
      authorization.ts
      projections.ts
    persistence/
    adapters/
  migrations/
  vectors/
  tests/
```

`public.ts` is the package's only external import path. It exposes the module interface, stable identifiers, request and outcome types, and published event schemas needed by callers without exporting implementation, persistence, framework, or vendor types.

## Command contract

Every command definition records:

- stable command name and contract version;
- governing requirement IDs;
- actor and Active Role Context input;
- server-derived authority and resource-scope checks;
- runtime-validated payload;
- reviewed source version or explicit no-version reason;
- idempotency requirement and key scope;
- preconditions and invariant guards;
- authoritative writes owned by the module;
- local transaction boundary;
- stable success outcome and safe failure codes;
- audit event and outbox obligations;
- audience-specific returned projection;
- retention and correction consequences;
- performance class; and
- positive, negative, stale, duplicate, and rollback test references.

## Query contract

Every query definition records its actor, context, server-derived scope, input schema, authoritative or projection source, freshness semantics, audience schema, non-disclosure behavior, pagination and ordering contract, performance class, and conformance tests. A query never returns an unrestricted persistence row.

## State and authorization coverage

Typed transition tables enumerate every valid origin, command, guard, destination, terminal effect, and rejected origin. Tests cover every accepted transition and every state-command pair that must reject.

Typed authorization tables enumerate actor class, required role or permission, Active Role Context, resource relationship, temporal condition, allowed command or query, projection audience, and safe denial. Each cell has a positive case and at least one negative case proving that nearby roles, stale grants, foreign Schools, foreign tournaments, guessed identifiers, and revoked authority do not cross the seam.

## Events and asynchronous work

Every durable event has a stable name, major schema version, owning producer, allowed consumers, opaque event ID, aggregate ID and reviewed version, occurrence time, causation and correlation IDs, idempotency semantics, privacy classification, retention class, and TypeBox payload schema.

An originating module commits its outbox record in the same local transaction as its state. Delivery is at least once. Consumers record idempotent outcomes and reject reuse of one idempotency key for different validated input. A breaking durable-event change uses a new major name or version and retains an explicit consumer migration or upcaster path.

## HTTP and error contracts

Fastify routes are adapters over module or workflow interfaces. Runtime schemas generate the versioned OpenAPI document. Within one major HTTP version, changes are additive and backward compatible. A breaking change receives a new major path or media contract and follows the accepted support window.

Every failure maps to a registered stable error code, safe explanation, request identifier, and applicable field issues. Unauthorized and not-found behavior follows the relevant non-disclosure contract and never reveals a private resource through status, message, timing class, or field detail.

## Persistence contracts

Each migration declares its module owner, sequence, forward compatibility assumptions, affected tables and constraints, adjacent-release compatibility, data transformation, retention impact, rollback or forward-fix procedure, and verification query. CI rejects foreign schema or table modification and unowned tables.

Stored versioned JSON is runtime-validated on write and read. A schema change either remains backward-readable or supplies an explicit migration or upcaster with golden before-and-after vectors. Application rollback is allowed only while the database remains compatible with the previous release.

## Golden vectors

Versioned JSON vectors cover Pairing, schedule validation, Judge assignment constraints, Ballot and panel decisions, standings, advancement, bracket placement, awards, Final Results, audience serialization, error mapping, durable events, and any cryptographic verifier included in the release. Each vector identifies algorithm and contract versions, complete deterministic input, expected output or error, governing requirements, and provenance.

Vectors contain no real participant data, current time, random source, network dependency, or environment-specific identifier. A seeded random algorithm records the seed and algorithm version. Every adapter or implementation claiming conformance must pass the same applicable corpus.

## Traceability manifest

The root machine-readable manifest maps each accepted Release 1 requirement to:

- owning module;
- relevant ADRs and wiki evidence;
- command, query, event, projection, and error identifiers;
- migration and table owners;
- golden vectors;
- unit, integration, end-to-end, accessibility, security, load, recovery, and manual evidence;
- work-item identifier and status.

CI fails when an accepted requirement has no owner or required evidence, when a referenced artifact is missing, or when an executable artifact has no requirement or approved operational justification.

## Change rules

- Hand-edit authoritative module sources and migrations only; regenerate their views.
- Check generated artifacts into version control so contract change is reviewable.
- Fail CI when regeneration changes the working tree.
- Use explicit major versions for breaking HTTP and event changes.
- Use explicit migration or upcasting for stored payload changes.
- Preserve immutable competitive source versions and correction history.
- Never use TypeScript compile-time acceptance as evidence that external or stored input is valid.
