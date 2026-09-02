---
status: accepted
---

# Minimize Core Entry Data

Docket collects only the information needed to identify, validate, contact, and operate a Lincoln-Douglas Entry. Because the Competitor is normally a minor, the ordinary registration record must not become a general repository for personal, guardian, medical, or accommodation information.

## Consequences

- Core Entry Data contains an authenticated Competitor Account reference, public display name, canonical School identity represented for that Entry, event identity, grade or eligibility category, School eligibility attestation, and responsible Coach contact.
- The responsible Coach must be an authenticated Coach with an active Membership for the Entry's School.
- The eligibility attestation retains its version, actor, and time but is not itself a tournament eligibility ruling or Disqualification Ruling.
- Date of birth, home address, a minor's personal email or phone, guardian information, medical information, and accommodation details cannot be required as ordinary Core Entry Data.
- Grade or eligibility category, the attestation, and Coach contact are restricted to authorized members of the Entry's School and Registration-authorized tournament personnel with an operational need.
- An explicitly published Accepted Entry exposes only the Competitor's public display name, School, and event.
- Draft, Submitted, Waitlisted, Rejected, and Withdrawn state alone never makes an Entry public.
- Additional registration fields use the governed Registration Data Schema in ADR 0024; medical and accommodation details use a separate restricted workflow rather than silently expanding the core contract.
- TypeScript uses runtime-validated core, restricted, and public schemas so static types do not become the only privacy control.
