# Backend Architecture

Docket starts as a modular TypeScript monolith: one versioned backend codebase and release with strict domain-module interfaces, deployed as separately scalable API and background-worker processes. This is a deliberate first-release boundary rather than a ban on services; a module is extracted only when measured scaling, failure isolation, security isolation, or deployment evidence justifies it. See [ADR 0031](../docs/adr/0031-start-with-a-modular-typescript-monolith.md) and [[backend-roadmap]].

## Repository and module boundaries

The backend lives in one repository with separate packages for the API, background workers, domain modules, shared contracts, database tooling, and tests. Automated dependency rules prevent a module from reaching through another module's public interface or creating cycles.

Each domain module owns its authoritative PostgreSQL tables. Another module may reference an owner's stable identifiers and consume its published interface or projection, but it cannot update those tables directly. A module commits only its own state in a local transaction. A cross-module workflow uses an explicit orchestrator, durable events, and compensating actions when necessary; it never uses a distributed or shared cross-module database transaction.

## Persistence and files

PostgreSQL is the authoritative transactional database. Relational constraints and transactions protect role exclusivity, tournament state transitions, Pairing and Ballot invariants, publication gates, record versions, and other cross-record rules. Generated exports and other temporary files use private S3-compatible object storage with server-side encryption. Object possession never grants access: Docket revalidates current authority and any required fresh Google reauthentication before issuing short-lived download access.

Schema changes are reviewed, version-controlled, forward migrations executed by deployment automation. Unrecorded manual production schema changes are prohibited. Production recovery prefers a reviewed forward-fix migration; application rollback is permitted only while the expanded schema remains compatible. Destructive changes use staged expand-and-contract migrations rather than relying on automatic down-migrations.

Encrypted object storage uses version protection and redundant copies. Database point-in-time recovery targets no more than five minutes of expected data loss and a restore within thirty minutes during an active tournament; Docket regularly exercises and records restore tests. Backups, object versions, replicas, and recovery copies do not extend an artifact's retention or authorized download window: expiry and deletion propagate through every recoverable copy unless a valid Legal Hold applies.

## Asynchronous work

When a committed state change must trigger email, projection updates, file generation, or another asynchronous effect, the same PostgreSQL transaction appends a transactional outbox record. A dispatcher then places the work on a durable queue. The first release uses a PostgreSQL-backed queue behind an internal interface; a separate broker is introduced only when measured scale or isolation requirements justify it. This prevents a committed tournament decision from silently losing its required downstream work.

Queue delivery is at least once. Every background job has an idempotency key and a recorded outcome. An identical retry returns or reuses that outcome; reuse of the same key for different input is rejected and audited. Consumers must tolerate duplicate delivery, and Docket never represents an external effect as exactly once merely because its internal job is idempotent.

Read projections and caches are disposable views. They can be rebuilt from authoritative records and never establish authorization, a competitive outcome, or an irreversible state transition.

## Client API

Browser and future native clients use versioned REST/JSON endpoints described by OpenAPI. Docket generates TypeScript client and validation types from that contract so client behavior cannot silently drift from runtime request and response rules. Endpoints expose domain commands and audience-filtered projections rather than arbitrary database access.

Changes within one major API version are additive and backward compatible. A breaking contract receives a new major version, migration documentation, and at least twelve months of support for the prior version unless continuing it would preserve a security vulnerability.

Every API failure uses a stable machine-readable error code, a safe human-readable explanation, a request identifier, and field-specific validation issues when applicable. An unauthorized response never reveals whether a private Account, School, tournament, or other resource exists.

## Deployment safety

Application and schema releases use backward-compatible expand-and-contract steps with a tested rollback path. During a rolling deployment, the schema supports both the new application release and the immediately preceding release. Ordinary deployment cannot block active tournament operations. If an exceptional change truly requires downtime, it is scheduled outside active tournaments, announced in advance, and may proceed only with a tested recovery plan.

## Runtime operations

The API and worker use the same versioned release but run and scale independently so slow exports, notifications, queue processing, or projection work cannot consume API capacity. Graceful shutdown stops new work, completes or safely releases claimed work, and preserves retriable state.

Rate limits are scoped by actor, Active Role Context, operation, and affected resource. Tournament-critical commands receive isolated capacity so unrelated load cannot crowd them out, but prioritization never bypasses authorization, validation, concurrency, or audit rules.

Docket emits structured redacted logs, metrics, and traces linked by request identifiers. Ballot Feedback, assessment answers, private evidence, authentication tokens, and export contents are prohibited from telemetry; sensitive identifiers are minimized or pseudonymized.

Liveness and readiness are separate. Readiness confirms the dependencies required for that process and removes an unready instance from service. Liveness restarts only a genuinely stuck process rather than treating an ordinary dependency outage as process death.

## Authentication and authorization

Google OpenID Connect establishes the actor's identity at the authentication boundary described in [[access-model]]. Docket then resolves every role, permission, Active Role Context, School Membership, tournament assignment, Judge assignment, and record audience from its own authoritative data. Google profile attributes, email domains, client-supplied School IDs, and client-supplied tournament IDs never establish Docket authority.

Every protected query and command derives its effective School and tournament scope from server-side authority. A supplied resource identifier is only a lookup candidate; Docket must prove that it belongs to the actor's effective scope before returning existence, content, or mutation results.

## Concurrent writes

Mutable authoritative records carry explicit versions. A command states the version it reviewed, and Docket rejects a stale write rather than silently overwriting intervening work. The rejection returns the currently authorized version and requires a new review before another write attempt. Rules that require atomic agreement across records execute inside a PostgreSQL transaction.

## Privileged audit

Privileged changes append immutable audit events with the actor, Active Role Context and authority scope, action, target, reason, prior and resulting versions, UTC time, and request identifier. Corrections append a new event and never rewrite history. Audit projections remain audience-filtered and follow the retention class governing the underlying action.

## Time and identity

Docket stores instants in UTC and preserves each tournament's IANA timezone. Tournament-local dates and deadlines are calculated from that governing timezone and show both zone and offset when daylight-saving or repeated-time ambiguity matters.

Accounts, Schools, tournaments, Entries, Pairings, Ballots, exports, and other durable entities use opaque globally unique UUIDv7 identifiers. Human-readable names, slugs, abbreviations, codes, and labels remain editable attributes and never become primary identity.

## Implementation stack recommendation under review

On 2026-09-04 the project owner reopened Q718 and requested a direct explanation and recommendation rather than a grilling interview. The named tools below remain an assistant recommendation, not an accepted stack decision or implemented backend. The preceding sections contain the accepted architecture requirements.

Recommended baseline: Node.js 24 LTS; strict TypeScript compiled for Node with consistent ESM conventions; pnpm workspaces; Nx for dependency checks and build/test orchestration; Fastify with TypeBox runtime request/response schemas and generated OpenAPI; PostgreSQL accessed through Kysely and the `pg` driver; pg-boss background jobs; private S3-compatible storage. Use one versioned codebase with separate API and worker processes and a release-time migration entrypoint. Keep domain calculations independent of Fastify. Pin mutually compatible dependency versions when scaffolding.

Organize packages by business capability, initially identity/access, Schools, tournaments, registration, competition, and publication. Competition may contain pairing, scheduling, Ballots, standings, and advancement as internal modules until their transactional requirements justify separate packages. Keep commands, queries, rules, persistence adapters, and behavior tests near their owning capability. Expose a deliberate public package interface; enforce imports with package exports and CI dependency rules. Shared database infrastructure supplies connections and transaction plumbing, while each domain owns its table definitions and queries. Narrowed Kysely types assist ownership checks but are not runtime database permissions or a security barrier.

The accepted Q731 boundary supersedes the earlier assistant proposal for a shared cross-module PostgreSQL transaction. Cross-module workflows now coordinate separate module-local commits through orchestration, durable events, and compensation when needed. Use asynchronous outbox delivery for effects that can follow a commit, including email and file generation. Duplicate delivery still requires idempotent handling; queue guarantees do not establish exactly-once external effects.

Build one working path first: Google sign-in and Docket Session, authorized Tournament creation, School-affiliated Entry submission, persistence, and an outbox-triggered confirmation. Test authorization, stale versions, conflicting submissions, transaction rollback, and retry behavior using real PostgreSQL. Then extend the same foundation through the single-format lifecycle in [[backend-roadmap]]. Use a tested migration stream, generated-contract checks, dependency lint, typechecking, and integration tests in CI. Deploy API and worker containers with managed PostgreSQL, tested recovery, structured redacted logs, and graceful shutdown.

Sources checked on 2026-09-04: [Node release policy](https://nodejs.org/en/about/previous-releases), [pnpm workspaces](https://pnpm.io/workspaces), [Nx dependency enforcement](https://nx.dev/docs/features/enforce-module-boundaries), [Fastify type providers](https://fastify.dev/docs/latest/Reference/Type-Providers/), [Fastify OpenAPI generation](https://github.com/fastify/fastify-swagger), [Kysely](https://www.kysely.dev/), and [pg-boss](https://github.com/timgit/pg-boss). The stack and package grouping are architectural judgments informed by these tools and Docket's requirements.

## Decision record

- **2026-09-04:** The project owner selected a modular TypeScript monolith, PostgreSQL, versioned REST/JSON with OpenAPI-generated TypeScript contracts, Google OIDC only for authentication, private encrypted object storage, server-derived scope, optimistic concurrency, immutable privileged audit events, UTC plus IANA tournament timezones, and UUIDv7 entity identities.
- **2026-09-04:** The project owner fixed the repository and module ownership boundaries; automated forward migrations; transactional-outbox and idempotent-job delivery; rebuildable projections; tested database and object recovery that cannot extend retention; additive API evolution; and live-tournament-safe deployments.
- **2026-09-04:** The project owner accepted separate API and worker processes, a replaceable PostgreSQL-backed queue with at-least-once delivery, module-local cross-module workflow coordination, forward-fix migration recovery, rolling-release schema compatibility, privacy-safe error contracts, scoped rate limits, redacted observability, and separate readiness and liveness checks.
