---
name: ralph-loop
description: Run repository objectives through fresh, externally bounded Codex sessions with durable handoffs, or process an explicitly approved GitHub issue queue consecutively. Use for autonomous implementation that must rotate context instead of compacting one long session.
---

# Ralph Loop

Run fresh Codex sessions against durable objectives and progress logs. Use one of two modes: a single objective or an approved repository issue queue.

## Repository issue queue

Use the GitHub connector rather than requiring GitHub CLI.

### Resolve the queue

1. Resolve the checked-out repository's `owner/repository` and confirm it matches the user's target.
2. Read the full body, comments, labels, state, and dependencies of the issues the user selected. When no issue numbers were supplied, select open issues labeled `ready-for-agent`. Exclude pull requests and any issue lacking implementable acceptance criteria.
3. Order eligible issues one at a time by dependency: every blocker must appear earlier or already be closed. Among simultaneously unblocked issues, use the lowest issue number first.
4. Show the exact ordered queue with issue number, title, blockers, and acceptance-summary. State that approval authorizes repository edits, one commit per issue, a verification comment, and closing each verified issue.
5. Ask the user to approve that exact queue. Approval of a PRD, label, or earlier queue is not approval of this run. A changed queue requires fresh approval.

After approval, run:

```powershell
& "<skill-directory>\scripts\ralph-issues.ps1" -Repository "<owner/repository>" -IssueNumbers @(<ordered issue numbers>) -Workspace "<absolute repository path>" -MaxIterationsPerIssue 20
```

Pass `-Model` only when the user selected a model. The wrapper runs one issue to verified completion before starting the next. It stops immediately when an issue is blocked, fails, or exhausts its iteration limit; it never skips ahead silently.

Supervise the command through concise wrapper output. Raw child events remain in the run directory. When the queue finishes, re-read every approved issue through the GitHub connector and report which issues closed, which remain open, their verification evidence, and the queue run directory.

## Single objective

Turn the user's request into one self-contained objective with observable acceptance criteria, then run:

```powershell
& "<skill-directory>\scripts\ralph-loop.ps1" -Objective "<objective and acceptance criteria>" -Workspace "<absolute repository path>" -MaxIterations 20
```

Use 20 iterations when the user supplies no limit; lower it for narrow work and raise it only when warranted. Preserve scope and authorization boundaries.

## Completion and blockers

- `RALPH_LOOP_COMPLETE` is valid only when the final session reports evidence that every acceptance criterion passed.
- `RALPH_LOOP_BLOCKED` means the objective needs user input, permission, an unavailable dependency, or a changed issue contract. Return control to the user.
- `RALPH_LOOP_CONTINUE` ends the current context slice and starts a fresh child session from repository state and `progress.md`.
- Three consecutive execution failures or the iteration limit stop the run.
- Never describe an exhausted or blocked run as successful.

## Context boundary

Each iteration launches a new `codex exec` process and receives a new thread ID. The wrapper owns the boundary; model context settings alone do not end a process.

The wrapper requests a checkpoint when the first session budget is reached: event-log bytes, completed events, or elapsed time. The child finishes its current atomic operation, appends the durable handoff, and returns `RALPH_LOOP_CONTINUE`. A grace deadline terminates a nonresponsive child process tree so the next iteration starts with a fresh context.

Raw JSON and stderr remain in the run directory. Stream only concise lifecycle messages to the supervising task so child output cannot consume the supervisor's context. Treat `progress.md` and repository state as the handoff; never depend on child conversation history.

The default budgets are conservative proxies for context use. Lower them when measured runs require an earlier boundary. Split an oversized objective instead of raising the budgets to make it fit.

After changing the wrapper, run `tests/ralph-loop.tests.ps1`. The fixture must prove that a boundary queues a checkpoint, the next iteration has a distinct thread ID, and raw child events stay out of supervising output.
