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
  monotonicNow?: () => number;
  setDeadlineTimer?: (callback: () => void, delayMs: number) => unknown;
  clearDeadlineTimer?: (handle: unknown) => void;
  createAbortController?: () => AbortController;
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

function noStoreHeaders(extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

function noStoreJson(
  status: number,
  body: WhatsAppWebLocalBffResponse,
  extraHeaders?: HeadersInit
): Response {
  return Response.json(body, {
    status,
    headers: noStoreHeaders(extraHeaders)
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

export function createWhatsAppWebLocalMethodNotAllowedResponse(
  allowedMethod: "GET" | "POST",
  requestMethod: string,
  now: () => string = () => new Date().toISOString()
): Response {
  const headers = noStoreHeaders({ Allow: allowedMethod });
  if (requestMethod.toUpperCase() === "HEAD") {
    return new Response(null, { status: 405, headers });
  }
  return noStoreJson(
    405,
    {
      state: "disabled",
      reasonCode: "whatsapp_web_local_bff_method_not_allowed",
      generation: 0,
      providerCallExecuted: false,
      checkedAt: now()
    },
    headers
  );
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

function resolveTrustedWebOrigin(env: RuntimeEnvironment): URL | undefined {
  const configuredOrigin = env.WEB_URL?.trim();
  if (!configuredOrigin) {
    return undefined;
  }

  try {
    const origin = new URL(configuredOrigin);
    if (
      (origin.protocol !== "http:" && origin.protocol !== "https:") ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash
    ) {
      return undefined;
    }
    return origin;
  } catch {
    return undefined;
  }
}

function validateSameOrigin(request: Request, env: RuntimeEnvironment): boolean {
  if (
    request.headers.has("forwarded") ||
    request.headers.has("x-forwarded-host") ||
    request.headers.has("x-forwarded-proto")
  ) {
    return false;
  }

  const trustedOrigin = resolveTrustedWebOrigin(env);
  const originHeader = request.headers.get("origin")?.trim();
  const hostHeader = request.headers.get("host")?.trim().toLowerCase();
  if (!trustedOrigin || !originHeader || !hostHeader || /[\\/\s]/.test(hostHeader)) {
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
      origin.origin === trustedOrigin.origin &&
      hostHeader === trustedOrigin.host.toLowerCase()
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

function resolveLocalAgentTenantId(env: RuntimeEnvironment): string | undefined {
  const tenantId = env.LOCAL_AGENT_TENANT_ID;
  if (!tenantId || tenantId.trim().length === 0 || tenantId !== tenantId.trim()) {
    return undefined;
  }
  return tenantId;
}

function resolveTimeoutMs(runtime: WhatsAppWebLocalProxyRuntime): number {
  const timeoutMs = runtime.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return Math.min(Math.floor(timeoutMs), MAX_TIMEOUT_MS);
}

class DeadlineExceededError extends Error {}

type JsonFetchResult = {
  status: number;
  ok: boolean;
  payload?: unknown;
  bodyReadFailed: boolean;
};

type DispatchDeadline = {
  signal: AbortSignal;
  expiresAt: number;
  remainingMs: () => number;
  assertActive: () => void;
  race: <T>(operation: Promise<T>) => Promise<T>;
  abort: () => void;
  dispose: () => void;
};

type DeadlineRuntime = {
  timeoutMs: number;
  monotonicNow: () => number;
  setDeadlineTimer: (callback: () => void, delayMs: number) => unknown;
  clearDeadlineTimer: (handle: unknown) => void;
  createAbortController: () => AbortController;
};

function createDispatchDeadline(runtime: DeadlineRuntime): DispatchDeadline {
  const controller = runtime.createAbortController();
  const expiresAt = runtime.monotonicNow() + runtime.timeoutMs;
  let deadlineError: DeadlineExceededError | undefined;
  let rejectDeadline: (error: DeadlineExceededError) => void = () => undefined;
  let disposed = false;

  const deadlinePromise = new Promise<never>((_resolve, reject) => {
    rejectDeadline = reject;
  });
  void deadlinePromise.catch(() => undefined);

  const expire = (): DeadlineExceededError => {
    if (!deadlineError) {
      deadlineError = new DeadlineExceededError();
      controller.abort();
      rejectDeadline(deadlineError);
    }
    return deadlineError;
  };

  const timerHandle = runtime.setDeadlineTimer(expire, runtime.timeoutMs);
  const remainingMs = (): number => Math.max(0, expiresAt - runtime.monotonicNow());
  const assertActive = (): void => {
    if (controller.signal.aborted || remainingMs() <= 0) {
      throw expire();
    }
  };

  return {
    signal: controller.signal,
    expiresAt,
    remainingMs,
    assertActive,
    race: async <T>(operation: Promise<T>): Promise<T> => {
      return await Promise.race([operation, deadlinePromise]);
    },
    abort: () => controller.abort(),
    dispose: () => {
      if (!disposed) {
        disposed = true;
        runtime.clearDeadlineTimer(timerHandle);
      }
    }
  };
}

async function cancelResponseBody(
  response: Response | undefined,
  deadline: DispatchDeadline
): Promise<void> {
  if (!response?.body) {
    return;
  }
  try {
    const cancellation = response.body.cancel();
    await deadline.race(cancellation);
  } catch {
    // The request signal is also aborted on failures, so locked native fetch bodies are closed there.
  }
}

async function fetchJsonWithDeadline(
  fetchImpl: typeof fetch,
  input: string | URL,
  init: RequestInit,
  deadline: DispatchDeadline
): Promise<JsonFetchResult> {
  let response: Response | undefined;

  try {
    deadline.assertActive();
    response = await deadline.race(
      fetchImpl(input, {
        ...init,
        signal: deadline.signal
      })
    );

    if (!response.ok) {
      await cancelResponseBody(response, deadline);
      return {
        status: response.status,
        ok: false,
        bodyReadFailed: false
      };
    }

    try {
      deadline.assertActive();
      const payload = await deadline.race(response.json());
      return {
        status: response.status,
        ok: true,
        payload,
        bodyReadFailed: false
      };
    } catch (error) {
      const timedOut = deadline.signal.aborted || error instanceof DeadlineExceededError;
      deadline.abort();
      await cancelResponseBody(response, deadline);
      if (timedOut) {
        throw new DeadlineExceededError();
      }
      return {
        status: response.status,
        ok: true,
        bodyReadFailed: true
      };
    }
  } catch (error) {
    deadline.abort();
    await cancelResponseBody(response, deadline);
    throw error;
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
    !candidate.tenant ||
    typeof candidate.tenant !== "object" ||
    typeof candidate.tenant.id !== "string" ||
    candidate.tenant.id.trim().length === 0 ||
    candidate.tenant.id !== candidate.tenant.id.trim() ||
    !candidate.user ||
    typeof candidate.user !== "object" ||
    typeof candidate.user.tenantId !== "string" ||
    candidate.user.tenantId.trim().length === 0 ||
    candidate.user.tenantId !== candidate.user.tenantId.trim() ||
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
  },
  deadline: DispatchDeadline
): Promise<{ ok: true; session: SessionModel } | { ok: false; response: Response }> {
  const sessionCookie = readSessionCookieHeader(request.headers.get("cookie"));
  if (!sessionCookie) {
    return {
      ok: false,
      response: deniedResponse(401, "whatsapp_web_local_bff_auth_required", runtime.now)
    };
  }

  const sessionUrl = resolveApiSessionUrl(runtime.env);
  if (!sessionUrl) {
    return {
      ok: false,
      response: deniedResponse(
        503,
        "whatsapp_web_local_bff_session_validation_unavailable",
        runtime.now,
        "error"
      )
    };
  }

  let sessionResult: JsonFetchResult;
  try {
    sessionResult = await fetchJsonWithDeadline(
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
      deadline
    );
  } catch {
    return {
      ok: false,
      response: deniedResponse(
        503,
        "whatsapp_web_local_bff_session_validation_unavailable",
        runtime.now,
        "error"
      )
    };
  }

  if (sessionResult.status === 401) {
    return {
      ok: false,
      response: deniedResponse(401, "whatsapp_web_local_bff_session_invalid", runtime.now)
    };
  }
  if (!sessionResult.ok) {
    return {
      ok: false,
      response: deniedResponse(
        503,
        "whatsapp_web_local_bff_session_validation_unavailable",
        runtime.now,
        "error"
      )
    };
  }

  const session = sessionResult.bodyReadFailed ? undefined : readSession(sessionResult.payload);
  if (!session) {
    return {
      ok: false,
      response: deniedResponse(401, "whatsapp_web_local_bff_session_invalid", runtime.now)
    };
  }
  if (!isSessionActive(session)) {
    return {
      ok: false,
      response: deniedResponse(401, "whatsapp_web_local_bff_session_expired", runtime.now)
    };
  }
  if (session.tenant.id !== session.user.tenantId) {
    return {
      ok: false,
      response: deniedResponse(403, "whatsapp_web_local_bff_tenant_denied", runtime.now)
    };
  }

  const requiredPermissions = action === "status" ? STATUS_PERMISSIONS : MUTATION_PERMISSIONS;
  if (!hasSessionPermission(session, requiredPermissions)) {
    return {
      ok: false,
      response: deniedResponse(403, "whatsapp_web_local_bff_permission_denied", runtime.now)
    };
  }
  return { ok: true, session };
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
  const monotonicNow = overrides.monotonicNow ?? (() => performance.now());
  const setDeadlineTimer =
    overrides.setDeadlineTimer ??
    ((callback: () => void, delayMs: number): unknown => setTimeout(callback, delayMs));
  const clearDeadlineTimer =
    overrides.clearDeadlineTimer ??
    ((handle: unknown): void => clearTimeout(handle as ReturnType<typeof setTimeout>));
  const createAbortController =
    overrides.createAbortController ?? (() => new AbortController());
  const runtime = {
    env,
    fetchImpl,
    now,
    timeoutMs,
    monotonicNow,
    setDeadlineTimer,
    clearDeadlineTimer,
    createAbortController
  };

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

  if (MUTATION_ACTIONS.has(action) && !validateSameOrigin(request, env)) {
    return deniedResponse(403, "whatsapp_web_local_bff_origin_denied", now);
  }

  let deadline: DispatchDeadline;
  try {
    deadline = createDispatchDeadline(runtime);
  } catch {
    return deniedResponse(
      503,
      "whatsapp_web_local_bff_control_unavailable",
      now,
      "error"
    );
  }

  try {
    const authorization = await authorizeRequest(request, action, runtime, deadline);
    if (!authorization.ok) {
      return authorization.response;
    }

    const localAgentTenantId = resolveLocalAgentTenantId(env);
    if (!localAgentTenantId) {
      return deniedResponse(
        503,
        "whatsapp_web_local_bff_control_unavailable",
        now,
        "error"
      );
    }
    if (authorization.session.tenant.id !== localAgentTenantId) {
      return deniedResponse(403, "whatsapp_web_local_bff_tenant_denied", now);
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

    let upstreamResult: JsonFetchResult;
    try {
      upstreamResult = await fetchJsonWithDeadline(
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
        deadline
      );
    } catch {
      return deniedResponse(
        503,
        "whatsapp_web_local_bff_upstream_unavailable",
        now,
        "error"
      );
    }

    if (!upstreamResult.ok) {
      return deniedResponse(
        502,
        "whatsapp_web_local_bff_upstream_rejected",
        now,
        "error"
      );
    }

    const safePayload = upstreamResult.bodyReadFailed
      ? undefined
      : sanitizeUpstreamResponse(upstreamResult.payload);
    if (!safePayload) {
      return deniedResponse(
        502,
        "whatsapp_web_local_bff_invalid_upstream_response",
        now,
        "error"
      );
    }

    return noStoreJson(200, safePayload);
  } finally {
    deadline.dispose();
  }
}
