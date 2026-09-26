# identity-access authorization matrix

| Actor | Operation | Resource | Condition | Decision | Error |
| --- | --- | --- | --- | --- | --- |
| anonymous | changeDisplayName | any-account-profile | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | changeDisplayName | own-account-profile | current server-validated Clerk identity, active Docket Session and current Account version | allow | — |
| anonymous | createDocketSession | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | createDocketSession | own-sessions | current server-validated Clerk identity | allow | — |
| anonymous | getAccountProfile | any-account-profile | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | getAccountProfile | own-account-profile | current server-validated Clerk identity and active Docket Session | allow | — |
| anonymous | getIdentitySession | any-session | no server-validated identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | getIdentitySession | own-session | current server-validated identity and authority | allow | — |
| stale-authority | getIdentitySession | own-session | authority version is no longer current | deny | AUTHORITY_STALE |
| anonymous | listAccountSecurityHistory | any-account-security-history | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | listAccountSecurityHistory | own-account-security-history | current server-validated Clerk identity and active Docket Session | allow | — |
| anonymous | listDocketSessions | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | listDocketSessions | own-sessions | current server-validated Clerk identity | allow | — |
| anonymous | revokeAllDocketSessions | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | revokeAllDocketSessions | own-sessions | current server-validated Clerk identity | allow | — |
| anonymous | revokeDocketSession | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | revokeDocketSession | own-sessions | current server-validated Clerk identity | allow | — |
