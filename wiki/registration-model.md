# Registration Model

An authorized Coach may enter this workflow through Register or Manage Entries on a Tournament Invitation Page found in [[tournament-directory-model]]. The Coach must hold the applicable School Membership; discovering the tournament or opening the registration action grants no School authority and requires no tournament-issued Account invitation. If the Membership is missing for an existing School, Docket sends the request to its current School Manager for explicit sign-off. If no verified School or Manager exists, the Coach enters the Provisional School and first-membership Platform Administrator verification workflow.

## Lincoln-Douglas Entry identity

An **Entry** is a tournament-specific registration of exactly one **Competitor** in Lincoln-Douglas Debate representing exactly one **School**.

For a given tournament:

- A Competitor may have no more than one active Lincoln-Douglas Entry.
- A School correction or withdrawal changes the Entry's status through an audited transition; it does not overwrite its history.
- A withdrawn Entry is retained for audit and historical reporting rather than deleted.
- The same Entry identity proceeds through registration, pairings, ballots, standings, advancement, and final results.

A Disqualification Ruling is distinct from voluntary withdrawal. A round-only loss does not remove the Entry from future eligibility. Prospective removal and full-tournament disqualification make the same Entry identity ineligible for future pairings while preserving its registration, prior pairings, decisions, and audit history. See [[ballot-model]].

## Entry registration lifecycle

Every Entry has exactly one **Entry Registration State**:

- **Draft** — a School-visible Entry being prepared but not yet submitted to the tournament;
- **Submitted** — a complete Entry awaiting tournament action;
- **Waitlisted** — a complete Entry awaiting available capacity;
- **Accepted** — an Entry admitted to the tournament field;
- **Withdrawn** — an Entry removed by its School or authorized tournament staff while preserving the record and reason; or
- **Rejected** — an Entry denied admission through an attributed tournament action with a reason.

Draft, Submitted, Waitlisted, and Accepted are active registration states for purposes of the one-active-Lincoln-Douglas-Entry-per-Competitor invariant. Withdrawn and Rejected are terminal historical states unless a later explicitly authorized transition is defined. No state is represented by deletion or reuse of the Entry identity.

Registration state answers whether and where an Entry is in the admission process. **Competitive Eligibility** is a separate dimension answering whether the admitted Entry may currently compete, be paired, or advance. A Disqualification Ruling changes eligibility according to its scope and does not convert the Entry to Rejected, Withdrawn, or another registration state. Likewise, rejection or withdrawal is not labeled a disqualification.

### Normal transition authority

A School Member holding the Entry Manager role may:

- create and edit a Draft for that School;
- submit a complete Draft, moving it to Submitted; and
- withdraw that School's Draft, Submitted, Waitlisted, or Accepted Entry at any time, subject to Late Withdrawal handling after the School edit deadline.

A Tournament Director or Tabulation Staff member holding the Registration operations permission bundle may:

- return a Submitted Entry to Draft with a correction request;
- move a Submitted Entry to Waitlisted, Accepted, or Rejected; and
- move a Waitlisted Entry to Accepted or Rejected.

Each tournament-side **Entry State Transition** records the prior and next states, actor, permission, reason, and internal time. Returning an Entry to Draft identifies the fields or evidence the School must correct. Acceptance, waitlisting, and rejection cannot silently mutate the underlying Competitor Account or substitute a different Competitor or School. Tournament personnel request an authorized correction or use a separately governed historical-correction workflow instead.

School submission and withdrawal are also attributed and versioned; withdrawal records a reason without exposing private evidence publicly. Restoration from Withdrawn or Rejected is not a normal transition and requires a separately defined exception workflow.

### Entry Restoration

Before first-round Pairing Publication, a Tournament Director or Registration-authorized Tabulation Staff member may perform an **Entry Restoration** when the School requests restoration or evidence shows that the withdrawal or rejection was erroneous. Docket preserves the terminal transition and creates a new attributed transition returning the same Entry identity to Submitted. The action records the evidence, reason, actor, prior versions, and an admission and capacity impact preview. Restoration never returns the Entry directly to Accepted or its previous waitlist position; the ordinary admission workflow evaluates it again.

After first-round Pairing Publication but before any round starts, only a Tournament Director may restore a mistakenly withdrawn Entry that had been Accepted immediately before withdrawal. The Director reviews a full impact preview. Every affected published pairing must undergo Pairing Withdrawal, regeneration or correction under the locked method, validation, approval, and republication with notices before the Entry may compete.

Once any round starts, no Withdrawn or Rejected Entry may return to an active registration state. Docket preserves the as-operated field and routes verified historical or competitive errors through the applicable correction and Downstream Conflict workflows without creating a duplicate replacement Entry or silently altering started pairings.

## Tournament Registration Policy

Each tournament has a versioned, timezone-aware **Tournament Registration Policy** configured by a Tournament Director and published on the Tournament Invitation Page before registration opens. It contains:

- the registration opening;
- the Entry submission deadline;
- the School edit deadline;
- the admission-decision deadline; and
- the waitlist-closing deadline.

The Policy also contains one deterministic **Admission Policy** defining event capacity, any optional per-School Accepted-Entry cap, and any named priority groups with their objective membership rules. Those terms are public before registration opens. Within each priority group, Docket orders complete Entries by their complete submission time; an exact timestamp tie is resolved by a reproducible seeded draw whose seed and output remain in internal provenance.

Docket shows each deadline in the tournament's named timezone, stores an unambiguous instant internally, validates that the timeline is coherent, and preserves every published policy version. The policy controls ordinary commands without changing the six-state lifecycle or the authority assigned to each transition.

Before registration opens, a Tournament Director may replace and republish the Policy. After registration opens, every **Registration Policy Revision** is one-way in the Schools' favor: it may extend a deadline or relax a requirement, but it cannot shorten a deadline, add a stricter requirement, revoke a previously valid submission, or reduce time already promised. A timezone correction cannot move any deadline to an earlier instant.

Docket validates the exact revised Policy and produces an impact preview covering all existing Draft, Submitted, Waitlisted, Accepted, Withdrawn, and Rejected Entries. The Director must confirm the reason and preview. Docket preserves the prior version, publishes a human-readable change notice on the invitation page, and notifies affected School Members. Public projections show the changed terms without internal fingerprints, actor attribution, or exact revision metadata.

First-round Pairing Publication ends Registration Policy Revision authority. After that boundary, no actor may revise a deadline or requirement; only the already-defined Late Withdrawal, Entry Restoration, historical correction, and pairing or downstream workflows remain available according to their own limits.

### Admission Recommendation and waitlist

Docket applies the exact published Admission Policy to current complete Entries and produces an immutable **Admission Recommendation** identifying the calculated Accepted and Waitlisted transitions, priority group, submission ordering input, cap application, seeded tie outcome, capacity use, excluded Entries, and warnings. Registration-authorized staff or a Tournament Director must review and confirm the exact recommendation before those state transitions occur. Any source Entry or Policy change invalidates the unconfirmed recommendation and requires recalculation.

No actor may manually reorder the waitlist or select a lower-ranked Entry while a higher-ranked eligible Entry remains. A tournament that needs host, geographic, invitation, or another special priority must define an objective named priority group before registration opens. After opening, a Policy Revision cannot add or strengthen a priority rule that disadvantages an already submitted Entry.

When a withdrawal or valid capacity increase creates space before the waitlist-closing deadline, Docket recalculates and recommends the highest-ranked eligible Waitlisted Entry for acceptance. At the waitlist-closing deadline, Docket prepares a closure recommendation moving every remaining Waitlisted Entry to Rejected with the standardized reason `CAPACITY_NOT_AVAILABLE`; Registration-authorized staff or a Director confirms the exact batch and its notices. The public never exposes private priority evidence, internal timestamps, seeds, or waitlist positions.

## Minimum Entry data and projections

The first Lincoln-Douglas slice requires only the following **Core Entry Data**:

- a reference to the authenticated Competitor Account;
- the Competitor's public display name;
- the canonical School identity;
- the event identity;
- grade level or the governing Ruleset's eligibility category;
- a versioned School eligibility attestation; and
- a responsible Coach contact who has an active Membership for that School.

Docket validates the School relationship, the one-active-Entry invariant, the event and eligibility category, the responsible Coach's active Membership, and the attestation version, actor, and time. The attestation records the School's assertion that the Competitor satisfies the applicable entry requirements; it is not itself a tournament eligibility ruling or a substitute for a later Disqualification Ruling.

Date of birth, home address, a minor's personal email address or telephone number, guardian information, medical information, and accommodation details are not Core Entry Data and cannot be required merely to create or submit an ordinary Entry. Any later workflow that has a legitimate need for additional information must define a separate purpose, audience, retention rule, and authorization boundary rather than adding it implicitly to the core record.

Grade or eligibility category, the eligibility attestation, and the responsible Coach contact are restricted registration data. Authorized School Members may view them for their own School, and Registration-authorized tournament personnel may view them only as needed to operate admission and eligibility workflows. They are not available to unrelated Schools or Public Viewers.

When a tournament explicitly publishes Accepted Entries, pairings, or results, the **Public Entry Projection** contains only the Competitor's public display name, School, and event. It excludes grade or category, the attestation, Coach contact, internal identifiers, fingerprints, actor attribution, and exact timestamps. An Entry does not become public merely by being Draft, Submitted, Waitlisted, Rejected, or Withdrawn.

### Registration Data Schema

A tournament may collect information beyond Core Entry Data only through a separate, versioned **Registration Data Schema** configured by a Tournament Director and published before registration opens. The Tournament Registration Policy references the exact accepted Schema version, and the Tournament Invitation Page presents a human-readable list of the additional questions and their purposes before a School begins an Entry.

Each additional field declares:

- a stable field identifier and human-readable label;
- the specific operational purpose for collecting it;
- whether it is required or optional;
- a supported data type and runtime validation rules;
- the authorized audience allowed to read it;
- a retention or disposition rule; and
- its public-visibility classification.

The first slice permits no additional registration field to appear in the Public Entry Projection; its public-visibility classification must therefore be restricted. This preserves the accepted public boundary of display name, School, and event. Docket rejects fields with no stated purpose, unsupported free-form executable validation, an audience broader than the stated purpose requires, or a retention rule that is absent.

After registration opens, a Director may publish only a monotonic, School-favorable Schema revision: remove a field, stop collecting it, or change a required field to optional. A revision cannot add a field, make an optional field required, tighten validation, broaden its audience, lengthen retention, make it public, or invalidate a previously complete Entry. Docket preserves the Schema version under which each response was supplied and applies the field's declared disposition when collection ends. First-round Pairing Publication ends Schema revision authority.

Medical information and accommodation details are prohibited in the Registration Data Schema, including disguised collection through generic free-text fields. A tournament needing accommodation information must use a separate restricted Accommodation Request workflow with its own purpose, access, lifecycle, and retention controls. The Registration Data Schema may ask only whether the School wants to begin that separate workflow; it cannot contain the request or its details.

### Accommodation Request access and disclosure

An Entry Manager or the Entry's Responsible Coach Contact may create and view an Accommodation Request for an Entry belonging to their School. The workflow asks for the operational adjustment being requested and the functional constraints relevant to providing it; it does not request a diagnosis by default. Supporting evidence, when a later policy authorizes it, remains part of the full restricted request rather than the Entry or a Registration Data Schema response.

Only the Tournament Director and Tabulation Staff whom the Director explicitly grants the **Accommodation Operations** permission may view the complete request, its communications, and any supporting evidence. General registration, pairing, room, Judge-assignment, or publication authority does not imply this access. Every view, change, export, and disclosure of the full request is attributed in the audit history.

An authorized accommodation actor translates an approved request into one or more **Accommodation Implementation Instructions**. Each instruction contains only the adjustment an assigned person must carry out and the tournament context needed to do so. Tabulation Staff, room staff, and Judges receive only instructions relevant to their current duties; they do not receive diagnoses, supporting evidence, the School's narrative, or details unrelated to the assignment. The Entry identity may appear only when needed to identify the affected assignment.

Public Viewers, unrelated Schools, unrelated Judges, and staff without Accommodation Operations authority receive neither the request nor an indication that one exists. The School retains access to its own complete request. This participant workflow does not create or modify an accessibility variant for the separately governed Judge Qualification Assessment in [[judge-qualification-model]].

### Accommodation Request lifecycle

Every Accommodation Request has exactly one **Accommodation Request State**:

- **Draft** — the School is preparing a request that tournament personnel cannot yet act on;
- **Submitted** — the complete request awaits tournament review;
- **Clarification Needed** — Accommodation Operations has asked the School for specified additional operational information;
- **Approved** — the request is accepted exactly as submitted;
- **Partially Approved** — a Director-confirmed decision accepts only identified parts or substitutes an identified alternative;
- **Denied** — a Director-confirmed decision declines the request for a recorded operational reason;
- **Withdrawn** — the School has withdrawn the request and any active instructions must be revoked; or
- **Closed** — no further operational action remains, while the restricted version history remains subject to the separately defined retention rule.

The Entry Manager or Responsible Coach Contact may edit a Draft, submit it, respond to a specified clarification request by producing a new Submitted version, and withdraw any non-Closed request. Submission freezes that request version against silent School edits. Accommodation Operations staff may move Submitted to Clarification Needed or, when the requested adjustment is operationally feasible exactly as submitted, to Approved.

Only a Tournament Director may issue a Partially Approved or Denied decision. The Director records a specific operational reason and, when an alternative adjustment is available, includes it in the decision offered to the School. A generic preference, missing public explanation, or unrecorded staff judgment is not a valid decision. The full decision and reason remain restricted and do not create a public Correction Notice.

Every request, clarification, response, decision, and later decision revision is immutable and versioned. A decision change supersedes rather than overwrites the prior decision. A change that reduces an earlier approval to partial approval or denial again requires Director authority. Docket atomically revokes superseded Accommodation Implementation Instructions, generates the instructions authorized by the current Approved or Partially Approved decision, and privately notifies the School and affected authorized recipients. Denied, Withdrawn, and Closed requests produce no active instructions.

### Accommodation timing and late handling

The Tournament Registration Policy publishes an **Accommodation Request-By Time** as a planning target. It defaults to the Entry submission deadline. A Director may select a later target before registration opens, and any permitted post-opening revision may only extend it. The invitation page explains that the target improves advance planning but is not a cutoff or a condition of admission, Competitive Eligibility, pairing, or participation.

Docket accepts an Accommodation Request after the target and classifies it as a **Late Accommodation Request** for operational provenance. Lateness never causes automatic denial, requires no Late Registration Exception, and does not change the request's ordinary authority or decision states. Review instead considers the current operational feasibility of the requested adjustment. If time or already-committed resources prevent exact implementation, the ordinary Director-controlled Partially Approved or Denied decision records the specific limitation and an available alternative.

An Approved or Partially Approved late request that changes an unpublished schedule, pairing, room, or assignment becomes a new constraint for regeneration. If the affected artifact is already published but its round has not started, Docket uses the existing Schedule Revision Approval, Pairing Withdrawal, validation, republication, and notification controls in [[scheduling-model]] and [[pairing-model]]. Notices disclose the changed public or assigned information and any required action but identify the reason only as a restricted operational adjustment; they never reveal, link to, or confirm the Accommodation Request.

A started or completed round is never rewritten. Docket may issue a feasible instruction for the active round when doing so does not alter its immutable pairing or competitive record; otherwise, it applies the approved instruction prospectively to future rounds. The restricted request history records any implementation limitation, while Public Viewers and unrelated actors receive no accommodation-specific notice.

### Accommodation closure and retention

When a School withdraws an Accommodation Request, Docket immediately revokes its active Accommodation Implementation Instructions. After every revocation and required private notification is complete, Docket automatically moves the request from Withdrawn to Closed. Tournament Closure atomically revokes any remaining active accommodation instructions and moves every remaining request to Closed; an open accommodation request is not a competitive Closure blocker once tournament operation has ended.

Closing a request does not immediately erase the restricted record. Docket schedules the complete request narrative, communications, supporting evidence, and stored instruction contents for irreversible deletion 30 days after Tournament Closure. An Entry Manager or Responsible Coach Contact for the same School may request earlier deletion after Tournament Closure. Docket executes that request once the Accommodation Request is Closed unless an active, separately authorized Legal Hold applies; a Tournament Owner, Director, or Accommodation Operations staff member cannot delay deletion by ordinary discretion.

After sensitive-content deletion, Docket retains only a restricted **Accommodation Audit Stub** containing the request identifier, tournament and Entry references, state-transition categories, actor references, access-event metadata, decision category, instruction-delivery events, deletion event, and any Legal Hold event. The stub contains no request text, communications, diagnosis, supporting evidence, operational limitation narrative, decision reason, alternative description, or instruction content.

Docket deletes the Accommodation Audit Stub one year after Tournament Closure unless an active Legal Hold applies. The stub is available only through authorized restricted audit access; it is excluded from Public Views, ordinary tournament views, and School exports. Deleting it has no effect on published tournament results, pairings, awards, standings, or Correction Notices, whose retention is governed independently.

A Legal Hold can suspend either accommodation deletion schedule only through the platform-level Legal and Privacy Operations process in [[access-model]]. It requires one authorized administrator to prepare an exact scoped proposal and a second distinct authorized administrator to approve it. The hold records its legal basis, external case reference, affected records, start, and a review date no more than 90 days away. An overdue hold remains effective and escalated until reviewed rather than expiring into accidental deletion. Expansion, extension, and release use the same two-person control; release immediately resumes every overdue deletion. The affected School sees only whether deletion is legally paused.

After an applicable deadline, only a Tournament Director may approve a reasoned **Late Registration Exception**, and only before first-round Pairing Publication. The exception names one Entry and permitted late command, records the missed deadline, evidence, reason, actor, and time, and includes an admission, capacity, schedule, Judge, and pairing impact preview. It does not change the published deadline for other Schools or bypass required data, eligibility, capacity, or validation rules. No Late Registration Exception is available after first-round Pairing Publication.

An Entry Manager may still withdraw their School's Entry after the School edit deadline or after first-round Pairing Publication. Docket classifies that transition as a **Late Withdrawal** rather than blocking it. A Late Withdrawal records the reason, produces a full impact preview, notifies affected tournament personnel and participants, and triggers every applicable pairing, scheduling, standings, advancement, award, and correction rule. Late status is operational provenance and does not by itself create a penalty or a Disqualification Ruling.

Before any elimination round Starts, a withdrawal or disqualification that removes an advancing Entry triggers the deterministic Advancement Field Recalculation in [[advancement-model]], including next-eligible promotion, reseeding, or field shrinkage. After any elimination round Starts, the eligibility change cannot promote a replacement or reseed the bracket; the current position becomes a versioned bye, forfeit, or disqualification advancement outcome as applicable.

Advancement publication may expose an advancing Entry's published display identity, School, seed, and bye. An excluded Entry's detailed calculation and scoped eligibility explanation are visible only to active members of its own School and authorized tournament personnel. Underlying private withdrawal, disqualification, or eligibility evidence is not public and is not disclosed to another School.

This definition is specific to the first Lincoln-Douglas slice. Future team events may allow multiple Competitors in one Entry without changing the distinction between a Competitor and a tournament-specific Entry.

## Competitor identity

In full production operation, a **Competitor** is one individual authenticated Docket Account rather than a School-owned roster record. The same Account remains the Competitor's identity across tournaments and School changes. Each Entry separately records the School represented at that tournament so current affiliation changes never rewrite historical participation.

Only the School's Roster Manager may initiate a Competitor School Invitation, and the identified Competitor must accept it. The Competitor cannot request affiliation, and email-domain matching never creates or recommends it. The invitation is bound to any exact email address that Clerk recognizes as verified, delivered by email and private Account inbox, expires after seven days, and may be revoked before acceptance. The address need not be associated with Google social sign-in. An identical pending issue is a no-op; resend preserves identity and expiry; and a wrong recipient requires revocation and reissue.

Each Competitor Account has exactly one current Competitor School Affiliation. Accepting an invitation from a destination School replaces that affiliation without creating a new Account. The Competitor-controlled profile, settings, and personal tournament history follow the Account. Historical Entries and public results retain the School represented at the time. The destination School receives only current affiliation and future-Entry information, never former-School private notes, attestations, accommodations, communications, evidence, or internal records.

A transfer takes effect immediately for future activity. Every existing Entry remains attributed to the former School through that tournament and cannot be moved merely because affiliation changed. The Competitor cannot represent both Schools in the same tournament. Docket notifies the Competitor and the authorized Managers of both Schools.

Authorized Coaches may manage the School affiliation and School-scoped Entry information but cannot edit the Competitor's Clerk identity link, Account security, Docket Display Name, personal settings, exports, or another School's data. Either the Competitor or Roster Manager may end affiliation; Docket blocks new Entries immediately and delays final removal until no active Entry represents that School.

Authentication alone does not place a Competitor on a School or tournament roster. The Competitor must accept the School's invitation before an authorized Coach may select them. Only a Coach whose active School Membership carries the applicable roster-scheduling authority may place that affiliated Competitor into the School's Tournament Roster or prepare an Entry; a Coach without it cannot schedule the Competitor. This School-side authority grants no control over the Tournament Schedule, Pairings, or publication.

The Entry Manager with that authority places affiliated Competitors on the Tournament Roster and prepares, signs off, submits, updates, and withdraws an Entry. The responsible Coach's sign-off is final for the School; no separate Competitor Entry Confirmation is required. The Competitor may file a private Entry Error Report but cannot independently submit, withdraw, accept, or reject the Entry. The responsible Coach must respond within 24 hours or before the applicable registration or pairing deadline, whichever comes first. An unresolved report escalates first to the School Manager and then to tournament registration staff; the report never mutates the Entry by itself. Tournament admission decisions and their acceptance or rejection notices belong to authorized Coaches and tournament staff. Competitors receive direct notices only for their own Pairing Publications, Disqualifications, and Corrections.

Docket ordinarily rejects a Tournament Roster or Entry combination that would place the same Competitor in overlapping event round blocks on the current Tournament Schedule. A Director may publish Cross-Entry Compatible status only before registration opens, when it locks with a request deadline equal to the earlier of the Entry edit deadline or first Pairing Publication for either affected event and a Cross-Entry Hold Limit defaulting to fifteen minutes. The responsible Coach submits one request bound to the Competitor, School, complete event set, and current Schedule. Registration staff may prepare it, but the Director need only verify it and acknowledge the schedule-delay warning. Approval cannot exceed the hold limit; adding an event requires a new request, and every Schedule revision revalidates it. The Director may revoke it before either affected round starts if it becomes infeasible, with immediate Coach and Competitor notice and a block on affected Pairings until resolved. Only each affected round's assigned Judge sees the cross-entry indicator and hold time; it is not public or opponent-facing, while the requesting parties and authorized staff retain their scoped views.

The Cross-Entry Hold begins automatically at the affected round's current published start. A pre-start published Schedule revision may move the start, but the Judge and Coach cannot extend the hold. Timely arrival clears the hold and records actual start; expiry enters the ordinary Competitor No-Show workflow immediately because the hold replaces its grace period.

Only the Competitor's Coach may submit a Judge Conflict for that Competitor or Entry. Under an enabled Judge Striking Policy, the Competitor or every Competitor in a team Entry initially chooses that Entry's strikes. Each Entry designates a Primary Responsible Coach and may predesignate a Backup Responsible Coach before the window; both require an active School Membership tied to the affected Competitors, and the backup acts only when the primary is unavailable. The acting Coach resolves teammate disagreement and may approve or voluntarily release strikes. One native portal window governs a multi-day tournament unless the pre-registration policy defines separate event sessions. It opens 36 hours before Tournament Start Time and closes at 3:00 p.m. in the official named tournament timezone on the preceding calendar day, with each user's local equivalent also shown. An approved submission becomes operative when Docket records it and returns an in-app receipt, without email delivery to the Tournament Director. Every pre-close edit needs fresh approval. Ordinary workflow permits no post-close Judge addition or supplemental strike. A late exception requires platform-health evidence affecting the Entry, a recovery window equal to the verified outage capped at 30 minutes, Director approval, and no known opponent or pairing. Unapproved selections are nonoperative, with reminders six and one hours before closing. Strike records use the same restricted seven-year Competitive Evidence retention as other Competitor tournament records. Strikes remain distinct from verified conflicts.

An unexpected post-close withdrawal or No-Show may add an Emergency Replacement Judge through reasoned Director or Judge-and-room-authorized Tabulation Staff approval. Docket revalidates verified conflicts, does not reopen strikes, prefers Judges who were previously available and eligible, and requires assignment-specific Tabulation Staff sign-off. Docket immediately notifies the Judge, affected Competitors and Coaches, Directors, and relevant Tabulation Staff in-app and by email using a generic operational reason. The Judge must acknowledge within ten minutes and before start, using the shorter interval. Each delivery cycle sends both electronic messages and fails only when neither confirms delivery; after three failed cycles the unconfirmed assignment becomes Delivery Failed and staff must find another Judge without creating a No-Show or reliability record. Staff may record restricted manual contact but cannot acknowledge for the Judge, and late acknowledgment cannot revive the canceled assignment. Tentative identity remains restricted to affected parties and staff. Each uncapped use needs a fresh reason and sign-off; the second use in one event or third tournament-wide and every later use warns the Director. An acknowledged emergency Judge who does not appear follows ordinary Judge No-Show handling. An affected Coach may report only a verified conflict, qualification error, or assignment-data error rather than exercise a new strike or veto, and a potentially invalid assignment cannot start while validation remains open.

Suspending a Competitor Account blocks login but does not withdraw the Entry or create a competitive outcome. The responsible Coach continues managing it until a normal eligibility, Disqualification Ruling, schedule, or withdrawal action changes participation.

Before a minor Competitor accepts affiliation or participates, an authorized School actor records a Minor Participation Authorization containing only the actor, time, School, Competitor, every applicable School, tournament, home-jurisdiction, and host-jurisdiction policy or legal basis, and expiration date. The School attests that all requirements are satisfied under the strictest declared standard. If authorized School or tournament actors cannot reconcile them, Docket blocks affiliation or participation without interpreting the law. The authorization lasts one school year and must be renewed after a School transfer or material policy change. Authentication is not consent, guardian documents are not collected by default, and Core Entry Data contains neither guardian contact information nor a full birth date. Revocation immediately blocks future Entries without erasing history; an active Entry enters a Director-reviewed eligibility or withdrawal workflow with notices to the Competitor, Coach, and tournament staff and is never silently withdrawn or disqualified.

During non-production software testing, an uploaded **Competitor Test Fixture** may stand in for that Account. The versioned runtime-validated JSON fixture contains only a synthetic fixture identifier, display name, School reference, and test-required eligibility fields. It contains no real email, Clerk Identity, contact detail, or production authority; cannot authenticate or participate in a production tournament; and must be rejected by production deployments.

The earlier School-owned Competitor record, destination-record transfer, and Competitor School Reassignment model is superseded. Emergency post-deadline Judge replacement and No-Show dispute review now follow governed delivery-cycle, acknowledgment, failed-delivery reassignment, decision, final withdrawal, finality, and correction rules. The remaining frontier concerns governance of the warned single-person out-round exception, delivery and acknowledgment edge cases for critical schedule edits, and exact deadline handling for post-Closure correction cases.

An **Entry School Attribution Correction** remains a versioned historical correction when evidence proves that an Entry named the wrong Competitor or represented School. The Platform Administrator validates cross-identity evidence but cannot directly change tournament results. The correction must complete the affected tournament's Director approval, recalculation, republication, Correction Notice, and Post-Closure Exception requirements. Started and completed pairings remain as operated, and neither a correction nor School relationship grants cross-School private-data access.

See [ADR 0030](../docs/adr/0030-use-individual-competitor-accounts.md), which supersedes ADRs 0002 and 0003.

## School identity

A **School** is a canonical, platform-wide record with a stable Docket identifier. Entries across tournaments reuse that identity even if its public name or common abbreviation changes.

- Historical names and abbreviations remain as aliases.
- When no existing School can be confidently identified, Docket creates a **Provisional School** requiring verification.
- A confirmed duplicate is resolved through a **School Merge** that redirects the duplicate identity to the survivor without rewriting historical Entries or deleting its audit trail.
- A tournament must not create a private copy of an existing School.

Only a Platform Administrator may complete **School Verification** or a School Merge in the first slice. Coaches and Tournament Directors may submit requests and evidence but cannot approve them. Each action requires authoritative evidence, an impact preview, a recorded reason, and an audit entry. School Merge redirects are reversible and never delete the duplicate identity or its history.

See [ADR 0004](../docs/adr/0004-canonical-platform-schools.md).

Coach authority over a School is established through the School Membership process in [[access-model]].

School Data Export is not part of Release 1. The export design below is preserved as later-release input governed by [ADR 0038](../docs/adr/0038-defer-school-data-export-to-a-later-release.md) and does not authorize implementation under the current Release 1 work graph. Release 1 retains represented-School history and its privacy, retention, and access boundaries without export generation, delivery, sharing, or public verification.

Historical School access uses the Represented-School Tournament Record defined in [[ballot-model]]. The School Manager holds School Data Export Permission by default and may grant or revoke it for selected current Coaching Staff; ordinary Coaching Staff membership alone grants nothing. A native checklist offers only Entries, operated rosters, Pairings, School notices, authorized Ballots and Feedback, released points, results, and Correction Notices, filterable by tournament, season, event, Competitor, record type, date range, and CSV or PDF. CSV is structured and PDF human-readable, while both contain the same authorized facts. A single file up to two gigabytes downloads directly; multiple or oversized output uses ZIP, with a signed integrity page appended to a single PDF or a signed PDF manifest accompanying CSV. Exact prior-download status also requires matching source versions. Filenames follow the fixed School, range or tournament, category, and generation-date convention; CSV schemas are versioned and formula-triggering user content is neutralized. Completed exports have no daily cap, one generation job runs per School while later jobs queue, and the accepted failure/cancellation throttle blocks only new generation. Every new or resumed download requires Clerk Reverification without ending the ordinary Docket session. Date-range preflight identifies included and excluded retention categories and records nearing deletion without extending retention. The Historical Access Dashboard supports tournament, season, event, Competitor, record-type, and represented-School filters without full-text search across private Feedback. Corrections after transfer notify the Competitor and original represented School, reaching the destination School only when its represented Entry changes. Neither School nor Competitor may delete retained historical evidence early.

The Manager's fresh-Google-reauthenticated grant requires consequences review and in-app recipient acceptance within seven days. It cannot be redelegated or subdivided and ends with revocation, Coaching Staff role loss, or School Membership loss. Accepted grants survive a Manager transition subject to the successor's nonextendable seven-day review. Revocation or suspension cancels the actor's pending jobs and disables live and shared downloads without recalling external copies; suspension immediately notifies the affected Coach and Manager without exposing export content. A successor may bulk-revoke grants but must individually confirm each continuation. A permissioned Coach sees only their own two-year export history; the Manager sees all School activity. The creator or Manager may share one generated export only with another current permission holder. Private presets disable without transfer on role loss, while Manager-published configuration-only presets survive until retired; schema-incompatible presets cannot generate until their private owner or School Manager, respectively, reviews and saves a new attributed version. Generated files remain immutable; source corrections mark them outdated and notify only still-authorized actual downloaders during the seven-day delivery-record window without attaching or regenerating data. Outdated downloads remain possible in that window after a prominent warning and explicit confirmation recorded in history without changing the signed artifact. A current replacement copies the selection into a review screen and requires confirmation before a separate job. Exports use stable Docket IDs, authorized labels, ISO 8601 timestamps and tournament-timezone context, exclude unrelated identifiers, visibly attribute the recipient and source without tracking, provide searchable structured PDFs, and support privacy-minimized signature verification without uploading records.

Unreviewed inherited grants suspend at the successor's seven-day deadline and require later fresh reauthentication to confirm or revoke. Restoration reuses original acceptance only while the Coach remains eligible, notifies both parties, and returns only current-authorized access to unexpired earlier exports under normal controls; canceled jobs and shares remain closed. Failed suspension email remains in-app and retries without changing suspension; another Manager transition transfers the still-suspended review without a new active period. Declined or expired offers close and must be reissued. A Coaching Staff permission request may be revised or withdrawn before decision, receives a day-three reminder, and expires after seven days without granting authority or escalating to Platform Administrators. Its details are restricted to requester, Manager, and governed reviewers; role or Membership loss closes it without transfer and leaves the former requester only their own final request view for two years. Denial requires a requester-visible reason and has no separate appeal; same-purpose refiling after denial or withdrawal waits thirty days unless the Manager records why changed circumstances justify bypass. Three bypasses within 90 days warn and flag governed metadata-only review without auto-blocking or payload access. Manager succession transfers the request without resetting its deadline and exposes retained two-year request history without payloads. Shares end on export expiry, explicit revocation, or recipient permission loss. Creator role loss preserves the Manager's remaining-window download of completed School output. School-wide preset edits version rather than overwrite and retain earlier configurations for two years; missing fields require explicit Manager repair and detailed payload-free provenance rather than automatic mapping. Generation revalidates authority and retention, pins the newest complete snapshot for each of at most three atomic consistency retries, and identifies only the successful snapshot in its manifest; expired required records fail with categories, approximate counts, and retention reason. Each new or resumed outdated ZIP session reauthenticates and confirms its listed parts, records successful parts, and resumes only missing ones. Two failed checksum redownloads stop the part, mark the artifact unavailable, notify requester and Manager, and open integrity review. Only an uninterrupted transfer authorized before expiry may finish; reconnecting after expiry is prohibited. Replacement activity never extends or mutates the old export, and a compromise replacement uses current sources, records its predecessor, discloses only changed categories and counts outside the artifact, and receives queue priority without breaking one active job per School. Historical exports retain the Entry ID and represented School, the first release contains no contact-information category, and ephemeral Account-free public verification shows only validity, signing-key identity, later-compromise status, revocation date, trusted retirement, and generic failure guidance unless current School authority permits further live status. Root-signed downloadable directory snapshots support offline verification and later revocation checks. Root compromise requires two unaffected Platform Administrators, independent official transition publication, and an urgent warning. Affected authorized users receive notice and a replacement offer after operational-key compromise, while former downloaders receive only a minimized artifact-and-key notice without silent re-signing or restored access.

Repeated-bypass audit closes as `Expected Use`, `Policy Concern`, or `Investigation Required`, notifies the Manager, and remains metadata-only unless separate investigative authority exists. Requesters hear only about changes to their own permissions. Current School authority controls every transfer and revocation terminates an active download. Signed artifacts are never repaired in place after integrity failure. Compromise replacements wait for active work, then lead the ordinary queue, and show only available category counts while labeling retention-blocked counts unavailable. Matching public web and offline verification tools preserve historical root chains, warn when the offline directory has not checked for updates in 24 hours, and use a multi-credential offline recovery quorum rather than one administrator after root compromise. Failed key-compromise notices retry and remain available in-app while the public directory stays authoritative.

Revocation during transfer records delivered parts, stops the remainder, and warns that external copies cannot be recalled. A repeated checksum failure opens a 24-hour independently decided Platform **School Export Integrity Review**; School and tournament staff may provide evidence, but only designated security authority classifies wider compromise. Overdue review escalates without automatic restoration. Invalidation reaches requester, Manager, and actual downloaders, while former downloaders receive minimized artifact status only. A bypass `Policy Concern` warns and requires Manager acknowledgment without suspension; `Investigation Required` needs a second governed actor to approve a restricted referral. Signed offline verifier releases share one validation specification and test-vector corpus with the web verifier, reject unsigned updates, and withhold current-trust claims when revocation refresh is stale. Complete multipart validity requires all checksums and exact signed-manifest membership and order.

## Decision record

- **2026-09-04:** The project owner added inherited-grant suspension, closed-offer reissuance, nonauthorizing staff requests, earliest-event share expiry, Manager continuity, preset versioning, source snapshot consistency, historical School identity, contact exclusion, and verification without access restoration.

- **2026-09-04:** The project owner secured export grants with Manager-only reauthentication and recipient acceptance, fixed their end and successor-review rules, canceled pending and shared access on revocation, separated staff-own and Manager-all history, governed sharing and presets, and required immutable correction-aware, identifier-minimized, attributed, accessible, privately verifiable output.

- **2026-09-04:** The project owner gave Managers grantable School Data Export Permission for selected current Coaching Staff and settled the checklist categories, filters, format semantics, ZIP and signed-manifest behavior, exact prior-download matching, filenames, CSV schema versioning, and formula safety.

- **2026-09-04:** The project owner replaced School packet requests with a native checklist builder producing CSV or PDF and conditional ZIP containers, preserved signed verification and prior-download disclosure, queued behind one active job, and left the School-staff authority boundary for explicit resolution.

- **2026-09-04:** The project owner superseded the daily School-export cap with unlimited completed exports and failure/cancellation abuse throttling, and required signed manifests, authenticated summaries, and fresh reauthentication for every new or resumed archive download.

- **2026-09-04:** The project owner made represented-School exports atomic multi-part sets with a master checksum manifest in every part and required date-range inclusion, exclusion, and imminent-deletion warnings without changing retention.

- **2026-09-04:** The project owner fixed nondelegable Manager-only exports as encrypted ZIPs containing PDFs, JSON, and a category manifest, split archives above two gigabytes, filtered opponent material, exposed two-year Manager-only export history, and canceled former-Manager jobs and downloads.

- **2026-09-04:** The project owner reserved bulk represented-School export to the freshly reauthenticated School Manager, imposed a daily rate and seven-day archive, limited dashboard search to metadata, routed corrections by represented Entry, and prohibited early historical-record deletion.

- **2026-09-04:** The project owner defined Represented-School Tournament Records as operated Entries, rosters, Pairings, School notices, authorized Ballots and Feedback, points, results, and corrections; excluded opponent and restricted evidence; prohibited Competitor revocation; and required one new-staff notice plus a historical dashboard.

- **2026-09-04:** The project owner made authorization revocation close active views and block new exports, granted newly authorized staff still-retained represented-School records, kept historical Feedback with the School represented by each Entry after transfer, and limited the destination School to its own represented Entries.

- **2026-09-04:** The project owner limited Coaching Staff Feedback access to active School Memberships, gave the sole School Manager the same scope, ended access immediately with authority, and settled authenticated in-app delivery and explicit acceptance for the fixed publisher review.

- **2026-09-04:** The project owner granted all current School Coaching Staff and the School Manager access to each affiliated Competitor's Published Feedback and released points and fixed the publisher-review wait at four hours before Director fallback.

- **2026-09-04:** The project owner settled default Practice Feedback Rubric auto-update, Coach receipt of Competitor-published Feedback, immutable post-deadline official Feedback, deadline calculation and anchor, global publication notice and defect handling, and detailed point visibility and release.

- **2026-09-03:** The project owner made rubric fallback publication Docket-wide, fixed the nonextendable Feedback window, locked submitted answers, granted responsible-Coach access to own-Competitor points, governed access revocation and participation correction, and restricted links to safe HTTPS behavior.

- **2026-09-03:** The project owner settled authoring-Judge, official, Coach, and actual-participant answer audiences; defined substantive editors and safe formatting; allowed Director fallback publication; required versioned rollback and immediate defaults; and adopted seven-day post-tournament Feedback editing.

- **2026-09-03:** The project owner completed conflict-aware rubric editing, immutable version history, second-administrator publication, open-ended field validation and restricted audiences, and pre-closure placement-correction governance.

- **2026-09-03:** The project owner completed collaborative platform-governed Event Ballot Rubric drafting and pinning, owner-only titled Feedback Rubric versioning without suggestions, browser and offline draft handling, warned incomplete closure, and placement-only owner correction.

- **2026-09-03:** The project owner finalized session-only Practice Panel Results, calculation, corrections, submission and incompleteness, replaced session Ballot rubrics with event-wide unified rubrics, separated configurable default Feedback rubrics, and settled audiences, exports, history, and standby handling.

- **2026-09-03:** The project owner settled locked owner-controlled practice rubrics, publication validation and audiences, an official session-scoped panel result after all Judges submit, Feedback recipient and version rules, post-removal freezing, safety handling, emergency co-host replacement, and PDF and JSON exports.

- **2026-09-02:** The project owner settled default practice Judge count, Google co-host and presentation authority, calendar privacy and reminders, RSVP independence, and nonoperative Practice Ballot and Feedback lifecycles.

- **2026-09-02:** The project owner adopted format-defined Competitor and Judge defaults plus zero Observers, then completed Google authorization-loss, owner-succession, exact-guest, leak, Observer, outage, and dual-notification rules.

- **2026-09-02:** The project owner settled same-role Practice Standby activation, blocked over-cap start without silent participant removal, and made lower future platform caps prospective for sessions already underway.
- **2026-09-02:** The project owner completed the Google Practice Meeting lifecycle and access boundary, permitted deletion during separately preserved safety review, and rejected import of all Google meeting participation or content data.

- **2026-09-02:** The project owner allowed governed pre-start practice role changes, prohibited all live role changes, adopted a one-hundred-Account platform cap, and initially left same-role post-start replacement unresolved; the 2026-09-07 decision limited it to a preaccepted Practice Standby locked to that same role.
- **2026-09-02:** The project owner settled safety evidence access and correction, Legal Holds, reporter identity, malicious reports, cancellation, and Docket-created Google Meet delivery without recording retention.

- **2026-09-02:** The project owner kept Judge identity public without exposing specific private-session participation, established platform safety review and limited protective controls, adopted minimized two-year retention and one fourteen-day reconsideration, and routed broader suspension through existing governance.
- **2026-09-02:** The project owner prohibited official-schedule interaction and practice No-Show consequences, adopted format and capacity controls plus notices, and locked accepted participant roles when a practice session starts.

- **2026-09-02:** The project owner allowed any exact-email recipient with a Docket Account, including a minor, to accept a Practice Invitation without School approval, superseding the earlier external-minor own-School approval requirement.
- **2026-09-02:** The project owner settled Practice Invitation resend and replacement, private discovery, participant roles and removal, irreversible closure, configuration-only copying, public Judge identity with restricted feedback, and separated safety reporting.

- **2026-09-02:** The project owner made the Cross-Entry Hold automatic at the current published start, movable only through a pre-start published Schedule revision, nonextendable by Judges or Coaches, and a replacement for ordinary No-Show grace.
- **2026-09-02:** The project owner bound Practice Invitations to an exact Google-authenticated email and one session, adopted seven-day-or-session-end expiry and prospective revocation, required external-minor approval from the minor's own School, and confined ownership transfer to same-School Entry Managers.

- **2026-09-02:** The project owner locked the Director-selected second-confirmation permission at first-round start, required a distinct active holder, limited gate overrides to the Director plus another configured confirmer, prohibited hard-constraint overrides, and restricted override metadata.
- **2026-09-02:** The project owner required Tab staff to prepare live schedule revisions, the Director to approve them, and the Director or Publication-authorized staff to publish them; typed critical reasons include an explained catch-all, while noncritical edits receive a stronger necessity warning.
- **2026-09-02:** The project owner assigned objective post-Closure No-Show correction decisions to the Director, limited Platform Administrators to evidence validation, and excluded new merits explanations.
- **2026-09-02:** The project owner preserved unchanged first-verifier work after confirmer permission loss, permitted warned single-person verification when no second confirmer is available, retained override status through distinct-actor pre-start confirmation, and preserved reviewed override risk for seven years.
- **2026-09-02:** The project owner required critical schedule notices to affected parties, Judge-only acknowledgment with continuity escalation, and governed new-version reversal before start instead of in-place rollback.
- **2026-09-02:** The project owner limited objective post-Closure No-Show edits to seven days and made rejected cases privately noticed, seven-year retained, and final on the submitted evidence while allowing another timely case for materially different objective proof.
- **2026-09-02:** The project owner settled Director activation, Pairing-authorized performance, restricted auditing, fresh non-override pre-start use, and per-round-and-version scope for the single-person verification exception.
- **2026-09-02:** The project owner settled three-cycle critical-notice retries, the ten-minute-and-before-start Judge acknowledgment deadline, any-current-Director reversal approval, the exact 168-hour correction window, and deadline expiry of unresolved cases.
- **2026-09-02:** The project owner required a Competitor to authenticate and accept School affiliation before roster placement and limited rostering to a Coach with School-side scheduling authority; overlapping event blocks remain prohibited by default, with the later Q343 decision adding the labeled-tournament Director-approved exception.
- **2026-09-02:** The project owner made Entry Manager the roster-scheduling role, allowed the exclusive School Manager to hold it, and replaced Competitor Entry Confirmation with the responsible Coach's final School sign-off.
- **2026-09-02:** The project owner limited overlapping participation to Coach-submitted, Director-approved Cross-Entry Requests at invitation-labeled Cross-Entry Compatible tournaments; the later Q351 decision reduced approval to Director verification plus the schedule-delay warning.
- **2026-09-02:** The project owner adopted role-scoped Event Workspace access and operational statuses, isolated Practice Mode from official records, and added a read-only cross-event Personal Tournament Agenda.
- **2026-09-02:** The project owner locked compatibility before registration, set the request deadline and exact scope, reduced Director review to verification, adopted a fifteen-minute-default hold limit, required revision revalidation, and allowed pre-start revocation.
- **2026-09-02:** The project owner restricted the cross-entry indicator to each affected round's assigned Judge rather than public or opponent views, while preserving requesting-party status and staff operations.
- **2026-09-02:** The project owner moved practice into a separate tournament-independent UI, allowed external-School email invitations, limited retention to thirty days, and adopted Personal Tournament Agenda change and conflict alerts.
- **2026-09-02:** The project owner adopted one official-timezone multi-day strike window, local-time display, a capped verified-outage recovery, Primary and predesignated Backup Coaches, and ordinary seven-year Competitor-record retention for strikes.
- **2026-09-02:** The project owner admitted reasoned Emergency Replacement Judges without reopening strikes, with conflict revalidation, preference for previously available Judges, and assignment-specific Tabulation Staff sign-off.
- **2026-09-02:** The project owner required privacy-minimized emergency-Judge notices and acknowledgment before start, fresh reasoned sign-off for uncapped use, repeated-use warnings, and error-only Coach challenges without a new strike or veto.
- **2026-09-02:** The project owner made No-Show rejection final except for objective correction, allowed only pre-decision Competitor withdrawal, prescribed private rejection and generic public correction notices, and required downstream recalculation when a successful dispute changes published competitive records.
- **2026-09-02:** The project owner set emergency acknowledgment and failed-delivery reassignment rules, ordinary No-Show handling for acknowledged emergency Judges, exact repeated-use warning thresholds, restricted tentative identity, final confirmed dispute withdrawal, and informational rejection notices.
- **2026-09-02:** The project owner defined delivery cycles, excluded failed delivery from Judge reliability, denied late acknowledgment revival, and allowed recorded restricted contact without staff acknowledgment for the Judge.
- **2026-09-02:** The project owner fixed strike closing at 3:00 p.m. tournament time on the preceding day while retaining a 36-hour-before-start opening, prohibited ordinary post-deadline Judge additions, moved submission into a native Docket portal, and restricted approval and release to the affected Competitor's assigned Coach.
- **2026-09-02:** The project owner required all applicable minor-participation requirements under the strictest declared standard and blocked unresolved jurisdiction conflicts without Docket interpreting law.
- **2026-09-02:** The project owner fixed the Judge Strike Window from 36 until 24 hours before Tournament Start Time, gave the Coach resolution authority when teammates disagree, required fresh approval for edits, and limited post-deadline changes to corrections or newly added Judges.
- **2026-09-02:** The project owner made School Transfer immediate for future activity while locking existing Entries to the former School, prohibited dual-School representation within one tournament, and required notices to the Competitor and both Schools.
- **2026-09-02:** The project owner adopted a 24-hour-or-earlier-deadline private Competitor Entry Error Report with Coach, School Manager, and tournament registration escalation and no direct mutation power.
- **2026-09-02:** The project owner made Minor Participation Authorization a minimized one-school-year School attestation renewed after transfer or policy change, and routed revocation affecting an active Entry to a noticed Director review rather than silent withdrawal or disqualification.
- **2026-09-02:** The project owner enabled an optional per-event Judge Striking Policy under which each individual or team Entry chooses strikes and the responsible Coach approves the complete submission before delivery to the Tournament Host.
- **2026-09-02:** The project owner made Competitor profile, settings, and personal tournament history follow transfer while historical represented-School attribution remains, and prohibited former-School private notes, attestations, accommodations, communications, evidence, and internal records from transferring.
- **2026-09-02:** The project owner adopted exact-email seven-day invitation delivery and lifecycle controls, allowed Competitor or Roster Manager affiliation termination after active Entries, divided Entry preparation and submission from Competitor identity-School-event confirmation, and limited direct Competitor notices.
- **2026-09-02:** The project owner reserved Judge Conflict submission to the Coach subject to a separate striking policy, prevented Account suspension from withdrawing an Entry, required School minor-participation attestation without guardian contact or full birth date in Core Entry Data, and fixed the deactivation release boundary.
- **2026-09-02:** The project owner required Roster-Manager-initiated and Competitor-accepted School affiliation, prohibited Competitor requests and domain matching, limited each Account to one current School, preserved the Account across transfer, and deferred the precise information-migration boundary.
- **2026-09-02:** The project owner protected Competitor Account identity and profile from Coach edits, reserved admission actions and notices to Coaches and staff, limited direct Competitor notices to Pairing Publications, Disqualifications, and Corrections, isolated synthetic JSON fixtures to non-production, and postponed Account deactivation while active obligations remain.
- **2026-09-02:** The project owner superseded the School-owned Competitor-record model with one authenticated Account per production Competitor, limited uploaded record-only Competitors to non-production tests, preserved represented School on each historical Entry, and left School linkage, authority, consent, and minor safeguards for explicit design.
- **2026-08-31:** The project owner accepted a tournament-specific Entry containing exactly one Competitor representing exactly one School, limited each Competitor to one active Lincoln-Douglas Entry per tournament, and required withdrawals and corrections to preserve history.
- **2026-08-31:** The project owner initially made Competitors School-owned roster records reusable within one School; the 2026-09-02 decision and ADR 0030 supersede that identity model while preserving historical Entry attribution and cross-School privacy goals.
- **2026-08-31:** The project owner made Schools canonical platform-wide records, required unmatched institutions to remain provisional until verified, and required duplicate merges to preserve aliases, identifiers, history, and audit records.
- **2026-09-01:** The project owner required explicit, revocable School Memberships for Coach authority and prohibited automatic access based only on an email-domain match.
- **2026-09-01:** The project owner restricted School Verification and School Merges to Platform Administrators, allowed other actors to submit evidence, and required previewed, reasoned, audited, reversible actions.
- **2026-09-01:** The project owner kept disqualification distinct from Entry withdrawal, preserved the Entry identity and history, and made only prospective-removal and full-tournament scopes ineligible for later pairings.
- **2026-09-01:** The project owner made pre-elimination-start withdrawals and disqualifications recalculate the Advancement Field but prohibited replacement and reseeding after any elimination round Starts.
- **2026-09-01:** The project owner made advancing Entry identity, School, seed, and bye public while restricting an excluded Entry's detailed calculation and eligibility explanation to its own School and keeping underlying evidence private.
- **2026-09-01:** The project owner adopted Draft, Submitted, Waitlisted, Accepted, Withdrawn, and Rejected registration states and kept Competitive Eligibility and disqualification as separate dimensions.
- **2026-09-01:** The project owner gave School Entry Managers draft, submission, and timely withdrawal authority; gave Registration-authorized staff and Directors admission-transition authority; required reasons and versioning; and prohibited tournament-side identity edits. ADR 0030 later moved that protected identity from a School-owned record to the Competitor Account.
- **2026-09-01:** The project owner allowed evidence-backed same-identity Entry Restoration to Submitted before first pairing, reserved post-publication pre-start restoration of a mistakenly withdrawn formerly Accepted Entry to a Director with pairing republication, and prohibited active restoration after any round starts.
- **2026-09-01:** The project owner adopted a published timezone-aware Registration Policy, Director-only pre-pairing Late Registration Exceptions, and always-available history-preserving Late Withdrawal with impact handling rather than blocking.
- **2026-09-01:** The project owner allowed pre-opening Policy replacement, limited post-opening revisions to deadline extensions or relaxed requirements, prohibited earlier timezone corrections, required previews and notices, and ended revision authority at first pairing.
- **2026-09-01:** The project owner adopted published deterministic capacity, School-cap, and priority-group admission; ordered within groups by complete submission time and seeded ties; prohibited manual reordering; and required confirmation of calculated acceptance, waitlist, promotion, and closure transitions.
- **2026-09-01:** The project owner minimized Core Entry Data, excluded unnecessary personal and sensitive information about minors, restricted eligibility and Coach-contact data, and limited the public Entry projection to an Accepted Competitor's display name, School, and event when explicitly published.
- **2026-09-01:** The project owner required all additional fields to use a purpose-bound, versioned Registration Data Schema published before opening; allowed only removal or optionalization after opening; and routed medical and accommodation details to a separate restricted workflow.
- **2026-09-01:** The project owner limited complete Accommodation Requests to the Entry's School, the Director, and explicitly authorized accessibility staff; minimized diagnosis collection; disclosed only need-to-know implementation instructions; and required an audit trail for access and disclosure.
- **2026-09-01:** The project owner adopted an eight-state Accommodation Request lifecycle, delegated exact-as-requested approvals and clarification to Accommodation Operations staff, reserved partial approvals and denials to the Director with reasons and alternatives, and required immutable decisions plus atomic instruction replacement.
- **2026-09-01:** The project owner made the published Accommodation Request-By Time a nonblocking planning target defaulted to Entry submission, required acceptance and ordinary review of late requests, and routed approved operational impacts through prospective schedule and pairing safeguards without public accommodation disclosure.
- **2026-09-01:** The project owner made withdrawal and Tournament Closure revoke accommodation instructions and close requests, required sensitive-content deletion 30 days after Tournament Closure with earlier own-School requests, prohibited ordinary Director retention overrides, and retained only a content-free restricted audit stub.
- **2026-09-01:** The project owner limited the content-free Accommodation Audit Stub to one year after Tournament Closure unless a Legal Hold applies, kept it out of public, ordinary, and School-export projections, and separated its deletion from public tournament history.
- **2026-09-01:** The project owner restricted Legal Holds to a separate platform permission, required distinct preparer and approver controls plus scoped 90-day review, kept overdue holds active and escalated, and made release resume pending deletion immediately.
- **2026-09-01:** The project owner kept genuine transfers as new School-owned records, allowed Platform-approved reassignment only before any submitted Entry, required versioned tournament corrections after history exists, preserved immutable operated artifacts, and prohibited cross-School private-data access or automatic merges.
- **2026-09-01:** The project owner adopted the cross-cutting [[retention-model]] while preserving the shorter Accommodation Request and Audit Stub periods and the field-specific Registration Data Schema retention declarations.
