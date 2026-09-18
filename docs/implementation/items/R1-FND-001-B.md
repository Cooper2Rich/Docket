# R1-FND-001-B: Deliver the server-rendered shadcn web foundation

Parent: R1-FND-001 · Order: 20 · Owner: runtime · Stage: 01 Foundations

Release requirements: R1-LIFE-001. One sequential Sol/high Ralph run; default 20 iterations. Setup is not build authorization.

## Outcome and scope

Complete foundation or operational capability and its real executable evidence; no user-facing domain feature is implied beyond the named outcome.

Implement only the behaviors below. Practice Workspaces, School/Account export products, saved searches/bookmarks/subscriptions, non-LD formats and offline verifiers remain outside Release 1. The detailed source obligations apply only to the accepted Release 1 surface.

## Prerequisites

- Completed and independently verified leaves: R1-FND-001-A.
- External/decision gates: none unique to this leaf; protected integration and review still apply.
- Read AGENTS.md, wiki/index.md, BUILD.md, CONTEXT.md and the applicable ADRs; then the scoped sources below. Future commands are created by the named foundation dependencies and are not currently implemented.

## Acceptance criteria

- **R1-FND-001-B/AC-01** — The React Router SSR application builds for the Vercel preset and renders the pinned base-nova/Base UI, neutral tokens, Tailwind 4, Lucide, CSS-variable, rsc=false foundation. The checked-in components.json and ui:add command reproduce the selected source.
- **R1-FND-001-B/AC-02** — A real rendered route exercises keyboard focus, labels, loading, empty, error, and narrow-screen states; its primitive accessibility smoke has no unaccepted WCAG 2.2 AA failure. Hydration and browser navigation work without importing server secrets.
- **R1-FND-001-B/AC-03** — Introduce the Playwright end-to-end/accessibility command seams with actual web tests, not placeholder success. Generated clients and identity adapters remain explicit future dependencies.
- **R1-FND-001-B/AC-04** — For this slice, prove allowed and denied actors, stale version/authority, equivalent retry, conflicting concurrent action, transaction rollback and delivery failure at the authoritative boundary; persist only permitted data and enforce its existing retention/hold contract. For a user journey, exercise its real rendered route with loading, empty, error, denied, stale, mobile and keyboard states. Mark a category inapplicable only with a source-backed reason reviewed in the PR; an omitted case, fake UI, empty suite or unimplemented persistence is not a pass.

## Affected design contracts

Use the following accepted parent seams only where this leaf changes their behavior. Preserve module ownership and public exports; select internal filenames during implementation. Record each touched seam in the PR and explain any category that does not apply. Do not implement unrelated sibling scope merely because it shares a seam.

- Outputs: package.json; pnpm-workspace.yaml; pnpm-lock.yaml; nx.json; tsconfig files; apps and packages shells; apps/web/components.json; React Router Vercel preset and checked-in deployment configuration; initial shadcn/ui source and tokens.
- Interfaces: root build and check scripts; pinned ui:add script; package public export seams.
- Schemas: workspace configuration.
- Tables: No new tables specified by the parent; add only when required by this leaf and document why..
- Events: No new events specified by the parent; add only when required by this leaf and document why..
- Errors: invalid prerequisite version; prohibited package dependency.
- Audiences: developers; CI.
- Risks: version drift; accidental framework coupling; unenforced package seams; unpinned registry generation; inaccessible primitive customization.

Routes, UI states, worker behavior and migrations must reach the actual accepted behavior. Reuse an established seam from a completed prerequisite; do not leave success-only stubs for a promised journey.

## Verification contract

Run from the repository root. Bootstrap creates its own required commands before checking them. Use deterministic nonproduction identities, clocks and fixtures; service-dependent tests use the established local services and isolated PostgreSQL. Production/environment criteria require real authorized evidence.

| Check ID | Exact command | Created by | Pass condition |
| --- | --- | --- | --- |
| item | `pnpm verify:item --id R1-FND-001-B --contract docs/implementation/queue-contract.json` | R1-FND-001-A | Exact acceptance-ID set; every required scenario has at least one executed assertion, zero failed/skipped/pending assertions, current code revision and contract digest, hashed evidence artifacts. |
| build | `pnpm build` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| check | `pnpm check` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| unit | `pnpm test:unit` | R1-FND-001-A | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |
| e2e | `pnpm test:e2e` | R1-FND-001-B | Exit zero with nonempty applicable checks; no skipped required scenario or permissive success flag. |

Write machine evidence to `.ralph/evidence/R1-FND-001-B/acceptance.json` using [the verification protocol](../verification-protocol.md). The independent expected sets are stored in `docs/implementation/queue-contract.json`; the worker cannot reduce them.

All eleven current-head CI contexts and at least one current-head approval are required for main integration. Foundation integration remains blocked until GATE-BOOTSTRAP establishes an explicit tested policy. Manual review, provider, environment and production evidence cannot be manufactured from fixture results.

## Source obligations

Exact audited clauses are indexed in [source coverage](../source-coverage.json). Hashes bind the source revision; changed authority requires contract resynchronization before execution. Read entire cited sections for context; later accepted ADRs and the explicit Release 1 boundary govern superseded/mixed paragraphs.

- [docs/adr/0032-adopt-the-initial-application-stack.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0032-adopt-the-initial-application-stack.md): Adopt the initial application stack; Considered Options; Consequences. Clauses: SRC-ec556b6b-001, SRC-ec556b6b-002, SRC-ec556b6b-003, SRC-ec556b6b-004, SRC-ec556b6b-005, SRC-ec556b6b-006, SRC-ec556b6b-007.
- [docs/adr/0033-use-server-rendered-react-for-the-web-application.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/adr/0033-use-server-rendered-react-for-the-web-application.md): Use server-rendered React for the web application; Consequences. Clauses: SRC-5e539b16-001, SRC-5e539b16-002, SRC-5e539b16-003, SRC-5e539b16-004, SRC-5e539b16-005.
- [docs/implementation/source-audit.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/source-audit.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/implementation/verification-protocol.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/implementation/verification-protocol.md): Engineering interpretation and evidence contract. Clauses: .
- [docs/product/experience-contract.md](https://github.com/Cooper2Rich/Docket/blob/codex/release-1-issue-setup/docs/product/experience-contract.md): Product Experience Contract; Delivery model; Information architecture; Required screen states; Design system; Accessibility; Responsive and browser support; Design catalog. Clauses: SRC-b67853a4-001, SRC-b67853a4-002, SRC-b67853a4-003, SRC-b67853a4-004, SRC-b67853a4-005, SRC-b67853a4-006, SRC-b67853a4-007, SRC-b67853a4-008, SRC-b67853a4-009, SRC-b67853a4-010, SRC-b67853a4-011, SRC-b67853a4-012, SRC-b67853a4-013, SRC-b67853a4-014, SRC-b67853a4-015, SRC-b67853a4-016, SRC-b67853a4-017, SRC-b67853a4-018, SRC-b67853a4-019.

## Completion and handoff

Create one PR referencing this issue without automatic closing keywords. Include focused changes, verification evidence, graph/roadmap/trace changes and a durable wiki checkpoint. The candidate graph may propose completion, but a branch-local `done` label is not integrated completion. The external controller validates the exact contract, complete evidence sets, actual PR head, checks, review and merged commit before closing the issue or allowing its dependent.

On a missing decision, unavailable prerequisite, failing required check or exhausted iteration limit, retain evidence and stop this item. Do not start another leaf. If this scope cannot fit one bounded run and reviewable PR, split it under the Work Item Contract before continuing.
