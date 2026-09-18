# Release 1 implementation issue setup report

September 18, 2026. Owner-selected option B is complete: the full issue queue is published and verified, and the external launcher is installed and fixture-tested. Application implementation has not started. Zero implementation leaves are ready or done.

[Draft setup PR](https://github.com/Cooper2Rich/Docket/pull/164). Browse the [Release 1 issue queue](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue+label%3Arelease%3Ar1), [roadmap](work-graph.md), [source audit](source-audit.md), [machine-readable evidence](setup-evidence.json), and [future launch procedure](launch-guide.md).

## Delivered structure

| Artifact | Verified result |
| --- | --- |
| Runnable implementation contracts | 115 leaves with 460 acceptance IDs |
| Preserved original objectives | 40 non-runnable tracking groups |
| Decision and external gates | 8 separate issues |
| Total published issues | 163, all open and blocked |
| Native parent relationships | 115, read back from GitHub |
| Native blocking relationships | 122, read back from GitHub |
| Milestones | 8 thematic stages |
| Source audit | 2,201 classified clauses across 63 sources; no unclassified clauses |
| Setup verification | 39 passing controller/fake-worker tests; 357 relative file links checked |

Each leaf carries source references, dependencies, scope, boundary and failure cases, stable acceptance IDs, exact verification commands and prerequisites, evidence obligations, and integration/handoff rules. The YAML graph determines execution order; milestones group capabilities. GitHub bodies and native relationships were compared against the local contracts. The mapping records exact issue IDs and body digests.

Source ownership is not executed application-test coverage. Commands named in the specifications are future implementation obligations. No application commands or real Codex worker ran; the Release 1 Project Resource Document and curated raw sources are unchanged.

## Launcher behavior and validation

The installed Docket controller invokes GPT-5.6 Sol with high reasoning, disables implementation subagents, runs one bounded leaf with a 20-iteration limit, and keeps detailed events in local run files. It stops on the first unresolved prerequisite, incomplete evidence, changed source/issue contract, failed required check, or exhausted worker budget.

Completion requires the complete independently captured criterion/check set, actual evidence artifacts, checks and nonauthor approval for the exact PR head, protected integration, and verified merge ancestry. Interrupted completion can reconcile the merged revision and issue state without reimplementing the leaf. A worker completion marker cannot close the issue or advance the queue by itself.

The 39 tests exercise graph selection and blocker handling, omitted/skipped evidence, stale heads/contracts, invalid candidate graph changes, PR review/check boundaries, process failure stops, repeat reconciliation, and real PowerShell/native-command argument forwarding with a fake Codex worker. These do not establish live provider access, real application correctness, or a supported bootstrap policy.

All launcher code, tests, generators, API payloads and local skill changes remain outside the Docket repository. Installed tool hashes and runtime details are in the evidence record. The controller currently expects the documented branch-protection API representation; a ruleset-only equivalent needs an explicitly reviewed implementation and fixtures.

## Decisions and external prerequisites

| Gate | Required resolution |
| --- | --- |
| [Foundation integration #41](https://github.com/Cooper2Rich/Docket/issues/41) | Approve protected bootstrap integration, the exact checks available at each stage, dependency-completion semantics, and promotion to fully checked main; implement and fixture-test that policy. |
| [Private-repository protection #42](https://github.com/Cooper2Rich/Docket/issues/42) | Provide an account/plan arrangement that supports required protection, then read back the actual rules. Current API reads return HTTP 403 with a plan-upgrade requirement. |
| [LD Ruleset #43](https://github.com/Cooper2Rich/Docket/issues/43) | Supply the adopted organization, edition, authoritative corpus and adoption evidence. |
| [Assessment provider #44](https://github.com/Cooper2Rich/Docket/issues/44) | Supply the real provider contract/access and accepted scoring policy. |
| [Independent review #45](https://github.com/Cooper2Rich/Docket/issues/45) | Arrange independent current-head review throughout implementation and actual manual accessibility evidence at the release gate. |
| [Environments #46](https://github.com/Cooper2Rich/Docket/issues/46) | Supply authorized deployment environments, provider access, operators, quotas and secrets through their proper channels. |
| [Production decision #47](https://github.com/Cooper2Rich/Docket/issues/47) | Approve or reject the exact release candidate after required evidence exists. |
| [Closed attribution correction #48](https://github.com/Cooper2Rich/Docket/issues/48) | Decide the precise actor, deadline and scope for mistaken represented-School corrections after Closure. The No-Show exception is not a general write permission. |

The recommended next decision is the protected bootstrap branch described in #41, paired with resolving #42. No plan purchase, visibility change, protection bypass, bootstrap exception or production approval occurred during setup.

After those immediate gates are resolved and the setup is reviewed and integrated, use a clean current-main checkout and explicitly authorize the application build. The [launch guide](launch-guide.md) contains exact read-only and future execution commands. The current read-only plan correctly stops at `R1-FND-001-A` / `GATE-BOOTSTRAP`.

## Change provenance and maintenance

The review branch preserves pre-existing specification-only documentation changes and repository-local skill removals in a separate first commit, followed by the option-B queue/setup commit. The original checkout, staged index and unrelated working-tree content are preserved. The Obsidian junction still points to this repository.

Keep the setup branch available because published issue source links point there. Moving those links to an immutable revision requires deliberate body/contract synchronization. Reconcile legitimate source or issue changes before a run; drift is a blocker. Do not rerun the initial generator over an activated graph. If a leaf proves too large for one bounded run and one reviewable change, split it while preserving its acceptance coverage before proceeding.
