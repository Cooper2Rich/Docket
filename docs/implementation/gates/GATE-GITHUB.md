# GATE-GITHUB: Enable and verify protection for the private repository

Type: decision/external gate; not a Ralph implementation item.

## Observed blocker

On 2026-09-18 both ruleset and main-protection reads returned HTTP 403 with the GitHub plan-upgrade/private-repository restriction.

## Required resolution

Repository owner supplies a plan/account arrangement supporting private-repository protection. Keep the repository private. Read back all exact checks, strict up-to-date branches, one current-head approval, stale-review dismissal, administrator enforcement, no force/deletion and no bypass. Do not buy a plan or relax policy automatically.

## Evidence and closure

Attach the actual decision or read-back evidence, update the engineering contract and graph in a reviewed change, and verify the launcher accepts that exact resolution. Closing this issue alone does not resolve the gate.

Directly gates: R1-FND-005-B.
