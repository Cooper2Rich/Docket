# Build readiness

## Current state

On September 9, 2026, the owner requested deletion of the existing implementation and organization of the requirements and build instructions, without building Docket. Application code, tests, generated contracts, migrations, CI implementation, deployment configuration, dependency installations, caches, and run output have been removed. No application command exists.

The [work graph](../docs/implementation/work-graph.yaml) contains 40 unchanged objectives: zero done, `R1-FND-001` ready, and 39 dependent items blocked. Readiness here means eligible for a separately authorized implementation task, not a running build or proof of completion.

## Product-document completeness

The owner clarified on September 9, 2026 that PRD means Project Resource Document. Its completeness concerns settled product design, behavior, scope, and capability targets. Missing runnable tests, test software, or verification procedures do not make the PRD incomplete. Implementation readiness and evidence remain separate concerns governed by the build instructions.

## Preserved foundation for implementation

- [Release 1](../docs/releases/release-1.md), accepted ADRs, the [module map](../docs/architecture/repository-map.md), domain vocabulary, and product knowledge remain the requirements and design inputs.
- [BUILD.md](../BUILD.md), the [development contract](../docs/development.md), the [bootstrap baseline](../docs/implementation/bootstrap-baseline.md), and [agent orchestration](../docs/implementation/agent-orchestration.md) define the future reading and implementation path.
- Agent tooling remains outside the repository. Docket contains no skill packages or project-specific skill-routing policy. Sol-only settings are retained, and obsolete Luna profiles are removed.
- The curated source in `raw/` and the Obsidian junction remain intact. See [[repository-navigation]] and [[project-context]].

## Historical evidence

The [previous-build archive](../docs/archive/previous-build/README.md) retains superseded reports and implementation notes. Earlier entries in [[log]] describe that removed implementation. Their passing checks and done statuses do not apply to this reset checkout.

## Implementation issue setup proposal

On September 18, 2026, the owner requested recommendations for preparing implementation issues before choosing the setup approach. The [issue setup proposal](../docs/implementation/issue-setup-proposal.md) recommends auditing all 40 objectives, splitting oversized objectives into bounded runnable children, and synchronizing GitHub issues with the authoritative graph. This recommendation is not yet an accepted decomposition.

The GitHub connector returned no open issues for `Cooper2Rich/Docket` during the audit. The installed external queue runner needs reconciliation with Docket's high-reasoning, no-coding-subagents, concise-output, graph-selection, and CI-evidence requirements. Its existing receipt validation is useful but does not independently ensure that every expected criterion was reported. The proposal records those findings and the bootstrap, review, and coverage work required before execution.

No GitHub issues were published and no graph status, application implementation, or external runner was changed. The [Release 1 PRD](../docs/releases/release-1.md) retains its product-only boundary; detailed verification belongs in engineering issue contracts.

## Next concrete objective

The owner selects an issue-setup approach from the proposal, then the selected setup is completed and audited. Only after an explicit build request may the first eligible foundation leaf run under the Sol-only orchestration contract and collect fresh implementation evidence.
