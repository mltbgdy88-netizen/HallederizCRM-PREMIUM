import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseApiCorsOrigins } from "./cors-config";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const ORIGIN_EXEMPT_PREFIXES = ["/whatsapp/webhook", "/health"];

function isOriginExemptPath(pathname: string): boolean {
  return ORIGIN_EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function resolveRequestOrigin(request: FastifyRequest): string | undefined {
  const originHeader = request.headers.origin;
  if (typeof originHeader === "string" && originHeader.trim()) {
    return originHeader.trim();
  }
  const referer = request.headers.referer;
  if (typeof referer === "string" && referer.trim()) {
    try {
      return new URL(referer).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function resolveAllowedOrigins(): string[] {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const configured = parseApiCorsOrigins(process.env.API_CORS_ORIGINS, nodeEnv);
  const webUrl = process.env.WEB_URL?.trim();
  return Array.from(new Set(webUrl ? [...configured, webUrl] : configured));
}

export function registerOriginGuard(server: FastifyInstance) {
  server.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const method = request.method.toUpperCase();
    if (!UNSAFE_METHODS.has(method)) {
      return;
    }

    const pathname = request.url.split("?")[0] ?? request.url;
    if (isOriginExemptPath(pathname)) {
      return;
    }

    const origin = resolveRequestOrigin(request);
    const nodeEnv = process.env.NODE_ENV ?? "development";

    if (!origin) {
      if (nodeEnv === "production") {
        return reply.status(403).send({
          message: "Origin veya Referer basligi gerekli.",
          reason: "origin_required"
        });
      }
      return;
    }

    const allowedOrigins = resolveAllowedOrigins();
    if (!allowedOrigins.includes(origin)) {
      return reply.status(403).send({
        message: "Istek kaynagi izinli degil.",
        reason: "origin_not_allowed"
      });
    }
  });
}
