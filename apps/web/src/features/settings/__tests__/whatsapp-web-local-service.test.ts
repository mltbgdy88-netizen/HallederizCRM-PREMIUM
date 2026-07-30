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

function bodyResponse(
  body: BodyInit | null,
  status: number,
  contentType?: string
): Response {
  const headers = contentType ? { "Content-Type": contentType } : undefined;
  return new Response(body, { status, headers });
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

test("an exact five-field success snapshot is accepted and returned allowlisted", async () => {
  const { fetchImpl } = captureFetch(() => jsonResponse(SAFE_SNAPSHOT));
  const snapshot = await createWhatsAppWebLocalControlClient(fetchImpl).getStatus();

  assert.deepEqual(snapshot, SAFE_SNAPSHOT);
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "checkedAt",
    "generation",
    "providerCallExecuted",
    "reasonCode",
    "state"
  ]);
});

test("exact snapshot keys are accepted regardless of field order", async () => {
  const reordered = {
    checkedAt: SAFE_SNAPSHOT.checkedAt,
    providerCallExecuted: SAFE_SNAPSHOT.providerCallExecuted,
    generation: SAFE_SNAPSHOT.generation,
    state: SAFE_SNAPSHOT.state,
    reasonCode: SAFE_SNAPSHOT.reasonCode
  };
  const { fetchImpl } = captureFetch(() => jsonResponse(reordered));

  assert.deepEqual(
    await createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    SAFE_SNAPSHOT
  );
});

for (const [field, marker] of [
  ["secret", "SUCCESS_SECRET_MARKER_MUST_NOT_LEAK"],
  ["session", "SUCCESS_SESSION_MARKER_MUST_NOT_LEAK"]
] as const) {
  test(`a successful snapshot with an extra ${field} field fails closed`, async () => {
    const { fetchImpl } = captureFetch(() =>
      jsonResponse({ ...SAFE_SNAPSHOT, [field]: marker })
    );

    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) => {
        assert.ok(error instanceof WhatsAppWebLocalControlError);
        assert.equal(error.reasonCode, "invalid_response");
        assert.equal(error.message.includes(marker), false);
        return true;
      }
    );
  });
}

test("every missing required snapshot field fails closed", async () => {
  for (const field of Object.keys(SAFE_SNAPSHOT)) {
    const payload: Record<string, unknown> = { ...SAFE_SNAPSHOT };
    delete payload[field];
    const { fetchImpl } = captureFetch(() => jsonResponse(payload));

    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  }
});

test("an own enumerable __proto__ JSON field fails closed", async () => {
  const payload = `{"state":"logged_out","reasonCode":"whatsapp_web_local_enabled_non_production","generation":0,"providerCallExecuted":false,"checkedAt":"2026-07-29T10:00:00.000Z","__proto__":{"polluted":true}}`;
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(payload, 200, "application/json")
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "invalid_response"
  );
});

test("an extra field value is not read while the exact key set is rejected", async () => {
  let extraValueReads = 0;
  const payload: Record<string, unknown> = { ...SAFE_SNAPSHOT };
  Object.defineProperty(payload, "secret", {
    enumerable: true,
    get() {
      extraValueReads += 1;
      return "UNREAD_SECRET_MARKER";
    }
  });
  const response = bodyResponse(null, 200, "application/json");
  Object.defineProperty(response, "json", {
    value: async () => payload
  });
  const { fetchImpl } = captureFetch(() => response);

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "invalid_response"
  );
  assert.equal(extraValueReads, 0);
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
  let bodyReads = 0;
  const response = jsonResponse(
    {
      ...SAFE_SNAPSHOT,
      state: "disabled",
      reasonCode: "whatsapp_web_local_production_hard_deny"
    },
    403
  );
  const originalJson = response.json.bind(response);
  Object.defineProperty(response, "json", {
    value: async () => {
      bodyReads += 1;
      return originalJson();
    }
  });
  const { fetchImpl } = captureFetch(() => response);

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
  assert.equal(bodyReads, 1);
});

for (const [field, marker] of [
  ["secret", "PRODUCTION_SECRET_MARKER_MUST_NOT_LEAK"],
  ["session", "PRODUCTION_SESSION_MARKER_MUST_NOT_LEAK"],
  ["unexpected", "PRODUCTION_UNKNOWN_MARKER_MUST_NOT_LEAK"]
] as const) {
  test(`a production-deny 403 with an extra ${field} field remains request-denied`, async () => {
    let bodyReads = 0;
    const loggedMessages: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const response = jsonResponse(
      {
        ...SAFE_SNAPSHOT,
        state: "disabled",
        reasonCode: "whatsapp_web_local_production_hard_deny",
        [field]: marker
      },
      403
    );
    const originalJson = response.json.bind(response);
    Object.defineProperty(response, "json", {
      value: async () => {
        bodyReads += 1;
        return originalJson();
      }
    });
    const { fetchImpl } = captureFetch(() => response);

    console.log = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
    };
    console.warn = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
    };
    console.error = (...args: unknown[]) => {
      loggedMessages.push(args.map(String).join(" "));
    };
    try {
      await assert.rejects(
        () => createWhatsAppWebLocalControlClient(fetchImpl).start(),
        (error: unknown) => {
          assert.ok(error instanceof WhatsAppWebLocalControlError);
          assert.equal(error.status, 403);
          assert.equal(error.reasonCode, "request_denied");
          assert.equal(error.message.includes(marker), false);
          return true;
        }
      );
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
    assert.equal(bodyReads, 1);
    assert.equal(
      loggedMessages.some((message) => message.includes(marker)),
      false
    );
    assert.deepEqual(loggedMessages, []);
  });
}

test("application/json success responses are accepted", async () => {
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(JSON.stringify(SAFE_SNAPSHOT), 200, "application/json")
  );

  assert.deepEqual(
    await createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    SAFE_SNAPSHOT
  );
});

test("application/json with charset parameters is accepted", async () => {
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(
      JSON.stringify(SAFE_SNAPSHOT),
      200,
      "Application/JSON; charset=utf-8"
    )
  );

  assert.deepEqual(
    await createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    SAFE_SNAPSHOT
  );
});

test("application structured +json media types are accepted", async () => {
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(
      JSON.stringify(SAFE_SNAPSHOT),
      200,
      "application/vnd.hallederiz.control+json; charset=UTF-8"
    )
  );

  assert.deepEqual(
    await createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    SAFE_SNAPSHOT
  );
});

for (const [label, contentType] of [
  ["text/plain", "text/plain"],
  ["text/html", "text/html; charset=utf-8"],
  ["application/javascript", "application/javascript"],
  ["multipart/form-data", "multipart/form-data; boundary=safe"]
] as const) {
  test(`${label} success responses fail closed even when the body contains valid JSON`, async () => {
    const { fetchImpl } = captureFetch(() =>
      bodyResponse(JSON.stringify(SAFE_SNAPSHOT), 200, contentType)
    );

    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  });
}

test("missing Content-Type fails closed", async () => {
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(JSON.stringify(SAFE_SNAPSHOT), 200)
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "invalid_response"
  );
});

test("204, empty JSON, and invalid JSON success responses fail closed", async () => {
  for (const response of [
    bodyResponse(null, 204),
    bodyResponse("", 200, "application/json"),
    bodyResponse("{invalid-json", 200, "application/json")
  ]) {
    const { fetchImpl } = captureFetch(() => response);
    await assert.rejects(
      () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
      (error: unknown) =>
        error instanceof WhatsAppWebLocalControlError &&
        error.reasonCode === "invalid_response"
    );
  }
});

test("non-OK responses cannot become success snapshots", async () => {
  const { fetchImpl } = captureFetch(() => jsonResponse(SAFE_SNAPSHOT, 500));

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) => {
      assert.ok(error instanceof WhatsAppWebLocalControlError);
      assert.equal(error.reasonCode, "service_unavailable");
      return true;
    }
  );
});

test("a valid JSON permission 403 remains request-denied", async () => {
  let bodyReads = 0;
  const response = jsonResponse(SAFE_SNAPSHOT, 403);
  const originalJson = response.json.bind(response);
  Object.defineProperty(response, "json", {
    value: async () => {
      bodyReads += 1;
      return originalJson();
    }
  });
  const { fetchImpl } = captureFetch(() => response);

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).start(),
    (error: unknown) => {
      assert.ok(error instanceof WhatsAppWebLocalControlError);
      assert.equal(error.status, 403);
      assert.equal(error.reasonCode, "request_denied");
      return true;
    }
  );
  assert.equal(bodyReads, 1);
});

test("a production reason with a non-disabled state remains request-denied", async () => {
  const { fetchImpl } = captureFetch(() =>
    jsonResponse(
      {
        ...SAFE_SNAPSHOT,
        state: "connected",
        reasonCode: "whatsapp_web_local_production_hard_deny"
      },
      403
    )
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).start(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "request_denied"
  );
});

test("a non-JSON 403 is never classified as production hard-deny", async () => {
  const marker = "PRODUCTION_HARD_DENY_MARKER_MUST_NOT_LEAK";
  const { fetchImpl } = captureFetch(() =>
    bodyResponse(
      JSON.stringify({
        ...SAFE_SNAPSHOT,
        reasonCode: "whatsapp_web_local_production_hard_deny",
        marker
      }),
      403,
      "text/plain"
    )
  );

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).start(),
    (error: unknown) => {
      assert.ok(error instanceof WhatsAppWebLocalControlError);
      assert.equal(error.reasonCode, "request_denied");
      assert.equal(error.message.includes(marker), false);
      return true;
    }
  );
});

test("401 is mapped before its response body is read", async () => {
  let bodyReads = 0;
  const response = jsonResponse(
    { session: "SESSION_RESPONSE_MARKER_MUST_NOT_LEAK" },
    401
  );
  Object.defineProperty(response, "json", {
    value: async () => {
      bodyReads += 1;
      throw new Error("body must not be read");
    }
  });
  const { fetchImpl } = captureFetch(() => response);

  await assert.rejects(
    () => createWhatsAppWebLocalControlClient(fetchImpl).getStatus(),
    (error: unknown) =>
      error instanceof WhatsAppWebLocalControlError &&
      error.reasonCode === "session_required"
  );
  assert.equal(bodyReads, 0);
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
