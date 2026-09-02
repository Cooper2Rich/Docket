# Award Model

## Separate award policy

Tournament awards are governed by a versioned, tournament-event-scoped **Award Plan** rather than embedded in Final Results or hard-coded into standings. The backend accepts a declarative `.docket-awards.json` file whose categories reference authoritative Docket calculation sources.

Each award category defines:

- a stable category identifier and human-readable name;
- recipient type and eligibility rules;
- the authoritative calculation source and ordering direction;
- the number of recipients or placement bands;
- complete tie handling.

An Award Plan may reference supported standings aggregates, public final placements, elimination outcomes, Ruleset-valid preliminary Speaker Point aggregates, School totals, or another source explicitly supported by the versioned **Award Plan Schema**. It cannot redefine standings, advancement, Ballot, or placement calculations and cannot read private narrative feedback, Judge assessment data, or arbitrary uploaded fields.

## Upload, validation, and preview

Only a Tournament Director may upload `.docket-awards.json`. Docket records the event, uploader, source filename, content fingerprint, schema version, referenced standings and Advancement Plan fingerprints, upload time, and immutable Award Plan version. A replacement creates a new draft without overwriting history.

Runtime validation checks JSON syntax, supported schema version, event compatibility, stable category identifiers, allowed recipient and source types, valid eligibility predicates, recipient counts, complete tie behavior, compatible source references, and absence of unknown or executable operations. Docket rejects scripts, formulas, expressions, macros, plugins, network references, PDFs, and spreadsheets as machine-executable Award Plans.

For each valid draft, Docket produces an **Award Plan Preview** from synthetic standings, placement, elimination, Speaker Point, and School-total fixtures as applicable. The preview shows eligible and excluded candidates, source values, ordering, tie resolution, recipients, warnings, and internal Plan and source fingerprints. The future TypeScript UI generates the same JSON contract from Director-selected controls.

## Acceptance and lock

Only a Tournament Director may accept one exact validated Award Plan fingerprint after reviewing its preview. Acceptance records the internal Plan and preview versions, warnings, acknowledgment, actor, and time. The public UI exposes none of that metadata.

The Director must accept the Award Plan before first-round Pairing Publication. That publication atomically locks the compatible Standings Rules Configuration, Advancement Plan, and Award Plan fingerprints. Docket blocks publication if any required artifact is missing, unaccepted, incompatible, or references a different governing source. Ordinary upload or acceptance cannot replace the Award Plan after locking.

## Award calculation

Docket applies one locked Award Plan version to exact versioned source snapshots and produces an immutable **Award Results Draft**. It records every category, candidate, eligibility decision, source value, tie outcome, recipient, source version, Plan fingerprint, warning, and calculation time. The same inputs and versions must reproduce the same output.

The TypeScript backend implements award calculation as a deterministic module with explicit typed inputs and runtime-validated source projections. It consumes standings, advancement, Ballot, final-placement, and School-total outputs through declared interfaces and never mutates or independently recalculates them.

Award Results feed [[final-results-model]]. Every configured award and recipient appears in the public Final Results Summary with the other published tournament results. The Award Plan cannot designate an award or recipient as nonpublic. Internal calculation metadata and restricted source records remain excluded from the public projection.

## Approval and publication

Docket calculates or regenerates Award Results automatically whenever the locked Plan's required authoritative sources are complete and change. Award Results remain a component of the Final Results Draft rather than an independently approved or published artifact.

The Tournament Director's approval of one exact Final Results Draft also approves the exact Award Results Draft it references. A source correction or regenerated Award Results Draft invalidates that Final Results approval. The Director or Publication-authorized staff then publishes awards together with the rest of that exact approved Final Results version. Docket provides no separate award-approval or award-publication action.

## Emergency post-lock correction

Only a Tournament Director may approve an **Emergency Award Plan Correction** after first-round Pairing Publication locks the Plan. The correction must repair a verifiable discrepancy between the locked Plan and award rules published before the tournament. It cannot introduce a policy that the published rules leave silent or ambiguous, and it cannot add, remove, reorder, or redefine awards in response to emerging tournament results.

Tabulation Staff may investigate the defect and prepare evidence and a replacement Plan, but they cannot approve it. Docket runtime-validates the exact replacement, compares it with the locked version, and produces both an Award Plan Preview and a full impact preview identifying every changed eligibility decision, ordering value, tie outcome, placement band, and recipient. The Director must explicitly confirm the evidence, exact replacement fingerprint, previews, reason, and notices.

Approval preserves the locked Plan and creates a versioned emergency replacement rather than overwriting history. Docket regenerates every affected Award Results Draft from authoritative sources and invalidates any Final Results Approval that referenced the earlier Award Results. If award information was already public, the corrected Final Results require the ordinary approval and publication workflow and a public human-readable Correction Notice. An Emergency Award Plan Correction cannot rewrite standings, advancement, pairings, Ballots, or source results.

## First Lincoln-Douglas release

The first Lincoln-Douglas release supports two award families:

- **Elimination placement awards**, sourced from authoritative elimination results and final placements. The Award Plan may configure the recognized placement bands and recipient count, such as champion, finalist, or semifinalists.
- **Preliminary Speaker Awards**, sourced only from the locked Ruleset-valid preliminary Speaker Point aggregate. The Award Plan may configure the number of recipients and complete tie handling. Elimination-round Speaker Points are not used because Docket does not award Speaker Points in elimination rounds.

Each award family may be disabled for a tournament. Docket defers School sweepstakes, team sweepstakes, and subjective or narrative awards until multi-event support. Those future categories require a later schema and source-policy decision rather than arbitrary custom calculations in the first release.

Elimination placement awards consume only out-round results that passed the Out-Round Verification Gate in [[advancement-model]] before Pairing Publication and the next elimination-round start. A missing or stale verification blocks the dependent award and Final Results draft. A later advancement-changing correction should therefore be impossible through ordinary operation; an exceptional escaped objective defect invalidates unconsumed dependent artifacts and follows the existing correction workflow while preserving Started and Completed rounds.

See [ADR 0019](../docs/adr/0019-use-a-separate-award-plan.md).

## Decision record

- **2026-09-01:** The project owner selected a separate `.docket-awards.json` Award Plan defining categories, eligibility, sources, recipient counts, tie handling, and public visibility; required validation and preview plus future TypeScript UI generation; and locked the Director-accepted Plan with standings and advancement at first-round Pairing Publication.
- **2026-09-01:** The project owner limited the first Lincoln-Douglas release to configurable elimination placement awards and preliminary Speaker Awards, allowed either family to be disabled, and deferred sweepstakes and subjective awards until multi-event support.
- **2026-09-01:** Superseding the earlier per-category visibility choice, the project owner required every configured award and recipient to be public like the other published tournament results. Award calculation metadata and restricted source evidence remain private.
- **2026-09-01:** The project owner made Award Results an automatically calculated component of the Final Results Draft whose exact contents are covered by Final Results Approval and Publication, with no separate award approval or publication workflow.
- **2026-09-01:** The project owner reserved post-lock Award Plan correction to a Tournament Director, limited it to verified conformity with award rules published before the tournament, prohibited outcome-driven policy changes, and required validation, full impact preview, regeneration, immutable history, and any applicable Correction Notice.
- **2026-09-02:** The project owner made verified out-round results a prerequisite for elimination placement awards and Final Results, treating a later advancement-changing dispute correction as an exceptional escaped defect handled through existing invalidation and correction controls.
