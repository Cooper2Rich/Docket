# Implementation issue setup proposal

Status: option B selected by the owner on September 18, 2026; setup completed. See the [verified setup report](setup-report.md). The remainder preserves the recommendation and starting-point audit. This authorizes the complete issue setup and external launcher repair described below, not application implementation or a change to Release 1 product scope.

## Recommendation

Choose **B: audit and prepare the complete Release 1 issue queue before implementation**. Keep the existing graph authoritative, preserve its 40 objective IDs, and split only objectives that exceed one bounded implementation run and one reviewable change. Publish executable leaf issues with precise acceptance and evidence contracts. Retain a split objective as a non-runnable tracking group.

At recommendation time, the issue count was intentionally unspecified. The completed audit produced 115 leaves, 40 groups and eight gates. There is no reliable unattended completion-time estimate.

## Choices

| Choice | Setup delivered | Tradeoff |
| --- | --- | --- |
| A — Convert the existing roadmap | Expand the 40 existing items into issue contracts, add dependencies and coverage links, and repair the runner integration. Split an item whenever its size violates the Work Item Contract. | Least initial restructuring; broad items are more likely to require decomposition during execution. |
| B — Full decomposition and readiness audit | Read the governing sources for every objective, resolve or track scope ambiguities, split oversized objectives, prepare every leaf issue, validate coverage and dependencies, and repair the runner integration. | More preparation; best fit for setting up the entire release with fewer avoidable interruptions. Recommended. |
| C — Prepare in stages | Map all 40 objectives now, fully prepare foundation and walking-skeleton issues first, then detail subsequent stages after their dependencies establish concrete interfaces. | Less speculative detail in later issues, but requires additional setup work between stages. |

All choices preserve the Work Item Contract and require a separate explicit instruction to start application implementation. An unresolved product decision stays visible and blocks the affected work; setup does not invent its answer.

## Historical verified starting point before option B

- The checked-out remote is `Cooper2Rich/Docket`. A GitHub connector search for all open issues returned none on September 18, 2026.
- The [YAML graph](work-graph.yaml) has 40 objectives in eight stages, currently arranged as one sequential dependency chain. `R1-FND-001` is ready; the remaining 39 are blocked. No item is done.
- [BUILD.md](../../BUILD.md) and the [development contract](../development.md) say the application and its commands do not exist after the reset. Historical verification does not establish current readiness.
- The graph identifies outputs, interfaces, risks, and evidence, but many evidence entries are scenario names rather than exact commands and pass conditions. Examples include “manager concurrency test,” “all-class clock tests,” and “restore-retention exercise.”
- Several objectives combine substantial workflows. Sizing candidates include `R1-REG-004` (admission, eligibility, minor authorization, accommodations), `R1-CMP-001` (scheduling and revisions), `R1-CMP-008` (round operations and disputes), and both governance items. These are audit candidates, not approved splits.
- The current checkout already contains uncommitted documentation edits and skill removals. Setup must preserve them and identify its own changes rather than committing the entire working tree indiscriminately.

## Source authority and coverage

The [Release 1 PRD](../releases/release-1.md) remains the Project Resource Document. Do not create a competing `docs/PRD.md` or move testing procedures into the product specification. Acceptance details, test commands, evidence, iteration budgets, and issue execution belong to engineering documents.

Retain the eight existing Release 1 requirement IDs. They are useful umbrellas but are too broad to demonstrate that every detailed workflow is accounted for. Add engineering acceptance IDs such as `R1-SCH-001/AC-01`, with links to the exact governing sections and ADRs. These identify verification obligations; they do not replace or expand product requirements.

Prepare an engineering coverage matrix with these columns:

| Source behavior or capability | Release requirement | Owning runnable item | Acceptance ID | Evidence obligation | Disposition |
| --- | --- | --- | --- | --- | --- |
| Exact document and section | Existing `R1-*` ID | Stable graph leaf ID | Stable criterion ID | Command, fixture, result, or explicitly human evidence | Included, explicitly deferred, or unresolved |

Every included behavior needs an implementation owner. A row marked unresolved cannot become runnable. A deferred row must cite the Release 1 exclusion. In particular, Practice Workspaces, export products, saved searches/bookmarks/subscriptions, and public offline verification utilities must not enter this queue merely because a domain wiki page describes them.

Security, privacy, concurrency, audit, retention, accessibility, and failure handling belong in each affected slice. The final governance and release items validate the integrated release; they do not defer those obligations from earlier features.

## Issue organization

- Use a Release 1 label, one of the eight existing stages as the milestone, an owning-module label, and a distinction between executable work, tracking groups, and decisions.
- Preserve an existing work-item ID when its scope remains bounded. When splitting, preserve the original ID as a non-runnable group and allocate stable ordered child IDs, for example `R1-REG-004-A`.
- Extend the graph schema explicitly for group/leaf identity, parent links, detailed specification paths, and GitHub mappings. Preserve the five accepted status values. A group becomes done only when all required children and its combined evidence are complete.
- Keep the YAML graph authoritative for execution order and dependencies. Generate or mechanically synchronize the readable roadmap and GitHub issue content. Record the synchronized revision or content hash so drift blocks execution.
- Record actual blocking relationships as well as parent/child relationships. A parent link alone does not define execution order. GitHub supports both [sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) and [issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies).
- Publish issues in graph order and save each stable work ID → issue number mapping. Feed the launcher an explicit ordered list of leaf issues. Never tell it to execute every open issue: tracking groups, decisions, and unrelated issues are not build units.
- Treat GitHub status labels as projections of graph status, not a second authority. Readiness means prerequisites are satisfied; it does not mean the owner authorized execution.

The connector has issue creation and editing tools. A complete route for creating labels, milestones, native dependency links, and parent links still needs checking during setup; use authenticated API or browser capabilities where the connector lacks a dedicated operation. Do not report native relationships as configured until they are read back successfully.

## Contract for every executable issue

Each issue must stand alone for a fresh implementation session while linking to concise, authoritative source sections:

1. **Identity and outcome:** stable ID, graph order, module owner, stage, and one observable completed behavior.
2. **Scope and exclusions:** the full vertical slice, with clear limits. Separate independently usable behaviors instead of dividing one feature into unconnected database, backend, and UI tickets.
3. **Sources and prerequisites:** Release 1 IDs, applicable ADRs and source sections, dependency IDs, required existing inputs, and any external access or decision needed before execution.
4. **Affected contracts:** commands, queries, runtime schemas, tables, migrations, events, errors, audiences, API routes, UI states, and worker behavior. Explicitly justify inapplicable categories.
5. **Acceptance criteria:** stable IDs with specific inputs, actor/context, action, and expected outcome. Include applicable denial, stale, duplicate, race, rollback, failure, accessibility, and privacy cases.
6. **Verification:** exact command from repository root, prerequisite service/fixture, exact pass condition, evidence location, and which acceptance IDs it proves. Distinguish automated checks from required review or real-environment evidence.
7. **Completion and handoff:** changed files, commit and CI evidence, graph/roadmap/trace updates, wiki checkpoint, blockers, and the next eligible item.

For example, an applicable concurrency criterion should say that two simultaneous attempts cannot violate the one-School-Manager invariant, state the required result for the losing attempt from the governing contract, and name the observable database and command outcomes. “Add concurrency tests” is not sufficient acceptance.

Do not hard-code speculative implementation filenames or new error semantics before reading the governing source. Preserve accepted package boundaries and interfaces while allowing the implementing session to choose internal details.

## Bootstrap and activation

Setup can validate references, criteria coverage, graph order, issue publication, and launcher behavior before application code exists. It cannot truthfully claim that future application verification has run.

For each future command, name the prerequisite that creates it. Foundation issues must create and exercise their own declared tooling. Later issues may specify planned commands, but activation must confirm those commands now exist and reach the relevant behavior. A missing command is never a passing check, and empty suites or success-only placeholders cannot establish acceptance.

Reconcile staged evidence across the development contract, Work Item Contract, graph, and executable-contract rules. In particular, the scaffold must not require a completed contract generator from `R1-FND-004` or CI from `R1-FND-005` before it can finish. Conversely, later items must not claim exemptions from checks that their dependencies have already established. The setup audit should make any necessary engineering clarifications explicit and consistent rather than letting an implementation agent improvise exceptions.

At activation, validate the exact issue contract revision, graph status, completed dependencies and their evidence, available inputs, current checkout, and absence of a governing contradiction. Recheck these conditions before each issue, even when a future queue was authorized as a whole.

## Local launcher integration

The installed local `ralph-loop` skill and its scripts were inspected for this proposal. The existing queue wrapper processes issues sequentially and validates completion receipts against Git HEAD. Those are useful foundations, but the inspected implementation needs adaptation before a Docket build:

| Observed behavior | Required setup |
| --- | --- |
| Child processes hard-code `xhigh`; the public parameters expose model but not reasoning effort. | Add an explicit reasoning setting and propagate `high` through the Docket launch path. A parent-process default cannot override the hard-coded child argument. |
| Child prompts permit subagents and configure subagent defaults. | Enforce Docket's no-coding-subagents rule in the effective child configuration and objective. |
| Raw child event output is streamed with `Tee-Object`. | Keep detailed events in run files and emit concise lifecycle updates to the supervisor, as required by the orchestration contract. |
| The issue workflow specifies commit, verification comment, closure, and a receipt, but does not itself enforce the Docket graph or required CI completion. | Add graph-aware selection and an evidence check tied to the actual code revision before closure or promotion. |
| Receipt validation checks nonempty passing criterion/check arrays and matching HEAD. It does not compare their complete ID sets to an independently stored issue contract. | Require the complete expected criterion/check set, matching contract revision, and actual required-check outcomes; reject omitted criteria or stale receipts. |

Keep all launcher code, skill changes, and launcher fixture tests outside Docket. Keep Docket's issue contracts, graph, evidence references, and durable Markdown context inside the repository. Do not reinstall skill packages or project-specific skill-routing policy here.

Preserve unrelated global runner defaults where possible by adding parameters and using an explicit Docket invocation. Do not silently change every project to Docket's settings.

Use one sequential runnable leaf per loop with the existing default limit of 20 iterations, durable progress between fresh sessions, and a stop on blockage, exhausted iterations, or repeated execution failure. A failed item must not cause a jump to the next one. Run all required checks and avoid repeating unchanged checks without a relevant code or environment change.

## Completion, CI, and review

The recommended delivery unit is one reviewable PR per runnable leaf, with its implementation commit referencing the issue. Run required local checks and the named CI checks against the actual code revision. Include graph, roadmap, generated traceability when available, and wiki changes in that reviewable result.

The [branch protection contract](../operations/github-branch-protection.md) requires passing checks on the current PR head and an approving review before merging into `main`. This session has not verified the live ruleset. Setup must inspect and reconcile the current remote state and document the foundation-stage transition before execution.

Prefer closing an issue and advancing its dependents after its verified change is integrated. Adapt receipt semantics to account for the tested PR revision and merge revision; the current local-HEAD-only receipt is not enough for that workflow. Completion recording must be restart-safe so a process interrupted after merge can reconcile the graph, issue, and receipt without reimplementing work.

An approving review, unavailable provider access, staging validation, or the final production go/no-go may require an external action. The queue should stop with the exact required action and durable evidence. Setup must not promise uninterrupted end-to-end autonomy or weaken the protected branch policy to obtain it.

## Setup deliverables after selection

For option B:

1. Audit every current objective against its full governing sources; produce the engineering coverage matrix and a short list of any decisions that truly require the owner.
2. Produce the revised graph, synchronized roadmap, detailed leaf specifications, and an issue template with complete criteria and evidence obligations.
3. Validate IDs, acyclic dependencies, source links, scope exclusions, group rollups, coverage, and stage-appropriate prerequisites.
4. Prepare and publish the complete GitHub issue set, labels, milestones, mappings, and relationships; read them back and compare with the local contracts.
5. Adapt the external launcher and verify it with fake workers/fixtures covering graph order, no skipped blockers, required settings, incomplete evidence, stale contract/commit receipts, interrupted completion, and fail-stop behavior. This must not launch a real Docket build.
6. Deliver the exact future launch procedure and an audit report distinguishing setup complete, currently eligible, blocked on implementation prerequisites, and blocked on an owner/external action.

The proposal above records the pre-selection recommendation. Its option-B setup has since been completed: consult the [setup report](setup-report.md) for the published queue, tested launcher and unresolved activation gates. Application implementation remains separately authorized work.
