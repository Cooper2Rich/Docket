# communications contract reference

Generated from the module-owned executable definition at contract version `1.0.0`.

## CommunicationsError

Contract ID: `CommunicationsError.v1`

- `code` (required)
- `message` (required)
- `requestId` (required)

## CreateNoticeIntentRequest

Contract ID: `CreateNoticeIntentRequest.v1`

- `body` (required)
- `causationId` (required)
- `correlationId` (required)
- `expectedAuthorityVersion` (required)
- `expectedVersion` (required)
- `idempotencyKey` (required)
- `noticeIntentId` (required)
- `recipientAccountId` (required)
- `subject` (required)

## CreateNoticeIntentResult

Contract ID: `CreateNoticeIntentResult.v1`

- `intent` (required)
- `outbox` (required)

## DeliverNoticeRequest

Contract ID: `DeliverNoticeRequest.v1`

- `envelope` (required)

## DeliverNoticeResult

Contract ID: `DeliverNoticeResult.v1`

- `equivalentRetry` (required)
- `noticeIntentId` (required)
- `state` (required)

## DeliveryAttempt

Contract ID: `DeliveryAttempt.v1`

- `attemptNumber` (required)
- `completedAt` (optional)
- `id` (required)
- `nextAttemptAt` (optional)
- `noticeIntentId` (required)
- `providerCode` (optional)
- `startedAt` (required)
- `state` (required)

## InboxItem

Contract ID: `InboxItem.v1`

- `body` (required)
- `createdAt` (required)
- `deliveryState` (required)
- `id` (required)
- `noticeIntentId` (required)
- `recipientAccountId` (required)
- `subject` (required)
- `version` (required)

## NoticeIntent

Contract ID: `NoticeIntent.v1`

- `audience` (required)
- `body` (required)
- `causationId` (required)
- `correlationId` (required)
- `createdAt` (required)
- `eventVersion` (required)
- `id` (required)
- `initiatingActorId` (required)
- `recipientAccountId` (required)
- `retainedUntil` (required)
- `state` (required)
- `subject` (required)
- `version` (required)

## OutboxEnvelope

Contract ID: `OutboxEnvelope.v1`

- `aggregateId` (required)
- `causationId` (required)
- `correlationId` (required)
- `eventName` (required)
- `eventVersion` (required)
- `id` (required)
- `occurredAt` (required)
- `payload` (required)

## ReadAccessInboxRequest

Contract ID: `ReadAccessInboxRequest.v1`

- `recipientAccountId` (required)

## ReadAccessInboxResult

Contract ID: `ReadAccessInboxResult.v1`

- `items` (required)
