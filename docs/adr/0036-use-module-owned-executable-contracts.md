# Use module-owned executable contracts

Status: accepted

Each Docket domain module will own the TypeBox and TypeScript definitions for its commands, queries, outcomes, events, errors, authorization cells, and state transitions, while its PostgreSQL migrations and constraints own persisted structure and database invariants. OpenAPI, JSON Schema, clients, matrices, diagrams, and readable contract documentation are generated and drift-checked views; versioned golden vectors and a traceability manifest connect the accepted Release 1 requirements to executable verification without creating a second hand-edited source of truth.

## Consequences

Generated artifacts are checked in but never hand-edited. An untraced requirement, untested state transition or authorization cell, generated diff, incompatible schema change, or missing stored-payload migration blocks CI. Breaking HTTP or durable-event changes require a new major contract, while stored payload changes require an explicit migration or upcaster.
