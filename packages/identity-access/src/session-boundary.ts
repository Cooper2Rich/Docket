import { Value } from "@sinclair/typebox/value";
import {
  IdentitySessionProjectionSchema,
  IdentitySessionRequestSchema,
  StableErrorEnvelopeSchema,
} from "./contracts.js";

export type IdentitySessionAuthority = Readonly<{
  userId: string;
  sessionId: string;
  authorityVersion: string;
  currentAuthorityVersion: string;
}>;

export type IdentitySessionBoundaryResponse = Readonly<{
  status: number;
  body: unknown;
}>;

function stableError(
  code:
    | "AUTHENTICATION_REQUIRED"
    | "AUTHORITY_STALE"
    | "REQUEST_INVALID"
    | "RESPONSE_INVALID",
  message: string,
  requestId: string,
  status: number,
): IdentitySessionBoundaryResponse {
  const body = { code, message, requestId };
  if (!Value.Check(StableErrorEnvelopeSchema, body)) {
    throw new Error("stable error envelope construction failed");
  }
  return { status, body };
}

/**
 * Read-only authoritative query boundary for the generated session client.
 * Authentication evidence is server-derived; callers cannot supply it through
 * the request payload.
 */
export function resolveIdentitySession(
  input: unknown,
  authority: IdentitySessionAuthority | null,
  requestId: string,
): IdentitySessionBoundaryResponse {
  if (!Value.Check(IdentitySessionRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  if (!authority) {
    return stableError(
      "AUTHENTICATION_REQUIRED",
      "Authentication is required.",
      requestId,
      401,
    );
  }
  if (
    !authority.userId ||
    !authority.sessionId ||
    !authority.authorityVersion ||
    authority.authorityVersion !== authority.currentAuthorityVersion
  ) {
    return stableError(
      "AUTHORITY_STALE",
      "The current authority is stale.",
      requestId,
      409,
    );
  }

  const projection: unknown = {
    authenticated: true,
    userId: authority.userId,
    audience: "self",
  };
  if (!Value.Check(IdentitySessionProjectionSchema, projection)) {
    return stableError(
      "RESPONSE_INVALID",
      "The response did not match its contract.",
      requestId,
      500,
    );
  }
  return { status: 200, body: projection };
}
