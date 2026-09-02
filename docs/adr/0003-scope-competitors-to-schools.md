---
status: superseded by ADR-0030
---

# Scope competitor records to schools

The first backend slice will model a Competitor as a School-owned roster record reusable across that School's tournaments, not as a globally matched person. This deliberately accepts that one student may have separate records after changing Schools in order to prevent accidental matching, cross-School disclosure, or competing edit authority over a minor's data.

## Consequences

- A School controls its own Competitor roster through authorized Coaches.
- Docket does not automatically match, merge, or expose Competitor records across Schools.
- A School transfer creates a new Competitor record at the destination School; the original remains with its historical Entries.
- Any future historical linking or account linkage across School-scoped records requires a controlled, verified process and must not merge history destructively.
- A verified clerical School error may reassign a Competitor record only before any non-Draft Entry exists, with Platform Administrator approval, evidence, impact preview, notices, and immutable audit.
- After any submitted or historical Entry exists, the record cannot be moved or merged; the correct School creates a new Competitor record.
- A proven historical error uses a versioned Entry School Attribution Correction combining Platform identity validation with the affected tournament's ordinary or Post-Closure correction authority.
- Started and completed pairings remain as operated, while corrected projections and public results use republication and any required Correction Notice.
- Neither a transfer nor a correction grants either School access to the other's private roster, evidence, communications, or Entry data.
