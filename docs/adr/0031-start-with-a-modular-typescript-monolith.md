---
status: accepted
---

# Start with a modular TypeScript monolith

Docket will begin as one versioned TypeScript backend codebase organized into strict domain modules, deployed through separately scalable API and worker processes, backed by PostgreSQL and private S3-compatible object storage, with versioned REST/JSON contracts documented by OpenAPI. This keeps tournament workflows and authorization enforcement coherent while preserving seams that can become services only when measured scaling or isolation needs justify the operational cost.

## Considered Options

- A microservice-first architecture was rejected because Docket's early domains require frequent transactional coordination and the added deployment and consistency burden is not yet justified.
- GraphQL-first client access was rejected in favor of explicit versioned REST resources and generated TypeScript contracts for a backend-first product whose command boundaries and permission checks must remain obvious.
- Human-readable identifiers as primary keys were rejected because names and public codes change; Docket uses opaque UUIDv7 identities and treats readable values as labels.
- Distributed or shared cross-module database transactions were rejected in favor of module-local commits coordinated by explicit orchestration, durable events, and compensation.
- A separate first-release message broker and exactly-once delivery claim were rejected in favor of a replaceable PostgreSQL-backed queue, at-least-once delivery, and idempotent consumers.

## Consequences

PostgreSQL is authoritative for transactional records and constraints. One repository separates API, worker, domain-module, contract, database, and test packages, and automated dependency rules preserve module seams. Each module alone updates its authoritative tables and commits locally; cross-module workflows use orchestration, durable events, and compensation. Committed asynchronous effects use a transactional outbox and replaceable PostgreSQL-backed queue with at-least-once delivery and idempotent consumers. Caches and projections are rebuildable and nonauthoritative.

Generated files remain private in encrypted, version-protected, redundant object storage and become downloadable only through short-lived authorization after server-side revalidation. Point-in-time database recovery and object redundancy must honor original expiry and deletion deadlines. Every protected operation derives School and tournament scope on the server, uses optimistic record versions for conflicting edits, appends privileged audit events, stores instants in UTC with governing IANA timezones, and keeps Clerk-managed authentication separate from Docket authorization. Reviewed forward-fix migrations, additive API evolution, adjacent-release schema compatibility, expand-and-contract deployment, tested rollback, active-tournament capacity isolation, safe error responses, redacted observability, and readiness and liveness checks are part of the architecture contract.
