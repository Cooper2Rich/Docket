---
status: accepted
---

# Separate Entry registration state from Competitive Eligibility

Docket models an Entry's admission lifecycle separately from whether that Entry is currently eligible to compete. This prevents a withdrawal, rejection, and rules-based disqualification from being collapsed into one ambiguous inactive state.

## Consequences

- Entry Registration State is exactly one of Draft, Submitted, Waitlisted, Accepted, Withdrawn, or Rejected.
- Draft through Accepted count as active for the one-active-Lincoln-Douglas-Entry-per-Competitor invariant; Withdrawn and Rejected preserve terminal history.
- Competitive Eligibility is a separate dimension governed by Ruleset decisions, Disqualification Rulings, and other authorized eligibility sources.
- A disqualification never silently changes registration state, and a withdrawal or rejection is never mislabeled as a disqualification.
- Entries and every state transition remain versioned and attributed rather than deleted or overwritten.
- School Entry Managers create and edit Drafts, submit complete Entries, and may withdraw their School's active registration at any time; post-edit-deadline withdrawal uses Late Withdrawal handling.
- Registration-authorized staff and Directors may return Submitted Entries for correction and decide Submitted or Waitlisted Entries as Waitlisted, Accepted, or Rejected, with an attributed reason.
- Tournament admission authority does not include mutation of an authenticated Competitor's Account or identity data.
- Before first-round Pairing Publication, Registration-authorized staff or a Director may restore the same Withdrawn or Rejected Entry to Submitted after a School request or evidence of error, a reason, and an impact preview.
- Restoration never returns an Entry directly to Accepted or its former waitlist position; ordinary admission runs again.
- After first-round Pairing Publication but before any round starts, only a Director may restore a mistakenly withdrawn formerly Accepted Entry, and every affected published pairing must be withdrawn and republished.
- No Entry may return to active registration after any round starts.
- Registration timing is governed by the published Tournament Registration Policy in ADR 0022; waitlist ordering and acceptance rules require separate decisions.
- The minimized Core Entry Data and its public and restricted projections are governed by ADR 0023.
