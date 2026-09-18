# Backend Architecture

Docket starts as a modular TypeScript monolith: one versioned backend codebase and release with strict domain-module interfaces, deployed as separately scalable API and background-worker processes. This is a deliberate first-release boundary rather than a ban on services; a module is extracted only when measured scaling, failure isolation, security isolation, or deployment evidence justifies it. See [ADR 0031](../docs/adr/0031-start-with-a-modular-typescript-monolith.md) and [[backend-roadmap]].

## Repository and module boundaries

The backend lives in one repository with separate packages for the API, background workers, domain modules, shared contracts, and database tooling. Automated dependency rules prevent a module from reaching through another module's public interface or creating cycles.

Each domain module owns its authoritative PostgreSQL tables. Another module may reference an owner's stable identifiers and consume its published interface or projection, but it cannot update those tables directly. A module commits only its own state in a local transaction. A cross-module workflow uses an explicit orchestrator, durable events, and compensating actions when necessary; it never uses a distributed or shared cross-module database transaction.

## Persistence and files

PostgreSQL is the authoritative transactional database. Relational constraints and transactions protect role exclusivity, tournament state transitions, Pairing and Ballot invariants, publication gates, record versions, and other cross-record rules. Generated exports and other temporary files use private S3-compatible object storage with server-side encryption. Object possession never grants access: Docket revalidates current authority and any required fresh Clerk Reverification before issuing short-lived download access.

Schema changes are reviewed, version-controlled, forward migrations executed by deployment automation. Unrecorded manual production schema changes are prohibited. Production recovery prefers a reviewed forward-fix migration; application rollback is permitted only while the expanded schema remains compatible. Destructive changes use staged expand-and-contract migrations rather than relying on automatic down-migrations.

Encrypted object storage uses version protection and redundant copies. Database point-in-time recovery targets no more than five minutes of expected data loss and a restore within thirty minutes during an active tournament. Backups, object versions, replicas, and recovery copies do not extend an artifact's retention or authorized download window: expiry and deletion propagate through every recoverable copy unless a valid Legal Hold applies.

## Asynchronous work

When a committed state change must trigger email, projection updates, file generation, or another asynchronous effect, the same PostgreSQL transaction appends a transactional outbox record. A dispatcher then places the work on a durable queue. The first release uses a PostgreSQL-backed queue behind an internal interface; a separate broker is introduced only when measured scale or isolation requirements justify it. This prevents a committed tournament decision from silently losing its required downstream work.

Queue delivery is at least once. Every background job has an idempotency key and a recorded outcome. An identical retry returns or reuses that outcome; reuse of the same key for different input is rejected and audited. Consumers must tolerate duplicate delivery, and Docket never represents an external effect as exactly once merely because its internal job is idempotent.

Read projections and caches are disposable views. They can be rebuilt from authoritative records and never establish authorization, a competitive outcome, or an irreversible state transition.

## Client API

Browser and future native clients use versioned REST/JSON endpoints described by OpenAPI. Docket generates TypeScript client and validation types from that contract so client behavior cannot silently drift from runtime request and response rules. Endpoints expose domain commands and audience-filtered projections rather than arbitrary database access.

Changes within one major API version are additive and backward compatible. A breaking contract receives a new major version, migration documentation, and at least twelve months of support for the prior version unless continuing it would preserve a security vulnerability.

Every API failure uses a stable machine-readable error code, a safe human-readable explanation, a request identifier, and field-specific validation issues when applicable. An unauthorized response never reveals whether a private Account, School, tournament, or other resource exists.

## Deployment safety

Application and schema releases use backward-compatible expand-and-contract steps with a recoverable rollback path. During a rolling deployment, the schema supports both the new application release and the immediately preceding release. Ordinary deployment cannot block active tournament operations. If an exceptional change truly requires downtime, it is scheduled outside active tournaments, announced in advance, and may proceed only with a recovery plan.

## Runtime operations

The API and worker use the same versioned release but run and scale independently so slow exports, notifications, queue processing, or projection work cannot consume API capacity. Graceful shutdown stops new work, completes or safely releases claimed work, and preserves retriable state.

Rate limits are scoped by actor, Active Role Context, operation, and affected resource. Tournament-critical commands receive isolated capacity so unrelated load cannot crowd them out, but prioritization never bypasses authorization, validation, concurrency, or audit rules.

Docket emits structured redacted logs, metrics, and traces linked by request identifiers. Ballot Feedback, assessment answers, private evidence, authentication tokens, and export contents are prohibited from telemetry; sensitive identifiers are minimized or pseudonymized.

Liveness and readiness are separate. Readiness confirms the dependencies required for that process and removes an unready instance from service. Liveness restarts only a genuinely stuck process rather than treating an ordinary dependency outage as process death.

## Authentication and authorization

Clerk establishes the actor's identity and issues the session at the authentication boundary described in [[access-model]]. The backend validates every Clerk session token server-side, then resolves every role, permission, Active Role Context, School Membership, tournament assignment, Judge assignment, and record audience from Docket's own authoritative data. Clerk profile attributes, email domains, Google connections, client-supplied School IDs, and client-supplied tournament IDs never establish Docket authority.

Every protected query and command derives its effective School and tournament scope from server-side authority. A supplied resource identifier is only a lookup candidate; Docket must prove that it belongs to the actor's effective scope before returning existence, content, or mutation results.

## Concurrent writes

Mutable authoritative records carry explicit versions. A command states the version it reviewed, and Docket rejects a stale write rather than silently overwriting intervening work. The rejection returns the currently authorized version and requires a new review before another write attempt. Rules that require atomic agreement across records execute inside a PostgreSQL transaction.

## Privileged audit

Privileged changes append immutable audit events with the actor, Active Role Context and authority scope, action, target, reason, prior and resulting versions, UTC time, and request identifier. Corrections append a new event and never rewrite history. Audit projections remain audience-filtered and follow the retention class governing the underlying action.

## Time and identity

Docket stores instants in UTC and preserves each tournament's IANA timezone. Tournament-local dates and deadlines are calculated from that governing timezone and show both zone and offset when daylight-saving or repeated-time ambiguity matters.

Accounts, Schools, tournaments, Entries, Pairings, Ballots, exports, and other durable entities use opaque globally unique UUIDv7 identifiers. Human-readable names, slugs, abbreviations, codes, and labels remain editable attributes and never become primary identity.

## Accepted implementation stack

On 2026-09-07 the project owner accepted the initial application stack in [ADR 0032](../docs/adr/0032-adopt-the-initial-application-stack.md). The repository has not yet been scaffolded, so the decision is authoritative even though no implementation currently exists.

Accepted baseline: Node.js 24 LTS; strict TypeScript compiled for Node with consistent ESM conventions; pnpm workspaces; Nx for dependency checks and build orchestration; Fastify with TypeBox runtime request/response schemas and generated OpenAPI; PostgreSQL accessed through Kysely and the `pg` driver; pg-boss background jobs; and private S3-compatible storage. Use one versioned codebase with separate API and worker processes and a release-time migration entrypoint. Keep domain calculations independent of Fastify. Pin mutually compatible dependency versions when scaffolding.

The web application uses server-rendered React with React Router framework mode, Vite, Tailwind CSS v4, and shadcn/ui under [ADR 0033](../docs/adr/0033-use-server-rendered-react-for-the-web-application.md). The initial checked-in shadcn configuration uses Base UI, `base-nova`, a neutral base, semantic CSS variables, Lucide icons, and TypeScript without React Server Components. Docket owns the generated source and design tokens; registry updates are pinned and reviewed. Under [ADR 0034](../docs/adr/0034-deploy-release-1-on-aws.md), Vercel hosts the web application, static assets, previews, CDN delivery, and bounded SSR functions. Terraform-managed AWS retains the persistent Fastify API and pg-boss worker on ECS Fargate, Multi-AZ RDS PostgreSQL, encrypted versioned S3, SES, Secrets Manager, KMS, and OpenTelemetry feeding CloudWatch. The web runtime uses generated OpenAPI clients and has no direct database, object-storage, queue, or migration access. GitHub Actions coordinates compatible Vercel and AWS release artifacts and uses short-lived AWS OIDC credentials.

Module-owned runtime TypeBox and TypeScript definitions and PostgreSQL migrations define the application interfaces, storage constraints, and compatible evolution described in [ADR 0036](../docs/adr/0036-use-module-owned-executable-contracts.md). The [Release 1 Capability Targets](../docs/quality/release-1-gates.md) retain the required load, latency, queue, availability, recovery, security, accessibility, and integrity outcomes. Engineering verification procedures remain outside the Project Resource Document.

The accepted [Repository and Module Map](../docs/architecture/repository-map.md) and [ADR 0035](../docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md) organize the code around deep identity-access, Schools, tournaments, registration, competition, publication, communications, governance, and workflow modules. Competition contains scheduling, Judge Pool, assignment, Pairing, Ballot, standings, advancement, award, and result behavior as internal modules until a real independent interface or adapter justifies package extraction. Every package exposes one deliberate public interface; module boundaries prohibit implementation imports, cycles, generic shared packages, and cross-module table writes.

The accepted Q731 boundary supersedes the earlier assistant proposal for a shared cross-module PostgreSQL transaction. Cross-module workflows now coordinate separate module-local commits through orchestration, durable events, and compensation when needed. Use asynchronous outbox delivery for effects that can follow a commit, including email and file generation. Duplicate delivery still requires idempotent handling; queue guarantees do not establish exactly-once external effects.

The initial working path connects Clerk-managed sign-in and Docket Session, authorized Tournament creation, School-affiliated Entry submission, persistence, and an outbox-triggered confirmation. It must preserve authorization, record versions, transaction integrity, and idempotent retries. The same foundation extends through the single-format lifecycle in [[backend-roadmap]]. The Vercel web application and AWS API and worker processes require cross-provider traceability, managed PostgreSQL, recovery capability, structured redacted logs, and graceful shutdown.

Sources checked on 2026-09-04: [Node release policy](https://nodejs.org/en/about/previous-releases), [pnpm workspaces](https://pnpm.io/workspaces), [Nx dependency enforcement](https://nx.dev/docs/features/enforce-module-boundaries), [Fastify type providers](https://fastify.dev/docs/latest/Reference/Type-Providers/), [Fastify OpenAPI generation](https://github.com/fastify/fastify-swagger), [Kysely](https://www.kysely.dev/), and [pg-boss](https://github.com/timgit/pg-boss). The stack and package grouping are architectural judgments informed by these tools and Docket's requirements.

## Decision record

- **2026-09-17:** The project owner selected Clerk as Docket's authentication and session provider, retained PostgreSQL as the authority for Docket Accounts and scoped authorization, retained Google as a Clerk sign-in connection plus a Clerk-supported verified email-code factor for sensitive-action reverification, and prohibited Clerk roles or Organizations from owning Docket authorization.
- **2026-09-17:** The project owner moved the server-rendered React web application, static assets, previews, and bounded SSR functions to Vercel while retaining the persistent TypeScript API, worker, migrations, RDS PostgreSQL, S3 objects, email, secrets, keys, and backend telemetry on AWS.
- **2026-09-07:** The project owner made module-owned TypeBox/TypeScript definitions and PostgreSQL migrations authoritative, generated and checked readable contract views, required versioned golden vectors and a traceability manifest, and made drift, untested transitions or authorization cells, and incompatible evolution release blockers.
- **2026-09-07:** The project owner accepted the Release 1 reference-load, latency, queue, availability, recovery, behavioral, security, accessibility, compatibility, and migration gates in ADR 0037 and required measured review before changing them.
- **2026-09-07:** The project owner accepted the initial application, nine-domain-module, and five-foundation-package topology in ADR 0035 and the Repository and Module Map, retained competition capabilities behind one package interface, and prohibited generic shared packages and cross-module implementation or table access.
- **2026-09-07:** The project owner selected server-rendered React with React Router framework mode and Vite, generated OpenAPI clients, shadcn/ui as the required checked-in component foundation, Docket-owned design tokens, WCAG 2.2 AA, and current-plus-previous evergreen browser support.
- **2026-09-07:** The project owner selected Terraform-managed AWS with CloudFront, WAF, an Application Load Balancer, separate ECS Fargate processes, Multi-AZ RDS PostgreSQL, S3, SES, Secrets Manager, KMS, CloudWatch through OpenTelemetry, GitHub Actions OIDC deployment, and isolated development, staging, and production environments.
- **2026-09-07:** The project owner accepted a reproducible local contract using Corepack and pinned pnpm, Docker Compose for PostgreSQL, MinIO, and Mailpit, a production-rejected fixed identity adapter, deterministic fixtures, Testcontainers, runtime environment validation, and identical local and GitHub Actions checks.
- **2026-09-07:** The project owner accepted Node.js 24 LTS, strict ESM TypeScript, pnpm, Nx, Fastify with TypeBox and generated OpenAPI, Kysely with `pg`, pg-boss, Vitest with Testcontainers, and Playwright as the initial application stack. Deployment hosting, frontend framework, observability vendor, and upgrade cadence remain separate decisions.
- **2026-09-07:** The project owner reaffirmed that cross-module workflows use module-local commits, orchestration, durable events, and compensation and explicitly superseded the later activity-log sentence that allowed shared cross-module PostgreSQL transactions.
- **2026-09-04:** The project owner selected a modular TypeScript monolith, PostgreSQL, versioned REST/JSON with OpenAPI-generated TypeScript contracts, Google OIDC only for authentication, private encrypted object storage, server-derived scope, optimistic concurrency, immutable privileged audit events, UTC plus IANA tournament timezones, and UUIDv7 entity identities.
- **2026-09-04:** The project owner fixed the repository and module ownership boundaries; automated forward migrations; transactional-outbox and idempotent-job delivery; rebuildable projections; tested database and object recovery that cannot extend retention; additive API evolution; and live-tournament-safe deployments.
- **2026-09-04:** The project owner accepted separate API and worker processes, a replaceable PostgreSQL-backed queue with at-least-once delivery, module-local cross-module workflow coordination, forward-fix migration recovery, rolling-release schema compatibility, privacy-safe error contracts, scoped rate limits, redacted observability, and separate readiness and liveness checks.
