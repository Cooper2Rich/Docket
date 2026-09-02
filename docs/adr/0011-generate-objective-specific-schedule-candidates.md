---
status: accepted
---

# Generate objective-specific schedule candidates

Before a tournament begins, Docket will generate three separate feasible Schedule Candidates optimized for Judge Use, Buffer Time, and Time Efficiency. The selected candidate becomes the Tournament Schedule. When corrected round data disrupts that schedule, Docket will generate separate Time-Efficiency and Judge-Use Schedule Revision Proposals rather than automatically rescheduling the tournament.

## Consequences

- Every candidate must satisfy the same mandatory eligibility, conflict, availability, room, Round Specification, Pairing Plan, round-order, Ruleset, tournament-window, and Scheduled Break constraints.
- Every candidate maps the tournament's configured Round Specifications to matching schedule blocks.
- The Judge-Use Objective prioritizes Judges whose Effective Tournament Tier fits the appropriate and most competitive rounds and records whether the tier is assessment-supported or comes from a Tournament Tier Grant.
- Round Competitiveness Priority uses only current-tournament evidence: elimination stage, current records, power pairings, and direct advancement consequences. It excludes reputation, fame, external rankings, and other-tournament results.
- Before pairings exist, Docket reserves higher-tier capacity by round category; it calculates specific priorities and assignments when current pairings and records become available.
- Tournament Round Tier Requirements are hard constraints evaluated against assessment tiers and explicit Tournament Tier Grants. An unsatisfied requirement is reported rather than silently downgraded.
- The Buffer-Time Objective first maximizes the smallest recovery interval between consecutive round blocks and then distributes remaining recovery time evenly.
- The Time-Efficiency Objective minimizes total elapsed tournament time and produces the earliest feasible finish; after disruption, it minimizes remaining duration and added delay.
- A Scheduled Break has a label, required duration, and fixed start time or allowed placement window. It appears in every candidate and does not count as optimization buffer.
- Docket presents objective-specific alternatives instead of combining them or silently replacing the selected Tournament Schedule.
- Tabulation Staff with Pairing operations authority may compare candidates and prepare a recommendation, but only a Tournament Director may approve Schedule Selection.
- Docket records and retains all candidates, objective metrics, the staff recommendation when present, approving Director, reason, and selection time.
- Pairing-authorized Tabulation Staff may compare Schedule Revision Proposals and recommend one, but only a Tournament Director may approve an exact proposal version.
- The approving Director or Publication-authorized Tabulation Staff may publish only that approved version; any change requires new approval, and Docket never applies or publishes a revision automatically.
- Approval and publication preserve the original schedule, every version, metrics, impact analysis, recommendation, reason, actors, and timestamps.
- Publication immediately sends delivery-tracked Schedule Revision Notices to all Directors, relevant staff, affected Judges, and active School Members for affected Entries.
- Only Judges with changed assignments must acknowledge. Until acknowledgment, the assignment is unconfirmed and escalated; School notices remain informational and non-blocking.
- Tournaments use a Director-configured Urgent Change Threshold, defaulting to 30 minutes, instead of a hard minimum lead time.
- An Urgent Schedule Revision requires explicit short-lead-time confirmation and a Judge Continuity Plan; urgency never permits rewriting a started round.
- Equal-scoring schedules use deterministic, stability-first tie-breaking: preserve the published schedule, minimize assignment changes, balance Judge workload and rest, prefer the earlier finish, then compare stable identifiers.
- Pre-tournament generation begins at workload and rest because no published schedule exists, and Docket records the policy version and tie-break values for reproducibility.
- Tournament Schedule Publication places the approved round structure, times, breaks, and human-readable Pairing Plan rules on the Tournament Invitation Page before the tournament begins; actual Entry assignments and internal versions, publishing attribution, and exact timestamps remain unpublished.
