---
status: accepted
---

# Use versioned rulesets with audited tournament overrides

Docket will model the applicable NSDA High School Unified Manual as an immutable, versioned default ruleset and allow a tournament to adopt explicit overrides that are validated and retained in its audit history. This avoids both the brittleness of one hard-coded ruleset and the ambiguity of unconstrained per-tournament configuration while preserving the policy variations common to high-school debate tournaments.

## Consequences

- Every tournament must identify the exact ruleset version it adopted.
- Publishing a new ruleset version must not silently alter an existing tournament.
- Overrides must be stored separately from the base ruleset with their author, time, previous value, and reason.
- The system must validate requested overrides against a strict allowlist and reject internally inconsistent combinations.
- Initial allowlisted categories include preliminary-round count, elimination break size, a versioned Pairing Plan containing supported per-round methods and options, judge-panel size, speaker-point scale, and Feedback Deadline.
- The defining Lincoln-Douglas structure and Docket's ballot-integrity, authorization, security, and audit rules are never tournament-overridable.
- The adopted Ruleset and Tournament Overrides generally lock when the first round's pairings are published; pairing methods and method-defining options lock earlier at Schedule Selection.
- Before any round starts, only a Tournament Director may change that pairing policy through a Pre-Tournament Emergency Pairing Correction with validation, impact preview, explicit confirmation, versioning, and republication. No pairing-policy change is allowed after a round starts.
- Another post-lock change requires an Emergency Amendment with an impact preview, explicit confirmation, recorded reason, and permanent audit entry; it must not silently rewrite a completed round.
- A new tournament defaults to the latest verified Ruleset available when it is created.
- An existing tournament remains pinned to its adopted Ruleset unless an authorized administrator explicitly performs a pre-lock Ruleset Migration after reviewing a version diff and validation report.
- A locked tournament cannot migrate Rulesets.
