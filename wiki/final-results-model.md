# Final Results Model

## Publication readiness

Docket may generate a **Final Results Draft** only when the competitive data needed for every published placement and award is complete and internally consistent. The readiness gate requires:

- every preliminary and elimination round needed for placement to have a locked Competitive Result, Panel Decision, or authorized Administrative Outcome;
- the current standings snapshots, Advancement Field, elimination bracket, and final round decision to reference their governing locked versions;
- every placement- or award-affecting Ballot correction, Completed Round Decision Correction, disqualification, Emergency Standings Rules Correction, Emergency Advancement Plan Correction, and Downstream Conflict to be resolved;
- every timely filed No-Show Dispute capable of changing that event's public results to be decided; and
- every award to be calculated from its locked Award Plan and governing Ruleset, standings, advancement, result, eligibility, and source versions.

An unresolved result that could change a placement or award blocks readiness. Ballot Feedback never blocks Final Results Publication. An outstanding individual panel Ballot after an Irreversible Majority does not block the already locked Panel Decision; if the missing Ballot also contains a scoring value that the locked rules require for a placement or award, that missing scoring input—not the settled panel winner—remains a readiness blocker. Docket never fabricates the missing value.

## Draft validation, approval, and publication

Docket automatically calculates and validates an immutable Final Results Draft when the readiness gate passes. The draft records every source artifact and version, published placement, award calculation and inputs, unresolved nonblocking item, warning, calculation time, and content fingerprint. No actor may directly edit a calculated placement or award; a wrong result requires correction at its authoritative source and regeneration of the draft.

Only a Tournament Director may perform **Final Results Approval** for one exact validated draft fingerprint. Approval records the Director, source versions, warnings, nonblocking outstanding items, reason, and time. Any placement- or award-affecting source correction or regeneration invalidates unconsumed approval.

After approval, the Tournament Director or Tabulation Staff with the Publication operations permission bundle may perform **Final Results Publication** for only that exact approved fingerprint. The same Director may approve and publish, but Docket records validation, approval, and publication as separate attributed events. Publication never occurs automatically.

Final Results Publication marks **Competitive Completion** but does not close the tournament. **Tournament Closure** is a later, separate action reserved to the Tournament Owner after the Judge-feedback window and required operational work are complete or resolved. Authorized correction workflows remain available after closure. See [[tournament-lifecycle-model]].

Tournament Closure is blocked while Final Results are unpublished, a timely filed No-Show Dispute remains unresolved, or a correction, conflict, or newer unpublished result version could change public results. Outcome-irrelevant missing panel Ballots and Ballot Feedback remain nonblocking warnings that require Owner acknowledgment in the Closure Readiness Review.

Closure does not withdraw the Final Results Summary or its supporting public tournament pages. Later result changes are possible only through an authorized Post-Closure Exception and retain the ordinary source correction, exact-draft approval, republication, version history, and Correction Notice controls.

A Post-Closure Correction Case does not make its draft public or reopen the tournament. The last published Final Results Summary remains current until the corrected exact draft is approved and republished. Resolution or withdrawal closes the case while the tournament remains Closed.

An objective system or data-entry error in a rejected No-Show Dispute discovered after Tournament Closure uses that same scoped Post-Closure Correction Case. The Tournament Director initiates and approves the correction. A Platform Administrator may validate system evidence but cannot decide the case or change the result. Qualifying evidence is limited to objective delivery logs, check-in records, immutable timestamps, a proven published time or room error, or a proven data-entry defect; new merits explanations do not qualify. The edit window is exactly 168 hours from the immutable Tournament Closure instant; Docket displays the corresponding deadline in the tournament's official timezone while enforcing that instant. A rejected case records the Director's reason, privately notifies the affected Competitor and responsible Coach, remains restricted Seven-Year Competitive Evidence, and leaves public results unchanged. The same evidence cannot be appealed or resubmitted; materially different objective evidence may support a new case only within the same window. An unresolved case at the deadline closes automatically as `Expired—Correction Window Ended`, prohibits further edit or republication, sends the same private notices, remains Seven-Year Competitive Evidence, and leaves public results unchanged. The tournament stays Closed, and only a correction approved and republished before the deadline can change public results.

A later source correction creates a new Final Results Draft and, after the required approval and publication, a versioned Correction Notice. Docket retains the original published results and every intervening public version instead of silently replacing history. The Tournament Archive shows the current corrected results by default, keeps Correction Notices visible, and places prior public versions in expandable Tournament Publication History clearly labeled Superseded. See [[tournament-directory-model]], [[ballot-model]], [[standings-model]], and [[advancement-model]].

A timely No-Show Dispute blocks the affected event's Final Results Publication until decision. The Out-Round Verification Gate in [[advancement-model]] must also be complete and current for every elimination input, preventing an ordinary post-publication dispute decision from changing advancement or placement awards. If an exceptional objective defect escapes that gate and changes an authoritative source after a draft or publication exists, Docket regenerates all affected standings and dependent result artifacts, invalidates affected approvals, and requires ordinary approval and republication. The public Correction Notice uses the generic reason “No-Show classification corrected” and identifies only the previous and corrected public values and competitive effect.

An approved Entry School Attribution Correction is one such source correction. It regenerates affected public Entry and School projections and any dependent Final Results Draft without rewriting started or completed pairings. If a public School attribution changes, republication includes a Correction Notice stating the prior and corrected School and effect while withholding cross-School identity evidence and private records.

The same lifecycle applies to an approved Emergency Award Plan Correction: Docket regenerates the affected Award Results and Final Results Draft, invalidates an earlier approval, preserves all prior versions, and requires a new approval and publication. If the change affects already public award information, the new publication includes a public Correction Notice.

The TypeScript backend models readiness validation, deterministic result assembly, approval, and publication as separate state transitions with explicit source-version references and runtime-validated payloads.

## Public results and restricted evidence

Final Results Publication creates a public **Final Results Summary** containing:

- the event champion and finalist;
- every other configured public placement;
- the complete elimination bracket and competitive decisions without detailed Ballots;
- the final published standings;
- recipients of every configured award; and
- the represented School for each published Entry or recipient.

The public summary does not expose detailed Judge Ballots, Ballot Feedback, unpublished feedback, a Judge identity linked to an individual score, private eligibility or disqualification evidence, or Judge assessment data. Those records remain available only through their existing audience-specific permissions.

Governing configuration fingerprints and the publishing actor and time are internal audit metadata. They remain part of the Final Results Draft, version history, staff review, and audit exports but are not included in the public Final Results Summary or otherwise exposed through its public UI.

A human-readable Correction Notice remains public whenever published results change. It states the affected public result, its previous public value, its corrected public value, the competitive effect, and any action participants must take. It does not reveal raw fingerprints or versions, internal actor identity, exact timestamps, private evidence, internal reasoning notes, or audit details. Authorized staff retain the full linked correction record. The same separation applies to corrections of other public Docket artifacts.

The Final Results Draft consumes the immutable Award Results Draft from [[award-model]]. It does not recalculate award eligibility, rankings, or ties. Final Results Approval covers the exact referenced Award Results Draft, and any award-source correction or award regeneration invalidates that approval. Awards have no separate approval or publication action. Every configured award category and recipient appears in the public Final Results Summary; only internal calculation metadata and restricted source records remain private.

The TypeScript backend must construct and runtime-validate a dedicated public results projection rather than returning the full Final Results Draft and relying on the UI to remove restricted evidence.

The public Final Results Summary, its supporting published standings, bracket, awards, represented Schools, and Correction Notices are part of the Permanent Public Tournament Record in [[retention-model]]. Restricted source evidence, nonpublic versions, fingerprints, approvals, correction provenance, and calculation records are Seven-Year Competitive Evidence. Their expiry never removes or changes the permanent public projection.

A Rubric-Blocked Administrative Ruling satisfies the round-outcome requirement only after its required verification or warned Director-only exception completes. While unresolved, it blocks only Final Results and other artifacts that actually depend on that round; missing the ruling deadline creates no automatic outcome. A later objective correction preserves the original, invalidates dependent Final Results Approval, recalculates affected standings and advancement, and republishes through the existing correction workflow. When public results change, the public Correction Notice links the former and corrected outcomes and explains the competitive effect while withholding evidence, internal actors, configuration fingerprints, exact technical timestamps, and other internal metadata.

See [ADR 0018](../docs/adr/0018-gate-and-version-final-results.md).

## Decision record

- **2026-09-04:** The project owner limited unresolved rubric-defect blocking to dependent results, prohibited timeout-generated outcomes, and required a human-readable public correction linkage without internal evidence or metadata.

- **2026-09-04:** The project owner made completed rubric-defect rulings valid Final Results inputs and required objective corrections to invalidate approval, recalculate dependencies, preserve the original, and republish with any required public notice.

- **2026-09-02:** The project owner made current corrected results the Tournament Archive default, kept Correction Notices visible, and placed prior public results versions in an expandable Superseded publication history without exposing restricted correction metadata.
- **2026-09-02:** The project owner blocked affected-event Final Results while a timely No-Show Dispute is unresolved and required successful disputes to regenerate dependent results, invalidate approvals, and republish through the ordinary privacy-preserving correction lifecycle.
- **2026-09-02:** The project owner required current Out-Round Verification for elimination-dependent Final Results, retained governed correction only for exceptional escaped defects, and routed post-Closure objective No-Show errors through a scoped correction case without reopening the tournament.
- **2026-09-02:** The project owner assigned objective post-Closure No-Show correction initiation and approval to the Tournament Director, limited Platform Administrators to system-evidence validation, and excluded new merits explanations from qualifying evidence.
- **2026-09-02:** The project owner limited objective post-Closure No-Show edits to seven days after Closure, made reasoned rejection privately noticed and final on the submitted evidence, retained the rejected case for seven years, and allowed materially different objective evidence to support only another timely case.
- **2026-09-02:** The project owner defined the correction window as exactly 168 hours from the immutable Closure instant and required unresolved cases to expire at that deadline without further edits, republication, or public-result change while retaining private notice and seven-year evidence.
- **2026-09-01:** The project owner required placement-affecting decisions, corrections, disqualifications, conflicts, and awards to be resolved before final publication; reserved exact-draft approval to a Tournament Director; allowed the Director or Publication-authorized staff to publish; and made feedback and mathematically irrelevant panel Ballots nonblocking.
- **2026-09-01:** The project owner made champions, finalists, configured placements, the complete elimination bracket and decisions, final standings, public award recipients, and represented Schools public; restricted detailed Ballots, feedback, Judge-linked scores, private eligibility and disqualification evidence, and Judge assessment data; and later restricted governing fingerprints and publishing metadata from the public Final Results UI.
- **2026-09-01:** The project owner extended the raw metadata restriction to every public Docket UI while preserving the information for authorized staff and audit history.
- **2026-09-01:** The project owner kept human-readable Correction Notices public while restricting their fingerprints, versions, actors, exact timestamps, private evidence, internal notes, and audit records.
- **2026-09-01:** The project owner moved award definitions and calculations into a separate locked Award Plan and required Final Results to consume its immutable Award Results Draft rather than recalculate awards.
- **2026-09-01:** Superseding the earlier public-award subset, the project owner required every configured award and recipient to appear with the other public tournament results while retaining restricted source records and internal metadata privately.
- **2026-09-01:** The project owner placed automatically calculated Award Results inside the existing exact-draft Final Results approval and publication lifecycle and rejected a duplicate award-specific gate.
- **2026-09-01:** The project owner required a Director-approved Emergency Award Plan Correction to regenerate Final Results, invalidate prior approval, preserve history, and produce a Correction Notice when published award information changes.
- **2026-09-01:** The project owner made Final Results Publication mark Competitive Completion without automatic closure, preserved Owner-only Tournament Closure after feedback and operational work, and kept authorized corrections available afterward.
- **2026-09-01:** The project owner made unpublished or potentially stale public results a non-waivable closure blocker while treating outcome-irrelevant missing Ballots and feedback as reasoned Owner-resolvable warnings.
- **2026-09-01:** The project owner kept published results readable after closure and prohibited ordinary replacement while retaining the fully governed correction and republication path.
- **2026-09-01:** The project owner kept the last published Final Results current throughout a scoped post-closure correction and changed the public version only through normal approval and republication.
- **2026-09-01:** The project owner routed verified Entry School Attribution Corrections through source regeneration, exact-draft approval, republication, and a privacy-preserving public Correction Notice while preserving operated pairings.
- **2026-09-01:** The project owner permanently retained the published Final Results record and Correction Notices while limiting restricted source evidence and provenance to seven years after Tournament Closure unless held.
