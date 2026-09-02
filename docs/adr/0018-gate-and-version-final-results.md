---
status: accepted
---

# Gate and version final results

Docket will publish final tournament results only from a validated, versioned draft whose placement- and award-affecting competitive inputs are complete and whose exact fingerprint has been approved by a Tournament Director.

## Consequences

- All required round decisions and governing standings, advancement, bracket, eligibility, and award versions must be current and internally consistent.
- Placement- or award-affecting corrections, disqualifications, emergency rule corrections, and Downstream Conflicts block readiness until resolved.
- Ballot Feedback does not block final publication.
- An outstanding panel Ballot after an Irreversible Majority does not block the settled Panel Decision, although any missing scoring input independently required for an award or placement remains a blocker and cannot be fabricated.
- Docket automatically calculates and validates a draft but never publishes it automatically.
- Only a Tournament Director may approve one exact draft; the Director or Publication-authorized staff may publish only that approved fingerprint.
- Calculated placements and awards cannot be directly edited; source corrections regenerate a new draft.
- Later corrections create new result and Correction Notice versions without deleting prior publications.
- TypeScript models readiness, assembly, approval, and publication as separate validated state transitions.
- The exact Award Results Draft is a component of the Final Results Draft and is covered by Final Results Approval and Publication rather than a separate award gate.
- Public contents include the champion, finalist, other configured placements, complete elimination bracket and decisions, final standings, every configured award and recipient, and represented Schools.
- Detailed Ballots, feedback, Judge-linked scores, private eligibility and disqualification evidence, and Judge assessment data remain restricted.
- TypeScript constructs a dedicated runtime-validated public results projection instead of relying on UI field hiding.
- Governing configuration fingerprints and publishing actor and time remain in internal staff and audit projections but are excluded from the public Final Results UI.
- The same raw-metadata restriction applies across every public Docket UI.
- Human-readable Correction Notices remain public and state the previous and corrected public results, competitive effect, and participant action without exposing linked metadata, evidence, notes, or audit details.
- A Director-approved Emergency Award Plan Correction regenerates Award Results and the Final Results Draft, invalidates prior approval, preserves earlier publications, and requires a Correction Notice when public award information changes.
- Final Results Publication marks Competitive Completion but does not close the tournament; Owner-only Tournament Closure is a separate later action and does not disable authorized corrections.
