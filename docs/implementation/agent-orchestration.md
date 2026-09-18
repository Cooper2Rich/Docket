# Sol-Only Ralph Build Orchestration

Status: accepted

This contract governs implementation of the Release 1 work graph. GPT-5.6 Sol at high reasoning performs implementation, verification, integration, queue updates, and durable checkpoints. Coding subagents are disabled; every runnable objective is handled by a fresh bounded Ralph session.

A work item becoming `ready` does not authorize execution. After the September 9, 2026 reset, wait for an explicit build request before launching Ralph. The first item must recreate its verification tooling before it can run it.

## Authority and selection

The YAML work graph and Work Item Contract remain authoritative. Select only the lowest-order `ready` item. Verify that all dependencies are `done`, every named input exists, and no governing source contradicts the item before implementation starts.

One Ralph run owns one runnable work item. A run may not start a later item, broaden Release 1, or infer a missing product or architecture decision. If an item cannot fit one bounded session and one reviewable change, split it under the Work Item Contract before continuing.

## Item loop

1. Read `AGENTS.md`, `wiki/index.md`, `BUILD.md`, the selected graph item, its inputs, and the declared evidence.
2. Inspect the working tree and preserve unrelated user changes.
3. Change the selected item from `ready` to `in_progress` and synchronize the readable roadmap.
4. Implement its complete vertical slice, including code, tests, generated artifacts, documentation, and operational surfaces named by the item.
5. Change it to `verification`, run every declared evidence command, and repair failures within scope.
6. Change it to `done` only when the Work Item Contract's done rule is satisfied. Promote only newly unblocked immediate dependents to `ready`.
7. Synchronize the roadmap and, once its generator exists, traceability, update relevant durable wiki knowledge, update `wiki/index.md` when its content map changes, and append one dated entry to `wiki/log.md`.

A failed, blocked, or iteration-exhausted run stops the queue. Do not skip ahead.

## Context and cost discipline

- Each Ralph iteration is a fresh `codex exec` process with its own thread ID. Local launch tooling enforces the configured context boundary and rotates to a new process; that tooling remains outside this repository.
- Raw child JSON and stderr stay in `.ralph/runs/`; the supervising task receives only concise lifecycle messages so child output does not consume its context.
- Pass file paths and requirement identifiers instead of duplicating long source text.
- Re-read only sources relevant to the current item and changed interfaces.
- Run a check again only after a relevant implementation or environment change.
- Keep routine command output in the Ralph run log and summarize durable evidence in the progress file.
- Use prompt caching when the client supplies it; do not trade away acceptance evidence to reduce tokens.

## Completion signal

`RALPH_LOOP_COMPLETE` is valid only after every declared output and acceptance check passes and the queue, roadmap, traceability, and required wiki checkpoint agree. `RALPH_LOOP_BLOCKED` returns control to the owner with one concrete blocker. Otherwise the run continues within its iteration cap.

## Start parameters

Launch one fresh `codex exec` process per iteration with `gpt-5.6-sol` at high reasoning, a self-contained objective containing the selected item's acceptance criteria, the repository path, and a default maximum of twenty iterations. Keep the launcher and other agent tooling outside this repository.
