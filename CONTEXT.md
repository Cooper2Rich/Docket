# Docket Tournament Domain

Canonical language for the speech and debate tournament concepts represented by Docket.

## Language

**Lincoln-Douglas Debate**:
A one-on-one debate event in which one entry is assigned the affirmative side and the other is assigned the negative side for a round.
_Avoid_: Lincoln Douglas, LD Debate

**Ruleset**:
An immutable, identified version of the default tournament rules adopted for an event.
_Avoid_: Configuration, settings template

**Tournament Override**:
An explicit, tournament-scoped replacement for an allowed value in the adopted Ruleset.
_Avoid_: Custom rule, setting

**Pairing Publication**:
The release of a round's competitor, side, judge, room, and schedule assignments to tournament participants.
_Avoid_: Pairing creation, draw

**Pairing Approval**:
The attributed authorization by a Tournament Director or Pairing-authorized Tabulation Staff member of one exact Docket-validated ordinary pairing version before publication.
_Avoid_: Validation, Pairing Publication, correction sign-off

**Pairing Lifecycle**:
The required Draft, Generated/Entered, Validated, Approved, Published, Started, and Completed state sequence for a round pairing, with Withdrawn available only from Published before Started.
_Avoid_: Ballot state, skipped publication, editable started pairing

**Pairing Plan**:
A versioned tournament policy containing an ordered Round Specification for every configured round and allowing supported pairing methods and options to vary by round within the adopted Ruleset.
_Avoid_: Universal pairing algorithm, one generated pairing

**Pairing Method Catalog**:
The platform-controlled set of versioned pairing strategies available for Round Specifications, initially Random Draw, Preset, Seeded High-Low, Power High-Low, Power High-High, Round-Robin, Seeded Elimination Bracket, and Fully Manual Pairing.
_Avoid_: Tournament-supplied code, one tournament's Pairing Plan

**Round Specification**:
The Pairing Plan component defining one round's stage, pairing method and options, side policy, bracket and bye behavior, configurable avoidance rules, and matching Tournament Schedule block.
_Avoid_: Round result, actual Entry pairing

**Flip Round**:
An elimination round in which opponents without a prior matchup determine affirmative and negative sides through the tournament's locked flip procedure without considering cumulative preliminary side balance.
_Avoid_: Random pairing, side-balanced preliminary, prior-match side lock

**Prior-Match Side Lock**:
The Pairing Plan rule that replaces an elimination-round flip by reversing sides from the opponents' most recent prior Pairing Publication that reached Started state and records that source pairing independently of its Ballot result.
_Avoid_: Cumulative side balance, discretionary side choice after pairing

**Pairing Plan Revision**:
A versioned post-Tournament-Schedule-Publication proposal changing permitted fields of the published Pairing Plan while preserving every locked pairing method and option, prepared by Pairing-authorized staff or a Director and requiring Director approval and republication with an impact preview and reason.
_Avoid_: Draft edit, silent policy change, Schedule Revision Proposal

**Pairing Configuration Lock**:
The Schedule Selection boundary that locks every configured round's method and method-defining options, subject only to a Director-performed Pre-Tournament Emergency Pairing Correction before any round starts.
_Avoid_: Pairing Plan publication lock, schedule input, unrestricted revision

**Pre-Tournament Emergency Pairing Correction**:
A Tournament Director-performed and approved replacement of a locked pairing method or option before any round starts, requiring a reason, validation report, impact preview, explicit confirmation, new immutable version, and republication.
_Avoid_: Round Pairing Correction, Emergency Amendment after rounds start, staff action

**Round Pairing Correction**:
An error-only change to one unstarted round prepared by Pairing-authorized Tabulation Staff under the current locked pairing policy and requiring explicit Tournament Director sign-off before withdrawal or publication.
_Avoid_: Pairing Plan Revision, strategic matchup change, started-round correction

**Qualifying Pairing Error**:
Objective evidence of an Entry, tournament-input, locked-policy application, prohibited-assignment, Judge-eligibility, room, schedule, software, or calculation defect that permits a Round Pairing Correction.
_Avoid_: Matchup preference, strategic advantage, disagreement with a valid pairing

**Pairing Withdrawal**:
The Director-approved removal of an unstarted round's Pairing Publication before a corrected version is published, preserving the withdrawn version and notifying affected participants and operations personnel.
_Avoid_: In-place pairing edit, started-round change, Entry withdrawal

**Tournament Invitation Page**:
The public tournament page that displays the current human-readable Registration Policy, pre-tournament schedule, round structure, Scheduled Breaks, and Pairing Plan rules without internal versions, fingerprints, publishing attribution, or exact publication timestamps.
_Avoid_: Access Offer, Pairing Publication, private operations dashboard

**Active Tournament Directory**:
The authenticated Docket Invitations section listing the Tournament Invitation Pages of tournaments currently classified as active, without granting participation or authority.
_Avoid_: Access Offer, Account onboarding, tournament registration

**Emergency Amendment**:
An explicitly confirmed, post-lock change to a tournament's adopted Ruleset or Tournament Overrides with a recorded reason and impact that cannot alter a Pairing Configuration Lock after any round starts.
_Avoid_: Hotfix, silent correction

**Ruleset Migration**:
An explicit pre-lock replacement of a tournament's adopted Ruleset with a different version after reviewing its differences and validation results.
_Avoid_: Automatic update, rules refresh

**Docket Account**:
An authenticated platform identity linked to exactly one current verified Google Identity Subject, capable of holding independently scoped roles but carrying no authority merely because the Account exists.
_Avoid_: Google account, user role, School account

**Docket Display Name**:
The Account holder's governed public-facing name, distinct from the restricted Google profile name and preserved in a historical publication when used there.
_Avoid_: Google name, legal name, mutable historical label

**Basic Docket Account**:
A self-enrolled Docket Account available to a verified Google user for Competitor, Coach, or Judge onboarding before any School, tournament, assignment, or platform authority is granted.
_Avoid_: Active Coach, School Membership, staff account

**Google Identity Subject**:
The accepted Google token issuer plus stable subject identifier used as the authoritative external key for one Docket Account.
_Avoid_: Email address, display name, hosted domain

**Docket Session**:
A time-limited authenticated Docket context established after server validation of a Google identity and governed by ordinary or platform-privileged inactivity and absolute limits.
_Avoid_: Google session, permanent login, authority grant

**Active Role Context**:
The School, tournament, Judge, or platform role currently selected by an authenticated Account and persistently displayed to determine its visible workspace and authorized command scope.
_Avoid_: Separate account, combined permissions, impersonation

**Google Reauthentication**:
A fresh Google-managed sign-in or security challenge required by Docket before a sensitive command, without Docket storing or administering an additional factor.
_Avoid_: Docket MFA, account recovery, role approval

**Google Identity Link Replacement**:
An evidence-backed replacement of an inaccessible Docket Account's current Google Identity Subject after Google recovery fails, preserving every prior action and grant under the same Docket Account.
_Avoid_: Google recovery, new account, history transfer

**Platform Identity Review**:
A restricted evidence and impact-review process for replacing a Google identity link or deactivating a duplicate Docket Account without automatically merging records or rewriting historical actor attribution.
_Avoid_: Account merge, support edit, Google account recovery

**Platform Identity Review Decision Record**:
The content-free retained outcome of an Identity Review after its submitted evidence is deleted, identifying its scope, authority class, reviewers, outcome, and timestamps without preserving identity evidence.
_Avoid_: Identity evidence, merged account, Support Action record

**Platform Identity Review Reconsideration**:
The affected Account holder's single time-limited request for a new immutable Identity Review decision based on new evidence or a specific process error.
_Avoid_: Appeal, edited decision, repeated review

**Access Offer**:
A time-limited private authority offer bound to one verified Google email and one exact School, tournament, or platform scope and placed in the separate Access Inbox, granting nothing until explicit acceptance.
_Avoid_: Tournament Invitation Page, Invitations section, login link, automatic role

**Access Inbox**:
The Account-private location for Access Offers, separate from the Invitations section used to discover active tournaments.
_Avoid_: Active Tournament Directory, notification inbox, tournament registration

**Tournament Archive**:
The searchable destination for Closed tournaments and their permanently retained public results and history.
_Avoid_: Active Tournament Directory, deleted tournament, private audit archive

**Tournament Publication History**:
The expandable public sequence of a Closed tournament's superseded results publications, shown behind the current results and alongside visible Correction Notices.
_Avoid_: Audit log, restricted correction evidence, current results

**Saved Tournament Filter**:
An Account-scoped, cross-device named set of tournament-directory search, filter, sort, and optional user-entered location preferences.
_Avoid_: Active Role Context memory, privileged data, automatic Google location

**Saved Tournament**:
An Account-scoped bookmark of an active or Closed tournament with separately selected change-notification subscriptions.
_Avoid_: Registration, Access Offer, canceled-tournament index

**Judge Pool**:
The tournament-local set of accepted Judge Pool Participations from which qualified assignments may be scheduled, without a first-release capacity limit or guarantee of assignment.
_Avoid_: Pending Judge interest, Judge Assignment, waitlist

**Judge Pool Participation**:
An authorized tournament-local record that an authenticated Judge is available for staffing as either Independent or Judge-confirmed School-Supplied, without guaranteeing assignment or changing qualification.
_Avoid_: Judge interest, Judge Assignment, Access Offer

**Tournament Start Time**:
The explicit published instant in the tournament's official timezone from which the Judge Withdrawal Lock Time is calculated.
_Avoid_: First pairing publication, registration deadline, device-local time

**Judge Withdrawal Lock Time**:
The instant 96 hours before the published Tournament Start Time after which an accepted Judge cannot withdraw ordinarily.
_Avoid_: Judge assignment deadline, Tournament Start Time, punishment

**Special Circumstance Withdrawal**:
The categorized, privacy-minimized exception request through which an accepted Judge becomes operationally unavailable after the Judge Withdrawal Lock Time and receives an authorized Excused or Unexcused outcome.
_Avoid_: Ordinary withdrawal, Judge disqualification, silent absence

**Judge Reliability Record**:
A restricted two-year record of an Unexcused Special Circumstance Withdrawal used as nonbinding context for later Judge Pool review without altering qualification or tier.
_Avoid_: Judge Qualification, blacklist, public rating

**Docket Account Suspension**:
A temporary platform security restriction that terminates sessions and blocks authentication without deleting the Account, its authority records, or its historical attribution.
_Avoid_: Role revocation, Account deletion, ban

**Suspension Decision Record**:
The content-free retained outcome and review history of a Docket Account Suspension after detailed evidence is deleted.
_Avoid_: Suspension evidence, permanent ban, role revocation

**Account Data Export**:
The Account holder's self-service package of their own Docket profile, authority history, settings, qualification summaries, and submitted content, excluding other people's private data and restricted investigations.
_Avoid_: Database export, School export, security evidence

**Account Security History**:
The Account holder's two-year view of sign-ins across devices, Google Reauthentication, suspension status, and completed Account exports.
_Avoid_: Full audit log, session log, identity evidence

**Voluntary Account Deactivation**:
An Account holder's seven-day-cancellable request for an irreversible end of future Docket access after every exclusive duty is transferred, while independently retained tournament history and actor attribution remain intact.
_Avoid_: Record deletion, suspension, Google account deletion

**Platform Administrator**:
A Docket operator with cross-tournament authority for platform support and governance.
_Avoid_: Super admin, tournament admin

**Support Action**:
A typed, ticketed Platform Administrator operation from a closed allowlist that diagnoses or repairs infrastructure or derived state under the administrator's own identity without changing authoritative domain decisions.
_Avoid_: Impersonation, record editor, arbitrary admin command

**Affected Owner**:
The account holder, School Manager, or Tournament Owner responsible for the scope targeted by a state-changing Support Action and entitled to its execution notice.
_Avoid_: Support administrator, action approver, Public Viewer

**Tournament Director**:
A person with tournament governance authority over rules and delegated operational staff.
_Avoid_: Tournament admin, host

**Tournament Owner**:
The single Tournament Director accountable for Director appointments, ownership transfer, and tournament closure.
_Avoid_: Primary admin, creator

**Ownership Recovery**:
A controlled ownership transfer used only when the existing Tournament Owner cannot regain or exercise their authority.
_Avoid_: Admin takeover, forced transfer

**Emergency Authority Grant**:
A temporary, expiring grant of narrowly scoped Owner-level authority to an existing Tournament Director during an active tournament.
_Avoid_: Temporary Owner, permanent transfer

**Tabulation Staff**:
A person delegated to administer competition operations for a tournament.
_Avoid_: Tabber, general staff

**Tournament Staff Assignment**:
A revocable authorization linking one Tabulation Staff account to one tournament and its delegated operations.
_Avoid_: Global staff role, tournament account

**Tournament Permission Bundle**:
A named set of related tournament operations that a Tournament Director may delegate through a Tournament Staff Assignment.
_Avoid_: Full admin, ad hoc permission

**Coach**:
A school representative responsible for managing that school's tournament participation.
_Avoid_: Sponsor, school account

**School Membership**:
An explicit, revocable authorization for one Coach to act for one School through one or more School roles.
_Avoid_: Email-domain access, school role

**School Manager**:
The exclusive School Membership role that authorizes one Coach to manage memberships and assign non-Manager School roles.
_Avoid_: School owner, all Coaches

**School Manager Transfer**:
An accepted, atomic reassignment of the School Manager role from its current holder to an existing School Member.
_Avoid_: Add Manager, shared management

**School Manager Recovery**:
A controlled School Manager Transfer used only when the existing Manager cannot regain or exercise their authority.
_Avoid_: Admin takeover, temporary Manager

**Roster Manager**:
A School Membership role that authorizes a Coach to manage that School's roster relationships with authenticated Competitors.
_Avoid_: Competitor owner, student account owner

**Entry Manager**:
A School Membership role that authorizes a Coach to place affiliated Competitors on Tournament Rosters and give the School's final sign-off to register, update, or withdraw its Entries.
_Avoid_: Registrar, tournament staff

**Judge Manager**:
A School Membership role that authorizes a Coach to manage that School's supplied Judges, availability, and declared conflicts.
_Avoid_: Judge, tournament judge chair

**Judge**:
A person eligible to adjudicate assigned rounds and submit their ballots.
_Avoid_: Adjudicator, evaluator

**Judge Qualification Assessment**:
The event-specific assessment family used to establish how a Judge interacts with arguments or performances, including the Full Judge Qualification Assessment and Quick Judge Assessment.
_Avoid_: Tournament Judge Orientation, staff opinion

**Full Judge Qualification Assessment**:
The standard event-specific assessment that creates a season-bounded Event Qualification; required for debate unless a Quick Judge Assessment applies and optional but recommended for speech.
_Avoid_: Quick Judge Assessment, Tournament Judge Orientation

**Quick Judge Assessment**:
A shortened debate-event assessment authorized when tournament staffing requires moving a Judge who lacks a current Event Qualification, producing only tournament-day eligibility and temporary data.
_Avoid_: Full Judge Qualification Assessment, permanent qualification

**Temporary Debate Qualification**:
The eligibility created by a completed Quick Judge Assessment, valid only for its authorized tournament days and debate event.
_Avoid_: Event Qualification, cross-tournament credential

**Quick Assessment Expiration Notice**:
A post-tournament message stating that a Temporary Debate Qualification has ended, when the Full Judge Qualification Assessment is due to avoid another quick assessment, and when detailed quick data will be deleted.
_Avoid_: Qualification renewal, permanent record

**Quick Assessment Follow-up Deadline**:
The deadline for completing a standalone Full Judge Qualification Assessment to avoid taking another quick assessment: 30 days after the tournament when no future debate assignment exists, or two days before the next scheduled debate tournament when one does.
_Avoid_: Temporary Debate Qualification end time, reusable quick credential

**Event Qualification**:
A Judge's season-bounded Full Judge Qualification Assessment result, profile, and tier for one debate or speech event and a defined set of compatible Ruleset versions.
_Avoid_: Universal Judge qualification, tournament assignment

**Qualification Supersession**:
The early replacement of an Event Qualification when a material event-Ruleset or assessment change makes its evidence incompatible, without deleting the prior qualification.
_Avoid_: Editorial update, silent expiration

**Tournament Judge Orientation**:
A tournament-specific prerequisite covering Tournament Overrides and local operating procedures without changing the Judge's Event Qualification score or tier.
_Avoid_: Judge Qualification Assessment, tier reassessment

**Judge Competency Section**:
The scored part of the Judge Qualification Assessment that tests rules, ethics, and argument evaluation and supplies the result used for eligibility and tiering.
_Avoid_: Judging Profile, popularity score

**Tier Scoring Bands**:
The published, versioned score ranges that deterministically map a Judge Competency Section result to a Judge Qualification Tier.
_Avoid_: Staff judgment, secret threshold

**Round Tier Requirement**:
A tournament constraint requiring a minimum existing Judge Qualification Tier for a defined round or round category without changing any Judge's score or tier.
_Avoid_: Tournament scoring band, manual tier override

**Round Competitiveness Priority**:
A current-tournament score used to direct higher-tier Judges toward later elimination stages, top-record power pairings, and rounds with direct advancement consequences.
_Avoid_: School reputation, external ranking

**Bubble Round**:
A current-tournament preliminary round whose outcome can directly determine whether an Entry advances.
_Avoid_: Any close round, reputation-based feature round

**Critical Competency Item**:
A required rules or ethics question that must be answered correctly before Docket may issue any passing Judge Qualification Tier.
_Avoid_: Bonus question, profile preference

**Assessment Integrity Review**:
A purpose-limited, audited Platform Administrator investigation of provider delivery, identity, security, or test administration that cannot change an assessment result, score, or tier; only a new attempt may produce a different outcome.
_Avoid_: Assessment appeal, corrected score, routine support access

**Assessment Provider**:
The third-party testing platform that initially administers Judge Qualification Assessments and sends assessment results to Docket without becoming the system of record for qualification or tournament eligibility.
_Avoid_: Tournament staff, Docket qualification authority

**Assessment Attempt ID**:
A single-use Docket identifier authorizing one Judge to complete one event-specific assessment version and binding the provider's returned result to that attempt.
_Avoid_: Provider result ID, reusable testing link, Judge email

**Pending Verification**:
The state of a provider-hosted assessment attempt whose result has not passed Docket's signature, identity, version, attempt, and duplicate checks and therefore supplies no new qualification, tier, or assignment eligibility.
_Avoid_: Failed assessment, provisional qualification, staff-approved score

**Assessment Identity Review**:
An attributed, evidence-backed Platform Administrator process for resolving a conflict between a Docket Judge, Docket-initiated assessment attempt, and stable provider account without silently moving or rewriting historical records.
_Avoid_: Name match, email-only linking, qualification review

**Tier Test-Out Attempt**:
A new Full Judge Qualification Assessment attempt by a currently qualified Judge seeking a higher tier, allowed once every 30 days and incapable of lowering the Judge's existing current tier.
_Avoid_: Tournament Tier Grant, failed-assessment retake

**Uniform Assessment Standard**:
The rule that every Judge taking the same event-specific assessment version receives the same timing, delivery configuration, content blueprint, critical-item requirements, scoring bands, and tier standards without individual accessibility accommodations.
_Avoid_: Identical question order, modified delivery, alternate scoring

**Judging Profile**:
The unscored part of the Judge Qualification Assessment that records how a Judge evaluates and interacts with arguments for assignment matching and authorized disclosure.
_Avoid_: Competency score, qualification penalty

**Published Judging Profile**:
An explicit, versioned disclosure of a Judge's Judging Profile that tournament personnel may view and that active School Members for assigned Entries may view after Pairing Publication, without exposing scored responses or raw scores.
_Avoid_: Public profile, assessment transcript, automatic disclosure

**Judge Qualification Tier**:
One of the assessment-supported Judge classifications—Qualified, Advanced, or Elimination-Qualified—used when determining assignment suitability.
_Avoid_: Judge rating, ballot win rate

**Qualification History Summary**:
The restricted minimal record retained for seven years after an Event Qualification expires or is superseded: Judge, event, assessment version, completion date, tier, validity, source, and aggregate critical-item pass or fail without raw assessment content.
_Avoid_: Qualification Summary, assessment transcript, Judging Profile

**Qualification Summary**:
The current restricted operational summary of a valid Event Qualification used for eligibility and assignment without exposing submitted answers or question-level evidence.
_Avoid_: Qualification History Summary, assessment transcript, Effective Tournament Tier

**Tournament Tier Grant**:
An attributed discretionary authorization by a Tournament Director or Judge-and-room-authorized Tabulation Staff member that gives a Judge any higher assignment tier only for the current tournament and event, even after a nonpassing assessment or failed Critical Competency Item.
_Avoid_: Event Qualification edit, platform score change

**Effective Tournament Tier**:
The higher of a Judge's assessment-supported Event Qualification tier and a current Tournament Tier Grant, used only for assignments within that tournament.
_Avoid_: Permanent Judge Qualification Tier, assessment score

**Qualified Judge**:
A Judge whose assessment supports assignment to the tournament's ordinary eligible rounds.
_Avoid_: Untested Judge, available Judge

**Advanced Judge**:
A Judge whose assessment supports priority for more competitive or technically demanding rounds.
_Avoid_: Popular Judge, winning Judge

**Elimination-Qualified Judge**:
A Judge whose assessment supports assignment to elimination rounds and the tournament's highest-priority competitive rounds.
_Avoid_: Tournament Director, automatically preferred Judge

**Ballot**:
A Judge's adjudication record for one assigned round, containing a Competitive Result and optional Ballot Feedback.
_Avoid_: Competitive Result, feedback form

**Competitive Result**:
The Ballot decision and scoring values used by standings, pairings, or advancement.
_Avoid_: Ballot Feedback, draft decision

**Standings Rules Configuration**:
A versioned, tournament-event-scoped `.docket-standings.json` artifact uploaded by a Tournament Director that declaratively defines how Docket calculates and orders preliminary standings using only supported schema operations.
_Avoid_: Fixed Docket template, Pairing Plan, arbitrary executable code

**Standings Calculation Preview**:
A transparent validation output that applies one draft Standings Rules Configuration to required sample Entry records and displays intermediate metrics, tie-break decisions, warnings, schema version, fingerprint, and resulting order before acceptance.
_Avoid_: Official standings, hidden test, configuration acceptance

**Standings Acceptance Case**:
An optional labeled, synthetic input-and-expected-output example supplied inside a Standings Rules Configuration that must pass before acceptance and on later schema migration or emergency correction.
_Avoid_: Executable test code, production tournament data, required Docket preview scenario

**Standings Publication Policy**:
The locked choice to release preliminary standings after every preliminary round, at specified preliminary checkpoints, or only after all preliminary rounds.
_Avoid_: Power-pairing calculation schedule, ad hoc publication, elimination results

**Standings Snapshot Approval**:
The Director or Pairing-authorized staff action approving one exact automatically calculated and validated standings snapshot fingerprint for publication.
_Avoid_: Direct rank edit, automatic calculation, publication

**Standings Snapshot Publication**:
The Director or Publication-authorized staff action that makes one exact approved standings snapshot participant-facing under the locked publication policy.
_Avoid_: Internal power-pairing snapshot, approval, automatic release

**Standings Snapshot Summary**:
The public projection of a published standings snapshot containing Entry display identity, School, rank, record, every ranking-affecting aggregate metric, checkpoint, and any public correction notice without internal versions, fingerprints, publishing attribution, or exact timestamps.
_Avoid_: School-private calculation breakdown, Judge-linked score, full standings domain object

**Standings Rules Acceptance**:
A Tournament Director's explicit approval of one exact validated Standings Rules Configuration after reviewing its calculation preview.
_Avoid_: File upload, automatic validation, invitation-page publication

**Emergency Standings Rules Correction**:
A Director-approved, versioned post-lock replacement that repairs verified divergence between Docket behavior and the standings policy already published to participants after calculation and full impact previews.
_Avoid_: Strategic policy change, ordinary upload, silent recalculation

**Advancement Plan**:
A versioned tournament-event `.docket-advancement.json` policy that references the locked standings fingerprint and defines elimination break size, eligibility, tie-at-the-cut handling, seeding, and bracket byes without redefining standings.
_Avoid_: Standings Rules Configuration, elimination pairing, final results

**Advancement Plan Preview**:
A transparent validation output that applies a draft Advancement Plan to representative sample standings snapshots and explains selected and excluded Entries, cut-tie treatment, seeds, byes, warnings, versions, and fingerprints before acceptance.
_Avoid_: Advancement Field, official qualifier publication, automatic acceptance

**Tie-at-the-Cut Policy**:
The locked Advancement Plan choice used when a complete standings tie crosses the last qualifying position: expand the tied field, hold a pre-scheduled play-in, or apply a deterministic draw whose seed and algorithm were published before competition.
_Avoid_: Standings tie-break criterion, Director preference, bracket adjustment after results

**Partial Elimination Bracket**:
An elimination field whose Entry count is not a power of two and is placed into the next power-of-two bracket with first-round byes awarded to the highest seeds.
_Avoid_: Expanded tie field, incomplete pairing, discretionary bye

**Advancement Field Recalculation**:
The pre-elimination-start creation and republication of a complete new Advancement Field after an eligibility change, including next-eligible promotion, reseeding, or field shrinkage under the locked Plan.
_Avoid_: Post-start bracket refill, standings recalculation, silent field edit

**Emergency Advancement Plan Correction**:
A Director-approved, versioned post-lock correction for verified divergence between Docket behavior and the published advancement policy, permitting recalculation only before elimination starts and preserving the original bracket afterward.
_Avoid_: Strategic policy change, post-start reseeding, silent Plan replacement

**Advancement Field**:
The reproducible versioned set of selected and excluded Entries, qualification explanations, seeds, and bracket byes produced by applying one Advancement Plan to one standings snapshot.
_Avoid_: Standings table, Pairing Publication, bracket method

**Advancement Field Approval**:
A Tournament Director's explicit approval of one exact validated Advancement Field fingerprint after required preliminary results, eligibility decisions, standings inputs, and blocking conflicts are resolved.
_Avoid_: Staff preparation, direct seed edit, publication

**Advancement Field Publication**:
The Director or Publication-authorized staff action that makes one exact approved Advancement Field operative and eligible to supply elimination pairings.
_Avoid_: Field calculation, approval, Plan publication

**Out-Round Verification Gate**:
The two-person tournament-staff confirmation required before an elimination pairing is published and before the next elimination round starts that its controlling results, dispute states, Advancement Field, and bracket inputs are current and resolved.
_Avoid_: Optional review, post-round audit, automatic advancement

**Out-Round Confirmation Permission**:
The tournament-scoped permission bundle selected by the Tournament Director for the second person in an Out-Round Verification Gate, distinct from the Pairing-authorized first verifier.
_Avoid_: Named verifier, Tournament Director identity, shared approval

**Single-Person Out-Round Verification Exception**:
A Director-activated, warning-backed path for one exact round and version when no eligible second confirmer is available, allowing one Pairing-authorized staff member to complete the gate while preserving the missing separation as restricted risk and audit data.
_Avoid_: Ordinary verification, silent self-approval, automatic override

**Pending Out-Round Schedule Review**:
A nonoperative Docket-generated proposal that fills an elimination schedule block with eligible Competitors, Judges, room, and time for Tabulation Staff to confirm, deny, or edit before verification and publication.
_Avoid_: Published pairing, automatic assignment, external schedule import

**Out-Round Gate Override**:
A Director-initiated, second-person-confirmed, warning-acknowledged exception that permits operational uncertainty or incomplete verification at a failed pre-publication Out-Round Verification Gate without bypassing a hard integrity constraint.
_Avoid_: Successful verification, silent bypass, pre-start error correction

**Advancement Field Summary**:
The public invitation-page projection of an operative Advancement Field containing advancing Entries and Schools, seeds, byes, tie outcome, and any public correction notice without restricted evidence or internal metadata.
_Avoid_: Full Advancement Field, private exclusion explanation, standings table

**Speaker Points**:
The Ruleset-constrained numeric score a Judge assigns to each Competitor as part of a normal Competitive Result.
_Avoid_: Rank, feedback score

**Elimination Round**:
A post-preliminary advancement round, also called an out round, whose Competitive Result contains a winner but no Speaker Points.
_Avoid_: Preliminary round, additional preliminary, point-bearing round

**Panel Decision**:
The round winner established by a strict majority of the independent Competitive Results submitted by an odd-sized Judge panel.
_Avoid_: One Judge's Ballot, aggregated feedback, unanimous decision

**Irreversible Majority**:
More than half of all assigned panel Judges selecting the same Entry, allowing the Panel Decision to lock even while other individual Ballots remain outstanding.
_Avoid_: Majority of Ballots received, plurality, completed panel record

**Administrative Points**:
A non-Judge point value or average calculated for an Administrative Outcome only when explicitly authorized by the adopted Ruleset, labeled with its outcome, formula, inputs, version, and calculation time.
_Avoid_: Judge-submitted Speaker Points, manual estimate, fabricated Ballot

**Administrative Outcome**:
A non-Ballot round resolution, such as a bye or forfeit, entered through an authorized staff workflow.
_Avoid_: Judge Ballot, fabricated decision

**Ballot Feedback**:
The non-competitive narrative reasoning and comments a Judge provides for the competitors in a round.
_Avoid_: Competitive Result, ballot decision

**Feedback Draft**:
An unpublished Ballot Feedback revision visible only to its Judge.
_Avoid_: Published Feedback, public comment

**Feedback Publication**:
The Judge action that makes one Feedback Draft the current version visible to its adjudicated Competitors, every current Coaching Staff member for each represented School, and that School's sole School Manager.
_Avoid_: Ballot Submission, auto-publish

**Published Feedback**:
The most recently published Ballot Feedback version visible to its authorized recipients.
_Avoid_: Feedback Draft, public feedback

**Ballot Submission**:
The Judge action that validates and locks a Ballot's Competitive Result for tabulation.
_Avoid_: Feedback completion, draft save

**Ballot Due Time**:
The scheduled end of a round plus the tournament-configured Ballot grace period, defaulting to 15 minutes, after which an outstanding Competitive Result is Late.
_Avoid_: Feedback Deadline, automatic forfeiture time

**Late Ballot**:
An outstanding Competitive Result that has passed its Ballot Due Time and requires notification and operational escalation without creating any competitive outcome.
_Avoid_: Forfeit, Entry penalty, submitted Ballot

**Judge Assignment Hold**:
A tournament-local availability restriction that prevents a Judge with an escalated missing Competitive Result from receiving new assignments until the result is submitted or a Tournament Director records clearance.
_Avoid_: Qualification penalty, platform suspension, cross-tournament restriction

**Conflicting Ballot Attempt**:
A rejected post-lock submission from the assigned Judge whose competitive data differs from the current Competitive Result and is preserved for restricted audit and correction review.
_Avoid_: Result Correction, duplicate retry, silent overwrite

**Ballot Reopening**:
An authorized, reasoned, audited action that unlocks a submitted Competitive Result for correction.
_Avoid_: Feedback edit, silent correction

**Result Correction**:
A new version of a submitted Competitive Result that becomes current without deleting or rewriting the original version.
_Avoid_: Overwrite, ballot edit

**Completed Round Decision Correction**:
A Tournament Director-created decision version that changes a completed round's winner, decision type, or preliminary-only Speaker Points for a verified input error or disqualification while preserving the original decision and immutable pairing.
_Avoid_: Pairing correction, Judge reconsideration, silent overwrite

**Disqualification Ruling**:
A Tournament Director decision using a Ruleset-supported round-only loss, prospective tournament removal, or full-tournament disqualification scope after previewing its effects on decisions, eligibility, standings, advancement, awards, and downstream artifacts.
_Avoid_: Entry withdrawal, automatic retroactive forfeiture, bulk result overwrite

**Staff Result Correction**:
A Result Correction entered by authorized tournament staff using documented Judge confirmation or an Administrative Ruling.
_Avoid_: Judge submission, staff impersonation

**Administrative Ruling**:
A documented Tournament Director determination that authorizes a competitive-data resolution when the assigned Judge cannot supply it.
_Avoid_: Staff guess, silent override

**Downstream Conflict**:
A recorded mismatch between corrected competitive data and a later published or completed tournament artifact that requires explicit resolution.
_Avoid_: Automatic rewrite, warning only

**Correction Notice**:
A human-readable public notice stating the previous and corrected public values, competitive or operational effect, and required participant action while withholding internal versions, fingerprints, actors, exact timestamps, evidence, notes, and audit details.
_Avoid_: Full correction record, silent update, deleted history

**Final Results Draft**:
An immutable, validated calculation of tournament placements and awards whose placement- and award-affecting competitive sources are complete and versioned but which is not yet approved or public.
_Avoid_: Published results, editable award list, standings snapshot

**Final Results Approval**:
A Tournament Director's approval of one exact validated Final Results Draft fingerprint after reviewing its sources, warnings, and nonblocking outstanding items.
_Avoid_: Draft calculation, publication, direct placement edit

**Final Results Publication**:
The Director or Publication-authorized staff action that makes one exact Director-approved Final Results Draft the current public tournament results version and marks Competitive Completion without closing the tournament.
_Avoid_: Standings publication, approval, automatic release

**Competitive Completion**:
The tournament state reached when Final Results are published, meaning scheduled competition and current public results are complete while feedback, operational work, closure, and authorized corrections may remain.
_Avoid_: Tournament Closure, archive, Final Results Approval

**Tournament Closure**:
The Tournament Owner's separate confirmed governance action ending routine tournament operation after Competitive Completion, the applicable Judge-feedback window, and required operational work without deleting history or disabling authorized corrections.
_Avoid_: Competitive Completion, Final Results Publication, deletion

**Tournament Retention Class**:
The explicit storage-duration category assigned after Tournament Closure: Permanent Public Record, Seven-Year Competitive Evidence, or Two-Year Operational Telemetry, subject to specific-policy precedence and Legal Hold.
_Avoid_: Access level, archive status, deletion request

**Permanent Public Tournament Record**:
The indefinitely retained published invitation, schedule, pairing, standings, bracket, result, award, represented-School, advancement, and Correction Notice history.
_Avoid_: Restricted evidence, internal metadata, full audit record

**Competitive Evidence**:
Restricted records needed to reproduce, validate, or investigate a competitive outcome and retained for seven years after Tournament Closure unless held.
_Avoid_: Public result, routine telemetry, Accommodation Request

**Operational Telemetry**:
Restricted delivery, acknowledgment, and routine access events not needed to reproduce a competitive outcome and retained for two years after Tournament Closure unless held.
_Avoid_: Competitive Evidence, public history, audit decision

**Closure Readiness Review**:
The immutable pre-closure assessment separating non-waivable competitive blockers from outcome-irrelevant warnings the Tournament Owner must complete or acknowledge with a reason.
_Avoid_: Final Results readiness, optional checklist, automatic closure

**Post-Closure Exception**:
An explicit, reasoned, audited action allowed on a closed tournament only through an existing correction, Ownership Recovery, or legally required privacy workflow.
_Avoid_: Tournament reopening, ordinary edit, unrestricted administrator override

**Post-Closure Correction Case**:
The scoped record governing one authorized correction while the tournament remains Closed and the last published version stays current until any approved republication.
_Avoid_: Tournament reopening, corrected public result, ordinary edit session

**Award Plan**:
A versioned tournament-event `.docket-awards.json` policy defining award categories, eligibility, authoritative sources, recipient counts, and tie handling without redefining source calculations; every configured award and recipient is public in Final Results.
_Avoid_: Standings Rules Configuration, Advancement Plan, editable award list

**Award Plan Preview**:
A synthetic validation output explaining candidate eligibility, source values, ordering, ties, recipients, warnings, and internal source references for one draft Award Plan.
_Avoid_: Award Results Draft, public award page, automatic acceptance

**Award Results Draft**:
The immutable reproducible award output automatically produced by applying one locked Award Plan to exact authoritative source versions and approved and published only as part of the exact Final Results Draft that references it.
_Avoid_: Final Results Draft, manually edited recipient list, Award Plan

**Emergency Award Plan Correction**:
A Director-approved, versioned post-lock replacement that repairs verified divergence between the locked Award Plan and award rules published before the tournament after validation and a full award impact preview.
_Avoid_: Outcome-driven policy change, direct recipient edit, silent Plan replacement

**Final Results Summary**:
The public projection containing the event champion, finalist, configured placements, elimination bracket and decisions, final standings, every configured award and recipient, and represented Schools without detailed Ballots, feedback, Judge-linked scores, private eligibility or disqualification evidence, or assessment data.
_Avoid_: Final Results Draft, private evidence, editable awards

**Schedule Candidate**:
One feasible pre-tournament schedule generated by Docket for a named optimization objective and presented for selection.
_Avoid_: Tournament Schedule, pairing draft

**Tournament Schedule**:
The selected Schedule Candidate that governs the tournament until an approved revision changes it.
_Avoid_: Schedule Candidate, suggested schedule

**Tournament Schedule Publication**:
The authorized pre-tournament release of the selected round structure, times, expected durations, Scheduled Breaks, and human-readable Pairing Plan rules on the Tournament Invitation Page without publishing future Entry assignments or internal metadata.
_Avoid_: Schedule Selection, Pairing Publication, Schedule Revision Publication

**Schedule Selection**:
The Tournament Director approval that establishes one pre-tournament Schedule Candidate as the Tournament Schedule and records the candidates, objective metrics, recommendation, approver, reason, and time.
_Avoid_: Staff recommendation, automatic choice

**Schedule Revision Proposal**:
One feasible schedule revision generated after a Schedule Disruption for a named optimization objective and presented for review rather than applied automatically.
_Avoid_: Automatic reschedule, original Schedule Candidate

**Schedule Revision Approval**:
The Tournament Director action that authorizes one exact Schedule Revision Proposal version without yet publishing or applying a different version.
_Avoid_: Staff recommendation, automatic approval

**Schedule Revision Publication**:
The authorized release that makes an approved Schedule Revision Proposal the current Tournament Schedule and records the publishing actor and time.
_Avoid_: Proposal editing, silent application

**Schedule Revision Notice**:
An immediate, delivery-tracked message identifying an approved schedule change, its reason, affected rounds, old and new details, and any required action.
_Avoid_: Silent update, generic announcement

**Assignment Acknowledgment**:
An affected Judge's confirmation that the Judge received a changed assignment and remains available; it confirms the assignment but does not approve the revision.
_Avoid_: Schedule Revision Approval, School response

**Urgent Change Threshold**:
A tournament-configurable warning boundary, defaulting to 30 minutes before the earliest affected round, inside which a schedule revision requires additional confirmation and continuity planning rather than being prohibited.
_Avoid_: Hard minimum, automatic block

**Urgent Schedule Revision**:
A Schedule Revision Proposal whose earliest affected round begins inside the tournament's Urgent Change Threshold.
_Avoid_: Started-round rewrite, automatic emergency change

**Judge Continuity Plan**:
A required plan for an Urgent Schedule Revision that documents Judge outreach, replacement options, and conditions for holding or delaying an affected round.
_Avoid_: Unrecorded workaround, lower-tier override

**Schedule Tie-Break Policy**:
The versioned deterministic order used when schedules share the same objective score: preserve the published schedule, minimize assignment changes, balance Judge workload and rest, prefer the earlier finish, then compare stable identifiers.
_Avoid_: Random choice, hidden weighting

**Schedule Disruption**:
A timing or resource conflict caused by corrected round data or another operational error that prevents the Tournament Schedule from continuing as planned.
_Avoid_: Any Ballot correction, routine delay

**Critical Tournament Schedule Edit**:
A staff-prepared, Director-approved change to the native Tournament Schedule during competition for an operational necessity such as a No-Show, conflict, disqualification, room change, or explained Other Tournament-Critical Operation.
_Avoid_: Routine preference, silent reschedule, external schedule replacement

**Schedule Reversal Revision**:
A new governed Tournament Schedule version that restores values from an earlier published version without erasing the intervening revision or changing a Started round.
_Avoid_: Rollback, undo in place, silent restoration

**Time-Efficiency Objective**:
The scheduling objective that minimizes total elapsed tournament time and produces the earliest feasible finish; after a Schedule Disruption, it minimizes remaining duration and added delay.
_Avoid_: Judge-Use Objective, Buffer-Time Objective

**Buffer-Time Objective**:
The scheduling objective that first maximizes the smallest recovery interval between consecutive round blocks and then distributes remaining recovery time evenly within the configured tournament window.
_Avoid_: Longest single break, Scheduled Break

**Scheduled Break**:
A labeled, required tournament-wide pause with a duration and either a fixed start time or an allowed placement window, such as lunch or dinner.
_Avoid_: Optimization buffer, unscheduled delay

**Judge-Use Objective**:
The scheduling objective that maximizes assignments of correct, qualified Judges to the appropriate and most competitive rounds.
_Avoid_: Maximum Judge workload, Time-Efficiency Objective

**Feedback Deadline**:
The immutable official-tournament deadline exactly seven days after the current published end of the final scheduled competitive round, when Ballot Feedback becomes read-only to its Judge.
_Avoid_: Ballot Submission deadline, result lock

**Practice Feedback Reopening**:
An owner-authorized, reasoned action that restores editing of Practice Feedback after its practice deadline but before the Practice Workspace deletion ceiling.
_Avoid_: Official-tournament Feedback Reopening, Ballot Reopening, silent edit

**Competitor**:
A student who holds one authenticated Docket Account and may participate in tournament Entries while representing a School through separately governed relationships.
_Avoid_: School-owned person record, uploaded test record, debater

**Competitor School Invitation**:
A School-initiated offer that creates no relationship until the identified authenticated Competitor accepts it.
_Avoid_: Access Offer, email-domain match, Competitor request

**Competitor School Affiliation**:
The one current accepted relationship connecting a Competitor Account to the School it may represent, replaceable without replacing the Account.
_Avoid_: School ownership, School Membership, historical Entry attribution

**Tournament Roster**:
A School's tournament-specific set of affiliated Competitors placed into event Entries by an authorized Coach.
_Avoid_: School affiliation, public competitor list, tournament schedule

**Cross-Entry Schedule Conflict**:
A condition in which one Competitor is entered or assigned in overlapping published event intervals, prohibited unless a Cross-Entry Compatible Tournament grants a Director-approved exception.
_Avoid_: Event preference, ordinary schedule change, automatic disqualification

**Cross-Entry Compatible Tournament**:
A tournament whose published invitation explicitly allows Coaches to request overlapping event participation subject to Director feasibility approval.
_Avoid_: Guaranteed cross-entry, schedule override, unlabeled tournament

**Cross-Entry Request**:
A Coach-submitted request for one Competitor to participate in overlapping events at a Cross-Entry Compatible Tournament, requiring Tournament Director verification after a schedule-delay warning.
_Avoid_: Automatic entry, Competitor request, silent conflict override

**Cross-Entry Hold Limit**:
The maximum published time an event may be delayed for an approved cross-entered Competitor, configured before registration and defaulting to fifteen minutes. Its countdown begins at the affected round's current published start and replaces, rather than extends, ordinary No-Show grace.
_Avoid_: No-Show grace period, unlimited delay, unpublished staff discretion

**Event Workspace**:
An event-scoped Docket interface for practice and tournament rounds, locations, assignments, and role-appropriate participant activity.
_Avoid_: Tournament-wide dashboard, public results page, unrestricted participant tracking

**Practice Workspace**:
A private, tournament-independent, event-specific Docket area whose mock rounds, assignments, Ballots, and results are nonoperative and retained for no more than thirty days from session creation. It creates no official rankings or permanent performance history.
_Avoid_: Event Workspace, unpublished official round, test fixture

**Practice Invitation**:
An email-link invitation granting its exact Google-authenticated Account recipient access to one Practice Workspace session without School approval, School affiliation, or tournament authority. It expires after seven days or when the session ends, whichever occurs first.
_Avoid_: Competitor School Invitation, Access Offer, tournament Entry

**Practice Session Owner**:
The Entry Manager who creates a Practice Workspace session and controls its practice-only membership and lifecycle. Ownership may transfer only to another Entry Manager at the same School.
_Avoid_: Tournament Director, platform owner, official event administrator

**Practice Participant Role**:
A session-scoped Organizer, Competitor, Judge, or Observer role that grants only the compatible Practice Workspace permissions assigned to it.
_Avoid_: Tournament Permission Bundle, School Membership role, official assignment

**Practice Role Lock**:
The start-of-session boundary after which accepted participants' Practice Participant Roles cannot change.
_Avoid_: Tournament role lock, live role reassignment, permission escalation

**Practice Standby**:
A preaccepted participant whose exact Practice Participant Role is locked before session start and who may fill only a vacancy in that same role.
_Avoid_: Late invitee, live role change, automatic replacement

**Practice Safety Report**:
A restricted report of harmful or unsafe Practice Workspace conduct reviewed separately from ordinary practice content and incapable of changing official tournament records.
_Avoid_: Ballot Feedback, tournament protest, public complaint

**Practice Ballot**:
A clearly nonoperative adjudication form governed by the event's single platform-wide Event Ballot Rubric and incapable of affecting tournament or qualification records.
_Avoid_: Official Ballot, Competitive Result, Judge assessment

**Practice Feedback**:
Written nonoperative feedback a practice Judge drafts privately and explicitly publishes to its intended Practice Workspace recipients.
_Avoid_: Public feedback, official Ballot Feedback, permanent performance history

**Event Ballot Rubric**:
The single Docket-wide adjudication rubric governing fixed decision fields and ordered open-ended question fields for one event in official and practice rounds.
_Avoid_: School rubric, session-specific Ballot rubric, Feedback rubric

**Event Ballot Rubric Draft**:
A collaboratively edited, document-like draft whose open-ended question fields do not govern any round until its validated publication review completes, normally through a distinct rules-governance approver.
_Avoid_: Published rubric version, live Ballot, School rubric

**Event Ballot Rubric Version**:
An immutable published Event Ballot Rubric whose exact fields remain attached to every Ballot governed by it even after a later version removes or deprecates those fields, and which becomes the immediate default for new unpinned uses.
_Avoid_: Mutable rubric, current draft, overwritten rubric

**Single-Publisher Rubric Exception**:
The warned, reasoned, impact-previewed fallback allowing a Tournament Director to publish a Docket-wide Event Ballot Rubric Version alone after authenticated requests containing the exact diff reach a frozen set of qualified publishers and none explicitly accepts within four hours.
_Avoid_: Ordinary two-person approval, silent self-publication, tournament-specific rubric

**Emergency Rubric Publication**:
The narrow fifteen-minute publisher-request path for a defect that prevents valid adjudication, allowing a Director to publish a corrected Docket-wide version for future unstarted rounds without changing any started round's pinned rubric.
_Avoid_: Started-round migration, live Ballot rewrite, ordinary rubric publication

**Practice Feedback Rubric**:
A titled, versioned Practice Workspace guide for written Judge feedback. A pre-lock session using Docket's event default automatically follows each newly implemented default version, while a selected custom version does not.
_Avoid_: Event Ballot Rubric, Judge assessment, Competitive Result schema

**Feedback Migration Review**:
The private, versioned review that preserves existing draft content while mapping stable fields to a corrected rubric, isolating removed-field content until its Judge intentionally remaps it, and requiring completion of newly mandatory fields before the next publication.
_Avoid_: Silent rewrite, completed-Ballot mutation, automatic publication

**Round Rubric Pin**:
The immutable association created when the first pairing in a scheduled event-round cohort validly starts, binding every pairing, Ballot, and decision in that cohort to one Event Ballot Rubric Version.
_Avoid_: Live rubric migration, current platform default, future-round rubric

**Unacknowledged Rubric Notice**:
The nonblocking warning recorded when a round or practice starts before its responsible Director or owner acknowledges the governing rubric notice, retained as minimized operational telemetry for two years after acknowledgment or closure.
_Avoid_: Start prohibition, rubric rejection, competitive penalty

**Feedback Safety Reconsideration**:
The single request available to an authoring Judge or affected Competitor within fourteen days of a Feedback safety restriction, decided by different Platform Safety personnel while the content remains restricted.
_Avoid_: Competitive appeal, Feedback Reopening, automatic restoration

**Attributed Restricted Export**:
A permission-filtered Feedback or point export that visibly identifies its recipient, represented School, generation time, source version, and restricted-use status without remote tracking.
_Avoid_: Anonymous export, tracking beacon, public report

**Rubric-Blocked Decision**:
The state of a started round whose pinned rubric cannot support a valid Judge decision, requiring a separate evidence-backed Administrative Ruling normally verified by a distinct Ballot-correction actor without changing the rubric or fabricating a Ballot.
_Avoid_: Rubric migration, Judge impersonation, automatic outcome

**Rubric-Blocked Ruling Evidence**:
The restricted package containing the pin, affected fields, Judge report, validation failure, impossibility explanation, Ruleset, Pairing, proposed outcome, and downstream impact needed to support a Rubric-Blocked Administrative Ruling.
_Avoid_: Merits argument, unrelated private evidence, replacement Ballot

**Rubric-Blocked Correction Request**:
A time-limited request by an affected Competitor, their current represented-School Coach or Manager, the assigned Judge, or authorized tournament staff to correct an objective defect in a Rubric-Blocked Administrative Ruling.
_Avoid_: Merits appeal, public complaint, unrelated-School challenge

**Represented-School Tournament Record**:
The historical Entry, roster-as-operated, Pairing, School-directed notice, authorized Ballot and Feedback, released point, result, and correction set belonging to the School represented by an Entry.
_Avoid_: Competitor's complete personal history, opponent-private record, School investigation file

**Represented-School Data Export**:
A nondelegable School Manager-initiated, freshly reauthenticated delivery set of permission-filtered PDFs, JSON, and checksum manifests for one School's retained records, split into numbered ZIP archives above two gigabytes and available only when complete.
_Avoid_: Account Data Export, public tournament archive, unrestricted School dump

**School Export Manifest**:
The integrity inventory for a Represented-School Data Export, recording every numbered archive's sequence, checksum, and record count without adding sensitive content beyond the export itself.
_Avoid_: School Export History, audit log, exported record

**Historical Access Dashboard**:
The School-scoped view that organizes retained Represented-School Tournament Records by tournament, season, event, Competitor, and record type without full-text search across private Feedback.
_Avoid_: Public results search, Competitor personal history, private Feedback index

**School Export History**:
The two-year School Manager view of represented-School bulk-export requests, requester, date range, completion, and archive expiration, with separate governed privacy and audit access.
_Avoid_: Export contents, Coaching Staff activity feed, public download log

**Practice Panel Result**:
The official decision within a multi-Judge Practice Workspace round, created only after every assigned Judge submits a Practice Ballot and remaining nonoperative outside that session.
_Avoid_: Competitive Result, tournament Panel Decision, permanent performance result

**Practice Placement Correction**:
A categorized, explained, versioned pre-closure Practice Session Owner edit limited to competitor-placement fields on a submitted Practice Ballot. It cannot supply a missing Judge Ballot or modify Judge-authored responses or Feedback.
_Avoid_: Ballot impersonation, Feedback edit, fabricated submission

**Google Practice Meeting**:
The Google Meet session Docket creates through the Practice Session Owner's connected Google Account and distributes to authorized participants in an online Practice Workspace session.
_Avoid_: Docket recording, public meeting room, tournament round room

**Meeting Setup Failed**:
The state of an online Practice Workspace after three unsuccessful Google meeting-creation attempts and before an Organizer successfully retries or supplies a validated Google Meet link.
_Avoid_: Canceled practice, participant No-Show, silent meeting failure

**Google Connection Lost**:
The state of an existing Google Practice Meeting that remains available to already authorized participants after Docket loses the owner's Google authorization but cannot receive Docket-managed updates until reconnection or validated replacement.
_Avoid_: Meeting Setup Failed, canceled meeting, participant removal

**Personal Tournament Agenda**:
A read-only, cross-event view of the rounds and assignments an authenticated user is authorized to see, without replacing the underlying Event Workspaces.
_Avoid_: Tournament Schedule, Event Workspace, staff operations dashboard

**Competitor School Transfer**:
The future-facing replacement of a Competitor Account's current School Affiliation through an accepted invitation from the destination School, without changing an existing Entry's represented School.
_Avoid_: New Competitor Account, record merge, historical Entry rewrite

**Affiliation Termination**:
The future-facing end of a Competitor School Affiliation by the Competitor or Roster Manager, immediately blocking new Entries while final removal waits for active Entries representing that School to end.
_Avoid_: Entry withdrawal, historical deletion, School Transfer

**Minor Participation Authorization**:
A one-school-year School attestation that every applicable School, tournament, and jurisdictional permission and consent requirement is satisfied before a minor Competitor accepts affiliation or participates.
_Avoid_: Google authentication, guardian dossier, full birth date

**Judge Conflict**:
A verified hard Judge-assignment constraint submitted for a Competitor or Entry only by that Competitor's Coach.
_Avoid_: Judge Strike, preference, Competitor-submitted conflict

**Judge Strike**:
A hard exclusion or ranked preference selected by an Entry's Competitors or resolved by their Coach, approved by that Coach, and governed by the tournament's optional Judge Striking Policy.
_Avoid_: Judge Conflict, qualification decision, public Judge rating

**Judge Strike Submission**:
The complete set of an Entry's Judge Strikes after approval by that Entry's responsible Coach and recording through Docket's native Judge Strike Portal.
_Avoid_: Unapproved competitor selection, emailed strike list, Judge Conflict

**Judge Strike Portal**:
The restricted Docket workflow in which an Entry prepares, obtains responsible-Coach approval for, submits, and receives confirmation of its Judge Strike Submission.
_Avoid_: Email to Tournament Director, public form, Tournament Host delivery

**Judge Strike Window**:
The fixed period opening 36 hours before Tournament Start Time and closing at 3:00 p.m. in the tournament timezone on the calendar day before the tournament.
_Avoid_: Registration period, supplemental strike opportunity, open-ended strike editing

**No-Show**:
An authorized classification that an assigned Competitor or Judge failed to appear after the published grace period and documented contact attempts.
_Avoid_: Automatic forfeit, withdrawal, unconfirmed absence

**No-Show Dispute**:
A Competitor's private direct challenge to a No-Show classification, associated with but not controlled by their responsible Coach, filed within 60 minutes or before the event's next round starts and withdrawable only by that Competitor before decision.
_Avoid_: Automatic reversal, Coach-controlled appeal, public appeal, late arrival

**Emergency Replacement Judge**:
A post-strike-close Judge admitted for an unexpected withdrawal or No-Show through reasoned tournament authorization and assignment-specific Tabulation Staff sign-off, whose assignment remains unconfirmed until timely Judge acknowledgment and ends after three failed delivery cycles.
_Avoid_: Ordinary late Judge addition, supplemental strike candidate, automatic or unacknowledged assignment

**Replacement Candidate Pool**:
A nonoperative set of eligible Judges or Competitors Docket recommends for a disrupted round pending Tabulation Staff sign-off.
_Avoid_: Automatic assignment, revised pairing, waitlist

**Bye Round**:
A round in which an Entry has no opponent and advances or receives the configured Ruleset treatment without a fabricated opponent or Ballot.
_Avoid_: Replacement Competitor, automatic win record, canceled round

**Competitor Test Fixture**:
A record-only simulated Competitor accepted solely by non-production test tooling and incapable of authentication, production authority, or participation in a production tournament.
_Avoid_: Competitor Account, production import, temporary student identity

**Entry School Attribution Correction**:
An evidence-backed, versioned correction of one Entry's Competitor and School references after history exists, combining platform identity validation with the affected tournament's correction authority.
_Avoid_: Competitor reassignment, genuine transfer, automatic merge

**School**:
A canonical, platform-wide record for an educational institution whose authorized Coaches register tournament participants.
_Avoid_: Team, organization, school account

**Provisional School**:
An unverified School candidate created when no existing canonical School can be confidently identified.
_Avoid_: New School, duplicate School

**School Verification**:
An evidence-backed Platform Administrator decision that establishes the canonical identity of a Provisional School.
_Avoid_: Coach approval, automatic verification

**School Merge**:
A verified, reversible consolidation that redirects a duplicate School identity to one canonical School while preserving aliases and historical references.
_Avoid_: Delete duplicate, rename

**Entry**:
A tournament-specific registration of one or more Competitors in one event representing one School; the first Lincoln-Douglas slice requires exactly one Competitor.
_Avoid_: Competitor, registration form, team

**Entry Eligibility Attestation**:
A versioned assertion by an authorized School actor that a Competitor satisfies the tournament and Ruleset requirements represented by the Entry's submitted eligibility category.
_Avoid_: Disqualification Ruling, tournament eligibility decision, assessment

**Responsible Coach Contact**:
An authenticated Coach with an active School Membership who is designated as the adult operational contact for an Entry.
_Avoid_: Minor's personal contact, guardian record, School Manager

**Primary Responsible Coach**:
The one Responsible Coach Contact normally authorized to approve, correct, or release Judge Strikes for an Entry.
_Avoid_: Any School Coach, Tournament Director, Entry Manager

**Backup Responsible Coach**:
A Responsible Coach Contact designated before the Judge Strike Window to act when the Primary Responsible Coach is unavailable.
_Avoid_: Automatic substitute, after-deadline delegation, unrelated Coach

**Public Entry Projection**:
The explicitly published identity of an Accepted Entry containing only the Competitor's public display name, School, and event.
_Avoid_: Registration record, restricted eligibility data, automatic publication

**Registration Data Schema**:
A Director-published, versioned declaration of every tournament-specific field collected beyond Core Entry Data, including its purpose, obligation, type, validation, audience, retention, and visibility.
_Avoid_: Registration form, Core Entry Data, free-form questionnaire

**Accommodation Request**:
A separate restricted workflow in which an Entry's School requests an operational adjustment without placing medical or accommodation details in ordinary Entry data.
_Avoid_: Registration field, public note, eligibility attestation

**Accommodation Request State**:
The request's single workflow state: Draft, Submitted, Clarification Needed, Approved, Partially Approved, Denied, Withdrawn, or Closed.
_Avoid_: Entry Registration State, implementation status, eligibility ruling

**Accommodation Decision**:
An immutable, restricted approval, partial approval, or denial version that governs the currently authorized Accommodation Implementation Instructions.
_Avoid_: Public ruling, Entry decision, editable staff note

**Accommodation Request-By Time**:
The published nonblocking planning target for advance Accommodation Requests, defaulted to the Entry submission deadline and never used as an automatic rejection cutoff.
_Avoid_: Accommodation deadline, eligibility cutoff, Late Registration Exception

**Late Accommodation Request**:
An Accommodation Request submitted after the published Request-By Time that retains the ordinary review lifecycle while recording the reduced planning lead time.
_Avoid_: Rejected request, Late Registration Exception, waiver

**Accommodation Operations**:
A Tournament Director-delegated permission allowing selected Tabulation Staff to view and process complete Accommodation Requests; ordinary tournament permissions do not imply it.
_Avoid_: Registration operations, general staff access, Judge assignment

**Accommodation Implementation Instruction**:
A need-to-know operational direction derived from an approved Accommodation Request that omits diagnoses, evidence, and unrelated narrative.
_Avoid_: Accommodation Request, medical record, public notice

**Accommodation Audit Stub**:
The restricted content-free record retained until one year after Tournament Closure, containing only identifiers, categorical state and decision events, actor and access metadata, delivery events, and deletion or Legal Hold events.
_Avoid_: Accommodation Request, instruction content, medical record

**Legal Hold**:
A precisely scoped platform-level suspension of scheduled deletion prepared and approved by two distinct Legal and Privacy Operations administrators and reviewed at least every 90 days without unsafe automatic expiry.
_Avoid_: Director retention extension, archive, request denial

**Legal and Privacy Operations**:
A platform permission separate from generic Platform Administrator authority that governs two-person Legal Hold preparation, approval, review, scope changes, extension, and release.
_Avoid_: Platform Administrator role, tournament authority, Accommodation Operations

**Entry Registration State**:
The Entry's single admission-lifecycle state: Draft, Submitted, Waitlisted, Accepted, Withdrawn, or Rejected, kept separate from Competitive Eligibility.
_Avoid_: Eligibility status, disqualification state, deleted Entry

**Competitive Eligibility**:
The separate status determining whether an admitted Entry may currently compete, be paired, or advance under governing rules and rulings.
_Avoid_: Entry Registration State, acceptance, withdrawal

**Entry State Transition**:
An attributed, versioned move between allowed Entry Registration States under School Entry Manager or tournament Registration authority.
_Avoid_: Competitor edit, eligibility ruling, silent status change

**Entry Restoration**:
An evidence-backed exception returning the same Withdrawn or Rejected Entry identity to Submitted for fresh admission review before competition starts, with stricter Director and pairing controls after first-round Pairing Publication.
_Avoid_: New Entry, automatic reacceptance, post-start reactivation

**Tournament Registration Policy**:
The published, versioned tournament timeline defining registration opening and the Entry submission, School edit, admission-decision, and waitlist-closing deadlines in the tournament's timezone.
_Avoid_: Pairing schedule, private staff reminder, per-School deadline

**Registration Policy Revision**:
A Director-approved new Policy version that, after registration opens, may only extend deadlines or relax requirements and must include an impact preview, public change notice, and affected-School notifications.
_Avoid_: Late Registration Exception, deadline shortening, silent edit

**Admission Policy**:
The published part of the Tournament Registration Policy defining event capacity, optional per-School caps, and objective named priority groups used for deterministic admission and waitlist ordering.
_Avoid_: Manual waitlist, hidden preference, Advancement Plan

**Admission Recommendation**:
The immutable calculated proposal for Accepted, Waitlisted, promoted, or capacity-rejected Entry transitions under one exact Admission Policy and Entry set.
_Avoid_: Confirmed transition, manual selection, Advancement Field

**Late Registration Exception**:
A Tournament Director's pre-pairing authorization for one Entry to perform one declared registration command after its published deadline without changing the Policy for other Schools.
_Avoid_: Deadline extension, automatic acceptance, post-pairing registration

**Late Withdrawal**:
An always-permitted Entry withdrawal after the School edit deadline that retains its reason and triggers impact review, notices, and applicable downstream handling without itself imposing a penalty.
_Avoid_: Disqualification Ruling, blocked withdrawal, deleted Entry

**Public Viewer**:
An unauthenticated person who can access only information explicitly published by a tournament.
_Avoid_: Guest account, anonymous user
