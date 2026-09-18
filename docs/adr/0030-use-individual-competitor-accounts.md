---
status: accepted
---

# Use individual Competitor Accounts

In Docket's full production capacity, each Competitor is an individual authenticated Docket Account rather than a School-owned person record. This gives the student a stable identity across tournaments and enables direct participant access, while School representation remains a separate tournament and roster relationship whose authorization rules must be designed explicitly.

Only a School Roster Manager may initiate a Competitor School Invitation, and only the identified Competitor may accept it; email-domain matching and Competitor-initiated affiliation are prohibited. The invitation is bound to any exact email address that Clerk recognizes as verified, delivered by email and the private Account inbox, expires after seven days, and cannot be retargeted. The address need not be associated with Google social sign-in. One Competitor Account has exactly one current School Affiliation. Accepting a destination School's invitation replaces the current affiliation without creating a new Account.

The Competitor's profile settings, personal tournament history, and their own authorized Feedback follow the Account across School transfer. Historical Represented-School Tournament Records retain the School represented at the time and include operated Entries and rosters, Pairings, School-directed notices, authorized Ballots and Feedback, released points, results, and corrections. Current Coaching Staff and the School Manager for that represented School retain its still-available records, and the Competitor cannot revoke that School authority; governed privacy and safety restrictions still apply. The destination School receives only information needed for affiliation and records from Entries representing it. Opponent-private information, Judge assessment data, safety evidence, staff investigations, former-School private notes, attestations, accommodations, communications, and unrelated internal records never transfer.

Transfer is immediate for future activity, but an existing Entry continues to represent its recorded School through that tournament and prevents the Competitor from representing both Schools there. Docket notifies the Competitor and authorized Managers of both Schools.

Corrections to a historical Entry notify the Competitor and current Coaching Staff and School Manager of the School represented by that Entry; the destination School is notified only if one of its represented Entries changes. Neither School nor Competitor may erase retention-protected represented-School evidence early.

School Data Export is deferred under [ADR 0038](0038-defer-school-data-export-to-a-later-release.md). Release 1 preserves represented-School history and its privacy, retention, and access boundaries without authorizing export generation, delivery, sharing, or public verification.

School Entry Managers remain responsible for preparing, submitting, updating, and withdrawing Entries. A Competitor confirms identity, represented School, and event before first submission and may report an error, but cannot independently submit, withdraw, accept, or reject an Entry. Account suspension blocks the Competitor's access without withdrawing an Entry or deciding a competitive outcome. For a minor Competitor, an authorized School actor must record a minimized one-school-year authorization attesting that the required permission and consent exist; authentication is not consent.

Record-only Competitors may be uploaded solely as non-production test fixtures while the software is being exercised. A test fixture does not establish a production identity, authentication, School authority, or migration shortcut and cannot appear in a production tournament.

This supersedes ADR 0002 and ADR 0003. Existing decisions about preserving historical Entry School attribution and preventing cross-School private-data disclosure remain goals, but their School-owned-record mechanism is no longer the production model.
