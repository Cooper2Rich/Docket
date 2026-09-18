# Implementation skill reading path

Status: build instructions; no implementation is authorized by this document.

## Every task

Read [AGENTS.md](../../AGENTS.md), [wiki/index.md](../../wiki/index.md), and [BUILD.md](../../BUILD.md). For implementation, select one item from [work-graph.yaml](work-graph.yaml), inspect its dependencies, and read its named inputs. Resolve `ADR-NNNN` inputs to the matching file in `docs/adr/`. Read [CONTEXT.md](../../CONTEXT.md) for terminology and the [module map](../architecture/repository-map.md) for ownership.

The release specification governs included behavior. ADRs govern architecture. Product wiki pages explain those decisions. The YAML graph governs work status; its Markdown roadmap must agree. Current state is a specification-only reset, with `R1-FND-001` ready for a separately requested build.

## Skill selection

| Need | Skill and project-specific routing |
| --- | --- |
| Implement a bounded item | Use [repository Ralph](../../.agents/skills/ralph-loop/SKILL.md) and [orchestration](agent-orchestration.md). Preserve Sol at high reasoning, one item per run, and disabled coding subagents. |
| Review or edit the PRD | In Docket, PRD means Project Resource Document. Start with [Release 1](../releases/release-1.md) and its product-design sources. Assess scope, behavior, design decisions, and capability targets. Do not apply the installed `prd` skill's runnable-test or Ralph-readiness requirements to this document. |
| Prepare a bounded implementation item | Use the work graph and [Work Item Contract](work-item-contract.md). Any later engineering verification plan belongs with the implementation item, outside the Project Resource Document. |
| Design or test an interface | Use installed `codebase-design` and, when requested, `tdd`. Consult accepted module interfaces, adapters, domain terms, and the item's evidence before introducing a new seam. |
| Review implementation | Use [strict review](../../.agents/skills/thermo-nuclear-code-quality-review/SKILL.md) when requested. Review standards and the selected item's behavior within the Sol-only workflow. The generic `code-review` assumptions about parallel subagents and an issue-tracker file do not override repository instructions. |
| Diagnose a failure | Use installed `diagnosing-bugs` against the current item and preserve the exact failing evidence. |
| Update agent instructions | Use installed `writing-for-agents`; retain one clear authority and conditional pointers rather than duplicate specifications. |

Repository-owned skills live together under `.agents/skills/`. Other named skills are installed user skills, not copied into this repository. Read their actual instructions before use; this routing table does not replace them.

## Completion and handoff

Follow the [Work Item Contract](work-item-contract.md). Create fresh item evidence under `docs/implementation/evidence/` during a future build. Recreate generated artifacts only through the implemented generator. Old archived evidence never counts toward a new item's completion. A failed or blocked item stops the sequence.

In Obsidian, follow the same source files through `Docket/README` and `Docket/wiki/index`. Keep Docket Markdown inside the repository so agent filesystem reads and vault links refer to the same documents.
