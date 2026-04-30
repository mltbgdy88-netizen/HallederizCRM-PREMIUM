import type { FastifyInstance } from "fastify";
import type { LoginInput } from "@hallederiz/types";
import { createLocalPilotSession, createSession, getSessionByToken } from "../../shared/session-store";
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
    if (authMode.demoAuthEnabled && authMode.persistenceMode === "demo") {
      const loginPayload = createSession({
        tenantSlug: body.tenantSlug,
        email: body.email,
        password: body.password
      });
      return reply.send(loginPayload);
    }

    if (authMode.canUseLocalPilotAuth) {
      const emailMatches = body.email.trim().toLocaleLowerCase("tr-TR") === authMode.localPilotAuthEmail?.toLocaleLowerCase("tr-TR");
      const passwordMatches = body.password === authMode.localPilotAuthPassword;
      if (!emailMatches || !passwordMatches) {
        return reply.status(401).send({
          message: "Gecersiz giris bilgileri."
        });
      }

      const loginPayload = createLocalPilotSession({
        tenantSlug: body.tenantSlug,
        email: body.email,
        password: body.password
      });
      return reply.send(loginPayload);
    }

    if (authMode.localPilotAuthEnabled && !authMode.localPilotAuthConfigured) {
      return reply.status(503).send({
        message: "Local pilot auth misconfigured. Set LOCAL_PILOT_AUTH_EMAIL and LOCAL_PILOT_AUTH_PASSWORD."
      });
    }

    return reply.status(503).send({
      message: "Demo auth disabled. Configure real auth provider."
    });
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
