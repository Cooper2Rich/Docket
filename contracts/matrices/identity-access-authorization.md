# identity-access authorization matrix

| Actor | Operation | Resource | Condition | Decision | Error |
| --- | --- | --- | --- | --- | --- |
| anonymous | createDocketSession | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | createDocketSession | own-sessions | current server-validated Clerk identity | allow | — |
| anonymous | getIdentitySession | any-session | no server-validated identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | getIdentitySession | own-session | current server-validated identity and authority | allow | — |
| stale-authority | getIdentitySession | own-session | authority version is no longer current | deny | AUTHORITY_STALE |
| anonymous | listDocketSessions | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | listDocketSessions | own-sessions | current server-validated Clerk identity | allow | — |
| anonymous | revokeDocketSession | any-session | no server-validated Clerk identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | revokeDocketSession | own-sessions | current server-validated Clerk identity | allow | — |
