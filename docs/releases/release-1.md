# Release 1: Operable Lincoln-Douglas Tournament

Status: accepted scope; remaining product-design details tracked in the supporting domain and experience documents

This is Docket's Release 1 Project Resource Document (PRD). It defines the build's scope, design, required behavior, and capability targets. Testing software, verification commands, test implementation, coverage, and iteration counts belong to later engineering work, outside this document. Their absence is not a gap in the PRD.

Release 1 is the smallest Docket release that can operate one United States high-school Lincoln-Douglas tournament from creation through Tournament Closure. It proves the complete competitive lifecycle before Docket expands to other formats or adjacent products.

## Included actors

- Public Viewer
- authenticated Competitor
- authenticated Judge
- Coaching Staff with the required School Membership roles
- School Manager
- Tournament Owner
- Tournament Director
- explicitly permissioned Tabulation Staff
- the minimum Platform Administrator and Legal and Privacy Operations authority required by an included workflow

## Included lifecycle

- Clerk-managed authentication, Docket Sessions, Active Role Context, and PostgreSQL-backed server-derived authorization
- canonical Schools, School Memberships, Competitor affiliation, and the minimum invitation flows needed to create valid participants
- Tournament creation, configuration, Ruleset selection, registration policy, and invitation publication
- School roster management and Entry registration
- native scheduling, rooms, Judge Pool Participation, qualification consumption, conflicts, striking, and assignment
- preliminary Pairing generation, review, publication, correction, and No-Show handling
- Ballot submission, panel handling, feedback timing, result correction, and rubric-blocked administration
- deterministic standings, Advancement Plan and Field, elimination Pairings, Award Plan and Results
- Final Results publication, governed corrections, Competitive Completion, and Tournament Closure
- audience-safe projections and notifications required by those workflows
- privileged audit, optimistic concurrency, outbox delivery, idempotent background work, and retention behavior required by those workflows

## Explicit non-goals

- non-Lincoln-Douglas formats
- competition levels or jurisdictions outside United States high school
- Practice Workspaces and Google Practice Meetings
- School Data Export and Account Data Export products
- public offline export-verification utilities
- Saved Tournament Filters, Saved Tournaments, and optional subscription products
- broad platform-support automation beyond the minimum recovery path needed to operate the included lifecycle
- arbitrary tournament-supplied pairing code or executable standings rules

A deferred product may contribute a shared foundation only when an included Release 1 workflow requires it. That does not authorize building the deferred product surface.

## Release requirements

- **R1-LIFE-001:** Authorized users can operate the entire included lifecycle from Tournament creation through Closure using supported interfaces, without manual database editing.
- **R1-AUTH-001:** Every protected command and projection derives actor, role, School, tournament, and record audience from current server-side authority.
- **R1-DATA-001:** Each domain module alone owns and writes its authoritative PostgreSQL tables; cross-module workflows use module-local commits, orchestration, durable events, and compensation.
- **R1-COMP-001:** Pairing, standings, advancement, bracket, award, and final-result calculations follow the governing versioned rules and produce reproducible results from the same inputs and recorded random seed where applicable.
- **R1-CONS-001:** Mutable authoritative writes reject stale versions and preserve attributed correction history rather than overwriting competitive history.
- **R1-MSG-001:** Required asynchronous effects originate through the transactional outbox and remain safe under at-least-once delivery.
- **R1-PRIV-001:** Public, participant, School, Judge, tournament-staff, and Platform projections expose only their accepted audiences.
- **R1-OPS-001:** The release provides the accepted recovery, observability, deployment, security, accessibility, and capacity capabilities defined in the supporting design documents.

## Required product outcomes

Release 1 is complete only when:

1. every included workflow has defined behavior and an owning module;
2. authorized users can complete the tournament lifecycle through the application without manual database editing;
3. competitive calculations, corrections, and publications follow their governing rules and preserve the required history;
4. no open decision is required to interpret an included workflow;
5. the system supports its specified capacity, latency, availability, recovery, security, accessibility, and degraded-operation targets; and
6. the user experience required to operate the included lifecycle is complete at the quality level accepted in the Product Experience Contract.

## Governing sources

- [Docket project context](../../wiki/project-context.md)
- [Backend roadmap](../../wiki/backend-roadmap.md)
- [Backend architecture](../../wiki/backend-architecture.md)
- [ADR 0031](../adr/0031-start-with-a-modular-typescript-monolith.md)
- [ADR 0032](../adr/0032-adopt-the-initial-application-stack.md)
- [ADR 0033](../adr/0033-use-server-rendered-react-for-the-web-application.md)
- [ADR 0034](../adr/0034-deploy-release-1-on-aws.md)
- [ADR 0035](../adr/0035-organize-the-monolith-by-deep-domain-modules.md)
- [Repository and Module Map](../architecture/repository-map.md)
- [Release 1 Capability Targets](../quality/release-1-gates.md)
- [Product Experience Contract](../product/experience-contract.md)
- [Release 1 Operations Contract](../operations/release-1.md)
- the domain pages listed in [the wiki index](../../wiki/index.md)
