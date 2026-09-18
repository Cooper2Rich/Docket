# Release 1 Work Graph

Status: accepted

The authoritative machine-readable graph is [work-graph.yaml](work-graph.yaml). This file is its readable roadmap. If they differ, implementation stops until they are regenerated or reconciled; Markdown never silently overrides the YAML graph.

## Queue policy

Select the lowest-order `ready` item. Complete all dependencies and named evidence before changing a later item to `ready`. Every item is a vertical slice governed by [the Work Item Contract](work-item-contract.md).

**R1-FND-001 - Scaffold the pinned monorepo** is ready. The previous implementation was removed at the owner's request on September 9, 2026; all later items are blocked. This plan does not authorize implementation.

## Stage 1: Foundation

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 10 | R1-FND-001 | ready | runtime | - | Scaffold the pinned pnpm/Nx monorepo, module shells, and shadcn/ui web foundation. |
| 20 | R1-FND-002 | blocked | runtime | R1-FND-001 | Add reproducible local infrastructure, configuration, lifecycle, and guarded test adapters. |
| 30 | R1-FND-003 | blocked | database | R1-FND-002 | Add module-owned migrations, ownership enforcement, and Testcontainers database harness. |
| 40 | R1-FND-004 | blocked | contracts | R1-FND-003 | Generate and drift-check contracts, clients, matrices, vectors, and traceability. |
| 50 | R1-FND-005 | blocked | runtime | R1-FND-004 | Run every required local check identically in GitHub Actions. |

## Stage 2: Walking skeleton

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 60 | R1-IDA-001 | blocked | identity-access | R1-FND-005 | Authenticate Clerk sessions or fixed nonproduction evidence and manage Docket Sessions. |
| 70 | R1-IDA-002 | blocked | identity-access | R1-IDA-001 | Enforce Active Role Context, authority, privileged limits, and Clerk Reverification. |
| 80 | R1-SCH-001 | blocked | schools | R1-IDA-002 | Create canonical Schools and governed Membership authority. |
| 90 | R1-SCH-002 | blocked | schools | R1-SCH-001 | Establish and transfer Competitor School Affiliation. |
| 100 | R1-TRN-001 | blocked | tournaments | R1-SCH-002 | Create an authorized Tournament and its staff structure. |
| 110 | R1-COM-001 | blocked | communications | R1-TRN-001 | Deliver required notices through transactional outboxes, inboxes, and email. |
| 120 | R1-REG-001 | blocked | registration | R1-COM-001 | Submit one valid Entry and deliver its confirmation end to end. |

The walking skeleton is complete only when R1-REG-001 proves browser → API → module → PostgreSQL → outbox → worker → inbox/email through one deterministic fixture.

## Stage 3: Tournament configuration and registration

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 130 | R1-TRN-002 | blocked | tournaments | R1-REG-001 | Govern the versioned Lincoln-Douglas Ruleset and allowed Tournament Overrides. |
| 140 | R1-TRN-003 | blocked | publication | R1-TRN-002 | Publish and version the Tournament Invitation and active-directory entry. |
| 150 | R1-REG-002 | blocked | registration | R1-TRN-003 | Publish registration, admission, deadlines, and governed field schemas. |
| 160 | R1-REG-003 | blocked | registration | R1-REG-002 | Complete Tournament Roster and Entry lifecycle behavior. |
| 170 | R1-REG-004 | blocked | registration | R1-REG-003 | Complete admission, eligibility, minor authorization, and accommodations. |

## Stage 4: Schedule and judging

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 180 | R1-CMP-001 | blocked | competition | R1-REG-004 | Generate, publish, and revise native schedules and rooms. |
| 190 | R1-CMP-002 | blocked | competition | R1-CMP-001 | Consume verified Judge assessment results and govern qualifications. |
| 200 | R1-CMP-003 | blocked | competition | R1-CMP-002 | Operate Judge Pool Participation, sourcing, withdrawal, and reliability. |
| 210 | R1-CMP-004 | blocked | competition | R1-CMP-003 | Enforce Judge conflicts and Coach-approved striking. |
| 220 | R1-CMP-005 | blocked | competition | R1-CMP-004 | Recommend, confirm, publish, and acknowledge Judge and room assignments. |

## Stage 5: Preliminary rounds and adjudication

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 230 | R1-CMP-006 | blocked | competition | R1-CMP-005 | Generate deterministic preliminary Pairings for every supported method. |
| 240 | R1-CMP-007 | blocked | competition | R1-CMP-006 | Approve, publish, correct, and notify Pairing versions. |
| 250 | R1-CMP-008 | blocked | competition | R1-CMP-007 | Operate rounds, No-Shows, disputes, replacements, emergency Judges, and byes. |
| 260 | R1-CMP-009 | blocked | competition | R1-CMP-008 | Pin rubrics and submit validated, receipted Ballots. |
| 270 | R1-CMP-010 | blocked | competition | R1-CMP-009 | Calculate panels and govern Feedback through its immutable deadline. |
| 280 | R1-CMP-011 | blocked | competition | R1-CMP-010 | Govern Ballot/result corrections and rubric-blocked Administrative Rulings. |

## Stage 6: Standings and elimination rounds

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 290 | R1-CMP-012 | blocked | competition | R1-CMP-011 | Validate, calculate, approve, publish, and correct standings. |
| 300 | R1-CMP-013 | blocked | competition | R1-CMP-012 | Calculate, approve, and publish the Advancement Field. |
| 310 | R1-CMP-014 | blocked | competition | R1-CMP-013 | Build the elimination bracket and enforce out-round verification gates. |

## Stage 7: Awards, Final Results, Closure, and archive

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 320 | R1-CMP-015 | blocked | competition | R1-CMP-014 | Calculate placement and Speaker Awards under the locked Award Plan. |
| 330 | R1-CMP-016 | blocked | competition | R1-CMP-015 | Establish competitive completeness and exact Final Results approval. |
| 340 | R1-TRN-004 | blocked | tournaments | R1-CMP-016 | Separate Competitive Completion from Owner-only Tournament Closure. |
| 350 | R1-PUB-001 | blocked | publication | R1-TRN-004 | Publish archive history, Correction Notices, and post-Closure corrections. |

## Stage 8: Governance and release proof

| Order | ID | Status | Owner | Depends on | Objective |
| ---: | --- | --- | --- | --- | --- |
| 360 | R1-GOV-001 | blocked | governance | R1-PUB-001 | Complete privileged audit, retention, deletion, recovery, and Legal Holds. |
| 370 | R1-GOV-002 | blocked | governance | R1-GOV-001 | Complete security, integrity, support, rate-limit, telemetry, and degraded-mode controls. |
| 380 | R1-REL-001 | blocked | workflows | R1-GOV-002 | Prove every actor, state, audience, browser, and accessibility journey in one seeded tournament. |
| 390 | R1-REL-002 | blocked | runtime | R1-REL-001 | Prove load, latency, queue, recovery, deployment, rollback, and degradation gates. |
| 400 | R1-REL-003 | blocked | workflows | R1-REL-002 | Produce immutable release evidence and the production go/no-go decision. |

## Cross-cutting rule

Later governance stages verify the whole release; they do not postpone security, privacy, audit, retention, accessibility, observability, or failure handling from earlier vertical slices. Every earlier item implements the subset required by its own accepted behavior and evidence.
