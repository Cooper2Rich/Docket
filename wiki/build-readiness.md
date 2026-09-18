# Build readiness

## Current state

On September 9, 2026, the owner requested deletion of the existing implementation and organization of the requirements and build instructions, without building Docket. Application code, tests, generated contracts, migrations, CI implementation, deployment configuration, dependency installations, caches, and run output have been removed. No application command exists.

The [work graph](../docs/implementation/work-graph.yaml) contains 40 unchanged objectives: zero done, `R1-FND-001` ready, and 39 dependent items blocked. Readiness here means eligible for a separately authorized implementation task, not a running build or proof of completion.

## Product-document completeness

The owner clarified on September 9, 2026 that PRD means Project Resource Document. Its completeness concerns settled product design, behavior, scope, and capability targets. Missing runnable tests, test software, or verification procedures do not make the PRD incomplete. Implementation readiness and evidence remain separate concerns governed by the build instructions.

## Preserved foundation for implementation

- [Release 1](../docs/releases/release-1.md), accepted ADRs, the [module map](../docs/architecture/repository-map.md), domain vocabulary, and product knowledge remain the requirements and design inputs.
- [BUILD.md](../BUILD.md), the [development contract](../docs/development.md), the [bootstrap baseline](../docs/implementation/bootstrap-baseline.md), and [skill routing](../docs/implementation/skill-routing.md) define the future reading and implementation path.
- The repository-owned Ralph instructions and launcher tooling remain in `.agents/skills/ralph-loop/`; strict review instructions now share that skill directory. Sol-only settings are retained, and obsolete Luna profiles are removed.
- The curated source in `raw/` and the Obsidian junction remain intact. See [[repository-navigation]] and [[project-context]].

## Historical evidence

The [previous-build archive](../docs/archive/previous-build/README.md) retains superseded reports and implementation notes. Earlier entries in [[log]] describe that removed implementation. Their passing checks and done statuses do not apply to this reset checkout.

## Next concrete objective

Only after the owner asks to build, implement `R1-FND-001` through the repository-owned Sol/Ralph workflow, create its required workspace and verification commands, and collect fresh evidence. This organization task does not start that work.
