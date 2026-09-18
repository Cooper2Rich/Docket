# Docket

Docket is a speech and debate tournament system. This repository currently contains its requirements, architecture, domain knowledge, and build instructions. Application implementation was removed at the owner's request on September 9, 2026. No application command exists, and this cleanup does not authorize a build.

## Start here

1. [AGENTS.md](AGENTS.md) — repository rules and operating constraints.
2. [Wiki index](wiki/index.md) — product and domain knowledge map.
3. [BUILD.md](BUILD.md) — source authority, future build procedure, and current state.
4. [Release 1 requirements](docs/releases/release-1.md) — accepted product scope and requirement identifiers.
5. [Work graph](docs/implementation/work-graph.md) — dependency-ordered implementation plan; its YAML is authoritative.

## Where things belong

| Location | Purpose |
| --- | --- |
| [docs/](docs/README.md) | Requirements, ADRs, architecture, quality gates, operations, and implementation instructions. |
| [wiki/](wiki/index.md) | Linked domain knowledge and durable decisions. |
| `raw/` | Immutable curated sources. |
| [CONTEXT.md](CONTEXT.md) | Canonical domain vocabulary. |
| `.codex/` | Sol-only agent settings. |
| [docs/archive/previous-build/](docs/archive/previous-build/README.md) | Superseded evidence from the removed implementation; historical reference only. |

Future application locations are specified by the [repository and module map](docs/architecture/repository-map.md). Those folders will be created only when implementation is requested.

## Obsidian

The existing junction at `C:\Coding Vault\Docket` exposes this repository to Coding Vault. Open `Docket/README` for this start page and `Docket/wiki/index` for the knowledge map. Docket documents stay here; the vault links to them instead of maintaining another copy.
