---
status: accepted
---

# Prohibit administrator impersonation

Platform Administrators will not impersonate another user in the first backend slice. Docket will provide narrowly scoped Support Actions and read-only diagnostics instead, preserving trustworthy actor attribution at the cost of less convenient support access.

## Consequences

- Every Platform Administrator action executes under and is attributed to that administrator's own identity.
- Each state-changing Support Action requires an allowed operation, a reason, and an audit record.
- Read-only diagnostics must respect data-minimization rules and produce access audit records for sensitive data.
- Docket must never issue a session, token, or request context that presents a Platform Administrator as another actor.
- Ownership Recovery and Emergency Authority Grants are explicit Support Actions, not impersonation; each remains attributed to the approving Platform Administrators and the recipient acts only under their own identity.
- School Manager Recovery support remains attributed to the approving Platform Administrators; interim membership actions are explicit Support Actions and do not confer a temporary Manager identity.
- Ordinary support is a closed allowlist of redacted diagnostics, unchanged message resend, idempotent failed-job or verified-delivery replay, derived cache or search-index rebuild, proven-expired lock clearing, and immutable-source projection regeneration.
- Docket provides no generic administrator console, arbitrary script runner, free-form record patch, or unrestricted selector.
- Each state-changing ordinary Support Action requires a ticket reference, reason, exact target and scope, impact preview, actor, execution outcome, and Affected Owner notification.
- Replay repeats every original validation and authorization guard and cannot make rejected or conflicting source data valid.
- Ordinary support cannot edit authoritative domain data, results, configurations, permissions, roles, ownership, qualifications, retention, or Legal Holds; approve or publish; reopen workflows; or alter immutable history.
- Sensitive Ballot, accommodation, assessment, identity, disqualification, correction, secret, and evidentiary data remains available only through its separately authorized purpose-limited workflow.
- Closed-tournament projection recovery may reconstruct only the already-current authorized version and cannot reopen the tournament.
