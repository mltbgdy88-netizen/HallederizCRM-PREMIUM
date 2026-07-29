import assert from "node:assert/strict";
import test from "node:test";
import type { Permission, SessionModel } from "@hallederiz/types";
import * as actionRoute from "../../../app/api/whatsapp-web-local/[action]/route";
import * as statusRoute from "../../../app/api/whatsapp-web-local/status/route";
import {
  WHATSAPP_WEB_LOCAL_BFF_PATHS,
  dispatchWhatsAppWebLocalControlRequest,
  type WhatsAppWebLocalBffAction,
  type WhatsAppWebLocalBffResponse,
  type WhatsAppWebLocalProxyRuntime
} from "../whatsapp-web-local-control-proxy";

const TEST_NOW = "2026-07-28T15:00:00.000Z";
const CONTROL_TOKEN = "CONTROL_TOKEN_TEST_VALUE";
const SESSION_COOKIE = "hz_session=SIGNED_SESSION_TEST_VALUE";
const SAFE_RESPONSE_KEYS = [
  "checkedAt",
  "generation",
  "providerCallExecuted",
  "reasonCode",
  "state"
];

type FetchCall = {
  url: URL;
  init: RequestInit;
};

function permission(key: string): Permission {
  return {
    id: `permission_${key}`,
    key,
    name: key,
    moduleCode: "core"
  };
}

function sessionResponse(
  permissions: string[] = ["integrations.read", "integrations.write", "whatsapp.write"],
  expiresAt = "2099-01-01T00:00:00.000Z",
  tenantOverrides: {
    sessionTenantId?: string | null;
    userTenantId?: string | null;
  } = {}
): Response {
  const permissionItems = permissions.map(permission);
  const session: SessionModel = {
    id: "session_test",
    tenant: {
      id: "tenant_test",
      slug: "tenant-test",
      name: "Tenant Test",
      status: "active",
      locale: "tr-TR",
      timeZone: "Europe/Istanbul",
      modules: [],
      createdAt: TEST_NOW,
      updatedAt: TEST_NOW
    },
    user: {
      id: "user_test",
      tenantId: "tenant_test",
      email: "test@example.com",
      fullName: "Test User",
      status: "active",
      directPermissions: []
    },
    roles: [],
    permissions: permissionItems,
    issuedAt: TEST_NOW,
    expiresAt
  };
  const mutableSession = session as unknown as {
    tenant: { id?: string };
    user: { tenantId?: string };
  };
  if (Object.prototype.hasOwnProperty.call(tenantOverrides, "sessionTenantId")) {
    if (tenantOverrides.sessionTenantId === null) {
      delete mutableSession.tenant.id;
    } else {
      mutableSession.tenant.id = tenantOverrides.sessionTenantId;
    }
  }
  if (Object.prototype.hasOwnProperty.call(tenantOverrides, "userTenantId")) {
    if (tenantOverrides.userTenantId === null) {
      delete mutableSession.user.tenantId;
    } else {
      mutableSession.user.tenantId = tenantOverrides.userTenantId;
    }
  }
  return Response.json({ item: session });
}

function localAgentResponse(
  overrides: Partial<WhatsAppWebLocalBffResponse> & Record<string, unknown> = {}
): Response {
  return Response.json({
    state: "logged_out",
    reasonCode: "whatsapp_web_local_enabled_non_production",
    generation: 0,
    providerCallExecuted: false,
    checkedAt: TEST_NOW,
    ...overrides
  });
}

function requestFor(
  action: WhatsAppWebLocalBffAction,
  options: {
    method?: string;
    cookie?: string | null;
    origin?: string | null;
    host?: string | null;
    forwarded?: string | null;
    xForwardedHost?: string | null;
    xForwardedProto?: string | null;
  } = {}
): Request {
  const headers = new Headers();
  const cookie = options.cookie === undefined ? SESSION_COOKIE : options.cookie;
  const host = options.host === undefined ? "localhost:3000" : options.host;
  if (cookie) headers.set("cookie", cookie);
  if (host) headers.set("host", host);
  if (action !== "status") {
    const origin = options.origin === undefined ? "http://localhost:3000" : options.origin;
    if (origin) headers.set("origin", origin);
  } else if (options.origin) {
    headers.set("origin", options.origin);
  }
  if (options.forwarded) headers.set("forwarded", options.forwarded);
  if (options.xForwardedHost) headers.set("x-forwarded-host", options.xForwardedHost);
  if (options.xForwardedProto) headers.set("x-forwarded-proto", options.xForwardedProto);

  return new Request(`http://localhost:3000/api/whatsapp-web-local/${action}`, {
    method: options.method ?? (action === "status" ? "GET" : "POST"),
    headers
  });
}

function runtime(
  fetchImpl: typeof fetch,
  envOverrides: Record<string, string | undefined> = {},
  timeoutMs = 50
): WhatsAppWebLocalProxyRuntime {
  return {
    env: {
      NODE_ENV: "development",
      API_BASE_URL: "http://localhost:4000",
      WEB_URL: "http://localhost:3000",
      LOCAL_AGENT_CONTROL_PORT: "4319",
      LOCAL_AGENT_CONTROL_TOKEN: CONTROL_TOKEN,
      LOCAL_AGENT_TENANT_ID: "tenant_test",
      ...envOverrides
    },
    fetchImpl,
    now: () => TEST_NOW,
    timeoutMs
  };
}

function deterministicDeadlineRuntime(
  fetchImpl: typeof fetch,
  timeoutMs = 100
): {
  runtime: WhatsAppWebLocalProxyRuntime;
  advance: (milliseconds: number) => void;
  now: () => number;
  timerCreateCount: () => number;
  timerClearCount: () => number;
  controllerCreateCount: () => number;
} {
  let currentTime = 0;
  let timerCreateCount = 0;
  let timerClearCount = 0;
  let controllerCreateCount = 0;
  let activeTimer:
    | {
        handle: object;
        dueAt: number;
        callback: () => void;
      }
    | undefined;

  const deadlineRuntime = runtime(fetchImpl, {}, timeoutMs);
  deadlineRuntime.monotonicNow = () => currentTime;
  deadlineRuntime.setDeadlineTimer = (callback, delayMs) => {
    timerCreateCount += 1;
    const handle = {};
    activeTimer = {
      handle,
      dueAt: currentTime + delayMs,
      callback
    };
    return handle;
  };
  deadlineRuntime.clearDeadlineTimer = (handle) => {
    timerClearCount += 1;
    if (activeTimer?.handle === handle) {
      activeTimer = undefined;
    }
  };
  deadlineRuntime.createAbortController = () => {
    controllerCreateCount += 1;
    return new AbortController();
  };

  return {
    runtime: deadlineRuntime,
    advance: (milliseconds) => {
      currentTime += milliseconds;
      if (activeTimer && currentTime >= activeTimer.dueAt) {
        const callback = activeTimer.callback;
        activeTimer = undefined;
        callback();
      }
    },
    now: () => currentTime,
    timerCreateCount: () => timerCreateCount,
    timerClearCount: () => timerClearCount,
    controllerCreateCount: () => controllerCreateCount
  };
}

async function withRouteEnvironment<T>(
  fetchImpl: typeof fetch,
  envOverrides: Record<string, string | undefined>,
  run: () => Promise<T> | T
): Promise<T> {
  const env = {
    NODE_ENV: "development",
    API_BASE_URL: "http://localhost:4000",
    WEB_URL: "http://localhost:3000",
    LOCAL_AGENT_CONTROL_PORT: "4319",
    LOCAL_AGENT_CONTROL_TOKEN: CONTROL_TOKEN,
    LOCAL_AGENT_TENANT_ID: "tenant_test",
    ...envOverrides
  };
  const originalFetch = globalThis.fetch;
  const originalEnv = new Map<string, string | undefined>();

  try {
    for (const [key, value] of Object.entries(env)) {
      originalEnv.set(key, process.env[key]);
      if (value === undefined) {
        Reflect.deleteProperty(process.env, key);
      } else {
        Reflect.set(process.env, key, value);
      }
    }
    globalThis.fetch = fetchImpl;
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of originalEnv) {
      if (value === undefined) {
        Reflect.deleteProperty(process.env, key);
      } else {
        Reflect.set(process.env, key, value);
      }
    }
  }
}

async function readSafeResponse(response: Response): Promise<WhatsAppWebLocalBffResponse> {
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = (await response.json()) as WhatsAppWebLocalBffResponse;
  assert.deepEqual(Object.keys(body).sort(), SAFE_RESPONSE_KEYS);
  assert.equal(body.providerCallExecuted, false);
  return body;
}

function successfulFetch(calls: FetchCall[], response = localAgentResponse()): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    calls.push({ url, init: init ?? {} });
    if (url.pathname === "/auth/session") {
      return sessionResponse();
    }
    return response;
  }) as typeof fetch;
}

test("unauthenticated request is denied before any upstream call", async () => {
  let fetchCount = 0;
  const response = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status", { cookie: null }),
    "status",
    runtime((async () => {
      fetchCount += 1;
      throw new Error("unexpected fetch");
    }) as typeof fetch)
  );

  assert.equal(response.status, 401);
  assert.equal((await readSafeResponse(response)).reasonCode, "whatsapp_web_local_bff_auth_required");
  assert.equal(fetchCount, 0);
});

test("expired server session is rejected without calling local-agent", async () => {
  const calls: FetchCall[] = [];
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    calls.push({ url, init: init ?? {} });
    return sessionResponse(["integrations.read"], "2020-01-01T00:00:00.000Z");
  }) as typeof fetch;

  const response = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status"),
    "status",
    runtime(fetchImpl)
  );

  assert.equal(response.status, 401);
  assert.equal((await readSafeResponse(response)).reasonCode, "whatsapp_web_local_bff_session_expired");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url.pathname, "/auth/session");
});

test("exported action route binds valid trimmed tenant context before local-agent", { concurrency: false }, async () => {
  const scenarios = [
    {
      name: "missing session tenant",
      session: sessionResponse(undefined, undefined, { sessionTenantId: null }),
      env: {},
      expectedStatus: 401,
      expectedReason: "whatsapp_web_local_bff_session_invalid"
    },
    {
      name: "missing user tenant",
      session: sessionResponse(undefined, undefined, { userTenantId: null }),
      env: {},
      expectedStatus: 401,
      expectedReason: "whatsapp_web_local_bff_session_invalid"
    },
    {
      name: "session and user tenant mismatch",
      session: sessionResponse(undefined, undefined, { userTenantId: "tenant_other" }),
      env: {},
      expectedStatus: 403,
      expectedReason: "whatsapp_web_local_bff_tenant_denied"
    },
    {
      name: "whitespace session tenant",
      session: sessionResponse(undefined, undefined, { sessionTenantId: "   " }),
      env: {},
      expectedStatus: 401,
      expectedReason: "whatsapp_web_local_bff_session_invalid"
    },
    {
      name: "whitespace user tenant",
      session: sessionResponse(undefined, undefined, { userTenantId: "   " }),
      env: {},
      expectedStatus: 401,
      expectedReason: "whatsapp_web_local_bff_session_invalid"
    },
    {
      name: "tenant values mismatch after unsafe surrounding whitespace",
      session: sessionResponse(undefined, undefined, {
        sessionTenantId: " tenant_test",
        userTenantId: "tenant_test"
      }),
      env: {},
      expectedStatus: 401,
      expectedReason: "whatsapp_web_local_bff_session_invalid"
    },
    {
      name: "missing local-agent tenant",
      session: sessionResponse(),
      env: { LOCAL_AGENT_TENANT_ID: undefined },
      expectedStatus: 503,
      expectedReason: "whatsapp_web_local_bff_control_unavailable"
    },
    {
      name: "blank local-agent tenant",
      session: sessionResponse(),
      env: { LOCAL_AGENT_TENANT_ID: "   " },
      expectedStatus: 503,
      expectedReason: "whatsapp_web_local_bff_control_unavailable"
    },
    {
      name: "session and local-agent tenant mismatch",
      session: sessionResponse(),
      env: { LOCAL_AGENT_TENANT_ID: "tenant_other" },
      expectedStatus: 403,
      expectedReason: "whatsapp_web_local_bff_tenant_denied"
    }
  ] as const;

  for (const scenario of scenarios) {
    const calls: FetchCall[] = [];
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      calls.push({ url, init: init ?? {} });
      return url.pathname === "/auth/session" ? scenario.session : localAgentResponse();
    }) as typeof fetch;

    const response = await withRouteEnvironment(
      fetchImpl,
      scenario.env,
      () =>
        actionRoute.POST(requestFor("start"), {
          params: Promise.resolve({ action: "start" })
        })
    );

    assert.equal(response.status, scenario.expectedStatus, scenario.name);
    assert.equal((await readSafeResponse(response)).reasonCode, scenario.expectedReason, scenario.name);
    assert.equal(calls.length, 1, `${scenario.name} must not call local-agent`);
    assert.equal(calls[0]?.url.pathname, "/auth/session");
  }
});

test("status and mutations use existing read/write permissions and fail closed when missing", async () => {
  for (const [action, permissions, expectedStatus] of [
    ["status", ["integrations.read"], 200],
    ["status", [], 403],
    ["start", ["integrations.write"], 200],
    ["refresh", ["whatsapp.write"], 200],
    ["disconnect", ["integrations.read"], 403]
  ] as const) {
    const calls: FetchCall[] = [];
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      calls.push({ url, init: init ?? {} });
      return url.pathname === "/auth/session" ? sessionResponse([...permissions]) : localAgentResponse();
    }) as typeof fetch;

    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor(action),
      action,
      runtime(fetchImpl)
    );
    assert.equal(response.status, expectedStatus);
    const body = await readSafeResponse(response);
    if (expectedStatus === 403) {
      assert.equal(body.reasonCode, "whatsapp_web_local_bff_permission_denied");
      assert.equal(calls.length, 1);
    } else {
      assert.equal(calls.length, 2);
    }
  }
});

test("mutations require the trusted full origin and reject untrusted proxy headers", { concurrency: false }, async () => {
  const invalidRequests = [
    requestFor("start", { origin: "https://localhost:3000", host: "localhost:3000" }),
    requestFor("start", { origin: "http://localhost:3001", host: "localhost:3001" }),
    requestFor("start", { origin: "https://evil.example", host: "evil.example" }),
    requestFor("start", { origin: "not-a-url", host: "localhost:3000" }),
    requestFor("start", { origin: null, host: "localhost:3000" }),
    requestFor("start", { origin: "http://localhost:3000", host: "evil.example" }),
    requestFor("start", { origin: "http://localhost:3000", host: "localhost:3000/path" }),
    requestFor("start", { origin: "http://user@localhost:3000", host: "localhost:3000" }),
    requestFor("start", {
      forwarded: "host=localhost:3000;proto=http"
    }),
    requestFor("start", {
      xForwardedHost: "localhost:3000"
    }),
    requestFor("start", {
      xForwardedProto: "http"
    })
  ];

  for (const request of invalidRequests) {
    let fetchCount = 0;
    const response = await withRouteEnvironment(
      (async () => {
        fetchCount += 1;
        throw new Error("unexpected fetch");
      }) as typeof fetch,
      {},
      () => actionRoute.POST(request, { params: Promise.resolve({ action: "start" }) })
    );
    assert.equal(response.status, 403);
    assert.equal((await readSafeResponse(response)).reasonCode, "whatsapp_web_local_bff_origin_denied");
    assert.equal(fetchCount, 0);
  }

  const calls: FetchCall[] = [];
  const trustedResponse = await withRouteEnvironment(
    successfulFetch(calls),
    {},
    () =>
      actionRoute.POST(
        requestFor("start", {
          origin: "http://localhost:3000",
          host: "localhost:3000"
        }),
        { params: Promise.resolve({ action: "start" }) }
      )
  );
  assert.equal(trustedResponse.status, 200);
  await readSafeResponse(trustedResponse);
  assert.equal(calls.length, 2);
});

test("exported action route rejects invalid canonical WEB_URL before every upstream call", { concurrency: false }, async () => {
  const invalidWebUrls = [
    ["non-http protocol", "ftp://localhost:3000"],
    ["username credential", "http://user@localhost:3000"],
    ["password credential", "http://:password@localhost:3000"],
    ["non-root path", "http://localhost:3000/not-root"],
    ["query", "http://localhost:3000?source=unsafe"],
    ["fragment", "http://localhost:3000#unsafe"],
    ["missing", undefined],
    ["empty", ""],
    ["whitespace", "   "]
  ] as const;

  for (const [name, webUrl] of invalidWebUrls) {
    let fetchCount = 0;
    const response = await withRouteEnvironment(
      (async () => {
        fetchCount += 1;
        throw new Error("invalid WEB_URL must not fetch");
      }) as typeof fetch,
      { WEB_URL: webUrl },
      () =>
        actionRoute.POST(requestFor("start"), {
          params: Promise.resolve({ action: "start" })
        })
    );

    assert.equal(response.status, 403, name);
    assert.equal(
      (await readSafeResponse(response)).reasonCode,
      "whatsapp_web_local_bff_origin_denied",
      name
    );
    assert.equal(fetchCount, 0, name);
  }
});

test("production status is disabled and every mutation hard-denies with zero upstream calls", async () => {
  let fetchCount = 0;
  let timerCreateCount = 0;
  let controllerCreateCount = 0;
  const fetchImpl = (async () => {
    fetchCount += 1;
    throw new Error("production must not fetch");
  }) as typeof fetch;
  const productionRuntime = runtime(fetchImpl, { NODE_ENV: "production" });
  productionRuntime.setDeadlineTimer = () => {
    timerCreateCount += 1;
    return {};
  };
  productionRuntime.createAbortController = () => {
    controllerCreateCount += 1;
    return new AbortController();
  };

  const statusResponse = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status", { cookie: null }),
    "status",
    productionRuntime
  );
  assert.equal(statusResponse.status, 200);
  assert.equal((await readSafeResponse(statusResponse)).state, "disabled");

  for (const action of ["start", "refresh", "disconnect", "logout"] as const) {
    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor(action, { cookie: null, origin: null, host: null }),
      action,
      productionRuntime
    );
    assert.equal(response.status, 403);
    const body = await readSafeResponse(response);
    assert.equal(body.state, "disabled");
    assert.equal(body.reasonCode, "whatsapp_web_local_production_hard_deny");
  }
  assert.equal(fetchCount, 0);
  assert.equal(timerCreateCount, 0);
  assert.equal(controllerCreateCount, 0);
});

test("missing token and invalid port fail closed without calling local-agent", async () => {
  for (const envOverrides of [
    { LOCAL_AGENT_CONTROL_TOKEN: undefined },
    { LOCAL_AGENT_CONTROL_TOKEN: "   " },
    { LOCAL_AGENT_CONTROL_PORT: "0" },
    { LOCAL_AGENT_CONTROL_PORT: "65536" },
    { LOCAL_AGENT_CONTROL_PORT: "4319/path" },
    { LOCAL_AGENT_CONTROL_PORT: "not-a-port" }
  ]) {
    const calls: FetchCall[] = [];
    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor("status"),
      "status",
      runtime(successfulFetch(calls), envOverrides)
    );
    assert.equal(response.status, 503);
    assert.equal((await readSafeResponse(response)).reasonCode, "whatsapp_web_local_bff_control_unavailable");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url.pathname, "/auth/session");
  }
});

test("local-agent timeout and connection failure return a generic safe error", async () => {
  for (const mode of ["timeout", "unreachable"] as const) {
    let callCount = 0;
    const fetchImpl = (async (
      input: string | URL | Request,
      init?: RequestInit
    ): Promise<Response> => {
      callCount += 1;
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.pathname === "/auth/session") {
        return sessionResponse();
      }
      if (mode === "unreachable") {
        throw new Error("ECONNREFUSED SECRET_MARKER");
      }
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("TOKEN_MARKER")), {
          once: true
        });
      });
    }) as typeof fetch;

    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor("status"),
      "status",
      runtime(fetchImpl, {}, 5)
    );
    assert.equal(response.status, 503);
    const serialized = await response.text();
    assert.equal(serialized.includes("SECRET_MARKER"), false);
    assert.equal(serialized.includes("TOKEN_MARKER"), false);
    assert.match(serialized, /whatsapp_web_local_bff_upstream_unavailable/);
    assert.equal(callCount, 2);
  }
});

test("one monotonic dispatch deadline is shared across session and local-agent", async () => {
  const observedSignals: AbortSignal[] = [];
  let localAgentStartedAt = -1;
  let harness: ReturnType<typeof deterministicDeadlineRuntime>;

  const fetchImpl = (async (
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    assert.ok(init?.signal);
    observedSignals.push(init.signal);

    if (url.pathname === "/auth/session") {
      harness.advance(75);
      return sessionResponse();
    }

    localAgentStartedAt = harness.now();
    return await new Promise<Response>((_resolve, reject) => {
      const rejectOnAbort = () => reject(new Error("TOTAL_DEADLINE_SECRET_MARKER"));
      if (init.signal?.aborted) {
        rejectOnAbort();
        return;
      }
      init.signal?.addEventListener("abort", rejectOnAbort, { once: true });
      harness.advance(25);
    });
  }) as typeof fetch;
  harness = deterministicDeadlineRuntime(fetchImpl, 100);

  const response = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status"),
    "status",
    harness.runtime
  );
  assert.equal(response.status, 503);
  const serialized = await response.text();
  assert.equal(serialized.includes("TOTAL_DEADLINE_SECRET_MARKER"), false);
  assert.equal(harness.now(), 100);
  assert.equal(localAgentStartedAt, 75);
  assert.equal(harness.timerCreateCount(), 1);
  assert.equal(harness.timerClearCount(), 1);
  assert.equal(harness.controllerCreateCount(), 1);
  assert.equal(observedSignals.length, 2);
  assert.equal(observedSignals[0], observedSignals[1]);
  assert.equal(observedSignals[0]?.aborted, true);
});

test("shared deadline aborts hanging session and local-agent bodies and cleans resources", async () => {
  for (const target of ["session", "local-agent"] as const) {
    const calls: FetchCall[] = [];
    const observedSignals: AbortSignal[] = [];
    let bodyCancelled = false;
    let resolveBodyStarted: (() => void) | undefined;
    const bodyStarted = new Promise<void>((resolve) => {
      resolveBodyStarted = resolve;
    });

    const hangingResponse = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("HANGING_BODY_SECRET_MARKER"));
        },
        cancel() {
          bodyCancelled = true;
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
    Object.defineProperty(hangingResponse, "json", {
      value: () => {
        resolveBodyStarted?.();
        return new Promise<unknown>(() => undefined);
      }
    });

    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      calls.push({ url, init: init ?? {} });
      assert.ok(init?.signal);
      observedSignals.push(init.signal);
      const isSessionCall = url.pathname === "/auth/session";
      if (
        (target === "session" && isSessionCall) ||
        (target === "local-agent" && !isSessionCall)
      ) {
        return hangingResponse;
      }
      return sessionResponse();
    }) as typeof fetch;
    const harness = deterministicDeadlineRuntime(fetchImpl, 100);

    const dispatchPromise = dispatchWhatsAppWebLocalControlRequest(
      requestFor("status"),
      "status",
      harness.runtime
    );
    await bodyStarted;
    harness.advance(100);
    const response = await dispatchPromise;

    assert.equal(response.status, 503, target);
    const serialized = await response.text();
    assert.equal(serialized.includes("HANGING_BODY_SECRET_MARKER"), false);
    assert.equal(bodyCancelled, true, `${target} body must be cancelled`);
    assert.equal(harness.timerCreateCount(), 1);
    assert.equal(harness.timerClearCount(), 1);
    assert.equal(harness.controllerCreateCount(), 1);
    assert.equal(calls.length, target === "session" ? 1 : 2);
    assert.equal(observedSignals.every((signal) => signal === observedSignals[0]), true);
    assert.equal(observedSignals[0]?.aborted, true);
  }
});

test("exported status route cancels non-OK bodies without exposing them", { concurrency: false }, async () => {
  for (const target of ["session", "local-agent"] as const) {
    let bodyCancelled = false;
    const calls: FetchCall[] = [];
    const nonOkResponse = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("NON_OK_SECRET_MARKER"));
        },
        cancel() {
          bodyCancelled = true;
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      calls.push({ url, init: init ?? {} });
      const isSessionCall = url.pathname === "/auth/session";
      if (
        (target === "session" && isSessionCall) ||
        (target === "local-agent" && !isSessionCall)
      ) {
        return nonOkResponse;
      }
      return sessionResponse();
    }) as typeof fetch;

    const response = await withRouteEnvironment(
      fetchImpl,
      {},
      () => statusRoute.GET(requestFor("status"))
    );
    assert.equal(response.status, target === "session" ? 503 : 502);
    const serialized = await response.text();
    assert.equal(bodyCancelled, true, `${target} body must be cancelled`);
    assert.equal(serialized.includes("NON_OK_SECRET_MARKER"), false);
    assert.equal(calls.length, target === "session" ? 1 : 2);
  }
});

test("all five actions map to fixed 127.0.0.1 paths, methods, manual redirects, and server bearer auth", async () => {
  for (const action of Object.keys(WHATSAPP_WEB_LOCAL_BFF_PATHS) as WhatsAppWebLocalBffAction[]) {
    const calls: FetchCall[] = [];
    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor(action),
      action,
      runtime(successfulFetch(calls), { LOCAL_AGENT_CONTROL_PORT: "5123" })
    );
    assert.equal(response.status, 200);
    await readSafeResponse(response);
    assert.equal(calls.length, 2);

    const localCall = calls[1];
    assert.ok(localCall);
    assert.equal(localCall.url.protocol, "http:");
    assert.equal(localCall.url.hostname, "127.0.0.1");
    assert.equal(localCall.url.port, "5123");
    assert.equal(localCall.url.pathname, WHATSAPP_WEB_LOCAL_BFF_PATHS[action]);
    assert.equal(localCall.init.method, action === "status" ? "GET" : "POST");
    assert.equal(localCall.init.redirect, "manual");
    assert.equal(new Headers(localCall.init.headers).get("authorization"), `Bearer ${CONTROL_TOKEN}`);
  }
});

test("unknown actions and wrong HTTP methods are rejected without upstream calls", async () => {
  let fetchCount = 0;
  const fetchImpl = (async () => {
    fetchCount += 1;
    throw new Error("unexpected fetch");
  }) as typeof fetch;

  const notFound = await dispatchWhatsAppWebLocalControlRequest(
    new Request("http://localhost:3000/api/whatsapp-web-local/unknown", { method: "POST" }),
    "unknown",
    runtime(fetchImpl)
  );
  assert.equal(notFound.status, 404);
  assert.equal((await readSafeResponse(notFound)).reasonCode, "whatsapp_web_local_bff_action_not_found");

  const wrongStatusMethod = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status", { method: "POST" }),
    "status",
    runtime(fetchImpl)
  );
  assert.equal(wrongStatusMethod.status, 405);

  const wrongMutationMethod = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("start", { method: "GET" }),
    "start",
    runtime(fetchImpl)
  );
  assert.equal(wrongMutationMethod.status, 405);
  assert.equal(fetchCount, 0);
});

test("response is reserialized through the safe allowlist and drops sensitive upstream fields", async () => {
  const sensitiveMarkers = [
    CONTROL_TOKEN,
    SESSION_COOKIE,
    "SECRET_MARKER",
    "SESSION_MARKER",
    "AUTH_STATE_MARKER",
    "QR_CONTENT_MARKER"
  ];
  const upstream = localAgentResponse({
    qr: "QR_CONTENT_MARKER",
    token: CONTROL_TOKEN,
    session: "SESSION_MARKER",
    authState: "AUTH_STATE_MARKER",
    secret: "SECRET_MARKER",
    nested: { markers: sensitiveMarkers }
  });
  const calls: FetchCall[] = [];

  const response = await dispatchWhatsAppWebLocalControlRequest(
    requestFor("status"),
    "status",
    runtime(successfulFetch(calls, upstream))
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const serialized = await response.text();
  assert.deepEqual(Object.keys(JSON.parse(serialized) as Record<string, unknown>).sort(), SAFE_RESPONSE_KEYS);
  for (const marker of sensitiveMarkers) {
    assert.equal(serialized.includes(marker), false);
  }
});

test("invalid or failed upstream bodies are never passed through", async () => {
  for (const upstream of [
    Response.json({ message: "SECRET_MARKER", token: CONTROL_TOKEN }, { status: 500 }),
    Response.json({
      state: "logged_out",
      reasonCode: "whatsapp_web_local_enabled_non_production",
      generation: 0,
      providerCallExecuted: true,
      checkedAt: TEST_NOW,
      secret: "SECRET_MARKER"
    }),
    localAgentResponse({ reasonCode: "QR CONTENT MARKER" }),
    localAgentResponse({ reasonCode: "whatsapp_web_local_secret_marker" }),
    new Response("TOKEN_MARKER", { status: 200 })
  ]) {
    const calls: FetchCall[] = [];
    const response = await dispatchWhatsAppWebLocalControlRequest(
      requestFor("status"),
      "status",
      runtime(successfulFetch(calls, upstream))
    );
    assert.equal(response.status, upstream.ok ? 502 : 502);
    const serialized = await response.text();
    assert.equal(serialized.includes("SECRET_MARKER"), false);
    assert.equal(serialized.includes("secret_marker"), false);
    assert.equal(serialized.includes("TOKEN_MARKER"), false);
    assert.equal(serialized.includes(CONTROL_TOKEN), false);
  }
});

test("exported Route Handlers return secure 405 responses for every unsupported method", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  try {
    globalThis.fetch = (async () => {
      fetchCount += 1;
      throw new Error("unsupported route method must not fetch");
    }) as typeof fetch;

    const statusMethods = [
      ["POST", statusRoute.POST, false],
      ["PUT", statusRoute.PUT, false],
      ["PATCH", statusRoute.PATCH, false],
      ["DELETE", statusRoute.DELETE, false],
      ["OPTIONS", statusRoute.OPTIONS, false],
      ["HEAD", statusRoute.HEAD, true]
    ] as const;
    const actionMethods = [
      ["GET", actionRoute.GET, false],
      ["PUT", actionRoute.PUT, false],
      ["PATCH", actionRoute.PATCH, false],
      ["DELETE", actionRoute.DELETE, false],
      ["OPTIONS", actionRoute.OPTIONS, false],
      ["HEAD", actionRoute.HEAD, true]
    ] as const;

    for (const [method, handler, isHead] of statusMethods) {
      const response = handler();
      assert.equal(response.status, 405, `status ${method}`);
      assert.equal(response.headers.get("allow"), "GET", `status ${method}`);
      assert.equal(response.headers.get("cache-control"), "no-store", `status ${method}`);
      assert.equal(response.headers.has("access-control-allow-origin"), false, `status ${method}`);
      assert.equal(response.headers.has("access-control-allow-methods"), false, `status ${method}`);
      if (isHead) {
        assert.equal(await response.text(), "");
      } else {
        assert.equal(
          (await readSafeResponse(response)).reasonCode,
          "whatsapp_web_local_bff_method_not_allowed"
        );
      }
    }

    for (const [method, handler, isHead] of actionMethods) {
      const response = handler();
      assert.equal(response.status, 405, `action ${method}`);
      assert.equal(response.headers.get("allow"), "POST", `action ${method}`);
      assert.equal(response.headers.get("cache-control"), "no-store", `action ${method}`);
      assert.equal(response.headers.has("access-control-allow-origin"), false, `action ${method}`);
      assert.equal(response.headers.has("access-control-allow-methods"), false, `action ${method}`);
      if (isHead) {
        assert.equal(await response.text(), "");
      } else {
        assert.equal(
          (await readSafeResponse(response)).reasonCode,
          "whatsapp_web_local_bff_method_not_allowed"
        );
      }
    }

    const unknownAction = await actionRoute.POST(
      new Request("http://localhost:3000/api/whatsapp-web-local/unknown", {
        method: "POST"
      }),
      { params: Promise.resolve({ action: "unknown" }) }
    );
    assert.equal(unknownAction.status, 404);
    assert.equal(
      (await readSafeResponse(unknownAction)).reasonCode,
      "whatsapp_web_local_bff_action_not_found"
    );
    assert.equal(fetchCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Next route handlers expose status GET and four mutation POST actions", { concurrency: false }, async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  try {
    Reflect.set(process.env, "NODE_ENV", "production");
    globalThis.fetch = (async () => {
      fetchCount += 1;
      throw new Error("route production guard must not fetch");
    }) as typeof fetch;

    const statusResponse = await statusRoute.GET(requestFor("status", { cookie: null }));
    assert.equal(statusResponse.status, 200);
    assert.equal((await readSafeResponse(statusResponse)).state, "disabled");

    for (const action of ["start", "refresh", "disconnect", "logout"] as const) {
      const response = await actionRoute.POST(
        requestFor(action, { cookie: null }),
        { params: Promise.resolve({ action }) }
      );
      assert.equal(response.status, 403);
      assert.equal(
        (await readSafeResponse(response)).reasonCode,
        "whatsapp_web_local_production_hard_deny"
      );
    }
    assert.equal(fetchCount, 0);
  } finally {
    if (originalNodeEnv === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    } else {
      Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
    }
    globalThis.fetch = originalFetch;
  }
});
