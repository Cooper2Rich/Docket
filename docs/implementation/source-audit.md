# Release 1 issue source audit

Status: September 18, 2026 setup audit. No application implementation or application checks ran.

The audit preserves the 40 original objectives as non-runnable groups and decomposes them into 115 leaves. Each leaf has three behavioral acceptance criteria and a fourth boundary/evidence criterion. [source-coverage.json](source-coverage.json) indexes 2,202 clauses from 63 governing and contextual documents with source location, content hash, disposition and applicable ownership. [queue-contract.json](queue-contract.json) binds the exact specifications, acceptance IDs, commands and source-file revisions. These are coverage obligations, not proof of passing software.

## Authority resolutions

Apply accepted later decisions to older contradictory summaries; do not implement both policies:

| Older statement | Governing interpretation |
| --- | --- |
| ADR 0001 includes Feedback Deadline among configurable override examples. | ADR 0009 and the current Ballot Model require a hard seven-calendar-day deadline with no extension or bypass. |
| ADR 0006 / older access summaries group Director appointments, ownership transfer and Closure with Director powers. | ADR 0007 and ADR 0020 reserve those actions to the current Tournament Owner; Director operational powers do not inherit them. |
| An older mixed official/Practice rubric paragraph mentions pinning with first Pairing Publication. | The later exact cohort rule pins at the first authorized Ready/Scheduled-to-Started transition for that event/round cohort. All rooms share the atomic pin. |
| ADR 0014 says pairing transitions still require decisions. | The current Pairing Model defines their approval/publication/correction lifecycle and immutable Started boundary. |
| ADR 0021 leaves admission/waitlist policy open. | ADR 0022 and the current Registration Model define deterministic published admission and waitlist rules. |
| Backend roadmap still describes pre-reset completed implementation and lists contracts, graph, experience and observability as undecided. | BUILD.md's September 9 reset governs implementation status; the accepted current engineering/operations documents govern those decisions. Old passing evidence is historical. |
| ADRs 0002/0003 describe School-owned Competitor identity. | ADR 0030 supersedes them with individual Competitor Accounts and versioned School affiliation. |

The source documents retain historical context; this audit makes the effective interpretation explicit for the issue queue. It adds no new product policy. Any further unresolved contradiction blocks the affected leaf rather than being decided by a coding agent.

## Scope treatment

The product PRD and ADR 0038 exclude School/Account export products, Practice Workspaces, saved searches/bookmarks/subscriptions, offline verification tools and later competition formats. Mixed paragraphs retain their official-tournament rubric, feedback, safety, School authorization and retention obligations. Provisional brand/roadmap context is not counted as an independently implemented requirement.

Detailed domain clauses are assigned to the narrowest applicable authored leaf. ADR clauses are marked governing references; broad duplicated roadmap prose is marked context. A source link alone does not prove that a scenario passed: implementation must map each applicable source obligation to its concrete acceptance evidence.

## Unresolved gates

Eight separately tracked gates distinguish decisions and external prerequisites from implementation. The owner resolved the two activation gates on September 23 by approving the protected bootstrap/promotion policy and making the repository public so branch protection could be configured and read back. Later gates remain attached to their affected leaves.

Later gates cover the adopted LD Ruleset, real assessment provider/scoring policy, independent review/manual accessibility evidence, deployment environments/operators, explicit production go/no-go, and the precise Closed-state boundary for mistaken represented-School attribution. The attribution source refers to Post-Closure Exception requirements while the detailed 168-hour exception is No-Show-specific; this must not be broadened by inference.

## Size and sequencing

The leaf count follows behavior boundaries, not a promised completion-time estimate. Policy acceptance precedes dependent schedule/pairing locks. Rubric governance precedes the first actual round start. Corrections and privacy cases are explicit work rather than implied by the happy path. Every feature includes its own authority, privacy, delivery and retention guards; later governance leaves verify and complete their integrated operation.

Milestones are thematic; dependency order is authoritative. If implementation reveals that a leaf cannot fit one bounded run and one reviewable PR, split it before proceeding while preserving acceptance coverage. Do not hide extra work inside an unverified follow-up.
