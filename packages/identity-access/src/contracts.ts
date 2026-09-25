import type { ContractSource } from "@docket/contracts";
import { Type } from "@sinclair/typebox";

const identifier = Type.String({ minLength: 1, maxLength: 128 });

export const IdentitySessionRequestSchema = Type.Object(
  {
    audience: Type.Literal("self"),
  },
  {
    $id: "IdentitySessionRequest.v1",
    additionalProperties: false,
  },
);

export const IdentitySessionProjectionSchema = Type.Object(
  {
    authenticated: Type.Literal(true),
    userId: identifier,
    audience: Type.Literal("self"),
  },
  {
    $id: "IdentitySessionProjection.v1",
    additionalProperties: false,
  },
);

export const StableErrorEnvelopeSchema = Type.Object(
  {
    code: Type.Union([
      Type.Literal("AUTHENTICATION_REQUIRED"),
      Type.Literal("AUTHORITY_STALE"),
      Type.Literal("REQUEST_INVALID"),
      Type.Literal("RESPONSE_INVALID"),
    ]),
    message: Type.String({ minLength: 1 }),
    requestId: identifier,
    fieldIssues: Type.Optional(
      Type.Array(
        Type.Object(
          {
            path: Type.String(),
            message: Type.String(),
          },
          { additionalProperties: false },
        ),
      ),
    ),
  },
  {
    $id: "StableErrorEnvelope.v1",
    additionalProperties: false,
  },
);

export const identityAccessContractSource = {
  module: "identity-access",
  version: "1.0.0",
  requirements: ["R1-AUTH-001", "R1-PRIV-001"],
  schemas: [
    { name: "IdentitySessionRequest", schema: IdentitySessionRequestSchema },
    {
      name: "IdentitySessionProjection",
      schema: IdentitySessionProjectionSchema,
    },
    { name: "StableErrorEnvelope", schema: StableErrorEnvelopeSchema },
  ],
  operations: [
    {
      operationId: "getIdentitySession",
      method: "get",
      path: "/v1/session",
      summary:
        "Return the authenticated Account holder's own session projection.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "IdentitySessionRequest",
      successSchema: "IdentitySessionProjection",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "AUTHORITY_STALE",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
    },
  ],
  transitions: [
    {
      from: "active",
      command: "expire",
      guard: "absolute or inactivity limit reached",
      to: "expired",
      rejectedFrom: ["expired", "revoked"],
    },
    {
      from: "active",
      command: "revoke",
      guard: "current session authority",
      to: "revoked",
      rejectedFrom: ["expired", "revoked"],
    },
  ],
  authorization: [
    {
      actor: "authenticated-account",
      operationId: "getIdentitySession",
      resource: "own-session",
      condition: "current server-validated identity and authority",
      decision: "allow",
    },
    {
      actor: "anonymous",
      operationId: "getIdentitySession",
      resource: "any-session",
      condition: "no server-validated identity",
      decision: "deny",
      errorCode: "AUTHENTICATION_REQUIRED",
    },
    {
      actor: "stale-authority",
      operationId: "getIdentitySession",
      resource: "own-session",
      condition: "authority version is no longer current",
      decision: "deny",
      errorCode: "AUTHORITY_STALE",
    },
  ],
  errors: [
    {
      code: "AUTHENTICATION_REQUIRED",
      status: 401,
      safeMessage: "Authentication is required.",
    },
    {
      code: "AUTHORITY_STALE",
      status: 409,
      safeMessage: "The current authority is stale.",
    },
    {
      code: "REQUEST_INVALID",
      status: 400,
      safeMessage: "The request is invalid.",
    },
    {
      code: "RESPONSE_INVALID",
      status: 500,
      safeMessage: "The response did not match its contract.",
    },
  ],
  goldenVectors: [
    {
      id: "identity-session-self-success-v1",
      contractVersion: "1.0.0",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      input: { audience: "self" },
      expected: {
        authenticated: true,
        userId: "account_fixture_001",
        audience: "self",
      },
      provenance: "synthetic-foundation-fixture",
    },
    {
      id: "identity-session-authentication-required-v1",
      contractVersion: "1.0.0",
      requirements: ["R1-AUTH-001"],
      input: { audience: "self" },
      expected: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        requestId: "request_fixture_001",
      },
      provenance: "synthetic-foundation-fixture",
    },
  ],
} as const satisfies ContractSource;
