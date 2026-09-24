# Release 1 implementation issue setup report

Updated September 23, 2026. Owner-selected option B is complete: the full issue queue is published and verified, the external launcher is installed and fixture-tested, and the owner has activated the Release 1 build. Application implementation has not started. `R1-FND-001-A` is ready; zero implementation leaves are done.

[Setup PR](https://github.com/Cooper2Rich/Docket/pull/164). Browse the [Release 1 issue queue](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue+label%3Arelease%3Ar1), [roadmap](work-graph.md), [source audit](source-audit.md), [machine-readable evidence](setup-evidence.json), and [launch procedure](launch-guide.md).

## Delivered structure

| Artifact | Verified result |
| --- | --- |
| Runnable implementation contracts | 115 leaves with 460 acceptance IDs |
| Preserved original objectives | 40 non-runnable tracking groups |
| Decision and external gates | 8 separate issues |
| Total published issues | 163; the two resolved gate issues are closed and the first implementation leaf is ready |
| Native parent relationships | 115, read back from GitHub |
| Native blocking relationships | 122, read back from GitHub |
| Milestones | 8 thematic stages |
| Source audit | 2,202 classified clauses across 63 sources; no unclassified clauses |
| Setup verification | 42 passing controller/fake-worker tests; relative links checked by the setup validator |

Each leaf carries source references, dependencies, scope, boundary and failure cases, stable acceptance IDs, exact verification commands and prerequisites, evidence obligations, and integration/handoff rules. The YAML graph determines execution order; milestones group capabilities. GitHub bodies and native relationships were compared against the local contracts. The mapping records exact issue IDs and body digests.

Source ownership is not executed application-test coverage. Commands named in the specifications are future implementation obligations. No application commands or real Codex worker ran; the Release 1 Project Resource Document and curated raw sources are unchanged.

## Launcher behavior and validation

The installed Docket controller invokes GPT-5.6 Sol with high reasoning, disables implementation subagents, runs one bounded leaf with a 20-iteration limit, and keeps detailed events in local run files. It stops on the first unresolved prerequisite, incomplete evidence, changed source/issue contract, failed required check, or exhausted worker budget.

Completion requires the complete independently captured criterion/check set, actual evidence artifacts, exact-head checks, accepted controller-evidence review, protected integration, and verified merge ancestry. Interrupted completion can reconcile the merged revision and issue state without reimplementing the leaf. A worker completion marker cannot close the issue or advance the queue by itself.

The 42 tests exercise graph selection and blocker handling, bootstrap/promotion routing, single-owner review policy, omitted/skipped evidence, stale heads/contracts, invalid candidate graph changes, PR review/check boundaries, process failure stops, repeat reconciliation, and real PowerShell/native-command argument forwarding with a fake Codex worker. These do not establish live provider access or real application correctness.

All launcher code, tests, generators, API payloads and local skill changes remain outside the Docket repository. Installed tool hashes and runtime details are in the evidence record. The controller currently expects the documented branch-protection API representation; a ruleset-only equivalent needs an explicitly reviewed implementation and fixtures.

## Decisions and external prerequisites

| Gate | Required resolution |
| --- | --- |
| [Foundation integration #41](https://github.com/Cooper2Rich/Docket/issues/41) | Resolved: protect `codex/release-1-bootstrap` with `Bootstrap / Verify` for the first nine leaves, then promote through `R1-FND-005-B` with all eleven checks. |
| [Repository protection #42](https://github.com/Cooper2Rich/Docket/issues/42) | Resolved: the owner made the repository public and the required bootstrap/main protection is API-readable and controller-enforced. |
| [LD Ruleset #43](https://github.com/Cooper2Rich/Docket/issues/43) | Supply the adopted organization, edition, authoritative corpus and adoption evidence. |
| [Assessment provider #44](https://github.com/Cooper2Rich/Docket/issues/44) | Supply the real provider contract/access and accepted scoring policy. |
| [Accessibility review #45](https://github.com/Cooper2Rich/Docket/issues/45) | Supply actual manual accessibility evidence at the release gate; no additional GitHub account is required. |
| [Environments #46](https://github.com/Cooper2Rich/Docket/issues/46) | Supply authorized deployment environments, provider access, operators, quotas and secrets through their proper channels. |
| [Production decision #47](https://github.com/Cooper2Rich/Docket/issues/47) | Approve or reject the exact release candidate after required evidence exists. |
| [Closed attribution correction #48](https://github.com/Cooper2Rich/Docket/issues/48) | Decide the precise actor, deadline and scope for mistaken represented-School corrections after Closure. The No-Show exception is not a general write permission. |

The bootstrap and repository-protection decisions are complete. No protection bypass or production approval occurred. Remaining gates stay attached to their affected leaves.

Use a clean current checkout and the [launch guide](launch-guide.md) to start one authorized Sol/high leaf. The current read-only plan returns `R1-FND-001-A`.

## Change provenance and maintenance

The review branch preserves pre-existing specification-only documentation changes and repository-local skill removals in a separate first commit, followed by the option-B queue/setup commit. The original checkout, staged index and unrelated working-tree content are preserved. The Obsidian junction still points to this repository.

Keep the setup branch available because published issue source links point there. Moving those links to an immutable revision requires deliberate body/contract synchronization. Reconcile legitimate source or issue changes before a run; drift is a blocker. Do not rerun the initial generator over an activated graph. If a leaf proves too large for one bounded run and one reviewable change, split it while preserving its acceptance coverage before proceeding.
