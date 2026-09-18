# GATE-RELEASE: Record owner approval of the exact production candidate

Type: decision/external gate; not a Ralph implementation item.

## Observed blocker

No production build or deployment is authorized by issue setup.

## Required resolution

When all required evidence exists, obtain the authorized go/no-go for the exact immutable artifact, environment, window and operating coverage. A release approval never covers a later changed candidate.

## Evidence and closure

Attach the actual decision or read-back evidence, update the engineering contract and graph in a reviewed change, and verify the launcher accepts that exact resolution. Closing this issue alone does not resolve the gate.

Directly gates: R1-REL-003-B.
