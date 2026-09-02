---
status: accepted
---

# Classify Tournament Record Retention

Docket uses explicit retention classes anchored to Tournament Closure so permanent tournament history, outcome-reproduction evidence, and routine operational telemetry do not share one indefinite storage policy.

## Consequences

- Published invitation content, schedules, pairings, standings, advancement, brackets, decisions, results, placements, awards, recipients, represented Schools, and Correction Notices are retained permanently.
- Permanent public retention does not expose internal versions, fingerprints, actors, exact timestamps, private evidence, Judge-linked data, or audit details.
- Complete Ballots and feedback, Judge-linked scores and panel provenance, private eligibility and disqualification evidence, locked configurations, calculations, approvals, correction records, and outcome-relevant audit events are retained as restricted Competitive Evidence for seven years after Tournament Closure.
- Delivery attempts, acknowledgments, and routine operational-access events not needed to reproduce an outcome are retained for two years after Tournament Closure.
- Competitive-evidence classification takes precedence over routine telemetry when both could apply.
- Expired restricted records and telemetry are deleted automatically unless an active Legal Hold applies.
- Restricted-record expiry never deletes or changes the permanent public tournament projection.
- Accommodation Request content and stubs follow their shorter accepted rules.
- Judge Assessment data remains under a separate future retention decision.
- Retention duration never grants or expands access authority.
- The TypeScript backend uses explicit classes, Closure anchors, idempotent deletion, exact Legal Hold checks, and runtime-validated audience-separated storage and serializers.
