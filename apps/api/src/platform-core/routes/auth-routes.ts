import type { FastifyInstance } from "fastify";
import type { LoginInput } from "@hallederiz/types";
import { createSession, getSessionByToken } from "../../shared/session-store";
import { buildRequestContext } from "../../shared/request-context";

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post<{ Body: Partial<LoginInput> }>("/auth/login", async (request, reply) => {
    const body = request.body;

    if (!body.email || !body.password || !body.tenantSlug) {
      return reply.status(400).send({
        message: "tenantSlug, email ve password alanlari zorunludur."
      });
    }

    const loginPayload = createSession({
      tenantSlug: body.tenantSlug,
      email: body.email,
      password: body.password
    });

    return reply.send(loginPayload);
  });

  server.get("/auth/me", async (request, reply) => {
    const context = buildRequestContext(request);
    const session = getSessionByToken(context.sessionToken);
    if (!session) {
      return reply.status(401).send({ message: "Oturum gecersiz veya suresi dolmus." });
    }
    return session;
  });

  server.get("/auth/session", async (request, reply) => {
    const context = buildRequestContext(request);
    const session = getSessionByToken(context.sessionToken);
    if (!session) {
      return reply.status(401).send({ message: "Oturum bulunamadi." });
    }
    return { item: session };
  });
}
