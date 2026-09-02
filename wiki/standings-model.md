# Standings Model

## Tournament-defined standings rules

Docket does not impose one fixed standings calculation. For each tournament event, a Tournament Director uploads a tournament-scoped, configurable **Standings Rules Configuration** that defines how Docket will calculate and order preliminary standings.

The uploaded configuration is a durable tournament artifact. Docket stores its uploader, event, upload time, source filename, content fingerprint, and version so standings can identify the exact rule configuration that produced them. Replacing the draft creates a new version rather than overwriting prior evidence.

## Upload contract

The backend accepts a Docket-defined `.docket-standings.json` file. It is declarative data governed by a versioned **Standings Rules Schema**, not executable code. At minimum, the file identifies its schema version and event format and declares supported choices for:

- primary win, loss, and record ordering;
- Speaker Point aggregation, precision, and drop rules;
- treatment of byes, forfeits, disqualifications, and other Administrative Outcomes;
- the complete ordered tie-break sequence; and
- the deterministic final tie procedure when every configured criterion remains equal.

Every operation, metric, comparison direction, and Administrative Outcome treatment must use a stable identifier from the schema's supported vocabulary. Docket does not evaluate uploaded scripts, formulas, expressions, macros, plugins, or network references. PDFs and spreadsheets are not valid machine-readable standings configurations.

For a No-Show Bye Round, the configuration must explicitly define win, loss, point, and opponent-adjustment treatment before competition. Validation rejects an accepted configuration that leaves any applicable bye field ambiguous. Docket applies that locked treatment without fabricating a Judge Ballot or Judge-submitted Speaker Points and never assumes that every bye has the same standings value.

The future tournament UI will generate the same `.docket-standings.json` contract from Director-selected controls. Directors therefore do not need to hand-author JSON, while the backend and UI still share one versioned import and export format.

The configuration also contains one **Standings Publication Policy** represented as a closed choice:

- **After Every Preliminary Round** — create a publishable snapshot after each completed preliminary-round checkpoint.
- **Specified Checkpoints** — create publishable snapshots only after the exact preliminary rounds listed in the configuration.
- **After All Preliminary Rounds** — create one publishable snapshot after the final preliminary checkpoint.

A Specified Checkpoints list must use valid, ordered preliminary Round Specification identifiers, contain no duplicates, and cannot identify elimination rounds. The TypeScript domain model represents the three policies as a discriminated union with the checkpoint list required only for the checkpoint variant.

## Validation and calculation preview

An upload remains a draft until Docket validates it. Validation checks the JSON syntax, supported schema version, event-format match, required fields, allowed identifiers and values, compatible point and Administrative Outcome choices, complete tie behavior, and absence of unknown or executable operations. An invalid file produces field-specific errors and cannot be accepted or used for standings.

For a valid draft, Docket generates a **Standings Calculation Preview** using labeled sample Entry records that exercise wins and losses, equal records, Speaker Point drops, byes or other configured Administrative Outcomes, and fully tied results. The preview displays every intermediate metric, applied criterion, resulting order, warnings, schema version, and configuration fingerprint so the Director can verify the actual behavior before acceptance.

The configuration may also contain an optional `testCases` array of Director-provided **Standings Acceptance Cases**. Each case contains a label, synthetic Entry records and result inputs permitted by the schema, and the expected ordered Entry identifiers and calculated metrics. These cases supplement rather than replace Docket's required preview scenarios. Every supplied case must pass before the configuration can be accepted.

Docket preserves the cases with the configuration version and reruns them after every upload validation, schema migration, or proposed Emergency Standings Rules Correction. A mismatch invalidates the affected draft or replacement and reports the actual and expected values. Cases cannot contain executable code, external references, or production participant data.

The TypeScript implementation must pair compile-time configuration types with runtime boundary validation; a TypeScript type assertion alone cannot establish that an uploaded JSON file is valid. The standings calculator and test-case runner should be deterministic TypeScript modules whose outputs retain the schema version and configuration fingerprint.

## Acceptance, publication, and lock

Only a Tournament Director may perform **Standings Rules Acceptance**. The Director must review the Standings Calculation Preview and explicitly accept one exact validated configuration fingerprint. Acceptance records the Director, configuration version and fingerprint, preview version, displayed warnings, acknowledgment, and time. Any edit or replacement creates a new draft and invalidates the prior draft's validation and acceptance; it never changes the accepted version implicitly.

After acceptance and before the first-round Pairing Publication, Docket publishes a human-readable standings-rules summary on the Tournament Invitation Page. The public summary identifies the event, ordered ranking and tie-break criteria, point-drop behavior, Administrative Outcome treatment, and Standings Publication Policy without requiring readers to interpret JSON. Schema and configuration versions, fingerprints, accepting actor, and exact publication time remain available only to authorized staff and audit projections.

The first-round Pairing Publication references and locks the exact published Standings Rules Configuration. From that boundary forward, ordinary uploads, edits, revalidation, or acceptance cannot replace it. Every calculation and standings publication identifies the locked fingerprint. A later change requires the separate **Emergency Standings Rules Correction** workflow.

The human-readable standings-rules summary on the Tournament Invitation Page includes the selected Standings Publication Policy and every configured checkpoint. Locking the configuration also locks that disclosure schedule. Docket cannot add, remove, delay, or accelerate a checkpoint after results become known through ordinary operations; a verified implementation defect must use the Emergency Standings Rules Correction workflow and remain aligned with the already published policy.

## Publication checkpoints

At each configured checkpoint, Docket waits until every Competitive Result required for that standings snapshot is locked or resolved by an authorized Administrative Ruling and all blocking input conflicts are resolved. A locked Panel Decision supported by an Irreversible Majority is resolved for standings even when an individual panel Ballot remains outstanding. An unresolved single-Judge result or panel without a majority blocks the checkpoint release.

Each eligible release is a new immutable standings snapshot and publication version. It records the included round and result versions, excluded or ineligible Entry states, locked standings configuration fingerprint, calculated metrics and order, checkpoint identifier, calculation time, publishing actor, publication time, and any later Correction Notice. A later checkpoint never overwrites an earlier release.

Internal standings needed for a locked power-pairing method may be calculated before participant publication. Publication timing controls disclosure, not Docket's authorized operational use of the same versioned standings inputs.

### Snapshot approval and publication

When a configured checkpoint becomes eligible, Docket automatically calculates and validates one immutable draft standings snapshot. Automatic calculation never makes the snapshot participant-facing.

A Tournament Director or Tabulation Staff member with the Pairing operations permission bundle may perform **Standings Snapshot Approval** for one exact validated snapshot fingerprint. The actor reviews its included source versions, calculated order and metrics, warnings, and checkpoint completeness. A source correction or regeneration creates a new snapshot version and invalidates any unconsumed approval; no actor may directly edit a calculated rank or metric.

After approval, a Tournament Director or Tabulation Staff member with the Publication operations permission bundle may perform **Standings Snapshot Publication** for only that exact approved fingerprint. The same person may approve and publish when holding both authorities, but Docket records the validation, approval, and publication as separate attributed events. Docket never releases an eligible snapshot automatically.

Manual publication does not pause authorized internal standings calculation or power pairing. It controls only the participant-facing release required by the locked Standings Publication Policy.

### Publication visibility

Standings Snapshot Publication creates a public **Standings Snapshot Summary** containing each Entry's published display identity, School, rank, win-loss record, the labeled aggregate value of every metric actually used by the locked tie-break sequence, the checkpoint, included rounds, and every applicable public Correction Notice. Governing versions and fingerprints, publishing actor, exact publication time, and linked correction evidence remain restricted to authorized staff and audit projections.

Every aggregate metric that can affect public rank must be public in the same snapshot; the configuration cannot order Entries by a hidden metric. Docket displays the tie-break criteria in their applied order and preserves exact calculation precision even when the UI formats a value for display.

Active School Members may additionally view a School-scoped breakdown for their own Entries: each included round and result version, win or loss contribution, point contribution, drop or exclusion treatment, Administrative Outcome treatment, eligibility effect, and the intermediate values that produced each aggregate metric. Another School cannot view that private per-round breakdown.

The public and School-scoped projections do not expose a Judge identity linked to a score, detailed Judge Ballot, Ballot Feedback, unpublished feedback draft, private eligibility or disqualification evidence, correction evidence, or Judge assessment data. Appropriately authorized tournament staff may inspect the calculation provenance needed for operations, while sensitive evidence remains limited to the permission bundle governing its source.

The TypeScript backend constructs and runtime-validates distinct public, School-scoped, operational-provenance, and sensitive-evidence projections. It must not return one broad standings object and rely on the UI to hide restricted fields.

## Emergency correction

An Emergency Standings Rules Correction is permitted only when objective evidence shows that a configuration defect or Docket calculation defect makes the software behave differently from the human-readable standings rules already published on the Tournament Invitation Page. The published competitive policy is the correction target. A new strategic preference, reaction to current rankings, desired qualifier, changed tie-break order, or other attempt to alter the disclosed policy does not qualify.

Only a Tournament Director may approve the correction. The proposed replacement must pass the normal schema and semantic validation and receive a new Standings Calculation Preview. Before approval, Docket generates a complete impact preview containing:

- every Entry's previous and proposed standings metrics and order;
- every completed result and point provenance used by the recalculation;
- every unpublished, published-unstarted, started, and completed pairing affected;
- advancement, elimination seeds, awards, and final publications affected;
- required withdrawals, regenerations, Downstream Conflicts, and notices; and
- the original and replacement configuration versions, fingerprints, defect evidence, and explanation of how the replacement matches the previously published policy.

The Director explicitly confirms that exact previewed replacement. Docket then makes it the current locked version, recalculates standings from preserved competitive data, and records the prior and replacement rules, evidence, preview, Director, reason, and time. It never deletes the original configuration or earlier standings publications.

Unpublished pairings and advancement artifacts are regenerated. A published round that has not started must use the existing Pairing Withdrawal, correction, approval, and republication workflow. Started and completed pairings remain as played; Docket creates a Downstream Conflict where they differ from recalculated standings or advancement. Published standings, advancement, awards, or final results receive a versioned Correction Notice.

Docket immediately notifies Tournament Directors, relevant Tabulation Staff, and active School Members of the correction and its effects. A Judge receives the existing assignment-change notice and acknowledgment request only when a resulting schedule or pairing revision changes that Judge's assignment. The Tournament Invitation Page displays the current corrected human-readable summary and any public Correction Notice without exposing its fingerprint, publishing actor, or exact publication time; authorized staff and audit history retain the full metadata and superseded versions.

When a successful No-Show Dispute changes an already published standings input, Docket recalculates from the authoritative corrected record, invalidates every affected unconsumed standings approval, creates and publishes a new immutable snapshot through the ordinary approval path, and attaches a public Correction Notice. The notice states the previous and corrected public value and effect using the generic reason “No-Show classification corrected,” without absence details, dispute evidence, private reasoning, or restricted actor metadata. Started pairings remain as operated; Docket surfaces any downstream inconsistency for the governed pairing, advancement, award, or Final Results correction workflow.

Standings consume current Competitive Results and point provenance from [[ballot-model]] and Entry eligibility from [[registration-model]]. The resulting versioned standings snapshot is consumed by the separate [[advancement-model]] and by preliminary power-pairing methods in [[pairing-model]]. The standings configuration does not decide the elimination break, qualifiers, or seeds.

See [ADR 0015](../docs/adr/0015-use-director-uploaded-standings-rules.md).

## Decision record

- **2026-09-02:** The project owner required the locked Standings Rules Configuration to define every No-Show Bye Round's win, loss, point, and opponent-adjustment treatment and prohibited fabricated Ballots, Judge points, or a universal implicit bye value.
- **2026-09-02:** The project owner required an accepted No-Show Dispute affecting published standings to regenerate the authoritative snapshot, invalidate affected approvals, republish with a privacy-minimized Correction Notice, preserve operated rounds, and surface downstream conflicts.
- **2026-09-01:** The project owner rejected a fixed Docket standings template and required a Tournament Director to upload the tournament's configurable standings rule choice to Docket.
- **2026-09-01:** The project owner selected a versioned `.docket-standings.json` declarative contract, prohibited executable and document-style inputs, required schema and semantic validation plus transparent sample calculations before acceptance, and deferred hand-authoring to a future UI that generates the same format.
- **2026-09-01:** The project owner reserved acceptance of one exact validated standings configuration to a Tournament Director after preview review, required a human-readable invitation-page publication with its fingerprint, locked it at first-round Pairing Publication, and required a separate emergency workflow for any later change.
- **2026-09-01:** The project owner limited Emergency Standings Rules Corrections to verified defects that make Docket diverge from already published policy, reserved approval to a Director after validated calculation and full impact previews, recalculated standings while preserving started pairings, and required conflicts, notices, correction publications, and complete version history.
- **2026-09-01:** The project owner allowed optional Director-provided Standings Acceptance Cases in the JSON configuration, required every case to pass and rerun across validation, migration, and emergency correction, prohibited code and production data, and required TypeScript compile-time types plus runtime upload validation.
- **2026-09-01:** The project owner separated advancement policy from standings calculation and required standings to expose a versioned snapshot and fingerprint rather than deciding the break, qualifying Entries, or elimination seeds.
- **2026-09-01:** The project owner allowed standings publication after every preliminary round, at specified checkpoints, or only after all preliminaries; required the selected policy and checkpoints to be disclosed and locked with the standings configuration; and required complete, versioned inputs before each release.
- **2026-09-01:** The project owner required automatic calculation and validation but manual exact-version publication, allowed Directors or Pairing-authorized staff to approve, allowed Directors or Publication-authorized staff to publish, permitted one actor with both authorities to do both, and retained separate audit events.
- **2026-09-01:** The project owner made Entry identity, School, rank, record, and every ranking-affecting aggregate metric public; gave each School a private per-round breakdown for its own Entries; restricted Judge-linked scores, Ballots, feedback, eligibility and correction evidence, and assessment data; and required backend-enforced audience projections.
- **2026-09-01:** The project owner later removed raw fingerprints, governing versions, publishing attribution, and exact publication timestamps from every public standings and invitation-page projection while retaining them for authorized staff and audit.
- **2026-09-01:** The project owner kept human-readable standings Correction Notices public while restricting their linked metadata, evidence, and internal notes.
