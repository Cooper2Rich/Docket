---
status: accepted
---

# Use Tournament Director-uploaded standings rules

Docket will calculate preliminary standings from a tournament-scoped Standings Rules Configuration uploaded by a Tournament Director rather than imposing one fixed Docket standings template.

## Consequences

- Each tournament event can supply the standings choices required by its governing rules.
- The uploaded configuration is versioned and attributed to its Director, event, source file, content fingerprint, and upload time.
- Standings outputs identify the exact configuration version used to calculate them.
- Replacing a draft creates a new version instead of overwriting the earlier upload.
- The backend accepts a versioned `.docket-standings.json` file whose fields and operations come only from the Docket Standings Rules Schema.
- The configuration declares record ordering, Speaker Point calculations and drops, Administrative Outcome treatment, a complete tie-break sequence, and deterministic final-tie behavior.
- Docket rejects scripts, formulas, expressions, macros, plugins, network references, PDFs, spreadsheets, unknown operations, and unsupported schema versions.
- A valid draft receives a transparent Standings Calculation Preview covering representative records, point drops, Administrative Outcomes, and complete ties before acceptance.
- The future UI generates the same JSON contract so Directors do not need to hand-author it.
- Only a Tournament Director may accept one exact validated fingerprint after reviewing its calculation preview.
- Docket publishes a human-readable rules summary without raw fingerprints, internal versions, publishing attribution, or exact timestamps on the Tournament Invitation Page before the first-round Pairing Publication.
- The first-round Pairing Publication references and locks the exact configuration; later standings, power pairing, and seeding identify that fingerprint.
- A post-lock change cannot use ordinary upload or acceptance and requires a separate Emergency Standings Rules Correction workflow.
- An emergency correction is eligible only for verified divergence between Docket behavior and the human-readable standings policy already published to participants; strategic or outcome-driven policy changes are prohibited.
- Only a Tournament Director may approve the exact validated replacement after reviewing its calculation preview, full impact preview, evidence, reason, and notices.
- Docket recalculates standings and regenerates mutable downstream artifacts, preserves started and completed pairings as played, surfaces Downstream Conflicts, and publishes versioned Correction Notices without deleting history.
- A configuration may include optional labeled Standings Acceptance Cases with synthetic inputs and expected ordering and metrics; every supplied case must pass before acceptance.
- Docket preserves and reruns supplied cases after schema migration or Emergency Standings Rules Correction, and cases cannot contain executable code, external references, or production participant data.
- The TypeScript implementation uses compile-time configuration types for ergonomics and runtime schema validation for every uploaded JSON payload.
- The configuration contains one closed Standings Publication Policy: after every preliminary round, after specified preliminary-round checkpoints, or after all preliminaries.
- Docket publishes that policy and its checkpoints on the Tournament Invitation Page and locks it at first-round Pairing Publication, preventing ordinary outcome-aware disclosure changes.
- Each checkpoint waits for every standings-required Competitive Result or Administrative Ruling and blocking conflict, then produces a new immutable version instead of overwriting an earlier release.
- Authorized power pairing may consume the current versioned standings snapshot before its participant-publication checkpoint; disclosure timing never requires stale operational data.
- Docket automatically calculates and validates an eligible checkpoint snapshot but never publishes it automatically.
- A Tournament Director or Pairing-authorized staff member may approve one exact snapshot fingerprint; the Director or Publication-authorized staff may publish only that approved version.
- One actor may approve and publish when holding both authorities, but validation, approval, and publication remain separate audit events.
- Direct editing of a calculated rank or metric is prohibited; source corrections regenerate a new version and invalidate unconsumed approval.
- Public standings include Entry display identity, School, rank, win-loss record, every aggregate metric that can affect ordering, checkpoint, and any public correction notice, but exclude raw versions, fingerprints, publishing attribution, and exact timestamps.
- A public rank cannot depend on a hidden aggregate metric.
- Active School Members receive a separate private per-round calculation breakdown for only their own Entries.
- Judge-linked scores, detailed Ballots, feedback, eligibility and correction evidence, and Judge assessment data remain restricted by their source permissions.
- TypeScript response schemas separately validate public, School-scoped, operational-provenance, and sensitive-evidence projections instead of relying on UI field hiding.
- Human-readable Correction Notices remain public and explain changed public standings values and effects without exposing their linked metadata, evidence, notes, or audit details.
