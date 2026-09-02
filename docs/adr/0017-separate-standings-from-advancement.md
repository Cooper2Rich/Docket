---
status: accepted
---

# Separate standings from advancement

Docket will model advancement as a versioned Advancement Plan rather than embedding qualification and elimination-bracket policy inside the Standings Rules Configuration.

## Consequences

- Standings determines the ordered preliminary records; advancement determines the selected field and elimination seeds.
- Each Advancement Plan identifies the locked standings configuration fingerprint it consumes.
- The Plan defines break size, eligibility, tie-at-the-cut handling, seed assignment, and bracket-bye behavior without redefining standings metrics or ordering.
- Applying one Plan version to one standings snapshot produces a reproducible, versioned Advancement Field with selected and excluded Entries, seeds, byes, source versions, and explanations.
- Standings and advancement use separate deterministic TypeScript modules and explicit typed interfaces.
- The Plan uses a declarative `.docket-advancement.json` contract with runtime schema and semantic validation; TypeScript types do not replace boundary validation.
- Docket rejects executable or document-style inputs and generates a representative Advancement Plan Preview for each valid draft.
- Only a Tournament Director may upload and accept the exact previewed fingerprint; Docket publishes its human-readable policy without internal metadata before the first round.
- First-round Pairing Publication atomically locks compatible standings and Advancement Plan fingerprints and is blocked when either artifact is missing, unpublished, or incompatible.
- The future TypeScript UI generates the same JSON contract.
- A complete tie crossing the qualification cut uses one pre-locked policy: advance the whole tied field, hold configured elimination play-ins, or use a deterministic draw with a pre-published seed and algorithm version.
- Expand Field requires feasible bracket and resource capacity; Play-In requires pre-scheduled contingency blocks; Seeded Draw retains its ordered inputs and reproducible output.
- Docket never allows subjective post-standings selection among tied Entries or silent fallback to another policy.
- TypeScript represents tie-at-the-cut choices as a closed discriminated union.
- A Director may configure any whole-number break size from 2 through the eligible Entry count.
- Docket maps the actual advancing field to the next power-of-two bracket, assigns byes to the highest seeds, and uses a versioned canonical high-versus-low seed map.
- Rematches, same-School matchups, and other preferences cannot rearrange the elimination bracket.
- A bracket bye is a versioned advancement artifact with no Judge Ballot or Speaker Points.
- Before any elimination round starts, an eligibility change promotes next-highest eligible Entries, reseeds and republishes the complete Advancement Field, or shrinks the field and recalculates byes when insufficient eligible Entries remain.
- Existing published elimination pairings derived from the prior field require withdrawal and republication.
- After any elimination round starts, Docket cannot add replacements or reseed; the vacated position resolves through an attributed bye, forfeit, or disqualification outcome and the bracket remains intact.
- An Emergency Advancement Plan Correction is eligible only for verified divergence from the human-readable policy already published to participants and requires Director confirmation of a validated replacement plus Plan and full impact previews.
- Before elimination starts, the corrected Plan may recalculate and republish the Field and affected pairings.
- After elimination starts, the correction cannot replace Entries, reseed, or rewrite the bracket; original Plan and Field references remain operative while Docket publishes conflicts and a versioned Correction Notice.
- Original uploads, previews, acceptances, publications, Plans, Fields, pairings, and notices remain immutable history.
- Pairing-authorized staff may prepare and review a deterministic Advancement Field but cannot directly edit its qualifiers or seeds.
- Only a Tournament Director may approve one exact validated Field after required preliminary results, eligibility decisions, standings inputs, and blocking conflicts are resolved.
- The Director or Publication-authorized staff may publish only that exact approved fingerprint; approval and publication remain separate events.
- Source correction or recalculation invalidates Field approval, and elimination pairing is blocked until the replacement Field repeats validation, Director approval, and publication.
- Publication exposes advancing Entry and School identities, seeds, byes, cut-tie outcome, and any public Correction Notice on the Tournament Invitation Page while withholding raw versions, fingerprints, publishing attribution, and exact timestamps.
- Active School Members receive a separate private projection explaining only their own excluded Entries' calculations and eligibility state.
- Private disqualification and eligibility evidence, detailed Ballots, Ballot Feedback, unpublished drafts, and Judge assessment data are not public or available to unrelated Schools.
- The TypeScript backend constructs separate runtime-validated public, School, and staff projections rather than relying on UI field hiding.
- Human-readable Correction Notices remain public and explain changed public advancement values and effects without exposing their linked metadata, evidence, notes, or audit details.
