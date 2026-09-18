# Superseded implementation notes

These passages describe the implementation deleted on September 9, 2026. They are preserved as history, not requirements or evidence that code currently exists. Current behavior is governed by the release specification and accepted ADRs.

## From `wiki/access-model.md`

As of 2026-09-07, `R1-IDA-001` completes this identity and Docket Session boundary: server-validated Google OIDC, a production-forbidden versioned fixed adapter, stable issuer-and-subject Account enrollment, hashed bearer credentials, ordinary and privileged expiry and concurrency policies, opaque secure cookies, audit facts, generated API contracts, and live accessible sign-in and session-management routes. Its transaction-scoped PostgreSQL identity lock uses deterministic, unambiguous, NUL-free tuple encoding. Unit, API, build, Docker-backed PostgreSQL integration, contract, migration, security, accessibility, artifact, and full CI-equivalent gates pass; see [R1-IDA-001 evidence](evidence/R1-IDA-001.md).

## From `wiki/access-model.md`

As of 2026-09-07, `R1-IDA-002` implements the first authorization core. Versioned Authority Grants and reauthentication evidence are PostgreSQL authority; an Active Role Context is selected independently per Session and browser tab, records the exact grant version, never blends permissions from another grant, and is destroyed when its grant becomes stale or revoked. The same module restores only the most recently used context that is still current, admits at most one active privileged Session, enforces 30-minute inactivity and 12-hour absolute privileged limits, and requires identity-matched Google reauthentication no older than ten minutes for guarded commands. Stable generic denials avoid resource disclosure. The generated client sends a tab-local identifier, clears only context-scoped browser cache during a switch, blocks unresolved local edits, persistently labels role and scope, distinguishes privileged context visually, and exposes immediate privileged-session termination. See [R1-IDA-002 evidence](evidence/R1-IDA-002.md).

## From `wiki/access-model.md`

As of 2026-09-08, `R1-TRN-001` implements initial Tournament authority. Creation accepts an IANA timezone, assigns UUIDv7 identity and Draft lifecycle, and atomically records the creating Account as the one matching active Owner. An Owner or Director may issue one exact-email Director or staff Access Offer; Directors cannot grant Owner authority. Accepted staff hold only explicit Registration, Pairing, Judge Room, Ballot Correction, Publication, or Accommodation Operations permission bundles. A staff actor may delegate only a permission they currently hold, while Owner and Director authority remains intrinsic and unblended. Foreign-Tournament requests receive the same non-disclosing `TOURNAMENT_SCOPE_DENIED` result. See [R1-TRN-001 evidence](evidence/R1-TRN-001.md), [ADR 0006](../../adr/0006-delegate-tabulation-permissions.md), and [ADR 0007](../../adr/0007-single-owner-multiple-directors.md).

## From `wiki/access-model.md`

Implementation checkpoint: completed `R1-SCH-001` uses `@docket/schools`, migration 000005, the Fastify School routes, and the generated client to enforce the School Membership rules above. Former Managers remain ordinary Coaching Staff without acquiring an unrelated delegated management role; pending offers are exposed only to the current same-School Manager. Six isolated PostgreSQL tests and the complete CI-equivalent gate pass. See [R1-SCH-001 evidence](evidence/R1-SCH-001.md).

## From `wiki/access-model.md`

Implementation checkpoint: completed `R1-SCH-002` exposes exact-recipient affiliation issue, acceptance, revocation, transfer, termination, Account history, and same-School Manager projections through `CompetitorAffiliations`. The service revalidates the active School context for Manager operations, never derives authority from an email domain, returns only the affected School's history to a Manager, keeps destination projections free of former-School private data, and emits stable conflicts for stale actions, idempotency collisions, recipient mismatch, and same-tournament dual representation. Deterministic School-before-invitation locking gives concurrent terminal actions one winner in PostgreSQL; see [R1-SCH-002 evidence](evidence/R1-SCH-002.md).

## From `wiki/access-model.md`

The Access Inbox is now implemented as an Account-owned restricted projection. Exact verified-email matches create inbox items alongside required email; reads resolve only the opaque current Docket Session and return that Account's safe routing summaries with exact context labels. Non-Account targets pass through explicit role-context selection before private detail, and delivery escalation creates a restricted initiating-actor inbox item only where that actor is known. See [R1-COM-001 evidence](evidence/R1-COM-001.md).


## From `wiki/backend-architecture.md`

Implementation checkpoint: completed `R1-COM-001` realizes the asynchronous boundary above through source-owned transactional outboxes, leased pg-boss dispatch, idempotent communications persistence, Mailpit and SES adapters, and a restricted Account inbox. PostgreSQL claims serialize duplicate jobs; transient failures retry after one hour and then 23 hours, while permanent or third-cycle failures escalate without changing the source aggregate. The API and inbox expose only safe routing summaries until the required role-context switch. See [R1-COM-001 evidence](evidence/R1-COM-001.md).

## From `wiki/backend-roadmap.md`

Transactional required-notice delivery is complete. School membership offers, Competitor School invitations, and Tournament access offers append restricted messages atomically in their source modules; leased dispatch hands them to pg-boss, and the communications module delivers Account inbox and Mailpit or SES email effects with idempotent intent creation, duplicate-job serialization, three cycles over 24 hours, and escalation. The full release gate passes, and `R1-REG-001` is now the sole ready walking-skeleton item. See [R1-COM-001 evidence](evidence/R1-COM-001.md).


## From `wiki/registration-model.md`

Implementation checkpoint: completed `R1-SCH-002` implements this pre-registration boundary in `@docket/schools`. Destination acceptance closes the prior current affiliation and links a new one without rewriting represented-School history; an injected Entry boundary rejects same-tournament dual-School representation. Termination blocks new Entries immediately, remains visible as pending until active Entries clear, and then finalizes through the same versioned flow. All mutations use client-stable receipts, and the three affiliation events have executable restricted-audit contracts. Registration remains responsible for supplying the real Entry-boundary adapter when its work item is implemented. See [R1-SCH-002 evidence](evidence/R1-SCH-002.md).
