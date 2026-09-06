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

Docket will be implemented in TypeScript across its backend and participant-facing applications. The accepted application direction is Node.js 24 LTS with ECMAScript modules, Fastify and TypeBox, a modular monolith with separate API and worker processes, React Native with Expo for iOS and Android, and a separate web client in a pnpm workspace. No Rust crate is included initially. Q72–Q76 remove the former $500 infrastructure cap and require zero-loss majority-committed writes, automatic safe cross-provider recovery, fail-closed quorum loss, US-only production data, and strong live reads. Q77 provisionally selects CockroachDB Enterprise across three US cloud providers, using Drizzle's CockroachDB dialect over `pg` and pg-boss's CockroachDB backend, subject to a qualifying vendor contract and complete proof of concept. Q78–Q82 establish the initial AWS/Azure/Google Cloud US proof topology, 2+2+1 five-replica survival policy, bounded transaction retries, 500-millisecond subscriber-aware live-event polling, and application capacity in every provider. Q83–Q87 define fail-closed user behavior, ephemeral unsent input, dual-responder incident ownership, safe rollout, and live-work priority. Q88–Q97 bound edge responsibility, select Cloudflare, and define monitored stateless routing plus the dual-store upload workflow. Q98–Q109 define independent encryption, immutable evidence, deletion and repair, signed transfer, managed cross-cloud containers, GuardDuty quarantine, and safe file delivery. Q110–Q114 establish three API instances and one active worker per provider, one signed OCI build, routine connection rotation, concurrent leased workers, and a six-state upload lifecycle. Q115–Q118 add fail-closed scan timeouts, bounded confirmed-malware cleanup, fixed-egress encrypted database connectivity, and isolated image derivative generation. Q119–Q122 establish keyless cloud workloads and CI, separately rotated database users, a pipeline-only Cloudflare token, and a comprehensive US-only production-data boundary. Q123–Q127 select managed keyless secondary transfer, AWS-bound upload initiation, startup-versioned database secrets, two-person Cloudflare break-glass access, and policy-enforced US residency. See [[backend-implementation-proposal]] and [[backend-disaster-recovery]].

## Current status and knowledge gaps

The brand foundation, product direction, TypeScript implementation language, initial backend architecture, mobile approach, capacity targets, and first vertical lifecycle are established. Provider and library selection, exact resource sizing, remaining requirement conflicts, and the implementation start remain unresolved. In particular, Google-only authentication is not yet proven compatible with Apple App Review Guideline 4.8 for the general-public iOS application; Docket must document an applicable exception or add Sign in with Apple through the same provider-neutral Account model before release.

## Evidence

- [Curated project context](../raw/DOCKET_PROJECT_CONTEXT.md) — source for the identity, product intent, likely scope, principles, development guidance, and current status.
- The competitive objective was stated directly by the project owner during the 2026-08-31 ingest.
