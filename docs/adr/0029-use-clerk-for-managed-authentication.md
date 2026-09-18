# ADR 0029: Use Clerk for managed authentication

- Status: Accepted
- Date: 2026-09-01
- Revised: 2026-09-18

## Context

Docket needs authenticated Competitors, Coaches, Judges, tournament personnel, and platform personnel, but storing credentials, implementing factor recovery, and operating session security would create a separate security product surface. The product owner wants Clerk to manage authentication while Docket keeps identity-linked product records, authorization, and historical attribution under its own control.

Authentication must remain distinct from Docket's domain authorization. A valid Clerk session identifies an actor but never implies authority over a School, tournament, Judge assignment, or platform operation.

## Decision

Clerk is the sole authentication and session provider for Release 1. Docket uses Clerk's React Router and Fastify integration seams, validates Clerk-signed session tokens on the server, and links each Docket Account to exactly one current stable Clerk user identifier. One Clerk user identifier may belong to at most one Docket Account.

Release 1 enables Google as a Clerk social sign-in connection and enables a verified email-code factor supported by Clerk for sensitive-action reverification. Docket does not store or administer passwords, passkeys, TOTP secrets, SMS factors, recovery codes, OAuth tokens used only for sign-in, or any other authentication credential. Clerk owns sign-in flows, factor enrollment and challenges, authentication recovery, session issuance, and authentication-security policy. A separate Google connection used for Google Meet remains an application integration and is not the Docket authentication authority.

Docket will:

- validate every Clerk session token server-side, including signature, accepted issuer and authorized party, time claims, session status, user identifier, and applicable request-origin protections;
- treat Clerk webhooks as delivery hints rather than authority, process them idempotently, and revalidate security-sensitive identity state through a signed token or Clerk's backend interface;
- allow a verified Clerk user to self-enroll a role-free Basic Docket Account for Competitor, Coach, or Judge onboarding;
- require a verified organization-managed address from a Docket-approved domain before Platform Administrator or Legal and Privacy Operations permission may be granted, without inferring authority from that address or domain;
- keep every Docket role, Active Role Context, School Membership, tournament grant, authorization decision, and retained domain record in PostgreSQL rather than Clerk metadata, roles, or Organizations;
- allow one Docket Account to hold multiple roles and switch among them through Docket's native Active Role Context selector while evaluating every action within that exact context;
- bind each Docket Session record to the validated Clerk user and session identifiers while applying Docket's ordinary and privileged inactivity, absolute-lifetime, concurrency, restoration, and audit rules;
- require Clerk Reverification within 10 minutes for ownership transfer, role or permission changes, identity-link replacement, Legal Hold actions, sensitive-data exports, Account suspension, and Final Results publication or correction;
- record the signed verification freshness and, when required to prevent replay, the Clerk reverification identifier alongside the sensitive command without storing the factor itself;
- bind each private Access Offer to any exact email address that Clerk recognizes as verified and to one exact authority scope, require explicit acceptance by the matching authenticated Docket Account, and revalidate all authority and exclusivity rules transactionally; the address need not be associated with Google social sign-in, and a Google connection is required only for a separately authorized Google application integration such as Google Meet;
- use a controlled, evidence-backed Platform Identity Review for Clerk Identity Link Replacement and duplicate Docket Account conflicts rather than automatically merging Accounts by email or profile attributes;
- preserve historical attribution and existing grants when a Clerk identity becomes inaccessible while denying new authentication until recovery or an approved identity-link replacement completes; and
- retain the accepted suspension, deactivation, export, privacy, and security-history rules while expressing their authentication guards through Clerk sessions and Clerk Reverification.

Docket imports and retains only the minimum Clerk identity data required for account linkage, verified contact, display-name initialization, security enforcement, and audit. Email address, display name, social-provider subject, and organization-domain attributes are mutable and cannot serve as the Docket Account key or establish authority. A governed Docket Display Name may change independently while historical publications retain the name originally used.

Docket will not:

- use Clerk Organizations, roles, permissions, or user metadata as the authoritative source for Docket authorization;
- infer a School Membership or any role from an email address, domain, Google connection, or Clerk profile attribute;
- auto-link or merge Docket Accounts based only on matching email or profile data;
- accept a client-side authentication success message or unverified token claims as identity evidence; or
- provide a local-password fallback, administrator bypass, or impersonation route when Clerk or an enabled upstream factor is unavailable.

An inaccessible, deleted, or suspended Clerk identity prevents new authentication but does not delete the Docket Account, its grants, or historical attribution. Verified contact or profile changes retain the same Docket Account while the stable Clerk user identifier remains unchanged. During a Clerk outage, or an outage of a required upstream factor, already-valid sessions continue only until their ordinary expiration; affected sign-in, renewal, recovery, identity changes, and reverification-guarded commands remain unavailable.

## Consequences

- Clerk, rather than Google Identity Services directly, is Docket's authentication and session dependency.
- Authentication credentials and Clerk session state are intentionally outside Docket's PostgreSQL database; PostgreSQL remains authoritative for Docket Accounts, authorization, domain data, audit, and authentication-linked security records.
- The Fastify API must validate Clerk tokens independently of the Vercel-hosted web application and never trust presentation-layer route protection as backend authorization.
- Google remains an enabled sign-in option and a separate provider for Google Meet, but Google identity attributes no longer key a Docket Account.
- Clerk Reverification requires at least one Clerk-supported verification factor; Release 1 therefore retains verified email code even when the user ordinarily signs in with Google.
- Authorization remains testable as Docket domain policy independently of Clerk.
