# Repository and Module Map

Status: accepted

This map fixes the initial repository topology, module ownership, interfaces, and allowed dependency direction for Release 1. It implements ADR 0035 and is enforced by package exports, Nx dependency rules, contract tests, and database ownership checks.

This is the target topology. The previous application folders were removed on September 9, 2026; the first foundation item must recreate and enforce this structure.

## Top-level topology

```text
apps/
  web/
  api/
  worker/
  migrate/
packages/
  identity-access/
  schools/
  tournaments/
  registration/
  competition/
  publication/
  communications/
  governance/
  workflows/
  contracts/
  database/
  runtime/
  observability/
  testkit/
infra/
  terraform/
contracts/
  openapi/
  vectors/
docs/
tests/
```

The exact generated subtrees under `contracts/` are fixed by the Executable Domain Contract. Generated files never become an alternate source of domain policy.

## Applications

### `apps/web`

The Vercel-deployed React Router server-rendered web adapter. It renders public pages, hosts role-scoped workflows, and calls only generated OpenAPI clients. shadcn/ui is its mandatory component foundation: `components.json` pins the Base UI/`base-nova` configuration, registry-derived primitives live in `app/components/ui`, and Docket-specific compositions live outside that directory. It contains presentation behavior, route loaders and actions, form state, design tokens, and accessibility behavior but no authoritative domain calculation, authorization rule, direct database access, durable queue consumer, or migration logic.

### `apps/api`

The Fastify HTTP adapter. It validates transport input, resolves the authenticated request and Active Role Context, invokes a domain-module or workflow interface, maps known outcomes to the stable error contract, and serializes only the returned audience projection.

### `apps/worker`

The pg-boss worker adapter. It dispatches versioned jobs to their owning module or workflow, supplies idempotency and process-lifecycle plumbing, and records delivery outcomes without becoming the owner of the underlying domain state.

### `apps/migrate`

The explicit release-time migration runner. It validates migration ordering, applies module-owned forward migrations, records their immutable outcome, and exposes no application traffic.

Applications own no authoritative domain tables and cannot import module implementation paths.

## Domain modules

Every domain module exposes one external runtime interface through its package root. That interface includes accepted commands, queries, outcomes, stable identifiers, invariants callers must respect, ordering constraints, failure modes, and required consistency or performance behavior. Internal adapters and test seams are not automatically part of the external interface. A narrowly declared contract-source tooling export may expose schema metadata to the deterministic generator without exposing implementation internals.

### `identity-access`

Owns Accounts, Clerk identity links, Docket Session records, Active Role Contexts, platform authority, Access Offers, account suspension, deactivation, and identity-review state. It consumes server-validated Clerk identity evidence but does not infer School or tournament authority from Clerk, Google, email, or domain attributes.

### `schools`

Owns canonical Schools, Provisional Schools, School Memberships, composable School roles, Manager succession, Competitor School Affiliation, School invitation state, School authority events, and School command receipts. It references Accounts by stable identifier and never edits Account identity; Identity grants select a School scope while current Membership state remains authoritative for mutable School roles.

### `tournaments`

Owns Tournament identity, Owner and Director assignment, delegated tournament permissions, event configuration, Ruleset adoption and locking, governing tournament times and timezone, Competitive Completion, Tournament Closure, and tournament-wide lifecycle state.

### `registration`

Owns Tournament Registration Policies, Tournament Rosters, Entries, Entry Registration State, admission, waitlist order, Competitive Eligibility state, registration fields, eligibility attestations, minor-participation authorization references, and Accommodation Requests required by Release 1. It references but does not rewrite Account, School, or Tournament authority.

### `competition`

Owns the operative competitive state from accepted Entries through Final Results inputs: native schedules, rooms, Judge Pool Participation, Judge qualification consumption, conflicts, strikes, assignments, Pairings, round state, Ballots, Competitive Results, standings, Advancement Plans and Fields, elimination brackets, Award Plans and Results, No-Show classifications, and competition corrections.

Scheduling, Judge Pool, assignment, Pairing, Ballot, standings, advancement, award, and result implementations remain internal modules. Their internal seams are testable without exposing them as cross-package dependencies. The external interface presents cohesive tournament operations and stable audience projections.

### `publication`

Owns publication approvals, immutable publication versions, current-public pointers, public history, Correction Notices, and audience-specific publication projections. It publishes exact approved source versions obtained through module interfaces and never owns or edits the underlying Entry, Pairing, Ballot, standing, award, or Final Result.

### `communications`

Owns notice intents, recipient projections, restricted inbox state, delivery attempts, retry schedules, permanent delivery failure, and escalation state. Originating modules determine that a notice is required and commit their own outbox record; communications does not reverse domain state when delivery fails unless an accepted domain interface explicitly requires that outcome.

### `governance`

Owns Legal Holds, retention schedules and deletion orchestration, integrity and security review cases, governed audit/privacy referrals, and evidence-access decisions. A Legal Hold or governed decision constrains an owning module through its public interface or policy query; governance never performs an unguarded cross-module record edit.

### `workflows`

Owns durable cross-module orchestration state, step outcomes, compensation intent, retry and timeout state, and terminal workflow outcomes. It calls only public module interfaces. Domain modules do not import workflows, and workflows cannot bypass a module's authorization, invariant, version, audit, or idempotency guards.

## Foundation packages

### `contracts`

Assembles generated OpenAPI clients, external runtime schemas, durable event envelopes, and the stable error catalog. It contains no domain decisions or calculation logic. Domain modules own the source schemas for their behavior; generated aggregate artifacts are drift-checked outputs.

### `database`

Provides PostgreSQL connection, transaction, migration-runner, and test-database plumbing. It owns no domain table, query, or business invariant. Each domain package contains its table definitions, migrations, constraints, and persistence adapters.

### `runtime`

Owns validated process configuration, startup and shutdown sequencing, readiness, liveness, and environment guards. It contains no domain defaults that could change a tournament outcome.

### `observability`

Defines redacted telemetry interfaces and OpenTelemetry/CloudWatch adapters. Domain modules emit typed safe facts through those interfaces and never pass unrestricted domain objects or sensitive payloads.

### `testkit`

Supplies synthetic builders, deterministic clocks and identifiers, fixed provider adapters, isolated infrastructure harnesses, and fixture loaders. It is available only to tests and explicit development tooling and cannot be a production dependency.

## Dependency direction

- Applications may depend on generated contracts, workflows, and domain-module interfaces.
- `workflows` may depend on the public interfaces of any domain module.
- `publication`, `communications`, and `governance` may consume published interfaces and events but never implementation paths or foreign persistence adapters.
- Core modules consume stable identifiers, public projections, or events rather than another module's database types.
- Foundation packages are domain-agnostic and never import a domain module.
- Domain modules never import `apps`, `workflows`, or `testkit` in production code.
- Cycles are prohibited.

An apparently necessary reverse dependency must be replaced by an event, a query interface at the owning seam, an orchestrated workflow, or an explicit revision of this map. It cannot be hidden in a generic package.

## Data ownership

Each authoritative table, object prefix, queue job schema, and retained artifact has one named owning module. A module may store another module's stable identifier and the exact version of a consumed projection, but it cannot mutate the source record. Database plumbing can open a module-local transaction but does not grant cross-module write access.

The migration runner imposes one global sequence while migration files remain in their owning packages. CI checks that a migration declares its owner, uses only that owner's schema or table prefix, and remains compatible with the adjacent application release.

## Interface and adapter rules

- A module has one exported external interface; callers and cross-module tests use that same seam.
- A command accepts dependencies and explicit authority, time, version, and idempotency inputs rather than constructing global adapters.
- A query returns an audience-specific result rather than a persistence row.
- Clerk identity and sessions, PostgreSQL, object storage, email, time, identifiers, provider delivery, and telemetry are adapters at explicit seams.
- One adapter is not by itself a reason for an abstraction; an interface exists only when it protects a domain seam, isolates a side effect, or has multiple real adapters such as production and deterministic test implementations.
- A public interface cannot expose Kysely table types, Fastify request objects, React state, AWS SDK objects, or pg-boss job objects.

## Prohibited structures

- generic `shared`, `common`, or `utils` packages;
- a global repository layer that can update every table;
- direct SQL from an application or foreign domain module;
- cross-module implementation imports;
- framework types in domain interfaces;
- duplicated authorization or competitive calculations in the web application;
- a central mega-interface exposing every internal competition operation;
- package extraction based only on file count.

## Extraction rule

An internal `competition` module becomes a package only when at least one of these is true:

1. a second real adapter requires an independently stable interface;
2. measured scaling or failure isolation requires an independently deployable seam;
3. a security or data-isolation requirement demands separate ownership; or
4. multiple callers need a smaller interface whose leverage and locality exceed the existing `competition` interface.

Extraction requires an ADR when it changes data ownership, cross-module consistency, deployment, or a public interface.
