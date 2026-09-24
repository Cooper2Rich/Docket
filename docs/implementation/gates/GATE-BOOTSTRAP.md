# GATE-BOOTSTRAP: Protected foundation integration policy

Type: resolved decision/external gate; not a Ralph implementation item.

## Observed blocker

The existing contract requires all eleven checks before ordinary main integration, while the foundation leaves create those checks.

## Required resolution

Use protected `codex/release-1-bootstrap` for `R1-FND-001-A` through `R1-FND-005-A`, one PR each, with strict current-head `Bootstrap / Verify`, required pull requests and conversations, administrator enforcement, no force/deletion or bypass, and zero GitHub approvals under the owner-approved single-account controller-evidence policy. Protected bootstrap integration satisfies foundation dependencies. `R1-FND-005-B` promotes the exact completed branch to fully checked `main` and sunsets the exception.

## Evidence and closure

The graph resolution and live controller/read-back evidence must agree; closing this issue alone never resolves drift.

Directly gates: R1-FND-001-A.
