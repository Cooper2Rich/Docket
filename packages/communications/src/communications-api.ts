import { Value } from "@sinclair/typebox/value";
import {
  CommunicationsErrorSchema,
  CreateNoticeIntentRequestSchema,
  CreateNoticeIntentResultSchema,
  ReadAccessInboxRequestSchema,
  ReadAccessInboxResultSchema,
} from "./contracts.js";
import {
  CommunicationsError,
  type CommunicationsActor,
  type CommunicationsService,
} from "./communications-service.js";

export type CommunicationsApiResponse = Readonly<{
  status: number;
  body: unknown;
}>;

type CommunicationsApiService = Pick<
  CommunicationsService,
  "createNoticeIntent" | "readAccessInbox"
>;

function errorResponse(
  code:
    | "IDEMPOTENCY_CONFLICT"
    | "RECIPIENT_UNAUTHORIZED"
    | "DELIVERY_PROVIDER_FAILED"
    | "STALE_VERSION"
    | "REQUEST_INVALID",
  message: string,
  requestId: string,
  status: number,
): CommunicationsApiResponse {
  const body = { code, message, requestId };
  if (!Value.Check(CommunicationsErrorSchema, body)) {
    throw new Error("COMMUNICATIONS_ERROR_CONSTRUCTION_FAILED");
  }
  return { status, body };
}

function domainError(
  error: unknown,
  requestId: string,
): CommunicationsApiResponse {
  if (!(error instanceof CommunicationsError)) throw error;
  const definitions = {
    IDEMPOTENCY_CONFLICT: [
      409,
      "The idempotency key was already used for different input.",
    ],
    RECIPIENT_UNAUTHORIZED: [403, "The requested recipient is unavailable."],
    DELIVERY_PROVIDER_FAILED: [503, "Delivery will be retried."],
    STALE_VERSION: [409, "The notice state changed; refresh before retrying."],
    REQUEST_INVALID: [400, "The request is invalid."],
  } as const;
  const [status, message] = definitions[error.code];
  return errorResponse(error.code, message, requestId, status);
}

export async function createNoticeIntentResponse(
  service: CommunicationsApiService,
  actor: CommunicationsActor | null,
  input: unknown,
  requestId: string,
): Promise<CommunicationsApiResponse> {
  if (!Value.Check(CreateNoticeIntentRequestSchema, input)) {
    return errorResponse(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  if (!actor) {
    return errorResponse(
      "RECIPIENT_UNAUTHORIZED",
      "The requested recipient is unavailable.",
      requestId,
      403,
    );
  }
  try {
    const body = await service.createNoticeIntent(actor, input);
    if (!Value.Check(CreateNoticeIntentResultSchema, body)) {
      throw new Error("COMMUNICATIONS_RESPONSE_INVALID");
    }
    return { status: 200, body };
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function readAccessInboxResponse(
  service: CommunicationsApiService,
  actor: CommunicationsActor | null,
  input: unknown,
  requestId: string,
): Promise<CommunicationsApiResponse> {
  if (!Value.Check(ReadAccessInboxRequestSchema, input)) {
    return errorResponse(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  if (!actor) {
    return errorResponse(
      "RECIPIENT_UNAUTHORIZED",
      "The requested recipient is unavailable.",
      requestId,
      403,
    );
  }
  try {
    const body = await service.readAccessInbox(actor, input.recipientAccountId);
    if (!Value.Check(ReadAccessInboxResultSchema, body)) {
      throw new Error("COMMUNICATIONS_RESPONSE_INVALID");
    }
    return { status: 200, body };
  } catch (error) {
    return domainError(error, requestId);
  }
}
