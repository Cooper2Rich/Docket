# Tournament Lifecycle Model

## Initial Draft creation

An authenticated Account holder may create a Tournament with a name and official IANA timezone. Docket assigns a UUIDv7 identifier, enters the Tournament in **Draft**, and atomically creates one active Owner assignment for the creating Account. The Tournament and matching Owner cannot commit independently, and a concurrent write cannot create a second active Owner.

The Owner may appoint multiple Directors and explicit operational staff through seven-day Access Offers bound to any exact email address that Clerk recognizes as verified. The address need not be associated with Google social sign-in. Directors govern Tournament staff but cannot create another Owner. Staff receive only named permission bundles and may delegate only a permission they currently hold. Every protected action resolves the active Tournament role context and current assignment server-side; a supplied Tournament identifier never proves scope. This required starting point feeds later configuration, publication, registration, competition, and closure states. See [[access-model]], [ADR 0006](../docs/adr/0006-delegate-tabulation-permissions.md), [ADR 0007](../docs/adr/0007-single-owner-multiple-directors.md).

## Competitive completion

Publishing one exact approved Final Results Draft transitions the tournament to **Competitive Completion**. This state means the scheduled competition and its current public results are complete. It does not perform Tournament Closure and does not require Ballot Feedback or other outcome-irrelevant post-round work to be finished.

Competitive Completion preserves the existing Final Results correction lifecycle. A later authorized source correction creates new versioned results, requires the applicable approval and republication, and produces a public Correction Notice when published information changes.

## Tournament Closure

**Tournament Closure** is a separate governance action available only to the Tournament Owner. It is never an automatic consequence of Final Results Publication and cannot be delegated through a Tabulation Staff permission bundle or exercised by an additional Tournament Director.

Closure becomes eligible only after Final Results Publication, expiration of the Feedback Deadline, and completion or explicit resolution of required operational tasks. The hard Feedback Deadline is exactly seven days after the current published end of the final scheduled competitive round. No actor may extend or shorten it, and Closure cannot cut the window short. An authorized pre-end Schedule revision changes the anchor rather than exercising deadline discretion. Closure does not require every Judge to publish feedback; expiration of the promised opportunity is sufficient. Docket presents the Owner with a readiness review and requires explicit confirmation and a reason before closing.

### Closure Readiness Review

Before closure, Docket generates an immutable **Closure Readiness Review** with two severity levels.

**Hard blockers** prohibit closure and cannot be waived:

- Final Results have not been published;
- any round remains open or in progress;
- the Feedback Deadline has not expired; or
- any timely filed No-Show Dispute remains unresolved; or
- an unresolved correction, Downstream Conflict, or newer unpublished result version could change public tournament results.

**Owner-resolvable warnings** do not affect current public competitive results but require an explicit resolution choice and reason:

- an outcome-irrelevant individual panel Ballot remains missing after an Irreversible Majority;
- Ballot Feedback remains missing, incomplete, or unpublished;
- a delivery-tracked notice remains unacknowledged; or
- an optional export or administrative note remains incomplete.

The Owner cannot confirm Tournament Closure while a hard blocker exists. For each warning, the Owner either records that the work was completed or acknowledges the remaining item and gives a reason for closing without it. Closure records the exact readiness review, warning resolutions, Owner, reason, and internal time without deleting or disguising any outstanding record.

Closure ends routine tournament operation, removes the tournament from the Active Tournament Directory, and places its permanently retained public pages and results in the searchable Tournament Archive defined in [[tournament-directory-model]]. The archive shows current corrected results first and makes prior public versions available as clearly superseded Tournament Publication History while keeping Correction Notices visible. It preserves records, versions, attribution, and audit history without exposing restricted metadata. It does not erase data or make known errors permanent. Authorized versioned correction workflows remain available after closure and retain their existing approval, republication, and Correction Notice requirements.

## Post-closure access and operations

Tournament Closure keeps the following material readable:

- the public Tournament Invitation Page, schedule, Pairing Publications, standings, advancement field and bracket, Final Results, awards, and public Correction Notices;
- each authenticated actor's existing permission-scoped historical views; and
- authorized audit records and exports.

Docket rejects ordinary post-closure mutations to registration, staff assignments, Rulesets and configuration Plans, schedules, pairings, rounds, Ballots, feedback, standings, advancement, awards, and results. A closed tournament cannot create or start another round, publish an ordinary replacement, or use a former operational permission to resume routine work.

A closed tournament accepts only an explicit audited **Post-Closure Exception** using the existing authority and validation rules for:

- an authorized correction and any required recalculation, approval, republication, or public Correction Notice;
- Ownership Recovery; or
- a legally required privacy action through its separately authorized process.

Each exception is reasoned, attributed, versioned where applicable, and limited to its declared scope. Exception authority does not restore unrelated operational permissions or delete historical attribution.

Tournament Closure atomically revokes all active Accommodation Implementation Instructions and moves every remaining Accommodation Request to Closed. A pending request is not a Closure blocker after competitive and operational activity has ended. Closure records the start of the 30-day accommodation sensitive-content deletion period. An own-School request for earlier deletion is an allowed privacy action on the Closed tournament; it does not reopen the tournament or grant any other mutation authority. Only a separately authorized Legal Hold may suspend the deletion schedule.

Closure also starts the separate one-year retention period for each content-free Accommodation Audit Stub. Deleting a stub is a scoped privacy action that does not reopen the tournament and cannot delete or alter independently retained public results, pairings, awards, standings, or Correction Notices.

Legal Hold activation, review, expansion, extension, and release are platform Legal and Privacy Operations actions rather than Tournament Post-Closure Exceptions. They do not reopen the tournament or grant access to its ordinary operations. Tournament actors cannot inspect the hold; the affected School receives only the deletion-paused status. Hold release resumes any overdue deletion without a new Closure or tournament approval.

Tournament Closure starts the general retention clocks in [[retention-model]]: permanent retention for published public history, seven years for restricted competitive evidence, and two years for routine non-result operational telemetry. These clocks do not block Closure. Scheduled deletion is a lifecycle consequence rather than an ordinary tournament mutation and does not reopen the tournament or alter permanent public results.

### Post-Closure Correction Case

An authorized correction creates a scoped **Post-Closure Correction Case** without changing the tournament's Closed state. The case identifies the affected artifact and version, initiating actor and authority, reason, evidence, permitted commands, dependent recalculations, approval and publication requirements, and current case status. Every command outside that scope continues to encounter the closed-tournament guard.

An objective system or data-entry error in a rejected No-Show Dispute discovered after closure qualifies only through this case. The Tournament Director initiates and approves the correction. A Platform Administrator may validate system evidence but cannot decide the case or change the result. Qualifying evidence is limited to objective delivery logs, check-in records, immutable timestamps, a proven published time or room error, or a proven data-entry defect; new merits explanations do not qualify. The correction window lasts exactly 168 hours from the immutable Tournament Closure instant. Docket displays the deadline in the tournament's official timezone but enforces that instant. The case does not reopen the dispute on its merits, restore ordinary tournament operations, or change public results before the governed source correction, recalculation, approval, and republication complete.

While the case is unresolved, public viewers continue to see the last published version. Internal authorized views identify the pending corrected draft and its case without presenting it as current. If the correction is approved and republished before the deadline, Docket makes the new version current and publishes any required Correction Notice. A rejected case records the Director's reason, privately notifies the affected Competitor and responsible Coach, remains restricted Seven-Year Competitive Evidence, and leaves the prior public version current. Rejection is final on the submitted evidence: the same evidence cannot be appealed or resubmitted, but materially different objective evidence may support a new case within the 168-hour window. At the deadline, Docket automatically closes any unresolved case as `Expired—Correction Window Ended`, blocks further edit or republication, sends private notice to the affected Competitor and responsible Coach, retains the case for seven years, and leaves the prior public version current. Withdrawal also leaves the prior public version current.

Resolving, rejecting, or withdrawing the case does not require another Tournament Closure action. The tournament remains Closed throughout, the case and all attempted versions remain in audit history, and no unrelated tournament operation is reopened.

## Decision record

- **2026-09-04:** The project owner prohibited every official-tournament Feedback change after the hard seven-day deadline and removed Feedback Reopening from Post-Closure Exceptions.

- **2026-09-03:** The project owner fixed the official Feedback Deadline at exactly seven days after the current published end of the final scheduled competitive round and prohibited every extension or shortening.

- **2026-09-03:** The project owner superseded the 72-hour official Feedback default with a seven-day post-tournament Judge editing window that Tournament Closure cannot shorten; the exact tournament-end anchor remains open.

- **2026-09-02:** The project owner made current corrected results the default Closed-tournament view and preserved prior public versions through clearly superseded Tournament Publication History alongside visible Correction Notices.
- **2026-09-02:** The project owner made every timely filed No-Show Dispute a non-waivable Tournament Closure blocker and separately blocked the affected event's Final Results until the Director decides it.
- **2026-09-02:** The project owner routed an objective post-Closure No-Show decision error through a scoped Post-Closure Correction Case while keeping the tournament Closed and the last published version current until approved republication.
- **2026-09-02:** The project owner gave the Tournament Director initiation and approval authority for objective post-Closure No-Show corrections, limited Platform Administrators to evidence validation, and confined qualifying evidence to objective records rather than new merits explanations.
- **2026-09-02:** The project owner limited objective post-Closure No-Show edits to seven days after Closure, required private affected-party notice and seven-year retention for a reasoned rejection, prohibited appeal or resubmission of the same evidence, and allowed materially different objective evidence only through another timely case.
- **2026-09-02:** The project owner defined the correction window as exactly 168 hours from the immutable Closure instant and required unresolved cases to expire at that deadline without further edits, republication, or public-result change while retaining private notice and seven-year evidence.
- **2026-09-01:** The project owner separated Competitive Completion from Tournament Closure, made Final Results Publication trigger only Competitive Completion, preserved Owner-only closure after the feedback window and operational work, and kept authorized corrections available after closure.
- **2026-09-01:** The project owner set a configurable pre-tournament Feedback Deadline with a 72-hour default after the final scheduled round, allowed post-lock extensions but not shortening, and made expiration—not complete Judge submission—the closure condition.
- **2026-09-01:** The project owner adopted a two-level Closure Readiness Review with non-waivable competitive blockers and reasoned Owner resolution of outcome-irrelevant operational warnings.
- **2026-09-01:** The project owner made closed tournaments read-mostly, preserved public and permission-scoped history and exports, blocked routine mutations, and allowed only audited correction, Feedback Reopening, Ownership Recovery, and legally required privacy exceptions.
- **2026-09-01:** The project owner kept tournaments Closed during scoped Post-Closure Correction Cases, retained the last published public version until republication, and required no second Closure action after case resolution.
- **2026-09-01:** The project owner made Tournament Closure close all Accommodation Requests, revoke active instructions, and start a 30-day sensitive-content deletion period while allowing scoped earlier deletion without reopening the tournament.
- **2026-09-01:** The project owner made Tournament Closure start a separate one-year Accommodation Audit Stub period and isolated later stub deletion from retained public tournament history.
- **2026-09-01:** The project owner placed Legal Holds outside tournament authority, kept them from reopening Closed tournaments, and made release resume deletion without another Closure or tournament approval.
- **2026-09-01:** The project owner made Tournament Closure start permanent-public, seven-year competitive-evidence, and two-year routine-telemetry retention classes without creating new Closure blockers or reopening tournaments at deletion time.
