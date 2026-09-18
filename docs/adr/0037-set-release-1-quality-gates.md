# Set quantitative Release 1 quality gates

Status: accepted

Release 1 will be verified against an initial reference load of 100 simultaneous active tournaments, 20,000 authenticated sessions, 1,000 aggregate requests per second, and 100 tournament-critical writes per second for 30 minutes plus a five-minute two-times burst. The accepted latency, queue, availability, recovery, security, accessibility, state-transition, authorization, and data-integrity thresholds live in the Release 1 Quality Gates and may change only through documented review based on measured production evidence.

## Consequences

Release is blocked by failure of the reference profile, contract drift, loss of authoritative data, duplicate competitive outcomes, untested state transitions or authorization cells, an undrained post-burst queue, or unaccepted critical/high security or serious/critical accessibility findings. Global line coverage is informational and cannot substitute for behavior and authority coverage.
