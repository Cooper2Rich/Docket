# identity-access audience matrix

| Operation | Audience | Projection |
| --- | --- | --- |
| changeDisplayName | account-self | DocketSessionResult |
| createDocketSession | account-self | DocketSessionResult |
| enterActiveRoleContext | account-self | EnterActiveRoleContextResult |
| getAccountProfile | account-self | AccountProfileProjection |
| getIdentitySession | account-self | IdentitySessionProjection |
| inspectRoleContextDeepLink | account-self | RoleContextDeepLinkDecision |
| leaveActiveRoleContext | account-self | LeaveActiveRoleContextResult |
| listAccountSecurityHistory | account-self | AccountSecurityHistoryList |
| listDocketSessions | account-self | DocketSessionList |
| listRoleContexts | account-self | RoleContextSelector |
| restoreMostRecentRoleContext | account-self | RoleContextSelector |
| revokeAllDocketSessions | account-self | DocketSessionResult |
| revokeDocketSession | account-self | DocketSessionResult |
