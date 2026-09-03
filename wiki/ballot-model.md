# Ballot Model

## Ballot components

A **Ballot** is the Judge's adjudication record for one assigned round. Docket treats its two components separately:

- The **Competitive Result** contains the winner and any scoring values used by standings, pairing, or advancement.
- **Ballot Feedback** contains the Judge's narrative reasoning and comments for the competitors.

## Submission and editing

A Judge may draft both components during an assigned round. **Ballot Submission** validates and locks the Competitive Result so the tournament can tabulate the round and continue operating. Ballot Feedback is not required for Ballot Submission and remains independently editable afterward without staff reopening.

- After Ballot Submission, the Judge receives a receipt and retains read-only access to the submitted Competitive Result.
- Changing a submitted Competitive Result requires an authorized **Ballot Reopening** with a reason and audit record.
- Adding or revising Ballot Feedback does not require Ballot Reopening.
- Feedback revisions retain version history and actor attribution.
- A Judge never receives access to another Judge's Ballot or unpublished standings through a Judge assignment.

Each tournament sets its **Feedback Deadline** before first-round Pairing Publication. The configuration declares a duration after the published end of the final scheduled round and defaults to 72 hours. The invitation shows the duration and resulting deadline, and first-round Pairing Publication locks the configuration. At the deadline, the latest Ballot Feedback becomes read-only to the Judge. A later feedback change requires a **Feedback Reopening** by a Tournament Director or Tabulation Staff member with the Ballot and correction permission bundle; the reopening requires a reason and audit record.

After first-round Pairing Publication, a Tournament Director may perform a reasoned **Feedback Deadline Extension**. An extension creates a new attributed deadline version and notifies Judges and active School Members; no actor may shorten the locked deadline. If an authorized schedule revision moves the final scheduled round later, Docket extends the deadline automatically by the same locked duration. Moving the final round earlier never shortens the current deadline. This extension-only rule supersedes the earlier requirement to use a general Emergency Amendment for every post-lock deadline change.

Tournament Closure blocks ordinary feedback drafting, editing, and publication. A post-closure feedback change requires the existing authorized, reasoned, audited Feedback Reopening as a Post-Closure Exception; closure itself grants no Judge or staff member new editing authority.

## Feedback publication

A **Feedback Draft** is visible only to its Judge. The Judge must explicitly perform **Feedback Publication** to make that revision visible to active School Members for both Entries in the round. Ballot Feedback is never public in the first slice.

After Feedback Publication:

- Recipients see only the current **Published Feedback** version.
- A later Judge edit creates a new private Feedback Draft; recipients continue seeing the prior Published Feedback.
- Recipients see the revision only after the Judge explicitly publishes it.
- At the Feedback Deadline, an unpublished draft remains private and is flagged incomplete; Docket does not publish it automatically.
- A published version remains available after the deadline even if a later private draft was left incomplete.

## Practice Ballots and feedback

A Practice Workspace uses a **Practice Ballot** governed by the event's one platform-wide, versioned **Event Ballot Rubric**, shared across official and practice rounds. Rules-governance Platform Administrators collaboratively edit a document-like Event Ballot Rubric Draft by adding and arranging open-ended question fields. A draft has no operative effect until validation, examples, diff, reason, audit, and publication complete. No School, Organizer, or Practice Session Owner may replace or customize it per session. New draft practices use the latest version; the Practice Role Lock pins it permanently. An official tournament pins its compatible version with the Event Ruleset before first-round Pairing Publication. Accepted Judges and Competitors preview the version before start. Every Practice Ballot field and submission is visibly nonoperative. A draft may be incomplete, while submission requires only fields the Event Ballot Rubric marks mandatory. Mock winners and scores are optional unless that rubric requires them and remain nonoperative.

A separate **Practice Feedback Rubric** governs written comments and falls back to Docket's versioned event default. Only the Practice Session Owner may select or edit it before the Practice Role Lock; Docket accepts no change suggestions from Organizers, Judges, Competitors, or other participants. The owner may title and save versions for School reuse or explicitly share a sanitized titled version across Schools containing only prompts, sections, and instructions. The selected version locks at session start and remains fixed through Feedback Reopening.

A submitted Practice Ballot is visible only to its authoring Judge, assigned Competitors, and the Practice Session Owner or authorized Organizer. Docket blocks the Judge's leave or complete-round action until submission; Feedback may follow later, and browser abandonment does not submit. For a multi-Judge round, Docket withholds every Judge's Ballot from the other Judges until all assigned Judges submit. It then applies the event panel rule, normally strict majority, and produces the official session-scoped **Practice Panel Result**; a failed majority becomes `Tied Practice Panel`. Judges and assigned Competitors may then compare submitted Ballots. That result is never a Competitive Result and cannot affect official tournament data, qualification, rankings, profiles, or permanent history.

Only the Practice Session Owner may authorize a reasoned reopening or correction before closure. Reopening withdraws the current Practice Panel Result, preserves all versions, and waits for every required Ballot to be resubmitted before recalculation. The owner may directly make a versioned **Practice Placement Correction** limited to competitor-placement fields on the final Practice Ballot, without changing Judge-authored open-ended responses, non-placement scores, Feedback, or attribution and without supplying a missing Ballot. A missing required Ballot at closure produces `Incomplete Practice Panel`, preserves authorized individual submissions, and creates no result after a prominent owner warning. If a Judge becomes unavailable, a preaccepted same-role Practice Standby may independently submit and permanently replace that Judge; without one, the panel remains incomplete.

Closing a browser does not submit a Ballot. Docket preserves its private draft, records it outstanding, notifies the Judge and owner, and creates no reliability or qualification effect. Where supported, an encrypted local draft survives connection loss and retries after reconnection; only a server receipt establishes submission. The owner can wait, activate an eligible standby, or close the incomplete panel but cannot submit for the Judge.

**Practice Feedback** follows the tournament Feedback Draft and Feedback Publication pattern without a Competitive Result dependency. It is optional at Ballot submission, privately drafted, explicitly published, keeps the prior publication visible during later private edits, and never auto-publishes. The deadline defaults to seventy-two hours after the practice round, may be extended but not shortened by the owner, and thereafter requires reasoned owner Feedback Reopening, always before the thirty-day deletion ceiling. Default recipients are assigned Competitors and the owner or authorized Organizer. The Judge and owner may inspect complete version history; intended Competitors receive current feedback and change notices but no withdrawn draft. Removal freezes the participant's received Ballot and Feedback set and blocks later publication to them. A reported harmful version is preserved separately and may be hidden, restored, removed, or restricted only through the Practice Safety Report process. Practice Feedback is never public.

The completed Practice Panel Result is visible only to assigned Competitors, all assigned Judges after submission, and the owner or authorized Organizer. Authorized downloads provide a human-readable PDF and structured JSON containing the requester's permitted Practice Ballots, Practice Panel Result, and Practice Feedback plus calculation rule, completion time, current version information, event and session labels, and a prominent nonoperative notice. They exclude private drafts, other participants' material, emails, and safety records. No Practice Panel Result enters an Account, School, qualification, ranking, or public-profile history.

## Competitive Result fields

A normal Lincoln-Douglas preliminary-round Competitive Result requires:

- Exactly one winning Entry
- Speaker Points for both Competitors, within the range and precision defined by the adopted Ruleset

An Elimination Round Competitive Result requires exactly one winning Entry and contains no Speaker Points. Docket rejects Judge-submitted Speaker Points and Administrative Points for every elimination Ballot or outcome, whether the round has one Judge or a panel.

The Ballot receives both Entries and their affirmative and negative side assignments from the published pairing. The Judge confirms the displayed assignment but does not re-enter or redefine it.

Ballot Submission validates that the submitting Judge owns the assignment, the Ballot belongs to the published pairing, the winner is one of its two Entries, both Speaker Points are present and Ruleset-valid, and no conflicting submission already exists.

### Duplicate and conflicting submissions

Docket makes Ballot Submission idempotent. An authenticated retry of the same submission request, or an equivalent submission with the same validated Competitive Result, returns the original Ballot receipt and current locked version without creating another Ballot, result version, or audit event that implies a second decision.

After the Competitive Result locks, a later submission containing different competitive data is a **Conflicting Ballot Attempt**. Docket rejects it without changing the current result, preserves the attempted data, actor, assignment, request identifier, time, and comparison to the locked version in restricted audit history, and notifies the assigned Judge and Tournament Directors or Tabulation Staff with the Ballot and correction permission bundle.

A Judge who intended to correct or disputes the locked result must use the authorized Ballot Reopening workflow. The attempted submission cannot itself reopen, supersede, or overwrite the Competitive Result. Any accepted correction becomes a new Result Correction version under the existing evidence, attribution, impact-preview, and downstream-conflict rules.

For an Elimination Round, the same validation omits the preliminary Speaker Point requirement and instead rejects any point value.

Byes, forfeits, and other non-Judge resolutions are **Administrative Outcomes** entered through a separate, authorized, reasoned, audited staff workflow. Docket must not fabricate a Judge Ballot to represent them.

When an assigned Competitor is classified as a No-Show and no Ruleset-eligible same-School and same-event replacement is available, Tabulation Staff record a Bye Round for the opposing Entry under the locked Ruleset. The bye has no fabricated opponent, Judge Ballot, or Judge-submitted Speaker Points; any standings treatment comes only from the locked Standings Rules Configuration.

A Competitor may file the No-Show Dispute directly in Docket within 60 minutes or before the event's next round starts, whichever occurs first. Docket associates and notifies the responsible Coach, who may add a statement but cannot block, withdraw, or suppress it. Only the filing Competitor may withdraw before decision; explicit confirmation makes withdrawal final for that classification, is audited, and preserves the operative classification. The Director considers check-in, arrival, messaging, staff-contact, delivery-log, and incorrect published time or room evidence without requiring medical records and decides within 30 minutes or before the next round starts. The classification and any approved replacement or bye remain operative during review and an overdue decision escalates without automatic outcome. A rejection is final for the tournament except for an objective system or data-entry correction. Its private in-app and email notice is delivery-tracked but informational, remains in the Competitor Account, and neither requires acknowledgment nor reopens the dispute or delays operations after delivery failure. Before replacement sign-off, Tabulation Staff may restore a late-arriving original assignee; after replacement or bye approval, reversal requires a Director-approved correction, and a Started round never restores the original person. A successful dispute appends a reasoned reversal, removes the current restricted flag, corrects unstarted artifacts, and preserves the original classification only in restricted audit history; Started and Completed artifacts remain as operated under the locked Ruleset. Any public correction uses the generic reason “No-Show classification corrected” and withholds absence details, evidence, private reasoning, and restricted actor metadata.

An elimination bracket bye is generated from the locked Advancement Field and advances the seeded Entry without a Judge Ballot, Speaker Points, or fabricated Competitive Result. Its recorded provenance identifies the Advancement Plan and Field versions, seed, bracket line, and bye reason.

After any elimination round Starts, a withdrawal or disqualification cannot refill or reseed the bracket. Docket records the affected opponent's advancement as the applicable versioned bye, forfeit, or Disqualification Ruling without creating Speaker Points or a fabricated Judge decision. The original Advancement Field and bracket position remain auditable.

### Panel decisions

A multi-Judge panel must contain an odd number of assigned Judges. Every panel Judge submits an independent Competitive Result and separate Ballot Feedback. The **Panel Decision** awards the round to the Entry receiving a strict majority of those individual Judge decisions; Docket preserves the complete vote split and each Judge's attribution.

Docket locks the Panel Decision as soon as one Entry reaches an **Irreversible Majority** of the assigned panel: more than half of all assigned Judges, making the winner mathematically unchangeable by outstanding Ballots. Pairing, standings, and advancement may consume the locked winner immediately so the tournament can continue.

Remaining panel Competitive Results are still required and remain visibly outstanding with reminders and escalation. Their later submission cannot change an already irreversible winner but completes the panel record. Each Judge's feedback follows the independent feedback workflow and deadline.

In a preliminary panel, Speaker Point aggregation follows the adopted Ruleset and retains every individual Judge-submitted value and the aggregation inputs. In an Elimination Round, neither individual panel Ballots nor the Panel Decision contains Speaker Points. Reopening or correcting an individual panel decision uses the normal versioning rules and creates a Downstream Conflict if the corrected vote would change a previously consumed Panel Decision.

### Ballot due time and escalation

Every round has a **Ballot Due Time** equal to its scheduled end time plus the tournament's configured Ballot grace period. The grace period defaults to 15 minutes. Docket shows the due time on the Judge's assignment and retains the schedule version and grace-period value used to calculate it.

Docket applies the following escalation sequence to every outstanding Competitive Result:

1. At the scheduled round end, remind the assigned Judge that the Competitive Result remains due.
2. At the Ballot Due Time, mark the Ballot **Late** and notify the Judge again.
3. Ten minutes after the Ballot Due Time, notify Judge-and-room operations staff and all Tournament Directors so they can contact, locate, or replace the unavailable decision source.

At the third stage, Docket also places a tournament-local **Judge Assignment Hold** on the Judge. While the hold is active, the Judge is unavailable for new round assignments at that tournament. Submission of the missing Competitive Result releases the hold automatically; a Tournament Director may instead clear it explicitly with a recorded reason, actor, and time. A Director may remove the Judge's future assignments through the applicable pairing or schedule-revision workflow and notices.

An Irreversible Majority allows a Panel Decision to advance while each missing individual Ballot remains Late and outstanding. A single-Judge round, or a panel without an Irreversible Majority, blocks result-dependent standings, advancement, and pairing until the Competitive Result arrives or a Tournament Director issues an evidence-backed Administrative Ruling. The ruling records its evidence, reason, Director, time, and resulting competitive-data resolution; it never fabricates or impersonates a Judge Ballot.

For Final Results Publication, an outstanding Ballot after an Irreversible Majority does not block the settled panel winner. If that Ballot would also supply a scoring value required by the locked standings or award rules, the missing scoring input remains a separate readiness blocker until supplied or resolved without fabrication under those rules. Ballot Feedback never blocks final results.

Late or missing status is operational evidence, not a competitive result. Docket never infers a winner, creates an automatic forfeit, or penalizes an Entry merely because a Judge has not submitted.

A Judge Assignment Hold and any removal from future assignments are operational actions for the current tournament only. They do not change the Judge's assessment score, Event Qualification, Judge Qualification Tier, Judging Profile, or eligibility at another tournament.

### Speaker Points for administrative decisions

When an adjudicated completed preliminary round later receives a Disqualification Ruling, its Judge-submitted Speaker Points remain the current point values by default even when the competitive winner changes. The adopted Ruleset may explicitly require those points to be excluded or replaced; Docket applies that versioned rule prospectively to standings while retaining the original Judge-submitted values and their provenance. Elimination Rounds never acquire point values through a Disqualification Ruling.

When no preliminary-round adjudication occurred, including a pre-round forfeit or bye, Docket does not create Judge-submitted Speaker Points. If the adopted Ruleset defines an averaging formula or another point value for that preliminary Administrative Outcome, Docket creates **Administrative Points** labeled with the outcome, Ruleset version, formula version, inputs, and calculation time. Administrative Points are never displayed or audited as if a Judge submitted them. An Elimination Round contains neither Judge-submitted nor Administrative Points.

Standings calculations distinguish Judge-submitted Speaker Points, Administrative Points, excluded points, and absent points. A manual administrative value without explicit Ruleset authority is invalid.

A published standings snapshot may expose aggregate point metrics used by its locked tie-break sequence, but its standings projection never links an individual score to a Judge or exposes a detailed Ballot or Ballot Feedback. School-scoped calculation breakdowns preserve result and point provenance without broadening access to restricted Ballot content.

## Competitive Result correction

Only a Tournament Director or Tabulation Staff member with the Ballot and correction permission bundle may initiate Ballot Reopening. The action requires a reason, an impact preview, and explicit confirmation.

A corrected submission creates a **Result Correction** rather than overwriting the original Competitive Result. Docket then recomputes derived standings and advancement while retaining prior revisions for audit.

Whenever possible, Ballot Reopening returns the Competitive Result to the original Judge for resubmission. If that Judge is unavailable, a Tournament Director or Tabulation Staff member with the Ballot and correction permission bundle may enter a **Staff Result Correction** only when supported by documented Judge confirmation or a formal **Administrative Ruling**.

A Staff Result Correction records its evidence, correcting actor, and reason under the staff member's identity. It is never attributed to the Judge. Correcting the Competitive Result does not alter Ballot Feedback or its publication state.

### Completed-round decision correction

After a round reaches Completed, only a Tournament Director may create a **Completed Round Decision Correction**, and only for a verified input error or a disqualification. An input error is incorrect competitive data entered or imported into Docket rather than a disagreement with the Judge's adjudication. A disqualification correction must identify the disqualified Entry or Competitor, applicable Ruleset authority, evidence, and resulting competitive decision.

The Director reviews an impact preview and explicitly confirms the correction. Docket preserves the original Judge-submitted Competitive Result or Administrative Outcome and creates a new Director-attributed decision version; it does not reopen, edit, or impersonate the Judge's Ballot. Ballot Feedback and its publication state remain unchanged.

The correction may change the winner or decision type and, in a preliminary round only, Speaker Points when required by the verified input error or disqualification. It may not add points to an Elimination Round or change the completed round's Entries, affirmative and negative sides, Judge, room, scheduled block, Pairing Publication, or Pairing Plan. Strategic dissatisfaction, a preferred advancement outcome, or reconsideration of the Judge's substantive decision does not qualify.

Docket recomputes standings and advancement from the corrected decision and creates Downstream Conflicts wherever later artifacts disagree. The correction, evidence, Ruleset basis, impact preview, approving Director, previous and current versions, time, and notices remain auditable. If public standings, advancement, pairings, awards, or final results change, Docket also issues a public human-readable Correction Notice that explains the changed public values and competitive effect without exposing internal metadata or evidence.

### Disqualification scope

Every disqualification is a Director-created **Disqualification Ruling** with one scope supported by the adopted Ruleset:

- **Round-only loss** — changes only the identified round's competitive decision.
- **Prospective tournament removal** — preserves prior completed decisions and makes the Entry ineligible for remaining rounds.
- **Full-tournament disqualification** — removes future eligibility and applies retroactive forfeits only when the adopted Ruleset explicitly requires them.

Prior completed decisions remain current by default. When a full-tournament disqualification requires retroactive forfeits, the Director must create a separate Completed Round Decision Correction for every affected completed round; Docket does not apply one bulk overwrite. The correction preserves each original decision and all historical pairings.

Before confirmation, Docket displays the ruling's Ruleset authority, evidence, scope, affected rounds, new decisions, Entry eligibility, standings, advancement, awards, published results, and Downstream Conflicts. The Director confirms the exact previewed version. A change in scope or effects requires a new preview and confirmation, and affected participants receive versioned notices.

Already published or completed later rounds never change silently. If their Entries, sides, pairings, or advancement no longer agree with corrected inputs, Docket creates a **Downstream Conflict** and requires an explicit, attributed, audited resolution.

### Downstream Conflict resolution

Tabulation Staff may investigate a Downstream Conflict and prepare its impact analysis and resolution plan. Only a Tournament Director may approve the resolution.

Docket resolves the conflict according to how far the affected artifact has progressed:

- Unpublished artifacts are regenerated from the corrected competitive data.
- A published round that has not started is withdrawn and republished with corrected assignments and notices to affected participants.
- A started or completed downstream pairing remains as played. A Tournament Director records an Administrative Ruling that states how the triggering correction affects future standings and advancement without rewriting that pairing. The round's own competitive decision changes only through a separately justified Completed Round Decision Correction for its input error or disqualification.
- Any affected public artifact receives a human-readable **Correction Notice** describing its previous and corrected public values, competitive effect, and required participant action without internal metadata or evidence.

Every resolution records its approving Director, reason, impact, affected artifacts, and notices. Docket retains the original artifact and all prior result, standing, advancement, publication, and notice versions; resolution never deletes history.

See [ADR 0010](../docs/adr/0010-version-results-and-surface-downstream-conflicts.md).

See [ADR 0009](../docs/adr/0009-separate-results-from-feedback.md).

Under [[retention-model]], complete Ballots, every Ballot Feedback version, Judge-linked scores, panel provenance, corrections, and related competitive evidence remain restricted under their existing audiences for seven years after Tournament Closure. Expiry deletes those restricted records unless a Legal Hold applies; published round decisions, pairings, results, and public Correction Notices remain permanently available through their public projections. Judge Assessment data follows [[judge-qualification-model]] instead.

## Decision record

- **2026-09-03:** The project owner adopted collaborative document-like Event Ballot Rubric drafts whose versioned open-ended question fields require platform rules governance, validation, publication, and practice or tournament pinning.
- **2026-09-03:** The project owner reserved Practice Feedback Rubric editing to the owner without participant suggestions, adopted versioned defaults and titled reusable or sanitized shared versions, and locked selection at session start.
- **2026-09-03:** The project owner preserved drafts on browser or connection loss, required a server receipt, allowed warned incomplete closure, prohibited surrogate Judge submission, and limited owner edits to reasoned versioned competitor-placement corrections.

- **2026-09-03:** The project owner confirmed session-only official Practice Panel Results, adopted event-rule majority and tied results, reserved pre-closure reopening to the Practice Session Owner, required Ballot submission before Docket departure, and prohibited results for incomplete panels.
- **2026-09-03:** The project owner superseded session-created adjudication rubrics with a unified Event Ballot Rubric for each event, separated configurable Practice Feedback Rubrics with a default, and applied tournament-style optional Feedback drafting, publication, deadlines, extension, and reopening within practice retention.
- **2026-09-03:** The project owner restricted Practice Panel Result audiences and profile history, included authorized result data in PDF and JSON exports, and required same-role standby replacement or an incomplete panel when a Judge becomes unavailable.

- **2026-09-03:** The project owner reserved optional rubric control to the Practice Session Owner, required pre-start preview and version lock, and allowed incomplete drafts while enforcing only locked required fields at publication.
- **2026-09-03:** The project owner limited published Practice Ballot recipients, protected multi-Judge independence until all Ballots are submitted, and required an official session-scoped Practice Panel Result without external or permanent effect.
- **2026-09-03:** The project owner set Practice Feedback recipients and history views, froze removed-recipient material, routed harmful feedback through safety review, and adopted permission-filtered PDF and JSON exports.

- **2026-09-02:** The project owner required clearly nonoperative Practice Ballots based on official event structures, allowed only unmistakably separate Organizer-selected practice rubrics, and prohibited all official or qualification effects.
- **2026-09-02:** The project owner adopted private drafting and explicit publication for Practice Feedback without a Competitive Result dependency, allowed edits until session closure, and exposed the current version and last-updated time only to intended practice recipients.

- **2026-09-02:** The project owner allowed direct Competitor filing without Coach suppression, defined nonmedical No-Show evidence and a 30-minute-or-next-round Director deadline, and made successful reversal prospective while retaining restricted audit history.
- **2026-09-02:** The project owner limited dispute withdrawal to the filing Competitor before decision, made rejection final except for objective correction, required privacy-minimized private rejection and public correction notices, and preserved operated Started and Completed artifacts.
- **2026-09-02:** The project owner made confirmed dispute withdrawal final and made rejection notices persist in the Competitor Account with tracked in-app and email delivery but no required acknowledgment, reopening, or operational delay after delivery failure.
- **2026-09-02:** The project owner adopted a 60-minute-or-next-round private Coach-associated Competitor No-Show Dispute, kept the current resolution operative during review, and governed late-arrival restoration around replacement sign-off and Started status.
- **2026-09-02:** The project owner made failure to find an eligible replacement for a Competitor No-Show produce a Ruleset-governed Bye Round for the opposing Entry without a fabricated opponent, Judge Ballot, or Judge-submitted Speaker Points.
- **2026-09-01:** The project owner separated the Competitive Result from Ballot Feedback, locked competitive fields at Ballot Submission, and allowed Judges to add or edit feedback afterward without staff reopening.
- **2026-09-01:** The project owner made the Feedback Deadline tournament-configurable before Pairing Publication, set its default to 72 hours after the final round, and required an audited Feedback Reopening for later edits.
- **2026-09-01:** The project owner retained the locked 72-hour default, allowed only reasoned Director extensions after first-round Pairing Publication, prohibited shortening, and made closure wait for deadline expiration rather than every Judge's submission.
- **2026-09-01:** The project owner blocked ordinary feedback changes after closure while preserving an authorized audited Feedback Reopening as a Post-Closure Exception.
- **2026-09-01:** The project owner kept Feedback Drafts private to Judges, required explicit Feedback Publication to School Members for both Entries, retained the last Published Feedback during revisions, and prohibited automatic or public publication.
- **2026-09-01:** The project owner required a winning Entry and Ruleset-valid Speaker Points for both Competitors in normal preliminary decisions, imported pairing data into the Ballot, and separated Administrative Outcomes from Judge Ballots; the later elimination-round decision prohibits points in out rounds.
- **2026-09-01:** The project owner required authorized, previewed, confirmed Ballot Reopening; versioned Result Corrections; automatic derived-data recalculation; and explicit resolution of Downstream Conflicts without silent round rewrites.
- **2026-09-01:** The project owner returned corrections to the original Judge when possible and otherwise required evidence-backed, staff-attributed Staff Result Corrections without Judge impersonation.
- **2026-09-01:** The project owner reserved Downstream Conflict approval for Tournament Directors, allowed Tabulation Staff to prepare resolution plans, and selected state-dependent regeneration, republication, preservation-as-played, and final-result correction notices without deleting history.
- **2026-09-01:** The project owner allowed only a Tournament Director to change a completed round's competitive decision for a verified input error or disqualification, required a new attributed decision version and downstream recomputation, and kept the completed pairing immutable.
- **2026-09-01:** The project owner required every Disqualification Ruling to use a Ruleset-supported round-only, prospective-removal, or full-tournament scope; preserved prior decisions unless retroactive forfeits are explicitly required; and required separate versioned corrections, impact preview, confirmation, and notices.
- **2026-09-01:** The project owner preserved Judge-submitted Speaker Points by default when an adjudicated decision changes for disqualification, prohibited fabricated Judge points for unadjudicated outcomes, and allowed only Ruleset-defined, clearly labeled Administrative Points with full calculation provenance.
- **2026-09-01:** The project owner required odd-sized panels, independent Judge Ballots, strict-majority Panel Decisions, immediate locking at an Irreversible Majority, continued collection of outstanding Ballots, and Ruleset-defined preliminary point aggregation.
- **2026-09-01:** The project owner prohibited all Speaker Points in Elimination Rounds, including individual and panel Ballots, Administrative Outcomes, corrections, and disqualifications.
- **2026-09-01:** The project owner set Ballot Due Time to scheduled end plus a tournament-configurable grace period defaulting to 15 minutes, required reminder, late, and staff-escalation stages, blocked result-dependent operations without a single-Judge result or panel majority, and prohibited automatic competitive consequences for a missing Ballot.
- **2026-09-01:** The project owner made identical Ballot retries idempotent, required conflicting post-lock submissions to be rejected and audited with staff notice, and routed every intended change or dispute through Ballot Reopening and versioned correction instead of silent overwrite.
- **2026-09-01:** The project owner required an escalated missing Ballot to place a tournament-local hold on new Judge assignments until submission or Director clearance, allowed Directors to remove future assignments through normal revision controls, and prohibited qualification or cross-tournament penalties.
- **2026-09-01:** The project owner represented elimination bracket byes as advancement artifacts with Plan, Field, seed, bracket-line, and reason provenance rather than Judge Ballots or point-bearing results.
- **2026-09-01:** The project owner required post-start elimination vacancies to resolve through a versioned bye, forfeit, or Disqualification Ruling without replacement, reseeding, Speaker Points, or fabricated Judge decisions.
- **2026-09-01:** The project owner allowed public aggregate point metrics needed to explain standings while prohibiting standings projections from exposing Judge-linked scores, detailed Ballots, or feedback.
- **2026-09-01:** The project owner made Ballot Feedback and outcome-irrelevant panel Ballots nonblocking for final publication while preserving a block for any missing scoring input independently required for placement or awards.
- **2026-09-01:** The project owner required public human-readable Correction Notices for changed public competitive artifacts while restricting linked actors, timestamps, fingerprints, evidence, notes, and audit details.
- **2026-09-01:** The project owner retained restricted Ballots, feedback, Judge-linked scores, panel provenance, and correction evidence for seven years while retaining published decisions and Correction Notices permanently.
