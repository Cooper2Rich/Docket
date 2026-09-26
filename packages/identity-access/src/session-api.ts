import { Value } from "@sinclair/typebox/value";
import {
  CreateDocketSessionRequestSchema,
  DocketSessionListSchema,
  DocketSessionResultSchema,
  ListDocketSessionsRequestSchema,
  RevokeDocketSessionRequestSchema,
  StableErrorEnvelopeSchema,
} from "./contracts.js";
import {
  IdentityError,
  type ClerkIdentity,
  type IdentityService,
} from "./identity-service.js";

export type SessionApiResponse = Readonly<{ status: number; body: unknown }>;

type SessionService = Pick<
  IdentityService,
  "createDocketSession" | "listDocketSessions" | "revokeDocketSession"
>;

function response(status: number, body: unknown): SessionApiResponse {
  return { status, body };
}

function stableError(
  code:
    | "AUTHENTICATION_REQUIRED"
    | "AUTHORITY_STALE"
    | "IDENTITY_INVALID"
    | "SESSION_EXPIRED"
    | "SESSION_LIMIT_REACHED"
    | "FIXED_IDENTITY_FORBIDDEN"
    | "REQUEST_INVALID"
    | "RESPONSE_INVALID",
  message: string,
  requestId: string,
  status: number,
): SessionApiResponse {
  const body = { code, message, requestId };
  if (!Value.Check(StableErrorEnvelopeSchema, body)) {
    throw new Error("stable error envelope construction failed");
  }
  return response(status, body);
}

function domainError(error: unknown, requestId: string): SessionApiResponse {
  if (!(error instanceof IdentityError)) throw error;
  const definitions = {
    AUTHORITY_STALE: [409, "The record changed. Reload and try again."],
    IDENTITY_INVALID: [401, "The identity evidence was not accepted."],
    SESSION_EXPIRED: [401, "The session is no longer active."],
    SESSION_LIMIT_REACHED: [409, "The Account has reached its session limit."],
    FIXED_IDENTITY_FORBIDDEN: [
      403,
      "Fixed identity is unavailable in this environment.",
    ],
  } as const;
  const [status, message] = definitions[error.code];
  return stableError(error.code, message, requestId, status);
}

function requireIdentity(
  identity: ClerkIdentity | null,
  requestId: string,
): ClerkIdentity | SessionApiResponse {
  return (
    identity ??
    stableError(
      "AUTHENTICATION_REQUIRED",
      "Authentication is required.",
      requestId,
      401,
    )
  );
}

function isResponse(
  value: ClerkIdentity | SessionApiResponse,
): value is SessionApiResponse {
  return "status" in value && "body" in value;
}

export async function createSessionResponse(
  service: SessionService,
  identity: ClerkIdentity | null,
  input: unknown,
  requestId: string,
): Promise<SessionApiResponse> {
  if (!Value.Check(CreateDocketSessionRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireIdentity(identity, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const result = await service.createDocketSession({
      identity: authenticated,
      idempotencyKey: input.idempotencyKey,
    });
    const body = { account: result.account, session: result.session };
    return Value.Check(DocketSessionResultSchema, body)
      ? response(200, body)
      : stableError(
          "RESPONSE_INVALID",
          "The response did not match its contract.",
          requestId,
          500,
        );
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function listSessionsResponse(
  service: SessionService,
  identity: ClerkIdentity | null,
  input: unknown,
  requestId: string,
): Promise<SessionApiResponse> {
  if (!Value.Check(ListDocketSessionsRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireIdentity(identity, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const body = { sessions: await service.listDocketSessions(authenticated) };
    return Value.Check(DocketSessionListSchema, body)
      ? response(200, body)
      : stableError(
          "RESPONSE_INVALID",
          "The response did not match its contract.",
          requestId,
          500,
        );
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function revokeSessionResponse(
  service: SessionService,
  identity: ClerkIdentity | null,
  input: unknown,
  requestId: string,
): Promise<SessionApiResponse> {
  if (!Value.Check(RevokeDocketSessionRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireIdentity(identity, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const result = await service.revokeDocketSession({
      identity: authenticated,
      sessionId: input.sessionId,
      expectedVersion: input.expectedVersion,
      idempotencyKey: input.idempotencyKey,
    });
    const body = { account: result.account, session: result.session };
    return Value.Check(DocketSessionResultSchema, body)
      ? response(200, body)
      : stableError(
          "RESPONSE_INVALID",
          "The response did not match its contract.",
          requestId,
          500,
        );
  } catch (error) {
    return domainError(error, requestId);
  }
}
