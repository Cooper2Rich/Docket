# Documentation map

Start with [BUILD.md](../BUILD.md). Read only the documents governing the selected task, then follow their evidence and domain links.

For product design, PRD means **Project Resource Document**. Start with [Release 1](releases/release-1.md), the domain wiki, the experience contract, and capability targets. Testing procedures and implementation evidence belong to the separate engineering documents; they are not PRD completeness criteria.

| Question | Authoritative entry point |
| --- | --- |
| What must Release 1 do? | [Release 1 requirements](releases/release-1.md) |
| What happened in the canceled PRD refinement session? | [PRD refinement direction and question ledger](releases/prd-refinement.md) |
| How should a future release be questioned and shaped into a PRD? | [Future PRD question lines](releases/future-prd-questions.md) |
| What do domain terms mean? | [CONTEXT.md](../CONTEXT.md) and [wiki index](../wiki/index.md) |
| Which architecture and ownership rules apply? | [Repository map](architecture/repository-map.md), with its ADR links |
| What did source-level Tabroom architecture research establish? | [Tabroom architecture investigation](research/tabroom-architecture-investigation.md) |
| What capacity and workload would a Tabroom data migration require? | [Tabroom data clone capacity and workload](research/tabroom-data-clone-capacity-and-workload.md) |
| What schemas, migrations, and generated outputs must exist? | [Executable contracts](contracts/executable-contracts.md) |
| What should the user experience be? | [Experience contract](product/experience-contract.md) |
| What capacity, reliability, and integrity must the product provide? | [Capability targets](quality/release-1-gates.md) |
| How will the system run and recover? | [Operations contract](operations/release-1.md) and [CI requirements](operations/github-branch-protection.md) |
| How should implementation be orchestrated? | [Agent orchestration](implementation/agent-orchestration.md) |
| What is the next bounded item? | [YAML work graph](implementation/work-graph.yaml), [readable roadmap](implementation/work-graph.md), and [item contract](implementation/work-item-contract.md) |
| How should the workspace be recreated? | [Development contract](development.md) and [preserved bootstrap inputs](implementation/bootstrap-baseline.md) |
| What happened to the previous code? | [Historical archive](archive/previous-build/README.md) |

`adr/` records accepted and superseded decisions; read each decision's status. The original source is preserved under `raw/`, and product knowledge is integrated in `wiki/`. Historical build reports do not override current specifications or work status.
