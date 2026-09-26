# identity-access contract reference

Generated from the module-owned executable definition at contract version `1.1.0`.

## AccountProfileProjection

Contract ID: `AccountProfileProjection.v1`

- `authority` (required)
- `displayName` (required)
- `id` (required)
- `verifiedEmail` (required)
- `version` (required)

## AccountProfileRequest

Contract ID: `AccountProfileRequest.v1`

- `audience` (required)

## AccountSecurityHistoryList

Contract ID: `AccountSecurityHistoryList.v1`

- `history` (required)

## AccountSecurityHistoryRequest

Contract ID: `AccountSecurityHistoryRequest.v1`

- `audience` (required)

## ActiveRoleContext

Contract ID: `ActiveRoleContext.v1`

- `authorityVersion` (required)
- `contextKind` (required)
- `grantId` (required)
- `id` (required)
- `privileged` (required)
- `scopeId` (required)
- `scopeLabel` (required)
- `version` (required)

## AuthorityDecision

Contract ID: `AuthorityDecision.v1`

- `allowed` (required)
- `context` (required)

## ChangeDisplayNameRequest

Contract ID: `ChangeDisplayNameRequest.v1`

- `displayName` (required)
- `expectedVersion` (required)
- `idempotencyKey` (required)

## ClerkReverificationEvidence

Contract ID: `ClerkReverificationEvidence.v1`

- `clerkSessionId` (required)
- `signatureValidated` (required)
- `verificationId` (required)
- `verifiedAt` (required)

## CreateDocketSessionRequest

Contract ID: `CreateDocketSessionRequest.v1`

- `idempotencyKey` (required)

## DocketSessionList

Contract ID: `DocketSessionList.v1`

- `sessions` (required)

## DocketSessionResult

Contract ID: `DocketSessionResult.v1`

- `account` (required)
- `session` (required)

## EnterActiveRoleContextRequest

Contract ID: `EnterActiveRoleContextRequest.v1`

- `expectedCurrentContextId` (optional)
- `expectedCurrentVersion` (optional)
- `grantId` (required)
- `idempotencyKey` (required)
- `switchDecision` (required)
- `tabId` (required)

## EnterActiveRoleContextResult

Contract ID: `EnterActiveRoleContextResult.v1`

- `cacheInvalidation` (required)
- `context` (required)

## IdentitySessionProjection

Contract ID: `IdentitySessionProjection.v1`

- `audience` (required)
- `authenticated` (required)
- `userId` (required)

## IdentitySessionRequest

Contract ID: `IdentitySessionRequest.v1`

- `audience` (required)

## InspectRoleContextDeepLinkRequest

Contract ID: `InspectRoleContextDeepLinkRequest.v1`

- `requiredGrantId` (required)
- `tabId` (required)

## LeaveActiveRoleContextRequest

Contract ID: `LeaveActiveRoleContextRequest.v1`

- `expectedCurrentContextId` (required)
- `expectedCurrentVersion` (required)
- `tabId` (required)

## LeaveActiveRoleContextResult

Contract ID: `LeaveActiveRoleContextResult.v1`

- `cacheInvalidation` (required)

## ListDocketSessionsRequest

Contract ID: `ListDocketSessionsRequest.v1`

- `audience` (required)

## ListRoleContextsRequest

Contract ID: `ListRoleContextsRequest.v1`

- `tabId` (required)

## RestoreMostRecentRoleContextRequest

Contract ID: `RestoreMostRecentRoleContextRequest.v1`

- `idempotencyKey` (required)
- `tabId` (required)

## RevokeAllDocketSessionsRequest

Contract ID: `RevokeAllDocketSessionsRequest.v1`

- `idempotencyKey` (required)

## RevokeDocketSessionRequest

Contract ID: `RevokeDocketSessionRequest.v1`

- `expectedVersion` (required)
- `idempotencyKey` (required)
- `sessionId` (required)

## RoleContextCacheInvalidation

Contract ID: `RoleContextCacheInvalidation.v1`

- `closeOpenViews` (required)
- `destroyProtectedCache` (required)
- `previousContextId` (optional)

## RoleContextDeepLinkDecision

Contract ID: `RoleContextDeepLinkDecision.v1`

- `decision` (required)

## RoleContextOption

Contract ID: `RoleContextOption.v1`

- `authorityVersion` (required)
- `contextKind` (required)
- `grantId` (required)
- `privileged` (required)
- `scopeId` (required)
- `scopeLabel` (required)

## RoleContextSelector

Contract ID: `RoleContextSelector.v1`

- `contexts` (required)
- `current` (optional)

## StableErrorEnvelope

Contract ID: `StableErrorEnvelope.v1`

- `code` (required)
- `fieldIssues` (optional)
- `message` (required)
- `requestId` (required)
