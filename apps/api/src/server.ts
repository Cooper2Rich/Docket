import { clerkPlugin, getAuth } from "@clerk/fastify";
import Fastify, { type FastifyInstance } from "fastify";

export async function buildApiApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(clerkPlugin);

  app.get("/health", () => ({ status: "ok" as const }));
  app.get("/v1/session", async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || !auth.sessionId) {
      return reply.code(401).send({ code: "AUTHENTICATION_REQUIRED" });
    }

    return reply.send({ authenticated: true, userId: auth.userId });
  });

  return app;
}
