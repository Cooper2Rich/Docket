# GATE-GITHUB: Enable and verify repository protection

Type: resolved decision/external gate; not a Ralph implementation item.

## Observed blocker

On September 23, 2026, the owner explicitly made the repository public, making branch-protection APIs available without a paid private-repository plan.

## Required resolution

Protect `main` with all eleven exact contexts, strict current-head status, required pull requests and conversations, administrator enforcement, no force/deletion or bypass, and zero GitHub approvals under the accepted single-account controller-evidence policy. Preserve public visibility unless the owner explicitly changes it.

## Evidence and closure

The graph resolution and live controller/read-back evidence must agree; closing this issue alone never resolves drift.

Directly gates: R1-FND-005-B.
