# Adopt the initial application stack

Status: accepted

Docket will implement its first modular-monolith release on Node.js 24 LTS with strict ESM TypeScript, pnpm workspaces, Nx orchestration and dependency enforcement, Fastify with TypeBox runtime contracts and generated OpenAPI, PostgreSQL through Kysely and `pg`, pg-boss for PostgreSQL-backed jobs, Vitest with Testcontainers for automated backend verification, and Playwright for browser end-to-end verification. This stack keeps runtime validation, SQL ownership, background delivery, and module seams explicit while limiting the first release to one language and one operational data platform.

## Considered Options

- A framework-heavy full-stack abstraction was rejected because Docket's command, authorization, audience, and transaction interfaces must stay visible and independently testable.
- An ORM that owns the domain model was rejected in favor of explicit typed SQL and module-owned persistence adapters.
- A separate message broker was deferred until measured throughput or isolation evidence justifies another operational dependency.
- Multiple package managers, module systems, or test runners were rejected because they add nondeterminism without Release 1 leverage.

## Consequences

The workspace must pin mutually compatible versions in its lockfile, expose domain behavior independently of Fastify, use TypeBox at external and stored-payload seams, exercise PostgreSQL integrations against real ephemeral databases, and enforce package imports in CI. Deployment hosting, frontend framework, observability vendor, and version-upgrade cadence remain separate decisions.
