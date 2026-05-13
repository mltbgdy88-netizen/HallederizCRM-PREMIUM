import type { FastifyInstance, FastifyReply } from "fastify";
import type { LoginInput, LoginResponse } from "@hallederiz/types";
import {
  buildClearSessionCookieHeader,
  buildSessionCookieHeader,
  clearSessionToken,
  createDatabaseSession,
  createLocalPilotSession,
  createSession,
  getSessionByToken
} from "../../shared/session-store";
import { buildRequestContext } from "../../shared/request-context";
import { getAuthMode } from "../../shared/auth-mode";
import { authenticateWithDatabase, createPostgresAuthExecutor, type DatabaseAuthResult } from "../../shared/database-auth";
import { buildPersistenceUnavailableError } from "../../shared/persistence-policy";
import { asApiErrorPayload } from "../../shared/errors";

interface AuthRouteDeps {
  authenticateDatabaseLogin?: (input: LoginInput) => Promise<DatabaseAuthResult>;
}

export async function registerAuthRoutes(server: FastifyInstance, deps: AuthRouteDeps = {}) {
  const authenticateDatabaseLogin =
    deps.authenticateDatabaseLogin ??
    (async (input: LoginInput) => authenticateWithDatabase(input, createPostgresAuthExecutor()));

  function sendLoginPayload(reply: FastifyReply, loginPayload: LoginResponse) {
    reply.header("set-cookie", buildSessionCookieHeader(loginPayload.accessToken, loginPayload.session.expiresAt));
    return reply.send(loginPayload);
  }

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
      return sendLoginPayload(reply, loginPayload);
    }

    if (authMode.persistenceMode === "postgres") {
      if (authMode.canUseLocalPilotAuth) {
        const emailMatches = body.email.trim().toLocaleLowerCase("tr-TR") === authMode.localPilotAuthEmail?.toLocaleLowerCase("tr-TR");
        if (emailMatches) {
          const passwordMatches = body.password === authMode.localPilotAuthPassword;
          if (!passwordMatches) {
            return reply.status(401).send({
              message: "Gecersiz giris bilgileri."
            });
          }

          const loginPayload = createLocalPilotSession({
            tenantSlug: body.tenantSlug,
            email: body.email,
            password: body.password
          });
          return sendLoginPayload(reply, loginPayload);
        }
      }

      try {
        const dbAuthResult = await authenticateDatabaseLogin({
          tenantSlug: body.tenantSlug,
          email: body.email,
          password: body.password
        });

        if (dbAuthResult.status === "success") {
          const loginPayload = createDatabaseSession(
            {
              tenantSlug: body.tenantSlug,
              email: body.email,
              password: body.password
            },
            dbAuthResult
          );
          return sendLoginPayload(reply, loginPayload);
        }

        if (dbAuthResult.status === "inactive_user") {
          return reply.status(403).send({
            message: "Kullanici pasif. Yonetici ile iletisime gecin."
          });
        }

        return reply.status(401).send({
          message: "Gecersiz giris bilgileri."
        });
      } catch (error) {
        const persistenceError = buildPersistenceUnavailableError(error, {
          persistenceMode: authMode.persistenceMode
        });
        const payload = asApiErrorPayload(persistenceError);
        return reply.status(payload.statusCode).send(payload.body);
      }
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
      return sendLoginPayload(reply, loginPayload);
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

  server.post("/auth/logout", async (request, reply) => {
    const context = buildRequestContext(request);
    clearSessionToken(context.sessionToken);
    reply.header("set-cookie", buildClearSessionCookieHeader());
    return { ok: true };
  });
}
