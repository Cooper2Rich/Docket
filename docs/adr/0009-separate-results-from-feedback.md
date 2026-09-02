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
- The Feedback Deadline is configured before first-round Pairing Publication and defaults to 72 hours after the tournament's final round concludes.
- At the Feedback Deadline, the latest feedback becomes read-only to the Judge; a later change requires an authorized, reasoned, audited Feedback Reopening.
- After first-round Pairing Publication, a Tournament Director may extend the Feedback Deadline with a reason and notices, but no actor may shorten it.
- An authorized later final-round schedule moves the deadline later by the locked duration but never shortens the current deadline.
- Expiration of the Feedback Deadline permits Tournament Closure without requiring every Judge to submit or publish feedback.
- A Feedback Draft is visible only to its Judge until explicit Feedback Publication.
- Feedback Publication makes one version visible to active School Members for both Entries; Ballot Feedback is never public in the first slice.
- Later edits create a private draft while recipients continue seeing the last Published Feedback.
- An unpublished draft remains private and is flagged incomplete at the Feedback Deadline rather than being published automatically.
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

The extension-only rule supersedes the earlier requirement to use a general Emergency Amendment for every post-lock Feedback Deadline change.
