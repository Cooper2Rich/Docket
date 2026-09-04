---
status: accepted
---

# Separate competitive results from ballot feedback

Docket will lock a Ballot's Competitive Result at submission while allowing the Judge to add or revise Ballot Feedback afterward without staff reopening. This lets tabulation advance immediately without forcing Judges to choose between timely decisions and useful written feedback.

## Consequences

- Competitive Result and Ballot Feedback have separate state and revision histories.
- Ballot Submission validates and locks the Competitive Result even when Ballot Feedback is incomplete or absent.
- An identical authenticated Ballot Submission retry returns the original receipt and creates no duplicate Ballot or result version.
- A post-lock submission with different competitive data is rejected as a Conflicting Ballot Attempt, retained in restricted audit history, and reported to the Judge and authorized Ballot-and-correction actors.
- Pairing, standings, and advancement may consume the Competitive Result immediately after submission.
- Changing or disputing a submitted Competitive Result requires an authorized, reasoned, audited Ballot Reopening; a conflicting submission never silently overwrites or supersedes it.
- Feedback additions and revisions do not require Ballot Reopening, but retain version history and actor attribution.
- The hard Feedback Deadline is exactly seven days after the current published end of the final scheduled competitive round and cannot be extended or shortened by any actor or configuration.
- At the Feedback Deadline, every official-tournament Feedback version becomes immutable; no actor or Post-Closure Exception may reopen it.
- An authorized pre-end Schedule revision recalculates the deadline from the revised final scheduled competitive round's published end; this is an anchor change, not deadline discretion.
- Expiration of the Feedback Deadline permits Tournament Closure without requiring every Judge to submit or publish feedback.
- A Feedback Draft is visible only to its Judge until explicit Feedback Publication.
- Feedback Publication makes one version visible to the adjudicated Competitors, every current Coaching Staff member for each Competitor's School, and that School's sole School Manager; Ballot Feedback is never public in the first slice.
- Later edits create a private draft while recipients continue seeing the last Published Feedback.
- An unpublished draft remains private and is flagged incomplete at the Feedback Deadline rather than being published automatically.
- Safety personnel may hide or restrict harmful Published Feedback after finality without editing or reopening it, while preserving the exact version as restricted evidence.
- Recipient authorization may be corrected after finality without changing Feedback content; Docket preserves delivery history and privately notifies affected people.
- A corrected released point updates the Competitor and their authorized School recipients together, preserves prior restricted values, and becomes the only value consumed by standings.
- Feedback and released-point access belongs to active Coaching Staff Memberships for the Competitor's School and the sole School Manager; removing that authority ends Docket access immediately.
- Rubric-version notices and owner acknowledgment are informational and never block Practice Role Lock, round start, or session start.
- Starting a round creates an immutable Round Rubric Pin. Every Ballot and decision for that round remains tied to the exact version even if a defect is discovered before submission.
- Emergency Rubric Publication may use a fifteen-minute qualified-publisher request window only to correct future unstarted rounds; it cannot migrate or rewrite a started round.
- The first authorized Ready-or-Scheduled-to-Started transition in a scheduled event-round cohort creates one Round Rubric Pin for every pairing and room in that cohort; scheduled time and Ballot opening do not create it.
- Missing rubric acknowledgment or failed emergency notice delivery is nonblocking. Docket records a warning, retries and escalates delivery, and prominently displays the governing version at round entry.
- A Rubric-Blocked Decision pauses Judge submission and routes the round to an evidence-backed Director Administrative Ruling without changing the pin or fabricating a Judge Ballot.
- That ruling normally requires verification by a distinct Ballot-correction-authorized Tabulation Staff member; a warned, reasoned, evidence-reviewed Director-only exception is allowed when no second actor exists.
- Its restricted evidence package contains the pinned version, affected fields, Judge report, validation failure, impossibility explanation, governing Ruleset and Pairing, proposed outcome, and downstream preview, excluding unrelated private evidence.
- The Director-only exception requires a recorded availability check showing no verifier is reasonably available before the result is operationally required; convenience and ordinary delay are insufficient.
- The Director must publish or escalate the ruling within thirty minutes of the report and before the next affected event round, whichever comes first. Expiry creates no automatic outcome and blocks only dependent standings, Pairings, advancement, and publication.
- Only an affected Competitor, their current represented-School Coach or Manager, the assigned Judge, or authorized tournament staff may file a participant correction request, and the window closes sixty minutes after notice or at the next affected event round. Authorized staff- or system-discovered objective defects retain their ordinary correction path.
- The outcome is labeled Administrative Ruling — Rubric Defect, exposes only its general reason and outcome where the round decision ordinarily appears, and creates no Judge lateness, hold, No-Show, reliability, or qualification consequence.
- Unaffected pairings continue under the cohort pin, and a corrected version may govern the whole cohort only while none of its pairings has started.
- An Unacknowledged Rubric Notice clears actively on acknowledgment but remains as minimized restricted operational telemetry for two years after acknowledgment or closure and is visible only to the responsible Director or owner and rules-governance administrators.
- Protected Feedback and point access is revalidated on every request and active session. Role loss closes the view and blocks later exports without claiming to erase an external copy already downloaded.
- Historical School-scoped Feedback follows the School represented by its Entry, while the Competitor retains personal history and a destination School receives only its own represented Entries.
- Restricted exports are visibly attributed without remote tracking, and safety-restricted Feedback is excluded from ordinary Account and School exports.
- The authoring Judge or an affected Competitor may request one safety reconsideration within fourteen days by different Platform Safety personnel; content stays restricted and no Competitive Result may change.
- Reconsideration outcome notices expose only Restored, Remains Restricted, or Restricted with Revised Scope to affected recipients; evidence and reviewer reasoning remain private.
- Represented-School Tournament Records include operated Entries and rosters, Pairings, School notices, authorized Ballots and Feedback, released points, results, and corrections while excluding opponent-private and restricted assessment, safety, and investigation material.
- A Competitor cannot revoke the represented School's historical authority, and ordinary role removal does not turn a legitimately authorized prior export into a security incident.
- Only the freshly Google-reauthenticated School Manager may generate a represented-School bulk export, limited to one completed archive per day and a seven-day authenticated download.
- Historical dashboard search is metadata-only across tournament, season, event, Competitor, record type, and represented School; private Feedback is not globally full-text indexed for School users.
- Restored safety-restricted Feedback returns to ordinary authorized views and future exports without automatically generating or sending a file.
- Neither a School nor Competitor may delete represented-School evidence before retention expires, although correction, restriction, safety review, and legally required privacy actions remain.
- Represented-School exports are nondelegable School Manager actions using fresh Google reauthentication and encrypted ZIPs of PDFs, JSON, and a manifest; archives above two gigabytes split, opponent-restricted material stays excluded, and no archive is emailed.
- Numbered exports are one atomic delivery set: a master manifest lists each part's sequence, checksum, and record count and is copied into every part; no part is downloadable until all parts succeed, and the seven-day clock begins only then.
- The Manager's Google-backed authenticated session protects generation and download without a separate archive password. The Manager may cancel a pending job or delete a completed delivery set immediately, while payload-free history and source retention remain unchanged.
- A date-range preflight identifies included and excluded retention categories and imminent scheduled deletion without extending retention.
- The current School Manager may view two years of payload-free School Export History. A Manager transition cancels the former Manager's pending jobs and live downloads, and the successor must request a new export.
- A normal Lincoln-Douglas preliminary Competitive Result contains one winning Entry and Ruleset-valid Speaker Points for both Competitors; pairing identities and sides come from the published pairing.
- An Elimination Round Competitive Result contains a winner and no Speaker Points; this applies to individual Ballots, Panel Decisions, Administrative Outcomes, corrections, and disqualifications.
- A multi-Judge panel has an odd size, independent Judge Ballots, and a strict-majority Panel Decision. The result may lock at an Irreversible Majority while remaining Ballots stay due and tracked.
- Ballot Due Time is the scheduled round end plus a tournament-configurable grace period that defaults to 15 minutes.
- Docket reminds an outstanding Judge at scheduled end, marks and notifies the Ballot as Late at its due time, and escalates it to Judge-and-room staff and Directors ten minutes later.
- Escalation places a tournament-local Judge Assignment Hold on new assignments until the missing result is submitted or a Director records clearance; a Director may remove future assignments through normal revision controls.
- A Judge Assignment Hold, late Ballot, or future-assignment removal does not alter assessment data, qualification tier, Judging Profile, or eligibility at another tournament.
- A single-Judge round or panel without an Irreversible Majority blocks result-dependent operations until a result arrives or a Director makes an evidence-backed Administrative Ruling; missing Ballots never create an automatic forfeit or Entry penalty.
- Byes, forfeits, and other Administrative Outcomes use a separate audited staff workflow and are not represented by fabricated Judge Ballots.
- An adjudicated preliminary round retains Judge-submitted Speaker Points by default after a disqualification changes its competitive decision unless the Ruleset explicitly excludes or replaces them.
- An unadjudicated Administrative Outcome has no Judge-submitted Speaker Points. A Ruleset-defined formula may create clearly labeled Administrative Points with full calculation provenance.

The hard seven-day window supersedes the original 72-hour configurable and extension-only models. Tournament Closure cannot shorten an unexpired Feedback window.
