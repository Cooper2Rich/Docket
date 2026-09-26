# identity-access contract reference

Generated from the module-owned executable definition at contract version `1.0.0`.

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

## IdentitySessionProjection

Contract ID: `IdentitySessionProjection.v1`

- `audience` (required)
- `authenticated` (required)
- `userId` (required)

## IdentitySessionRequest

Contract ID: `IdentitySessionRequest.v1`

- `audience` (required)

## ListDocketSessionsRequest

Contract ID: `ListDocketSessionsRequest.v1`

- `audience` (required)

## RevokeDocketSessionRequest

Contract ID: `RevokeDocketSessionRequest.v1`

- `expectedVersion` (required)
- `idempotencyKey` (required)
- `sessionId` (required)

## StableErrorEnvelope

Contract ID: `StableErrorEnvelope.v1`

- `code` (required)
- `fieldIssues` (optional)
- `message` (required)
- `requestId` (required)
