import assert from "node:assert/strict";
import test from "node:test";
import {
  WhatsAppWebLocalControlError,
  createWhatsAppWebLocalControlClient
} from "../services/whatsapp-web-local-control";

const SAFE_SNAPSHOT = {
  state: "logged_out",
  reasonCode: "whatsapp_web_local_enabled_non_production",
  generation: 0,
  providerCallExecuted: false,
  checkedAt: "2026-07-29T10:00:00.000Z"
} as const;

type CapturedCall = {
  input: RequestInfo | URL;
  init?: RequestInit;
};

function jsonResponse(payload: unknown, status = 200): Response {
  return Response.json(payload, { status });
}

function captureFetch(
  responder: (call: CapturedCall) => Response | Promise<Response>
): { fetchImpl: typeof fetch; calls: CapturedCall[] } {
  const calls: CapturedCall[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { input, init };
    calls.push(call);
    return responder(call);
  }) as typeof fetch;
  return { fetchImpl, calls };
}

test("status uses the relative same-origin endpoint and safe request options", async () => {
  const { fetchImpl, calls } = captureFetch(() => jsonResponse(SAFE_SNAPSHOT));
  const client = createWhatsAppWebLocalControlClient(fetchImpl);

  const snapshot = await client.getStatus();

  assert.deepEqual(snapshot, SAFE_SNAPSHOT);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.input, "/api/whatsapp-web-local/status");
  assert.equal(calls[0]?.init?.method, "GET");
  assert.equal(calls[0]?.init?.credentials, "same-origin");
  assert.equal(calls[0]?.init?.cache, "no-store");
  assert.equal(calls[0]?.init?.redirect, "error");
  assert.equal(calls[0]?.init?.body, undefined);
  assert.equal(new Headers(calls[0]?.init?.headers).has("Authorization"), false);
  assert.equal(String(calls[0]?.input).includes("127.0.0.1"), false);
});

test("mutation methods use only the four fixed POST endpoints without a body", async () => {
  const { fetchImpl, calls } = captureFetch(() => jsonResponse(SAFE_SNAPSHOT));
  const client = createWhatsAppWebLocalControlClient(fetchImpl);

  await client.start();
  await client.refreshPairing();
  await client.disconnect();
  await client.logout();

  assert.deepEqual(
    calls.map((call) => [call.input, call.init?.method, call.init?.body]),
    [
      ["/api/whatsapp-web-local/start", "POST", undefined],
      ["/api/whatsapp-web-local/refresh", "POST", undefined],
      ["/api/whatsapp-web-local/disconnect", "POST", undefined],
      ["/api/whatsapp-web-local/logout", "POST", undefined]
    ]
  );
  for (const call of calls) {
    assert.equal(call.init?.credentials, "same-origin");
    assert.equal(call.init?.cache, "no-store");
    assert.equal(new Headers(call.init?.headers).has("Authorization"), false);
  }
});

test("response is reduced to the five-field allowlist", async () => {
  const { fetchImpl } = captureFetch(() =>
    jsonResponse({
      ...SAFE_SNAPSHOT,
      secret: "must-not-enter-state",
      session: { value: "must-not-enter-state" },
      qr: "must-not-enter-state"
    })
  );

  const snapshot = await createWhatsAppWebLocalControlClient(fetchImpl).getStatus();

  assert.deepEqual(Object.keys(snapshot).sort(), [
    "checkedAt",
    "generation",
    "providerCallExecuted",
    "reasonCode",
    "state"
  ]);
  assert.equal("secret" in snapshot, false);
  assert.equal("session" in snapshot, false);
  assert.equal("qr" in snapshot, false);
});

test("unknown states fail closed", async () => {
  const { fetchImpl } = captureFetch(() =>
    jsonResponse({ ...SAFE_SNAPSHOT, state: "unknown_state" })
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "invalid_response"
  );
});

test("providerCallExecuted=true fails closed", async () => {
  const { fetchImpl } = captureFetch(() =>
    jsonResponse({ ...SAFE_SNAPSHOT, providerCallExecuted: true })
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "invalid_response"
  );
});

test("negative and fractional generations fail closed", async () => {
  for (const generation of [-1, 1.5]) {
    const { fetchImpl } = captureFetch(() =>
      jsonResponse({ ...SAFE_SNAPSHOT, generation })
    );
    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  }
});

test("invalid checkedAt and reasonCode values fail closed", async () => {
  for (const patch of [
    { checkedAt: "not-a-date" },
    { reasonCode: "" },
    { reasonCode: "untrusted_reason" }
  ]) {
    const { fetchImpl } = captureFetch(() =>
      jsonResponse({ ...SAFE_SNAPSHOT, ...patch })
    );
    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  }
});

test("401 produces a structured session recovery error without body leakage", async () => {
  const marker = "SESSION_RESPONSE_MARKER_MUST_NOT_LEAK";
  const { fetchImpl } = captureFetch(() =>
    jsonResponse({ reasonCode: marker, session: marker }, 401)
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) => {
      assert.ok(error instanceof WhatsAppWebLocalControlError);
      assert.equal(error.status, 401);
      assert.equal(error.reasonCode, "session_required");
      assert.equal(error.message.includes(marker), false);
      return true;
    }
  );
});

test("403 production hard-deny produces only the safe production mapping", async () => {
  const { fetchImpl } = captureFetch(() =>
    jsonResponse(
      {
        ...SAFE_SNAPSHOT,
        state: "disabled",
        reasonCode: "whatsapp_web_local_production_hard_deny"
      },
      403
    )
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).start(),
    (error: unknown) => {
      assert.ok(error instanceof WhatsAppWebLocalControlError);
      assert.equal(error.status, 403);
      assert.equal(error.reasonCode, "production_hard_deny");
      assert.match(error.message, /Meta WhatsApp Cloud API/);
      return true;
    }
  );
});

test("invalid JSON fails closed without console logging", async () => {
  const { fetchImpl } = captureFetch(
    () =>
      new Response("{invalid-json", {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
  );
  let consoleCalls = 0;
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => {
    consoleCalls += 1;
  };
  console.error = () => {
    consoleCalls += 1;
  };

  try {
    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  assert.equal(consoleCalls, 0);
});
