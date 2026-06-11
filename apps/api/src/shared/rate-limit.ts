import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface BucketState {
  count: number;
  resetAt: number;
}

export interface RouteRateLimitOptions {
  max: number;
  windowMs: number;
  routes: string[];
}

const buckets = new Map<string, BucketState>();

function resolveClientKey(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.ip ?? "unknown";
}

export function createRouteRateLimitHook(options: RouteRateLimitOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const path = request.url.split("?")[0] ?? request.url;
    if (!options.routes.some((route) => path === route || path.startsWith(`${route}/`))) {
      return;
    }

    const now = Date.now();
    const key = `${resolveClientKey(request)}:${path}:${request.method}`;
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return;
    }

    current.count += 1;
    if (current.count > options.max) {
      return reply.status(429).send({
        message: "Cok fazla istek gonderildi. Lutfen kisa bir sure sonra tekrar deneyin.",
        reason: "rate_limit_exceeded"
      });
    }
  };
}

export function registerApiRateLimits(server: FastifyInstance) {
  const hook = createRouteRateLimitHook({
    max: 60,
    windowMs: 60_000,
    routes: [
      "/auth/login",
      "/whatsapp/webhook",
      "/imports",
      "/quick-operations/submit"
    ]
  });
  server.addHook("onRequest", hook);
}

export function clearRateLimitBucketsForTests(): void {
  buckets.clear();
}
