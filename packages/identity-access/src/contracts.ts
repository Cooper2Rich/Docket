import type { ContractSource } from "@docket/contracts";
import { Type } from "@sinclair/typebox";

const identifier = Type.String({ minLength: 1, maxLength: 128 });
const timestamp = Type.String({ minLength: 20, maxLength: 35 });
const roleContextKind = Type.Union([
  Type.Literal("school"),
  Type.Literal("tournament"),
  Type.Literal("judge"),
  Type.Literal("platform_administrator"),
  Type.Literal("legal_and_privacy_operations"),
]);

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
      Type.Literal("AUTHORITY_DENIED"),
      Type.Literal("CONTEXT_STALE"),
      Type.Literal("REAUTHENTICATION_REQUIRED"),
      Type.Literal("ROLE_SWITCH_BLOCKED"),
      Type.Literal("IDEMPOTENCY_CONFLICT"),
      Type.Literal("RECIPIENT_UNAUTHORIZED"),
      Type.Literal("DELIVERY_PROVIDER_FAILED"),
      Type.Literal("STALE_VERSION"),
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

export const ListRoleContextsRequestSchema = Type.Object(
  { tabId: identifier },
  { $id: "ListRoleContextsRequest.v1", additionalProperties: false },
);

export const RoleContextOptionSchema = Type.Object(
  {
    grantId: identifier,
    contextKind: roleContextKind,
    scopeId: identifier,
    scopeLabel: Type.String({ minLength: 1, maxLength: 256 }),
    privileged: Type.Boolean(),
    authorityVersion: Type.Integer({ minimum: 1 }),
  },
  { $id: "RoleContextOption.v1", additionalProperties: false },
);

export const ActiveRoleContextSchema = Type.Object(
  {
    id: identifier,
    grantId: identifier,
    contextKind: roleContextKind,
    scopeId: identifier,
    scopeLabel: Type.String({ minLength: 1, maxLength: 256 }),
    privileged: Type.Boolean(),
    authorityVersion: Type.Integer({ minimum: 1 }),
    version: Type.Integer({ minimum: 1 }),
  },
  { $id: "ActiveRoleContext.v1", additionalProperties: false },
);

export const RoleContextSelectorSchema = Type.Object(
  {
    contexts: Type.Array(RoleContextOptionSchema),
    current: Type.Optional(ActiveRoleContextSchema),
  },
  { $id: "RoleContextSelector.v1", additionalProperties: false },
);

export const InspectRoleContextDeepLinkRequestSchema = Type.Object(
  { tabId: identifier, requiredGrantId: identifier },
  {
    $id: "InspectRoleContextDeepLinkRequest.v1",
    additionalProperties: false,
  },
);

export const RoleContextDeepLinkDecisionSchema = Type.Object(
  {
    decision: Type.Union([
      Type.Literal("current"),
      Type.Literal("switch_required"),
      Type.Literal("denied"),
    ]),
  },
  { $id: "RoleContextDeepLinkDecision.v1", additionalProperties: false },
);

export const EnterActiveRoleContextRequestSchema = Type.Object(
  {
    tabId: identifier,
    grantId: identifier,
    switchDecision: Type.Union([
      Type.Literal("save"),
      Type.Literal("discard"),
      Type.Literal("cancel"),
    ]),
    expectedCurrentContextId: Type.Optional(identifier),
    expectedCurrentVersion: Type.Optional(Type.Integer({ minimum: 1 })),
    idempotencyKey: identifier,
  },
  {
    $id: "EnterActiveRoleContextRequest.v1",
    additionalProperties: false,
  },
);

export const RestoreMostRecentRoleContextRequestSchema = Type.Object(
  { tabId: identifier, idempotencyKey: identifier },
  {
    $id: "RestoreMostRecentRoleContextRequest.v1",
    additionalProperties: false,
  },
);

export const RoleContextCacheInvalidationSchema = Type.Object(
  {
    previousContextId: Type.Optional(identifier),
    destroyProtectedCache: Type.Literal(true),
    closeOpenViews: Type.Literal(true),
  },
  { $id: "RoleContextCacheInvalidation.v1", additionalProperties: false },
);

export const EnterActiveRoleContextResultSchema = Type.Object(
  {
    context: ActiveRoleContextSchema,
    cacheInvalidation: RoleContextCacheInvalidationSchema,
  },
  {
    $id: "EnterActiveRoleContextResult.v1",
    additionalProperties: false,
  },
);

export const LeaveActiveRoleContextRequestSchema = Type.Object(
  {
    tabId: identifier,
    expectedCurrentContextId: identifier,
    expectedCurrentVersion: Type.Integer({ minimum: 1 }),
  },
  {
    $id: "LeaveActiveRoleContextRequest.v1",
    additionalProperties: false,
  },
);

export const LeaveActiveRoleContextResultSchema = Type.Object(
  {
    cacheInvalidation: Type.Object(
      {
        previousContextId: identifier,
        destroyProtectedCache: Type.Literal(true),
        closeOpenViews: Type.Literal(true),
      },
      { additionalProperties: false },
    ),
  },
  {
    $id: "LeaveActiveRoleContextResult.v1",
    additionalProperties: false,
  },
);

export const AuthorityDecisionSchema = Type.Object(
  { allowed: Type.Literal(true), context: ActiveRoleContextSchema },
  { $id: "AuthorityDecision.v1", additionalProperties: false },
);

export const ClerkReverificationEvidenceSchema = Type.Object(
  {
    verificationId: identifier,
    clerkSessionId: identifier,
    signatureValidated: Type.Literal(true),
    verifiedAt: timestamp,
  },
  { $id: "ClerkReverificationEvidence.v1", additionalProperties: false },
);

export const identityAccessContractSource = {
  module: "identity-access",
  version: "1.1.0",
  requirements: ["R1-LIFE-001", "R1-AUTH-001", "R1-CONS-001", "R1-PRIV-001"],
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
    { name: "ListRoleContextsRequest", schema: ListRoleContextsRequestSchema },
    { name: "RoleContextOption", schema: RoleContextOptionSchema },
    { name: "ActiveRoleContext", schema: ActiveRoleContextSchema },
    { name: "RoleContextSelector", schema: RoleContextSelectorSchema },
    {
      name: "InspectRoleContextDeepLinkRequest",
      schema: InspectRoleContextDeepLinkRequestSchema,
    },
    {
      name: "RoleContextDeepLinkDecision",
      schema: RoleContextDeepLinkDecisionSchema,
    },
    {
      name: "EnterActiveRoleContextRequest",
      schema: EnterActiveRoleContextRequestSchema,
    },
    {
      name: "RestoreMostRecentRoleContextRequest",
      schema: RestoreMostRecentRoleContextRequestSchema,
    },
    {
      name: "RoleContextCacheInvalidation",
      schema: RoleContextCacheInvalidationSchema,
    },
    {
      name: "EnterActiveRoleContextResult",
      schema: EnterActiveRoleContextResultSchema,
    },
    {
      name: "LeaveActiveRoleContextRequest",
      schema: LeaveActiveRoleContextRequestSchema,
    },
    {
      name: "LeaveActiveRoleContextResult",
      schema: LeaveActiveRoleContextResultSchema,
    },
    { name: "AuthorityDecision", schema: AuthorityDecisionSchema },
    {
      name: "ClerkReverificationEvidence",
      schema: ClerkReverificationEvidenceSchema,
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
    {
      operationId: "listRoleContexts",
      method: "get",
      path: "/v1/role-contexts",
      summary:
        "List the current Account's available role contexts and this tab's active context.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "ListRoleContextsRequest",
      successSchema: "RoleContextSelector",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "CONTEXT_STALE",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
    },
    {
      operationId: "inspectRoleContextDeepLink",
      method: "post",
      path: "/v1/role-contexts/deep-link",
      summary:
        "Decide whether a private-payload-free deep link needs a role-context switch.",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      inputSchema: "InspectRoleContextDeepLinkRequest",
      successSchema: "RoleContextDeepLinkDecision",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "enterActiveRoleContext",
      method: "post",
      path: "/v1/role-contexts/enter",
      summary:
        "Enter exactly one tab-scoped Active Role Context after resolving current authority.",
      requirements: ["R1-AUTH-001", "R1-CONS-001", "R1-PRIV-001"],
      inputSchema: "EnterActiveRoleContextRequest",
      successSchema: "EnterActiveRoleContextResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "AUTHORITY_DENIED",
        "CONTEXT_STALE",
        "ROLE_SWITCH_BLOCKED",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "restoreMostRecentRoleContext",
      method: "post",
      path: "/v1/role-contexts/restore",
      summary:
        "Restore the Account's most-recent role context in this tab only while its grant remains current.",
      requirements: ["R1-AUTH-001", "R1-CONS-001", "R1-PRIV-001"],
      inputSchema: "RestoreMostRecentRoleContextRequest",
      successSchema: "RoleContextSelector",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "CONTEXT_STALE",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
    {
      operationId: "leaveActiveRoleContext",
      method: "post",
      path: "/v1/role-contexts/leave",
      summary:
        "Leave this tab's Active Role Context and destroy its protected client state.",
      requirements: ["R1-AUTH-001", "R1-CONS-001", "R1-PRIV-001"],
      inputSchema: "LeaveActiveRoleContextRequest",
      successSchema: "LeaveActiveRoleContextResult",
      errorCodes: [
        "AUTHENTICATION_REQUIRED",
        "AUTHORITY_DENIED",
        "CONTEXT_STALE",
        "REQUEST_INVALID",
        "RESPONSE_INVALID",
      ],
      audience: "account-self",
      inputLocation: "body",
    },
  ],
  transitions: [
    {
      from: "selector",
      command: "enter role context",
      guard: "current server-side grant and tab-scoped selection",
      to: "active-role-context",
      rejectedFrom: ["revoked-authority", "foreign-authority"],
    },
    {
      from: "active-role-context",
      command: "switch or leave role context",
      guard: "current version and resolved save/discard decision",
      to: "selector",
      rejectedFrom: ["stale-context", "cancelled-unsaved-work"],
    },
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
    ...[
      "listRoleContexts",
      "inspectRoleContextDeepLink",
      "enterActiveRoleContext",
      "restoreMostRecentRoleContext",
      "leaveActiveRoleContext",
    ].flatMap((operationId) => [
      {
        actor: "authenticated-account",
        operationId,
        resource: "own-role-contexts",
        condition:
          "current server-validated Clerk identity, active Docket Session and current role grant",
        decision: "allow" as const,
      },
      {
        actor: "anonymous",
        operationId,
        resource: "any-role-context",
        condition: "no server-validated identity",
        decision: "deny" as const,
        errorCode: "AUTHENTICATION_REQUIRED",
      },
    ]),
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
    {
      code: "AUTHORITY_DENIED",
      status: 403,
      safeMessage: "The requested role context is unavailable.",
    },
    {
      code: "CONTEXT_STALE",
      status: 409,
      safeMessage: "The active role context is stale.",
    },
    {
      code: "REAUTHENTICATION_REQUIRED",
      status: 401,
      safeMessage: "Fresh Clerk Reverification is required.",
    },
    {
      code: "ROLE_SWITCH_BLOCKED",
      status: 409,
      safeMessage: "The role-context switch was not completed.",
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
    {
      id: "active-role-context-school-success-v1",
      contractVersion: "1.1.0",
      requirements: ["R1-AUTH-001", "R1-PRIV-001"],
      input: {
        tabId: "tab_fixture_001",
        grantId: "grant_fixture_school_001",
        switchDecision: "discard",
        idempotencyKey: "enter_fixture_001",
      },
      expected: {
        context: {
          id: "context_fixture_001",
          grantId: "grant_fixture_school_001",
          contextKind: "school",
          scopeId: "school_fixture_001",
          scopeLabel: "Fixture High School",
          privileged: false,
          authorityVersion: 1,
          version: 1,
        },
        cacheInvalidation: {
          destroyProtectedCache: true,
          closeOpenViews: true,
        },
      },
      provenance: "synthetic-role-context-fixture",
    },
  ],
} as const satisfies ContractSource;
