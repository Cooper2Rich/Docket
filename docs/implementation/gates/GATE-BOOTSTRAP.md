# GATE-BOOTSTRAP: Choose a protected foundation integration policy

Type: decision/external gate; not a Ralph implementation item.

## Observed blocker

The existing contract requires all eleven checks before any main merge, but foundation leaves create those checks. No exception has been approved.

## Required resolution

Recommended decision: authorize a temporary protected bootstrap integration branch with one reviewed PR per foundation leaf and stage-available nonempty checks, then require the complete eleven-check suite and review before one promotion to main. Decide explicitly whether locally integrated bootstrap leaves may satisfy foundation dependencies before that promotion. Alternative: consolidate foundation into one bounded bootstrap item only if its scope can fit. Record the approved transition, branch, exact checks, completion semantics and sunset in the engineering contract; update the launcher and fixture tests before resolving this gate.

## Evidence and closure

Attach the actual decision or read-back evidence, update the engineering contract and graph in a reviewed change, and verify the launcher accepts that exact resolution. Closing this issue alone does not resolve the gate.

Directly gates: R1-FND-001-A.
