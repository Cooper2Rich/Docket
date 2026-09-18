# ADR 0034: Deploy the web application on Vercel and durable services on AWS

- Status: Accepted
- Date: 2026-09-07
- Revised: 2026-09-17

## Context

Docket Release 1 will use a split production topology. Vercel hosts the server-rendered React Router web application, its static assets, preview deployments, CDN delivery, and request-scoped SSR functions. Terraform-managed AWS infrastructure hosts the persistent TypeScript API, background worker, migration runner, PostgreSQL database, private object storage, email delivery, encryption, secrets, and backend observability. This gives the participant-facing UI Vercel's deployment workflow without forcing Docket's durable jobs, transactional queue, or domain API into request-limited web functions.

## Decision

- `apps/web` deploys to Vercel using the reviewed React Router Vercel preset. It contains presentation behavior, route loaders and actions, and server rendering, but owns no authoritative domain calculation, authorization rule, queue consumer, migration, or database table.
- The Vercel web runtime calls the versioned Fastify API through generated OpenAPI clients. It does not connect directly to PostgreSQL, S3, pg-boss, or module persistence adapters.
- Vercel Functions may perform bounded web request and SSR work only. Durable background processing, outbox dispatch, export generation, retries, and scheduled work remain in the persistent worker.
- AWS WAF and an Application Load Balancer protect and route API traffic. ECS Fargate runs separately scalable API and worker processes from one versioned backend release and runs the explicit migration task during deployment.
- Multi-AZ RDS for PostgreSQL remains the authoritative transactional store and supplies point-in-time recovery. Encrypted, versioned S3 remains the private store for generated files and other binary artifacts; PostgreSQL owns their metadata, authorization, retention, integrity, and lifecycle state.
- SES, Secrets Manager, KMS, OpenTelemetry, and CloudWatch retain their accepted backend responsibilities. Clerk manages authentication and session issuance; Docket authorization remains in PostgreSQL.
- Development, preview, staging, and production use independently scoped Vercel projects or environments, AWS resources, Clerk instances, databases, buckets, keys, domains, email identities, and deployment authority. A preview deployment must never receive production secrets or production private data.
- The Vercel SSR region and AWS API/data region must be deliberately colocated where available, and cross-provider latency is part of the accepted service-capability budget.
- GitHub Actions builds and verifies the versioned release, authenticates to AWS through OIDC, and performs controlled production promotion. Vercel deployments use checked-in project configuration and an authenticated deployment integration. The promoted web and backend artifacts record compatible contract and release versions even when the two platforms roll out independently.

## Consequences

- Vercel is the web hosting and deployment platform, not Docket's database, authorization authority, or durable worker runtime.
- AWS remains required for the persistent Fastify API, pg-boss worker, migration runner, RDS PostgreSQL, S3 objects, SES, keys, secrets, and backend telemetry.
- Production deployment, incident response, recovery, observability, secret rotation, and rollback procedures must coordinate two hosting providers plus Clerk.
- A web rollback cannot assume the backend rolled back with it. Generated clients, additive API evolution, adjacent-release compatibility, and explicit release metadata are required across the split deployment.
- PostgreSQL stores all Docket-owned authoritative transactional data. Authentication credentials remain in Clerk and binary file contents remain in private object storage by deliberate boundary rather than being placed in PostgreSQL.
- Any later move of the API, worker, database, queue, or object storage to Vercel-managed or another provider requires a later ADR because those services have different durability, execution, recovery, and retention requirements.
