import { Value } from "@sinclair/typebox/value";
import {
  EnterActiveRoleContextRequestSchema,
  EnterActiveRoleContextResultSchema,
  InspectRoleContextDeepLinkRequestSchema,
  LeaveActiveRoleContextRequestSchema,
  LeaveActiveRoleContextResultSchema,
  ListRoleContextsRequestSchema,
  RestoreMostRecentRoleContextRequestSchema,
  RoleContextDeepLinkDecisionSchema,
  RoleContextSelectorSchema,
  StableErrorEnvelopeSchema,
} from "./contracts.js";
import {
  RoleContextError,
  type RoleContextActor,
  type RoleContextService,
} from "./role-context.js";

export type RoleContextApiResponse = Readonly<{
  status: number;
  body: unknown;
}>;

type RoleContextApiService = Pick<
  RoleContextService,
  | "getRoleContextState"
  | "inspectDeepLink"
  | "enterActiveRoleContext"
  | "restoreMostRecentContext"
  | "leaveActiveRoleContext"
>;

function response(status: number, body: unknown): RoleContextApiResponse {
  return { status, body };
}

function stableError(
  code:
    | "AUTHENTICATION_REQUIRED"
    | "AUTHORITY_DENIED"
    | "CONTEXT_STALE"
    | "REAUTHENTICATION_REQUIRED"
    | "ROLE_SWITCH_BLOCKED"
    | "REQUEST_INVALID"
    | "RESPONSE_INVALID",
  message: string,
  requestId: string,
  status: number,
): RoleContextApiResponse {
  const body = { code, message, requestId };
  if (!Value.Check(StableErrorEnvelopeSchema, body)) {
    throw new Error("stable role-context error construction failed");
  }
  return response(status, body);
}

function requireActor(
  actor: RoleContextActor | null,
  requestId: string,
): RoleContextActor | RoleContextApiResponse {
  return (
    actor ??
    stableError(
      "AUTHENTICATION_REQUIRED",
      "Authentication is required.",
      requestId,
      401,
    )
  );
}

function isResponse(
  value: RoleContextActor | RoleContextApiResponse,
): value is RoleContextApiResponse {
  return "status" in value && "body" in value;
}

function domainError(
  error: unknown,
  requestId: string,
): RoleContextApiResponse {
  if (!(error instanceof RoleContextError)) throw error;
  const definitions = {
    AUTHORITY_DENIED: [403, "The requested role context is unavailable."],
    CONTEXT_STALE: [409, "The active role context is stale."],
    REAUTHENTICATION_REQUIRED: [401, "Fresh Clerk Reverification is required."],
    ROLE_SWITCH_BLOCKED: [409, "The role-context switch was not completed."],
  } as const;
  const [status, message] = definitions[error.code];
  return stableError(error.code, message, requestId, status);
}

function checkedResponse(
  schema: Parameters<typeof Value.Check>[0],
  body: unknown,
  requestId: string,
): RoleContextApiResponse {
  return Value.Check(schema, body)
    ? response(200, body)
    : stableError(
        "RESPONSE_INVALID",
        "The response did not match its contract.",
        requestId,
        500,
      );
}

export async function listRoleContextsResponse(
  service: RoleContextApiService,
  actor: RoleContextActor | null,
  input: unknown,
  requestId: string,
): Promise<RoleContextApiResponse> {
  if (!Value.Check(ListRoleContextsRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireActor(actor, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const body = await service.getRoleContextState(authenticated, input.tabId);
    return checkedResponse(RoleContextSelectorSchema, body, requestId);
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function inspectRoleContextDeepLinkResponse(
  service: RoleContextApiService,
  actor: RoleContextActor | null,
  input: unknown,
  requestId: string,
): Promise<RoleContextApiResponse> {
  if (!Value.Check(InspectRoleContextDeepLinkRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireActor(actor, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const body = {
      decision: await service.inspectDeepLink(
        authenticated,
        input.tabId,
        input.requiredGrantId,
      ),
    };
    return checkedResponse(RoleContextDeepLinkDecisionSchema, body, requestId);
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function enterActiveRoleContextResponse(
  service: RoleContextApiService,
  actor: RoleContextActor | null,
  input: unknown,
  requestId: string,
): Promise<RoleContextApiResponse> {
  if (!Value.Check(EnterActiveRoleContextRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireActor(actor, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const result = await service.enterActiveRoleContext({
      actor: authenticated,
      tabId: input.tabId,
      grantId: input.grantId,
      switchDecision: input.switchDecision,
      ...(input.expectedCurrentContextId
        ? { expectedCurrentContextId: input.expectedCurrentContextId }
        : {}),
      ...(input.expectedCurrentVersion
        ? { expectedCurrentVersion: input.expectedCurrentVersion }
        : {}),
      idempotencyKey: input.idempotencyKey,
    });
    const body = {
      context: result.context,
      cacheInvalidation: result.cacheInvalidation,
    };
    return checkedResponse(EnterActiveRoleContextResultSchema, body, requestId);
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function restoreMostRecentRoleContextResponse(
  service: RoleContextApiService,
  actor: RoleContextActor | null,
  input: unknown,
  requestId: string,
): Promise<RoleContextApiResponse> {
  if (!Value.Check(RestoreMostRecentRoleContextRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireActor(actor, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    await service.restoreMostRecentContext(
      authenticated,
      input.tabId,
      input.idempotencyKey,
    );
    const body = await service.getRoleContextState(authenticated, input.tabId);
    return checkedResponse(RoleContextSelectorSchema, body, requestId);
  } catch (error) {
    return domainError(error, requestId);
  }
}

export async function leaveActiveRoleContextResponse(
  service: RoleContextApiService,
  actor: RoleContextActor | null,
  input: unknown,
  requestId: string,
): Promise<RoleContextApiResponse> {
  if (!Value.Check(LeaveActiveRoleContextRequestSchema, input)) {
    return stableError(
      "REQUEST_INVALID",
      "The request is invalid.",
      requestId,
      400,
    );
  }
  const authenticated = requireActor(actor, requestId);
  if (isResponse(authenticated)) return authenticated;
  try {
    const result = await service.leaveActiveRoleContext({
      actor: authenticated,
      tabId: input.tabId,
      expectedCurrentContextId: input.expectedCurrentContextId,
      expectedCurrentVersion: input.expectedCurrentVersion,
    });
    const body = { cacheInvalidation: result.cacheInvalidation };
    return checkedResponse(LeaveActiveRoleContextResultSchema, body, requestId);
  } catch (error) {
    return domainError(error, requestId);
  }
}
