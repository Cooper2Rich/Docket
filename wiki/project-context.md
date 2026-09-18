# DOCKET Project Context

DOCKET is speech and debate tournament hosting software. It is being built to replace Tabroom as the leading platform for hosting debate tournaments while serving the broader speech and debate community.

## Settled identity

- **Primary public brand:** DOCKET
- **Expanded name:** Docket Tournament Postings
- **Mission:** Making speech and debate tournaments accessible to everyone.
- **Vision:** To become the speech and debate tournament hosting platform.
- **Competitive objective:** Replace Tabroom as the leading software for debate tournament hosting.

The brand name reflects a docket as an organized schedule or list of proceedings. It should work naturally in phrases such as “check Docket” for pairings, schedules, judge assignments, ballots, and results.

## Product intent

DOCKET should make tournaments easier to create, operate, participate in, and understand. Its stakeholders include tournament directors, coaches, competitors, judges, schools, and others involved in speech and debate events.

The product should prioritize:

- Accessibility and responsive, usable interfaces
- Reliability during tournament-critical operations
- Clear workflows and understandable system behavior
- Efficient administration without sacrificing serious competitive capabilities
- Participant privacy, security, validation, recovery, and auditability
- Modular architecture with clean extension points for future features, integrations, and specialized agents

## Provisional scope

The following areas are expected, but they are not yet finalized requirements:

- Tournament creation and configuration
- School, team, competitor, and event registration
- Fees, eligibility, deadlines, and entry management
- Event scheduling and tournament calendars
- Round generation and pairings
- Judge registration, availability, assignment, and conflict management
- Room and venue assignment
- Digital ballots, feedback, and adjudication workflows
- Live operations and status tracking
- Results, rankings, awards, and publication
- Reports and analytics
- Role-based access, notifications, auditability, and administrative controls

Each area needs explicit requirements and observable acceptance criteria before implementation decisions rely on it.

## Project Resource Document

The owner defines PRD as **Project Resource Document**: the project's design, scope, behavior, and capability targets. [Release 1](../docs/releases/release-1.md) is its current release entry point. Runnable tests, testing software, testing implementation, coverage, and iteration counts are later engineering concerns and do not determine whether this resource document is complete. Capacity, latency, availability, recovery, accessibility, and competitive-correctness requirements remain product requirements. This September 9, 2026 clarification supersedes earlier guidance that placed testing procedures inside the PRD.

## Product-development guidance

- Keep settled decisions distinct from proposals and identify assumptions, unknowns, dependencies, risks, and tradeoffs.
- Keep all stakeholder groups visible in design decisions.
- Prefer incremental, verifiable changes and document migration or compatibility implications.
- Flag conflicts with the established identity or direction instead of resolving them silently.

## Technology direction

Docket will be implemented in TypeScript across its backend and participant-facing application. The backend begins as a modular monolith using PostgreSQL, private S3-compatible object storage, and versioned REST/JSON interfaces described by OpenAPI, as settled in [[backend-architecture]] and [ADR 0031](../docs/adr/0031-start-with-a-modular-typescript-monolith.md). One repository will separate API, worker, web, domain-module, contract, and database packages. [ADR 0029](../docs/adr/0029-use-clerk-for-managed-authentication.md) assigns authentication and sessions to Clerk while preserving PostgreSQL-backed Docket authorization. [ADR 0032](../docs/adr/0032-adopt-the-initial-application-stack.md) fixes the backend stack; [ADR 0033](../docs/adr/0033-use-server-rendered-react-for-the-web-application.md) fixes the server-rendered React frontend and shadcn/ui component foundation; and [ADR 0034](../docs/adr/0034-deploy-release-1-on-aws.md) deploys the web application on Vercel while retaining durable API, worker, PostgreSQL, object-storage, email, key, secret, and backend-observability services on AWS. Exact version-upgrade cadence remains undecided; quantitative service and capacity gates are accepted in ADR 0037.

## Current status and knowledge gaps

The brand foundation, broad product direction, Release 1 boundary, implementation language, backend and frontend architecture, Clerk authentication boundary, shadcn/ui component foundation, module map, executable-contract model, quantitative quality gates, development contract, product-experience baseline, split Vercel/AWS operational topology, and dependency-ordered agent work graph are established. The prior application implementation was removed at the owner's request on September 9, 2026. Requirements and architecture remain accepted; no application command exists. The work graph restarts at `R1-FND-001`, subject to a separate request to build. See [[build-readiness]].

## Evidence

- [Curated project context](../raw/DOCKET_PROJECT_CONTEXT.md) — source for the identity, product intent, likely scope, principles, development guidance, and current status.
- The competitive objective was stated directly by the project owner during the 2026-08-31 ingest.
