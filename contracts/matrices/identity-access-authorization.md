# identity-access authorization matrix

| Actor | Operation | Resource | Condition | Decision | Error |
| --- | --- | --- | --- | --- | --- |
| anonymous | getIdentitySession | any-session | no server-validated identity | deny | AUTHENTICATION_REQUIRED |
| authenticated-account | getIdentitySession | own-session | current server-validated identity and authority | allow | — |
| stale-authority | getIdentitySession | own-session | authority version is no longer current | deny | AUTHORITY_STALE |
