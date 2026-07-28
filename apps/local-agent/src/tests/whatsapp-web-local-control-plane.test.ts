import assert from "node:assert/strict";
import { request as httpRequest, type IncomingHttpHeaders } from "node:http";
import test from "node:test";
import {
  WHATSAPP_WEB_LOCAL_CONTROL_PATHS,
  isLoopbackHostHeader,
  isLoopbackRemoteAddress,
  startLocalWhatsAppWebControlPlane,
  type LocalWhatsAppWebControlResponse,
  type StartedLocalWhatsAppWebControlPlane
} from "../whatsapp-web-local-control-plane";

const TEST_NOW = "2026-07-28T12:00:00.000Z";
const CONTROL_TOKEN = "CONTROL_TOKEN_MARKER";
const ALLOWED_RESPONSE_KEYS = [
  "checkedAt",
  "generation",
  "providerCallExecuted",
  "reasonCode",
  "state"
];

type ControlRequestOptions = {
  controlPlane: StartedLocalWhatsAppWebControlPlane;
  path: string;
  method?: "GET" | "POST";
  token?: string;
  hostHeader?: string;
  body?: string;
};

type ControlRequestResult = {
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: LocalWhatsAppWebControlResponse;
  serializedBody: string;
};

async function requestControl(options: ControlRequestOptions): Promise<ControlRequestResult> {
  return new Promise<ControlRequestResult>((resolve, reject) => {
    const headers: Record<string, string> = {};
    if (options.token) {
      headers.authorization = `Bearer ${options.token}`;
    }
    if (options.hostHeader) {
      headers.host = options.hostHeader;
    }
    if (options.body) {
      headers["content-type"] = "application/json";
    }

    const request = httpRequest(
      {
        hostname: options.controlPlane.host,
        port: options.controlPlane.port,
        path: options.path,
        method: options.method ?? "GET",
        headers
      },
      (response) => {
        let serializedBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk: string) => {
          serializedBody += chunk;
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            headers: response.headers,
            body: JSON.parse(serializedBody) as LocalWhatsAppWebControlResponse,
            serializedBody
          });
        });
      }
    );
    request.on("error", reject);
    if (options.body) {
      request.write(options.body);
    }
    request.end();
  });
}

function assertSafeResponse(result: ControlRequestResult): void {
  assert.equal(result.headers["cache-control"], "no-store");
  assert.deepEqual(Object.keys(result.body).sort(), ALLOWED_RESPONSE_KEYS);
  assert.equal(result.body.providerCallExecuted, false);
  assert.equal(result.body.checkedAt, TEST_NOW);
}

async function startControlPlane(
  runtimeEnvironment: Record<string, string | undefined>
): Promise<StartedLocalWhatsAppWebControlPlane> {
  return startLocalWhatsAppWebControlPlane({
    controlToken: CONTROL_TOKEN,
    port: 0,
    runtimeEnvironment,
    now: () => TEST_NOW
  });
}

test("control endpoints require auth and remain loopback-only", async (context) => {
  const controlPlane = await startControlPlane({
    NODE_ENV: "development",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
  context.after(() => controlPlane.close());

  const address = controlPlane.server.address();
  assert.ok(address && typeof address !== "string");
  assert.equal(address.address, "127.0.0.1");
  assert.equal(controlPlane.host, "127.0.0.1");
  assert.equal(isLoopbackRemoteAddress("127.0.0.1"), true);
  assert.equal(isLoopbackRemoteAddress("::ffff:127.0.0.1"), true);
  assert.equal(isLoopbackRemoteAddress("192.168.1.10"), false);
  assert.equal(isLoopbackHostHeader("localhost:4319"), true);
  assert.equal(isLoopbackHostHeader("example.com"), false);

  const unauthorized = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status
  });
  assert.equal(unauthorized.statusCode, 401);
  assert.equal(unauthorized.body.state, "disabled");
  assert.equal(unauthorized.body.reasonCode, "whatsapp_web_local_control_unauthorized");
  assertSafeResponse(unauthorized);

  const hostDenied = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
    token: CONTROL_TOKEN,
    hostHeader: "example.com"
  });
  assert.equal(hostDenied.statusCode, 403);
  assert.equal(hostDenied.body.state, "disabled");
  assert.equal(hostDenied.body.reasonCode, "whatsapp_web_local_control_host_denied");
  assertSafeResponse(hostDenied);

  const authorized = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
    token: CONTROL_TOKEN
  });
  assert.equal(authorized.statusCode, 200);
  assert.equal(authorized.body.state, "logged_out");
  assertSafeResponse(authorized);
});

test("feature flag disabled returns a safe disabled response", async (context) => {
  const controlPlane = await startControlPlane({ NODE_ENV: "development" });
  context.after(() => controlPlane.close());

  const result = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.start,
    method: "POST",
    token: CONTROL_TOKEN
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.state, "disabled");
  assert.equal(result.body.reasonCode, "whatsapp_web_local_disabled_by_default");
  assert.equal(result.body.generation, 0);
  assertSafeResponse(result);
});

test("production hard-denies every mutation endpoint", async (context) => {
  const controlPlane = await startControlPlane({
    NODE_ENV: "production",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
  context.after(() => controlPlane.close());

  const status = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
    token: CONTROL_TOKEN
  });
  assert.equal(status.statusCode, 200);
  assert.equal(status.body.state, "disabled");
  assert.equal(status.body.reasonCode, "whatsapp_web_local_production_hard_deny");
  assertSafeResponse(status);

  for (const path of [
    WHATSAPP_WEB_LOCAL_CONTROL_PATHS.start,
    WHATSAPP_WEB_LOCAL_CONTROL_PATHS.refresh,
    WHATSAPP_WEB_LOCAL_CONTROL_PATHS.disconnect,
    WHATSAPP_WEB_LOCAL_CONTROL_PATHS.logout
  ]) {
    const result = await requestControl({
      controlPlane,
      path,
      method: "POST",
      token: CONTROL_TOKEN
    });
    assert.equal(result.statusCode, 403);
    assert.equal(result.body.state, "disabled");
    assert.equal(result.body.reasonCode, "whatsapp_web_local_production_hard_deny");
    assert.equal(result.body.generation, 0);
    assertSafeResponse(result);
  }
});

test("status, start, refresh, disconnect, and logout control the shared stub engine", async (context) => {
  const controlPlane = await startControlPlane({
    NODE_ENV: "development",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
  context.after(() => controlPlane.close());

  const status = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
    token: CONTROL_TOKEN
  });
  assert.equal(status.body.state, "logged_out");
  assert.equal(status.body.generation, 0);

  const started = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.start,
    method: "POST",
    token: CONTROL_TOKEN
  });
  assert.equal(started.body.state, "starting");
  assert.equal(started.body.generation, 1);

  const statusAfterStart = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
    token: CONTROL_TOKEN
  });
  assert.equal(statusAfterStart.body.state, "starting");
  assert.equal(statusAfterStart.body.generation, 1);

  const disconnected = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.disconnect,
    method: "POST",
    token: CONTROL_TOKEN
  });
  assert.equal(disconnected.body.state, "logged_out");
  assert.equal(disconnected.body.generation, 1);

  const refreshed = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.refresh,
    method: "POST",
    token: CONTROL_TOKEN
  });
  assert.equal(refreshed.body.state, "starting");
  assert.equal(refreshed.body.generation, 2);

  const loggedOut = await requestControl({
    controlPlane,
    path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.logout,
    method: "POST",
    token: CONTROL_TOKEN
  });
  assert.equal(loggedOut.body.state, "logged_out");
  assert.equal(loggedOut.body.generation, 2);

  for (const result of [status, started, statusAfterStart, disconnected, refreshed, loggedOut]) {
    assert.equal(result.statusCode, 200);
    assertSafeResponse(result);
  }
});

test("endpoint responses never include secret, token, session, auth-state, or QR content", async (context) => {
  const controlPlane = await startControlPlane({
    NODE_ENV: "development",
    WHATSAPP_WEB_LOCAL_ENABLED: "true"
  });
  context.after(() => controlPlane.close());

  const sensitiveMarkers = [
    CONTROL_TOKEN,
    "SECRET_MARKER",
    "QR_CONTENT_MARKER",
    "SESSION_MARKER",
    "AUTH_STATE_MARKER"
  ];
  const results = [
    await requestControl({
      controlPlane,
      path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.status,
      token: CONTROL_TOKEN
    }),
    await requestControl({
      controlPlane,
      path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.start,
      method: "POST",
      token: CONTROL_TOKEN,
      body: JSON.stringify({ ignored: sensitiveMarkers.join(" ") })
    }),
    await requestControl({
      controlPlane,
      path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.disconnect,
      method: "POST",
      token: CONTROL_TOKEN
    }),
    await requestControl({
      controlPlane,
      path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.refresh,
      method: "POST",
      token: CONTROL_TOKEN
    }),
    await requestControl({
      controlPlane,
      path: WHATSAPP_WEB_LOCAL_CONTROL_PATHS.logout,
      method: "POST",
      token: CONTROL_TOKEN
    })
  ];

  for (const result of results) {
    assertSafeResponse(result);
    for (const marker of sensitiveMarkers) {
      assert.equal(result.serializedBody.includes(marker), false);
    }
  }
});
