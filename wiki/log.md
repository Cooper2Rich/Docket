# Wiki Log

This file is append-only. Each entry records a completed wiki operation.

## [2026-08-31] schema | Initialize the LLM wiki

- Established the `raw/`, `wiki/`, and `AGENTS.md` layers.
- Added the content index and chronological log.
- Defined ingest, query, and lint workflows for future updates.

## [2026-08-31] schema | Enable automatic context checkpoints

- Authorized automatic wiki updates when durable Docket knowledge changes.
- Defined major milestones and long or tool-heavy phases as observable checkpoint triggers.
- Limited checkpoints to useful project state rather than raw conversation transcripts.

## [2026-08-31] ingest | DOCKET project context

- Preserved `DOCKET_PROJECT_CONTEXT.md` as immutable curated evidence in `raw/`.
- Added the settled brand identity, exact mission and vision, product intent, product principles, provisional scope, and current knowledge gaps to [[project-context]].
- Recorded the project owner's competitive objective to replace Tabroom as the leading debate tournament hosting software.

## [2026-08-31] checkpoint | Backend-first milestone

- Recorded the decision to complete one end-to-end tournament lifecycle for a single debate format before expanding backend breadth or beginning the main UI build.
- Defined the lifecycle stages, milestone acceptance boundary, and immediate open decisions in [[backend-roadmap]].

## [2026-08-31] checkpoint | First supported debate format

- Recorded Lincoln-Douglas Debate as the first format for the end-to-end backend slice in [[backend-roadmap]].
- Initialized the domain glossary in `CONTEXT.md` with the canonical event name and definition.

## [2026-08-31] checkpoint | Initial competition level

- Scoped the first backend slice to United States high-school tournaments in [[backend-roadmap]].
- Left other competition levels and jurisdictions as explicit future extensions.

## [2026-08-31] checkpoint | Ruleset governance

- Recorded immutable, versioned NSDA-derived Rulesets with explicit, validated, audited Tournament Overrides in [[backend-roadmap]].
- Added `Ruleset` and `Tournament Override` to the domain glossary.
- Created ADR 0001 to preserve the tradeoff and its architectural consequences.

## [2026-08-31] checkpoint | Tournament Override boundary

- Limited Tournament Overrides to an explicit operational allowlist in [[backend-roadmap]].
- Locked the defining event structure and Docket's integrity, authorization, security, and audit controls against tournament overrides.
- Updated ADR 0001 with the accepted override categories and constraints.

## [2026-08-31] checkpoint | Rules lock and Emergency Amendments

- Locked the adopted Ruleset and Tournament Overrides at first-round Pairing Publication in [[backend-roadmap]].
- Required impact preview, confirmation, reason, and a permanent audit entry for each post-lock Emergency Amendment.
- Added `Pairing Publication` and `Emergency Amendment` to the domain glossary and extended ADR 0001.

## [2026-08-31] checkpoint | Ruleset adoption and migration

- Made the latest verified Ruleset the default for new tournaments while leaving existing tournaments pinned in [[backend-roadmap]].
- Allowed only explicit, administrator-authorized, pre-lock Ruleset Migrations after review of a version diff and validation report.
- Added `Ruleset Migration` to the domain glossary and completed the migration consequences in ADR 0001.

## [2026-08-31] checkpoint | First-slice actors and account boundary

- Added the authenticated and unauthenticated first-slice actors to [[access-model]] and the domain glossary.
- Deferred Competitor accounts while preserving Competitor records managed by Coaches.
- Created ADR 0002 to record the privacy and migration tradeoff behind the Competitor-account boundary.

## [2026-08-31] checkpoint | Lincoln-Douglas Entry identity

- Defined a tournament-specific Lincoln-Douglas Entry as exactly one Competitor representing exactly one School in [[registration-model]].
- Prohibited duplicate active Entries for the same Competitor and tournament.
- Required withdrawals and School corrections to preserve audit and historical records.
- Added `School` and `Entry` to the domain glossary.

## [2026-08-31] checkpoint | School-scoped Competitor identity

- Defined Competitors as School-owned roster records reusable within that School in [[registration-model]] and the domain glossary.
- Prohibited automatic matching, merging, or private-data exposure across Schools.
- Required transfers to create a new destination-School record while preserving the original history.
- Created ADR 0003 and aligned the deferred account-linking consequences in ADR 0002.

## [2026-08-31] checkpoint | Canonical School identity

- Defined Schools as canonical, platform-wide records with stable identifiers and historical aliases in [[registration-model]].
- Required unmatched institutions to remain Provisional Schools until verified.
- Required School Merges to redirect duplicates without rewriting Entries or deleting history.
- Added the terms to the domain glossary and created ADR 0004.

## [2026-09-01] checkpoint | Coach School Membership

- Required an explicit School Membership for every Coach-to-School authorization in [[access-model]].
- Allowed multiple memberships, controlled invitations, and Platform Administrator approval for the first School representative.
- Rejected email-domain-only access and required revocation to preserve historical actor attribution.
- Added `School Membership` to the domain glossary and linked the registration model to the access policy.

## [2026-09-01] checkpoint | School Verification and merge authority

- Restricted School Verification and School Merges to Platform Administrators in [[registration-model]] and [[access-model]].
- Allowed Coaches and Tournament Directors to submit evidence without approving platform-wide identity changes.
- Required authoritative evidence, an impact preview, a reason, audit attribution, and reversible redirects.
- Added `School Verification` to the domain glossary and extended ADR 0004.

## [2026-09-01] checkpoint | Prohibit administrator impersonation

- Prohibited Platform Administrators from impersonating another actor in [[access-model]].
- Required support to use attributed, reasoned, audited Support Actions and read-only diagnostics.
- Added `Support Action` to the domain glossary and created ADR 0005.

## [2026-09-01] checkpoint | Tabulation Staff delegation

- Required explicit per-tournament Tournament Staff Assignments and Tournament Permission Bundles in [[access-model]].
- Defined initial operational bundles and reserved governance actions for Tournament Directors.
- Required prospective revocation with preserved historical attribution.
- Added the delegation terms to the domain glossary and created ADR 0006.

## [2026-09-01] checkpoint | Tournament ownership and Directors

- Required exactly one Tournament Owner while permitting multiple additional Tournament Directors in [[access-model]].
- Reserved Director appointments, ownership transfer, and tournament closure for the Owner.
- Required recipient acceptance and permanent audit history for ownership transfer.
- Added `Tournament Owner` to the domain glossary and created ADR 0007.

## [2026-09-01] checkpoint | Tournament Owner recovery

- Required normal account recovery before Ownership Recovery in [[access-model]].
- Required an existing Director request, verified evidence, Owner notification, dual Platform Administrator approval, recipient acceptance, and permanent audit history for recovery.
- Added temporary, scoped, automatically expiring Emergency Authority Grants for active-tournament continuity.
- Added both recovery terms to the domain glossary and extended ADRs 0005 and 0007.

## [2026-09-01] checkpoint | School Membership roles

- Added School Manager, Roster Manager, Entry Manager, and Judge Manager roles to [[access-model]] and the domain glossary.
- Allowed one Coach to hold all roles and multiple Coaches to hold each non-Manager role.
- Required exactly one School Manager per School and reserved role assignment and membership management for that Manager.
- Created ADR 0008 to preserve the single-manager and composable-role structure.

## [2026-09-01] checkpoint | School Manager succession

- Required recipient-accepted, atomic, audited School Manager Transfers in [[access-model]].
- Required normal account recovery before evidence-backed, dual-Platform-Administrator School Manager Recovery.
- Allowed only explicit interim Support Actions and prohibited temporary or second School Managers.
- Added the succession terms to the domain glossary and extended ADRs 0005 and 0008.

## [2026-09-01] checkpoint | Ballot Result and Feedback separation

- Added the Judge assignment access lifecycle to [[access-model]].
- Separated locked Competitive Results from independently editable Ballot Feedback in [[ballot-model]].
- Allowed Ballot Submission without completed feedback and required Ballot Reopening only for competitive corrections.
- Added Ballot terminology to the domain glossary and created ADR 0009.

## [2026-09-01] checkpoint | Ballot Feedback deadline

- Added a pre-lock tournament-configurable Feedback Deadline to [[ballot-model]], defaulting to 72 hours after the final round.
- Added Feedback Deadline to the Tournament Override allowlist and required an Emergency Amendment for post-lock changes.
- Required an authorized, reasoned, audited Feedback Reopening for Judge edits after the deadline.
- Added `Feedback Deadline` and `Feedback Reopening` to the domain glossary and extended ADRs 0001 and 0009.

## [2026-09-01] checkpoint | Ballot Feedback publication

- Kept Feedback Drafts private to their Judge and required explicit Feedback Publication in [[ballot-model]].
- Made Published Feedback visible to active School Members for both Entries but never to Public Viewers.
- Preserved the last Published Feedback during later private revisions and prohibited automatic publication at the deadline.
- Added publication terms to the domain glossary and extended ADR 0009.

## [2026-09-01] checkpoint | Competitive Result fields

- Required one winning Entry and Ruleset-valid Speaker Points for both Competitors in a normal Lincoln-Douglas Competitive Result in [[ballot-model]].
- Imported Entry and side data from the published pairing and added assignment, range, precision, completeness, and duplicate-submission validation.
- Separated byes, forfeits, and other Administrative Outcomes into an authorized, reasoned, audited staff workflow.
- Added `Speaker Points` and `Administrative Outcome` to the domain glossary and extended ADR 0009.

## [2026-09-01] checkpoint | Competitive Result correction propagation

- Restricted Ballot Reopening and required a reason, impact preview, and confirmation in [[ballot-model]] and [[access-model]].
- Preserved original results through versioned Result Corrections and recomputed derived standings and advancement.
- Prohibited silent changes to published or completed later rounds and required explicit Downstream Conflict resolution.
- Added correction terms to the domain glossary and created ADR 0010.

## [2026-09-01] checkpoint | Result Correction submission

- Returned reopened Competitive Results to their original Judge for resubmission whenever possible in [[ballot-model]].
- Allowed Staff Result Corrections only with documented Judge confirmation or an Administrative Ruling.
- Required staff identity, evidence, and reason attribution and prohibited presenting a staff correction as a Judge submission.
- Added correction-authority terms to the domain glossary and extended ADR 0010.

## [2026-09-01] checkpoint | Downstream Conflict resolution

- Reserved Downstream Conflict resolution approval for Tournament Directors while allowing Tabulation Staff to prepare the impact analysis and plan.
- Required regeneration of unpublished artifacts, withdrawal and noticed republication of published-but-unstarted rounds, and preservation of started or completed rounds as played.
- Required Administrative Rulings for future competitive effects, versioned Correction Notices for final results, and permanent preservation of original history.
- Extended [[ballot-model]], [[access-model]], the domain glossary, and ADR 0010.

## [2026-09-01] checkpoint | Multi-objective tournament scheduling

- Added [[scheduling-model]] with three pre-tournament Schedule Candidates optimized separately for judge use, buffer time, and round efficiency.
- Made the selected candidate the Tournament Schedule and prohibited silent candidate combination or replacement.
- Required two correction-driven Schedule Revision Proposals optimized separately for time efficiency and judge use.
- Recorded the settled objective definitions and the unresolved meanings, authority boundaries, notices, and tie-breaking rules.

## [2026-09-01] checkpoint | Canonical Time-Efficiency Objective

- Unified the proposed Round-Efficiency and Time-Efficiency concepts in [[scheduling-model]].
- Adopted Time-Efficiency Objective as the canonical term for minimizing total elapsed tournament time and producing the earliest feasible finish.
- Applied the same objective to correction-driven revision proposals, where it minimizes remaining duration and added delay.

## [2026-09-01] checkpoint | Buffer optimization and Scheduled Breaks

- Defined Buffer-Time Objective in [[scheduling-model]] as maximizing the smallest recovery interval before distributing remaining buffer evenly within the tournament window.
- Added configurable Scheduled Breaks for lunch, dinner, and other tournament-wide pauses.
- Required every Schedule Candidate to preserve each Scheduled Break and excluded Scheduled Break duration from optimization buffer.
- Added the scheduling terms to the domain glossary and created ADR 0011.

## [2026-09-01] checkpoint | Assessment-based Judge qualification

- Added [[judge-qualification-model]] with required Judge Qualification Assessments and Qualified, Advanced, and Elimination-Qualified tiers.
- Made assessment completion a prerequisite for round assignment and retained availability and conflicts as hard constraints.
- Connected assessment-supported tiers to the Judge-Use Objective in [[scheduling-model]].
- Added qualification terms to the domain glossary and recorded the unresolved scoring, scope, validity, privacy, retake, and exception rules.

## [2026-09-01] checkpoint | Hybrid Judge Qualification Assessment

- Split the required assessment in [[judge-qualification-model]] into a scored Judge Competency Section and an unscored Judging Profile.
- Made competency determine assignment eligibility and the supported Judge Qualification Tier.
- Allowed the profile to improve assignment fit while prohibiting legitimate argument preferences from lowering competency or tier.
- Updated [[scheduling-model]], added the new domain terms, and created ADR 0012.

## [2026-09-01] checkpoint | Event-specific Judge qualification

- Made each Judge Qualification Assessment specific to one debate or speech event in [[judge-qualification-model]].
- Required a separate assessment before a Judge may work in a different event.
- Allowed a current Event Qualification to transfer across tournaments using compatible Ruleset versions.
- Added separate Tournament Judge Orientation for local overrides without changing qualification scores or tiers.
- Updated [[access-model]], the domain glossary, and ADR 0012.

## [2026-09-01] checkpoint | Event Qualification validity

- Limited each Event Qualification in [[judge-qualification-model]] to one competitive season.
- Required earlier reassessment only when a material event-Ruleset or assessment change makes prior qualification evidence incompatible.
- Exempted editorial changes from forced reassessment and preserved expired or superseded qualifications for historical assignments.
- Added Qualification Supersession to the domain glossary and extended ADR 0012.

## [2026-09-01] checkpoint | Automatic Judge tier assignment

- Required deterministic Judge Qualification Tier assignment from versioned, published Tier Scoring Bands in [[judge-qualification-model]].
- Made all Critical Competency Items on essential rules and ethics mandatory for any passing tier.
- Prohibited routine manual tier overrides and limited Qualification Review to appeals, approved accommodations, and assessment-administration errors.
- Required immutable original results and attributed corrected results, added the domain terms, and extended ADR 0012.

## [2026-09-01] checkpoint | Platform scoring and tournament tier requirements

- Made versioned, event-specific Tier Scoring Bands, Critical Competency Items, and tier meanings platform-controlled in [[judge-qualification-model]].
- Prohibited Tournament Owners, Directors, and Tabulation Staff from changing assessment scoring or Judge tiers.
- Allowed tournaments to configure Round Tier Requirements using existing tiers.
- Required [[scheduling-model]] to report an infeasible Judge pool instead of silently lowering a Round Tier Requirement.
- Added the domain term and extended ADRs 0011 and 0012.

## [2026-09-01] checkpoint | Current-tournament competitive priority

- Defined Round Competitiveness Priority in [[scheduling-model]] using only current-tournament structure, records, pairings, and advancement consequences.
- Prioritized elimination rounds increasingly toward the final, followed by top-record power pairings and Bubble Rounds.
- Prohibited School reputation, competitor fame, external rankings, and other-tournament results from influencing priority.
- Required Docket to reserve higher-tier capacity before pairings and calculate specific assignments when current data becomes available.
- Updated [[judge-qualification-model]], added the domain terms, and extended ADR 0011.

## [2026-09-01] checkpoint | Director-approved Schedule Selection

- Allowed Tabulation Staff with the Pairing operations bundle to compare candidates and prepare a recommendation in [[scheduling-model]].
- Reserved Schedule Selection and establishment of the Tournament Schedule for a Tournament Director in [[access-model]].
- Required Docket to retain all candidates, metrics, recommendations, the approving Director, reason, and selection time.
- Added Schedule Selection to the domain glossary and extended ADR 0011.

## [2026-09-01] checkpoint | Controlled Schedule Revision publication

- Allowed Pairing-authorized Tabulation Staff to prepare a Schedule Revision recommendation in [[scheduling-model]].
- Reserved Schedule Revision Approval for a Tournament Director in [[access-model]].
- Allowed the Director or Publication-authorized Tabulation Staff to publish only the exact approved proposal version.
- Prohibited automatic revision application and required immutable schedule versions, metrics, impact analysis, reasons, actors, and timestamps.
- Added the revision actions to the domain glossary and extended ADR 0011.

## [2026-09-01] checkpoint | Schedule Revision notices and acknowledgment

- Required immediate, delivery-tracked Schedule Revision Notices for all Directors, relevant Tabulation Staff, affected Judges, and active School Members for affected Entries.
- Required Assignment Acknowledgment only from Judges whose assignments changed.
- Treated unacknowledged Judge assignments as visibly escalated and unconfirmed while keeping School notices informational and non-blocking.
- Updated [[scheduling-model]] and [[access-model]], added the domain terms, and extended ADR 0011.

## [2026-09-01] checkpoint | Urgent Schedule Revision controls

- Rejected a hard minimum revision lead time in [[scheduling-model]].
- Added a Director-configurable Urgent Change Threshold defaulting to 30 minutes before the earliest affected round.
- Required explicit Director confirmation and a Judge Continuity Plan for an Urgent Schedule Revision.
- Preserved the prohibition on changing started rounds and created no emergency staff approval authority in [[access-model]].
- Added the urgent-revision domain terms and extended ADR 0011.

## [2026-09-01] checkpoint | Deterministic schedule tie-breaking

- Added a fixed Schedule Tie-Break Policy to [[scheduling-model]].
- Prioritized preserving the published schedule, minimizing assignment changes, balancing Judge workload and rest, and finishing earlier.
- Used stable internal identifiers only as the final reproducible comparison and prohibited randomness.
- Required policy-version, input, score, and tie-break-value retention, added the domain term, and extended ADR 0011.

## [2026-09-01] checkpoint | Tournament-local Judge tier grants

- Required a Judge to test into a higher scoring band to improve the platform Event Qualification tier in [[judge-qualification-model]].
- Allowed Tournament Directors and Judge-and-room-authorized Tabulation Staff to issue a higher Tournament Tier Grant for the current tournament only.
- Kept assessment scores and Event Qualification tiers unchanged outside the tournament and made every grant attributed, reasoned, expiring, and auditable.
- Updated [[scheduling-model]] to use an Effective Tournament Tier while retaining the assessment and grant sources separately.
- Explicitly narrowed the earlier prohibition on tournament tier changes, updated [[access-model]], added the domain terms, and extended ADRs 0011 and 0012.

## [2026-09-01] checkpoint | Discretionary qualification bypass

- Rejected the proposed assessed-tier and Critical Competency Item floor for Tournament Tier Grants in [[judge-qualification-model]].
- Allowed a Tournament Director or Judge-and-room-authorized Tabulation Staff member to confer any higher local tier after a nonpassing result at their discretion.
- Kept the platform score and Event Qualification unchanged and retained actor, reason, result, grant, time, and expiration history in [[access-model]].
- Recorded the remaining conflict with the earlier mandatory-assessment rule, updated the domain glossary, and extended ADR 0012.

## [2026-09-01] checkpoint | Debate-only requirement and Quick Judge Assessment

- Required a Full Judge Qualification Assessment for debate while making it optional but recommended for speech in [[judge-qualification-model]].
- Allowed Directors and Judge-and-room-authorized Tabulation Staff to authorize a Quick Judge Assessment when staffing requires moving a Judge into an unqualified debate event.
- Limited the resulting Temporary Debate Qualification to the authorized tournament days.
- Required post-tournament notice and eventual deletion of quick scores, detailed responses, and Judging Profile unless the full assessment is completed, while retaining minimal assignment-audit metadata.
- Resolved the earlier assessment-completion conflict for debate, updated [[access-model]] and [[scheduling-model]], added the domain terms, and extended ADR 0012.

## [2026-09-01] checkpoint | Dynamic Quick Assessment follow-up

- Set a 30-day Quick Assessment Follow-up Deadline with day-14 and day-27 reminders when the Judge has no future debate tournament.
- Replaced that deadline with two days before the next scheduled debate tournament when one exists.
- Required deletion of the prior detailed quick data and a new Quick Judge Assessment when the full assessment is not completed by the applicable deadline.
- Prohibited Temporary Debate Qualification reuse across tournaments in [[access-model]] and [[scheduling-model]].
- Added the deadline term to the domain glossary and extended ADR 0012.

## [2026-09-01] checkpoint | Full assessment replaces detailed quick data

- Made the Full Judge Qualification Assessment an independent source of scored responses and a new Judging Profile.
- Prohibited importing, merging, or using Quick Assessment scores, responses, or profiles in the full result.
- Required detailed quick data to be deleted immediately after full-assessment completion and made the resulting Event Qualification authoritative for future decisions.
- Preserved only the minimal Quick Assessment audit record needed to explain historical assignments in [[judge-qualification-model]] and ADR 0012.

## [2026-09-01] checkpoint | Judge qualification data visibility

- Allowed Judges to view all of their own assessment data while protecting platform answer keys, unpublished question banks, and other Judges' records.
- Limited Directors and Judge-and-room-authorized Tabulation Staff to operational qualification summaries, grant history, and the Published Judging Profile.
- Limited active School Members for assigned Entries to the Published Judging Profile after Pairing Publication and prohibited public access.
- Restricted detailed assessment evidence to purpose-limited, audited Platform Administrator Qualification Reviews in [[judge-qualification-model]], [[access-model]], and ADR 0012.

## [2026-09-01] checkpoint | Assessment retakes and external provider

- Required event-specific remediation and a 24-hour wait after a failed full assessment, with no more than two retakes in a rolling 30-day period.
- Allowed a currently qualified Judge one Tier Test-Out Attempt every 30 days and protected the current tier from lower or nonpassing test-out results.
- Preserved every attempt immutably while using the highest current valid result.
- Made a third-party Assessment Provider the initial testing interface and Docket the qualification and assignment-eligibility system of record in [[judge-qualification-model]], [[backend-roadmap]], ADR 0012, and ADR 0013.

## [2026-09-01] checkpoint | Signed assessment-result ingestion

- Required Docket to issue a single-use Assessment Attempt ID before provider-hosted testing.
- Required a signed, retryable provider webhook carrying linked identifiers, score, critical-item results, profile responses, and submitted answers while excluding the answer key.
- Required signature and identifier validation, idempotent duplicate handling, and rejection of conflicting or mismatched results.
- Made Docket's versioned scoring policy authoritative and prohibited provider tiers or ordinary manual score entry from creating qualifications in [[judge-qualification-model]] and ADR 0013.

## [2026-09-01] checkpoint | Assessment-provider delivery outage

- Required automatic provider webhook retries and allowed an attributed Platform Administrator to upload a provider-signed result file as an alternate transport.
- Applied the same signature, identity, version, attempt, and duplicate checks to both transports.
- Made unverified attempts Pending Verification with no new qualification, tier, or debate eligibility and prohibited staff or Tournament Tier Grants from bypassing assessment completion.
- Preserved separate existing valid qualifications and required tournament operations to use another eligible Judge until verification succeeds in [[judge-qualification-model]], [[scheduling-model]], and ADR 0013.

## [2026-09-01] checkpoint | Assessment-provider identity linking

- Required each authenticated Judge to initiate their own provider-hosted assessment from Docket through an opaque single-use attempt identifier.
- Created a one-to-one link from the first verified stable provider identity and prohibited names or email addresses from serving as authoritative identity keys.
- Blocked provider-originated or conflicting results from qualification processing pending an evidence-backed Platform Administrator Assessment Identity Review.
- Required versioned link corrections and prohibited silent movement of assessment or assignment history in [[judge-qualification-model]], [[access-model]], and ADR 0013.

## [2026-09-01] checkpoint | No assessment appeals

- Prohibited appeals of assessment results, scores, Critical Competency Item outcomes, and tiers.
- Prohibited staff-authored corrected results and required every different scored outcome to come from a new assessment attempt under the retake or test-out rules.
- Recast detailed Platform Administrator evidence access as an audited Assessment Integrity Review that may investigate but cannot change an outcome.
- Explicitly superseded the earlier appeal and corrected-result policy in [[judge-qualification-model]], [[access-model]], the domain glossary, and ADR 0012.

## [2026-09-01] checkpoint | Uniform assessment without accessibility accommodations

- Prohibited assessment accessibility accommodations and individual changes to timing, delivery configuration, format, content, critical-item requirements, scoring, or tier standards.
- Required every Judge taking the same event-specific assessment version to use the same assessment standard.
- Preserved randomized equivalent forms for retakes and test security when every form follows the same blueprint and scoring rules.
- Superseded the earlier unresolved accommodation option in [[judge-qualification-model]], the domain glossary, and ADR 0012.

## [2026-09-01] checkpoint | Defer assessment ranking mechanics

- Confirmed that Judge testing runs in separate software linked to Docket.
- Deferred question design, score calculation, ranking, tier thresholds, calibration, detailed compatibility, and integrity-review mechanics to that assessment product.
- Kept the current Docket milestone focused on the versioned integration boundary and verified qualification data used by tournament operations.
- Updated [[judge-qualification-model]], [[backend-roadmap]], and ADR 0012 before returning the interview to tournament backend behavior.

## [2026-09-01] checkpoint | Tournament-defined Pairing Plans

- Rejected a universal Lincoln-Douglas pairing algorithm and created a versioned Pairing Plan with configurable methods and options for every round.
- Allowed Tournament Directors and Pairing-authorized Tabulation Staff to determine draft pairing behavior while retaining Director approval through Schedule Selection.
- Required Docket to recommend and explain a plan fitted to the Director's adopted Ruleset without silently replacing an administrator-selected valid combination.
- Required every Round Specification and later Pairing Publication to match the Tournament Schedule published before the tournament on the Tournament Invitation Page.
- Added [[pairing-model]], updated scheduling, access, Ruleset documentation and the domain glossary, and recorded ADR 0014.

## [2026-09-01] checkpoint | Pairing Plan lock and revision lifecycle

- Allowed authorized draft Pairing Plan editing until Tournament Schedule Publication and locked the displayed plan version at publication.
- Allowed Pairing-authorized staff to prepare later revisions while reserving approval and plan republication for a Tournament Director.
- Required schedule-impacting plan changes to complete the Schedule Revision workflow first.
- Required Director-approved withdrawal and a new Pairing Publication to change an unstarted published round, with impact notices and preserved history.
- Made started and completed rounds immutable in [[pairing-model]], [[scheduling-model]], [[access-model]], the domain glossary, and ADR 0014.

## [2026-09-01] checkpoint | Irreversible pairing-method selection

- Moved the pairing-method lock to Schedule Selection while preserving case-by-case method combinations during draft configuration.
- Made the method selected for every configured round immutable for the remainder of the tournament.
- Prohibited Directors, staff, Platform Administrators, Pairing Plan Revisions, Schedule Revisions, Emergency Amendments, withdrawals, and corrections from replacing a locked method.
- Required every corrected or republished pairing to continue using the same method in [[pairing-model]], [[scheduling-model]], [[access-model]], the domain glossary, and ADR 0014.

## [2026-09-01] checkpoint | Pairing emergency and round-error corrections

- Extended Schedule Selection locking to pairing methods and all method-defining options.
- Allowed only a Tournament Director to perform and approve an emergency pairing-policy correction before any round starts, with validation, impact preview, versioning, and republication.
- Prohibited all pairing-policy changes after any round enters the Started state.
- Allowed Pairing-authorized Tabulation Staff to prepare error-only corrections for individual unstarted rounds under the locked policy, subject to explicit Tournament Director sign-off.
- Preserved withdrawal, republication, notice, schedule-alignment, and started-round immutability requirements across [[pairing-model]], [[scheduling-model]], [[access-model]], the glossary, and ADRs 0001 and 0014.

## [2026-09-01] checkpoint | Qualifying Pairing Errors

- Limited Round Pairing Corrections to evidenced Entry, standings-input, locked-policy, prohibited-assignment, Judge-eligibility, room, schedule, software, or calculation errors.
- Required each correction request to identify its error category and supporting evidence before Director sign-off.
- Excluded strategic dissatisfaction, matchup preference, perceived competitive advantage, and disagreement with a valid deterministic result.
- Updated [[pairing-model]], [[access-model]], the domain glossary, and ADR 0014.

## [2026-09-01] checkpoint | Initial Pairing Method Catalog

- Added Random Draw, Preset, Seeded High-Low, Power High-Low, Power High-High, Round-Robin, Seeded Elimination Bracket, and Fully Manual Pairing to the first-release catalog.
- Required stable identifiers, versioned input contracts and validation, reproducible tie-breaking, and complete configuration and output provenance.
- Required Random Draw to retain its random seed.
- Deferred tournament-supplied scripts, formulas, plugins, and arbitrary pairing code in [[pairing-model]], [[backend-roadmap]], the glossary, and ADR 0014.

## [2026-09-01] checkpoint | Default pairing recommendation and flip rounds

- Recommended avoiding preliminary rematches and same-School pairings, keeping cumulative side difference within one, minimizing bracket pulls, and assigning first byes to the lowest-ranked eligible Entries.
- Required Docket to expose conflicting constraints and recommend an explicit relaxation instead of deciding silently.
- Preserved seeded elimination brackets despite rematches or same-School matchups.
- Removed cumulative affirmative/negative balancing from elimination Flip Rounds and replaced the flip with a locked side assignment when opponents previously met.
- Updated [[pairing-model]], the domain glossary, and ADR 0014 while leaving the exact prior-match side orientation open.

## [2026-09-01] checkpoint | Prior-match elimination side reversal

- Required elimination opponents who previously met to reverse the sides from their most recent prior Pairing Publication that reached Started state.
- Required the Prior-Match Side Lock to record the source tournament, round, pairing version, and published side assignments.
- Made the side lock independent of the winner and Competitive Result so Ballot reopening or correction cannot change it.
- Updated [[pairing-model]], the domain glossary, and ADR 0014.

## [2026-09-01] checkpoint | Ordinary pairing approval and publication

- Required Docket validation before an ordinary pairing may be approved.
- Allowed a Tournament Director or Pairing-authorized Tabulation Staff member to approve one exact validated pairing version.
- Allowed a Director or Publication-authorized staff member to publish only the exact approved version and permitted the same duly authorized actor to perform both actions.
- Kept validation, approval, and publication separately attributed, invalidated approval after any edit, and preserved Director-only emergency, withdrawal, and correction controls in [[pairing-model]], [[access-model]], the glossary, and ADR 0014.

## [2026-09-01] checkpoint | Pairing lifecycle and completed-round decisions

- Adopted the ordered Draft, Generated/Entered, Validated, Approved, Published, Started, and Completed pairing lifecycle with pre-start Withdrawn state.
- Required new versions after edits, prohibited skipped or reversed transitions, and made Started and Completed pairings immutable.
- Allowed only a Tournament Director to create a new completed-round competitive decision for a verified input error or disqualification.
- Preserved the original decision and pairing, recomputed standings and advancement, and surfaced downstream conflicts and notices.
- Updated [[pairing-model]], [[ballot-model]], [[access-model]], the glossary, and ADRs 0010 and 0014.

## [2026-09-01] checkpoint | Scoped Disqualification Rulings

- Required a Disqualification Ruling to select a Ruleset-supported round-only loss, prospective tournament removal, or full-tournament scope.
- Preserved prior completed decisions unless the adopted Ruleset explicitly requires retroactive forfeits.
- Required a separate versioned Completed Round Decision Correction for every retroactively affected round instead of a bulk overwrite.
- Required an exact impact preview, Director confirmation, downstream conflict handling, and versioned notices while preserving every pairing.
- Updated [[ballot-model]], [[registration-model]], [[access-model]], the glossary, and ADR 0010.

## [2026-09-01] checkpoint | Speaker Points after administrative decisions

- Preserved Judge-submitted Speaker Points by default when a completed adjudicated decision changes for disqualification unless the Ruleset explicitly excludes or replaces them.
- Prohibited Judge-submitted points on unadjudicated forfeits, byes, and other Administrative Outcomes.
- Allowed only Ruleset-defined Administrative Points and required outcome, formula, input, version, and calculation provenance.
- Required standings to distinguish Judge-submitted, administrative, excluded, and absent points in [[ballot-model]], the glossary, and ADRs 0009 and 0010.

## [2026-09-01] checkpoint | Panel majorities and point-free elimination rounds

- Required odd-sized panels with independent Judge Ballots and a strict-majority Panel Decision.
- Allowed the panel winner to lock at an Irreversible Majority while keeping remaining Competitive Results due, visible, reminded, and escalated.
- Kept each Judge's feedback separate and made preliminary Speaker Point aggregation Ruleset-defined with individual-value provenance.
- Prohibited Judge-submitted and Administrative Speaker Points in every Elimination Round, including panels, corrections, forfeits, and disqualifications.
- Updated [[ballot-model]], [[access-model]], [[backend-roadmap]], the glossary, and ADRs 0009 and 0010.

## [2026-09-01] checkpoint | Late Ballot escalation

- Defined Ballot Due Time as scheduled round end plus a tournament-configurable grace period defaulting to 15 minutes.
- Required a Judge reminder at scheduled end, a Late mark and notice at Ballot Due Time, and escalation to Judge-and-room staff and Directors ten minutes later.
- Allowed an Irreversible Majority to advance while preserving each missing panel Ballot as outstanding.
- Blocked result-dependent operations for a single-Judge round or panel without a majority until submission or a Director's evidence-backed Administrative Ruling.
- Prohibited automatic forfeits, inferred winners, fabricated Judge Ballots, and Entry penalties based only on a missing Competitive Result.
- Updated [[ballot-model]], [[access-model]], the glossary, and ADR 0009.

## [2026-09-01] checkpoint | Duplicate and conflicting Ballot submissions

- Made authenticated identical Ballot retries idempotent and required Docket to return the original receipt without creating a duplicate decision or version.
- Required Docket to reject different competitive data submitted after result lock while preserving the Conflicting Ballot Attempt in restricted audit history.
- Required notice to the assigned Judge and authorized Directors or Ballot-and-correction staff.
- Routed intended changes and disputes through Ballot Reopening and a new attributed Result Correction version rather than silent overwrite.
- Updated [[ballot-model]], [[access-model]], the glossary, and ADR 0009.

## [2026-09-01] checkpoint | Tournament-local Judge Assignment Hold

- Required an escalated missing Competitive Result to make its Judge unavailable for new assignments at the current tournament.
- Released the hold automatically when the Judge submits the missing result and allowed a Tournament Director to clear it earlier with a recorded reason.
- Allowed a Director to remove future assignments through normal pairing or schedule-revision controls and notices.
- Classified timeliness as tournament operations data and prohibited holds or assignment removal from changing assessment scores, qualifications, tiers, Judging Profiles, or other-tournament eligibility.
- Updated [[ballot-model]], [[access-model]], [[scheduling-model]], [[judge-qualification-model]], the glossary, and ADR 0009.

## [2026-09-01] checkpoint | Director-uploaded standings rules

- Rejected one fixed Docket standings template in favor of a tournament-event-scoped Standings Rules Configuration uploaded by a Tournament Director.
- Required every upload and replacement to remain versioned and attributed by event, Director, time, source filename, and content fingerprint.
- Connected the uploaded configuration to Ballot results, Entry eligibility, pairing inputs, and advancement.
- Left the safe file format, supported operations, validation, publication, locking, and correction workflow explicitly unresolved and did not authorize arbitrary executable code.
- Added [[standings-model]], the glossary term, and ADR 0015; updated [[access-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Declarative standings upload contract

- Selected `.docket-standings.json` as the versioned backend import and export contract for tournament standings rules.
- Limited rule behavior to a Docket schema covering record ordering, Speaker Point aggregation and drops, Administrative Outcome treatment, ordered tie-breaks, and deterministic final ties.
- Prohibited uploaded scripts, formulas, expressions, macros, plugins, network references, PDFs, and spreadsheets as calculation inputs.
- Required syntax, schema, event, and semantic validation plus an explainable preview over representative sample records before acceptance.
- Required the future UI to generate the same contract so Tournament Directors do not need to hand-author JSON.
- Updated [[standings-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Standings rules acceptance and lock

- Reserved acceptance of one exact validated Standings Rules Configuration to a Tournament Director after review of its calculation preview.
- Required invitation-page publication of a human-readable summary, complete ordered criteria, schema and configuration versions, and content fingerprint before the tournament begins.
- Required first-round Pairing Publication to reference and lock that exact fingerprint.
- Required all later standings, power-pairing, and seeding calculations to identify the locked version and prohibited ordinary post-lock replacement.
- Established that any later change must use a separate Emergency Standings Rules Correction workflow whose details remain unresolved.
- Updated [[standings-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Emergency Standings Rules Correction

- Limited post-lock correction to verified configuration or calculation defects that make Docket diverge from the human-readable standings policy already published to participants.
- Prohibited strategic, preference-based, and outcome-driven mid-tournament policy changes.
- Reserved approval to a Tournament Director after validation, calculation preview, full downstream impact preview, evidence review, and explicit confirmation.
- Required standings recalculation and regeneration of mutable downstream artifacts while preserving started and completed pairings as played and surfacing Downstream Conflicts.
- Required immediate operational and School notices, assignment notices when applicable, invitation-page correction publication, fingerprints, and complete superseded history.
- Updated [[standings-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Standings acceptance cases and TypeScript direction

- Allowed optional labeled Standings Acceptance Cases containing synthetic inputs and expected ordering and metrics inside `.docket-standings.json`.
- Required every supplied case to pass before acceptance and rerun after validation, schema migration, or Emergency Standings Rules Correction.
- Prohibited executable code, external references, and production participant data in configuration-supplied cases.
- Selected TypeScript as Docket's eventual implementation language across backend and UI and required current domain contracts and deterministic calculation modules to be TypeScript-oriented.
- Required runtime validation for uploads, webhooks, imports, APIs, and persisted payloads because static TypeScript types and assertions do not validate untrusted data.
- Updated [[standings-model]], [[backend-roadmap]], [[project-context]], the glossary, ADR 0015, and the index; added ADR 0016.

## [2026-09-01] checkpoint | Separate Advancement Plan

- Separated preliminary standings calculation from elimination advancement policy.
- Required a versioned Advancement Plan to reference the locked standings configuration fingerprint and define break size, eligibility, tie-at-the-cut handling, seeding, and bracket byes.
- Required application of one Plan to one standings snapshot to produce a reproducible, versioned Advancement Field with selected and excluded Entries, explanations, seeds, byes, and source versions.
- Required Seeded Elimination Bracket pairing to consume the Advancement Field rather than reading the standings table directly.
- Established separate deterministic TypeScript module boundaries for standings and advancement.
- Added [[advancement-model]], glossary terms, and ADR 0017; updated [[standings-model]], [[pairing-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Advancement Plan upload and lock

- Selected `.docket-advancement.json` as the separate declarative Advancement Plan contract and prohibited uploaded executable and document-style inputs.
- Required runtime schema and semantic validation plus an explainable preview over representative standings snapshots.
- Reserved upload and acceptance of one exact Plan fingerprint to a Tournament Director after preview review.
- Required Docket to publish a human-readable invitation-page summary and the future TypeScript UI to generate the same JSON contract.
- Required first-round Pairing Publication to atomically lock compatible standings and Advancement Plan fingerprints and block when either is missing, unpublished, or incompatible.
- Updated [[advancement-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Tie-at-the-cut policies

- Allowed the Advancement Plan to select one precommitted policy for a complete standings tie crossing the qualification cut: Expand Field, Play-In, or Seeded Draw.
- Required expanded fields to have feasible bracket and resource capacity and play-ins to have published contingency schedule blocks, rooms, and qualified Judge assumptions.
- Required a Seeded Draw to publish its seed and algorithm version before competition and retain ordered inputs and outputs for reproducibility.
- Prohibited subjective post-standings selection, reordering, or exclusion of tied Entries and prohibited silent fallback to another policy.
- Required a closed TypeScript discriminated union with exhaustive validation and calculation handling.
- Updated [[advancement-model]], [[scheduling-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Partial elimination brackets and byes

- Allowed a Tournament Director to configure any whole-number break size from 2 through the eligible Entry count.
- Required Docket to map the actual advancing field, including an expanded tied field, into the next power-of-two bracket.
- Awarded first-round byes to the highest seeds and required a versioned canonical high-versus-low seed map.
- Prohibited rearranging bracket positions to avoid rematches, same-School debates, preferred opponents, Judge constraints, or perceived imbalance.
- Represented bracket byes as versioned advancement artifacts without Judge Ballots or Speaker Points and required deterministic TypeScript integer calculations.
- Updated [[advancement-model]], [[pairing-model]], [[ballot-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Eligibility changes around elimination start

- Required a withdrawal, disqualification, or corrected eligibility record before any elimination round Starts to recalculate and version the complete Advancement Field.
- Promoted next-highest eligible Entries to the nominal break, reapplied the cut-tie policy, and reseeded the field; when too few eligible Entries remain, shrank the field and recalculated capacity and byes.
- Required withdrawal and republication of elimination pairings derived from the prior Field and delivery of affected notices.
- Made the entire bracket non-refillable and non-reseedable once any elimination round Starts and prohibited reviving excluded or eliminated Entries.
- Required later vacancies to resolve through attributed byes, forfeits, or Disqualification Rulings without fabricated Ballots or Speaker Points.
- Updated [[advancement-model]], [[pairing-model]], [[registration-model]], [[ballot-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Emergency Advancement Plan Correction

- Limited post-lock Advancement Plan correction to verified configuration or calculation defects that make Docket diverge from the human-readable policy already published to participants.
- Prohibited strategic, matchup-aware, qualifier-aware, and outcome-driven Plan changes.
- Reserved approval to a Tournament Director after runtime validation, Plan preview, full impact preview, evidence, reason, conflict, and notice review.
- Allowed replacement, Field recalculation, and pairing republication only before any elimination round Starts.
- Required post-start corrections to preserve the original bracket, Entries, seeds, pairings, and source versions while publishing explicit Downstream Conflicts and Correction Notices.
- Updated [[advancement-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Advancement Field approval and publication

- Required every draft Advancement Field to use complete required preliminary results or Administrative Rulings, current eligibility, the locked standings snapshot and Plan, and no unresolved blocking conflict.
- Allowed Pairing-authorized Tabulation Staff to prepare, review, and recommend a Field but prohibited direct qualifier and seed edits.
- Reserved exact validated Field approval to a Tournament Director and invalidated approval after any source correction or regeneration.
- Allowed the Director or Publication-authorized staff to publish only the exact approved fingerprint as a separately attributed event.
- Blocked elimination pairing until Field publication and required every pre-start recalculation to repeat validation, approval, and publication.
- Updated [[advancement-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Advancement Field publication visibility

- Made advancing Entry display identities and Schools, seeds, bracket byes, applied tie-at-the-cut outcome, governing fingerprints, publishing actor, time, and current Correction Notice public on the Tournament Invitation Page.
- Gave active School Members a private calculation, cut relationship, and scoped eligibility explanation for only their own excluded Entries.
- Withheld private disqualification and eligibility evidence, detailed Judge Ballots, Ballot Feedback, unpublished drafts, and Judge assessment data from public viewers and unrelated Schools.
- Required the TypeScript backend to construct and runtime-validate distinct public, School-scoped, and staff projections instead of relying on UI field hiding.
- Updated [[advancement-model]], [[access-model]], [[registration-model]], [[backend-roadmap]], the glossary, ADR 0017, and the index.

## [2026-09-01] checkpoint | Preliminary standings publication schedule

- Allowed a Standings Publication Policy of release after every preliminary round, at specified preliminary-round checkpoints, or only after all preliminary rounds.
- Required the Tournament Director's selected policy and exact checkpoints to appear on the Tournament Invitation Page and lock with the standings configuration at first-round Pairing Publication.
- Prohibited ordinary outcome-aware acceleration, delay, addition, or removal of standings releases.
- Required every release to wait for all standings-required results or Administrative Rulings and blocking conflicts and to preserve an immutable snapshot and publication version.
- Allowed authorized power pairing to use current internal versioned standings before participant disclosure so publication timing never forces stale operational data.
- Updated [[standings-model]], [[access-model]], [[pairing-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Standings snapshot approval and publication

- Required Docket to automatically calculate and validate a draft snapshot when a configured checkpoint becomes eligible but prohibited automatic participant publication.
- Allowed a Tournament Director or Pairing-authorized Tabulation Staff member to approve one exact validated snapshot fingerprint.
- Allowed a Director or Publication-authorized staff member to publish only that exact approved version and permitted one actor with both authorities to perform both actions.
- Kept calculation, validation, approval, and publication separately attributed and prohibited direct editing of calculated ranks or metrics.
- Required a source correction or regeneration to create a new version and invalidate any unconsumed approval while leaving authorized internal power pairing unblocked by manual publication.
- Updated [[standings-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Standings publication visibility

- Made each Entry's published identity, School, rank, win-loss record, and every aggregate metric that can affect ordering public with checkpoint, governing version, fingerprint, publisher, time, and correction metadata.
- Prohibited public ranks from depending on hidden aggregate metrics.
- Gave active School Members a private per-round calculation breakdown, including drops, exclusions, Administrative Outcome treatment, and intermediate metrics, for only their own Entries.
- Kept Judge-linked scores, detailed Ballots, feedback, private eligibility and disqualification evidence, correction evidence, and Judge assessment data restricted by source permissions.
- Required the TypeScript backend to construct and runtime-validate distinct public, School-scoped, operational-provenance, and sensitive-evidence projections instead of relying on UI field hiding.
- Updated [[standings-model]], [[access-model]], [[ballot-model]], [[backend-roadmap]], the glossary, ADR 0015, and the index.

## [2026-09-01] checkpoint | Final Results publication readiness

- Required every placement- and award-affecting competitive decision, correction, disqualification, emergency rule correction, and Downstream Conflict to be resolved before a Final Results Draft is ready.
- Required every placement and award to identify its governing Ruleset, standings, advancement, result, eligibility, and award-configuration versions.
- Made Ballot Feedback and panel Ballots that cannot alter an Irreversible Majority nonblocking while preserving a block for any missing scoring input independently required for placement or awards.
- Reserved exact validated draft approval to a Tournament Director and allowed the Director or Publication-authorized staff to publish only that fingerprint.
- Prohibited direct placement and award edits, required source correction and regeneration, and preserved every prior publication through versioned Correction Notices.
- Added [[final-results-model]], glossary terms, and ADR 0018; updated [[access-model]], [[ballot-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Final Results public contents and visibility conflict

- Made the event champion, finalist, other configured public placements, complete elimination bracket and decisions, final standings, public award recipients, and represented Schools part of the public Final Results Summary.
- Restricted detailed Judge Ballots, feedback, Judge-linked scores, private eligibility and disqualification evidence, and Judge assessment data.
- Required a dedicated runtime-validated TypeScript public-results projection rather than UI-only field hiding.
- Recorded a contradiction in the repeated answer: governing configuration fingerprints, publishing actor and time, and Correction Notices were listed once as restricted and once as public.
- Left those three Final Results Summary audit fields unresolved pending one focused clarification without changing their already-settled visibility elsewhere.
- Updated [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0018, and the index.

## [2026-09-01] checkpoint | Restrict Final Results metadata

- Excluded governing configuration fingerprints and publishing actor and time from the public Final Results Summary and public UI.
- Retained that metadata in the internal Final Results Draft, immutable history, authorized staff review, and audit projections.
- Kept the public competitive results and previously restricted evidence categories unchanged.
- Left Correction Notice visibility unresolved because it is user-facing correction content rather than internal metadata.
- Left cross-page scope unresolved because earlier invitation, standings, and advancement decisions explicitly made comparable metadata public.
- Updated [[final-results-model]], [[access-model]], [[backend-roadmap]], ADR 0018, and the index.

## [2026-09-01] checkpoint | Restrict metadata across public UI

- Extended the public metadata restriction to invitation, schedule, pairing, standings, advancement, and Final Results UI projections.
- Removed raw fingerprints, internal versions, publishing attribution, and exact publication timestamps from public projections while preserving human-readable rules, schedules, standings, qualifiers, brackets, and results.
- Retained complete metadata for authorized staff, internal validation, immutable history, and audit exports.
- Updated the TypeScript projection requirements and superseded earlier decisions that exposed comparable metadata publicly.
- Left user-facing Correction Notice visibility as a separate unresolved content decision.
- Updated [[standings-model]], [[advancement-model]], [[scheduling-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], [[final-results-model]], the glossary, ADRs 0015, 0017, and 0018, and the index.

## [2026-09-01] checkpoint | Public Correction Notices

- Kept a human-readable Correction Notice public whenever previously published Docket information changes.
- Required the notice to identify the affected public information, previous and corrected public values, competitive or operational effect, and any participant action.
- Withheld raw fingerprints, internal versions, actors, exact timestamps, private evidence, internal notes, and audit details from the public notice.
- Retained the full linked correction record for authorized staff, immutable history, and audit exports.
- Applied the projection rule to schedules, pairings, standings, advancement, awards, and Final Results.
- Updated [[final-results-model]], [[ballot-model]], [[standings-model]], [[advancement-model]], [[scheduling-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0015, 0017, and 0018, and the index.

## [2026-09-01] checkpoint | Separate Award Plan

- Selected a versioned declarative `.docket-awards.json` Award Plan defining category identity, eligibility, authoritative calculation source, recipient count or bands, tie handling, and public visibility.
- Required runtime validation, executable-input rejection, and an explainable synthetic Award Plan Preview, with the future TypeScript UI generating the same contract.
- Reserved upload and acceptance of one exact validated Plan fingerprint to a Tournament Director.
- Required first-round Pairing Publication to atomically lock compatible standings, advancement, and Award Plan fingerprints.
- Required a deterministic TypeScript award module to consume exact authoritative source versions and produce an immutable Award Results Draft for Final Results without duplicating source calculations.
- Added [[award-model]], glossary terms, and ADR 0019; updated [[final-results-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Initial Lincoln-Douglas award categories

- Limited the first Lincoln-Douglas release to elimination placement awards and preliminary Speaker Awards.
- Allowed the Award Plan to configure recipient counts, recognized placement bands, and complete tie handling, and to disable either award family.
- Required Speaker Awards to use the locked Ruleset-valid preliminary Speaker Point aggregate and excluded elimination rounds, which do not award Speaker Points.
- Deferred School sweepstakes, team sweepstakes, and subjective or narrative awards until multi-event support.
- Updated [[award-model]], [[backend-roadmap]], ADR 0019, and the index.

## [2026-09-01] checkpoint | Publish every configured award

- Required every configured award category and recipient to appear publicly with the other published tournament results.
- Removed the Award Plan's per-category public or nonpublic visibility choice and resolved the nonpublic-recipient question by eliminating nonpublic awards.
- Continued to restrict internal calculation metadata, governing fingerprints and versions, private eligibility or disqualification evidence, Judge-linked source records, and audit details.
- Recorded this decision as superseding the earlier per-category award-visibility option.
- Updated [[award-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0018 and 0019, and the index.

## [2026-09-01] checkpoint | Integrate Award Results into Final Results approval

- Required Docket to calculate or regenerate Award Results automatically when the locked Award Plan's authoritative sources become complete or change.
- Made the exact Award Results Draft a component of the Final Results Draft rather than an independently approved or published artifact.
- Made the Tournament Director's Final Results Approval cover the exact referenced Award Results and required award-source changes to invalidate that approval.
- Required awards to publish with the rest of the exact approved Final Results version and created no separate award approval, publication action, or permission.
- Updated [[award-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0018 and 0019, and the index.

## [2026-09-01] checkpoint | Emergency Award Plan Correction

- Reserved post-lock Award Plan correction approval to a Tournament Director and allowed Tabulation Staff to prepare evidence and analysis only.
- Limited correction to verified conformity with award rules published before the tournament and prohibited outcome-driven, strategic, or otherwise discretionary policy changes.
- Required runtime validation, an Award Plan Preview, and a full impact preview identifying all changed award calculations and recipients.
- Required immutable preservation of the locked Plan, a versioned emergency replacement, complete Award Results regeneration, and invalidation of any affected Final Results Approval.
- Required ordinary Final Results reapproval and republication plus a public Correction Notice when already published award information changes.
- Updated [[award-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0018 and 0019, and the index.

## [2026-09-01] checkpoint | Separate Competitive Completion and Tournament Closure

- Made Final Results Publication transition the tournament to Competitive Completion without closing it automatically.
- Preserved the existing rule that only the Tournament Owner may perform Tournament Closure; additional Directors and Publication-authorized staff cannot exercise that authority.
- Required closure to occur separately after the applicable Judge-feedback window and required operational work are complete or explicitly resolved.
- Made closure end routine operation without deleting public pages, immutable records, attribution, versions, or audit history.
- Kept authorized versioned correction workflows available after closure with their existing approval, republication, and public Correction Notice requirements.
- Added [[tournament-lifecycle-model]], glossary terms, and ADR 0020; updated [[final-results-model]], [[access-model]], [[backend-roadmap]], ADRs 0007 and 0018, and the index.

## [2026-09-01] checkpoint | Protected Judge-feedback window

- Kept the Feedback Deadline tournament-configurable and published before first-round Pairing Publication, with a default of 72 hours after the final scheduled round.
- Allowed a Tournament Director to extend the locked deadline with a reason and notices but prohibited every actor from shortening it.
- Required a later final-round schedule to extend the deadline by the same locked duration while prohibiting an earlier schedule from reducing the current deadline.
- Made Feedback Deadline expiration sufficient for Tournament Closure without requiring every Judge to submit or publish feedback.
- Superseded the earlier requirement to use a general Emergency Amendment for every post-lock deadline change.
- Updated [[ballot-model]], [[tournament-lifecycle-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0009 and 0020, and the index.

## [2026-09-01] checkpoint | Tournament Closure readiness levels

- Added an immutable Closure Readiness Review separating non-waivable competitive blockers from outcome-irrelevant operational warnings.
- Blocked closure for unpublished Final Results, an open round, an unexpired Feedback Deadline, or an unresolved correction, conflict, or newer unpublished result version that could change public results.
- Classified missing outcome-irrelevant panel Ballots, missing or unpublished feedback, unacknowledged notices, and incomplete optional exports or administrative notes as warnings.
- Required the Tournament Owner to record completion or an explicit acknowledgment and reason for every warning before closure.
- Required closure to preserve the exact review, warning resolutions, Owner, reason, and internal time without deleting outstanding records.
- Updated [[tournament-lifecycle-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0020, and the index.

## [2026-09-01] checkpoint | Post-closure access and exceptions

- Preserved public invitation, schedule, pairings, standings, advancement, bracket, Final Results, awards, and Correction Notices after Tournament Closure.
- Preserved permission-scoped historical views, audit access, and exports for authorized actors.
- Blocked ordinary post-closure mutations to registration, staff assignments, rules and Plans, schedules, pairings, rounds, Ballots, feedback, standings, advancement, awards, and results.
- Allowed only explicit audited Post-Closure Exceptions for authorized corrections and republication, Feedback Reopening, Ownership Recovery, and legally required privacy actions.
- Required every exception to use its existing authority and validation rules without restoring unrelated permissions or erasing attribution.
- Updated [[tournament-lifecycle-model]], [[final-results-model]], [[ballot-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0020, and the index.

## [2026-09-01] checkpoint | Scoped Post-Closure Correction Case

- Kept the tournament in its Closed state while an authorized correction proceeds through a separate scoped Post-Closure Correction Case.
- Limited case commands to the intersection of the actor's existing authority and the correction's declared scope while all unrelated closed-tournament guards remain active.
- Kept the last published public version current until a corrected version completes its ordinary approval and republication workflow.
- Required the case, drafts, decisions, and attempts to remain in audit history whether the case is resolved, rejected, or withdrawn.
- Required no second Tournament Closure action when the case ends.
- Updated [[tournament-lifecycle-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0020, and the index.

## [2026-09-01] checkpoint | Entry registration lifecycle states

- Adopted Draft, Submitted, Waitlisted, Accepted, Withdrawn, and Rejected as the complete Entry Registration State set for the first Lincoln-Douglas slice.
- Treated Draft through Accepted as active for the one-active-Entry-per-Competitor invariant and preserved Withdrawn and Rejected as terminal historical records pending any later restoration rule.
- Separated Entry Registration State from Competitive Eligibility so disqualification does not masquerade as rejection or withdrawal.
- Preserved Entry identity and attributed version history across every state rather than deleting or reusing records.
- Added glossary terms and ADR 0021; updated [[registration-model]], [[access-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Normal Entry transition authority

- Allowed School Entry Managers to create and edit Drafts, submit complete Entries, and withdraw their School's Draft, Submitted, Waitlisted, or Accepted Entries before the applicable deadline.
- Allowed Registration-authorized Tabulation Staff and Tournament Directors to return Submitted Entries to Draft for correction and decide Submitted or Waitlisted admission as Waitlisted, Accepted, or Rejected.
- Required every tournament-side transition to record the prior and next states, actor, permission, reason, and internal time.
- Prohibited tournament-side admission actions from silently editing School-owned Competitor or School identity data.
- Kept restoration from Withdrawn or Rejected outside normal transition authority for a later exception decision.
- Updated [[registration-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0021, and the index.

## [2026-09-01] checkpoint | Staged Entry Restoration

- Allowed Registration-authorized staff or a Tournament Director to restore the same Withdrawn or Rejected Entry identity to Submitted before first-round Pairing Publication after a School request or evidence of error, a reason, and an impact preview.
- Required every restored Entry to undergo fresh admission review rather than automatically regaining Accepted status or its prior waitlist position.
- Reserved post-publication, pre-start restoration to a Tournament Director and limited it to a mistakenly withdrawn Entry that had been Accepted immediately beforehand.
- Required Pairing Withdrawal and complete regeneration or correction, validation, approval, republication, and notices for every affected published pairing.
- Prohibited every active Entry Restoration after any round starts and prohibited duplicate replacement Entries.
- Updated [[registration-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], the glossary, ADRs 0014 and 0021, and the index.

## [2026-09-01] checkpoint | Tournament Registration Policy and late changes

- Required a Director-configured, versioned, timezone-aware Tournament Registration Policy published on the invitation page before registration opens.
- Included registration opening plus Entry submission, School edit, admission-decision, and waitlist-closing deadlines.
- Reserved a reasoned, impact-previewed, Entry-scoped Late Registration Exception to a Tournament Director and prohibited it after first-round Pairing Publication.
- Preserved School Entry Manager withdrawal authority at all times and classified post-edit-deadline changes as Late Withdrawals rather than blocking them.
- Required Late Withdrawal provenance, impact preview, notifications, and all applicable pairing, scheduling, standings, advancement, award, and correction handling without creating an automatic penalty or disqualification.
- Added glossary terms and ADR 0022; updated [[registration-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], ADR 0021, and the index.

## [2026-09-01] checkpoint | Protective Registration Policy revisions

- Allowed a Tournament Director to replace and republish the Registration Policy freely before registration opens.
- Limited post-opening revisions to deadline extensions or relaxed requirements and prohibited shorter deadlines, stricter requirements, invalidation of valid submissions, or timezone corrections producing earlier instants.
- Required runtime validation, an all-Entry impact preview, Director confirmation and reason, immutable prior-version preservation, a public change notice, and affected-School notifications.
- Kept internal fingerprints, actor attribution, and exact revision metadata out of the public projection.
- Ended all Registration Policy Revision authority at first-round Pairing Publication while preserving the separately governed withdrawal and correction workflows.
- Updated [[registration-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0022, and the index.

## [2026-09-01] checkpoint | Deterministic admission and waitlist

- Added a published Admission Policy defining event capacity, optional per-School caps, and objective named priority groups before registration opens.
- Ordered complete Entries within each group by complete submission time and resolved exact timestamp ties through a retained reproducible seed.
- Required Docket to generate immutable Admission Recommendations and Registration-authorized staff or a Director to confirm only the exact calculated transitions.
- Prohibited manual waitlist reordering, lower-ranked selection, seed alteration, and unpublished special priority.
- Required withdrawals and valid capacity increases to recalculate the highest-ranked eligible promotion before waitlist closing.
- Required remaining Waitlisted Entries to receive a confirmed standardized capacity rejection at waitlist closing while withholding private priority evidence and internal ordering metadata publicly.
- Updated [[registration-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0022, and the index.

## [2026-09-01] checkpoint | Minimized Core Entry data

- Required only the School-owned Competitor reference, public display name, canonical School, event, grade or eligibility category, School eligibility attestation, and responsible Coach contact.
- Prohibited date of birth, home address, a minor's personal email or phone, guardian information, medical information, and accommodation details as ordinary Core Entry requirements.
- Restricted grade or category, attestation, and Coach contact to authorized own-School and registration-operational projections.
- Limited the public Entry projection to the display name, School, and event of an explicitly published Accepted Entry.
- Added glossary terms and ADR 0023; updated [[registration-model]], [[access-model]], [[backend-roadmap]], ADR 0021, and the index.

## [2026-09-01] checkpoint | Governed additional registration fields

- Required tournament-specific fields beyond Core Entry Data to use a versioned Registration Data Schema published before registration opens.
- Required every field to declare its purpose, obligation, type, validation, audience, retention or disposition, and visibility.
- Preserved the public Entry boundary by keeping all first-slice additional fields restricted.
- Limited post-opening revisions to removing fields, stopping collection, or making fields optional; prohibited new or stricter obligations and broader access or retention.
- Prohibited medical and accommodation details in ordinary registration fields and routed them to a separate restricted Accommodation Request workflow.
- Added glossary terms and ADR 0024; updated [[registration-model]], [[access-model]], [[backend-roadmap]], ADR 0023, and the index.

## [2026-09-01] checkpoint | Restricted Accommodation Request disclosure

- Allowed the Entry Manager or Responsible Coach Contact to create and view a complete Accommodation Request for their own School's Entry.
- Reserved complete tournament-side request access to the Director and explicitly delegated Accommodation Operations staff; ordinary tournament permissions grant no access.
- Asked for the operational adjustment and relevant functional constraints rather than a diagnosis by default.
- Delivered only attributed need-to-know implementation instructions to Tabulation Staff, room staff, and Judges while withholding diagnoses, evidence, narrative, and unrelated details.
- Denied Public Viewers, unrelated Schools, unrelated Judges, and unauthorized staff any view of the request or its existence and required auditing of sensitive access and disclosure.
- Preserved the separate no-accessibility-variant decision for Judge Qualification Assessments.
- Added glossary terms and ADR 0025; updated [[registration-model]], [[access-model]], [[backend-roadmap]], ADR 0024, and the index.

## [2026-09-01] checkpoint | Accommodation Request decision lifecycle

- Adopted Draft, Submitted, Clarification Needed, Approved, Partially Approved, Denied, Withdrawn, and Closed request states.
- Allowed own-School Entry Managers and Responsible Coach Contacts to draft, submit, answer clarification, and withdraw requests without silently editing submitted versions.
- Allowed Accommodation Operations staff to request specified clarification and approve a request exactly as submitted when operationally feasible.
- Reserved partial approval, denial, and any reduction of an earlier approval to the Tournament Director with a specific operational reason and an available alternative when one exists.
- Required immutable request and decision versions, atomic revocation and regeneration of implementation instructions, and private notifications to affected authorized recipients.
- Updated [[registration-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0025, and the index.

## [2026-09-01] checkpoint | Nonblocking Accommodation Request timing

- Published an Accommodation Request-By Time with the Registration Policy, defaulted it to the Entry submission deadline, and allowed only later extensions after registration opens.
- Made the time a planning target rather than an admission, eligibility, pairing, or participation cutoff.
- Required Docket to accept late requests through the ordinary lifecycle without a Late Registration Exception or automatic denial.
- Routed approved impacts on published unstarted schedules and pairings through existing Director approval, withdrawal, republication, urgent-change, and notification controls.
- Preserved started and completed round records while allowing feasible active-round instructions and prospective future-round adjustments.
- Kept the Accommodation Request and its existence out of public and unrelated-recipient notices by using only generic restricted-operational-adjustment language.
- Updated [[registration-model]], [[scheduling-model]], [[pairing-model]], [[access-model]], [[backend-roadmap]], the glossary, and ADR 0025.

## [2026-09-01] checkpoint | Accommodation closure and sensitive-content deletion

- Revoked active Accommodation Implementation Instructions and closed a withdrawn request after its required notifications complete.
- Made Tournament Closure revoke all remaining instructions, close all remaining Accommodation Requests, and start their deletion period without treating them as competitive closure blockers.
- Required irreversible deletion of request narrative, communications, evidence, decision-reason and alternative text, and instruction content 30 days after Tournament Closure.
- Allowed the Entry Manager or Responsible Coach Contact to request earlier deletion after Tournament Closure.
- Prohibited ordinary tournament actors from extending retention and allowed delay only through a separately authorized documented Legal Hold.
- Retained only a restricted content-free Accommodation Audit Stub after deletion and left its duration to the future general audit-retention policy.
- Updated [[registration-model]], [[tournament-lifecycle-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0025, and the index.

## [2026-09-01] checkpoint | Accommodation Audit Stub retention

- Set automatic deletion of the content-free Accommodation Audit Stub for one year after Tournament Closure unless an active Legal Hold applies.
- Restricted the stub to authorized audit access and excluded it from Public Views, ordinary tournament views, and School exports.
- Isolated stub storage and deletion from public results, pairings, standings, awards, and Correction Notices so published tournament history remains unchanged.
- Updated [[registration-model]], [[tournament-lifecycle-model]], [[access-model]], [[backend-roadmap]], the glossary, and ADR 0025.

## [2026-09-01] checkpoint | Two-person Legal Hold governance

- Created Legal and Privacy Operations as a platform permission separate from generic Platform Administrator and all tournament authority.
- Required one authorized administrator to prepare and a second distinct administrator to approve Legal Hold activation, scope expansion, extension, and release.
- Required legal basis, external case reference, exact record scope, start time, and a review date no more than 90 days away.
- Kept overdue holds active to prevent accidental deletion while requiring continuous escalation until review.
- Made release immediately resume overdue deletion without tournament approval or reopening a Closed tournament.
- Restricted hold details to Legal and Privacy Operations and limited an affected School to the deletion-paused or resumed status.
- Added glossary terms and ADR 0026; updated [[registration-model]], [[tournament-lifecycle-model]], [[access-model]], [[backend-roadmap]], ADR 0025, and the index.

## [2026-09-01] checkpoint | School transfer and attribution correction

- Preserved genuine School transfers as new destination-School Competitor records with original Entries and results unchanged.
- Allowed a Platform Administrator to reassign a clerically misattributed Competitor only before any submitted or historical Entry, after evidence, impact preview, reason, and both-School-Manager notices.
- Prohibited moving or merging a Competitor after history exists and required the correct School to create a new record.
- Required each proven historical Entry attribution error to use a versioned correction joining Platform identity validation to the affected tournament's Director-controlled correction and republication workflow.
- Preserved started and completed pairings, used Downstream Conflicts where needed, and required public Correction Notices for changed published School attribution.
- Prohibited automatic cross-School matching and any transfer of private roster, evidence, communication, or Entry access.
- Updated [[registration-model]], [[final-results-model]], [[access-model]], [[backend-roadmap]], the glossary, ADR 0003, and the index.

## [2026-09-01] checkpoint | Classified tournament record retention

- Permanently retained published invitation content, schedules, pairings, standings, advancement, brackets, results, placements, awards, represented Schools, and Correction Notices.
- Retained restricted Ballots, feedback, Judge-linked scores, eligibility and disqualification evidence, locked configurations, calculations, approvals, corrections, and outcome-relevant audit provenance for seven years after Tournament Closure.
- Retained routine delivery, acknowledgment, and non-result operational-access telemetry for two years after Tournament Closure.
- Required automatic deletion at expiry unless an active Legal Hold applies and prohibited restricted expiry from changing permanent public history.
- Preserved the shorter Accommodation Request and Audit Stub policies and kept Judge Assessment data under its separate model.
- Added [[retention-model]], glossary terms, and ADR 0027; updated [[registration-model]], [[tournament-lifecycle-model]], [[final-results-model]], [[ballot-model]], [[judge-qualification-model]], [[access-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Minimized Judge Assessment retention

- Retained the current Qualification Summary while its Event Qualification remains valid.
- Required deletion of full-assessment answers, detailed scores, Critical Competency detail, provider payloads, and integrity evidence two years after attempt completion unless held.
- Retained a minimal Qualification History Summary for seven years after qualification expiration or supersession without raw answers, profile text, or detailed scores.
- Kept the current Judging Profile until Judge replacement or deletion, deleted unused superseded profiles after two years, and retained tournament-disclosed versions as restricted Competitive Evidence for seven years after Closure.
- Preserved the earlier Quick Assessment detail-deletion triggers while retaining only minimal tournament assignment provenance.
- Added glossary terms and ADR 0028; updated [[judge-qualification-model]], [[retention-model]], [[access-model]], [[backend-roadmap]], ADRs 0012 and 0013, and the index.

## [2026-09-01] checkpoint | Ordinary Support Action allowlist

- Allowed only redacted diagnostics, unchanged notification or invitation resend, idempotent failed-job or verified-delivery replay, derived cache or search-index rebuild, proven-expired lock clearing, and immutable-source projection regeneration.
- Required every state-changing action to carry a support-ticket reference, reason, exact scope, impact preview, actor and outcome attribution, and Affected Owner notification.
- Required replays to pass every original validation and authorization guard without converting rejected or conflicting source data into accepted data.
- Prohibited generic administrator consoles, arbitrary scripts or patches, impersonation, authoritative domain edits, approval or publication, workflow reopening, authority changes, and sensitive-record exposure.
- Limited Closed-tournament recovery to reconstructing the same current authorized projection without reopening the tournament.
- Updated [[access-model]], [[backend-roadmap]], the glossary, ADR 0005, and the index.

## [2026-09-01] checkpoint | Google-managed authentication

- Selected Google Identity Services/OpenID Connect as the sole authentication provider for the first backend slice.
- Assigned primary sign-in, additional security factors, Google-account policy, and account recovery to Google; Docket stores none of those credentials or factor secrets.
- Required server-side token validation against Google's signature and keys, issuer, Docket audience, time claims, verified email, state, nonce, and cross-site request protections.
- Linked each Docket Account by stable Google issuer and subject rather than mutable email, name, or hosted domain, and prohibited automatic email-only account linking.
- Kept Docket authorization separate through explicit domain-scoped roles and grants, with Google authentication conferring no School or tournament authority.
- Allowed sensitive commands to require fresh Google reauthentication and prohibited local-password, support-bypass, and impersonation fallbacks.
- Added glossary terms and ADR 0029; updated [[access-model]], [[backend-roadmap]], and the index.

## [2026-09-01] checkpoint | Google account and session policy

- Allowed any verified Google account for ordinary and tournament actors while requiring Docket-approved organization-managed Workspace accounts for Platform Administrators and Legal and Privacy Operations personnel.
- Allowed Coaches and Judges to self-enroll role-free Basic Docket Accounts and required separate invitation, appointment, or approval for every School, tournament, and platform authority grant.
- Enforced one current Google Identity Subject per Docket Account and one Docket Account per Subject, while allowing one Account to hold multiple independently scoped roles.
- Set ordinary sessions to a 12-hour inactivity and seven-day absolute limit and platform-privileged sessions to a 30-minute inactivity and 12-hour absolute limit.
- Required Google Reauthentication within 10 minutes for ownership transfer, authority changes, identity-link replacement, Legal Hold actions, sensitive exports, Account suspension, and Final Results publication or correction.
- Preserved Docket identity and authority across Google email changes and inaccessible Google accounts, required Google recovery first, and allowed only reviewed identity-link replacement afterward.
- Prohibited automatic duplicate-account merging, required Platform Identity Review with impact preview and historical-attribution preservation, and deactivated rather than rewrote duplicate history.
- Allowed valid Docket sessions to continue through a Google outage only until normal expiration while blocking sign-in, renewal, identity changes, and reauthentication-guarded commands.
- Added and refined glossary terms; updated [[access-model]], [[backend-roadmap]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Role switching and authenticated account lifecycle

- Allowed one multi-role Docket Account to switch natively between Coach, Judge, tournament, and platform contexts without a separate login merely to switch, while preserving context-scoped authorization and command-specific Google Reauthentication.
- Limited each Account to five concurrent ordinary sessions and one privileged session, replaced the prior privileged session when a new one starts, and required user-visible session inspection and revocation controls.
- Bound Authority Invitations to an exact verified Google email and authority scope, set seven-day School and tournament and 24-hour platform expirations, and required explicit informed acceptance.
- Required Google Reauthentication to accept platform, Tournament Owner, or Tournament Director authority and allowed authorized pre-acceptance revocation or automatic invalidation when inviter authority ends.
- Required failed Google recovery, replacement-account control, and two independent identity links for Platform Identity Review; used one administrator for ordinary Accounts and two for current or historical sensitive authority.
- Required privacy-preserving identity-review notices while preserving original historical actor attribution and prohibiting automatic duplicate-account merging.
- Created temporary Docket Account Suspension for documented security, fraud, abuse, or legal risk with immediate session termination, independent review within 24 hours, and seven-day expiry absent approved extension.
- Allowed Voluntary Account Deactivation only after exclusive-duty transfer, with session termination, Google unlinking, future-authority revocation, retention-bound profile deletion, and preserved tournament history.
- Added and refined glossary terms; updated [[access-model]], [[backend-roadmap]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Role-context and account-lifecycle edge rules

- Restored only the last still-authorized ordinary role after sign-in, never entered a privileged context automatically, and required a persistent role-and-scope indicator with distinct privileged styling.
- Blocked role switching until unsaved work is saved, discarded, or retained in place and prohibited unfinished forms, private selections, or client caches from crossing contexts.
- Delivered Authority Invitations by email and an existing Account's in-app inbox without allowing delivery status to alter authority state or expiration.
- Treated exact existing authority as a recorded no-op, rejected exclusivity conflicts, revoked prior pending exact-scope invitations on reissue, and preserved token and expiry on notice resend.
- Allowed the affected holder, an authorized School Manager or Tournament Owner, or a documenting Platform Administrator to request Identity Review while reserving decisions for Platform Administrators.
- Deleted encrypted identity evidence 30 days after resolution and retained only a content-free decision record for two years for ordinary Accounts or seven years when sensitive authority was affected.
- Allowed independently approved early suspension reinstatement, capped each freshly reviewed extension at 30 days, and prohibited automatic conversion into a permanent ban.
- Scheduled Voluntary Account Deactivation for seven days with cancellation available, made execution irreversible, deleted unnecessary profile data within 30 days, and denied returning users automatic restoration of former authority.
- Added and refined glossary terms; updated [[access-model]], [[backend-roadmap]], [[retention-model]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Context routing and account continuity

- Bound deep links and notifications to exact Active Role Contexts, required confirmation before cross-context navigation, prohibited automatic privileged switching, and returned generic denial without resource disclosure.
- Required every backend request to revalidate its current context and retained ordinary switch telemetry for two years versus privileged entry and exit provenance for seven years.
- Allowed previewed batch invitations only for nonexclusive School and tournament roles, with a separate aggregate and outcome for each recipient and hard prohibitions for exclusive and platform authority.
- Required wrong-recipient revocation and reissue, transactional identity, authority, state, and exclusivity validation at acceptance, and three delivery retries over 24 hours before inviter escalation without expiry extension.
- Allowed one 14-day Platform Identity Review Reconsideration based on new evidence or a specific process error, excluded original approvers, and required a linked immutable decision.
- Required privacy-minimized suspension notices, preserved authority until ordinary revocation or transfer, and routed active-tournament continuity through existing recovery, reassignment, and schedule-revision workflows without impersonation.
- Required Google Reauthentication to cancel scheduled deactivation, allowed a timely Identity Review to pause execution after lost Google access, and minimized retained names outside independently retained historical or published tournament records.
- Added and refined glossary terms; updated [[access-model]], [[backend-roadmap]], [[retention-model]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Cross-device context and session security

- Kept Active Role Context independent per browser tab while synchronizing and restoring the last-used context across devices, including privileged contexts, superseding the earlier ordinary-only restoration rule.
- Preserved privileged session limits and command-specific Google Reauthentication after privileged-context restoration.
- Allowed context-specific routine notification preferences while making security, authority, emergency, Legal Hold, and required governance notices non-disableable.
- Accepted independent per-recipient batch outcomes and permanent-bounce suppression while leaving the maximum batch size unresolved for re-questioning.
- Made the single Identity Review reconsideration final for that review, applied corrections prospectively, and reserved a new security review for separate later fraud or compromise.
- Deleted suspension evidence 90 days after final disposition, retained a content-free decision record for two or seven years, and allowed one seven-day challenge reviewed by two uninvolved administrators while suspension remains effective.
- Made logout Docket-scoped, provided Log Out Everywhere for all Docket sessions, and required security alerts for privileged-session creation or replacement, global logout, administrative termination, and suspension.
- Added a glossary term and updated [[access-model]], [[backend-roadmap]], [[retention-model]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Self-service accounts and tournament discovery

- Separated tournament discovery from Account and Authority Invitations: Judges and Coaches create their own Accounts, Competitors remain unauthenticated records, and the authenticated Invitations section lists all active Tournament Invitation Pages.
- Added [[tournament-directory-model]] and the Active Tournament Directory glossary term while leaving the exact active-state and discovery rules open.
- Removed Judge and Competitor onboarding from the batch-invitation question and left the remaining private Authority Invitation scope unresolved.
- Required unavoidable cross-device context memory including privileged contexts, with security alerts, a prominent banner, device and location details, and immediate session termination on privileged restoration.
- Made the single suspension challenge final and required three email retries over 24 hours, restricted-inbox persistence, and administrator escalation without changing suspension state.
- Limited Google profile import to stable subject, verified email, display name, and optional image; allowed a governed Docket Display Name; and prohibited unrelated Google data and authentication birth-date collection.
- Added a scoped self-service Account Data Export and limited the Account-facing two-year Security History to sign-ins, Google Reauthentication, suspension-status events, and completed exports.
- Added and refined glossary terms; updated [[access-model]], [[backend-roadmap]], [[retention-model]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Access Offers and active tournament discovery

- Renamed private authority grants from Authority Invitations to Access Offers and placed them in a separate Access Inbox for School Membership and tournament and platform roles.
- Prohibited Access Offers from serving as tournament discovery, Competitor records, or ordinary Judge onboarding and kept the Invitations section exclusively as the Active Tournament Directory.
- Made first Tournament Invitation Page publication add a tournament to the directory, excluded Drafts, listed every published active tournament, removed canceled tournaments, and moved Closed tournaments into a searchable Tournament Archive.
- Required Google authentication for directory browsing while preserving public direct-link Tournament Invitation Pages.
- Selected listing fields, underway-first then nearest-date default order, alternative sorts, search, filters, and keyboard and screen-reader operation without exposing internal metadata.
- Added Register or Manage Entries for Coaches with the required School Membership and Judge This Tournament for self-service availability and event-preference submission without guaranteed acceptance or assignment.
- Added and refined glossary terms; updated [[tournament-directory-model]], [[access-model]], [[backend-roadmap]], [[registration-model]], [[judge-qualification-model]], [[tournament-lifecycle-model]], ADR 0029, and the index.

## [2026-09-01] checkpoint | Tournament Archive and Judge pool commitment

- Prohibited batch Access Offers and required individual review and issuance for every private School Membership and tournament or platform authority grant.
- Kept canceled tournaments out of the active directory while retaining public direct pages with canceled status, date, Director-supplied explanation, prior publications, and applicable Correction Notices.
- Made the Tournament Archive public and unauthenticated, added the accepted search, filters, newest-first and alternative sorting, current and prior public result versions, and chronological Correction Notices.
- Adopted accessible cursor-based pages of 50 for active and archived tournaments with preserved search, filters, sort, and return position.
- Required Director or Judge-and-room-authorized staff acceptance of Judge Pool Participation after qualification, preference, availability, and conflict validation.
- Allowed ordinary Judge withdrawal only before the 96-hour Judge Withdrawal Lock Time and created a Special Circumstance Withdrawal path afterward, with schedule revision for affected published assignments.
- Distinguished Independent and Judge-confirmed School-Supplied participation without changing qualification.
- Routed a missing existing-School Membership request to the current School Manager for sign-off and retained the Provisional School and platform verification path where no verified School or Manager exists.
- Added glossary terms and updated [[tournament-directory-model]], [[access-model]], [[backend-roadmap]], [[registration-model]], [[judge-qualification-model]], [[scheduling-model]], ADR 0029, and the index.

## [2026-09-02] checkpoint | Tournament discovery and Judge Pool governance

- Kept canceled tournaments out of every Docket search, index, and archive while retaining their previously established direct public pages for people who already have the links.
- Made current corrected archived results the default, kept Correction Notices visible, and exposed prior public versions only through expandable Tournament Publication History labeled Superseded.
- Added country, state, city, and user-entered postal-radius discovery without Google or required device location and allowed named Saved Tournament Filters to synchronize across devices.
- Required in-app and email Judge Pool acceptance or categorized decline notices without qualification consequences.
- Made the accepted Judge Pool viewable to Coaches, the Tournament Director, and Students or Competitors; retained authorized operational staff access; and left the non-Account Competitor delivery mechanism and exact visible fields open.
- Rejected automatic Judge Pool capacity limits and waitlists for the first release.
- Anchored the withdrawal lock to an explicit Tournament Start Time in the tournament timezone, fixed it at 96 hours, and prohibited moving it earlier after Judge participation opens.
- Adopted category-and-explanation Special Circumstance Withdrawal without medical records, immediate operational unavailability, authorized Excused or Unexcused classification, privacy-minimized notices, and schedule-impact handling.
- Counted a School-Supplied Judge toward its School obligation only after Judge confirmation and tournament acceptance and governed relationship corrections before and after the withdrawal lock.
- Added and refined glossary terms; updated [[tournament-directory-model]], [[access-model]], [[judge-qualification-model]], [[scheduling-model]], [[backend-roadmap]], [[final-results-model]], [[tournament-lifecycle-model]], [[retention-model]], and the index.

## [2026-09-02] checkpoint | Authenticated Competitors and account safeguards

- Superseded the assumption behind Question 208: every production Competitor is one individually authenticated Docket Account rather than a School-owned record; record-only Competitors are permitted solely as non-production test fixtures.
- Created ADR 0030, marked ADRs 0002 and 0003 superseded, preserved represented School on historical Entries, and left Competitor-School linkage, Coach-versus-Competitor authority, verification, consent, recovery, and minor safeguards for explicit design.
- Required canceled direct pages to publish noindex instructions, remain outside public sitemaps, and receive no internal discovery links.
- Limited each Account to 20 Saved Tournament Filters, allowed one explicitly chosen default, and prohibited automatic location selection or storage.
- Added synchronized Saved Tournaments with separate opt-in change subscriptions; cancellation sends one notice and removes the tournament from saved discovery.
- Set School Membership requests to expire after seven days or at the registration deadline, added reminders and reasoned Manager decisions, permitted one materially corrected re-request, and prohibited platform override of an active Manager.
- Made loss of a School-Supplied Judge create an immediate obligation deficit with notices, replacement through the published deadline, and only locked-Registration-Policy remedies afterward.
- Retained an Unexcused Special Circumstance Withdrawal as a restricted two-year Judge Reliability Record without private explanation, automatic qualification change, rejection, or blacklist; Excused outcomes create no negative cross-tournament disclosure.
- Required fresh Google reauthentication for asynchronous Account Data Exports, limited successful generation to one per 24 hours, prohibited email attachments, and deleted generated archives after seven days.
- Limited self-service Docket Display Name changes to one every 30 days with documented early safety or identity correction and preserved historical publication names.
- Prohibited importing Google profile images.
- Added and refined glossary terms; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[judge-qualification-model]], [[scheduling-model]], [[backend-roadmap]], [[retention-model]], ADRs 0021, 0023, and 0029, and the index.

## [2026-09-02] checkpoint | Competitor affiliation and direct access

- Required a School Roster Manager to initiate every Competitor School Invitation and the identified Competitor to accept it; prohibited Competitor-initiated affiliation and every form of email-domain matching.
- Limited each Competitor Account to one current School Affiliation and kept the same Account when a destination-School invitation replaces it.
- Preserved the requested cross-School information merge as an open transfer-data boundary because moving current profile data conflicts with rewriting historical Entry and School attribution.
- Allowed authorized Coaches to manage affiliation and School-scoped Entry information while prohibiting edits to the Competitor's Google identity, Account security, Docket Display Name, settings, exports, or another School's data.
- Kept Docket Display Name and profile control with the Competitor and allowed Schools to report—but not directly edit—identity or eligibility concerns.
- Limited direct Competitor tournament notices to their own Pairing Publications, Disqualifications, and Corrections; routed Entry acceptance and rejection notices and authority to the responsible Coach and authorized tournament staff.
- Required Google recovery followed by Platform Identity Review for Competitor Account recovery and prohibited School actors from taking control or selecting the replacement identity.
- Confined record-only Competitor Test Fixtures to non-production environments and a versioned validated JSON format containing synthetic identity, School, and test eligibility fields without real contact, Google, or authority data.
- Limited the authenticated Coach and Competitor Judge Pool view to each accepted Judge's Docket Display Name, Independent or School-Supplied affiliation, and accepted event categories while restricting all qualification, assessment, operational, contact, request, profile, and withdrawal details.
- Allowed a Competitor to request Account deactivation during an active tournament but postponed the seven-day execution window until no active Entry or ongoing tournament obligation remains, preserving all historical tournament records.
- Refined ADR 0030 and the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[judge-qualification-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Competitor transfer, Entry authority, and Judge conflicts

- Made Competitor profile settings and personal tournament history follow the Account across School transfer while preserving historical represented-School attribution and withholding every former-School private note, attestation, accommodation, communication, evidence item, and internal record.
- Bound Competitor School Invitations to an exact verified Google email, delivered them by email and private inbox, set seven-day expiry and pre-acceptance revocation, made duplicate issue a no-op and resend nonextending, and required revoke-and-reissue for a wrong recipient.
- Allowed the Competitor or Roster Manager to end affiliation, blocked new old-School Entries immediately, and delayed final removal while an active Entry still represents that School.
- Assigned Entry preparation, submission, update, and withdrawal to the Entry Manager; required Competitor identity, represented-School, and event confirmation before first submission; and allowed private error reports without independent Entry action.
- Kept Competitor Account suspension from withdrawing an Entry or creating a competitive outcome.
- Required School attestation that necessary permission and consent exist before a minor Competitor accepts affiliation or participates, while excluding guardian contact information and full birth date from Core Entry Data.
- Reserved verified Judge Conflict submission to the Competitor's Coach and separated it from an optional tournament-configured Judge Striking Policy.
- Began the seven-day Competitor deactivation window only after there is no future round assignment and every response-required Disqualification or Correction is resolved or expired, without waiting for Tournament Closure or unrelated Judge feedback.
- Extended the same minimal accepted Judge Pool view to accepted Judges while limiting pending and declined Judges to their own status.
- Refined ADR 0030 and the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[judge-qualification-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Transfer timing, Judge strikes, and No-Show replacements

- Made a School transfer immediate for future activity while preserving every existing Entry's represented School through its tournament, prohibited dual-School representation in one tournament, and required notices to the Competitor and both Schools' authorized Managers.
- Adopted private Competitor Entry Error Reports with Coach response within 24 hours or the next applicable deadline, followed by School Manager and tournament registration escalation without direct Entry mutation.
- Limited Minor Participation Authorization to School actor, time, School, Competitor, policy or legal basis, and expiry; made it valid for one school year; required renewal after School transfer or material policy change; and prohibited default guardian-document collection.
- Made authorization revocation block future Entries immediately while routing an active Entry through a noticed Director-reviewed eligibility or withdrawal workflow rather than silent withdrawal or disqualification.
- Made Judge striking optional per event, published it before registration, and locked it with the Pairing Plan subject to existing pre-tournament emergency correction.
- Let each individual or team Entry choose its strikes, required Coach approval before delivery to the Tournament Host, and adopted equal hard-strike allowances plus ranked preferences while preserving verified conflicts as separate uncapped hard constraints.
- Restricted strike selections to the submitting Competitors and Coach and authorized pairing or Judge-room staff, hid them from Judges and opposing Schools, and allowed only anonymized operational aggregates.
- Required a published grace period and documented contact attempts before No-Show classification and routed competitive consequences through the locked Ruleset.
- Prohibited Docket from automatically placing a replacement Judge or Competitor into a round; allowed only a Replacement Candidate Pool followed by Tabulation Staff sign-off and the governed pairing or scheduling workflow.
- Applied the restricted two-year Judge Reliability Record to Unexcused Judge No-Shows without automatic qualification changes.
- Made the participant Judge Pool current-only and subject to change, updated additions and removals immediately, and kept change actors, reasons, timestamps, and history restricted.
- Refined ADR 0030 and the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[judge-qualification-model]], [[backend-roadmap]], [[retention-model]], and the index.

## [2026-09-02] checkpoint | Judge Strike Window and guarded No-Show resolution

- Opened Judge striking exactly 36 hours before Tournament Start Time and closed it exactly 24 hours before start.
- Required fresh Coach approval after every pre-deadline edit and limited post-deadline changes to documented input correction or a supplemental strike against a newly added Judge, never a strategic response to a known opponent or pairing.
- Allowed an Entry's Competitors to choose their strikes while giving the responsible Coach final resolution authority when teammates disagree.
- Blocked Pairing Publication when verified conflicts and hard strikes leave no qualified Judge and allowed only adding an eligible Judge or voluntarily releasing a strike, never silent constraint override.
- Defaulted the No-Show grace period to ten minutes after the current published round start, allowed a separately published per-event duration before Schedule Selection, and prohibited shortening it after publication.
- Required in-app and email notices plus an operational attempt through the responsible Coach or Judge's restricted tournament contact method, without requiring or exposing a minor Competitor's phone number.
- Assigned No-Show classification to Judge-and-room-authorized Tabulation Staff and required Director review only for a dispute or Ruleset competitive penalty.
- Required complete eligible Replacement Candidate Pools with separate recommendation rankings and retained the prohibition on automatic insertion.
- Restricted Competitor replacements to authenticated, authorized, eligible, same-School and same-event candidates without assignment conflicts and subject to the locked Ruleset's timing and substitution permissions.
- Made failure to find a replacement Competitor produce a Ruleset-governed Bye Round for the opposing Entry without a fabricated opponent, Judge Ballot, or Judge-submitted Speaker Points.
- Required Tabulation Staff sign-off to create a new validated pairing or schedule version, preserve the original, notify affected parties, and publish a Correction Notice when public information changed; Started and Completed rounds remain immutable.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[judge-qualification-model]], [[ballot-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Native strike portal and No-Show disputes

- Replaced the relative 24-hour strike deadline with 3:00 p.m. in the tournament timezone on the calendar day before the tournament while retaining opening at 36 hours before Tournament Start Time.
- Prohibited ordinary post-close Judge Pool additions and removed the supplemental-strike workflow; emergency post-close replacement remains a separate open branch.
- Made Judge Strike Submission a native Docket portal workflow whose transactional in-app receipt makes Coach approval operative without emailing the Tournament Director or an external host.
- Kept unapproved selections nonoperative, added reminders six and one hours before closing, and limited late submission to a verified Docket outage with Director approval before an opponent or pairing is known.
- Allowed only a Coach assigned to the affected Competitor or Entry to resolve teammate disagreement, approve strikes, or make a final voluntary release after reviewing an infeasible assignment warning with the Competitors.
- Required the School to attest that every applicable School, tournament, home-jurisdiction, and host-jurisdiction minor-participation requirement is satisfied under the strictest declared standard; unresolved conflicts block affiliation or participation without Docket interpreting law.
- Gave a Competitor 60 minutes or until the event's next round starts, whichever comes first, to file a private No-Show Dispute with their Coach while keeping the current operational resolution in effect during Director review.
- Allowed Tabulation Staff to restore a late-arriving original assignee before replacement sign-off, required a Director correction after replacement or bye approval, and prohibited restoration after the round starts.
- Retained Competitor No-Show classification and resolution only as restricted seven-year evidence for that tournament, visible to the Competitor, authorized Coach, and authorized staff, with no public or cross-tournament reliability record.
- Required the locked Standings Rules Configuration to define No-Show Bye Round wins, losses, points, and opponent adjustments without fabricated Judge Ballots or Judge-submitted Speaker Points.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[ballot-model]], [[standings-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Emergency Judges and direct No-Show review

- Allowed an Emergency Replacement Judge after strike close only for an unexpected withdrawal or No-Show and only through reasoned Tournament Director or Judge-and-room-authorized Tabulation Staff approval.
- Required current qualification and verified-conflict validation, preferred eligible Judges available during the strike process, did not reopen discretionary strikes, and required assignment-specific Tabulation Staff sign-off.
- Applied one Judge Strike Window to an entire multi-day tournament unless the pre-registration policy deliberately defines separate event sessions.
- Made the tournament's official named timezone and local calendar control the 3:00 p.m. deadline across daylight-saving changes while also displaying each user's local equivalent.
- Limited a verified Docket-outage recovery window to affected Entries, the actual outage duration, and 30 minutes maximum, with Director approval and no known opponent or pairing.
- Required one Primary Responsible Coach per Entry and allowed one Backup Responsible Coach predesignated before striking, with active School Membership tied to the affected Competitors and action provenance.
- Retained Judge Strike selections, approvals, corrections, releases, and assignment provenance for the same restricted seven-year Competitive Evidence period as other Competitor tournament records, without a special extension.
- Allowed Competitors to file No-Show Disputes directly in Docket, automatically associated and notified the responsible Coach, permitted a Coach statement, and prohibited Coach blocking, withdrawal, or suppression.
- Accepted check-in, arrival, messaging, staff-contact, Docket delivery, and incorrect published time or room evidence without requiring medical records; treated an absence explanation as consequence evidence rather than proof of misclassification.
- Required the Tournament Director to decide within 30 minutes after filing or before the next event round starts, kept the current resolution operative, and escalated overdue review without automatic approval or denial.
- Made a successful dispute append a reasoned reversal, clear the current restricted No-Show flag, correct unstarted artifacts, preserve the original classification in restricted audit history, and leave Started and Completed pairings as operated under the locked Ruleset.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[judge-qualification-model]], [[ballot-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Emergency assignment notices and final No-Show decisions

- Required immediate in-app and email notice of an Emergency Replacement Judge to the assigned Judge, affected Competitors and Coaches, Tournament Directors, and relevant Tabulation Staff using a generic operational reason that withholds private withdrawal and No-Show evidence.
- Required the emergency Judge to acknowledge receipt and availability before the round may start, kept the assignment unconfirmed until acknowledgment, and allowed Tabulation Staff to choose another eligible candidate.
- Kept Emergency Replacement Judge use uncapped while requiring a fresh reason and sign-off for every use, raising a Director staffing warning on repeated use, and prohibiting use as a Judge Pool or strike bypass.
- Allowed an affected Coach to report a verified conflict, qualification error, or assignment-data error before the round while denying a new discretionary strike or veto.
- Made a Tournament Director's rejected No-Show Dispute final for the tournament except for an objective system or data-entry correction through the existing governed correction workflow.
- Required a private rejection notice to the Competitor and responsible Coach containing the decision, general reason category, Ruleset consequence, authority, and time without private staff notes or third-party restricted information.
- Allowed only the filing Competitor to withdraw a No-Show Dispute before decision, preserved the operative classification, and retained the withdrawal audit event.
- Required a public correction to use “No-Show classification corrected,” identify only the previous and corrected public artifact and competitive effect, and withhold absence details, evidence, reasoning, and restricted actor metadata.
- Required an accepted dispute affecting published standings to recalculate from authoritative records, invalidate affected approvals, republish a new snapshot, preserve operated rounds, and surface downstream conflicts.
- Blocked the affected event's Final Results Publication and Tournament Closure until every timely filed No-Show Dispute is decided.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[ballot-model]], [[standings-model]], [[final-results-model]], [[tournament-lifecycle-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Emergency delivery guards and out-round verification

- Required an Emergency Replacement Judge to acknowledge within ten minutes of notice and always before round start, using the remaining pre-start interval when shorter.
- Required staff to find another Judge after a third failed delivery attempt and kept the assignment unconfirmed until acknowledgment.
- Applied the ordinary Judge No-Show grace, contact, classification, and reliability workflow when an acknowledged Emergency Replacement Judge does not appear; any further replacement requires a new emergency decision and sign-off.
- Made a verified Coach-reported conflict invalidate the assignment and required urgent resolution of any qualification or assignment-data allegation that could make it invalid before start, without granting a new strike or veto.
- Triggered repeated-emergency-use warnings on the second use in one event or third tournament-wide, whichever occurs first, and on every later use.
- Limited tentative emergency-Judge identity, Published Judging Profile, and Unconfirmed status to affected Competitors and Coaches and authorized staff until acknowledgment and final sign-off.
- Made rejected-dispute notices delivery-tracked in-app and email messages that require no acknowledgment, remain in the Competitor Account, and do not reopen the dispute or delay operations after delivery failure.
- Made an explicitly confirmed No-Show Dispute withdrawal final for that classification while preserving the objective-error correction path.
- Required a staff-completed Out-Round Verification Gate before each elimination Pairing Publication and the next elimination-round start so current results, Administrative Outcomes, disputes, eligibility, Advancement Field, and bracket lineage prevent ordinary late advancement or award changes.
- Retained dependent invalidation, recalculation, Downstream Conflict, and correction workflows only as an exceptional fallback if an objective system or input defect escapes out-round verification, while preserving Started and Completed rounds.
- Routed an objective post-Closure No-Show decision error through a scoped Post-Closure Correction Case without reopening the tournament or replacing current public results before approved republication.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[ballot-model]], [[advancement-model]], [[award-model]], [[final-results-model]], [[tournament-lifecycle-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Native out-round review and configurable gate approval

- Defined one Emergency Judge delivery attempt as a timestamped cycle dispatching both the in-app and email notices; the cycle fails only when neither channel confirms delivery, while successful delivery without acknowledgment remains an acknowledgment timeout.
- Made three failed delivery cycles end only the unconfirmed assignment as Delivery Failed, without a Judge No-Show or Judge Reliability Record.
- Made late acknowledgment unable to revive a replaced assignment and required a new governed assignment before that Judge may be selected again.
- Allowed staff to use and record the Judge's restricted operational contact method during delivery trouble while prohibiting staff from acknowledging on the Judge's behalf.
- Required two distinct actors for Out-Round Verification: Pairing-authorized Tabulation Staff performs the full review and a second actor carrying a tournament-specific permission selected by the Tournament Director confirms it.
- Expanded the verification checklist to include the prior result or Administrative Outcome, Ballot or panel majority, disputes, corrections, disqualifications, Entry identity and School, seed, bracket position, sides, opponent, Judge qualification and conflicts, room, time, Advancement Field, and bracket lineage.
- Made Docket auto-populate every out-round from the native Tournament Schedule, Advancement Field, bracket, and eligible Judge pool as a nonoperative Pending Out-Round Schedule Review that Tabulation Staff may confirm, deny, or edit before verification and publication.
- Made any relevant source change stale the verification and required a brief two-person no-change confirmation before round start.
- Allowed a failed pre-publication gate to proceed through an Out-Round Gate Override only after Docket flashes a warning about potential competitive and downstream consequences; override authority and audit details remain open.
- Required an error found during the pre-start confirmation to return to the full first verification, correct the authoritative source, regenerate the pending review, and repeat two-person approval and republication.
- Preserved an out-round mistakenly started without the gate, created a high-priority Downstream Conflict for Director resolution, and limited correction to unstarted downstream artifacts.
- Made Docket the native source of every Tournament Schedule and recommended that in-tournament staff edits occur only for Judge or Competitor No-Shows, conflicts, disqualifications, room changes, or comparable tournament-critical operations through the existing revision workflow.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[advancement-model]], [[judge-qualification-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Out-round override authority and critical schedule edits

- Required the Tournament Director to select the second out-round confirmation permission before Tournament Schedule Publication and locked that selection when the first tournament round starts.
- Allowed only a reasoned Director correction after the lock for prospective staffing access and prohibited rewriting completed confirmations.
- Made the selection a tournament-scoped permission bundle rather than a named-person assignment; any active holder may confirm, but the confirmer must differ from the first verifier.
- Assigned objective post-Closure No-Show correction initiation and approval to the Tournament Director and limited Platform Administrators to validating system evidence without deciding or changing results.
- Limited qualifying post-Closure No-Show evidence to objective delivery logs, check-in records, immutable timestamps, proven published time or room errors, and proven data-entry defects; new merits explanations do not qualify.
- Reserved Out-Round Gate Override to the Tournament Director plus a second distinct active holder of the configured confirmation permission.
- Required every override to show a competitive-risk warning and retain failed checks, impact preview, reason, affected round and Entries, source versions, actors, and time in restricted staff and audit projections.
- Allowed override only for operational uncertainty or incomplete verification and prohibited overriding verified conflicts, eligibility, Judge qualifications, disqualifications, governing Rulesets, bracket identity, and other hard integrity constraints.
- Required Pairing-authorized Tabulation Staff to prepare live native schedule revisions, the Director to approve the exact version and impact preview, and the Director or Publication-authorized staff to publish it.
- Defined typed critical live-edit reasons, including an `Other Tournament-Critical Operation` category requiring an explanation and impact statement; noncritical edits remain possible only with a stronger warning and explicit necessity confirmation.
- Refined the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[advancement-model]], [[final-results-model]], [[tournament-lifecycle-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Single-person out-round exception and seven-day correction limit

- Preserved the first verifier's work when an intended confirmer loses permission before acting, provided the exact governing source versions remain unchanged, and required any replacement confirmer to hold the active configured permission.
- Allowed one authorized person to complete Out-Round Verification when no eligible second confirmer is available, with a prominent warning that verification separation is absent.
- Kept every earlier Gate Override visibly marked during pre-start confirmation, required two distinct authorized actors to reconfirm the exact version, and made any new hard-constraint failure block the round.
- Kept a restricted active-risk warning visible through affected-round completion and downstream review and retained the full override record as Seven-Year Competitive Evidence.
- Required a harmless override review to close the warning as `Reviewed—No Competitive Effect`, preserve the audit record, and avoid a public Correction Notice unless public information changed.
- Required critical live schedule-edit notices for affected Judges, Competitors, responsible Coaches, Directors, and relevant Tabulation Staff, with a public Correction Notice only when previously public schedule information changed.
- Required acknowledgment only from Judges whose assignments, rooms, or times changed; Competitor and Coach notices remain informational, and a missing Judge acknowledgment activates continuity escalation without creating participant veto power.
- Allowed reversal of a published critical edit before round start only through a new Schedule Reversal Revision with fresh impact review, Director approval, publication, and notices; preserved the intervening version and prohibited reversal after start.
- Limited objective post-Closure No-Show edits to the first seven days after Tournament Closure.
- Made a rejected post-Closure correction reasoned, privately noticed to the affected Competitor and responsible Coach, retained for seven years, and final on the submitted evidence; materially different objective evidence may support only another timely case.
- Added the Single-Person Out-Round Verification Exception and Schedule Reversal Revision to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[advancement-model]], [[final-results-model]], [[tournament-lifecycle-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Roster authority, cross-entry conflicts, and event workspaces

- Reserved activation of each Single-Person Out-Round Verification Exception to a Tournament Director for one exact round and schedule version after confirming that no eligible second verifier is reasonably available.
- Required the single verifier to hold Pairing authority, allowed a Director with that authority to act, and did not require the unavailable second-confirmation permission.
- Kept the activation reason, verifier-availability check, affected round, exact sources, warning acknowledgment, actor, and time restricted to staff and audit views unless a later public correction is independently required.
- Allowed a freshly warned single-person exception for a non-overridden pre-start no-change review when separation remains unavailable, while preserving the two-distinct-actor requirement for every overridden gate.
- Made each exception round-and-version specific so a source change or later round requires a new Director activation and warning.
- Kept critical schedule revisions operative through delivery failure, required three in-app-and-email delivery cycles with operations escalation, and allowed restricted Judge contact without surrogate acknowledgment.
- Required a changed Judge to acknowledge within ten minutes after successful delivery and no later than the revised round start, with missed deadlines activating the Judge Continuity Plan and replacement workflow.
- Allowed any currently authorized Tournament Director to approve a Schedule Reversal Revision while preserving the prior and reversing approvers and their reasons.
- Defined the post-Closure No-Show correction window as exactly 168 hours from the immutable Closure instant and required an unresolved case to expire without further edit, republication, or public-result change.
- Required each production Competitor to authenticate and accept a School affiliation before entering that School's Tournament Roster, and limited roster placement and Entry preparation to Coaches holding the applicable School-side authority.
- Made overlapping event round blocks on the Tournament Schedule published through the Tournament Invitation Page a hard Cross-Entry Schedule Conflict.
- Required every configured event to maintain an Event Workspace for practice and tournament rounds, locations, assignments, and role-appropriate participant activity.
- Added Tournament Roster, Cross-Entry Schedule Conflict, and Event Workspace to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[pairing-model]], [[scheduling-model]], [[advancement-model]], [[final-results-model]], [[tournament-lifecycle-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Coach sign-off and compatible-tournament cross-entry

- Made Entry Manager the existing School role for Tournament Roster placement and final School sign-off instead of creating a general scheduling role that could be confused with tournament schedule authority.
- Preserved composable School roles so the one exclusive School Manager may also be the Entry Manager Coach overseeing Tournament Roster scheduling.
- Replaced the prior Competitor Entry Confirmation requirement with final responsible-Coach sign-off while retaining the Competitor's private Entry Error Report and lack of independent Entry authority.
- Kept the current Tournament Schedule published through the Tournament Invitation Page authoritative for overlap validation and required every published revision to revalidate Entries.
- Defined an overlap as any positive intersection between published round intervals using start time and expected duration, allowed adjacent intervals, and excluded Scheduled Breaks from participation.
- Prohibited overlapping participation by default but allowed the invitation to label a tournament Cross-Entry Compatible.
- Required the responsible Coach to submit a request for one Competitor and affected events, allowed tournament staff to review and prepare it, and reserved exact feasibility approval to the Tournament Director.
- Required Docket to display a prominent warning that approving cross-entry may delay the Tournament Schedule and made approval request-specific rather than a general conflict waiver.
- Gave authorized staff a complete Event Workspace, Competitors and Coaches their own or School-scoped event schedule and statuses, assigned Judges their assigned rounds, and Public Viewers only already-public schedules, Pairings, and results.
- Limited Event Workspace activity status to check-in, assignment, room, Judge acknowledgment, and Scheduled, Started, Completed, or Result Pending states without exposing private messages, detailed Ballots, strikes, conflicts, assessments, staff notes, or another School's restricted information.
- Created nonoperative Event Practice Mode whose mock rounds, assignments, Ballots, and results cannot affect official tournament records, qualifications, standings, Pairings, notices, or history.
- Created a read-only Personal Tournament Agenda that combines already-authorized assignments across Event Workspaces and highlights conflicts without replacing event views or expanding access.
- Added Cross-Entry Compatible Tournament, Cross-Entry Request, Event Practice Mode, and Personal Tournament Agenda to the glossary; refined Entry Manager and Cross-Entry Schedule Conflict; removed the superseded Competitor Entry Confirmation term; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Cross-entry holds and independent practice workspaces

- Locked the Cross-Entry Compatible choice before registration opens and prohibited later enablement after Schools begin planning Entries.
- Set the Cross-Entry Request deadline to the earlier of the Entry edit deadline or the first Pairing Publication for either affected event and required publication on the invitation page.
- Bound each request to one Competitor, one School, the complete requested event set, and the current published Schedule; adding an event requires a new request and each Schedule revision revalidates approval.
- Reduced the Tournament Director's approval duty to verifying the cross-entry and acknowledging Docket's warning that it may delay the Tournament Schedule.
- Adopted a published Director-configured Cross-Entry Hold Limit before registration, defaulting to fifteen minutes, and prohibited approval beyond it.
- Allowed the Director to revoke an approval before either affected round starts when it becomes infeasible, with immediate Coach and Competitor notice and a block on affected future Pairings until resolved.
- Restricted the cross-entry indicator and applicable hold time to each affected round's assigned Judge among round participants; kept the request private from opponents and the public while preserving requesting-party status and authorized staff operations.
- Allowed Entry Managers to create tournament-independent Practice Workspace sessions for affiliated Competitors, voluntary Judges, and explicitly authorized observers.
- Allowed Practice Invitations to external Schools through email links without creating School affiliation, tournament Entry, or tournament authority.
- Fixed all Practice Workspace content retention at thirty days and placed practice behind a separate main-interface action independent of any tournament.
- Enabled in-app and email Personal Tournament Agenda alerts for assignments, time or room changes, cancellations, and detected conflicts without creating new acknowledgment requirements.
- Replaced Event Practice Mode with Practice Workspace and added Cross-Entry Hold Limit and Practice Invitation to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Cross-entry hold execution and practice governance

- Started each Cross-Entry Hold automatically at the affected round's current published start and allowed only a pre-start published Schedule revision to move that start.
- Prohibited Judge or Coach extensions, made timely arrival clear the hold and record actual start, and transitioned expiry directly into ordinary Competitor No-Show processing without stacked grace.
- Bound each Practice Invitation to one exact Google-authenticated email recipient and one session, with expiry after seven days or session end.
- Allowed pre-acceptance invitation revocation and prospective removal after acceptance.
- Required an authorized Coach from an external minor's own School to approve the minor's invitation and prohibited an unrelated School Coach from supplying that authorization.
- Made the creating Entry Manager the Practice Session Owner and allowed transfer only to another Entry Manager at the same School, without granting official tournament authority.
- Allowed participants to delete their own drafts and unshared material and allowed warned whole-session deletion by the owner, with no official-record impact.
- Prohibited practice rankings and permanent performance history and limited pre-deletion exports to each participant's own Ballots and feedback without others' private material.
- Added Practice Session Owner to the glossary and updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Practice invitation lifecycle and private workspace controls

- Preserved the same recipient, token, and expiration when resending a Practice Invitation and required revocation plus a new invitation for a wrong recipient.
- Made accepted-participant removal immediate, reasoned, and noticed while preserving a seven-day-or-earlier-deletion export of only that participant's own material.
- Made Practice Workspaces private, nonpublic, and undiscoverable outside the owner, accepted participants, and explicitly authorized observers.
- Adopted least-privilege Organizer, Competitor, Judge, and Observer roles with compatible multi-role assignment and role-specific submission limits.
- Made Practice Workspace closure irreversible, locked new activity after closure, and prohibited closure from extending deletion beyond thirty days after creation.
- Superseded the earlier external-minor own-School approval requirement by allowing any exact-email recipient with a Docket Account, including a minor, to accept a Practice Invitation without School approval.
- Required privacy-minimized Organizer, School, event, time, role, expiration, participating-School, and policy information before invitation acceptance.
- Limited copied sessions to reusable configuration and prohibited copying participants, invitations, acceptance, Ballots, feedback, notes, or completed results.
- Kept Judge identity public while restricting practice feedback and preserving the private session's undiscoverable status.
- Created restricted Practice Safety Reports for the owner and platform safety staff, with available own-School Coach notice when a minor is affected, and separated safety evidence from ordinary practice deletion and official tournament records.
- Added Practice Participant Role and Practice Safety Report to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Practice safety governance and live-session boundaries

- Kept a Judge's ordinary Docket identity and public profile public while withholding participation in a specific private Practice Workspace and restricting all practice feedback.
- Assigned formal Practice Safety Report decisions to platform safety staff, allowed the owner to remove a participant immediately, and prohibited the owner from suppressing or finally deciding a report.
- Retained only the minimized safety report, decision, and necessary evidence for two years after resolution and excluded it from Account exports unless legally required.
- Allowed one reconsideration within fourteen days by a different platform safety reviewer, kept protective restrictions active during review, and made the second decision final except for objective system or identity error.
- Allowed platform safety staff to restrict an Account from the affected session and new Practice Invitations while requiring the existing suspension workflow for broader Account restrictions.
- Made the event format govern required Competitor structure and allowed owner-configured Judge and Observer limits within a platform safety and performance maximum.
- Completely separated practice timing from official tournament scheduling, conflict checks, blocks, and overlap warnings.
- Required in-app and email notices for invitation, acceptance, material pre-lock time or role changes, removal, cancellation, and closure, with action required only for acceptance.
- Prohibited practice absences from creating No-Show, reliability, qualification, or tournament history.
- Created a Practice Role Lock at session start and prohibited all participant role changes afterward.
- Added Practice Role Lock to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[retention-model]], [[backend-roadmap]], and the index.

## [2026-09-02] checkpoint | Practice evidence controls and Google meeting delivery

- Allowed notified Practice Participant Role reductions before start and required participant acceptance before a pre-start change grants new access or submission authority.
- Reaffirmed that no live role changes are allowed and left the exact same-role absent-participant replacement mechanism unresolved.
- Capped each Practice Workspace at one hundred accepted Accounts while recording that ordinary practice rounds should remain substantially smaller.
- Limited complete Practice Safety Report evidence to platform safety staff, gave parties only their own submissions and minimized decisions, and restricted owners and minor Coaches to operational or safeguarding information.
- Allowed versioned correction of proven identity, timestamp, delivery, or system errors throughout safety-record retention without reopening the merits.
- Applied the existing exact-record, two-person Legal Hold workflow to Practice Safety Report evidence.
- Required authenticated reporting, protected reporter identity from the reported Account unless safety, fairness, or law requires disclosure, and separated malicious-report investigation from unsuccessful good-faith reporting.
- Routed proven malicious reporting through existing Account governance without effects on tournament results, qualifications, or competitive history.
- Made Practice Workspace cancellation irreversible, reasoned, noticed, and subject to the original thirty-day deletion deadline.
- Prohibited native or imported practice audio and video recordings while requiring Docket to create a Google Meet link for online debate or speech practice and send it to the assigned Competitors and Judges.
- Added Google Practice Meeting to the glossary; updated [[access-model]], [[registration-model]], [[tournament-directory-model]], [[scheduling-model]], [[retention-model]], [[backend-roadmap]], and the index.
