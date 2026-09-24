# Launching the prepared Release 1 queue

Status: activated. The owner authorized the Release 1 build on September 23, 2026; `R1-FND-001-A` is the first eligible leaf. No application worker is currently running.

The queue consists of 40 tracking groups, 115 implementation leaves and eight decision/external gates. Start from the [roadmap](work-graph.md), [GitHub mapping](github-issues.json), [source audit](source-audit.md) and [verification protocol](verification-protocol.md). Never pass every open GitHub issue to the generic Ralph issue runner.

## Current activation state

1. [GATE-BOOTSTRAP](gates/GATE-BOOTSTRAP.md) is resolved by the protected `codex/release-1-bootstrap` policy for the first nine foundation leaves and the `R1-FND-005-B` promotion to `main`.
2. [GATE-GITHUB](gates/GATE-GITHUB.md) is resolved: the owner made the repository public and the required protection policy is readable through GitHub's API.
3. The owner explicitly authorized application implementation with GPT-5.6 Sol at high reasoning. The queue starts with `R1-FND-001-A` and remains strictly sequential.

Later Ruleset, provider, manual accessibility, environment, attribution and production gates still stop their affected leaves. The launcher does not fabricate their resolutions. This single-owner repository uses controller evidence instead of a GitHub approval count; required human or specialist evidence remains mandatory where an acceptance or release criterion names it.

## Installed local tools

- Controller: `C:\Users\CooperRich\.codex\tools\docket-setup\docket_ralph.py`
- Generic bounded worker: `C:\Users\CooperRich\.codex\skills\ralph-loop\scripts\ralph-loop.ps1`
- Source/spec generator and publisher: `generate_queue.py` and `publish_queue.py` in the same external setup directory.
- Offline controller and fake-process tests: `test_docket_ralph.py` in that directory.
- The controller uses the bundled Python runtime, its external PyYAML dependency, Git, authenticated GitHub CLI and bundled PowerShell. No launcher or skill package is stored in this repository.

The generator is the **initial setup generator**, not a status-reset command for an active build. Never rerun it over implementation progress without a deliberate reviewed contract migration. The controller's `prepare` command performs the bounded candidate transition instead. Publishing changes to contracts requires rereading and synchronizing the affected GitHub bodies and native relationships.

## Read-only preflight

```powershell
& 'C:\Users\CooperRich\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\CooperRich\.codex\tools\docket-setup\docket_ralph.py' plan `
  --workspace 'C:\Users\CooperRich\OneDrive - Enriched Life Medical\Documents\ChatGPT\Docket'
```

`audit` validates all local contracts and coverage references. `plan` additionally reports the first eligible leaf or precise blocker. Neither starts Codex, creates a branch, writes application code, merges a PR or closes an issue. Current expected plan result: `R1-FND-001-A`.

Source/specification digests accept equivalent UTF-8 LF/CRLF text to support Windows checkouts; changed content fails. Evidence artifacts use byte-exact hashes. The YAML execution projection must also match structurally, so a valid file hash alone cannot authorize a different item order.

## Authorized run

```powershell
& 'C:\Users\CooperRich\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\CooperRich\.codex\tools\docket-setup\docket_ralph.py' run `
  --workspace 'C:\Users\CooperRich\OneDrive - Enriched Life Medical\Documents\ChatGPT\Docket' `
  --authorized
```

This starts at most one leaf. Effective worker arguments are `-Model gpt-5.6-sol -ReasoningEffort high -DisableSubagents -Quiet -MaxIterations 20`. Both `multi_agent` and `multi_agent_v2` are disabled. Detailed events remain under `.ralph/runs/`; concise lifecycle output reaches the supervisor. The context window is 200,000 with compaction at 180,000, not a total billing/token budget.

The controller captures the independent contract before work. For `R1-FND-001-A` through `R1-FND-005-A`, it creates `codex/<lowercase-leaf-id>` from the current protected bootstrap branch and targets that branch. `R1-FND-005-B` promotes the exact bootstrap history to `main`; later leaves start from and target `main`. It stops on an unresolved dependency, changed issue/source, invalid evidence, repeated process failure or exhausted iterations. Resume the recorded item branch; do not skip ahead. A worker success marker merely returns control for validation.

## Review, integration and recovery

The worker creates one PR with no auto-closing issue keyword. Before its final verification commit it invokes `prepare --workspace <path> --item <leaf>` to propose only the permitted graph/roadmap transition. All acceptance evidence must identify the final tested PR head.

Use `verify --workspace <path> --item <leaf>` for a read-only check against GitHub. After authorized integration approval, `integrate --workspace <path> --item <leaf> --authorized` independently checks live protection, exact-head CI and the accepted controller-evidence review mode, merges only the matching head, then reconciles the issue and local target checkout. It never requests administrator bypass.

If another authorized actor merged the PR or a process stopped after merge, use `reconcile --workspace <path> --item <leaf> --authorized`. It rechecks the merge and evidence, records both tested head and merge commit, avoids duplicate verification comments, confirms issue closure, and synchronizes immediate-dependent status labels. Dirty or unrelated local work prevents checkout changes and is left for explicit reconciliation. Repeating the command is safe after the recorded side effects.

The controller requires strict status checks, administrator enforcement, resolved conversations, force-push and deletion protection from classic branch protection. It accepts the pull-request requirement from either classic protection or an active branch ruleset only after validating the target branch, zero-approval policy, stale-review behavior, conversation resolution, and absence of bypass actors. An unreadable or incomplete API response is never treated as proof of protection.

After successful integration, a fresh `plan` identifies the next leaf. A whole-queue authorization permits repeated one-leaf runs; it does not remove review, provider, decision or production gates. Group closure additionally requires checking the combined parent behavior and coverage; parent checkboxes are not an execution signal.

## Publication structure

Issues use `release:r1`, `kind:implementation` / `kind:group` / `kind:decision`, `module:<owner>` and the five `status:*` labels. Eight milestones group related capabilities. The publisher uses native [sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) and [blocking dependencies](https://docs.github.com/en/rest/issues/issue-dependencies), then reads them back. The graph controls order; GitHub labels are a projection.

Issue source links point to the retained `codex/release-1-issue-setup` specification branch. Keep that branch available or deliberately resynchronize source links and contract hashes when moving to permanent revision links.

## Reading GitHub in execution order

[Pinned issue-order index](https://github.com/Cooper2Rich/Docket/issues/165) lists all implementation leaves in graph order and links the non-runnable groups and gates. Use the [oldest-first implementation view](https://github.com/Cooper2Rich/Docket/issues?q=is%3Aissue%20is%3Aopen%20label%3Arelease%3Ar1%20label%3Akind%3Aimplementation%20sort%3Acreated-asc). The current #49–#163 sequence matches the graph; future insertions or splits require regenerating the index. The `kind:queue` navigation issue is never a Ralph implementation item.
