---
status: accepted
---

# Use tournament-defined pairing plans

Docket will use a versioned, tournament-defined Pairing Plan instead of one universal Lincoln-Douglas pairing algorithm. Each configured round has its own Round Specification, allowing Tournament Directors and Pairing-authorized Tabulation Staff to combine supported pairing methods and options. Docket recommends a plan based on the Director's adopted Ruleset, but the recommendation is advisory.

## Consequences

- The pairing domain must support an ordered plan whose method and options may vary by round.
- The Tournament Director's adopted Ruleset and Docket's integrity invariants remain mandatory; configurable preferences do not authorize an invalid pairing.
- Pairing-authorized Tabulation Staff and Tournament Directors may edit a draft plan, and the Director approves the version included in Schedule Selection.
- Schedule Selection locks the pairing method and method-defining options assigned to every configured round.
- Before any round starts, only a Tournament Director may replace locked pairing policy through a validated, impact-previewed, explicitly confirmed, versioned, and republished Pre-Tournament Emergency Pairing Correction. No actor or workflow may change the policy after a round starts.
- Pairing Plan Revisions, Schedule Revisions, Pairing Withdrawals, and ordinary corrections must otherwise preserve the locked methods and options.
- Docket must generate and explain a Ruleset-aware recommendation, validate alternatives, and separate hard violations from warnings.
- Every Round Specification maps to an approved Tournament Schedule block.
- Tournament Schedule Publication must place the round structure, times, breaks, and human-readable Pairing Plan rules on the Tournament Invitation Page before the tournament begins while withholding internal versions, publishing attribution, and exact timestamps.
- Actual Entry-versus-Entry assignments are published later through Pairing Publication and must match the current plan and schedule block.
- A plan change that affects round structure, timing, duration, or resources requires a published schedule revision before an affected pairing may be published.
- Plans, recommendations, generated pairings, manual adjustments, approvals, reasons, actors, and versions must remain auditable.
- Draft pairing methods and options remain editable until Schedule Selection; Tournament Schedule Publication later locks the full displayed plan version.
- After that lock, Pairing-authorized staff may prepare a revision, but a Tournament Director must approve and republish it. Schedule-impacting revisions must complete the schedule-revision workflow first.
- A published but unstarted round may change only after Director-approved Pairing Withdrawal and a new Pairing Publication using the same locked method, with impact notices; started and completed rounds are immutable.
- Pairing-authorized Tabulation Staff may prepare an error-only Round Pairing Correction for an unstarted round under the locked policy, but it requires explicit Tournament Director sign-off.
- A Qualifying Pairing Error is limited to evidenced Entry status or duplication, incorrect or corrected inputs, failure to apply locked policy, prohibited assignments, Judge eligibility, room or schedule conflicts, and software or calculation failure.
- Strategic dissatisfaction, matchup preference, perceived competitive advantage, or disagreement with a valid deterministic outcome cannot authorize a correction.
- An ordinary pairing must pass Docket validation before a Tournament Director or Pairing-authorized Tabulation Staff member approves one exact version.
- A Tournament Director or Publication-authorized staff member may publish only that approved version. One actor may approve and publish when holding both authorities, but the events remain separate and attributed.
- Any edit or regeneration invalidates prior approval. Emergency corrections, withdrawals, and round corrections retain Director-only controls.
- Every pairing follows Draft, Generated/Entered, Validated, Approved, Published, Started, and Completed in order. Validation failure returns structured errors to Draft, and any edit creates a new version.
- Published may transition to Withdrawn only before Started; the replacement repeats validation, approval, and publication. Started and Completed pairings never move backward or change.
- Completed pairing immutability does not prevent the separate Director-only completed-round decision correction allowed for an input error or disqualification; that correction never changes pairing history.
- The initial catalog includes Random Draw, Preset Pairings, Seeded High-Low, Power High-Low, Power High-High, Round-Robin, Seeded Elimination Bracket, and Fully Manual Pairing.
- Every method is platform-versioned, validated, and reproducible; Random Draw retains its seed, and all methods retain their configuration, inputs, and output provenance.
- A Director-approved restoration of a mistakenly withdrawn formerly Accepted Entry after first-round Pairing Publication is allowed only before any round starts and requires withdrawal and republication of every affected pairing under the locked method.
- Tournament-supplied scripts, formulas, plugins, and arbitrary pairing code are outside the first release.
- When the Ruleset is silent, Docket recommends avoiding preliminary rematches and same-School pairings when feasible, keeping cumulative side difference within one, minimizing bracket pulls, and assigning a necessary bye to the lowest-ranked eligible Entry without a prior bye.
- Docket reports conflicting preferences and recommends an explicit relaxation instead of resolving the conflict silently.
- The elimination recommendation preserves seeded brackets despite rematches or same-School matchups. Flip Rounds ignore cumulative side balance.
- When opponents previously met, Docket reverses the sides from their most recent prior Pairing Publication that reached Started state and records that source pairing. Ballot-result changes cannot alter the side lock.
- Pairing state transitions require further decisions.
