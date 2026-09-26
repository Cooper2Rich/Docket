# identity-access audience matrix

| Operation | Audience | Projection |
| --- | --- | --- |
| changeDisplayName | account-self | DocketSessionResult |
| createDocketSession | account-self | DocketSessionResult |
| getAccountProfile | account-self | AccountProfileProjection |
| getIdentitySession | account-self | IdentitySessionProjection |
| listAccountSecurityHistory | account-self | AccountSecurityHistoryList |
| listDocketSessions | account-self | DocketSessionList |
| revokeAllDocketSessions | account-self | DocketSessionResult |
| revokeDocketSession | account-self | DocketSessionResult |
