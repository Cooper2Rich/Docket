import { clerkPlugin, getAuth } from "@clerk/fastify";
import {
  resolveIdentitySession,
  type IdentitySessionAuthority,
} from "@docket/identity-access";
import {
  assertNoFixtureAdapterRequestOverride,
  ConfigValidationError,
  createProcessHealth,
  dependencyProbes,
  parseRuntimeConfig,
} from "@docket/runtime";
import Fastify, { type FastifyInstance } from "fastify";

export async function buildApiApp(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  options: Readonly<{
    resolveSessionAuthority?: (
      request: Parameters<typeof getAuth>[0],
    ) => IdentitySessionAuthority | null;
  }> = {},
): Promise<FastifyInstance> {
  const config = parseRuntimeConfig("api", environment);
  const health = createProcessHealth("api", dependencyProbes(config));
  const app = Fastify({ logger: false });

  if (config.clerkPublishableKey && config.clerkSecretKey) {
    await app.register(clerkPlugin, {
      publishableKey: config.clerkPublishableKey,
      secretKey: config.clerkSecretKey,
    });
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
  app.get("/v1/session", async (request, reply) => {
    const authority = options.resolveSessionAuthority
      ? options.resolveSessionAuthority(request)
      : (() => {
          const auth = getAuth(request);
          if (!auth.userId || !auth.sessionId) return null;
          return {
            userId: auth.userId,
            sessionId: auth.sessionId,
            authorityVersion: auth.sessionId,
            currentAuthorityVersion: auth.sessionId,
          };
        })();
    const result = resolveIdentitySession(request.query, authority, request.id);
    return reply.code(result.status).send(result.body);
  });

  return app;
}
