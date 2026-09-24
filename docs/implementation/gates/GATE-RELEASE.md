# GATE-RELEASE: Record owner approval of the exact production candidate

Type: decision/external gate; not a Ralph implementation item.

## Observed blocker

No production build or deployment is authorized by issue setup.

## Required resolution

When all required evidence exists, obtain the authorized go/no-go for the exact immutable artifact, environment, window and operating coverage. A release approval never covers a later changed candidate.

## Evidence and closure

The graph resolution and live controller/read-back evidence must agree; closing this issue alone never resolves drift.

Directly gates: R1-REL-003-B.
