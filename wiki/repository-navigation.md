# Repository navigation

## One source tree for agents and Obsidian

The repository is the canonical Docket document tree. `C:\Coding Vault\Docket` is its existing Obsidian junction. Agent filesystem reads and Obsidian links reach the same files. The vault home and index link directly to this tree.

Read [README.md](../README.md), [AGENTS.md](../AGENTS.md), [[index]], and [BUILD.md](../BUILD.md). The [documentation map](../docs/README.md) answers which specification to read for a particular concern, and [agent orchestration](../docs/implementation/agent-orchestration.md) defines the implementation workflow.

## Organization

| Layer | Location | Editing rule |
| --- | --- | --- |
| Agent entry points | Root README, AGENTS, BUILD, CONTEXT | Keep navigation, source authority, and terminology explicit. |
| Product and build specifications | `docs/` | Preserve accepted requirements and ADR status; change decisions explicitly. |
| Integrated domain knowledge | `wiki/` | Read this index first, update affected pages, and append to [[log]]. |
| Curated evidence | `raw/` | Existing sources remain immutable. |
| Agent configuration | `.codex/config.toml` | Sol at high reasoning, coding subagents disabled. |
| Superseded implementation evidence | `docs/archive/previous-build/` | Historical only; excluded from routine build discovery. |

## Current implementation boundary

This is a specification-only repository after the September 9, 2026 reset. No application, test suite, generated contract tree, package manifest, dependency installation, or application command remains. The [module map](../docs/architecture/repository-map.md) describes future paths rather than existing code. [[build-readiness]] records the reset status; the [work graph](../docs/implementation/work-graph.yaml) is authoritative for item selection.

Use repository-scoped searches over `docs/`, `wiki/`, and `CONTEXT.md`. Agent tooling remains outside Docket. Read historical reports only for an explicit history question. No reinstallation, scaffolding, test execution, deployment, or Ralph run is part of this cleanup.
