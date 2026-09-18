# Launching the prepared Release 1 queue

Status: setup only. No application build is authorized or running.

The queue consists of 40 tracking groups, 115 implementation leaves and eight decision/external gates. Start from the [roadmap](work-graph.md), [GitHub mapping](github-issues.json), [source audit](source-audit.md) and [verification protocol](verification-protocol.md). Never pass every open GitHub issue to the generic Ralph issue runner.

## Current activation blockers

1. [GATE-BOOTSTRAP](gates/GATE-BOOTSTRAP.md): choose and implement the explicit protected foundation integration policy. The recommended protected bootstrap branch and staged nonempty checks remain a proposal. The controller currently supports fully protected `main` integration; a bootstrap policy must be implemented and fixture-tested before resolving the gate.
2. [GATE-GITHUB](gates/GATE-GITHUB.md): the private repository's plan currently prevents branch-protection/ruleset access. Preserve its private visibility and required CI/review policy.
3. Integrate the reviewed specification/setup change, reconcile any legitimate source changes and issue hashes, and use a clean checkout at current `main`.
4. Obtain an explicit owner instruction to start application implementation. Choosing option B authorized the setup only.

Later provider, Ruleset, human-review, environment, attribution and production gates stop their affected leaves. The available launcher does not fabricate their resolutions. Ordinary current-head PR review is required throughout, even though the release accessibility review has its own later gate.

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

`audit` validates all local contracts and coverage references. `plan` additionally reports the first eligible leaf or precise blocker. Neither starts Codex, creates a branch, writes application code, merges a PR or closes an issue. Current expected plan result: no next item; unresolved `GATE-BOOTSTRAP`.

Source/specification digests accept equivalent UTF-8 LF/CRLF text to support Windows checkouts; changed content fails. Evidence artifacts use byte-exact hashes. The YAML execution projection must also match structurally, so a valid file hash alone cannot authorize a different item order.

## Future authorized run

Only after the activation conditions and an explicit build instruction are satisfied:

```powershell
& 'C:\Users\CooperRich\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\CooperRich\.codex\tools\docket-setup\docket_ralph.py' run `
  --workspace 'C:\Users\CooperRich\OneDrive - Enriched Life Medical\Documents\ChatGPT\Docket' `
  --authorized
```

This starts at most one leaf. Effective worker arguments are `-Model gpt-5.6-sol -ReasoningEffort high -DisableSubagents -Quiet -MaxIterations 20`. Both `multi_agent` and `multi_agent_v2` are disabled. Detailed events remain under `.ralph/runs/`; concise lifecycle output reaches the supervisor. The context window is 200,000 with compaction at 180,000, not a total billing/token budget.

The controller captures the independent contract before work, creates `codex/<lowercase-leaf-id>` from current clean `main`, and stops on an unresolved dependency, changed issue/source, invalid evidence, repeated process failure or exhausted iterations. Resume the recorded item branch; do not skip ahead. A worker success marker merely returns control for validation.

## Review, integration and recovery

The worker creates one PR with no auto-closing issue keyword. Before its final verification commit it invokes `prepare --workspace <path> --item <leaf>` to propose only the permitted graph/roadmap transition. All acceptance evidence must identify the final tested PR head.

Use `verify --workspace <path> --item <leaf>` for a read-only check against GitHub. After authorized review and integration approval, `integrate --workspace <path> --item <leaf> --authorized` independently checks live protection, exact-head CI and nonauthor approval, merges only the matching head, then reconciles the issue and local main checkout. It never requests administrator bypass.

If another authorized actor merged the PR or a process stopped after merge, use `reconcile --workspace <path> --item <leaf> --authorized`. It rechecks the merge and evidence, records both tested head and merge commit, avoids duplicate verification comments, confirms issue closure, and synchronizes immediate-dependent status labels. Dirty or unrelated local work prevents checkout changes and is left for explicit reconciliation. Repeating the command is safe after the recorded side effects.

The controller conservatively requires the documented branch-protection API representation. A future ruleset-only configuration needs an equivalent-policy implementation and fixtures; an unreadable API is never treated as proof of protection.

After successful integration, a fresh `plan` identifies the next leaf. A whole-queue authorization permits repeated one-leaf runs; it does not remove review, provider, decision or production gates. Group closure additionally requires checking the combined parent behavior and coverage; parent checkboxes are not an execution signal.

## Publication structure

Issues use `release:r1`, `kind:implementation` / `kind:group` / `kind:decision`, `module:<owner>` and the five `status:*` labels. Eight milestones group related capabilities. The publisher uses native [sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) and [blocking dependencies](https://docs.github.com/en/rest/issues/issue-dependencies), then reads them back. The graph controls order; GitHub labels are a projection.

Issue source links point to the retained `codex/release-1-issue-setup` specification branch. Keep that branch available or deliberately resynchronize source links and contract hashes when moving to permanent revision links.
