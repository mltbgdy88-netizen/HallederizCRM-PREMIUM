import type { LoginInput, LoginResponse, Permission, SessionModel } from "@hallederiz/types";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createLoginPayload, mockRoles, mockTenant, mockUsers } from "../platform-core/mock-data";
import { assertDemoAuthAllowed, getAuthMode } from "./auth-mode";
import type { DatabaseAuthResult } from "./database-auth";

const sessionByToken = new Map<string, LoginResponse>();
export const SESSION_COOKIE_NAME = "hz_session";

function getSessionSecret(): string {
  const configured = process.env.AUTH_SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (configured?.trim()) {
    return configured.trim();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET or SESSION_SECRET is required in production.");
  }
  return "hallederiz-dev-session-secret";
}

function base64UrlJson(input: unknown): string {
  return Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
}

function signSessionPayload(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function createSignedSessionToken(session: SessionModel): string {
  const encodedPayload = base64UrlJson({
    sid: session.id,
    tenantId: session.tenant.id,
    userId: session.user.id,
    exp: new Date(session.expiresAt).getTime()
  });
  return `hst_${encodedPayload}.${signSessionPayload(encodedPayload)}`;
}

function verifySignedSessionToken(token: string): boolean {
  if (!token.startsWith("hst_")) {
    return process.env.NODE_ENV !== "production";
  }
  const raw = token.slice(4);
  const [encodedPayload, signature] = raw.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }
  let expected: string;
  try {
    expected = signSessionPayload(encodedPayload);
  } catch {
    return false;
  }
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function persistSession(response: LoginResponse): LoginResponse {
  const signedAccessToken = createSignedSessionToken(response.session);
  const signedResponse = {
    ...response,
    accessToken: signedAccessToken,
    refreshToken: `refresh_${response.session.id}`
  };
  sessionByToken.set(signedResponse.accessToken, signedResponse);
  return signedResponse;
}

export function buildSessionCookieHeader(token: string, expiresAt: string): string {
  const maxAgeSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

export function buildClearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function extractSessionTokenFromCookieHeader(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return undefined;
  const value = match.slice(SESSION_COOKIE_NAME.length + 1);
  return value ? decodeURIComponent(value) : undefined;
}

export function clearSessionToken(token?: string): void {
  if (token) {
    sessionByToken.delete(token);
  }
}

const demoBusinessReadPermissions = [
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

const demoBusinessWritePermissions = [
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
  "documents.render",
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
  "approvals.execute"
];

function getUserByEmail(email: string) {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? mockUsers[0];
}

function resolveRoleForCode(roleCode: string) {
  const normalized = roleCode.toLocaleLowerCase("tr-TR");
  return (
    mockRoles.find((role) => role.code.toLocaleLowerCase("tr-TR") === normalized) ??
    mockRoles.find((role) => role.code === "platform_operator") ??
    mockRoles[0]
  );
}

function roleToPermissionKeys(roleCode: string): string[] {
  const normalized = roleCode.toLocaleLowerCase("tr-TR");
  if (normalized.includes("admin")) {
    return [...demoBusinessReadPermissions, ...demoBusinessWritePermissions];
  }

  return [
    ...demoBusinessReadPermissions,
    "offers.write",
    "orders.write",
    "payments.write",
    "warehouse.write",
    "tasks.write"
  ];
}

export function createSession(input: LoginInput): LoginResponse {
  assertDemoAuthAllowed();
  const payload = createLoginPayload(input);
  const user = getUserByEmail(input.email);
  const resolvedRoles = (input.email.includes("operator") ? [mockRoles[1] ?? mockRoles[0]] : [mockRoles[0]]).filter(
    (role): role is NonNullable<typeof role> => Boolean(role)
  );
  const rolePermissions = resolvedRoles.flatMap((role) => role.permissions);
  const extraPermissionKeys = input.email.includes("operator")
    ? demoBusinessReadPermissions
    : [...demoBusinessReadPermissions, ...demoBusinessWritePermissions];
  const extraPermissions: Permission[] = extraPermissionKeys.map((key) => ({
    id: `demo_${key.replaceAll(".", "_")}`,
    key,
    name: key,
    moduleCode: "core"
  }));
  const response: LoginResponse = {
    ...payload,
    session: {
      ...payload.session,
      tenant: mockTenant,
      user: user ?? payload.session.user,
      roles: resolvedRoles as SessionModel["roles"],
      permissions: [...rolePermissions, ...extraPermissions]
    }
  };
  return persistSession(response);
}

export function createLocalPilotSession(input: LoginInput): LoginResponse {
  const authMode = getAuthMode();
  if (!authMode.canUseLocalPilotAuth) {
    throw new Error("Local pilot auth disabled. Configure local pilot auth provider.");
  }

  const payload = createLoginPayload(input);
  const user = getUserByEmail(input.email);
  const resolvedRoleKey = authMode.localPilotAuthRole.toLocaleLowerCase("tr-TR");
  const resolvedRole =
    mockRoles.find((role) => role.code.toLocaleLowerCase("tr-TR") === resolvedRoleKey) ??
    mockRoles.find((role) => role.code === "admin") ??
    mockRoles[0];
  const resolvedRoles = resolvedRole ? [resolvedRole] : [];
  const rolePermissions = resolvedRoles.flatMap((role) => role.permissions);
  const extraPermissions: Permission[] = [...demoBusinessReadPermissions, ...demoBusinessWritePermissions].map((key) => ({
    id: `pilot_${key.replaceAll(".", "_")}`,
    key,
    name: key,
    moduleCode: "core"
  }));

  const response: LoginResponse = {
    ...payload,
    accessToken: `pilot_access_${payload.session.id}`,
    refreshToken: `pilot_refresh_${payload.session.id}`,
    session: {
      ...payload.session,
      tenant: mockTenant,
      user: user ?? payload.session.user,
      roles: resolvedRoles as SessionModel["roles"],
      permissions: [...rolePermissions, ...extraPermissions]
    }
  };

  return persistSession(response);
}

export function createDatabaseSession(input: LoginInput, principal: Extract<DatabaseAuthResult, { status: "success" }>): LoginResponse {
  const payload = createLoginPayload(input);
  const resolvedRole = resolveRoleForCode(principal.role);
  const resolvedRoles = resolvedRole ? [resolvedRole] : [];
  const rolePermissions = resolvedRoles.flatMap((role) => role.permissions);
  const permissionKeys = roleToPermissionKeys(principal.role);
  const extraPermissions: Permission[] = permissionKeys.map((key) => ({
    id: `db_${key.replaceAll(".", "_")}`,
    key,
    name: key,
    moduleCode: "core"
  }));

  const response: LoginResponse = {
    ...payload,
    accessToken: `db_access_${payload.session.id}`,
    refreshToken: `db_refresh_${payload.session.id}`,
    session: {
      ...payload.session,
      tenant: {
        ...mockTenant,
        id: principal.tenantId,
        slug: principal.tenantSlug,
        name: principal.tenantName
      },
      user: {
        id: principal.userId,
        tenantId: principal.tenantId,
        email: principal.email,
        fullName: principal.fullName,
        status: "active",
        title: principal.role,
        directPermissions: [],
        lastLoginAt: new Date().toISOString()
      },
      roles: resolvedRoles as SessionModel["roles"],
      permissions: [...rolePermissions, ...extraPermissions]
    }
  };

  return persistSession(response);
}

export function getSessionByToken(token?: string): SessionModel | null {
  if (!token) return null;
  if (!verifySignedSessionToken(token)) return null;
  const session = sessionByToken.get(token)?.session;
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null;
  return session;
}
