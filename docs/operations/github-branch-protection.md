# GitHub Required Checks and Branch Protection

Status: required for `main`

This document is the operator contract for the Release 1 GitHub Actions foundation. The future workflow source must be `.github/workflows/required-checks.yml`, and `pnpm ci:check` rejects missing checks, renamed check contexts, CI-only command substitutions, mutable external action references, or weakened artifact handling.

The implementation and workflow were removed on September 9, 2026. The following sections remain requirements for recreation; no current local check or remote ruleset was verified by the reset.

## Required check contexts

Configure the repository ruleset for `main` to require these exact, case-sensitive contexts:

1. `Required / Frozen install`
2. `Required / Build`
3. `Required / Check`
4. `Required / Unit`
5. `Required / Integration`
6. `Required / End-to-end`
7. `Required / Contracts`
8. `Required / Migrations`
9. `Required / Security`
10. `Required / Accessibility`
11. `Required / Artifacts`

Require every context to succeed on the current pull-request head before merge. Require the branch to be current with `main`, require pull requests and resolved conversations, block force pushes and deletion, apply protection to administrators, and define no bypass actor. This owner-operated repository requires zero GitHub approvals; exact-head evidence, CI, graph transitions and merge ancestry are independently validated by the external controller. A release operator must compare the configured contexts to this list after any workflow rename; an absent context is a release-blocking `REQUIRED_CHECK_MISSING` condition.

## Foundation bootstrap protection

The resolved foundation policy temporarily protects `codex/release-1-bootstrap` with the strict current-head context `Bootstrap / Verify`, required pull requests, resolved conversations, administrator enforcement, no force push or deletion, and no bypass actors. `R1-FND-001-A` through `R1-FND-005-A` integrate there one PR at a time; controller-verified bootstrap integration satisfies their dependencies. `R1-FND-005-B` starts from that exact branch head and promotes the accumulated foundation history to `main` only after all eleven contexts pass. The bootstrap policy then expires and all later integration targets `main`.

The workflow runs on pull requests, pushes to `main`, and explicit manual dispatch. It grants the workflow token only read access to repository contents. Fork-originated code receives no deployment or repository-writing authority.

## Local-command parity

Every required job performs `pnpm install --frozen-lockfile` and then invokes the documented root command represented by its check name. The frozen-install job uses that install itself as its asserted command. CI-specific aliases, permissive test flags, generated-contract writes, direct schema application, and narrower security thresholds are prohibited. `CI_LOCAL_PARITY_FAILED` identifies such drift.

Run `pnpm ci:full` from a clean build environment to execute the same installation and gate commands serially. Run `pnpm ci:check` for the fast workflow-configuration contract. The checked-in negative fixture removes or changes each required check in turn and must continue to fail with `REQUIRED_CHECK_MISSING` or `CI_LOCAL_PARITY_FAILED`.

## Cache policy

The setup action installs exact Node and pnpm versions from `.node-version` and `package.json`. It caches only pnpm's content-addressed package store, keyed by the runner platform and the complete `pnpm-lock.yaml` hash through `actions/setup-node`. A cache miss is safe and falls back to the frozen registry install.

Do not cache `node_modules`, Nx output, application build output, generated contracts, environment files, Testcontainers state, Docker volumes, credentials, or test databases. Do not use prefix restore keys that can admit a store created for another lockfile. External actions remain pinned to full commit SHAs and are updated only through reviewed dependency changes.

## Artifact retention policy

The artifact job rebuilds from the frozen dependency graph, verifies required server, worker, migration, and server-rendered web outputs, rejects secret-bearing file types, and emits a SHA-256 manifest. It uploads one immutable `docket-build-<commit SHA>` artifact with `if-no-files-found: error`, hidden files disabled, and a seven-day retention period.

Pull-request artifacts are verification evidence, not release artifacts and never become production inputs. A release workflow added by a later work item must build once, attach provenance, use the accepted release retention schedule, verify in staging, and promote those exact bytes as required by the Release 1 operations contract.

## Change procedure

Change a required context, root command, cache boundary, retention period, runner, Node or pnpm version, or external action pin in one reviewed change that updates the workflow, CI policy tests, this document, and affected traceability. Run `pnpm ci:full` before applying the corresponding ruleset update. Never remove the old branch-protection context until the replacement check has completed successfully on `main`.
