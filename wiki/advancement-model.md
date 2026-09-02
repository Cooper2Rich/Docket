# Advancement Model

## Separate advancement policy

Standings order and tournament advancement are separate decisions. A **Standings Rules Configuration** calculates and orders preliminary records; a versioned, tournament-event-scoped **Advancement Plan** determines which eligible Entries advance and how they enter the elimination bracket.

Every Advancement Plan references the exact locked standings configuration fingerprint it expects. It defines:

- elimination break size;
- Entry and Competitor eligibility requirements;
- the policy for a tie at the qualification cut;
- conversion of final preliminary standing into elimination seeds; and
- bracket-bye behavior when the advancing field does not fill the configured bracket.

The Plan cannot redefine wins, losses, Speaker Point calculations, point drops, Administrative Outcome treatment, or preliminary tie-break ordering. Those remain owned by [[standings-model]]. Disqualification and withdrawal eligibility come from [[registration-model]], while completed competitive data comes from [[ballot-model]].

## Upload contract and validation

The backend accepts a separate declarative `.docket-advancement.json` file governed by a versioned **Advancement Plan Schema**. Only a Tournament Director may upload it. Docket records the event, uploader, source filename, content fingerprint, schema version, referenced standings configuration fingerprint, upload time, and immutable Plan version. A replacement creates a new draft rather than overwriting history.

Runtime validation checks JSON syntax, the supported schema version, event-format match, the reference to the event's accepted standings configuration fingerprint, allowed break and eligibility choices, complete tie-at-the-cut behavior, valid seed mapping, defined bye behavior, and the absence of unknown or executable operations. TypeScript types support implementation and tooling but do not replace this runtime validation.

Docket does not execute scripts, formulas, expressions, macros, plugins, or network references from the Plan. PDFs and spreadsheets are not valid machine-readable Advancement Plans. The future TypeScript UI generates the same `.docket-advancement.json` contract from Director-selected controls, so a Director does not need to hand-author JSON.

For every valid draft, Docket generates an **Advancement Plan Preview** from labeled sample standings snapshots. The scenarios exercise a field smaller than, equal to, and larger than the break; ineligible Entries near the cut; a tie at the cut; seed assignment; and bracket byes. The preview displays included and excluded Entries, the rule applied to each, seeds, byes, warnings, source standings fingerprint, Plan version, and Plan fingerprint.

## Tie at the qualification cut

The Advancement Plan must select exactly one **Tie-at-the-Cut Policy** to apply when two or more otherwise eligible Entries remain tied after the locked Standings Rules Configuration exhausts every ranking criterion and the tie crosses the final qualifying position. Docket supports three policies:

1. **Expand Field** — advance the entire tied group, increasing the field beyond the nominal break size. Validation requires a feasible bracket mapping, schedule capacity, rooms, and qualified Judges for the expanded field.
2. **Play-In** — advance the required number of tied Entries through one or more elimination-style play-in rounds. The Tournament Schedule and Pairing Plan must include the required contingency blocks and resource assumptions before locking; play-ins follow Elimination Round Ballot rules and therefore contain no Speaker Points.
3. **Seeded Draw** — fill the remaining positions using a deterministic permutation of the tied Entries. The Advancement Plan publishes the seed and draw-algorithm version before the first round, and the Advancement Field retains the ordered inputs, seed, algorithm version, output order, and selected Entries.

The Plan must disclose the selected policy in its invitation-page summary and preview it against a cut-tie sample. Docket rejects an infeasible policy before acceptance and never silently switches policies. After standings are known, no Director or staff member may subjectively select, exclude, reorder, or replace a tied Entry based on preference or the desired bracket.

In TypeScript, the three choices form a closed discriminated union so every policy has distinct required fields and exhaustive validation and calculation handling.

## Break size and partial brackets

The Director may configure a nominal elimination break size as any whole number from 2 through the event's eligible Entry count. Docket does not restrict the break to a power of two.

After applying eligibility and the Tie-at-the-Cut Policy, Docket sets the bracket capacity to the smallest power of two greater than or equal to the actual advancing field size. The number of first-round bracket byes is the bracket capacity minus the advancing field size. An Expand Field result therefore recalculates capacity and byes from the expanded field rather than forcing the nominal break size.

Docket awards those byes to the highest seeds in order. It places every remaining seed through the versioned canonical high-versus-low bracket mapping and does not swap, slide, or reorder Entries to avoid rematches, same-School debates, preferred opponents, Judge constraints, or perceived competitive imbalance. Pairing validation may surface those conditions, but bracket integrity controls the matchup.

A bracket bye advances its Entry without a Judge Ballot, Speaker Points, or fabricated Competitive Result. Docket records the source Advancement Field, seed, bracket line, bye reason, and advancement version. The TypeScript calculation uses deterministic integer arithmetic for bracket capacity, bye count, and seed-line assignment.

## Eligibility changes and the elimination start boundary

When a withdrawal, disqualification, or corrected eligibility record affects a selected Entry before any elimination round reaches Started, Docket performs an **Advancement Field Recalculation** from the locked standings snapshot, current eligibility, and locked Advancement Plan. It promotes the next-highest eligible Entries until the nominal break is filled, applying the locked Tie-at-the-Cut Policy if the new cut produces a complete tie, and reseeds the entire field from the locked standings order.

If fewer eligible Entries exist than the nominal break size, the field shrinks to every remaining eligible Entry. Docket recalculates the next-power-of-two bracket capacity and highest-seed byes from that actual field. It preserves the prior Advancement Field, creates a new version identifying the eligibility change and promoted, excluded, and reseeded Entries, and republishes the replacement through the advancement publication workflow.

Any existing elimination Pairing Publication must be withdrawn and replaced through the normal pairing workflow before the recalculated field takes effect. Docket sends impact notices to Directors, relevant staff, active School Members, and any Judge whose assignment changes.

Once any elimination round reaches Started, the bracket is immutable: Docket does not refill the field, promote a previously nonadvancing Entry, or reseed any position. A later withdrawal or disqualification vacates only that Entry's current bracket position. Its opponent advances by a versioned bye, forfeit, or Disqualification Ruling as applicable, with full provenance and notices; later bracket lines remain unchanged. Docket never revives an eliminated or previously excluded Entry after this boundary.

## Emergency Plan correction

An **Emergency Advancement Plan Correction** is permitted only when objective evidence shows that a configuration or Docket calculation defect makes the software behave differently from the human-readable advancement policy already published on the Tournament Invitation Page. The published policy is the correction target. A strategic change, reaction to known qualifiers or matchups, desired bracket, or newly preferred break, eligibility, tie, seed, or bye policy does not qualify.

Only a Tournament Director may approve the correction. Tabulation Staff may investigate and prepare evidence and impact analysis but cannot approve it. The proposed replacement must pass the normal runtime validation and receive a new Advancement Plan Preview. Docket then produces a full impact preview containing the original and replacement Plan versions and fingerprints, defect evidence, explanation of alignment with published policy, every affected Advancement Field and Entry, seeds and byes, unpublished and published pairings, started or completed rounds, schedule and Judge effects, advancement, awards, publications, Downstream Conflicts, and required notices.

Before any elimination round Starts, the Director may explicitly confirm the exact validated and previewed replacement. Docket locks that new version, performs an Advancement Field Recalculation, withdraws and republishes affected elimination pairings through their existing controls, republishes the human-readable Plan summary without public metadata, and notifies affected participants.

After any elimination round Starts, the Director may still publish the correction as the versioned statement of the policy Docket should have applied, but the started bracket continues under its original Plan and Advancement Field references. Docket does not add Entries, remove Entries based solely on the corrected Plan, reseed, rewrite played matchups, or regenerate the bracket. It creates explicit Downstream Conflicts for every discrepancy and publishes a Correction Notice explaining the defect, preserved bracket, affected downstream artifacts, and Director-approved resolution.

Every correction retains the original upload, validation, preview, acceptance, publication, Plan, Field, bracket, and notice history. No correction silently overwrites prior versions.

## Acceptance, publication, and lock

Only a Tournament Director may accept one exact validated Advancement Plan fingerprint after reviewing its preview. Acceptance records the Director, Plan and preview versions, displayed warnings, acknowledgment, and time. An edit or replacement creates a new draft and invalidates that draft's prior validation and acceptance without changing the accepted Plan.

Before the first round, Docket publishes a human-readable Advancement Plan summary on the Tournament Invitation Page. It includes the break size, eligibility rules, tie-at-the-cut policy, and seed and bye behavior. The referenced standings fingerprint, schema and Plan versions, Plan fingerprint, accepting Director, and exact publication time remain restricted to authorized staff and audit projections.

The first-round Pairing Publication must reference and atomically lock both the accepted Standings Rules Configuration and accepted Advancement Plan fingerprints. Docket blocks publication if either accepted and published artifact is missing, if the Plan references a different standings fingerprint, or if the versions are otherwise incompatible. Ordinary upload or acceptance cannot replace either artifact after this boundary.

## Advancement calculation

Docket applies one Plan version to one versioned standings snapshot and produces a versioned **Advancement Field**. The field records every selected and excluded Entry, eligibility status, cut position, applied tie-at-the-cut rule, seed, bracket bye, standings snapshot, standings configuration fingerprint, Advancement Plan version, calculation time, and any warning or unresolved conflict.

The same inputs and versions must reproduce the same field. The TypeScript implementation keeps standings calculation and advancement calculation in separate deterministic modules with explicit typed inputs and outputs. Advancement consumes standings output; it does not mutate or recalculate standings internally.

### Field approval and publication

Docket may generate a draft Advancement Field only after every required preliminary Competitive Result is locked or resolved through an authorized Administrative Ruling, the standings snapshot is current under the locked configuration, Entry eligibility is current, and no unresolved blocking conflict remains. The draft receives validation and a fingerprint covering every source version and calculated output.

Tabulation Staff with the Pairing operations permission bundle may prepare and review the draft, compare it with the Advancement Plan Preview, and assemble a recommendation. They cannot edit the calculated qualifiers or seeds directly; a wrong input must be corrected through its source workflow and the Field regenerated.

Only a Tournament Director may perform **Advancement Field Approval** for one exact validated fingerprint. Approval records the Director, Field and source versions, warnings, staff recommendation when present, reason, and time. Any later source correction or regeneration invalidates that approval.

After approval, the Tournament Director or Tabulation Staff with the Publication operations permission bundle may perform **Advancement Field Publication** for only that exact approved fingerprint. Approval and publication remain separate attributed events even when the same Director performs both. Publication makes the version operative and unblocks elimination pairing generation; until then, Docket rejects elimination pairing approval and publication.

A pre-elimination-start Advancement Field Recalculation must repeat validation, Director approval, and exact-version publication. No earlier approval silently transfers to the replacement Field.

### Out-Round Verification Gate

After Docket auto-populates the native out-round schedule block with proposed Competitors and Judges, Pairing-authorized Tabulation Staff may confirm, deny, or edit that nonoperative Pending Out-Round Schedule Review. Before Tournament Schedule Publication, the Director selects a supported tournament-scoped Out-Round Confirmation Permission rather than a named individual. It locks at first-round start and may change afterward only through a reasoned prospective staffing-access correction that leaves completed verifications unchanged. The standard gate uses one Pairing-authorized Tabulation Staff verifier and a second distinct active holder of that permission. If an intended confirmer loses permission before acting, Docket discards that unfinished confirmation but preserves the first verification while its exact sources remain unchanged so another active holder can confirm. If no eligible second confirmer is reasonably available, a Director may activate a Single-Person Out-Round Verification Exception for one exact round and schedule version. The verifier must hold Pairing authority, need not hold the unavailable confirmation permission, and may be a Director with Pairing authority. Docket records the activation reason, availability check, exact sources, warning acknowledgment, actor, and time as restricted audit data and does not expose the exception to participants absent an ordinary later correction. The verification compares the prior locked Competitive Result or Administrative Outcome, Ballot or panel majority, every timely No-Show Dispute and correction, disqualifications, Entry identity and School, seed, bracket position, sides, opponent, Judge qualification and conflicts, room, scheduled time, current eligibility, operative Advancement Field, prior bracket decisions, and bracket lineage.

Any relevant source change makes the verification stale and requires a new exception if separation remains unavailable. Before start, the gate performs a brief no-change confirmation. A non-overridden gate may use a fresh warned single-person exception when no second verifier is still available. An earlier override stays visibly marked as overridden and requires two distinct authorized actors to confirm the exact version again; the single-person exception cannot satisfy that step, and any new hard-constraint failure blocks the round. A failed first gate may proceed through an Out-Round Gate Override only when a Tournament Director invokes it and a second distinct permissioned confirmer approves after Docket displays every failed check and a competitive-impact warning. The record retains the impact preview, Director reason, affected round and Entries, governing sources, both actors, confirmation, and internal time. Override is limited to operational uncertainty or incomplete verification and cannot waive a verified conflict, eligibility, Judge qualification, disqualification, Ruleset, bracket identity, or another hard integrity constraint. It remains restricted to staff and audit projections. A restricted active-risk warning remains until the affected round is Completed and its downstream effects are reviewed; the record then remains Seven-Year Competitive Evidence. If review proves no competitive effect, staff close the warning as `Reviewed—No Competitive Effect`, preserve the audit record, and publish no Correction Notice unless public information changed. A known error at the pre-start confirmation cannot take that shortcut: Docket returns to the full first verification, corrects the authoritative source, regenerates the pending schedule review, and repeats approval and republication. Starting without the gate preserves the round as operated but immediately creates a high-priority Downstream Conflict for Director resolution and limits correction to unstarted downstream artifacts.

This gate makes a later successful No-Show Dispute changing published advancement or elimination-placement awards an exceptional defect rather than an ordinary state. If an objective system or input error nevertheless escapes verification, Docket invalidates every affected unconsumed Field, pairing, advancement, award, standings, and Final Results draft or approval and regenerates them from authoritative sources. Started and Completed rounds remain as operated and any inconsistency enters the existing Downstream Conflict and correction workflows.

### Publication visibility

Advancement Field Publication creates a public **Advancement Field Summary** on the Tournament Invitation Page containing:

- every advancing Entry's published display identity and School;
- elimination seed and bracket bye, when present;
- the applied Tie-at-the-Cut Policy and its outcome, including Seeded Draw provenance when applicable;
- every applicable public Correction Notice.

The source standings snapshot, locked configuration fingerprint, Advancement Plan and Field versions and fingerprints, publishing actor, and exact publication time remain restricted to authorized staff and audit projections.

Active School Members may additionally view their own excluded Entries' calculated metrics, final position, cut relationship, applied tie rule, eligibility state, and a scoped eligibility explanation. They cannot view another School's private exclusion details. Tournament Directors and appropriately authorized Tabulation Staff may access the underlying evidence required for operations and audit.

The public summary never exposes private disqualification evidence, nonpublic eligibility evidence, detailed Judge Ballots, Ballot Feedback, unpublished feedback drafts, Judge assessment data, or another restricted source record. Public publication of a seed or advancement explanation does not broaden access to its underlying private evidence.

The TypeScript backend must construct distinct runtime-validated public, School-scoped, and staff projections rather than returning one broad Advancement Field object and relying on the UI to hide restricted fields.

The Advancement Field supplies the seeds and bracket inputs used by the Seeded Elimination Bracket method in [[pairing-model]].

See [ADR 0017](../docs/adr/0017-separate-standings-from-advancement.md).

## Decision record

- **2026-09-01:** The project owner separated advancement from standings and required a versioned Advancement Plan that references the locked standings fingerprint and defines break size, eligibility, cut ties, seeding, and bracket byes.
- **2026-09-01:** The project owner selected a declarative `.docket-advancement.json` contract with runtime validation and sample previews, required a Director to accept and publish one exact fingerprint before the first round, required the future TypeScript UI to generate it, and locked it with the standings configuration at first-round Pairing Publication.
- **2026-09-01:** The project owner allowed a locked Tie-at-the-Cut Policy of Expand Field, pre-scheduled Play-In, or reproducible Seeded Draw, required feasibility validation and public disclosure, and prohibited subjective post-standings selection among tied Entries.
- **2026-09-01:** The project owner allowed any integer break size from 2 through the eligible field, mapped the actual advancing field to the next power-of-two bracket, awarded byes to the highest seeds, preserved canonical high-versus-low positions, and prohibited matchup-driven bracket rearrangement.
- **2026-09-01:** The project owner required pre-elimination-start eligibility changes to refill from the next-highest eligible Entries, reseed and republish the full Advancement Field, or shrink and recalculate byes when necessary; after any elimination round starts, the bracket stays fixed and vacancies resolve without replacements or reseeding.
- **2026-09-01:** The project owner limited Emergency Advancement Plan Corrections to verified divergence from published policy, reserved approval to a Director after validation and full previews, allowed recalculation and republication only before elimination starts, and required post-start bracket preservation with correction notices and Downstream Conflicts.
- **2026-09-01:** The project owner allowed Pairing-authorized staff to prepare a validated Advancement Field, reserved exact-version approval to a Tournament Director, allowed the Director or Publication-authorized staff to publish it, and blocked elimination pairing until that exact approved version is published.
- **2026-09-01:** The project owner made advancing Entries, Schools, seeds, byes, tie outcome, governing fingerprints, and publication metadata public; gave each School a private explanation for its own excluded Entries; and prohibited public disclosure of sensitive evidence, detailed Ballots, feedback, and Judge assessment data.
- **2026-09-01:** The project owner later removed raw fingerprints, governing versions, publishing attribution, and exact publication timestamps from every public Advancement Plan and Field projection while retaining them for authorized staff and audit.
- **2026-09-01:** The project owner kept human-readable advancement Correction Notices public while restricting their linked metadata, evidence, and internal notes.
- **2026-09-02:** The project owner required tournament-staff Out-Round Verification before every elimination Pairing Publication and next-round start so current results, dispute states, eligibility, Advancement Field, and bracket lineage prevent late advancement or award changes; exceptional escaped defects retain the governed correction fallback.
- **2026-09-02:** The project owner made Docket-generated out-round assignments a nonoperative Tab-review proposal, required distinct two-person verification with Director-selected second permission, permitted warning-backed override only at the failed pre-publication gate, required a complete restart after pre-start errors, and preserved mistakenly started rounds through high-priority Downstream Conflict handling.
- **2026-09-02:** The project owner made the second verifier permission-based, pre-publication selected, first-round locked, and prospectively correctable for staffing only; distinct actors remain standard, but a later decision permits a warned single-person exception when no eligible second confirmer is available.
- **2026-09-02:** The project owner preserved unchanged first-verifier work after confirmer permission loss, retained override status through a distinct-actor pre-start confirmation, kept the risk warning through downstream review, and retained even harmless override records for seven years without unnecessary public notice.
- **2026-09-02:** The project owner made a Director activate each exact single-person exception, required a Pairing-authorized verifier without the unavailable confirmation permission, restricted the exception record, allowed a fresh non-override pre-start exception, and made every source or round change require a new exception.
