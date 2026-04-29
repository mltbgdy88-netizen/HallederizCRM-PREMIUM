import type { FastifyRequest } from "fastify";
import { getSessionByToken } from "./session-store";
import { getAuthMode } from "./auth-mode";

export interface RequestContext {
  tenantId: string;
  userId: string;
  requestedTenantId?: string;
  requestedUserId?: string;
  tenantMismatch?: boolean;
  authIssue?: "missing_session" | "expired_session" | "tenant_mismatch";
  persistenceMode: "demo" | "postgres";
  sessionToken?: string;
  isAuthenticated?: boolean;
  roles?: string[];
  permissions?: string[];
}

function parseTokenPrincipal(token?: string): { tenantId?: string; userId?: string; roles: string[]; permissions: string[] } {
  if (!token) {
    return { roles: [], permissions: [] };
  }

  if (token.startsWith("mock_access_")) {
    const principalSeed = token.replace("mock_access_", "");
    const [tenantSlugRaw, emailRaw] = principalSeed.split(":");
    const tenantSlug = tenantSlugRaw?.trim() || "hallederiz";
    const email = emailRaw?.trim() || "admin@hallederiz.com";
    const isOperator = email.includes("operator");
    const isAdmin = email.includes("admin") || !isOperator;

    const tenantId = tenantSlug === "hallederiz" ? "tenant_1" : `tenant_${tenantSlug}`;
    const userId = isOperator ? "user_operator" : "user_admin";
    const role = isOperator ? "operator" : "admin";

    const basePermissions = [
      "customers.read",
      "products.read",
      "offers.read",
      "orders.read",
      "payments.read",
      "warehouse.read",
      "deliveries.read",
      "invoices.read",
      "returns.read",
      "documents.read",
      "approvals.read",
      "tasks.read",
      "workflow.read",
      "integrations.read",
      "local_output.read"
    ];
    const writePermissions = isAdmin
      ? [
          "customers.write",
          "products.write",
          "offers.write",
          "orders.write",
          "payments.write",
          "warehouse.write",
          "deliveries.write",
          "invoices.write",
          "returns.write",
          "tasks.write",
          "workflow.write",
          "approvals.write",
          "ai.actions.write",
          "documents.write",
          "local_output.write",
          "pricing.write",
          "integrations.write",
          "erp.write",
          "factory.write",
          "whatsapp.write",
          "orders.confirm",
          "orders.plan_sourcing",
          "orders.cancel",
          "warehouse.assign",
          "warehouse.execute",
          "warehouse.cancel",
          "payments.confirm",
          "payments.reverse",
          "deliveries.validate",
          "deliveries.complete",
          "deliveries.rollback",
          "invoices.issue",
          "invoices.cancel",
          "returns.approve",
          "returns.receive",
          "returns.complete",
          "returns.cancel",
          "approvals.approve",
          "approvals.execute",
          "documents.render",
          "integrations.write"
        ]
      : ["offers.write", "orders.write", "payments.write", "warehouse.write", "tasks.write"];

    return {
      tenantId,
      userId,
      roles: [role],
      permissions: [...basePermissions, ...writePermissions]
    };
  }

  return { roles: [], permissions: [] };
}

export function buildRequestContext(request: FastifyRequest): RequestContext {
  const authMode = getAuthMode();
  const authHeader = request.headers.authorization;
  const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;
  const sessionToken = String(request.headers["x-session-token"] ?? bearerToken ?? "");
  const isMockAccessToken = sessionToken.startsWith("mock_access_");
  const principal = authMode.allowMockAccessTokens ? parseTokenPrincipal(sessionToken || undefined) : { roles: [], permissions: [] };
  const session =
    isMockAccessToken && !authMode.allowMockAccessTokens ? null : getSessionByToken(sessionToken || undefined);
  const requestedTenantId = request.headers["x-tenant-id"] ? String(request.headers["x-tenant-id"]) : undefined;
  const requestedUserId = request.headers["x-user-id"] ? String(request.headers["x-user-id"]) : undefined;
  const tenantId = String(session?.tenant.id ?? requestedTenantId ?? principal.tenantId ?? "tenant_unknown");
  const userId = String(
    session?.user.id ??
      (authMode.allowHeaderPrincipalFallback ? requestedUserId : undefined) ??
      principal.userId ??
      "anonymous"
  );
  const persistenceMode = authMode.persistenceMode;
  const tenantMismatch = Boolean(session?.tenant.id && requestedTenantId && session.tenant.id !== requestedTenantId);
  const authIssue =
    tenantMismatch
      ? "tenant_mismatch"
        : sessionToken
        ? session || principal.userId
          ? undefined
          : "expired_session"
        : undefined;
  const roles =
    session?.roles?.length
      ? session.roles.map((role) => role.code)
      : principal.roles.length > 0
        ? principal.roles
        : authMode.allowHeaderPrincipalFallback && request.headers["x-user-role"]
          ? [String(request.headers["x-user-role"])]
          : [];
  const permissions =
    session?.permissions?.length
      ? session.permissions.map((permission) => permission.key)
      : principal.permissions.length > 0
      ? principal.permissions
      : authMode.allowHeaderPrincipalFallback && request.headers["x-user-permissions"]
        ? String(request.headers["x-user-permissions"])
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

  return {
    tenantId,
    userId,
    persistenceMode,
    sessionToken: sessionToken || undefined,
    isAuthenticated: Boolean(sessionToken ? Boolean(session || principal.userId) : false),
    requestedTenantId,
    requestedUserId,
    tenantMismatch,
    authIssue,
    roles,
    permissions
  };
}
