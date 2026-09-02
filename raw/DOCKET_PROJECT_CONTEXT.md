# DOCKET Project Context

## Project Identity

- **Main brand:** DOCKET
- **Expanded/formal name:** Docket Tournament Postings
- **Mission:** Making speech and debate tournaments accessible to everyone.
- **Vision:** To become the speech and debate tournament hosting platform.

## Product Intent

DOCKET is speech and debate tournament hosting software designed as a modern replacement or alternative to Tabroom. It should make tournaments easier to create, operate, participate in, and understand for tournament directors, coaches, competitors, judges, schools, and other stakeholders.

The product should prioritize accessibility, reliability, clarity, and efficient tournament administration without sacrificing the capabilities required for serious competitive events.

## Likely Product Scope

The expected scope includes, but is not limited to:

- Tournament creation and configuration
- School, team, competitor, and event registration
- Fees, eligibility, deadlines, and entry management
- Event scheduling and tournament calendars
- Round generation and pairings
- Judge registration, availability, assignment, and conflict management
- Room and venue assignment
- Digital ballots, feedback, and adjudication workflows
- Live tournament operations and status tracking
- Results, rankings, awards, and publication
- Reports and analytics for tournament administrators and participants
- Role-based access, notifications, auditability, and administrative controls

These items describe likely direction rather than a finalized requirements specification. Each feature should be clarified through explicit requirements and acceptance criteria before implementation.

## Brand Rationale

A **docket** is an organized schedule or list of proceedings. The word fits a product that coordinates tournament events, rounds, participants, judges, rooms, ballots, and results.

The name is concise, memorable, and usable in ordinary conversation. Users can naturally say **“check Docket”** when referring to schedules, pairings, assignments, ballots, or results.

Brand hierarchy:

1. Use **DOCKET** as the primary public-facing product name.
2. Use **Docket Tournament Postings** when an expanded or formal name is helpful.
3. Preserve the mission and vision exactly as written in this document unless the project owner explicitly approves a change.

## Product Principles

- Make tournament hosting and participation more accessible.
- Design workflows around the needs of real speech and debate communities.
- Favor clear interfaces and understandable system behavior.
- Build dependable tournament-critical operations with appropriate validation, recovery, and audit trails.
- Protect participant data and apply sound security and privacy practices.
- Keep the architecture modular so features, integrations, and specialized software agents can be added later.
- Avoid premature complexity while preserving clean extension points.
- Treat accessibility, responsive design, and usability as core requirements rather than later enhancements.

## Instructions for Future AI Development Assistants

Treat this document as authoritative project context for DOCKET. Help with:

- Product discovery and requirements definition
- System and software architecture
- Data modeling and API design
- Frontend and backend implementation
- Automated and manual testing
- Build and release workflows
- Debugging and performance analysis
- Security, privacy, permissions, and threat modeling
- Accessible and user-centered UX design
- Infrastructure, deployment, monitoring, and operations
- Documentation and future integrations or agent capabilities

When working on the project:

1. Preserve **DOCKET**, **Docket Tournament Postings**, the mission, and the vision. Do not silently rename, rewrite, or reinterpret them.
2. Distinguish settled decisions from proposals. Clearly label recommendations that would alter established direction.
3. Identify assumptions, unknowns, dependencies, risks, and meaningful tradeoffs before relying on them.
4. Convert requested behavior into explicit requirements and observable acceptance criteria.
5. Provide a proportionate test plan for every implementation or material change, including relevant unit, integration, end-to-end, accessibility, security, performance, and regression coverage.
6. Preserve modularity and clear interfaces so new features, integrations, and agents can be introduced without unnecessary rewrites.
7. Prefer incremental, verifiable changes and explain any migration or compatibility implications.
8. Do not assume the likely product scope is final. Ask for or propose clarification when product decisions materially affect implementation.
9. Keep the needs of tournament directors, coaches, competitors, judges, schools, and other stakeholders visible in design decisions.
10. Flag any conflict between a request and this context rather than resolving it silently.

## Current Status

The brand foundation and broad product intent are established. Detailed product requirements, technical architecture, implementation priorities, technology choices, and release milestones remain to be defined in future development and build-testing conversations.
