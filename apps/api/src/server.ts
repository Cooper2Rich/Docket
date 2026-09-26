import { clerkPlugin, getAuth } from "@clerk/fastify";
import { verifyWebhook } from "@clerk/fastify/webhooks";
import {
  authenticateFixedIdentity,
  authenticateClerkSession,
  changeDisplayNameResponse,
  clerkWebhookHintTypes,
  createSessionResponse,
  getAccountProfileResponse,
  IdentityError,
  IdentityService,
  IdentityWebhookHintService,
  listSessionsResponse,
  listAccountSecurityHistoryResponse,
  PostgresIdentityStore,
  PostgresIdentityWebhookHintStore,
  revokeSessionResponse,
  revokeAllSessionsResponse,
  resolveIdentitySession,
  type ClerkIdentity,
  type ClerkSessionPolicy,
  type ClerkSessionEvidence,
  type IdentitySessionAuthority,
} from "@docket/identity-access";
import {
  assertNoFixtureAdapterRequestOverride,
  ConfigValidationError,
  createProcessHealth,
  dependencyProbes,
  parseRuntimeConfig,
  systemClock,
  systemIdGenerator,
} from "@docket/runtime";
import Fastify, { type FastifyInstance } from "fastify";

type ClerkRequestAuth = Readonly<{
  userId: string | null;
  sessionId: string | null;
  sessionClaims: Readonly<{
    aud?: string | readonly string[];
    azp?: string;
    exp?: number;
    iss?: string;
    nbf?: number;
  }> | null;
}>;

type ClerkRequestUser = Readonly<{
  banned?: boolean;
  locked?: boolean;
  primaryEmailAddressId: string | null;
  emailAddresses: readonly Readonly<{
    id: string;
    emailAddress: string;
    verification: Readonly<{ status: string }> | null;
  }>[];
  externalAccounts: readonly Readonly<{ provider: string }>[];
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}>;

type ClerkRequestSession = Readonly<{
  id: string;
  userId: string;
  status: string;
  expireAt: number;
  latestActivity?:
    | Readonly<{
        browserName?: string | undefined;
        deviceType?: string | undefined;
        city?: string | undefined;
        country?: string | undefined;
      }>
    | undefined;
}>;

type ClerkRequestSdk = Readonly<{
  getAuth?(request: Parameters<typeof getAuth>[0]): ClerkRequestAuth;
  getUser(
    request: Parameters<typeof getAuth>[0],
    userId: string,
  ): Promise<ClerkRequestUser>;
  getSession(
    request: Parameters<typeof getAuth>[0],
    sessionId: string,
  ): Promise<ClerkRequestSession>;
}>;

function sessionMetadata(session: ClerkRequestSession) {
  const activity = session.latestActivity;
  const device = [activity?.browserName, activity?.deviceType]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(" on ")
    .slice(0, 256);
  const approximateLocation = [activity?.city, activity?.country]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(", ")
    .slice(0, 256);
  return {
    device: device || "Unknown device",
    approximateLocation:
      approximateLocation || "Approximate location unavailable",
  };
}

function validateClerkRequestToken(
  auth: ClerkRequestAuth,
  origin: string | undefined,
  policy: ClerkSessionPolicy,
  now: Date,
): Readonly<{ userId: string; sessionId: string }> {
  const { aud, azp, exp, iss, nbf } = auth.sessionClaims ?? {};
  const audience =
    typeof aud === "string" ? [aud] : Array.isArray(aud) ? aud : [];
  if (typeof exp === "number" && exp * 1_000 <= now.getTime()) {
    throw new IdentityError("SESSION_EXPIRED", "the Clerk token expired");
  }
  const valid =
    typeof auth.userId === "string" &&
    auth.userId.length > 0 &&
    typeof auth.sessionId === "string" &&
    auth.sessionId.length > 0 &&
    typeof origin === "string" &&
    typeof azp === "string" &&
    typeof exp === "number" &&
    Number.isFinite(exp) &&
    typeof iss === "string" &&
    iss === policy.issuer &&
    audience.includes(policy.audience) &&
    policy.authorizedParties.includes(azp) &&
    policy.allowedOrigins.includes(origin) &&
    (typeof nbf !== "number" ||
      (Number.isFinite(nbf) && nbf * 1_000 <= now.getTime()));
  if (!valid || !auth.userId || !auth.sessionId) {
    throw new IdentityError(
      "IDENTITY_INVALID",
      "the Clerk token evidence was not accepted",
    );
  }
  return { userId: auth.userId, sessionId: auth.sessionId };
}

function isProviderUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const status =
    "status" in error && typeof error.status === "number"
      ? error.status
      : "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : undefined;
  if (status !== undefined) return status >= 500;
  const code =
    "code" in error && typeof error.code === "string" ? error.code : undefined;
  if (
    code !== undefined &&
    [
      "ECONNREFUSED",
      "ECONNRESET",
      "EAI_AGAIN",
      "ENETUNREACH",
      "ENOTFOUND",
      "ETIMEDOUT",
      "UND_ERR_CONNECT_TIMEOUT",
      "UND_ERR_HEADERS_TIMEOUT",
    ].includes(code)
  ) {
    return true;
  }

  const errorsValue: unknown = "errors" in error ? error.errors : undefined;
  const errors: readonly unknown[] = Array.isArray(errorsValue)
    ? errorsValue
    : [];
  const clerkError: unknown = errors[0];
  return (
    error instanceof Error &&
    error.name === "ClerkAPIResponseError" &&
    "clerkError" in error &&
    error.clerkError === true &&
    code === "api_response_error" &&
    errors.length === 1 &&
    clerkError !== null &&
    typeof clerkError === "object" &&
    "code" in clerkError &&
    clerkError.code === "unexpected_error" &&
    "message" in clerkError &&
    typeof clerkError.message === "string" &&
    clerkError.message.trim().toLowerCase() === "fetch failed"
  );
}

export async function buildApiApp(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  options: Readonly<{
    resolveSessionAuthority?: (
      request: Parameters<typeof getAuth>[0],
    ) => IdentitySessionAuthority | null;
    authenticateIdentity?: (
      request: Parameters<typeof getAuth>[0],
    ) => ClerkIdentity | null | Promise<ClerkIdentity | null>;
    clerkRequestSdk?: ClerkRequestSdk;
    identityService?: Pick<
      IdentityService,
      | "createDocketSession"
      | "listDocketSessions"
      | "resumeDocketSession"
      | "revokeDocketSession"
      | "revokeAllDocketSessions"
      | "getAccountProfile"
      | "listAccountSecurityHistory"
      | "changeDisplayName"
    >;
    verifyClerkWebhook?: (
      request: Parameters<typeof verifyWebhook>[0],
    ) => Promise<Readonly<{ type: string; data: Readonly<{ id?: string }> }>>;
    webhookHintService?: Pick<
      IdentityWebhookHintService,
      "enqueueVerifiedHint"
    >;
  }> = {},
): Promise<FastifyInstance> {
  const config = parseRuntimeConfig("api", environment);
  const health = createProcessHealth("api", dependencyProbes(config));
  const app = Fastify({ logger: false });
  const identityService =
    options.identityService ??
    new IdentityService({
      store: new PostgresIdentityStore(config.databaseUrl ?? ""),
      now: () => systemClock.now(),
      nextId: () => systemIdGenerator.next(),
    });
  const webhookHintService =
    options.webhookHintService ??
    new IdentityWebhookHintService(
      new PostgresIdentityWebhookHintStore(config.databaseUrl ?? ""),
      () => systemClock.now(),
    );

  if (config.clerkPublishableKey && config.clerkSecretKey) {
    const clerkPluginOptions = {
      audience: config.clerkAudience ?? "",
      authorizedParties: config.clerkAuthorizedParties ?? [],
      ...(config.clerkJwtKey ? { jwtKey: config.clerkJwtKey } : {}),
      publishableKey: config.clerkPublishableKey,
      secretKey: config.clerkSecretKey,
    };
    await app.register(clerkPlugin, clerkPluginOptions);
  } else {
    await app.register(clerkPlugin);
  }

  app.addHook("onRequest", async (request, reply) => {
    try {
      assertNoFixtureAdapterRequestOverride({
        headers: request.headers,
        query: request.query,
      });
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        return reply.code(400).send({
          code: error.code,
          correlationId: request.id,
        });
      }
      throw error;
    }
  });

  app.get("/health", () => health.liveness());
  app.get("/health/live", () => health.liveness());
  app.get("/health/ready", async (_request, reply) => {
    const readiness = await health.readiness();
    return reply.code(readiness.status === "ready" ? 200 : 503).send(readiness);
  });
  const authenticateIdentity = async (
    request: Parameters<typeof getAuth>[0],
  ): Promise<ClerkIdentity | null> => {
    if (options.authenticateIdentity) {
      return options.authenticateIdentity(request);
    }
    if (config.adapters.identity === "fixed") {
      const now = systemClock.now();
      return authenticateFixedIdentity(config.environment, {
        userId: "user_fixture_local_001",
        sessionId: "session_fixture_local_001",
        verifiedEmail: "local-001@identity.example.test",
        profileName: "Local Docket Account",
        signInMethod: "verified_email_code",
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1_000),
      });
    }

    const auth = options.clerkRequestSdk?.getAuth
      ? options.clerkRequestSdk.getAuth(request)
      : getAuth(request, { acceptsToken: "session_token" });
    const now = systemClock.now();
    const policy = {
      issuer: config.clerkIssuer ?? "",
      audience: config.clerkAudience ?? "",
      authorizedParties: config.clerkAuthorizedParties ?? [],
      allowedOrigins: config.clerkAllowedOrigins ?? [],
    } satisfies ClerkSessionPolicy;
    const token = validateClerkRequestToken(
      auth,
      typeof request.headers.origin === "string"
        ? request.headers.origin
        : undefined,
      policy,
      now,
    );
    const [userResult, sessionResult] = await Promise.allSettled([
      options.clerkRequestSdk
        ? options.clerkRequestSdk.getUser(request, token.userId)
        : request.clerk.users.getUser(token.userId),
      options.clerkRequestSdk
        ? options.clerkRequestSdk.getSession(request, token.sessionId)
        : request.clerk.sessions.getSession(token.sessionId),
    ]);
    const user =
      userResult.status === "fulfilled" ? userResult.value : undefined;
    const session =
      sessionResult.status === "fulfilled" ? sessionResult.value : undefined;
    const verifiedEmail = user?.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    );
    const providerDenied =
      (userResult.status === "rejected" &&
        !isProviderUnavailable(userResult.reason)) ||
      (sessionResult.status === "rejected" &&
        !isProviderUnavailable(sessionResult.reason)) ||
      user?.banned === true ||
      (user !== undefined &&
        verifiedEmail?.verification?.status !== "verified") ||
      (session !== undefined &&
        (session.id !== token.sessionId ||
          session.userId !== token.userId ||
          session.status !== "active" ||
          !Number.isFinite(session.expireAt) ||
          session.expireAt <= now.getTime()));
    if (providerDenied) return null;
    if (!user || !session) {
      return identityService.resumeDocketSession(token);
    }
    if (!verifiedEmail) return null;
    const { aud, azp, exp, iss, nbf } = auth.sessionClaims ?? {};
    const origin = request.headers.origin;
    if (
      typeof origin !== "string" ||
      typeof azp !== "string" ||
      typeof iss !== "string" ||
      typeof exp !== "number" ||
      !Number.isFinite(exp) ||
      session.id !== token.sessionId ||
      session.userId !== token.userId
    ) {
      return null;
    }
    const googleIdentity = user.externalAccounts.some((account) =>
      account.provider.includes("google"),
    );
    const profileName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");
    const evidence: ClerkSessionEvidence = {
      // getAuth only returns an authenticated session after the Clerk plugin
      // has verified the request token's cryptographic signature.
      signatureValid: true,
      issuer: iss,
      audience: typeof aud === "string" ? [aud] : Array.isArray(aud) ? aud : [],
      authorizedParty: azp,
      tokenExpiresAt: new Date(exp * 1_000),
      sessionExpiresAt: new Date(session.expireAt),
      ...(typeof nbf === "number" && Number.isFinite(nbf)
        ? { notBefore: new Date(nbf * 1_000) }
        : {}),
      sessionStatus: session.status === "active" ? "active" : "inactive",
      userId: token.userId,
      sessionId: token.sessionId,
      origin,
      verifiedEmail: verifiedEmail.emailAddress,
      profileName:
        profileName.length > 0
          ? profileName
          : (user.username ?? verifiedEmail.emailAddress),
      signInMethod: googleIdentity ? "google" : "verified_email_code",
      sessionMetadata: sessionMetadata(session),
    };
    return authenticateClerkSession(evidence, policy, now);
  };

  const acceptedIdentity = async (
    request: Parameters<typeof getAuth>[0],
  ): Promise<ClerkIdentity | null> => {
    try {
      return await authenticateIdentity(request);
    } catch {
      return null;
    }
  };

  app.get("/v1/session", async (request, reply) => {
    const authority = options.resolveSessionAuthority
      ? options.resolveSessionAuthority(request)
      : await acceptedIdentity(request).then((identity) =>
          identity
            ? {
                userId: identity.userId,
                sessionId: identity.sessionId,
                authorityVersion: identity.sessionId,
                currentAuthorityVersion: identity.sessionId,
              }
            : null,
        );
    const result = resolveIdentitySession(request.query, authority, request.id);
    return reply.code(result.status).send(result.body);
  });

  app.post("/v1/docket-sessions", async (request, reply) => {
    const result = await createSessionResponse(
      identityService,
      await acceptedIdentity(request),
      request.body,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.get("/v1/docket-sessions", async (request, reply) => {
    const result = await listSessionsResponse(
      identityService,
      await acceptedIdentity(request),
      request.query,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.post("/v1/docket-sessions/revoke", async (request, reply) => {
    const result = await revokeSessionResponse(
      identityService,
      await acceptedIdentity(request),
      request.body,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.post("/v1/docket-sessions/revoke-all", async (request, reply) => {
    const result = await revokeAllSessionsResponse(
      identityService,
      await acceptedIdentity(request),
      request.body,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.get("/v1/account/security-history", async (request, reply) => {
    const result = await listAccountSecurityHistoryResponse(
      identityService,
      await acceptedIdentity(request),
      request.query,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.get("/v1/account/profile", async (request, reply) => {
    const result = await getAccountProfileResponse(
      identityService,
      await acceptedIdentity(request),
      request.query,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.post("/v1/account/display-name", async (request, reply) => {
    const result = await changeDisplayNameResponse(
      identityService,
      await acceptedIdentity(request),
      request.body,
      request.id,
    );
    return reply.code(result.status).send(result.body);
  });
  app.post("/v1/provider-events/clerk", async (request, reply) => {
    try {
      const event = options.verifyClerkWebhook
        ? await options.verifyClerkWebhook(request)
        : await verifyWebhook(request);
      const deliveryId = request.headers["svix-id"];
      const deliveryTimestamp = request.headers["svix-timestamp"];
      const type = clerkWebhookHintTypes.find(
        (candidate) => candidate === event.type,
      );
      if (
        typeof deliveryId !== "string" ||
        typeof deliveryTimestamp !== "string" ||
        !type ||
        typeof event.data.id !== "string"
      ) {
        return await reply.code(202).send({ status: "ignored" });
      }
      const occurredAt = new Date(Number(deliveryTimestamp) * 1_000);
      if (Number.isNaN(occurredAt.getTime())) {
        return await reply.code(400).send({
          code: "WEBHOOK_INVALID",
          requestId: request.id,
        });
      }
      const status = await webhookHintService.enqueueVerifiedHint({
        deliveryId,
        type,
        clerkObjectId: event.data.id,
        occurredAt,
      });
      return await reply.code(202).send({ status });
    } catch {
      return reply.code(401).send({
        code: "WEBHOOK_INVALID",
        requestId: request.id,
      });
    }
  });

  return app;
}
