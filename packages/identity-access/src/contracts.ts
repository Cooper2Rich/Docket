import type { ContractSource } from "@docket/contracts";
import { Type } from "@sinclair/typebox";

const identifier = Type.String({ minLength: 1, maxLength: 128 });
const timestamp = Type.String({ minLength: 20, maxLength: 35 });

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
      Type.Literal("DISPLAY_NAME_CHANGE_TOO_SOON"),
      Type.Literal("REQUEST_INVALID"),
      Type.Literal("RESPONSE_INVALID"),
      Type.Literal("IDENTITY_INVALID"),
      Type.Literal("SESSION_EXPIRED"),
      Type.Literal("SESSION_LIMIT_REACHED"),
      Type.Literal("FIXED_IDENTITY_FORBIDDEN"),
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

export const CreateDocketSessionRequestSchema = Type.Object(
  { idempotencyKey: identifier },
  { $id: "CreateDocketSessionRequest.v1", additionalProperties: false },
);

export const ListDocketSessionsRequestSchema = Type.Object(
  { audience: Type.Literal("self") },
  { $id: "ListDocketSessionsRequest.v1", additionalProperties: false },
);

export const RevokeDocketSessionRequestSchema = Type.Object(
  {
    sessionId: identifier,
    expectedVersion: Type.Integer({ minimum: 1 }),
    idempotencyKey: identifier,
  },
  { $id: "RevokeDocketSessionRequest.v1", additionalProperties: false },
);

export const RevokeAllDocketSessionsRequestSchema = Type.Object(
  { idempotencyKey: identifier },
  {
    $id: "RevokeAllDocketSessionsRequest.v1",
    additionalProperties: false,
  },
);

export const AccountSecurityHistoryRequestSchema = Type.Object(
  { audience: Type.Literal("self") },
  {
    $id: "AccountSecurityHistoryRequest.v1",
    additionalProperties: false,
  },
);

export const AccountProfileRequestSchema = Type.Object(
  { audience: Type.Literal("self") },
  { $id: "AccountProfileRequest.v1", additionalProperties: false },
);

export const ChangeDisplayNameRequestSchema = Type.Object(
  {
    displayName: Type.String({ minLength: 1, maxLength: 128 }),
    expectedVersion: Type.Integer({ minimum: 1 }),
    idempotencyKey: identifier,
  },
  { $id: "ChangeDisplayNameRequest.v1", additionalProperties: false },
);

export const AccountProfileProjectionSchema = Type.Object(
  {
    id: identifier,
    displayName: Type.String({ minLength: 1, maxLength: 128 }),
    verifiedEmail: Type.String({ minLength: 3, maxLength: 320 }),
    authority: Type.Array(Type.String(), { maxItems: 0 }),
    version: Type.Integer({ minimum: 1 }),
  },
  { $id: "AccountProfileProjection.v1", additionalProperties: false },
);

const docketSessionProjection = Type.Object(
  {
    id: identifier,
    sessionClass: Type.Union([
      Type.Literal("ordinary"),
      Type.Literal("privileged"),
    ]),
    device: Type.String({ minLength: 1, maxLength: 256 }),
    approximateLocation: Type.String({ minLength: 1, maxLength: 256 }),
    status: Type.Union([
      Type.Literal("active"),
      Type.Literal("expired"),
      Type.Literal("revoked"),
    ]),
    version: Type.Integer({ minimum: 1 }),
    createdAt: timestamp,
    lastActivityAt: timestamp,
    privilegedActivatedAt: Type.Optional(timestamp),
    inactivityExpiresAt: timestamp,
    expiresAt: timestamp,
  },
  { additionalProperties: false },
);

export const DocketSessionResultSchema = Type.Object(
  { account: AccountProfileProjectionSchema, session: docketSessionProjection },
  { $id: "DocketSessionResult.v1", additionalProperties: false },
);

export const DocketSessionListSchema = Type.Object(
  { sessions: Type.Array(docketSessionProjection) },
  { $id: "DocketSessionList.v1", additionalProperties: false },
);

const accountSecurityHistoryProjection = Type.Object(
  {
    id: identifier,
    kind: Type.Union([
      Type.Literal("accepted_sign_in"),
      Type.Literal("clerk_reverification"),
      Type.Literal("account_suspension"),
    ]),
    occurredAt: timestamp,
    device: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
    approximateLocation: Type.Optional(
      Type.String({ minLength: 1, maxLength: 256 }),
    ),
    suspensionStatus: Type.Optional(
      Type.Union([
        Type.Literal("imposed"),
        Type.Literal("reinstated"),
        Type.Literal("expired"),
      ]),
    ),
  },
  { additionalProperties: false },
);

export const AccountSecurityHistoryListSchema = Type.Object(
  { history: Type.Array(accountSecurityHistoryProjection) },
  { $id: "AccountSecurityHistoryList.v1", additionalProperties: false },
);

export const identityAccessContractSource = {
  module: "identity-access",
  version: "1.0.0",
  requirements: ["R1-LIFE-001", "R1-AUTH-001", "R1-PRIV-001"],
  schemas: [
    { name: "IdentitySessionRequest", schema: IdentitySessionRequestSchema },
    {
      name: "IdentitySessionProjection",
      schema: IdentitySessionProjectionSchema,
    },
    { name: "StableErrorEnvelope", schema: StableErrorEnvelopeSchema },
    {
      name: "CreateDocketSessionRequest",
      schema: CreateDocketSessionRequestSchema,
    },
    {
      name: "ListDocketSessionsRequest",
      schema: ListDocketSessionsRequestSchema,
    },
    {
      name: "RevokeDocketSessionRequest",
      schema: RevokeDocketSessionRequestSchema,
    },
    {
      name: "RevokeAllDocketSessionsRequest",
      schema: RevokeAllDocketSessionsRequestSchema,
    },
    {
      name: "AccountSecurityHistoryRequest",
      schema: AccountSecurityHistoryRequestSchema,
    },
    {
      name: "AccountProfileRequest",
      schema: AccountProfileRequestSchema,
    },
    {
      name: "AccountProfileProjection",
      schema: AccountProfileProjectionSchema,
    },
    {
      name: "ChangeDisplayNameRequest",
      schema: ChangeDisplayNameRequestSchema,
    },
    { name: "DocketSessionResult", schema: DocketSessionResultSchema },
    { name: "DocketSessionList", schema: DocketSessionListSchema },
    {
      name: "AccountSecurityHistoryList",
      schema: AccountSecurityHistoryListSchema,
    },
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
    {
      operationId: "createDocketSession",
      method: "post",
      path: "/v1/docket-sessions",
      summary: "Create or recover the Account holder's Docket Session.",
      requirements: ["R1-LIFE-001", "R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "CreateDocketSessionRequest",
      successSchema: "DocketSessionResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "SESSION_LIMIT_REACHED",
        "FIXED_IDENTITY_FORBIDDEN",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "listDocketSessions",
      method: "get",
      path: "/v1/docket-sessions",
      summary: "List only the authenticated Account holder's Docket Sessions.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "ListDocketSessionsRequest",
      successSchema: "DocketSessionList",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
    },
    {
      operationId: "revokeDocketSession",
      method: "post",
      path: "/v1/docket-sessions/revoke",
      summary:
        "Revoke one of the authenticated Account holder's Docket Sessions.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "RevokeDocketSessionRequest",
      successSchema: "DocketSessionResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "revokeAllDocketSessions",
      method: "post",
      path: "/v1/docket-sessions/revoke-all",
      summary:
        "Revoke every Docket Session held by the authenticated Account holder.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "RevokeAllDocketSessionsRequest",
      successSchema: "DocketSessionResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "listAccountSecurityHistory",
      method: "get",
      path: "/v1/account/security-history",
      summary:
        "List the authenticated Account holder's retained Security History.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "AccountSecurityHistoryRequest",
      successSchema: "AccountSecurityHistoryList",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
    },
    {
      operationId: "getAccountProfile",
      method: "get",
      path: "/v1/account/profile",
      summary:
        "Return the authenticated Account holder's current Docket profile.",
      requirements: ["R1-LIFE-001", "R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "AccountProfileRequest",
      successSchema: "AccountProfileProjection",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
    },
    {
      operationId: "changeDisplayName",
      method: "post",
      path: "/v1/account/display-name",
      summary:
        "Change the authenticated Account holder's governed Docket Display Name.",
      requirements: ["R1-LIFE-001", "R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "ChangeDisplayNameRequest",
      successSchema: "DocketSessionResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "AUTHORITY_STALE",
        "DISPLAY_NAME_CHANGE_TOO_SOON",
        "IDENTITY_INVALID",
        "SESSION_EXPIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
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
    ...[
      "createDocketSession",
      "listDocketSessions",
      "revokeDocketSession",
      "revokeAllDocketSessions",
    ].flatMap((operationId) => [
      {
        actor: "authenticated-account",
        operationId,
        resource: "own-sessions",
        condition: "current server-validated Clerk identity",
        decision: "allow" as const,
      },
      {
        actor: "anonymous",
        operationId,
        resource: "any-session",
        condition: "no server-validated Clerk identity",
        decision: "deny" as const,
        errorCode: "AUTHENTICATION_REQUIRED",
      },
    ]),
    {
      actor: "authenticated-account",
      operationId: "listAccountSecurityHistory",
      resource: "own-account-security-history",
      condition:
        "current server-validated Clerk identity and active Docket Session",
      decision: "allow",
    },
    {
      actor: "anonymous",
      operationId: "listAccountSecurityHistory",
      resource: "any-account-security-history",
      condition: "no server-validated Clerk identity",
      decision: "deny",
      errorCode: "AUTHENTICATION_REQUIRED",
    },
    {
      actor: "authenticated-account",
      operationId: "getAccountProfile",
      resource: "own-account-profile",
      condition:
        "current server-validated Clerk identity and active Docket Session",
      decision: "allow",
    },
    {
      actor: "anonymous",
      operationId: "getAccountProfile",
      resource: "any-account-profile",
      condition: "no server-validated Clerk identity",
      decision: "deny",
      errorCode: "AUTHENTICATION_REQUIRED",
    },
    {
      actor: "authenticated-account",
      operationId: "changeDisplayName",
      resource: "own-account-profile",
      condition:
        "current server-validated Clerk identity, active Docket Session and current Account version",
      decision: "allow",
    },
    {
      actor: "anonymous",
      operationId: "changeDisplayName",
      resource: "any-account-profile",
      condition: "no server-validated Clerk identity",
      decision: "deny",
      errorCode: "AUTHENTICATION_REQUIRED",
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
      code: "DISPLAY_NAME_CHANGE_TOO_SOON",
      status: 409,
      safeMessage: "The Docket Display Name may be changed once every 30 days.",
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
    {
      code: "IDENTITY_INVALID",
      status: 401,
      safeMessage: "The identity evidence was not accepted.",
    },
    {
      code: "SESSION_EXPIRED",
      status: 401,
      safeMessage: "The session is no longer active.",
    },
    {
      code: "SESSION_LIMIT_REACHED",
      status: 409,
      safeMessage: "The Account has reached its session limit.",
    },
    {
      code: "FIXED_IDENTITY_FORBIDDEN",
      status: 403,
      safeMessage: "Fixed identity is unavailable in this environment.",
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
