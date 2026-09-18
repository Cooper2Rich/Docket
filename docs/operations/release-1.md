# Release 1 Operations Contract

Status: accepted

## Environments

Development, preview, staging, and production use distinct Vercel environments or projects, AWS accounts or equivalently isolated account boundaries, Clerk instances, data stores, buckets, keys, domains, email identities, and deployment roles. Preview deployments never receive production secrets or private production data, and production data never seeds a lower environment.

Terraform is the authoritative AWS infrastructure definition. Checked-in Vercel project configuration and the authenticated deployment integration define the web deployment. Unrecorded production infrastructure edits are prohibited; an emergency console or dashboard action must be captured immediately as code or reviewed configuration and incident history.

## Runtime topology

- Vercel hosts the React Router web application, static assets, preview deployments, CDN delivery, and request-scoped server rendering.
- The web runtime calls only the versioned Fastify API through generated OpenAPI clients and never connects directly to PostgreSQL, S3, pg-boss, or module persistence adapters.
- AWS WAF and an Application Load Balancer protect and route API traffic.
- ECS Fargate runs separately scalable API and worker processes from one versioned backend release and runs the explicit migration task during deployment.
- Multi-AZ RDS PostgreSQL is the authoritative transactional store and provides point-in-time recovery.
- Encrypted, versioned S3 stores generated files subject to original authorization, expiry, deletion, and Legal Hold rules.
- SES delivers email; failure never silently changes domain state.
- Secrets Manager and KMS govern credentials and encryption material.
- OpenTelemetry sends structured redacted logs, metrics, and traces to CloudWatch initially.
- Clerk manages authentication and session issuance; Docket's PostgreSQL records remain authoritative for Accounts, roles, scoped permissions, and every domain authorization decision.

## Deployment

GitHub Actions authenticates to AWS through OIDC and short-lived credentials and invokes the authenticated Vercel deployment integration for the web artifact. A release builds immutable artifacts once, verifies compatible web and backend artifacts in staging, and promotes those artifacts to production. Each artifact records its release and API-contract version because Vercel and AWS may roll out or roll back independently. Schema migrations run as an explicit one-off AWS release task before compatible backend rollout. Rolling deployment uses readiness gates and automatic deployment failure rollback while preserving compatibility with the immediately preceding release.

The Vercel server-rendering region and AWS API/data region are deliberately colocated where available. Cross-provider latency, failures, and trace propagation are included in operational capacity and incident review. Vercel Functions perform only bounded request and rendering work; durable jobs, transactional-outbox dispatch, export generation, retries, and scheduled work remain in the persistent ECS worker.

Pull-request and `main` protection, local-command parity, dependency-store caching, and verification-artifact retention follow [GitHub Required Checks and Branch Protection](github-branch-protection.md). Those seven-day pull-request artifacts are evidence only; they are not the immutable release artifacts promoted through staging and production.

Production deployment is blocked during a declared tournament-critical freeze unless the change is an approved incident response with a tested recovery path. No deployment step requires manual mutation of production records or schema.

## Recovery

Database recovery targets no more than five minutes of expected data loss and restoration within thirty minutes during an active tournament. Restore exercises use an isolated environment, verify application-level invariants and retention enforcement, and record achieved recovery points and times. Object versions, backups, and restored copies never extend an artifact's authorized lifetime.

## Observability and privacy

Every request, command, job, provider delivery, and deployment carries a traceable identifier. Telemetry excludes Ballot Feedback, assessment answers, authentication material, private evidence, accommodation content, and export payloads. Dashboards and alerts distinguish availability, latency, saturation, queue delay, delivery failure, database health, authorization denial anomalies, and tournament-critical command failure.

## Degraded operation

- A Clerk outage, or an outage of a required upstream authentication factor, blocks affected sign-in, renewal, recovery, and Clerk Reverification but does not revoke otherwise valid unexpired Docket Sessions.
- A Vercel outage blocks or degrades the participant-facing web application while leaving the API, worker, database, and queued work independently recoverable; clients never infer a committed command from a missing web response.
- Email failure preserves in-app delivery and the accepted retry and escalation state without reversing committed tournament decisions.
- Worker degradation leaves authoritative writes committed with visible queued work and protects API capacity.
- Search or projection degradation falls back to authoritative scoped reads where safe or reports a bounded unavailable state; it never broadens an audience.
- Object-storage degradation blocks affected generation or download operations without blocking unrelated tournament commands.
- Database write unavailability fails closed and never creates client-assumed success.

The exact capacity scenarios, availability and latency objectives, recovery targets, security and accessibility thresholds, and release-blocking load profile are authoritative in [the Release 1 Quality Gates](../quality/release-1-gates.md). Alert thresholds must detect an approaching or breached gate early enough for the accepted degraded-operation and incident procedures to act.
