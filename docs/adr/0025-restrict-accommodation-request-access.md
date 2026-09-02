---
status: accepted
---

# Restrict Accommodation Request Access

Docket separates a complete Accommodation Request from the instruction needed to implement an approved adjustment. This lets the tournament act on participant needs without distributing diagnoses, evidence, or private narrative to every person involved in a round or room.

## Consequences

- An Entry Manager or Responsible Coach Contact may create and view a complete request for an Entry belonging to their School.
- The workflow asks for the requested operational adjustment and relevant functional constraints rather than a diagnosis by default.
- Only the Tournament Director and Tabulation Staff explicitly delegated the Accommodation Operations permission may view and process complete requests.
- General registration, pairing, room, Judge-assignment, publication, and support permissions do not imply complete-request access.
- Authorized accommodation actors produce attributed Accommodation Implementation Instructions for specific operational duties.
- Tabulation Staff, room staff, and Judges receive only the adjustment and context needed for their assignment, never diagnoses, supporting evidence, the School's narrative, or unrelated details.
- Public Viewers, unrelated Schools, unrelated Judges, and unauthorized staff cannot see the request or an indication that it exists.
- Full-request views, changes, exports, and disclosures are audited; instruction delivery is attributed.
- The backend uses distinct runtime-validated restricted-request and minimized-instruction projections.
- This participant workflow does not alter the separate rule that Docket defines no accessibility variant for the Judge Qualification Assessment.
- Accommodation Request State is Draft, Submitted, Clarification Needed, Approved, Partially Approved, Denied, Withdrawn, or Closed.
- Own-School Entry Managers and Responsible Coach Contacts may draft, submit, answer clarification, and withdraw requests; submitted versions cannot be edited silently.
- Accommodation Operations staff may request specified clarification or approve a request exactly as submitted when feasible.
- Only a Director may partially approve or deny a request, or reduce a prior approval, and must record a specific operational reason and an available alternative when one exists.
- Requests, communications, decisions, and revisions are immutable versions rather than overwritten records.
- A current decision atomically replaces superseded implementation instructions and privately notifies affected authorized recipients.
- The Registration Policy publishes a nonblocking Accommodation Request-By Time defaulted to the Entry submission deadline; a post-opening revision may only extend it.
- Docket accepts late requests through the ordinary lifecycle and records lateness as operational provenance rather than an automatic denial or Late Registration Exception.
- Approved impacts use minimized operational constraints and the existing schedule and pairing revision, withdrawal, approval, republication, and notice controls.
- Started and completed rounds are never rewritten; feasible active-round instructions may apply without changing the pairing or competitive record, and other changes operate prospectively.
- Public and ordinary operational notices identify only changed information and a generic restricted operational reason, never the request or its existence.
- Withdrawal completion closes the request after active instructions are revoked; Tournament Closure closes every remaining request and revokes every remaining instruction.
- Docket irreversibly deletes request narrative, communications, supporting evidence, decision-reason and alternative text, and instruction contents 30 days after Tournament Closure.
- An own-School Entry Manager or Responsible Coach Contact may request earlier deletion after Tournament Closure.
- Only a separately authorized, documented Legal Hold may delay deletion; ordinary tournament actors cannot extend retention or veto deletion.
- Docket retains only a restricted content-free Accommodation Audit Stub until one year after Tournament Closure unless a Legal Hold remains active.
- The stub is excluded from public, ordinary-tournament, and School-export projections.
- Stub deletion cannot remove or change independently retained public results, pairings, standings, awards, or Correction Notices.
- Legal Hold authority and lifecycle are governed by ADR 0026.
