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

## Product-development guidance

- Keep settled decisions distinct from proposals and identify assumptions, unknowns, dependencies, risks, and tradeoffs.
- Keep all stakeholder groups visible in design decisions.
- Prefer incremental, verifiable changes and document migration or compatibility implications.
- Pair material changes with a proportionate test plan covering the relevant functional, integration, end-to-end, accessibility, security, performance, and regression risks.
- Flag conflicts with the established identity or direction instead of resolving them silently.

## Technology direction

Docket will ultimately be implemented in TypeScript across its backend and participant-facing application. Domain contracts, runtime schemas, deterministic calculation modules, tests, and integration boundaries should be designed with that destination in mind. TypeScript is settled; the specific framework, runtime, database, deployment platform, and repository architecture are not.

## Current status and knowledge gaps

The brand foundation, broad product direction, and TypeScript implementation language are established. Detailed requirements, technical architecture, implementation priorities, remaining technology choices, and release milestones remain undecided.

## Evidence

- [Curated project context](../raw/DOCKET_PROJECT_CONTEXT.md) — source for the identity, product intent, likely scope, principles, development guidance, and current status.
- The competitive objective was stated directly by the project owner during the 2026-08-31 ingest.
