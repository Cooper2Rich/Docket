# Reference Sources

Reference material is nonnormative competitive research. It may reveal workflows worth investigating, but it never establishes a Docket requirement, domain term, data model, interface, security rule, or acceptance criterion. An agent may consult it only when a task explicitly asks for comparison or legacy research and must validate any resulting proposal through Docket's ordinary decision process.

## Tabroom legacy

- Upstream: `https://github.com/speechanddebate/tabroom.git`
- Inspected revision: `b3a71a065f36cab222e55521b8827a1ed829bca9`
- License reported by the source: Reciprocal Public License 1.5
- Purpose: production-era storage, data-access, workflow, and compatibility research only
- Authority: nonnormative; not an implementation dependency or schema contract

## Tabroom v4

- Former local path: `.reference/Tabroomv4` (removed during the September 9, 2026 reset)
- Former archive: `.reference/tabroom-v4.tar` (removed during the same reset)
- Upstream: `https://github.com/speechanddebate/Tabroomv4.git`
- Captured revision: `0fe17ddafca242ddd9c5e2688b93dc9e443696ee`
- Archive SHA-256: `546B1385336AC7B5F5754D37BD22E8218067C2861150E94F4A88494A07E469DF`
- License reported by the source: Reciprocal Public License 1.5
- Purpose: competitive and workflow research only
- Authority: nonnormative; explicitly excluded from routine Docket searches and implementation inference

The owner-requested code cleanup removed the local comparison tree and archive. This provenance record remains for any later explicitly requested research. The former reference code is not a Docket requirement or implementation template; routine build tasks use the accepted Docket specifications.

## September 12, 2026 architecture investigation

The [Tabroom architecture investigation](research/tabroom-architecture-investigation.md) inspected both pinned revisions, including source code, database definitions, models, controllers, routes, middleware, query paths, frontend integration, storage adapters, and licensing. Its findings remain competitive research. Its recommended Restructure-with-bounded-Emulation strategy agrees with existing Docket ADRs but does not amend or replace them.

The companion [Tabroom data clone capacity and workload report](research/tabroom-data-clone-capacity-and-workload.md) measures the source checkouts and checked-in test database, distinguishes cumulative identity counters from live production rows, records the absence of a production database/object inventory, and provides nonnormative storage envelopes and workload estimates. Its cloud-production recommendation confirms the accepted operations topology without modifying it.
