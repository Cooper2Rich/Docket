import type { ContractSource } from "@docket/contracts";
import { Type, type Static } from "@sinclair/typebox";

const Identifier = Type.String({ minLength: 1, maxLength: 128 });
const Instant = Type.String({ minLength: 20, maxLength: 35 });

export const OutboxEnvelopeSchema = Type.Object(
  {
    id: Identifier,
    eventName: Type.Union([
      Type.Literal("NoticeRequested"),
      Type.Literal("NoticeDelivered"),
      Type.Literal("NoticeDeliveryFailed"),
      Type.Literal("NoticeEscalated"),
    ]),
    eventVersion: Type.Literal(1),
    aggregateId: Identifier,
    correlationId: Identifier,
    causationId: Identifier,
    occurredAt: Instant,
    payload: Type.Object(
      { noticeIntentId: Identifier },
      { additionalProperties: false },
    ),
  },
  { $id: "OutboxEnvelope.v1", additionalProperties: false },
);
export type OutboxEnvelope = Static<typeof OutboxEnvelopeSchema>;

export const NoticeIntentSchema = Type.Object(
  {
    id: Identifier,
    initiatingActorId: Identifier,
    recipientAccountId: Identifier,
    audience: Type.Literal("authorized_recipient"),
    subject: Type.String({ minLength: 1, maxLength: 160 }),
    body: Type.String({ minLength: 1, maxLength: 4_000 }),
    state: Type.Union([
      Type.Literal("queued"),
      Type.Literal("retrying"),
      Type.Literal("delivered"),
      Type.Literal("failed"),
    ]),
    version: Type.Integer({ minimum: 1 }),
    correlationId: Identifier,
    causationId: Identifier,
    eventVersion: Type.Literal(1),
    createdAt: Instant,
    retainedUntil: Instant,
  },
  { $id: "NoticeIntent.v1", additionalProperties: false },
);
export type NoticeIntent = Static<typeof NoticeIntentSchema>;

export const DeliveryAttemptSchema = Type.Object(
  {
    id: Identifier,
    noticeIntentId: Identifier,
    attemptNumber: Type.Integer({ minimum: 1 }),
    state: Type.Union([
      Type.Literal("started"),
      Type.Literal("delivered"),
      Type.Literal("failed"),
    ]),
    providerCode: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
    startedAt: Instant,
    completedAt: Type.Optional(Instant),
    nextAttemptAt: Type.Optional(Instant),
  },
  { $id: "DeliveryAttempt.v1", additionalProperties: false },
);
export type DeliveryAttempt = Static<typeof DeliveryAttemptSchema>;

export const InboxItemSchema = Type.Object(
  {
    id: Identifier,
    noticeIntentId: Identifier,
    recipientAccountId: Identifier,
    subject: Type.String({ minLength: 1, maxLength: 160 }),
    body: Type.String({ minLength: 1, maxLength: 4_000 }),
    deliveryState: Type.Union([
      Type.Literal("pending"),
      Type.Literal("delivered"),
      Type.Literal("delivery_failed"),
    ]),
    version: Type.Integer({ minimum: 1 }),
    createdAt: Instant,
  },
  { $id: "InboxItem.v1", additionalProperties: false },
);
export type InboxItem = Static<typeof InboxItemSchema>;

export const CreateNoticeIntentRequestSchema = Type.Object(
  {
    noticeIntentId: Identifier,
    recipientAccountId: Identifier,
    subject: Type.String({ minLength: 1, maxLength: 160 }),
    body: Type.String({ minLength: 1, maxLength: 4_000 }),
    expectedAuthorityVersion: Type.Integer({ minimum: 1 }),
    expectedVersion: Type.Literal(0),
    idempotencyKey: Identifier,
    correlationId: Identifier,
    causationId: Identifier,
  },
  { $id: "CreateNoticeIntentRequest.v1", additionalProperties: false },
);
export type CreateNoticeIntentRequest = Static<
  typeof CreateNoticeIntentRequestSchema
>;

export const CreateNoticeIntentResultSchema = Type.Object(
  { intent: NoticeIntentSchema, outbox: OutboxEnvelopeSchema },
  { $id: "CreateNoticeIntentResult.v1", additionalProperties: false },
);
export type CreateNoticeIntentResult = Static<
  typeof CreateNoticeIntentResultSchema
>;

export const DeliverNoticeRequestSchema = Type.Object(
  { envelope: OutboxEnvelopeSchema },
  { $id: "DeliverNoticeRequest.v1", additionalProperties: false },
);

export const DeliverNoticeResultSchema = Type.Object(
  {
    state: Type.Literal("delivered"),
    noticeIntentId: Identifier,
    equivalentRetry: Type.Boolean(),
  },
  { $id: "DeliverNoticeResult.v1", additionalProperties: false },
);
export type DeliverNoticeResult = Static<typeof DeliverNoticeResultSchema>;

export const ReadAccessInboxRequestSchema = Type.Object(
  { recipientAccountId: Identifier },
  { $id: "ReadAccessInboxRequest.v1", additionalProperties: false },
);

export const ReadAccessInboxResultSchema = Type.Object(
  { items: Type.Array(InboxItemSchema) },
  { $id: "ReadAccessInboxResult.v1", additionalProperties: false },
);

export const CommunicationsErrorSchema = Type.Object(
  {
    code: Type.Union([
      Type.Literal("IDEMPOTENCY_CONFLICT"),
      Type.Literal("RECIPIENT_UNAUTHORIZED"),
      Type.Literal("DELIVERY_PROVIDER_FAILED"),
      Type.Literal("STALE_VERSION"),
      Type.Literal("REQUEST_INVALID"),
    ]),
    message: Type.String({ minLength: 1, maxLength: 256 }),
    requestId: Identifier,
  },
  { $id: "CommunicationsError.v1", additionalProperties: false },
);

export const communicationsContractSource = {
  module: "communications",
  version: "1.0.0",
  requirements: ["R1-MSG-001", "R1-CONS-001", "R1-PRIV-001"],
  schemas: [
    { name: "OutboxEnvelope", schema: OutboxEnvelopeSchema },
    { name: "NoticeIntent", schema: NoticeIntentSchema },
    { name: "DeliveryAttempt", schema: DeliveryAttemptSchema },
    { name: "InboxItem", schema: InboxItemSchema },
    {
      name: "CreateNoticeIntentRequest",
      schema: CreateNoticeIntentRequestSchema,
    },
    {
      name: "CreateNoticeIntentResult",
      schema: CreateNoticeIntentResultSchema,
    },
    { name: "DeliverNoticeRequest", schema: DeliverNoticeRequestSchema },
    { name: "DeliverNoticeResult", schema: DeliverNoticeResultSchema },
    { name: "ReadAccessInboxRequest", schema: ReadAccessInboxRequestSchema },
    { name: "ReadAccessInboxResult", schema: ReadAccessInboxResultSchema },
    { name: "CommunicationsError", schema: CommunicationsErrorSchema },
  ],
  operations: [
    {
      operationId: "createNoticeIntent",
      method: "post",
      path: "/v1/communications/notices",
      summary: "Commit an authorized notice intent and outbox event atomically",
      requirements: ["R1-MSG-001", "R1-CONS-001", "R1-PRIV-001"],
      inputSchema: "CreateNoticeIntentRequest",
      successSchema: "CreateNoticeIntentResult",
      errorCodes: [
        "IDEMPOTENCY_CONFLICT",
        "RECIPIENT_UNAUTHORIZED",
        "STALE_VERSION",
      ],
      audience: "initiating actor",
      inputLocation: "body",
    },
    {
      operationId: "deliverNotice",
      method: "post",
      path: "/v1/communications/notices/deliver",
      summary: "Deliver a versioned notice idempotently from the durable queue",
      requirements: ["R1-MSG-001"],
      inputSchema: "DeliverNoticeRequest",
      successSchema: "DeliverNoticeResult",
      errorCodes: ["DELIVERY_PROVIDER_FAILED", "IDEMPOTENCY_CONFLICT"],
      audience: "operations",
      inputLocation: "body",
    },
    {
      operationId: "readAccessInbox",
      method: "get",
      path: "/v1/communications/inbox",
      summary: "Read only the authenticated recipient's notice inbox",
      requirements: ["R1-PRIV-001"],
      inputSchema: "ReadAccessInboxRequest",
      successSchema: "ReadAccessInboxResult",
      errorCodes: ["RECIPIENT_UNAUTHORIZED"],
      audience: "authorized recipient",
      inputLocation: "query",
    },
  ],
  transitions: [
    {
      from: "queued",
      command: "deliverNotice",
      guard: "provider accepted",
      to: "delivered",
      rejectedFrom: [],
    },
    {
      from: "queued",
      command: "deliverNotice",
      guard: "provider failed and retries remain",
      to: "retrying",
      rejectedFrom: [],
    },
    {
      from: "retrying",
      command: "deliverNotice",
      guard: "provider accepted idempotency key",
      to: "delivered",
      rejectedFrom: [],
    },
    {
      from: "retrying",
      command: "deliverNotice",
      guard: "retry policy exhausted",
      to: "failed",
      rejectedFrom: [],
    },
  ],
  authorization: [
    {
      actor: "authorized initiating actor",
      operationId: "createNoticeIntent",
      resource: "accepted recipient projection",
      condition: "current authority version and permitted recipient",
      decision: "allow",
    },
    {
      actor: "unauthorized actor",
      operationId: "createNoticeIntent",
      resource: "private recipient",
      condition: "missing or stale authority",
      decision: "deny",
      errorCode: "RECIPIENT_UNAUTHORIZED",
    },
    {
      actor: "recipient",
      operationId: "readAccessInbox",
      resource: "own inbox",
      condition: "authenticated account matches recipient",
      decision: "allow",
    },
    {
      actor: "other account",
      operationId: "readAccessInbox",
      resource: "foreign inbox",
      condition: "account does not match recipient",
      decision: "deny",
      errorCode: "RECIPIENT_UNAUTHORIZED",
    },
  ],
  errors: [
    {
      code: "IDEMPOTENCY_CONFLICT",
      status: 409,
      safeMessage: "The idempotency key was already used for different input.",
    },
    {
      code: "RECIPIENT_UNAUTHORIZED",
      status: 403,
      safeMessage: "The requested recipient is unavailable.",
    },
    {
      code: "DELIVERY_PROVIDER_FAILED",
      status: 503,
      safeMessage: "Delivery will be retried.",
    },
    {
      code: "STALE_VERSION",
      status: 409,
      safeMessage: "The notice state changed; refresh before retrying.",
    },
    {
      code: "REQUEST_INVALID",
      status: 400,
      safeMessage: "The request is invalid.",
    },
  ],
  goldenVectors: [
    {
      id: "communications-outbox-envelope-v1",
      contractVersion: "1.0.0",
      requirements: ["R1-MSG-001"],
      input: { noticeIntentId: "notice_001" },
      expected: {
        eventName: "NoticeRequested",
        eventVersion: 1,
        payload: { noticeIntentId: "notice_001" },
      },
      provenance: "R1-COM-001-A/AC-01",
    },
  ],
} as const satisfies ContractSource;
