import type { FastifyInstance } from "fastify";
import type { LoginInput } from "@hallederiz/types";
import { createSession, getSessionByToken } from "../../shared/session-store";
import { buildRequestContext } from "../../shared/request-context";
import { getAuthMode } from "../../shared/auth-mode";

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post<{ Body: Partial<LoginInput> }>("/auth/login", async (request, reply) => {
    const body = request.body;

    if (!body.email || !body.password || !body.tenantSlug) {
      return reply.status(400).send({
        message: "tenantSlug, email ve password alanlari zorunludur."
      });
    }

    const authMode = getAuthMode();
    if (!authMode.demoAuthEnabled || authMode.persistenceMode !== "demo") {
      return reply.status(503).send({
        message: "Demo auth disabled. Configure real auth provider."
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
