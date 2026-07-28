import "server-only";

import { hasAnyPermission, isSessionActive } from "@hallederiz/domain";
import type { Permission, SessionModel, User, WhatsAppWebLocalConnectionState } from "@hallederiz/types";

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export const WHATSAPP_WEB_LOCAL_BFF_PATHS = {
  status: "/whatsapp-web-local/status",
  start: "/whatsapp-web-local/start",
  refresh: "/whatsapp-web-local/refresh",
  disconnect: "/whatsapp-web-local/disconnect",
  logout: "/whatsapp-web-local/logout"
} as const;

export type WhatsAppWebLocalBffAction = keyof typeof WHATSAPP_WEB_LOCAL_BFF_PATHS;

export type WhatsAppWebLocalBffResponse = {
  state: WhatsAppWebLocalConnectionState;
  reasonCode: string;
  generation: number;
  providerCallExecuted: false;
  checkedAt: string;
};

export interface WhatsAppWebLocalProxyRuntime {
  env?: RuntimeEnvironment;
  fetchImpl?: typeof fetch;
  now?: () => string;
  timeoutMs?: number;
}

const SESSION_COOKIE_NAME = "hz_session";
const LOCAL_AGENT_HOST = "127.0.0.1";
const DEFAULT_LOCAL_AGENT_PORT = 4319;
const DEFAULT_TIMEOUT_MS = 2_000;
const MAX_TIMEOUT_MS = 10_000;

const STATUS_PERMISSIONS = ["integrations.read", "integrations.write"] as const;
const MUTATION_PERMISSIONS = ["integrations.write", "whatsapp.write"] as const;
const MUTATION_ACTIONS = new Set<WhatsAppWebLocalBffAction>([
  "start",
  "refresh",
  "disconnect",
  "logout"
]);
const CONNECTION_STATES = new Set<WhatsAppWebLocalConnectionState>([
  "disabled",
  "starting",
  "qr_ready",
  "connecting",
  "connected",
  "reconnecting",
  "logged_out",
  "expired",
  "error"
]);
const SAFE_UPSTREAM_REASON_CODES = new Set([
  "whatsapp_web_local_disabled_by_default",
  "whatsapp_web_local_enabled_non_production",
  "whatsapp_web_local_production_hard_deny",
  "whatsapp_web_local_pairing_stub_started",
  "whatsapp_web_local_pairing_stub_refreshed",
  "whatsapp_web_local_refresh_not_allowed",
  "whatsapp_web_local_disconnected",
  "whatsapp_web_local_logged_out",
  "whatsapp_web_local_invalid_state_transition",
  "whatsapp_web_local_state_updated"
]);

function noStoreJson(status: number, body: WhatsAppWebLocalBffResponse): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function deniedResponse(
  status: number,
  reasonCode: string,
  now: () => string,
  state: WhatsAppWebLocalConnectionState = "disabled"
): Response {
  return noStoreJson(status, {
    state,
    reasonCode,
    generation: 0,
    providerCallExecuted: false,
    checkedAt: now()
  });
}

function resolveAction(action: string): WhatsAppWebLocalBffAction | undefined {
  return Object.prototype.hasOwnProperty.call(WHATSAPP_WEB_LOCAL_BFF_PATHS, action)
    ? (action as WhatsAppWebLocalBffAction)
    : undefined;
}

function expectedMethod(action: WhatsAppWebLocalBffAction): "GET" | "POST" {
  return action === "status" ? "GET" : "POST";
}

function isProduction(env: RuntimeEnvironment): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === "production";
}

function validateSameOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin")?.trim();
  const hostHeader = request.headers.get("host")?.trim().toLowerCase();
  if (!originHeader || !hostHeader || /[\\/\s]/.test(hostHeader)) {
    return false;
  }

  try {
    const origin = new URL(originHeader);
    return (
      (origin.protocol === "http:" || origin.protocol === "https:") &&
      !origin.username &&
      !origin.password &&
      origin.pathname === "/" &&
      !origin.search &&
      !origin.hash &&
      origin.host.toLowerCase() === hostHeader
    );
  } catch {
    return false;
  }
}

function readSessionCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!sessionCookie || sessionCookie.length === SESSION_COOKIE_NAME.length + 1) {
    return undefined;
  }
  return sessionCookie;
}

function resolveApiSessionUrl(env: RuntimeEnvironment): URL | undefined {
  const configuredBaseUrl =
    env.API_BASE_URL?.trim() || env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:4000";

  try {
    const url = new URL("/auth/session", configuredBaseUrl);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

function resolveLocalAgentPort(env: RuntimeEnvironment): number | undefined {
  const raw = env.LOCAL_AGENT_CONTROL_PORT?.trim() || String(DEFAULT_LOCAL_AGENT_PORT);
  if (!/^\d{1,5}$/.test(raw)) {
    return undefined;
  }
  const port = Number(raw);
  return Number.isInteger(port) && port >= 1 && port <= 65_535 ? port : undefined;
}

function resolveTimeoutMs(runtime: WhatsAppWebLocalProxyRuntime): number {
  const timeoutMs = runtime.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return Math.min(Math.floor(timeoutMs), MAX_TIMEOUT_MS);
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  input: string | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function readSession(payload: unknown): SessionModel | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const item = (payload as { item?: unknown }).item;
  if (!item || typeof item !== "object") {
    return undefined;
  }
  const candidate = item as Partial<SessionModel>;
  if (
    typeof candidate.expiresAt !== "string" ||
    !candidate.user ||
    typeof candidate.user !== "object" ||
    !Array.isArray(candidate.permissions)
  ) {
    return undefined;
  }
  if (
    !candidate.permissions.every(
      (permission) =>
        permission &&
        typeof permission === "object" &&
        typeof (permission as Permission).key === "string"
    )
  ) {
    return undefined;
  }
  return candidate as SessionModel;
}

function hasSessionPermission(
  session: SessionModel,
  requiredPermissions: readonly string[]
): boolean {
  if (session.permissions.some((permission) => permission.key === "*")) {
    return true;
  }

  const sessionPermissionUser: User = {
    ...session.user,
    directPermissions: session.permissions
  };
  return hasAnyPermission([...requiredPermissions], sessionPermissionUser, []);
}

async function authorizeRequest(
  request: Request,
  action: WhatsAppWebLocalBffAction,
  runtime: Required<Pick<WhatsAppWebLocalProxyRuntime, "fetchImpl" | "now">> & {
    env: RuntimeEnvironment;
    timeoutMs: number;
  }
): Promise<Response | undefined> {
  const sessionCookie = readSessionCookieHeader(request.headers.get("cookie"));
  if (!sessionCookie) {
    return deniedResponse(401, "whatsapp_web_local_bff_auth_required", runtime.now);
  }

  const sessionUrl = resolveApiSessionUrl(runtime.env);
  if (!sessionUrl) {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_session_validation_unavailable",
      runtime.now,
      "error"
    );
  }

  let sessionResponse: Response;
  try {
    sessionResponse = await fetchWithTimeout(
      runtime.fetchImpl,
      sessionUrl,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: sessionCookie
        },
        cache: "no-store",
        credentials: "omit",
        redirect: "manual"
      },
      runtime.timeoutMs
    );
  } catch {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_session_validation_unavailable",
      runtime.now,
      "error"
    );
  }

  if (sessionResponse.status === 401) {
    return deniedResponse(401, "whatsapp_web_local_bff_session_invalid", runtime.now);
  }
  if (!sessionResponse.ok) {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_session_validation_unavailable",
      runtime.now,
      "error"
    );
  }

  let session: SessionModel | undefined;
  try {
    session = readSession(await sessionResponse.json());
  } catch {
    session = undefined;
  }
  if (!session) {
    return deniedResponse(401, "whatsapp_web_local_bff_session_invalid", runtime.now);
  }
  if (!isSessionActive(session)) {
    return deniedResponse(401, "whatsapp_web_local_bff_session_expired", runtime.now);
  }

  const requiredPermissions = action === "status" ? STATUS_PERMISSIONS : MUTATION_PERMISSIONS;
  if (!hasSessionPermission(session, requiredPermissions)) {
    return deniedResponse(403, "whatsapp_web_local_bff_permission_denied", runtime.now);
  }
  return undefined;
}

function sanitizeUpstreamResponse(payload: unknown): WhatsAppWebLocalBffResponse | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  const candidate = payload as Partial<WhatsAppWebLocalBffResponse>;
  if (
    typeof candidate.state !== "string" ||
    !CONNECTION_STATES.has(candidate.state as WhatsAppWebLocalConnectionState) ||
    typeof candidate.reasonCode !== "string" ||
    !SAFE_UPSTREAM_REASON_CODES.has(candidate.reasonCode) ||
    !Number.isSafeInteger(candidate.generation) ||
    (candidate.generation ?? -1) < 0 ||
    candidate.providerCallExecuted !== false ||
    typeof candidate.checkedAt !== "string" ||
    candidate.checkedAt.length > 64 ||
    !Number.isFinite(Date.parse(candidate.checkedAt))
  ) {
    return undefined;
  }

  return {
    state: candidate.state as WhatsAppWebLocalConnectionState,
    reasonCode: candidate.reasonCode,
    generation: candidate.generation as number,
    providerCallExecuted: false,
    checkedAt: candidate.checkedAt
  };
}

export async function dispatchWhatsAppWebLocalControlRequest(
  request: Request,
  requestedAction: string,
  overrides: WhatsAppWebLocalProxyRuntime = {}
): Promise<Response> {
  const env = overrides.env ?? process.env;
  const fetchImpl = overrides.fetchImpl ?? fetch;
  const now = overrides.now ?? (() => new Date().toISOString());
  const timeoutMs = resolveTimeoutMs(overrides);
  const runtime = { env, fetchImpl, now, timeoutMs };

  const action = resolveAction(requestedAction);
  if (!action) {
    return deniedResponse(404, "whatsapp_web_local_bff_action_not_found", now);
  }
  if (request.method.toUpperCase() !== expectedMethod(action)) {
    return deniedResponse(405, "whatsapp_web_local_bff_method_not_allowed", now);
  }

  if (isProduction(env)) {
    return deniedResponse(
      action === "status" ? 200 : 403,
      "whatsapp_web_local_production_hard_deny",
      now
    );
  }

  if (MUTATION_ACTIONS.has(action) && !validateSameOrigin(request)) {
    return deniedResponse(403, "whatsapp_web_local_bff_origin_denied", now);
  }

  const authFailure = await authorizeRequest(request, action, runtime);
  if (authFailure) {
    return authFailure;
  }

  const controlToken = env.LOCAL_AGENT_CONTROL_TOKEN?.trim();
  if (!controlToken) {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_control_unavailable",
      now,
      "error"
    );
  }

  const port = resolveLocalAgentPort(env);
  if (!port) {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_control_unavailable",
      now,
      "error"
    );
  }

  const localAgentUrl = new URL(
    WHATSAPP_WEB_LOCAL_BFF_PATHS[action],
    `http://${LOCAL_AGENT_HOST}:${port}`
  );

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetchWithTimeout(
      fetchImpl,
      localAgentUrl,
      {
        method: expectedMethod(action),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${controlToken}`
        },
        body: undefined,
        cache: "no-store",
        credentials: "omit",
        redirect: "manual"
      },
      timeoutMs
    );
  } catch {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_upstream_unavailable",
      now,
      "error"
    );
  }

  if (!upstreamResponse.ok) {
    return deniedResponse(
      502,
      "whatsapp_web_local_bff_upstream_rejected",
      now,
      "error"
    );
  }

  let safePayload: WhatsAppWebLocalBffResponse | undefined;
  try {
    safePayload = sanitizeUpstreamResponse(await upstreamResponse.json());
  } catch {
    safePayload = undefined;
  }
  if (!safePayload) {
    return deniedResponse(
      502,
      "whatsapp_web_local_bff_invalid_upstream_response",
      now,
      "error"
    );
  }

  return noStoreJson(200, safePayload);
}
