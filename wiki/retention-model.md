# Tournament Record Retention Model

## Scope and retention clock

Docket classifies every tournament record into an explicit retention class. Retention begins from the tournament's immutable **Tournament Closure** time unless a more specific accepted policy defines another trigger. Retention controls storage duration only; it never broadens the record's existing audience or makes restricted information public.

When multiple classes could apply, the longest applicable period required to preserve public history or reproduce a competitive outcome governs, except that the expressly shorter Accommodation Request policy remains controlling for accommodation content and stubs. A scoped active Legal Hold suspends deletion without changing access. Judge Assessment data is outside this tournament-retention policy and remains governed by [[judge-qualification-model]].

## Permanent Public Tournament Record

Docket retains the following explicitly published, human-readable tournament record permanently:

- Tournament Invitation Page content and published Tournament Schedules;
- every published Pairing and its public correction history;
- published standings and final standings;
- elimination brackets and public decisions;
- champions, finalists, other configured placements, awards, recipients, and represented Schools;
- public advancement information;
- every results version that was previously published publicly, presented as superseded Tournament Publication History after correction; and
- every public Correction Notice.

Permanent retention does not add internal fingerprints, versions, publishing actors, exact timestamps, private evidence, Judge-linked data, or audit details to a public projection. A later correction produces the already-defined corrected publication and permanent Correction Notice rather than silently erasing the public history.

## Seven-Year Competitive Evidence

Docket retains restricted records needed to reproduce, validate, or investigate competitive outcomes for seven years after Tournament Closure, including:

- complete Ballots and all Ballot Feedback versions;
- Judge-linked scores and panel provenance;
- private eligibility and disqualification evidence;
- locked Rulesets, Pairing Plans, Schedule versions, Standings Rules Configurations, Advancement Plans, Award Plans, and their source fingerprints;
- calculation inputs and outputs for pairings, standings, advancement, awards, and Final Results;
- approval, publication, correction, Downstream Conflict, and historical-attribution provenance; and
- audit events whose contents are necessary to explain an operative or published competitive decision.

These records remain behind their existing Judge, School-scoped, tournament-operational, evidence, or audit permissions. At seven years, Docket automatically deletes the restricted record and nonpublic historical versions unless an active Legal Hold applies. The permanent public projection and Correction Notices remain unchanged.

## Two-Year Routine Operational Telemetry

Docket retains delivery attempts and statuses, acknowledgments, routine operational-access events, and similar telemetry that is not needed to reproduce a competitive outcome for two years after Tournament Closure. If an event is part of competitive provenance, the seven-year class governs instead. At two years, Docket automatically deletes the telemetry unless an active Legal Hold applies.

A restricted Judge Reliability Record created by an Unexcused Special Circumstance Withdrawal is retained for two years from its decision. It exposes only the tournament, date, and outcome to the Judge and authorized future Judge Pool reviewers, never the private explanation, and its expiry does not change historical schedule or assignment provenance.

Routine telemetry is not public and is not included in ordinary School exports merely because it remains stored. A retention job records a content-free deletion event without preserving the deleted payload.

## Specific-policy precedence

- Encrypted Platform Identity Review evidence is deleted 30 days after final resolution unless held. Its content-free decision record is retained for seven years when current or historical sensitive authority was affected and for two years after an ordinary Account review.
- Encrypted Docket Account Suspension evidence is deleted 90 days after final reinstatement, expiry, or replacement by another formal process unless held. Its content-free decision record is retained for seven years when current or historical sensitive authority was affected and for two years for an ordinary Account.
- Account Security History sign-ins, Google Reauthentication events, suspension-status events, and completed Account-export events are retained for two years and then deleted unless held. Longer Suspension Decision Record retention does not make that restricted record part of the Account-facing history.
- Ordinary Active Role Context switch telemetry is retained for two years; privileged Platform Administrator and Legal and Privacy Operations context entry and exit provenance is retained for seven years, without making either public.
- Voluntary Account Deactivation deletes profile data not independently retained for another purpose within 30 days after execution unless held; tournament records and historical actor attribution keep their existing retention classes.
- Accommodation Request narrative, communications, evidence, decision-reason and alternative text, and instruction content follow the 30-day deletion rule in [[registration-model]].
- The content-free Accommodation Audit Stub follows its one-year rule.
- A Registration Data Schema field follows its declared retention or disposition rule unless the accepted value becomes governing competitive evidence, in which case the seven-year class applies and the Schema must disclose that consequence before collection.
- A Competitor No-Show classification, dispute, replacement or bye resolution, and correction remain restricted Competitive Evidence for that tournament under the seven-year class. They are visible only to the affected Competitor, their authorized Coach, and authorized tournament staff and cannot feed a cross-tournament Competitor score or public history.
- Judge Strike selections, Coach approvals, corrections, releases, and assignment provenance follow the same restricted seven-year Competitive Evidence period as the other Competitor tournament records. They receive no special extension and remain unavailable to Judges, opponents, and the public.
- Full Judge Qualification Assessment answers, detailed scores, Critical Competency detail, provider payloads, and integrity evidence follow a two-year attempt-based period in [[judge-qualification-model]]. Minimal expired or superseded Qualification History follows seven years from expiration or supersession. Superseded Judging Profiles follow two years unless a tournament-disclosed version qualifies for that tournament's seven-year Competitive Evidence period. Quick details retain their earlier deletion trigger. An Unexcused Judge No-Show uses the same restricted two-year Judge Reliability Record as an Unexcused Special Circumstance Withdrawal.
- A generated Account Data Export archive is an ephemeral delivery artifact deleted seven days after generation; this does not shorten the retention of its independently governed source records.
- Tournament-independent Practice Workspace sessions, invitations, governing Event Ballot Rubric references, titled Practice Feedback Rubric versions, Practice Ballot drafts and server receipts, Practice Placement Corrections, Practice Panel Results, Practice Feedback versions, mock results, and activity are deleted no later than thirty days after session creation; closure, cancellation, or copying cannot extend that limit, and they never inherit tournament Competitive Evidence retention because they are nonoperative. Practice creates no rankings, profile entries, or permanent performance history. Before deletion, each participant may export only their authorized Ballots, Panel Results, and Feedback as permission-filtered PDF or JSON, excluding private drafts, others' material, emails, and safety records; participants may delete their own unshared material, and the Practice Session Owner may delete the complete session after a warning. A removed participant's received material freezes at removal, and its export ends after seven days or the session's earlier deletion. Docket separately retains a minimized Practice Safety Report, decision, and necessary evidence for two years after resolution; a reported feedback version may be preserved there even after ordinary practice deletion. Safety records accept appended objective corrections, are restricted, excluded from Account exports unless legally required, and cannot affect tournament records. An exact Legal Hold may suspend their deletion under the existing two-person controls, and ordinary session deletion during review does not remove preserved safety evidence. Google Practice Meetings create no Docket-retained RSVP, attendance, join-time, recording, transcript, chat, presentation, audio, or video data. Minimal creation, connection-loss, replacement, leak rotation, delivery, update, and cancellation status expires with the ordinary session.
- Legal Holds follow [[access-model]] and [ADR 0026](../docs/adr/0026-require-two-person-legal-hold-control.md).

## Decision record

- **2026-09-03:** The project owner added titled Practice Feedback Rubric versions, Practice Ballot drafts and receipts, and Practice Placement Corrections to the ordinary thirty-day practice boundary without creating permanent history.

- **2026-09-03:** The project owner replaced retained session-created Ballot rubrics with references to the unified Event Ballot Rubric, retained configurable Practice Feedback Rubric versions and session-only results inside thirty days, and prohibited profile or permanent-history projection.

- **2026-09-03:** The project owner placed locked practice rubrics, Practice Panel Results, all Practice Feedback versions, and permission-filtered PDF and JSON exports inside the thirty-day boundary while allowing an exact reported feedback version to persist only as governed safety evidence.

- **2026-09-02:** The project owner explicitly placed Practice Ballots and all Practice Feedback versions inside the thirty-day session boundary and prohibited retention of Google RSVP and presentation activity alongside the existing meeting-data exclusions.

- **2026-09-02:** The project owner added only minimized Google authorization-loss, ownership-replacement, and leak-rotation status to the existing session-limited meeting lifecycle evidence while retaining the prohibition on meeting participation or content import.

- **2026-09-02:** The project owner allowed session deletion during unresolved safety review while preserving separated evidence and limited Google Practice Meeting retention to minimal lifecycle status with no attendance or content import.

- **2026-09-02:** The project owner applied the original thirty-day deadline to canceled practice sessions, allowed versioned objective safety corrections and exact Legal Holds, and prohibited Docket retention or import of Google Practice Meeting audio and video recordings.

- **2026-09-02:** The project owner set a two-year post-resolution period for minimized Practice Safety Reports, decisions, and necessary evidence, kept them outside ordinary practice deletion and Account exports absent legal necessity, and prohibited tournament-record effects.

- **2026-09-02:** The project owner anchored Practice Workspace deletion no later than thirty days after creation, bounded a removed participant's own-material export by seven days or earlier deletion, prohibited closure or copying from extending retention, and separated safety evidence for later retention design.

- **2026-09-02:** The project owner prohibited practice rankings and permanent performance history, allowed each participant to delete their own unshared material and export only their own Ballots and feedback, and allowed warned whole-session deletion by the Practice Session Owner.

- **2026-09-02:** The project owner aligned restricted Judge Strike records with the same seven-year Competitive Evidence retention as other Competitor tournament records rather than creating a separate duration.
- **2026-09-02:** The project owner retained Competitor No-Show and resolution records only as restricted tournament Competitive Evidence for seven years and prohibited public or cross-tournament Competitor reliability use.
- **2026-09-02:** The project owner applied the existing restricted two-year Judge Reliability Record to Unexcused Judge No-Shows without automatic qualification effect.
- **2026-09-02:** The project owner retained restricted Unexcused late-withdrawal Judge Reliability Records for two years, excluded private explanations and automatic qualification effects, and limited generated Account Data Export archives to seven days.
- **2026-09-02:** The project owner permanently retained prior public results publications as clearly superseded Tournament Publication History while preserving current corrected results as the default and keeping restricted metadata private.
- **2026-09-02:** The project owner fixed tournament-independent Practice Workspace retention at thirty days and prohibited practice records from becoming official tournament or Competitive Evidence history.
- **2026-09-01:** The project owner limited Account-facing Security History to sign-ins, Google Reauthentication, suspension status, and completed export events for two years, separate from longer purpose-restricted decision records.
- **2026-09-01:** The project owner adopted 90-day post-disposition deletion of suspension evidence and two- or seven-year content-free Suspension Decision Record retention according to authority sensitivity.
- **2026-09-01:** The project owner retained ordinary context-switch telemetry for two years and privileged context entry and exit provenance for seven years, and limited post-deactivation names to independently retained historical or public records plus minimum restricted attribution.
- **2026-09-01:** The project owner adopted 30-day deletion of Platform Identity Review evidence, two- or seven-year content-free decision retention based on authority sensitivity, and 30-day post-deactivation deletion of otherwise unnecessary profile data without altering independently retained history.
- **2026-09-01:** The project owner permanently retained published tournament history, retained restricted competitive evidence for seven years, retained routine non-result operational telemetry for two years, required automatic expiry unless held, and left accommodation and Judge Assessment records under their specific policies.
- **2026-09-01:** The project owner added Judge-specific two-year raw-evidence and superseded-profile periods, seven-year minimal qualification history, seven-year tournament-disclosed profile evidence, and existing earlier Quick Assessment deletion triggers.

See [ADR 0027](../docs/adr/0027-classify-tournament-record-retention.md).
