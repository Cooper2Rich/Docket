import { clerkPlugin, getAuth } from "@clerk/fastify";
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
): Promise<FastifyInstance> {
  const config = parseRuntimeConfig("api", environment);
  const health = createProcessHealth("api", dependencyProbes(config));
  const app = Fastify({ logger: false });

  await app.register(clerkPlugin);

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
    const auth = getAuth(request);
    if (!auth.userId || !auth.sessionId) {
      return reply.code(401).send({ code: "AUTHENTICATION_REQUIRED" });
    }

    return reply.send({ authenticated: true, userId: auth.userId });
  });

  return app;
}
