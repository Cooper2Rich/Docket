# Build readiness

## Current state

On September 9, 2026, the owner requested deletion of the existing implementation and organization of the requirements and build instructions, without building Docket. Application code, tests, generated contracts, migrations, CI implementation, deployment configuration, dependency installations, caches, and run output have been removed. No application command exists.

The [work graph](../docs/implementation/work-graph.yaml) preserves 40 objectives as tracking groups and defines 115 implementation leaves, 460 acceptance IDs and eight decision/external gates. Zero leaves are done or ready. `R1-FND-001-A` is first but blocked by the foundation integration decision. Readiness means eligibility for a separately authorized build, not authorization or proof of completion.

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

On September 18, 2026, the owner chose option B in the [issue setup proposal](../docs/implementation/issue-setup-proposal.md): audit and prepare the whole Release 1 queue, publish its issues and repair the external launcher. This authorizes setup, not application implementation.

The [source audit](../docs/implementation/source-audit.md) classifies 2,201 clauses from 63 sources. Detailed leaf specifications, source hashes, exact expected acceptance/check sets, staged command prerequisites and the [verification protocol](../docs/implementation/verification-protocol.md) are now generated. Source ownership is not executed application-test coverage.

The external launcher now accepts explicit reasoning, subagent-disable and quiet-output parameters. The Docket controller enforces Sol/high, one leaf, complete evidence, exact-head CI/review, protected integration and restart-safe issue reconciliation. Thirty-nine controller/fake-worker tests passed. No real Codex worker or application command ran. All 163 issues, 115 parent links and 122 blocking relationships were published and read back against the local contracts. The [setup report](../docs/implementation/setup-report.md) and [evidence record](../docs/implementation/setup-evidence.json) record the completed setup and its limits.

The [pinned issue-order index](https://github.com/Cooper2Rich/Docket/issues/165) accounts for every work issue. Its [ordered implementation view](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue%20is%3Aopen%20label%3Arelease%3Ar1%20label%3Akind%3Aimplementation%20sort%3Acreated-asc) follows steps 001–115 (#49–#163); 40 group issues and eight gate issues are non-runnable. Native child order and every dependency were rechecked. The index is a separate navigation issue and does not change graph eligibility.

## Next concrete objective

On September 23, 2026, the owner explicitly requested the application build with GPT-5.6 Sol and approved the proposed protected bootstrap branch policy: reviewed PRs with stage-available checks for foundation leaves, followed by the complete eleven-check suite and review before promotion to `main`. This approves the policy direction and build objective; it does not mark `GATE-BOOTSTRAP` resolved. The exact branch, staged checks, dependency-completion rule and sunset still need to be recorded in the engineering contract, implemented in the external controller, fixture-tested and reviewed.

The owner plans to enable a GitHub account arrangement supporting protection for this private repository and arrange an independent reviewer. Read back the actual protection after that change. The setup PR remains a draft without review or CI checks. Integrate the reviewed setup change under the approved policy, then use the [launch guide](../docs/implementation/launch-guide.md) to start the first eligible Sol/high leaf. Later gates remain attached to their affected leaves.

The authenticated GitHub API reports this repository is private and rejects both ruleset and branch-protection access with an account-plan upgrade requirement. This is an external build prerequisite; setup must not change repository visibility or weaken the required review and CI policy. A source inventory and an immutable starting-state snapshot are stored outside the repository in the local Docket setup tools directory. They distinguish setup edits from pre-existing uncommitted documentation changes.
