import type { FastifyRequest } from "fastify";

export interface RequestContext {
  tenantId: string;
  userId: string;
  persistenceMode: "demo" | "postgres";
}

export function buildRequestContext(request: FastifyRequest): RequestContext {
  const tenantId = String(request.headers["x-tenant-id"] ?? "tenant_1");
  const userId = String(request.headers["x-user-id"] ?? "user_admin");
  const persistenceMode = process.env.PERSISTENCE_MODE === "postgres" ? "postgres" : "demo";

  return {
    tenantId,
    userId,
    persistenceMode
  };
}
