# Work Item Contract

Status: accepted

The Release 1 work graph is the authoritative implementation queue. Its YAML source is machine-readable; the Markdown roadmap is a generated or mechanically synchronized view.

## Selection rule

An agent selects the lowest-order `ready` item. An item is `ready` only when every dependency is `done`, its governing decisions and requirement links resolve, its named inputs exist, and no contradiction affects its scope. If more than one item is ready, the lower numeric order wins unless the graph explicitly declares a safe parallel group.

Starting a blocked item or a later lifecycle capability because it appears easier is prohibited. Discovery of a missing material decision changes the item to `blocked`, records the exact question, and prevents implementation inference.

## Status vocabulary

- `blocked` - a dependency, required artifact, decision, or authority is missing
- `ready` - every prerequisite exists and the item is the next eligible implementation unit
- `in_progress` - one active implementation owns the item
- `verification` - implementation is complete and its named evidence is running or awaiting review
- `done` - every required artifact and acceptance check passes and traceability is current

No other status is valid. Commentary, percentage completion, and optimistic labels do not replace the state.

## Required fields

Every item records:

- stable ID and topological order;
- title, objective, owning module, and dependencies;
- governing Release 1 requirement IDs and evidence links;
- explicit inputs and outputs;
- commands, queries, runtime schemas, tables, durable events, stable errors, and audiences created or changed;
- security, privacy, concurrency, migration, delivery, accessibility, performance, and operational risks applicable to the slice;
- exact local and CI evidence required for completion; and
- current status and any blocking reason.

The graph may point to a more detailed item specification, but that file becomes part of the item and cannot contradict or omit these fields.

## Vertical-slice rule

A work item includes every layer necessary to make its behavior usable and verifiable: module interface and implementation, runtime contracts, migration and constraints, adapters, API, required worker behavior, required web route and states, telemetry, fixtures, documentation, and tests. A backend-only implementation is incomplete when the item promises a Release 1 user journey; a UI mock is incomplete without the authoritative interface.

## Size rule

One item must fit one bounded Codex implementation session and one reviewable change. If implementation evidence shows otherwise, split it before work continues, preserve the original ID as a non-runnable group, and add ordered child IDs with complete fields. Splitting scope cannot remove requirements or acceptance evidence.

## Done rule

An item becomes `done` only when:

1. every declared output exists;
2. every named local and CI check passes;
3. migrations and generated artifacts are deterministic and clean;
4. required positive, negative, stale, duplicate, rollback, accessibility, security, and failure-path evidence passes;
5. the traceability manifest maps every affected requirement and artifact;
6. documentation and the readable roadmap match the YAML graph; and
7. no unresolved decision or unowned follow-up remains inside the item's accepted objective.
