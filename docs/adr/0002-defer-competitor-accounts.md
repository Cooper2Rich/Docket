---
status: superseded by ADR-0030
---

# Defer competitor accounts

The first backend slice will represent Competitors as tournament-domain records but will not give them authenticated accounts; Coaches manage their participation, and unauthenticated viewers see only explicitly published information. This preserves the complete tournament lifecycle while deferring student identity verification, consent, recovery, and additional privacy complexity until competitor self-service is intentionally designed.

## Consequences

- Competitor records must not depend on a user-account identifier.
- Coach authorization must support managing Competitor records and entries for an authorized school.
- A future account-linking flow must use a verified process to attach an identity to one or more School-scoped Competitor records without rewriting historical participation or exposing one School's private data to another.
- No unpublished student information is exposed through public access.
