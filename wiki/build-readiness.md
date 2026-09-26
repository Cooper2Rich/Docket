# Build readiness

## Current state

On September 9, 2026, the owner requested deletion of the previous implementation and organization of the requirements and build instructions. The owner later authorized the Release 1 build on September 23. All ten foundation leaves, `R1-FND-001-A` through `R1-FND-005-B`, are now integrated into `main` under the protected controller workflow. The active bounded leaf is `R1-IDA-001-A`, the first identity-access vertical slice.

The [work graph](../docs/implementation/work-graph.yaml) preserves 40 objectives as tracking groups and defines 115 implementation leaves, 460 acceptance IDs and eight decision/external gates. The external controller has prepared the `R1-IDA-001-A` candidate transition, provisionally marking it done and `R1-IDA-001-B` ready with `controller-must-confirm-integration`. That proposal is not integration: the current leaf still requires a focused commit, fresh final-head evidence, one reviewable PR, all eleven protected `main` checks, and controller-verified merge. No dependent leaf may start before those gates pass.

## Product-document completeness

The owner clarified on September 9, 2026 that PRD means Project Resource Document. Its completeness concerns settled product design, behavior, scope, and capability targets. Missing runnable tests, test software, or verification procedures do not make the PRD incomplete. Implementation readiness and evidence remain separate concerns governed by the build instructions.

## Preserved foundation for implementation

- [Release 1](../docs/releases/release-1.md), accepted ADRs, the [module map](../docs/architecture/repository-map.md), domain vocabulary, and product knowledge remain the requirements and design inputs.
- [BUILD.md](../BUILD.md), the [development contract](../docs/development.md), the [bootstrap baseline](../docs/implementation/bootstrap-baseline.md), and [agent orchestration](../docs/implementation/agent-orchestration.md) define the future reading and implementation path.
- Agent tooling remains outside the repository. Docket contains no skill packages or project-specific skill-routing policy. Sol-only settings are retained, and obsolete Luna profiles are removed.
- The curated source in `raw/` and the Obsidian junction remain intact. See [[repository-navigation]] and [[project-context]].

## Historical evidence

The [previous-build archive](../docs/archive/previous-build/README.md) retains superseded reports and implementation notes. Earlier entries in [[log]] describe that removed implementation. Their passing checks and done statuses do not apply to this reset checkout.

## Implementation issue setup

On September 18, 2026, the owner chose option B in the [issue setup proposal](../docs/implementation/issue-setup-proposal.md): audit and prepare the whole Release 1 queue, publish its issues and repair the external launcher. The later September 23 instruction separately authorized application implementation.

The [source audit](../docs/implementation/source-audit.md) classifies 2,202 clauses from 63 sources. Detailed leaf specifications, source hashes, exact expected acceptance/check sets, staged command prerequisites and the [verification protocol](../docs/implementation/verification-protocol.md) are now generated. Source ownership is not executed application-test coverage.

The external launcher accepts explicit reasoning, subagent-disable and quiet-output parameters. The Docket controller enforces Sol/high, one leaf, complete evidence, exact-head CI, controller-evidence review, protected integration and restart-safe issue reconciliation. Forty-two controller/fake-worker tests cover bootstrap/promotion routing and zero-account-review fixtures. The ten foundation leaves are integrated through PRs #168–#177. `R1-IDA-001-A` now has a controller-prepared candidate transition but no reviewable PR or protected integration yet. All 163 issue bodies, 115 parent links and 122 blocking relationships were synchronized against the initial contracts. The [setup report](../docs/implementation/setup-report.md) and [evidence record](../docs/implementation/setup-evidence.json) record the setup and activation state.

The [pinned issue-order index](https://github.com/Cooper2Rich/Docket/issues/165) accounts for every work issue. Its [ordered implementation view](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue%20is%3Aopen%20label%3Arelease%3Ar1%20label%3Akind%3Aimplementation%20sort%3Acreated-asc) follows steps 001–115 (#49–#163); 40 group issues and eight gate issues are non-runnable. Native child order and every dependency were rechecked. The index is a separate navigation issue and does not change graph eligibility.

The temporary September 18 label-only exception for tracking issue #1 is superseded by controller-managed graph projections. Labels project the graph; they never replace it, and candidate branch status does not authorize dependent work before protected integration.

## Next concrete objective

Finish `R1-IDA-001-A` through the [launch guide](../docs/implementation/launch-guide.md): commit only the bounded identity-access slice and its prepared graph/wiki/trace transition, generate fresh receipts and exact acceptance evidence against that final head, create one reviewable PR to `main`, pass all eleven required contexts, and return the candidate to the controller for verified protected integration. The exact bound behavior suite—including real signed-token middleware, durable PostgreSQL concurrency and retry, executable hint consumption, and nine rendered Account Session browser cases—has passed; the latest exact verifier stopped only because final `unit`, `integration`, and `e2e` receipts have not yet been generated. `R1-IDA-001-B` must not start from the provisional candidate projection.

The generated traceability manifest and readable report map all eight umbrella requirements and all 460 active leaf criteria to their owners, suites and evidence obligations while preserving 98 explicit deferred or superseded source exclusions. After regeneration for this candidate, coverage states distinguish 44 registered/executable criteria and 416 pending-domain criteria; pending entries are obligations rather than claims of implemented behavior. The contract generator and `verify:item` consume the same canonical criterion registry, so a leaf-local subset cannot replace the independently pinned acceptance set.

The owner made the repository public on September 23, enabling branch-protection APIs without a paid private-repository plan. `GATE-BOOTSTRAP` and `GATE-GITHUB` are resolved in the graph and GitHub queue. Later gates remain attached to their affected leaves. A source inventory and immutable starting-state snapshot remain outside the repository in the local Docket setup tools directory.
