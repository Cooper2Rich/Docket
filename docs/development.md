# Reproducible Development Contract

Status: accepted build requirements; application implementation removed September 9, 2026.

The commands, source paths, fixtures, and checks below describe the workspace to be built. None currently exists as an application command. Use the [bootstrap baseline](implementation/bootstrap-baseline.md) for preserved version inputs.

## Host prerequisites

- Node.js 24 LTS
- Corepack managing the repository-pinned pnpm version
- Docker Engine with Docker Compose
- Git

No global application package or locally installed database is part of the build contract.

## Frontend generator policy

shadcn/ui is initialized in `apps/web` using the exact configuration in [ADR 0033](adr/0033-use-server-rendered-react-for-the-web-application.md). The repository commits `apps/web/components.json`, generated component source, and the resolved dependency versions. The shadcn CLI is pinned in the workspace and invoked through a root or workspace script. Documentation examples that use `pnpm dlx shadcn@latest` are discovery instructions, not approved repeatable repository commands.

## Reserved workspace commands

The scaffold must implement these root commands without requiring undocumented manual steps:

- `pnpm bootstrap` - validate prerequisites, install or verify dependencies, start local infrastructure, apply migrations, and load the default deterministic development fixture
- `pnpm dev` - run the web, API, and worker processes with watched builds
- `pnpm build` - produce every deployable application and generated contract
- `pnpm check` - run formatting verification, linting, type checking, dependency enforcement, generated-contract drift checks, and migration checks
- `pnpm test:unit` - run side-effect-controlled module tests
- `pnpm test:integration` - run adapter and PostgreSQL tests using isolated Testcontainers dependencies
- `pnpm test:e2e` - run Playwright against a fresh seeded Release 1 environment
- `pnpm test` - run every release-blocking automated test tier
- `pnpm ui:add -- <component>` - add a reviewed shadcn/ui component to `apps/web` using the repository-pinned CLI and configuration

Until the workspace implements them, [BUILD.md](../BUILD.md) must continue to say that no application command exists.

## Local infrastructure

Docker Compose supplies PostgreSQL, MinIO as the local S3-compatible adapter, and Mailpit as the local email adapter. Service versions and configuration are pinned. Health checks, ports, volumes, and reset procedures are declared in the tracked Compose configuration rather than assumed from a developer machine.

Copy `.env.example` to `.env` only when overriding the synthetic defaults. The default host endpoints are PostgreSQL on `127.0.0.1:5432`, MinIO API and console on ports `9000` and `9001`, Mailpit SMTP on `1025`, and Mailpit UI on `8025`. `pnpm infra:down` preserves named volumes. `pnpm infra:reset` is the explicit destructive reset for only the Docket Compose project's PostgreSQL, MinIO, and Mailpit volumes.

## Database migrations

Each module that can own persistence declares its table prefixes in `packages/<module>/migrations/owner.json` and stores its migration SQL and metadata beside that declaration. `@docket/database` merges those package-local files into one contiguous forward sequence, verifies SQL targets against the declared owner, rejects destructive current-release changes, and requires compatibility with the immediately previous application release.

Run `pnpm migration:check` for daemon-independent plan validation. Run `pnpm migrate` only after the target database is healthy; it serializes migration sessions with a PostgreSQL advisory lock, applies each file in a transaction, executes its read-only verification query, and appends a checksummed `MigrationApplied` row to `platform_migration_journal`. Applied rows are immutable. Correct a released migration with a new forward migration rather than editing history or rolling schema state backward.

Integration tests use `TestDatabase` from `@docket/testkit`. Each harness instance starts an isolated pinned PostgreSQL Testcontainer and runs the same plan loader and runner used by the release entry point.

## Executable contract generation

Module-owned `ContractSource` values are the executable contract inputs. `@docket/contracts` exposes the schemas and the single `runContractGenerator` seam; generated files are projections and must not become hand-maintained sources of truth.

Run `pnpm contracts:generate` after changing an authoritative contract source, Release 1 requirement, work-item status, or traceability source. Commit all resulting files under the generator-owned `contracts/` directories. Run `pnpm contracts:check` to prove byte-for-byte freshness, generated-directory ownership, complete Release 1 requirement links, valid source and evidence paths, valid golden-vector descriptors, and adjacent generated-schema and OpenAPI compatibility. A breaking contract change requires an explicit versioned replacement rather than silently weakening this check.

## Identity in development and tests

A fixed identity adapter supplies versioned test Accounts and Clerk-session and reverification scenarios without real Clerk credentials or upstream factors. The adapter is valid only in development and test environments. Production configuration or startup must reject it before serving traffic, and tests must prove that guard.

The fixed adapter establishes authentication evidence only. Tests and seed data still create Docket authority through the same application commands and persistence rules used by production.

## Environment configuration

The repository commits a secret-free `.env.example` and a runtime-validated environment schema shared by each process. Unknown, missing, malformed, or environment-incompatible settings fail startup with safe diagnostics. Secrets, real tokens, and production identifiers never appear in fixtures, snapshots, logs, or committed files.

`pnpm config:validate` validates `.env` when it exists and otherwise validates `.env.example`. Fixed identity, MinIO, and Mailpit adapters are development/test-only; staging or production configuration rejects them before serving traffic.

## Deterministic fixtures

Fixtures are versioned, synthetic, repeatable, and idempotently loaded. The default Release 1 fixture includes enough Accounts, Schools, Entries, Judges, rooms, policies, schedules, and rules to exercise the walking skeleton. Later lifecycle fixtures extend it through one complete Lincoln-Douglas tournament without using real participant information.

## Continuous integration

GitHub Actions uses exact Node and pnpm versions, immutable external action revisions, a frozen lockfile install, and the same root commands used locally. CI may orchestrate ephemeral dependencies differently from Compose, but it must use the same migrations, adapters, schemas, and fixtures. A required check cannot exist only as an undocumented hosted action.

The root CI seams are:

- `pnpm ci:check` - validate stable check names, frozen installation, local-command parity, read-only permissions, immutable action revisions, timeouts, cache configuration, and artifact retention;
- `pnpm ci:full` - execute the full required workflow serially in a clean local environment;
- `pnpm security:check` - reject credential patterns and mutable action references, then block on high or critical dependency findings;
- `pnpm accessibility:check` - run the dedicated automated accessibility suite; and
- `pnpm artifacts:check` - verify and hash the complete deployable build output.

The exact required contexts, branch rules, cache exclusions, artifact handling, and safe change procedure are governed by [GitHub Required Checks and Branch Protection](operations/github-branch-protection.md). The CI policy's checked-in negative fixture removes and mutates every required check in turn so `REQUIRED_CHECK_MISSING` and `CI_LOCAL_PARITY_FAILED` remain executable failures.
