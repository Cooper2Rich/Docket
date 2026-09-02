---
status: accepted
---

# Use TypeScript across Docket

Docket will ultimately be implemented in TypeScript across the backend and participant-facing application. Current domain contracts, validation schemas, tournament calculation modules, integrations, tests, and administrative tools should be designed for direct TypeScript implementation.

## Consequences

- Backend and UI contracts can share TypeScript-oriented domain vocabulary and generated or shared types where ownership boundaries permit.
- Deterministic pairing, scheduling, standings, advancement, and result calculations should use explicit typed inputs, version identifiers, and reproducible outputs.
- TypeScript static types do not validate untrusted runtime data.
- API requests, uploads, webhooks, imported files, and persisted version payloads require runtime validation before they become domain objects.
- Type assertions cannot substitute for parsing and validation at a trust boundary.
- The specific TypeScript framework, runtime, database, deployment platform, and repository architecture remain separate decisions.
