---
name: Implementation leaf
about: Propose one bounded Release 1 vertical slice for graph inclusion
title: "[R1-…] "
labels: "release:r1,kind:implementation,status:blocked"
---

Use this form for a proposed contract change. The synchronized graph and manifest must include the issue before Ralph can execute it.

## Identity and outcome

Stable ID, parent group, module owner, milestone, one observable outcome and full vertical scope.

## Sources and prerequisites

Exact current source sections/ADRs, Release 1 requirement IDs, completed leaf dependencies, external gates and available inputs.

## Affected contracts

Commands/queries, schemas, tables/migrations, events, errors, audiences, routes/UI states, workers and applicable risks. Explain inapplicable categories.

## Acceptance criteria

- `<ID>/AC-01`: actor/context, input, action and observable expected result.
- Include applicable denial, stale, duplicate, race, rollback, delivery, privacy, retention and accessibility behavior.

## Verification

Exact root command, introducing dependency, real fixture/environment, expected nonempty result, evidence path and acceptance-ID mapping. Manual/environment evidence remains explicit.

## Completion

One PR, exact-head checks and independent review, verified integration, synchronized graph/roadmap/trace and durable wiki checkpoint. No issue closure from a marker alone. Link the generated contract hash after synchronization.
