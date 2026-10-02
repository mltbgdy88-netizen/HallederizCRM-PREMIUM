import type { FastifyInstance, FastifyRequest } from "fastify";
import type { LoginResponse, SessionModel } from "@hallederiz/types";
import { RedisSessionRepository } from "./redis-session-repository";
import { extractSessionTokenFromCookieHeader, verifySignedSessionToken } from "./session-store";

export type DurableSessionRepository = Pick<RedisSessionRepository, "save" | "get" | "revoke" | "close" | "ping">;
const requestSessions = new WeakMap<FastifyRequest, SessionModel | null>();

export function requestSessionToken(request: FastifyRequest): string | undefined {
  const authorization = request.headers.authorization;
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;
  return String(request.headers["x-session-token"] ?? bearer ?? extractSessionTokenFromCookieHeader(request.headers.cookie) ?? "") || undefined;
}

export function preparedProductionSession(request: FastifyRequest): SessionModel | null {
  return requestSessions.get(request) ?? null;
}

// Request-local hydration keeps synchronous domain guards while never caching a
// production session across requests or falling back to process memory.
export function registerProductionSessions(server: FastifyInstance, injected?: DurableSessionRepository) {
  let repository = injected;
  function durable(): DurableSessionRepository {
    if (!repository) repository = new RedisSessionRepository({ url: process.env.REDIS_URL ?? process.env.VALKEY_URL ?? "" });
    return repository;
  }
  server.addHook("onRequest", async (request, reply) => {
    if (process.env.NODE_ENV !== "production") return;
    if (request.url.split("?")[0] === "/ready") {
      try { await durable().ping(); } catch {
        return reply.status(503).send({ status: "blocked", service: "api", sessions: "unavailable" });
      }
    }
    const token = requestSessionToken(request);
    requestSessions.set(request, null);
    if (!token || !verifySignedSessionToken(token)) return;
    try {
      const session = await durable().get(token);
      if (session && Date.parse(session.expiresAt) > Date.now()) requestSessions.set(request, session);
    } catch {
      return reply.status(503).send({ message: "Oturum servisi kullanilamiyor." });
    }
  });
  server.addHook("onClose", async () => { await repository?.close(); });
  return {
    async save(payload: LoginResponse) {
      if (process.env.NODE_ENV === "production") await durable().save(payload.accessToken, payload);
    },
    async revoke(token?: string) {
      if (process.env.NODE_ENV === "production" && token) await durable().revoke(token);
    }
  };
}
