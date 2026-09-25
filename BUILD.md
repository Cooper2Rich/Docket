# Docket Build Guide

Read [AGENTS.md](AGENTS.md) and [wiki/index.md](wiki/index.md) first. This file routes implementation; build authorization is recorded in the work graph and launch guide.

## Current state

The owner requested removal of the prior implementation on September 9, 2026. On September 23 the owner authorized the build, approved the protected bootstrap policy, and made the repository public so protection could be enforced. `R1-FND-001-A` through `R1-FND-005-A` are integrated into the protected bootstrap branch. `R1-FND-005-B` now has an executable fail-closed policy for exact `main` protection read-back, current-head required checks, the one-time exact-bootstrap promotion, post-merge ancestry, and idempotent completion, with a controller-prepared candidate transition. That branch-local proposal is not completion: a reviewable PR, final-head evidence, all eleven protected `main` checks, and controller-verified integration are still required. The September 18 option-B setup preserves 40 objectives as tracking groups and defines 115 implementation leaves plus eight decision/external gates. Earlier passing tests and completion records describe the removed build and cannot establish completion now.

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
- Issue setup: [source audit](docs/implementation/source-audit.md), [verification protocol](docs/implementation/verification-protocol.md), [GitHub mapping](docs/implementation/github-issues.json), and [launch guide](docs/implementation/launch-guide.md)
- Agent orchestration: [docs/implementation/agent-orchestration.md](docs/implementation/agent-orchestration.md)
- Development contract: [docs/development.md](docs/development.md)
- Product experience: [docs/product/experience-contract.md](docs/product/experience-contract.md), including the mandatory pinned shadcn/ui foundation
- Operations: [docs/operations/release-1.md](docs/operations/release-1.md)
- CI and branch protection: [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md)
- Build-readiness audit: [wiki/build-readiness.md](wiki/build-readiness.md)


## Implementation procedure

1. Select the lowest-order ready item from [work-graph.yaml](docs/implementation/work-graph.yaml), then read its complete inputs and acceptance evidence. The September 23, 2026 owner instruction authorizes the Release 1 queue.
2. Follow [Sol-only orchestration](docs/implementation/agent-orchestration.md) for one bounded item with GPT-5.6 Sol at high reasoning.
3. For the first foundation item, consult the [bootstrap baseline](docs/implementation/bootstrap-baseline.md), accepted module map, development contract, and frontend contract. Create and verify the workspace and its command seams as that item's work.
4. Run only the evidence available at that stage. Later contract generators, migrations, infrastructure, and full-release checks are requirements to implement, not existing executable tools.
5. Mark an item done only with fresh evidence and verified protected integration, synchronize the graph and roadmap, and checkpoint the wiki. Generate traceability when its foundation exists. Foundation leaves use the protected bootstrap branch and `Bootstrap / Verify`; `R1-FND-005-B` promotes to fully checked `main`.

The reserved commands and prerequisites are defined once in [docs/development.md](docs/development.md). Their presence in documentation does not mean they can currently run.

## Historical records

The [reset record and previous-build archive](docs/archive/previous-build/README.md) explain removed artifacts and preserve old evidence. Read that archive only for a specific historical question, not to select work or infer current implementation.
