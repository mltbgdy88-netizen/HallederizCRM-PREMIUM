import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError, UnauthorizedError, asApiErrorPayload } from "./errors";
import { buildRequestContext, type RequestContext } from "./request-context";

export function resolveContext(request: FastifyRequest): RequestContext {
  return buildRequestContext(request);
}

export function assertAuthenticated(context: RequestContext) {
  if (context.tenantMismatch || context.authIssue === "tenant_mismatch") {
    throw new ForbiddenError("Tenant izolasyon ihlali.", {
      reason: "tenant_mismatch",
      requestedTenantId: context.requestedTenantId,
      contextTenantId: context.tenantId
    });
  }

  if (!context.isAuthenticated) {
    throw new UnauthorizedError("Bu endpoint icin oturum gerekli.", {
      reason: context.authIssue ?? "missing_session"
    });
  }
}

export function assertTenantAccess(context: RequestContext, tenantId?: string) {
  if (!tenantId) return;
  if (tenantId !== context.tenantId) {
    throw new ForbiddenError("Tenant izolasyon ihlali.", {
      reason: "tenant_mismatch",
      requestedTenantId: tenantId,
      contextTenantId: context.tenantId
    });
  }
}

export function assertPermission(context: RequestContext, requiredPermission: string) {
  const permissions = new Set(context.permissions ?? []);
  if (permissions.has(requiredPermission)) return;
  if (permissions.has("*")) return;

  throw new ForbiddenError("Islem yetkisi yok.", {
    reason: "permission_missing",
    requiredPermission
  });
}

export function assertAnyPermission(context: RequestContext, requiredPermissions: readonly string[]) {
  for (const permission of requiredPermissions) {
    try {
      assertPermission(context, permission);
      return;
    } catch {
      // try next permission
    }
  }

  throw new ForbiddenError("Islem yetkisi yok.", {
    reason: "permission_missing_any",
    requiredPermissions
  });
}

export async function withGuards<T>(
  request: FastifyRequest,
  reply: FastifyReply,
  guards: Array<(context: RequestContext) => void>,
  run: (context: RequestContext) => Promise<T> | T
) {
  try {
    const context = resolveContext(request);
    for (const guard of guards) {
      guard(context);
    }
    return await run(context);
  } catch (error) {
    const payload = asApiErrorPayload(error);
    return reply.status(payload.statusCode).send(payload.body);
  }
}
