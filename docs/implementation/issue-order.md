# Release 1 issue order

**[Open the implementation issues in execution order](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue%20is%3Aopen%20label%3Arelease%3Ar1%20label%3Akind%3Aimplementation%20sort%3Acreated-asc)**. Start with [#49 R1-FND-001-A](https://github.com/Cooper2Rich/Docket/issues/49) and follow the numbered sequence below. [All Release 1 issues, oldest first](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue%20is%3Aopen%20label%3Arelease%3Ar1%20sort%3Acreated-asc).

This pinned index covers all 163 work issues: 115 implementation leaves, 40 tracking groups and eight decision/external gates. It is navigation, not an implementation item or a new release requirement.

The current implementation issue numbers #49 through #163 already match the work graph. GitHub's newest-first view reverses that sequence. Use the implementation filter and oldest-first sort; group numbers and milestone numbers are not an execution order. If future issues are inserted or split, follow the work graph and regenerate this index rather than relying on issue number.

Authority: [work graph](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/work-graph.yaml), [work-item contract](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/work-item-contract.md), and [launch guide](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/launch-guide.md). Only a ready leaf may run, and setup does not authorize an application build.

## Before starting

Resolve [#41 GATE-BOOTSTRAP](https://github.com/Cooper2Rich/Docket/issues/41) and [#42 GATE-GITHUB](https://github.com/Cooper2Rich/Docket/issues/42), then meet the launch guide's review/integration and explicit build-authorization conditions. The first implementation leaf remains blocked. Independent current-head review is required throughout.

## Implementation sequence

Run one leaf at a time. Each earlier dependency must be verified and integrated; a closed gate issue alone is not resolution.

| Step | Graph order | Issue | Outcome | Prerequisites |
| --- | --- | --- | --- | --- |
| 001 | 10 | [#49 R1-FND-001-A](https://github.com/Cooper2Rich/Docket/issues/49) | Create the pinned workspace and executable item-verification entry point | [#41 GATE-BOOTSTRAP](https://github.com/Cooper2Rich/Docket/issues/41) |
| 002 | 20 | [#50 R1-FND-001-B](https://github.com/Cooper2Rich/Docket/issues/50) | Deliver the server-rendered shadcn web foundation | [#49 R1-FND-001-A](https://github.com/Cooper2Rich/Docket/issues/49) |
| 003 | 30 | [#51 R1-FND-002-A](https://github.com/Cooper2Rich/Docket/issues/51) | Bootstrap local services and validate runtime configuration | [#50 R1-FND-001-B](https://github.com/Cooper2Rich/Docket/issues/50) |
| 004 | 40 | [#52 R1-FND-002-B](https://github.com/Cooper2Rich/Docket/issues/52) | Provide deterministic clocks, identifiers, and guarded adapters | [#51 R1-FND-002-A](https://github.com/Cooper2Rich/Docket/issues/51) |
| 005 | 50 | [#53 R1-FND-003-A](https://github.com/Cooper2Rich/Docket/issues/53) | Run forward module-owned migrations | [#52 R1-FND-002-B](https://github.com/Cooper2Rich/Docket/issues/52) |
| 006 | 60 | [#54 R1-FND-003-B](https://github.com/Cooper2Rich/Docket/issues/54) | Isolate database integration fixtures and compatibility checks | [#53 R1-FND-003-A](https://github.com/Cooper2Rich/Docket/issues/53) |
| 007 | 70 | [#55 R1-FND-004-A](https://github.com/Cooper2Rich/Docket/issues/55) | Generate contracts from module-owned definitions | [#54 R1-FND-003-B](https://github.com/Cooper2Rich/Docket/issues/54) |
| 008 | 80 | [#56 R1-FND-004-B](https://github.com/Cooper2Rich/Docket/issues/56) | Connect requirements, acceptance evidence, and generated traceability | [#55 R1-FND-004-A](https://github.com/Cooper2Rich/Docket/issues/55) |
| 009 | 90 | [#57 R1-FND-005-A](https://github.com/Cooper2Rich/Docket/issues/57) | Run the eleven required checks on current pull-request heads | [#56 R1-FND-004-B](https://github.com/Cooper2Rich/Docket/issues/56) |
| 010 | 100 | [#58 R1-FND-005-B](https://github.com/Cooper2Rich/Docket/issues/58) | Verify main protection and bootstrap-to-CI completion gates | [#57 R1-FND-005-A](https://github.com/Cooper2Rich/Docket/issues/57), [#42 GATE-GITHUB](https://github.com/Cooper2Rich/Docket/issues/42) |
| 011 | 110 | [#59 R1-IDA-001-A](https://github.com/Cooper2Rich/Docket/issues/59) | Authenticate Clerk identities and preserve Account identity | [#58 R1-FND-005-B](https://github.com/Cooper2Rich/Docket/issues/58) |
| 012 | 120 | [#60 R1-IDA-001-B](https://github.com/Cooper2Rich/Docket/issues/60) | Enforce session limits and Account security views | [#59 R1-IDA-001-A](https://github.com/Cooper2Rich/Docket/issues/59) |
| 013 | 130 | [#61 R1-IDA-002-A](https://github.com/Cooper2Rich/Docket/issues/61) | Isolate Active Role Context and reverify sensitive actions | [#60 R1-IDA-001-B](https://github.com/Cooper2Rich/Docket/issues/60) |
| 014 | 140 | [#62 R1-COM-001-A](https://github.com/Cooper2Rich/Docket/issues/62) | Commit outbox events and deliver idempotent work | [#61 R1-IDA-002-A](https://github.com/Cooper2Rich/Docket/issues/61) |
| 015 | 150 | [#63 R1-COM-001-B](https://github.com/Cooper2Rich/Docket/issues/63) | Deliver scoped inbox and email notices with tracked retries | [#62 R1-COM-001-A](https://github.com/Cooper2Rich/Docket/issues/62) |
| 016 | 160 | [#64 R1-IDA-002-B](https://github.com/Cooper2Rich/Docket/issues/64) | Accept, decline, revoke, and expire scoped Access Offers | [#63 R1-COM-001-B](https://github.com/Cooper2Rich/Docket/issues/63) |
| 017 | 170 | [#65 R1-SCH-001-A](https://github.com/Cooper2Rich/Docket/issues/65) | Verify canonical Schools and reversible duplicate merges | [#64 R1-IDA-002-B](https://github.com/Cooper2Rich/Docket/issues/64) |
| 018 | 180 | [#66 R1-SCH-001-B](https://github.com/Cooper2Rich/Docket/issues/66) | Manage School Memberships and one exclusive Manager | [#65 R1-SCH-001-A](https://github.com/Cooper2Rich/Docket/issues/65) |
| 019 | 190 | [#67 R1-SCH-001-C](https://github.com/Cooper2Rich/Docket/issues/67) | Recover a School Manager without temporary authority | [#66 R1-SCH-001-B](https://github.com/Cooper2Rich/Docket/issues/66) |
| 020 | 200 | [#68 R1-REG-004-A](https://github.com/Cooper2Rich/Docket/issues/68) | Record minor authorization before affiliation or participation | [#67 R1-SCH-001-C](https://github.com/Cooper2Rich/Docket/issues/67) |
| 021 | 210 | [#69 R1-SCH-002-A](https://github.com/Cooper2Rich/Docket/issues/69) | Accept one Competitor School Affiliation | [#68 R1-REG-004-A](https://github.com/Cooper2Rich/Docket/issues/68) |
| 022 | 220 | [#70 R1-SCH-002-B](https://github.com/Cooper2Rich/Docket/issues/70) | Transfer or end affiliation while preserving represented School | [#69 R1-SCH-002-A](https://github.com/Cooper2Rich/Docket/issues/69) |
| 023 | 230 | [#71 R1-TRN-001-A](https://github.com/Cooper2Rich/Docket/issues/71) | Create Draft tournaments and delegate scoped staff authority | [#70 R1-SCH-002-B](https://github.com/Cooper2Rich/Docket/issues/70) |
| 024 | 240 | [#72 R1-TRN-001-B](https://github.com/Cooper2Rich/Docket/issues/72) | Transfer and recover tournament ownership | [#71 R1-TRN-001-A](https://github.com/Cooper2Rich/Docket/issues/71) |
| 025 | 250 | [#73 R1-TRN-002-A](https://github.com/Cooper2Rich/Docket/issues/73) | Adopt immutable Rulesets and allowlisted overrides | [#72 R1-TRN-001-B](https://github.com/Cooper2Rich/Docket/issues/72), [#43 GATE-RULESET](https://github.com/Cooper2Rich/Docket/issues/43) |
| 026 | 260 | [#74 R1-TRN-002-B](https://github.com/Cooper2Rich/Docket/issues/74) | Govern Ruleset migration and emergency amendments | [#73 R1-TRN-002-A](https://github.com/Cooper2Rich/Docket/issues/73) |
| 027 | 270 | [#75 R1-TRN-003-A](https://github.com/Cooper2Rich/Docket/issues/75) | Publish versioned Invitation Pages and safe cancellation | [#74 R1-TRN-002-B](https://github.com/Cooper2Rich/Docket/issues/74) |
| 028 | 280 | [#76 R1-TRN-003-B](https://github.com/Cooper2Rich/Docket/issues/76) | Browse the active directory with accessible search and paging | [#75 R1-TRN-003-A](https://github.com/Cooper2Rich/Docket/issues/75) |
| 029 | 290 | [#77 R1-REG-002-A](https://github.com/Cooper2Rich/Docket/issues/77) | Publish coherent registration and admission policies | [#76 R1-TRN-003-B](https://github.com/Cooper2Rich/Docket/issues/76) |
| 030 | 300 | [#78 R1-REG-002-B](https://github.com/Cooper2Rich/Docket/issues/78) | Collect versioned, minimized additional Entry fields | [#77 R1-REG-002-A](https://github.com/Cooper2Rich/Docket/issues/77) |
| 031 | 310 | [#79 R1-REG-001-A](https://github.com/Cooper2Rich/Docket/issues/79) | Submit one valid Entry through the complete delivery path | [#78 R1-REG-002-B](https://github.com/Cooper2Rich/Docket/issues/78) |
| 032 | 320 | [#80 R1-REG-003-A](https://github.com/Cooper2Rich/Docket/issues/80) | Operate roster and six-state Entry lifecycle | [#79 R1-REG-001-A](https://github.com/Cooper2Rich/Docket/issues/79) |
| 033 | 330 | [#81 R1-REG-003-B](https://github.com/Cooper2Rich/Docket/issues/81) | Resolve Entry Error Reports and governed late registration | [#80 R1-REG-003-A](https://github.com/Cooper2Rich/Docket/issues/80) |
| 034 | 340 | [#82 R1-REG-004-B](https://github.com/Cooper2Rich/Docket/issues/82) | Confirm deterministic admission and waitlist recommendations | [#81 R1-REG-003-B](https://github.com/Cooper2Rich/Docket/issues/81) |
| 035 | 350 | [#83 R1-REG-004-C](https://github.com/Cooper2Rich/Docket/issues/83) | Review Accommodation Requests through scoped decisions | [#82 R1-REG-004-B](https://github.com/Cooper2Rich/Docket/issues/82) |
| 036 | 360 | [#84 R1-REG-004-D](https://github.com/Cooper2Rich/Docket/issues/84) | Disclose and revoke minimal accommodation instructions | [#83 R1-REG-004-C](https://github.com/Cooper2Rich/Docket/issues/83) |
| 037 | 370 | [#85 R1-CMP-002-A](https://github.com/Cooper2Rich/Docket/issues/85) | Authorize assessment attempts and verify provider deliveries | [#84 R1-REG-004-D](https://github.com/Cooper2Rich/Docket/issues/84) |
| 038 | 380 | [#86 R1-CMP-002-B](https://github.com/Cooper2Rich/Docket/issues/86) | Calculate versioned qualifications, retakes, and tier test-outs | [#85 R1-CMP-002-A](https://github.com/Cooper2Rich/Docket/issues/85) |
| 039 | 390 | [#87 R1-CMP-002-C](https://github.com/Cooper2Rich/Docket/issues/87) | Operate Quick Assessments and tournament-local tier grants | [#86 R1-CMP-002-B](https://github.com/Cooper2Rich/Docket/issues/86) |
| 040 | 400 | [#88 R1-CMP-002-D](https://github.com/Cooper2Rich/Docket/issues/88) | Publish Judge profiles and minimize assessment access and retention | [#87 R1-CMP-002-C](https://github.com/Cooper2Rich/Docket/issues/87) |
| 041 | 410 | [#89 R1-CMP-003-A](https://github.com/Cooper2Rich/Docket/issues/89) | Accept and project the current Judge Pool | [#88 R1-CMP-002-D](https://github.com/Cooper2Rich/Docket/issues/88) |
| 042 | 420 | [#90 R1-CMP-003-B](https://github.com/Cooper2Rich/Docket/issues/90) | Account for School-supplied Judges and obligation deficits | [#89 R1-CMP-003-A](https://github.com/Cooper2Rich/Docket/issues/89) |
| 043 | 430 | [#91 R1-CMP-003-C](https://github.com/Cooper2Rich/Docket/issues/91) | Withdraw Judges and retain restricted reliability outcomes | [#90 R1-CMP-003-B](https://github.com/Cooper2Rich/Docket/issues/90) |
| 044 | 440 | [#92 R1-CMP-004-A](https://github.com/Cooper2Rich/Docket/issues/92) | Validate Judge conflicts and publish the striking policy | [#91 R1-CMP-003-C](https://github.com/Cooper2Rich/Docket/issues/91) |
| 045 | 450 | [#93 R1-CMP-004-B](https://github.com/Cooper2Rich/Docket/issues/93) | Approve timed Judge strikes and governed outage exceptions | [#92 R1-CMP-004-A](https://github.com/Cooper2Rich/Docket/issues/92) |
| 046 | 460 | [#94 R1-CMP-012-A](https://github.com/Cooper2Rich/Docket/issues/94) | Validate and preview declarative standings policies | [#93 R1-CMP-004-B](https://github.com/Cooper2Rich/Docket/issues/93) |
| 047 | 470 | [#95 R1-CMP-013-A](https://github.com/Cooper2Rich/Docket/issues/95) | Validate and preview advancement policy and cut ties | [#94 R1-CMP-012-A](https://github.com/Cooper2Rich/Docket/issues/94) |
| 048 | 480 | [#96 R1-CMP-015-A](https://github.com/Cooper2Rich/Docket/issues/96) | Validate and accept the two supported award families | [#95 R1-CMP-013-A](https://github.com/Cooper2Rich/Docket/issues/95) |
| 049 | 490 | [#97 R1-CMP-006-A](https://github.com/Cooper2Rich/Docket/issues/97) | Configure per-round pairing methods and lockable policy | [#96 R1-CMP-015-A](https://github.com/Cooper2Rich/Docket/issues/96) |
| 050 | 500 | [#98 R1-CMP-001-A](https://github.com/Cooper2Rich/Docket/issues/98) | Generate reproducible native schedule candidates | [#97 R1-CMP-006-A](https://github.com/Cooper2Rich/Docket/issues/97) |
| 051 | 510 | [#99 R1-CMP-001-B](https://github.com/Cooper2Rich/Docket/issues/99) | Select and publish a schedule with the pairing-policy lock | [#98 R1-CMP-001-A](https://github.com/Cooper2Rich/Docket/issues/98) |
| 052 | 520 | [#100 R1-CMP-001-C](https://github.com/Cooper2Rich/Docket/issues/100) | Provide Event Workspaces and the personal tournament agenda | [#99 R1-CMP-001-B](https://github.com/Cooper2Rich/Docket/issues/99) |
| 053 | 530 | [#101 R1-CMP-005-A](https://github.com/Cooper2Rich/Docket/issues/101) | Recommend and sign off eligible Judge and room assignments | [#100 R1-CMP-001-C](https://github.com/Cooper2Rich/Docket/issues/100) |
| 054 | 540 | [#102 R1-CMP-006-B](https://github.com/Cooper2Rich/Docket/issues/102) | Generate random, preset, seeded and round-robin preliminaries | [#101 R1-CMP-005-A](https://github.com/Cooper2Rich/Docket/issues/101) |
| 055 | 550 | [#103 R1-CMP-006-C](https://github.com/Cooper2Rich/Docket/issues/103) | Calculate internal standings and power pairings | [#102 R1-CMP-006-B](https://github.com/Cooper2Rich/Docket/issues/102) |
| 056 | 560 | [#104 R1-CMP-006-D](https://github.com/Cooper2Rich/Docket/issues/104) | Construct fully manual pairings through the same validator | [#103 R1-CMP-006-C](https://github.com/Cooper2Rich/Docket/issues/103) |
| 057 | 570 | [#105 R1-CMP-007-A](https://github.com/Cooper2Rich/Docket/issues/105) | Approve and publish exact pairings with atomic policy locks | [#104 R1-CMP-006-D](https://github.com/Cooper2Rich/Docket/issues/104) |
| 058 | 580 | [#106 R1-CMP-007-B](https://github.com/Cooper2Rich/Docket/issues/106) | Correct unstarted pairings and emergency pre-start policy errors | [#105 R1-CMP-007-A](https://github.com/Cooper2Rich/Docket/issues/105) |
| 059 | 590 | [#107 R1-REG-003-C](https://github.com/Cooper2Rich/Docket/issues/107) | Restore Entries without bypassing admission or pairing history | [#106 R1-CMP-007-B](https://github.com/Cooper2Rich/Docket/issues/106) |
| 060 | 600 | [#108 R1-CMP-001-D](https://github.com/Cooper2Rich/Docket/issues/108) | Publish and acknowledge schedule revisions and reversals | [#107 R1-REG-003-C](https://github.com/Cooper2Rich/Docket/issues/107) |
| 061 | 610 | [#109 R1-CMP-001-E](https://github.com/Cooper2Rich/Docket/issues/109) | Apply accommodations and cross-entry holds to live schedules | [#108 R1-CMP-001-D](https://github.com/Cooper2Rich/Docket/issues/108) |
| 062 | 620 | [#110 R1-CMP-005-B](https://github.com/Cooper2Rich/Docket/issues/110) | Confirm changed and emergency assignments without proxy acknowledgment | [#109 R1-CMP-001-E](https://github.com/Cooper2Rich/Docket/issues/109) |
| 063 | 630 | [#111 R1-CMP-009-A](https://github.com/Cooper2Rich/Docket/issues/111) | Author and review platform ballot rubrics | [#110 R1-CMP-005-B](https://github.com/Cooper2Rich/Docket/issues/110) |
| 064 | 640 | [#112 R1-CMP-009-B](https://github.com/Cooper2Rich/Docket/issues/112) | Pin rubric versions at the first authorized cohort start | [#111 R1-CMP-009-A](https://github.com/Cooper2Rich/Docket/issues/111) |
| 065 | 650 | [#113 R1-CMP-008-A](https://github.com/Cooper2Rich/Docket/issues/113) | Run round check-in and immutable start and completion transitions | [#112 R1-CMP-009-B](https://github.com/Cooper2Rich/Docket/issues/112) |
| 066 | 660 | [#114 R1-CMP-008-B](https://github.com/Cooper2Rich/Docket/issues/114) | Classify Competitor and Judge No-Shows with contact evidence | [#113 R1-CMP-008-A](https://github.com/Cooper2Rich/Docket/issues/113) |
| 067 | 670 | [#115 R1-CMP-008-C](https://github.com/Cooper2Rich/Docket/issues/115) | Resolve timely Competitor No-Show disputes | [#114 R1-CMP-008-B](https://github.com/Cooper2Rich/Docket/issues/114) |
| 068 | 680 | [#116 R1-CMP-008-D](https://github.com/Cooper2Rich/Docket/issues/116) | Sign off replacements and administrative No-Show outcomes | [#115 R1-CMP-008-C](https://github.com/Cooper2Rich/Docket/issues/115) |
| 069 | 690 | [#117 R1-CMP-009-C](https://github.com/Cooper2Rich/Docket/issues/117) | Submit and lock competitive ballots with retry safety | [#116 R1-CMP-008-D](https://github.com/Cooper2Rich/Docket/issues/116) |
| 070 | 700 | [#118 R1-CMP-009-D](https://github.com/Cooper2Rich/Docket/issues/118) | Escalate missing ballots and maintain local assignment holds | [#117 R1-CMP-009-C](https://github.com/Cooper2Rich/Docket/issues/117) |
| 071 | 710 | [#119 R1-CMP-010-A](https://github.com/Cooper2Rich/Docket/issues/119) | Resolve independent panel ballots and scoring provenance | [#118 R1-CMP-009-D](https://github.com/Cooper2Rich/Docket/issues/118) |
| 072 | 720 | [#120 R1-CMP-010-B](https://github.com/Cooper2Rich/Docket/issues/120) | Draft and publish feedback under the hard seven-day deadline | [#119 R1-CMP-010-A](https://github.com/Cooper2Rich/Docket/issues/119) |
| 073 | 730 | [#121 R1-CMP-010-C](https://github.com/Cooper2Rich/Docket/issues/121) | Project historical School feedback and calculation dashboards | [#120 R1-CMP-010-B](https://github.com/Cooper2Rich/Docket/issues/120) |
| 074 | 740 | [#122 R1-CMP-010-D](https://github.com/Cooper2Rich/Docket/issues/122) | Restrict unsafe feedback with independent reconsideration | [#121 R1-CMP-010-C](https://github.com/Cooper2Rich/Docket/issues/121) |
| 075 | 750 | [#123 R1-CMP-011-A](https://github.com/Cooper2Rich/Docket/issues/123) | Reopen results with Judge or evidenced staff attribution | [#122 R1-CMP-010-D](https://github.com/Cooper2Rich/Docket/issues/122) |
| 076 | 760 | [#124 R1-CMP-011-B](https://github.com/Cooper2Rich/Docket/issues/124) | Correct completed decisions and apply scoped disqualification | [#123 R1-CMP-011-A](https://github.com/Cooper2Rich/Docket/issues/123) |
| 077 | 770 | [#125 R1-CMP-011-C](https://github.com/Cooper2Rich/Docket/issues/125) | Resolve downstream conflicts without rewriting played rounds | [#124 R1-CMP-011-B](https://github.com/Cooper2Rich/Docket/issues/124) |
| 078 | 780 | [#126 R1-CMP-011-D](https://github.com/Cooper2Rich/Docket/issues/126) | Resolve pinned-rubric defects through governed rulings | [#125 R1-CMP-011-C](https://github.com/Cooper2Rich/Docket/issues/125) |
| 079 | 790 | [#127 R1-CMP-012-B](https://github.com/Cooper2Rich/Docket/issues/127) | Publish checkpointed standings with School-only breakdowns | [#126 R1-CMP-011-D](https://github.com/Cooper2Rich/Docket/issues/126) |
| 080 | 800 | [#128 R1-CMP-012-C](https://github.com/Cooper2Rich/Docket/issues/128) | Govern emergency standings amendments | [#127 R1-CMP-012-B](https://github.com/Cooper2Rich/Docket/issues/127) |
| 081 | 810 | [#129 R1-CMP-013-B](https://github.com/Cooper2Rich/Docket/issues/129) | Approve and publish the actual Advancement Field | [#128 R1-CMP-012-C](https://github.com/Cooper2Rich/Docket/issues/128) |
| 082 | 820 | [#130 R1-CMP-013-C](https://github.com/Cooper2Rich/Docket/issues/130) | Correct advancement before and after elimination starts | [#129 R1-CMP-013-B](https://github.com/Cooper2Rich/Docket/issues/129) |
| 083 | 830 | [#131 R1-CMP-014-A](https://github.com/Cooper2Rich/Docket/issues/131) | Build canonical seeded elimination brackets and sides | [#130 R1-CMP-013-C](https://github.com/Cooper2Rich/Docket/issues/130) |
| 084 | 840 | [#132 R1-CMP-014-B](https://github.com/Cooper2Rich/Docket/issues/132) | Enforce the versioned two-person elimination start gate | [#131 R1-CMP-014-A](https://github.com/Cooper2Rich/Docket/issues/131) |
| 085 | 850 | [#133 R1-CMP-014-C](https://github.com/Cooper2Rich/Docket/issues/133) | Handle documented gate exceptions and escaped starts | [#132 R1-CMP-014-B](https://github.com/Cooper2Rich/Docket/issues/132) |
| 086 | 860 | [#134 R1-CMP-015-B](https://github.com/Cooper2Rich/Docket/issues/134) | Calculate auditable placement and preliminary Speaker awards | [#133 R1-CMP-014-C](https://github.com/Cooper2Rich/Docket/issues/133) |
| 087 | 870 | [#135 R1-CMP-015-C](https://github.com/Cooper2Rich/Docket/issues/135) | Amend awards with versioned impact and final-publication coupling | [#134 R1-CMP-015-B](https://github.com/Cooper2Rich/Docket/issues/134) |
| 088 | 880 | [#136 R1-CMP-016-A](https://github.com/Cooper2Rich/Docket/issues/136) | Assess Final Results readiness across all competitive inputs | [#135 R1-CMP-015-C](https://github.com/Cooper2Rich/Docket/issues/135) |
| 089 | 890 | [#137 R1-CMP-016-B](https://github.com/Cooper2Rich/Docket/issues/137) | Approve and publish unified Final Results | [#136 R1-CMP-016-A](https://github.com/Cooper2Rich/Docket/issues/136) |
| 090 | 900 | [#138 R1-TRN-004-A](https://github.com/Cooper2Rich/Docket/issues/138) | Preview and execute Owner-only Tournament Closure | [#137 R1-CMP-016-B](https://github.com/Cooper2Rich/Docket/issues/137) |
| 091 | 910 | [#139 R1-TRN-004-B](https://github.com/Cooper2Rich/Docket/issues/139) | Guard every Closed-state mutation boundary | [#138 R1-TRN-004-A](https://github.com/Cooper2Rich/Docket/issues/138) |
| 092 | 920 | [#140 R1-PUB-001-A](https://github.com/Cooper2Rich/Docket/issues/140) | Serve permanent public archives and authorized restricted history | [#139 R1-TRN-004-B](https://github.com/Cooper2Rich/Docket/issues/139) |
| 093 | 930 | [#141 R1-PUB-001-B](https://github.com/Cooper2Rich/Docket/issues/141) | Apply objective post-Closure No-Show corrections within 168 hours | [#140 R1-PUB-001-A](https://github.com/Cooper2Rich/Docket/issues/140) |
| 094 | 940 | [#142 R1-PUB-001-C](https://github.com/Cooper2Rich/Docket/issues/142) | Correct mistaken represented-School attribution with preserved history | [#141 R1-PUB-001-B](https://github.com/Cooper2Rich/Docket/issues/141), [#48 GATE-ATTRIBUTION](https://github.com/Cooper2Rich/Docket/issues/48) |
| 095 | 950 | [#143 R1-IDA-001-C](https://github.com/Cooper2Rich/Docket/issues/143) | Recover Clerk linkage with independent evidence and review | [#142 R1-PUB-001-C](https://github.com/Cooper2Rich/Docket/issues/142) |
| 096 | 960 | [#144 R1-IDA-001-D](https://github.com/Cooper2Rich/Docket/issues/144) | Suspend Accounts with independent review and bounded extensions | [#143 R1-IDA-001-C](https://github.com/Cooper2Rich/Docket/issues/143) |
| 097 | 970 | [#145 R1-IDA-001-E](https://github.com/Cooper2Rich/Docket/issues/145) | Deactivate Accounts without abandoning duties or rewriting identity | [#144 R1-IDA-001-D](https://github.com/Cooper2Rich/Docket/issues/144) |
| 098 | 980 | [#146 R1-GOV-001-A](https://github.com/Cooper2Rich/Docket/issues/146) | Operate dual-approved scoped Legal Holds | [#145 R1-IDA-001-E](https://github.com/Cooper2Rich/Docket/issues/145) |
| 099 | 990 | [#147 R1-GOV-001-B](https://github.com/Cooper2Rich/Docket/issues/147) | Enforce class-specific deletion across storage and projections | [#146 R1-GOV-001-A](https://github.com/Cooper2Rich/Docket/issues/146) |
| 100 | 1000 | [#148 R1-GOV-001-C](https://github.com/Cooper2Rich/Docket/issues/148) | Make backup expiry and restoration honor privacy deadlines | [#147 R1-GOV-001-B](https://github.com/Cooper2Rich/Docket/issues/147) |
| 101 | 1010 | [#149 R1-GOV-001-D](https://github.com/Cooper2Rich/Docket/issues/149) | Verify tamper-evident attributed audit and audience retention | [#148 R1-GOV-001-C](https://github.com/Cooper2Rich/Docket/issues/148) |
| 102 | 1020 | [#150 R1-GOV-002-A](https://github.com/Cooper2Rich/Docket/issues/150) | Expose only typed, evidenced support operations | [#149 R1-GOV-001-D](https://github.com/Cooper2Rich/Docket/issues/149) |
| 103 | 1030 | [#151 R1-GOV-002-B](https://github.com/Cooper2Rich/Docket/issues/151) | Review identity and assessment integrity without rewriting scores | [#150 R1-GOV-002-A](https://github.com/Cooper2Rich/Docket/issues/150) |
| 104 | 1040 | [#152 R1-GOV-002-C](https://github.com/Cooper2Rich/Docket/issues/152) | Enforce security boundaries and degraded-service behavior | [#151 R1-GOV-002-B](https://github.com/Cooper2Rich/Docket/issues/151) |
| 105 | 1050 | [#153 R1-CMP-002-E](https://github.com/Cooper2Rich/Docket/issues/153) | Validate the real assessment provider and approved scoring policy | [#152 R1-GOV-002-C](https://github.com/Cooper2Rich/Docket/issues/152), [#44 GATE-ASSESSMENT](https://github.com/Cooper2Rich/Docket/issues/44) |
| 106 | 1060 | [#154 R1-REL-001-A](https://github.com/Cooper2Rich/Docket/issues/154) | Verify the full multi-actor tournament journey | [#153 R1-CMP-002-E](https://github.com/Cooper2Rich/Docket/issues/153) |
| 107 | 1070 | [#155 R1-REL-001-B](https://github.com/Cooper2Rich/Docket/issues/155) | Verify corrections, recovery and privacy across the whole tournament | [#154 R1-REL-001-A](https://github.com/Cooper2Rich/Docket/issues/154) |
| 108 | 1080 | [#156 R1-REL-001-C](https://github.com/Cooper2Rich/Docket/issues/156) | Verify supported browsers and accessible actor experiences | [#155 R1-REL-001-B](https://github.com/Cooper2Rich/Docket/issues/155), [#45 GATE-REVIEW](https://github.com/Cooper2Rich/Docket/issues/45) |
| 109 | 1090 | [#157 R1-REL-002-A](https://github.com/Cooper2Rich/Docket/issues/157) | Provision isolated AWS and Vercel environments through Terraform | [#156 R1-REL-001-C](https://github.com/Cooper2Rich/Docket/issues/156), [#46 GATE-ENVIRONMENTS](https://github.com/Cooper2Rich/Docket/issues/46) |
| 110 | 1100 | [#158 R1-REL-002-B](https://github.com/Cooper2Rich/Docket/issues/158) | Deploy immutable artifacts with migration and rollback controls | [#157 R1-REL-002-A](https://github.com/Cooper2Rich/Docket/issues/157) |
| 111 | 1110 | [#159 R1-REL-002-C](https://github.com/Cooper2Rich/Docket/issues/159) | Operate telemetry, actionable alerts and delivery recovery | [#158 R1-REL-002-B](https://github.com/Cooper2Rich/Docket/issues/158) |
| 112 | 1120 | [#160 R1-REL-002-D](https://github.com/Cooper2Rich/Docket/issues/160) | Prove representative capacity and burst recovery | [#159 R1-REL-002-C](https://github.com/Cooper2Rich/Docket/issues/159) |
| 113 | 1130 | [#161 R1-REL-002-E](https://github.com/Cooper2Rich/Docket/issues/161) | Rehearse disaster recovery and continuity objectives | [#160 R1-REL-002-D](https://github.com/Cooper2Rich/Docket/issues/160) |
| 114 | 1140 | [#162 R1-REL-003-A](https://github.com/Cooper2Rich/Docket/issues/162) | Assemble the current release evidence and operator handoff | [#161 R1-REL-002-E](https://github.com/Cooper2Rich/Docket/issues/161) |
| 115 | 1150 | [#163 R1-REL-003-B](https://github.com/Cooper2Rich/Docket/issues/163) | Record the explicit production go or no-go decision | [#162 R1-REL-003-A](https://github.com/Cooper2Rich/Docket/issues/162), [#47 GATE-RELEASE](https://github.com/Cooper2Rich/Docket/issues/47) |

## Tracking groups

These preserve the original objectives. Their child steps define the implementation sequence; do not run a tracking group as a Ralph job. Groups below are ordered by their earliest child step.

| Group issue | Objective | Child steps |
| --- | --- | --- |
| [#1 R1-FND-001](https://github.com/Cooper2Rich/Docket/issues/1) | Scaffold the pinned monorepo | 001, 002 |
| [#2 R1-FND-002](https://github.com/Cooper2Rich/Docket/issues/2) | Implement reproducible local infrastructure and configuration | 003, 004 |
| [#3 R1-FND-003](https://github.com/Cooper2Rich/Docket/issues/3) | Implement module-owned migration infrastructure | 005, 006 |
| [#4 R1-FND-004](https://github.com/Cooper2Rich/Docket/issues/4) | Implement contract generation and traceability validation | 007, 008 |
| [#5 R1-FND-005](https://github.com/Cooper2Rich/Docket/issues/5) | Implement required GitHub Actions checks | 009, 010 |
| [#6 R1-IDA-001](https://github.com/Cooper2Rich/Docket/issues/6) | Implement Clerk and fixed authentication evidence with Docket Sessions | 011, 012, 095, 096, 097 |
| [#7 R1-IDA-002](https://github.com/Cooper2Rich/Docket/issues/7) | Implement Active Role Context and authorization core | 013, 016 |
| [#11 R1-COM-001](https://github.com/Cooper2Rich/Docket/issues/11) | Implement transactional outbox and required notification delivery | 014, 015 |
| [#8 R1-SCH-001](https://github.com/Cooper2Rich/Docket/issues/8) | Implement canonical Schools and Membership authority | 017, 018, 019 |
| [#17 R1-REG-004](https://github.com/Cooper2Rich/Docket/issues/17) | Implement admission, eligibility, minor authorization, and accommodations | 020, 034, 035, 036 |
| [#9 R1-SCH-002](https://github.com/Cooper2Rich/Docket/issues/9) | Implement Competitor School Affiliation | 021, 022 |
| [#10 R1-TRN-001](https://github.com/Cooper2Rich/Docket/issues/10) | Implement authorized Tournament creation | 023, 024 |
| [#13 R1-TRN-002](https://github.com/Cooper2Rich/Docket/issues/13) | Implement Ruleset and Tournament configuration governance | 025, 026 |
| [#14 R1-TRN-003](https://github.com/Cooper2Rich/Docket/issues/14) | Implement Tournament Invitation publication | 027, 028 |
| [#15 R1-REG-002](https://github.com/Cooper2Rich/Docket/issues/15) | Implement Registration Policy and additional-field schema | 029, 030 |
| [#12 R1-REG-001](https://github.com/Cooper2Rich/Docket/issues/12) | Complete the walking skeleton with Entry submission | 031 |
| [#16 R1-REG-003](https://github.com/Cooper2Rich/Docket/issues/16) | Implement Tournament Rosters and complete Entry lifecycle | 032, 033, 059 |
| [#19 R1-CMP-002](https://github.com/Cooper2Rich/Docket/issues/19) | Implement Judge qualification-provider consumption | 037, 038, 039, 040, 105 |
| [#20 R1-CMP-003](https://github.com/Cooper2Rich/Docket/issues/20) | Implement Judge Pool Participation and source obligations | 041, 042, 043 |
| [#21 R1-CMP-004](https://github.com/Cooper2Rich/Docket/issues/21) | Implement Judge conflicts and striking | 044, 045 |
| [#29 R1-CMP-012](https://github.com/Cooper2Rich/Docket/issues/29) | Implement standings configuration, calculation, and publication | 046, 079, 080 |
| [#30 R1-CMP-013](https://github.com/Cooper2Rich/Docket/issues/30) | Implement Advancement Plan and Field | 047, 081, 082 |
| [#32 R1-CMP-015](https://github.com/Cooper2Rich/Docket/issues/32) | Implement Award Plan and Results | 048, 086, 087 |
| [#23 R1-CMP-006](https://github.com/Cooper2Rich/Docket/issues/23) | Implement preliminary Pairing generation | 049, 054, 055, 056 |
| [#18 R1-CMP-001](https://github.com/Cooper2Rich/Docket/issues/18) | Implement native schedules and rooms | 050, 051, 052, 060, 061 |
| [#22 R1-CMP-005](https://github.com/Cooper2Rich/Docket/issues/22) | Implement Judge and room assignment | 053, 062 |
| [#24 R1-CMP-007](https://github.com/Cooper2Rich/Docket/issues/24) | Implement Pairing approval, publication, and revision | 057, 058 |
| [#26 R1-CMP-009](https://github.com/Cooper2Rich/Docket/issues/26) | Implement rubric-pinned Ballot submission | 063, 064, 069, 070 |
| [#25 R1-CMP-008](https://github.com/Cooper2Rich/Docket/issues/25) | Implement live rounds, No-Shows, and replacements | 065, 066, 067, 068 |
| [#27 R1-CMP-010](https://github.com/Cooper2Rich/Docket/issues/27) | Implement panels and Feedback lifecycle | 071, 072, 073, 074 |
| [#28 R1-CMP-011](https://github.com/Cooper2Rich/Docket/issues/28) | Implement result correction and rubric-blocked administration | 075, 076, 077, 078 |
| [#31 R1-CMP-014](https://github.com/Cooper2Rich/Docket/issues/31) | Implement elimination bracket and verification gates | 083, 084, 085 |
| [#33 R1-CMP-016](https://github.com/Cooper2Rich/Docket/issues/33) | Implement Final Results approval and publication source | 088, 089 |
| [#34 R1-TRN-004](https://github.com/Cooper2Rich/Docket/issues/34) | Implement Competitive Completion and Tournament Closure | 090, 091 |
| [#35 R1-PUB-001](https://github.com/Cooper2Rich/Docket/issues/35) | Implement archive, publication history, and post-Closure correction | 092, 093, 094 |
| [#36 R1-GOV-001](https://github.com/Cooper2Rich/Docket/issues/36) | Complete privileged audit, retention, and Legal Hold | 098, 099, 100, 101 |
| [#37 R1-GOV-002](https://github.com/Cooper2Rich/Docket/issues/37) | Complete security, integrity, support, and degraded-operation controls | 102, 103, 104 |
| [#38 R1-REL-001](https://github.com/Cooper2Rich/Docket/issues/38) | Prove the complete seeded Release 1 tournament | 106, 107, 108 |
| [#39 R1-REL-002](https://github.com/Cooper2Rich/Docket/issues/39) | Prove load, recovery, and deployment gates | 109, 110, 111, 112, 113 |
| [#40 R1-REL-003](https://github.com/Cooper2Rich/Docket/issues/40) | Promote Release 1 to production readiness | 114, 115 |

## Decision and external gates

Resolve these before their affected leaves. The graph-linked step below shows each explicit gate edge; private-repository protection and ordinary PR review also apply at activation/integration.

| Gate issue | Required resolution | Directly gated steps |
| --- | --- | --- |
| [#41 GATE-BOOTSTRAP](https://github.com/Cooper2Rich/Docket/issues/41) | Choose a protected foundation integration policy | 001 |
| [#42 GATE-GITHUB](https://github.com/Cooper2Rich/Docket/issues/42) | Enable and verify protection for the private repository | 010 |
| [#43 GATE-RULESET](https://github.com/Cooper2Rich/Docket/issues/43) | Supply the adopted Release 1 Lincoln-Douglas Ruleset | 025 |
| [#44 GATE-ASSESSMENT](https://github.com/Cooper2Rich/Docket/issues/44) | Approve real assessment provider and scoring policy | 105 |
| [#45 GATE-REVIEW](https://github.com/Cooper2Rich/Docket/issues/45) | Provide independent review and accessibility evidence | 108 |
| [#46 GATE-ENVIRONMENTS](https://github.com/Cooper2Rich/Docket/issues/46) | Provision authorized deployment accounts and operational ownership | 109 |
| [#47 GATE-RELEASE](https://github.com/Cooper2Rich/Docket/issues/47) | Record owner approval of the exact production candidate | 115 |
| [#48 GATE-ATTRIBUTION](https://github.com/Cooper2Rich/Docket/issues/48) | Clarify the Closed-state boundary for School attribution correction | 094 |

## Verification and maintenance

Verified on September 18, 2026: every dependency precedes its dependent, all 115 native sub-issue positions match the graph, all 122 native blocking relationships match, and the oldest-first implementation view contains exactly the 115 leaves in graph order. Existing issue bodies, IDs, statuses and dependencies are unchanged.

Keep this index synchronized after an approved graph change. The graph remains authoritative. [GitHub sorting documentation](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests) explains how shareable filtered views work.
