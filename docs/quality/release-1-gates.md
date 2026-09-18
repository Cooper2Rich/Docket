# Release 1 Capability Targets

Status: accepted capability targets; testing methodology excluded by the owner's September 9, 2026 PRD clarification

These are the system capabilities required by the Project Resource Document. The quantitative targets from ADR 0037 are retained. This document supersedes its former testing-procedure content; its existing path is retained for repository and Obsidian links.

## Capacity

Docket must sustain the following combined workload continuously for at least thirty minutes:

- 100 simultaneous active tournaments;
- 20,000 authenticated Sessions;
- 1,000 aggregate HTTP requests per second; and
- 100 tournament-critical authoritative writes per second.

It must also accommodate a five-minute burst at twice the request and critical-write rates. The workload includes public reads, authenticated projections, Pairing and schedule reads, Ballot submissions, operational acknowledgments, publication commands, outbox inserts, and background deliveries.

No authoritative data may be lost, no competitive outcome may be duplicated, and the durable queue must return to its pre-burst depth within ten minutes after the burst ends.

## Latency

At the application edge under the specified workload:

- read requests: p95 no more than 500 milliseconds and p99 no more than 1.5 seconds;
- synchronous authoritative commands: p95 no more than 1 second and p99 no more than 2.5 seconds;
- transactional-outbox work claimable by a worker: p95 no more than 5 seconds after commit; and
- first required-notification delivery attempt started: p95 no more than 30 seconds after commit, excluding external-provider response time.

Asynchronous projection completion follows its own applicable contract and does not relax synchronous-command latency requirements.

## Availability and recovery

- Availability during declared active-tournament windows: 99.95%.
- Availability outside declared active-tournament windows: 99.9%.
- Database recovery-point objective: no more than five minutes of expected data loss.
- Active-tournament recovery-time objective: no more than thirty minutes.

Availability excludes only predeclared maintenance outside active tournaments. Dependency failure, deployment failure, capacity exhaustion, and internal operator error remain included.

## Behavioral integrity

- Support every accepted state transition and reject invalid state-command combinations.
- Enforce current authority, resource scope, revocation, and permitted audiences for every protected action and projection.
- Produce reproducible competitive calculations from the governing versioned rules and inputs.
- Preserve authoritative outcomes and correction history through concurrency, retries, and recovery.

## Security and privacy

The system must protect Sessions and sensitive commands, enforce reauthentication where required, prevent cross-School and cross-tournament disclosure, and keep secrets and private participant content out of public projections and telemetry. Recovery copies must respect expiry, deletion, and Legal Hold rules. No unaccepted critical or high security vulnerability is permitted; lower-severity findings require an owner, disposition, and review date.

## Accessibility and compatibility

The application must meet the accessibility, keyboard, screen-reader, responsive-layout, and current-and-previous-major browser requirements in the [Product Experience Contract](../product/experience-contract.md).

## Contract and migration integrity

Interfaces and generated clients must agree with their governing runtime schemas. Each domain module owns its tables and migrations. Breaking HTTP or durable-event changes require a new major version and a migration path. Stored payload changes must preserve readability or provide migration or upcasting. During rollout, the immediately preceding application release must remain compatible with the expanded database schema. Migrations must support the oldest supported pre-release schema.

## Changing a target

A target changes only through a documented product or architecture decision explaining the affected users and tournaments, the reason, tradeoffs, and any temporary duration or restoration condition. A hard-to-reverse or surprising change requires an ADR.
