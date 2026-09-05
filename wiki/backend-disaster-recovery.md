---
status: research-options-not-selected
last-reviewed: 2026-09-04
---

# Backend disaster recovery

Q10 extends the recovery intent in [[backend-implementation-proposal]] to an entire hosting-system outage while retaining a small codebase. In Q11, responding to the entire-cloud-provider outage scenario, the owner required recovery within one hour and preferred recovery in under fifteen minutes. Provider-wide unavailability is therefore in scope. No vendor, replication design, budget increase, or data-loss allowance is selected here.

Q12 accepts restoring live tournament functions first to avoid delayed rounds and lost user trust: target under fifteen minutes for live operations, with reporting and large exports restored within one hour. The owner clarified a hard $500 monthly infrastructure cap. The budget includes both primary and recovery infrastructure and recurring usage charges; recovery selection must fit that cap without weakening acknowledged-write durability.

## Failure boundary

Multi-region deployments distribute infrastructure across regions. Multicloud disaster recovery places production and recovery with different providers and adds feasibility, operational, networking, and cost considerations. **Docket inference:** another region within the same provider cannot independently cover an outage of that entire provider; recovery infrastructure and its essential dependencies must remain usable outside the failed boundary. [Google Cloud business continuity patterns](https://docs.cloud.google.com/architecture/hybrid-multicloud-patterns-and-practices/business-continuity-patterns)

Recovery point objective (RPO) describes allowable data loss; recovery time objective (RTO) describes allowable downtime. They are separate requirements. [AWS recovery concepts](https://docs.aws.amazon.com/guidance/latest/deploying-cross-region-disaster-recovery-with-aws-elastic-disaster-recovery/core-concepts.html)

## Options and tradeoffs

The following codebase assessments are Docket design judgments, not measured implementation sizes. Each option assumes recovery copies outside the covered failure boundary.

| Approach | Acknowledged-write protection | Codebase and operational tradeoff |
| --- | --- | --- |
| Independent backups and restore | Recovery reaches the latest usable backup/log copy; later acknowledged changes may be lost. | Small application change; restoration, deployment, and routing work increase downtime. |
| Asynchronous standby | Recent commits can be missing from the surviving standby. Low replication lag is not zero-loss protection. | Same application implementation; additional live database, replication monitoring, promotion, and recovery procedures. |
| Synchronous durable standby | Can preserve acknowledged commits through loss of the primary site when a required durable copy survives outside it. | Same application implementation remains possible; every protected commit depends on remote durability, adding latency and potential write unavailability. |

Backup/restore and standby are distinct recovery strategies, with different preparation and recovery costs. Replication alone does not replace historical backups against destructive changes or corruption. [AWS disaster recovery strategies](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

PostgreSQL streaming replication defaults to asynchronous operation. Synchronous replication waits for required standby acknowledgements; the network round trip increases commit latency. Losing the required standby connectivity prevents protected commits from being acknowledged until that requirement can again be met. [PostgreSQL standby replication](https://www.postgresql.org/docs/current/warm-standby.html)

With configured synchronous standbys, `synchronous_commit=on` waits for remote durable storage. `remote_write` is weaker because a standby operating-system crash can lose unflushed data. Setting `on` without synchronous standbys only ensures local durability. The success receipt must follow the protected commit; zero loss is conditional on the defined failures and surviving durable storage, not an absolute guarantee. [PostgreSQL WAL settings](https://www.postgresql.org/docs/current/runtime-config-wal.html)

## Keeping Docket small

**Design recommendation pending deployment selection:** retain one TypeScript domain implementation, one logical PostgreSQL database, and one active database writer. Deploy the same API/worker release at recovery. Keep replication and failover in managed infrastructure where supported; application code needs connection recovery, bounded retries, duplicate-command protection, and durable background jobs. Rust does not solve this availability problem.

Promotion must prevent the old primary from accepting writes. PostgreSQL requires external failure detection/promotion coordination and recommends tested procedures; running two conflicting primaries can cause data loss. [PostgreSQL failover](https://www.postgresql.org/docs/current/warm-standby-failover.html)

## One hour versus under fifteen minutes

These are product targets, not measured outcomes. The TypeScript domain code can be identical for both. The shorter target primarily requires more readiness: an independently hosted recovery deployment already running, current release and configuration, available keys, prepared routing, safe database promotion, and rehearsed recovery checks. Recovery must not depend on retrieving artifacts or controlling infrastructure through the failed provider.

One hour leaves more time for an operator to initiate recovery and for application capacity to start or scale. Under fifteen minutes favors running standby capacity and faster detection and switchover. Neither timing follows automatically from an architecture label. AWS distinguishes pilot light, which needs additional startup, from warm standby, which already runs a functional deployment. Applying this principle across providers is a Docket design inference, not an AWS cross-provider guarantee. [AWS disaster recovery strategies](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)

Added repository content is primarily deployment configuration, recovery orchestration, monitoring, and failure tests rather than duplicate tournament rules. Lines of code cannot be estimated responsibly before infrastructure selection. Managed tools can reduce custom code, but cross-provider support must be verified. Faster recovery does not relax the separate requirement to preserve every acknowledged command.

Recommended verification counts from user-visible outage onset until authorized reads and writes work at the required recovery load, including detection, promotion, routing, reconnection, and checks. Q13 selects automatic failover with an immediate Platform Administration alert when a safe switch can be verified. Recovery capacity and the concrete failover mechanism remain open.

Automatic recovery must verify the surviving copy's required durable state and prevent the former primary from accepting writes before resuming writes on the replacement. An unreachable primary alone is insufficient evidence for safe promotion. If safety cannot be established, the system must keep writes unavailable and escalate rather than silently discard acknowledged submissions or create competing writers. Alert delivery does not gate an otherwise safe switch. Recovery tests must cover false alarms, network partitions, interrupted promotion, returning former primaries, client retries, and worker resumption. The automatic-failover decision does not itself authorize automatic failback to the original host.

The under-fifteen-minute live-operations target, one-hour reporting/export recovery limit, and hard $500 monthly infrastructure cap remain unverified in combination. A deployment quote and recovery drills must establish whether these targets coexist. [AWS disaster recovery testing](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_planning_for_recovery_dr_tested.html)

The proposed fast-recovery fixture includes sessions, authorization, current schedules and Pairings, check-in, Judge assignments, Ballot submission, and calculations/publication required to advance rounds. Deferred reporting and export jobs must not consume capacity needed by those functions. This is an engineering interpretation of live tournament functions for fixture design, not a new exemption from domain rules. Infrastructure pricing must include replication traffic, logs, storage growth, monitoring, and failover operation as well as compute. Spending alerts alone do not enforce a hard cap; billing limits and bounded usage need provider-specific verification. No policy to interrupt an active tournament on reaching a billing threshold has been approved.
