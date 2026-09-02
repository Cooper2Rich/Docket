---
status: accepted
---

# Use a separate Award Plan

Docket will govern tournament awards through a separate versioned `.docket-awards.json` Award Plan rather than embedding award policy in standings, advancement, or Final Results.

## Consequences

- Each category declares its identifier, name, recipient type, eligibility, authoritative source, recipient count or bands, and tie handling.
- Award sources use a versioned allowlist and cannot redefine authoritative standings, advancement, Ballot, placement, or School-total calculations.
- Docket validates the Plan at runtime, rejects executable and document-style inputs, and produces an explainable synthetic Award Plan Preview.
- The future TypeScript UI generates the same declarative JSON contract.
- Only a Tournament Director may upload and accept one exact validated Plan fingerprint.
- First-round Pairing Publication atomically locks compatible standings, advancement, and Award Plan fingerprints and is blocked when a required artifact is missing or incompatible.
- Award calculation is a deterministic TypeScript module that consumes exact source versions and produces an immutable Award Results Draft.
- Docket automatically calculates or regenerates Award Results when the required authoritative sources are complete or change.
- Award Results are approved and published only as part of the exact Final Results Draft that references them; there is no separate award approval or publication action.
- The first Lincoln-Douglas release supports configurable elimination placement awards and preliminary Speaker Awards; either family may be disabled by the Award Plan.
- Preliminary Speaker Awards use only the locked Ruleset-valid preliminary Speaker Point aggregate and never elimination-round Speaker Points.
- School sweepstakes, team sweepstakes, and subjective or narrative awards are deferred until multi-event support.
- Every configured award and recipient appears in the public Final Results Summary like the other published tournament results; the Plan has no nonpublic-award option.
- Internal calculation metadata and restricted source records remain absent from public projections.
- After locking, only a Tournament Director may approve an Emergency Award Plan Correction, and only to make the Plan match award rules published before the tournament.
- Docket rejects outcome-driven policy changes and requires a validated replacement, Plan preview, full award impact preview, immutable version history, Award Results regeneration, invalidation of prior Final Results Approval, and any applicable public Correction Notice.
- An Emergency Award Plan Correction cannot rewrite standings, advancement, pairings, Ballots, or source results.

The all-awards-public rule supersedes the ADR's earlier per-category public-visibility option.
