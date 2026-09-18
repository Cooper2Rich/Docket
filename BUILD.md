# Docket Build Guide

Read [AGENTS.md](AGENTS.md) and [wiki/index.md](wiki/index.md) first. This file routes future implementation; it does not authorize a build.

## Current state

The owner requested removal of the prior implementation on September 9, 2026. The repository contains specifications and build tooling only. No application command exists. The work graph has been reset: `R1-FND-001` is the sole ready item and all 39 dependent items are blocked. Earlier passing tests and completion records describe the removed build and cannot establish completion now.

## Source authority

Sources have authority by subject, not merely by modification date:

1. `AGENTS.md` governs agent conduct and repository operations.
2. The current accepted release specification is the Project Resource Document (PRD): it governs included product behavior, design, capability targets, and non-goals. Testing methodology and implementation evidence remain separate engineering concerns and are not PRD completeness criteria.
3. Accepted ADRs govern architectural decisions and hard-to-reverse technical constraints.
4. Versioned schemas, migrations, and tests demonstrate conformance. They cannot silently override an accepted release specification or ADR.
5. `wiki/` integrates and explains durable knowledge but does not silently supersede an accepted release specification or ADR.
6. `raw/` is immutable evidence. `.reference/` is nonnormative competitive research and must not be treated as a source of Docket requirements.

A conflict among normative sources blocks implementation until a tracked change explicitly reconciles or supersedes it. Recency alone never resolves a conflict.

## Accepted contracts

- Contract: [Release 1](docs/releases/release-1.md)
- Architecture: [ADR 0029](docs/adr/0029-use-clerk-for-managed-authentication.md), [ADR 0031](docs/adr/0031-start-with-a-modular-typescript-monolith.md), [ADR 0032](docs/adr/0032-adopt-the-initial-application-stack.md), [ADR 0033](docs/adr/0033-use-server-rendered-react-for-the-web-application.md), [ADR 0034](docs/adr/0034-deploy-release-1-on-aws.md), [ADR 0035](docs/adr/0035-organize-the-monolith-by-deep-domain-modules.md), and [ADR 0036](docs/adr/0036-use-module-owned-executable-contracts.md)
- Repository map: [docs/architecture/repository-map.md](docs/architecture/repository-map.md)
- Executable contracts: [docs/contracts/executable-contracts.md](docs/contracts/executable-contracts.md)
- Product capability targets: [docs/quality/release-1-gates.md](docs/quality/release-1-gates.md)
- Work graph: [docs/implementation/work-graph.yaml](docs/implementation/work-graph.yaml) with [readable roadmap](docs/implementation/work-graph.md)
- Agent orchestration: [docs/implementation/agent-orchestration.md](docs/implementation/agent-orchestration.md)
- Development contract: [docs/development.md](docs/development.md)
- Product experience: [docs/product/experience-contract.md](docs/product/experience-contract.md), including the mandatory pinned shadcn/ui foundation
- Operations: [docs/operations/release-1.md](docs/operations/release-1.md)
- CI and branch protection: [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md)
- Build-readiness audit: [wiki/build-readiness.md](wiki/build-readiness.md)


## Future implementation procedure

1. Wait for an explicit request to build. Select the lowest-order ready item from [work-graph.yaml](docs/implementation/work-graph.yaml), then read its complete inputs and acceptance evidence.
2. Follow [skill routing](docs/implementation/skill-routing.md) and [Sol-only orchestration](docs/implementation/agent-orchestration.md). Use the repository-owned Ralph skill for one bounded item, with GPT-5.6 Sol at high reasoning.
3. For the first foundation item, consult the [bootstrap baseline](docs/implementation/bootstrap-baseline.md), accepted module map, development contract, and frontend contract. Create and verify the workspace and its command seams as that item's work.
4. Run only the evidence available at that stage. Later contract generators, migrations, infrastructure, and full-release checks are requirements to implement, not existing executable tools.
5. Mark an item done only with fresh evidence from the new implementation, synchronize the graph and roadmap, and checkpoint the wiki. Generate traceability when its foundation exists.

The reserved commands and prerequisites are defined once in [docs/development.md](docs/development.md). Their presence in documentation does not mean they can currently run.

## Historical records

The [reset record and previous-build archive](docs/archive/previous-build/README.md) explain removed artifacts and preserve old evidence. Read that archive only for a specific historical question, not to select work or infer current implementation.
