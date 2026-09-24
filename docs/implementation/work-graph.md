# Release 1 implementation queue

Authoritative source: [work-graph.yaml](work-graph.yaml). Detailed contracts: [queue-contract.json](queue-contract.json). Setup does not authorize application implementation.

40 preserved non-runnable groups; 115 runnable leaf specifications; 8 decision/external gates. No implementation is complete. R1-FND-001-A is ready under the resolved protected-bootstrap policy.

Milestones group related capabilities. Execution order follows actual prerequisites, so configuration needed for schedule/pairing locks is implemented before those locks; a milestone number is not a second ordering authority.

| Order | Work item                                                                                                       | Milestone                          | Prerequisites                   |
| ----- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------- |
| 10    | [R1-FND-001-A: Create the pinned workspace and executable item-verification entry point](items/R1-FND-001-A.md) | 01 Foundations                     | GATE-BOOTSTRAP                  |
| 20    | [R1-FND-001-B: Deliver the server-rendered shadcn web foundation](items/R1-FND-001-B.md)                        | 01 Foundations                     | R1-FND-001-A                    |
| 30    | [R1-FND-002-A: Bootstrap local services and validate runtime configuration](items/R1-FND-002-A.md)              | 01 Foundations                     | R1-FND-001-B                    |
| 40    | [R1-FND-002-B: Provide deterministic clocks, identifiers, and guarded adapters](items/R1-FND-002-B.md)          | 01 Foundations                     | R1-FND-002-A                    |
| 50    | [R1-FND-003-A: Run forward module-owned migrations](items/R1-FND-003-A.md)                                      | 01 Foundations                     | R1-FND-002-B                    |
| 60    | [R1-FND-003-B: Isolate database integration fixtures and compatibility checks](items/R1-FND-003-B.md)           | 01 Foundations                     | R1-FND-003-A                    |
| 70    | [R1-FND-004-A: Generate contracts from module-owned definitions](items/R1-FND-004-A.md)                         | 01 Foundations                     | R1-FND-003-B                    |
| 80    | [R1-FND-004-B: Connect requirements, acceptance evidence, and generated traceability](items/R1-FND-004-B.md)    | 01 Foundations                     | R1-FND-004-A                    |
| 90    | [R1-FND-005-A: Run the eleven required checks on current pull-request heads](items/R1-FND-005-A.md)             | 01 Foundations                     | R1-FND-004-B                    |
| 100   | [R1-FND-005-B: Verify main protection and bootstrap-to-CI completion gates](items/R1-FND-005-B.md)              | 01 Foundations                     | R1-FND-005-A, GATE-GITHUB       |
| 110   | [R1-IDA-001-A: Authenticate Clerk identities and preserve Account identity](items/R1-IDA-001-A.md)              | 02 Walking skeleton                | R1-FND-005-B                    |
| 120   | [R1-IDA-001-B: Enforce session limits and Account security views](items/R1-IDA-001-B.md)                        | 02 Walking skeleton                | R1-IDA-001-A                    |
| 130   | [R1-IDA-002-A: Isolate Active Role Context and reverify sensitive actions](items/R1-IDA-002-A.md)               | 02 Walking skeleton                | R1-IDA-001-B                    |
| 140   | [R1-COM-001-A: Commit outbox events and deliver idempotent work](items/R1-COM-001-A.md)                         | 02 Walking skeleton                | R1-IDA-002-A                    |
| 150   | [R1-COM-001-B: Deliver scoped inbox and email notices with tracked retries](items/R1-COM-001-B.md)              | 02 Walking skeleton                | R1-COM-001-A                    |
| 160   | [R1-IDA-002-B: Accept, decline, revoke, and expire scoped Access Offers](items/R1-IDA-002-B.md)                 | 02 Walking skeleton                | R1-COM-001-B                    |
| 170   | [R1-SCH-001-A: Verify canonical Schools and reversible duplicate merges](items/R1-SCH-001-A.md)                 | 02 Walking skeleton                | R1-IDA-002-B                    |
| 180   | [R1-SCH-001-B: Manage School Memberships and one exclusive Manager](items/R1-SCH-001-B.md)                      | 02 Walking skeleton                | R1-SCH-001-A                    |
| 190   | [R1-SCH-001-C: Recover a School Manager without temporary authority](items/R1-SCH-001-C.md)                     | 02 Walking skeleton                | R1-SCH-001-B                    |
| 200   | [R1-REG-004-A: Record minor authorization before affiliation or participation](items/R1-REG-004-A.md)           | 03 Configuration and registration  | R1-SCH-001-C                    |
| 210   | [R1-SCH-002-A: Accept one Competitor School Affiliation](items/R1-SCH-002-A.md)                                 | 02 Walking skeleton                | R1-REG-004-A                    |
| 220   | [R1-SCH-002-B: Transfer or end affiliation while preserving represented School](items/R1-SCH-002-B.md)          | 02 Walking skeleton                | R1-SCH-002-A                    |
| 230   | [R1-TRN-001-A: Create Draft tournaments and delegate scoped staff authority](items/R1-TRN-001-A.md)             | 02 Walking skeleton                | R1-SCH-002-B                    |
| 240   | [R1-TRN-001-B: Transfer and recover tournament ownership](items/R1-TRN-001-B.md)                                | 02 Walking skeleton                | R1-TRN-001-A                    |
| 250   | [R1-TRN-002-A: Adopt immutable Rulesets and allowlisted overrides](items/R1-TRN-002-A.md)                       | 03 Configuration and registration  | R1-TRN-001-B, GATE-RULESET      |
| 260   | [R1-TRN-002-B: Govern Ruleset migration and emergency amendments](items/R1-TRN-002-B.md)                        | 03 Configuration and registration  | R1-TRN-002-A                    |
| 270   | [R1-TRN-003-A: Publish versioned Invitation Pages and safe cancellation](items/R1-TRN-003-A.md)                 | 03 Configuration and registration  | R1-TRN-002-B                    |
| 280   | [R1-TRN-003-B: Browse the active directory with accessible search and paging](items/R1-TRN-003-B.md)            | 03 Configuration and registration  | R1-TRN-003-A                    |
| 290   | [R1-REG-002-A: Publish coherent registration and admission policies](items/R1-REG-002-A.md)                     | 03 Configuration and registration  | R1-TRN-003-B                    |
| 300   | [R1-REG-002-B: Collect versioned, minimized additional Entry fields](items/R1-REG-002-B.md)                     | 03 Configuration and registration  | R1-REG-002-A                    |
| 310   | [R1-REG-001-A: Submit one valid Entry through the complete delivery path](items/R1-REG-001-A.md)                | 02 Walking skeleton                | R1-REG-002-B                    |
| 320   | [R1-REG-003-A: Operate roster and six-state Entry lifecycle](items/R1-REG-003-A.md)                             | 03 Configuration and registration  | R1-REG-001-A                    |
| 330   | [R1-REG-003-B: Resolve Entry Error Reports and governed late registration](items/R1-REG-003-B.md)               | 03 Configuration and registration  | R1-REG-003-A                    |
| 340   | [R1-REG-004-B: Confirm deterministic admission and waitlist recommendations](items/R1-REG-004-B.md)             | 03 Configuration and registration  | R1-REG-003-B                    |
| 350   | [R1-REG-004-C: Review Accommodation Requests through scoped decisions](items/R1-REG-004-C.md)                   | 03 Configuration and registration  | R1-REG-004-B                    |
| 360   | [R1-REG-004-D: Disclose and revoke minimal accommodation instructions](items/R1-REG-004-D.md)                   | 03 Configuration and registration  | R1-REG-004-C                    |
| 370   | [R1-CMP-002-A: Authorize assessment attempts and verify provider deliveries](items/R1-CMP-002-A.md)             | 04 Scheduling and Judge operations | R1-REG-004-D                    |
| 380   | [R1-CMP-002-B: Calculate versioned qualifications, retakes, and tier test-outs](items/R1-CMP-002-B.md)          | 04 Scheduling and Judge operations | R1-CMP-002-A                    |
| 390   | [R1-CMP-002-C: Operate Quick Assessments and tournament-local tier grants](items/R1-CMP-002-C.md)               | 04 Scheduling and Judge operations | R1-CMP-002-B                    |
| 400   | [R1-CMP-002-D: Publish Judge profiles and minimize assessment access and retention](items/R1-CMP-002-D.md)      | 04 Scheduling and Judge operations | R1-CMP-002-C                    |
| 410   | [R1-CMP-003-A: Accept and project the current Judge Pool](items/R1-CMP-003-A.md)                                | 04 Scheduling and Judge operations | R1-CMP-002-D                    |
| 420   | [R1-CMP-003-B: Account for School-supplied Judges and obligation deficits](items/R1-CMP-003-B.md)               | 04 Scheduling and Judge operations | R1-CMP-003-A                    |
| 430   | [R1-CMP-003-C: Withdraw Judges and retain restricted reliability outcomes](items/R1-CMP-003-C.md)               | 04 Scheduling and Judge operations | R1-CMP-003-B                    |
| 440   | [R1-CMP-004-A: Validate Judge conflicts and publish the striking policy](items/R1-CMP-004-A.md)                 | 04 Scheduling and Judge operations | R1-CMP-003-C                    |
| 450   | [R1-CMP-004-B: Approve timed Judge strikes and governed outage exceptions](items/R1-CMP-004-B.md)               | 04 Scheduling and Judge operations | R1-CMP-004-A                    |
| 460   | [R1-CMP-012-A: Validate and preview declarative standings policies](items/R1-CMP-012-A.md)                      | 06 Standings and eliminations      | R1-CMP-004-B                    |
| 470   | [R1-CMP-013-A: Validate and preview advancement policy and cut ties](items/R1-CMP-013-A.md)                     | 06 Standings and eliminations      | R1-CMP-012-A                    |
| 480   | [R1-CMP-015-A: Validate and accept the two supported award families](items/R1-CMP-015-A.md)                     | 07 Awards and closure              | R1-CMP-013-A                    |
| 490   | [R1-CMP-006-A: Configure per-round pairing methods and lockable policy](items/R1-CMP-006-A.md)                  | 05 Preliminary competition         | R1-CMP-015-A                    |
| 500   | [R1-CMP-001-A: Generate reproducible native schedule candidates](items/R1-CMP-001-A.md)                         | 04 Scheduling and Judge operations | R1-CMP-006-A                    |
| 510   | [R1-CMP-001-B: Select and publish a schedule with the pairing-policy lock](items/R1-CMP-001-B.md)               | 04 Scheduling and Judge operations | R1-CMP-001-A                    |
| 520   | [R1-CMP-001-C: Provide Event Workspaces and the personal tournament agenda](items/R1-CMP-001-C.md)              | 04 Scheduling and Judge operations | R1-CMP-001-B                    |
| 530   | [R1-CMP-005-A: Recommend and sign off eligible Judge and room assignments](items/R1-CMP-005-A.md)               | 04 Scheduling and Judge operations | R1-CMP-001-C                    |
| 540   | [R1-CMP-006-B: Generate random, preset, seeded and round-robin preliminaries](items/R1-CMP-006-B.md)            | 05 Preliminary competition         | R1-CMP-005-A                    |
| 550   | [R1-CMP-006-C: Calculate internal standings and power pairings](items/R1-CMP-006-C.md)                          | 05 Preliminary competition         | R1-CMP-006-B                    |
| 560   | [R1-CMP-006-D: Construct fully manual pairings through the same validator](items/R1-CMP-006-D.md)               | 05 Preliminary competition         | R1-CMP-006-C                    |
| 570   | [R1-CMP-007-A: Approve and publish exact pairings with atomic policy locks](items/R1-CMP-007-A.md)              | 05 Preliminary competition         | R1-CMP-006-D                    |
| 580   | [R1-CMP-007-B: Correct unstarted pairings and emergency pre-start policy errors](items/R1-CMP-007-B.md)         | 05 Preliminary competition         | R1-CMP-007-A                    |
| 590   | [R1-REG-003-C: Restore Entries without bypassing admission or pairing history](items/R1-REG-003-C.md)           | 03 Configuration and registration  | R1-CMP-007-B                    |
| 600   | [R1-CMP-001-D: Publish and acknowledge schedule revisions and reversals](items/R1-CMP-001-D.md)                 | 04 Scheduling and Judge operations | R1-REG-003-C                    |
| 610   | [R1-CMP-001-E: Apply accommodations and cross-entry holds to live schedules](items/R1-CMP-001-E.md)             | 04 Scheduling and Judge operations | R1-CMP-001-D                    |
| 620   | [R1-CMP-005-B: Confirm changed and emergency assignments without proxy acknowledgment](items/R1-CMP-005-B.md)   | 04 Scheduling and Judge operations | R1-CMP-001-E                    |
| 630   | [R1-CMP-009-A: Author and review platform ballot rubrics](items/R1-CMP-009-A.md)                                | 05 Preliminary competition         | R1-CMP-005-B                    |
| 640   | [R1-CMP-009-B: Pin rubric versions at the first authorized cohort start](items/R1-CMP-009-B.md)                 | 05 Preliminary competition         | R1-CMP-009-A                    |
| 650   | [R1-CMP-008-A: Run round check-in and immutable start and completion transitions](items/R1-CMP-008-A.md)        | 05 Preliminary competition         | R1-CMP-009-B                    |
| 660   | [R1-CMP-008-B: Classify Competitor and Judge No-Shows with contact evidence](items/R1-CMP-008-B.md)             | 05 Preliminary competition         | R1-CMP-008-A                    |
| 670   | [R1-CMP-008-C: Resolve timely Competitor No-Show disputes](items/R1-CMP-008-C.md)                               | 05 Preliminary competition         | R1-CMP-008-B                    |
| 680   | [R1-CMP-008-D: Sign off replacements and administrative No-Show outcomes](items/R1-CMP-008-D.md)                | 05 Preliminary competition         | R1-CMP-008-C                    |
| 690   | [R1-CMP-009-C: Submit and lock competitive ballots with retry safety](items/R1-CMP-009-C.md)                    | 05 Preliminary competition         | R1-CMP-008-D                    |
| 700   | [R1-CMP-009-D: Escalate missing ballots and maintain local assignment holds](items/R1-CMP-009-D.md)             | 05 Preliminary competition         | R1-CMP-009-C                    |
| 710   | [R1-CMP-010-A: Resolve independent panel ballots and scoring provenance](items/R1-CMP-010-A.md)                 | 05 Preliminary competition         | R1-CMP-009-D                    |
| 720   | [R1-CMP-010-B: Draft and publish feedback under the hard seven-day deadline](items/R1-CMP-010-B.md)             | 05 Preliminary competition         | R1-CMP-010-A                    |
| 730   | [R1-CMP-010-C: Project historical School feedback and calculation dashboards](items/R1-CMP-010-C.md)            | 05 Preliminary competition         | R1-CMP-010-B                    |
| 740   | [R1-CMP-010-D: Restrict unsafe feedback with independent reconsideration](items/R1-CMP-010-D.md)                | 05 Preliminary competition         | R1-CMP-010-C                    |
| 750   | [R1-CMP-011-A: Reopen results with Judge or evidenced staff attribution](items/R1-CMP-011-A.md)                 | 05 Preliminary competition         | R1-CMP-010-D                    |
| 760   | [R1-CMP-011-B: Correct completed decisions and apply scoped disqualification](items/R1-CMP-011-B.md)            | 05 Preliminary competition         | R1-CMP-011-A                    |
| 770   | [R1-CMP-011-C: Resolve downstream conflicts without rewriting played rounds](items/R1-CMP-011-C.md)             | 05 Preliminary competition         | R1-CMP-011-B                    |
| 780   | [R1-CMP-011-D: Resolve pinned-rubric defects through governed rulings](items/R1-CMP-011-D.md)                   | 05 Preliminary competition         | R1-CMP-011-C                    |
| 790   | [R1-CMP-012-B: Publish checkpointed standings with School-only breakdowns](items/R1-CMP-012-B.md)               | 06 Standings and eliminations      | R1-CMP-011-D                    |
| 800   | [R1-CMP-012-C: Govern emergency standings amendments](items/R1-CMP-012-C.md)                                    | 06 Standings and eliminations      | R1-CMP-012-B                    |
| 810   | [R1-CMP-013-B: Approve and publish the actual Advancement Field](items/R1-CMP-013-B.md)                         | 06 Standings and eliminations      | R1-CMP-012-C                    |
| 820   | [R1-CMP-013-C: Correct advancement before and after elimination starts](items/R1-CMP-013-C.md)                  | 06 Standings and eliminations      | R1-CMP-013-B                    |
| 830   | [R1-CMP-014-A: Build canonical seeded elimination brackets and sides](items/R1-CMP-014-A.md)                    | 06 Standings and eliminations      | R1-CMP-013-C                    |
| 840   | [R1-CMP-014-B: Enforce the versioned two-person elimination start gate](items/R1-CMP-014-B.md)                  | 06 Standings and eliminations      | R1-CMP-014-A                    |
| 850   | [R1-CMP-014-C: Handle documented gate exceptions and escaped starts](items/R1-CMP-014-C.md)                     | 06 Standings and eliminations      | R1-CMP-014-B                    |
| 860   | [R1-CMP-015-B: Calculate auditable placement and preliminary Speaker awards](items/R1-CMP-015-B.md)             | 07 Awards and closure              | R1-CMP-014-C                    |
| 870   | [R1-CMP-015-C: Amend awards with versioned impact and final-publication coupling](items/R1-CMP-015-C.md)        | 07 Awards and closure              | R1-CMP-015-B                    |
| 880   | [R1-CMP-016-A: Assess Final Results readiness across all competitive inputs](items/R1-CMP-016-A.md)             | 07 Awards and closure              | R1-CMP-015-C                    |
| 890   | [R1-CMP-016-B: Approve and publish unified Final Results](items/R1-CMP-016-B.md)                                | 07 Awards and closure              | R1-CMP-016-A                    |
| 900   | [R1-TRN-004-A: Preview and execute Owner-only Tournament Closure](items/R1-TRN-004-A.md)                        | 07 Awards and closure              | R1-CMP-016-B                    |
| 910   | [R1-TRN-004-B: Guard every Closed-state mutation boundary](items/R1-TRN-004-B.md)                               | 07 Awards and closure              | R1-TRN-004-A                    |
| 920   | [R1-PUB-001-A: Serve permanent public archives and authorized restricted history](items/R1-PUB-001-A.md)        | 07 Awards and closure              | R1-TRN-004-B                    |
| 930   | [R1-PUB-001-B: Apply objective post-Closure No-Show corrections within 168 hours](items/R1-PUB-001-B.md)        | 07 Awards and closure              | R1-PUB-001-A                    |
| 940   | [R1-PUB-001-C: Correct mistaken represented-School attribution with preserved history](items/R1-PUB-001-C.md)   | 07 Awards and closure              | R1-PUB-001-B, GATE-ATTRIBUTION  |
| 950   | [R1-IDA-001-C: Recover Clerk linkage with independent evidence and review](items/R1-IDA-001-C.md)               | 02 Walking skeleton                | R1-PUB-001-C                    |
| 960   | [R1-IDA-001-D: Suspend Accounts with independent review and bounded extensions](items/R1-IDA-001-D.md)          | 02 Walking skeleton                | R1-IDA-001-C                    |
| 970   | [R1-IDA-001-E: Deactivate Accounts without abandoning duties or rewriting identity](items/R1-IDA-001-E.md)      | 02 Walking skeleton                | R1-IDA-001-D                    |
| 980   | [R1-GOV-001-A: Operate dual-approved scoped Legal Holds](items/R1-GOV-001-A.md)                                 | 08 Governance and release          | R1-IDA-001-E                    |
| 990   | [R1-GOV-001-B: Enforce class-specific deletion across storage and projections](items/R1-GOV-001-B.md)           | 08 Governance and release          | R1-GOV-001-A                    |
| 1000  | [R1-GOV-001-C: Make backup expiry and restoration honor privacy deadlines](items/R1-GOV-001-C.md)               | 08 Governance and release          | R1-GOV-001-B                    |
| 1010  | [R1-GOV-001-D: Verify tamper-evident attributed audit and audience retention](items/R1-GOV-001-D.md)            | 08 Governance and release          | R1-GOV-001-C                    |
| 1020  | [R1-GOV-002-A: Expose only typed, evidenced support operations](items/R1-GOV-002-A.md)                          | 08 Governance and release          | R1-GOV-001-D                    |
| 1030  | [R1-GOV-002-B: Review identity and assessment integrity without rewriting scores](items/R1-GOV-002-B.md)        | 08 Governance and release          | R1-GOV-002-A                    |
| 1040  | [R1-GOV-002-C: Enforce security boundaries and degraded-service behavior](items/R1-GOV-002-C.md)                | 08 Governance and release          | R1-GOV-002-B                    |
| 1050  | [R1-CMP-002-E: Validate the real assessment provider and approved scoring policy](items/R1-CMP-002-E.md)        | 04 Scheduling and Judge operations | R1-GOV-002-C, GATE-ASSESSMENT   |
| 1060  | [R1-REL-001-A: Verify the full multi-actor tournament journey](items/R1-REL-001-A.md)                           | 08 Governance and release          | R1-CMP-002-E                    |
| 1070  | [R1-REL-001-B: Verify corrections, recovery and privacy across the whole tournament](items/R1-REL-001-B.md)     | 08 Governance and release          | R1-REL-001-A                    |
| 1080  | [R1-REL-001-C: Verify supported browsers and accessible actor experiences](items/R1-REL-001-C.md)               | 08 Governance and release          | R1-REL-001-B, GATE-REVIEW       |
| 1090  | [R1-REL-002-A: Provision isolated AWS and Vercel environments through Terraform](items/R1-REL-002-A.md)         | 08 Governance and release          | R1-REL-001-C, GATE-ENVIRONMENTS |
| 1100  | [R1-REL-002-B: Deploy immutable artifacts with migration and rollback controls](items/R1-REL-002-B.md)          | 08 Governance and release          | R1-REL-002-A                    |
| 1110  | [R1-REL-002-C: Operate telemetry, actionable alerts and delivery recovery](items/R1-REL-002-C.md)               | 08 Governance and release          | R1-REL-002-B                    |
| 1120  | [R1-REL-002-D: Prove representative capacity and burst recovery](items/R1-REL-002-D.md)                         | 08 Governance and release          | R1-REL-002-C                    |
| 1130  | [R1-REL-002-E: Rehearse disaster recovery and continuity objectives](items/R1-REL-002-E.md)                     | 08 Governance and release          | R1-REL-002-D                    |
| 1140  | [R1-REL-003-A: Assemble the current release evidence and operator handoff](items/R1-REL-003-A.md)               | 08 Governance and release          | R1-REL-002-E                    |
| 1150  | [R1-REL-003-B: Record the explicit production go or no-go decision](items/R1-REL-003-B.md)                      | 08 Governance and release          | R1-REL-003-A, GATE-RELEASE      |

## Execution status

- R1-FND-001-A: done
- R1-FND-001-B: done
- R1-FND-002-A: done
- R1-FND-002-B: done
- R1-FND-003-A: done
- R1-FND-003-B: ready
- R1-FND-004-A: blocked
- R1-FND-004-B: blocked
- R1-FND-005-A: blocked
- R1-FND-005-B: blocked
- R1-IDA-001-A: blocked
- R1-IDA-001-B: blocked
- R1-IDA-002-A: blocked
- R1-COM-001-A: blocked
- R1-COM-001-B: blocked
- R1-IDA-002-B: blocked
- R1-SCH-001-A: blocked
- R1-SCH-001-B: blocked
- R1-SCH-001-C: blocked
- R1-REG-004-A: blocked
- R1-SCH-002-A: blocked
- R1-SCH-002-B: blocked
- R1-TRN-001-A: blocked
- R1-TRN-001-B: blocked
- R1-TRN-002-A: blocked
- R1-TRN-002-B: blocked
- R1-TRN-003-A: blocked
- R1-TRN-003-B: blocked
- R1-REG-002-A: blocked
- R1-REG-002-B: blocked
- R1-REG-001-A: blocked
- R1-REG-003-A: blocked
- R1-REG-003-B: blocked
- R1-REG-004-B: blocked
- R1-REG-004-C: blocked
- R1-REG-004-D: blocked
- R1-CMP-002-A: blocked
- R1-CMP-002-B: blocked
- R1-CMP-002-C: blocked
- R1-CMP-002-D: blocked
- R1-CMP-003-A: blocked
- R1-CMP-003-B: blocked
- R1-CMP-003-C: blocked
- R1-CMP-004-A: blocked
- R1-CMP-004-B: blocked
- R1-CMP-012-A: blocked
- R1-CMP-013-A: blocked
- R1-CMP-015-A: blocked
- R1-CMP-006-A: blocked
- R1-CMP-001-A: blocked
- R1-CMP-001-B: blocked
- R1-CMP-001-C: blocked
- R1-CMP-005-A: blocked
- R1-CMP-006-B: blocked
- R1-CMP-006-C: blocked
- R1-CMP-006-D: blocked
- R1-CMP-007-A: blocked
- R1-CMP-007-B: blocked
- R1-REG-003-C: blocked
- R1-CMP-001-D: blocked
- R1-CMP-001-E: blocked
- R1-CMP-005-B: blocked
- R1-CMP-009-A: blocked
- R1-CMP-009-B: blocked
- R1-CMP-008-A: blocked
- R1-CMP-008-B: blocked
- R1-CMP-008-C: blocked
- R1-CMP-008-D: blocked
- R1-CMP-009-C: blocked
- R1-CMP-009-D: blocked
- R1-CMP-010-A: blocked
- R1-CMP-010-B: blocked
- R1-CMP-010-C: blocked
- R1-CMP-010-D: blocked
- R1-CMP-011-A: blocked
- R1-CMP-011-B: blocked
- R1-CMP-011-C: blocked
- R1-CMP-011-D: blocked
- R1-CMP-012-B: blocked
- R1-CMP-012-C: blocked
- R1-CMP-013-B: blocked
- R1-CMP-013-C: blocked
- R1-CMP-014-A: blocked
- R1-CMP-014-B: blocked
- R1-CMP-014-C: blocked
- R1-CMP-015-B: blocked
- R1-CMP-015-C: blocked
- R1-CMP-016-A: blocked
- R1-CMP-016-B: blocked
- R1-TRN-004-A: blocked
- R1-TRN-004-B: blocked
- R1-PUB-001-A: blocked
- R1-PUB-001-B: blocked
- R1-PUB-001-C: blocked
- R1-IDA-001-C: blocked
- R1-IDA-001-D: blocked
- R1-IDA-001-E: blocked
- R1-GOV-001-A: blocked
- R1-GOV-001-B: blocked
- R1-GOV-001-C: blocked
- R1-GOV-001-D: blocked
- R1-GOV-002-A: blocked
- R1-GOV-002-B: blocked
- R1-GOV-002-C: blocked
- R1-CMP-002-E: blocked
- R1-REL-001-A: blocked
- R1-REL-001-B: blocked
- R1-REL-001-C: blocked
- R1-REL-002-A: blocked
- R1-REL-002-B: blocked
- R1-REL-002-C: blocked
- R1-REL-002-D: blocked
- R1-REL-002-E: blocked
- R1-REL-003-A: blocked
- R1-REL-003-B: blocked
