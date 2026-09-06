# ADR 0029: Use Google as the sole authentication provider

- Status: Accepted
- Date: 2026-09-01

## Context

Docket needs authenticated Coaches, Judges, tournament personnel, and platform personnel, but authentication credentials and additional-factor recovery would introduce a separate security product surface. The product owner wants login and any extra authentication security to use Google's authentication platform.

Authentication must remain distinct from Docket's domain authorization. A valid Google identity must not imply authority over a School, tournament, Judge assignment, or platform operation.

The later decision to distribute a general-public iOS application creates an unresolved external constraint: Apple App Review Guideline 4.8 generally requires an equivalent privacy-preserving login option when a third-party login establishes the primary account, unless an applicable narrow exception is documented. This ADR remains accepted for the first backend slice, but its iOS compatibility is under review rather than assumed. [Apple App Review Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/)

## Decision

The first backend slice will use Google Identity Services through OpenID Connect as its sole authentication provider.

Docket will:

- validate Google authentication responses on the server, including signature, accepted issuer, Docket audience, time claims, verified email, state, nonce, and cross-site request protections;
- allow a verified Google user to self-enroll a role-free Basic Docket Account for Coach or Judge onboarding;
- require an approved organization-managed Google Workspace account before Platform Administrator or Legal and Privacy Operations permission may be granted;
- link each Docket Account to exactly one current stable Google issuer and subject identifier and enforce that one subject belongs to at most one Docket Account;
- keep Docket roles and scoped permissions separate from authentication;
- allow one Docket Account to hold multiple roles and switch among them through a native Active Role Context selector while evaluating every action within that exact context;
- keep the current context independent per browser tab, unavoidably synchronize the last-used context across devices including privileged contexts, alert on privileged restoration, persistently display the role and scope with privileged contexts visually distinct, and prevent switching until unsaved work is resolved;
- bind deep links and notifications to explicit contexts, revalidate current authority on every request, and retain ordinary context events for two years versus privileged context entry and exit for seven years;
- expire ordinary sessions after 12 hours of inactivity or seven days absolute and platform-privileged sessions after 30 minutes of inactivity or 12 hours absolute;
- allow at most five concurrent ordinary sessions and one privileged session per Account, replacing the prior privileged session when a new one starts;
- require Google reauthentication within 10 minutes for ownership transfer, role or permission changes, identity-link replacement, Legal Hold actions, sensitive-data exports, Account suspension, and Final Results publication or correction; and
- bind each private Access Offer to one verified Google email and exact authority scope, deliver it by email and the separate Access Inbox, use explicit acceptance and short expiry, reject exclusivity conflicts, and permit pre-acceptance revocation and replacement;
- prohibit Access Offer batching and require individual validation and issuance for every private School, tournament, and platform authority grant;
- use a controlled, evidence-backed Platform Identity Review with authority-sensitive approval cardinality for link replacement and duplicate Account conflicts, delete the submitted evidence after 30 days, and preserve a content-free decision record for two or seven years;
- allow the affected holder one 14-day reconsideration using new evidence or a specific process error, decided without the original approvers and appended as a new immutable decision;
- use temporary, independently reviewed Docket Account Suspension for documented security, fraud, abuse, or legal risk, with one independently reviewed challenge, 90-day evidence deletion, a minimized two- or seven-year decision record, independently approved reinstatement, and extensions capped at 30 days;
- preserve existing authority during suspension while using ordinary reassignment and recovery paths for continuity and privacy-minimized notices; and
- permit seven-day-cancellable voluntary Account deactivation only after exclusive duties are transferred, require Google Reauthentication or a timely Identity Review to cancel, and make execution irreversible while deleting unnecessary profile data within 30 days and preserving independently retained names and history.

Docket imports only the stable Google subject, verified email, and Google display name. It does not import the Google profile image or request unrelated Google product or demographic data. A governed Docket Display Name may change through self-service once every 30 days or earlier after a documented Platform Administrator safety or identity correction, while historical publications retain the name originally used. A fresh-Google-reauthenticated Account Data Export is generated asynchronously, limited to one completed export per 24 hours, downloaded only through the authenticated Account, never emailed as an attachment, and deleted after seven days. Docket retains only two years of the narrow Account Security History selected by the product owner.

Tournament discovery is not authentication or an Access Offer. Competitors, Judges, and Coaches self-create Basic Docket Accounts, and the application's Invitations section lists active Tournament Invitation Pages through the Active Tournament Directory. A record-only Competitor exists solely as a non-production test fixture under ADR 0030. Access Offers remain only for School Membership and tournament or platform authority and live in a separate Access Inbox.

Docket will not:

- store or administer passwords, passkeys, TOTP secrets, SMS factors, recovery codes, or other login factors;
- infer a School Membership or any role from an email domain or Google Workspace membership;
- auto-link or merge existing Docket Accounts based only on matching email or profile attributes; or
- provide a local-password fallback, administrator bypass, or impersonation route when Google authentication or recovery is unavailable.

Google is responsible for primary sign-in, additional-factor enrollment and challenges, Google-account security policy, and Google-account recovery.

An inaccessible, deleted, or Google-suspended account prevents new authentication but does not delete the Docket Account, its grants, or historical attribution. Verified email or profile changes retain the same Docket Account when the stable issuer and subject are unchanged. During a Google outage, already-valid Docket sessions continue only until their ordinary expiration; sign-in, renewal, identity changes, and reauthentication-guarded commands remain unavailable.

## Consequences

- Docket's authentication availability depends on Google, and there is no weaker emergency login path.
- The backend requires a small, isolated OpenID Connect adapter and runtime claim validation.
- Authorization remains testable as Docket domain policy independently of the authentication provider.
- Public iOS release is blocked until Docket documents an applicable Guideline 4.8 exception or a later ADR adds Sign in with Apple through the same provider-neutral Account and authorization model.
- A changed email address does not create a new Docket identity or transfer authority.
- Competitor School-linkage and minor-user privacy safeguards still require separate decisions.
