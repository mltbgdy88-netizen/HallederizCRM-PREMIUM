import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerLocalAgentServiceAuthRoutes } from "../platform-core/routes/local-agent-service-auth-routes";
import {
  LOCAL_AGENT_SERVICE_TOKEN_PREFIX,
  LocalAgentServiceRateLimiter,
  LocalAgentServiceTokenStore,
  normalizeLoopbackRemoteAddress
} from "../shared/local-agent-service-auth";
import { withEnv } from "./test-env";

const CLIENT_ID = "local-agent-service-test";
const CLIENT_SECRET = "local-agent-service-test-secret-value-0001";
const CONTROL_SECRET = "local-agent-control-test-secret-value-0002";
const TENANT_ID = "tenant_service_auth_test";

function serviceEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    NODE_ENV: "development",
    PERSISTENCE_MODE: "demo",
    LOCAL_AGENT_SERVICE_AUTH_ENABLED: "true",
    LOCAL_AGENT_SERVICE_CLIENT_ID: CLIENT_ID,
    LOCAL_AGENT_SERVICE_CLIENT_SECRET: CLIENT_SECRET,
    LOCAL_AGENT_SERVICE_TOKEN_TTL_SECONDS: "180",
    LOCAL_AGENT_TENANT_ID: TENANT_ID,
    LOCAL_AGENT_CONTROL_TOKEN: CONTROL_SECRET,
    ...overrides
  };
}

async function buildIssuanceServer(options: {
  store?: LocalAgentServiceTokenStore;
  rateLimiter?: LocalAgentServiceRateLimiter;
  validateTenant?: (tenantId: string) => Promise<boolean>;
  logger?: unknown;
} = {}) {
  const server = Fastify(options.logger ? ({ logger: options.logger } as never) : undefined);
  await registerLocalAgentServiceAuthRoutes(server, {
    tokenStore: options.store,
    rateLimiter: options.rateLimiter,
    validateTenant: options.validateTenant ?? (async () => true)
  });
  return server;
}

function validPayload() {
  return { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET };
}

async function injectTokenRequest(
  server: Awaited<ReturnType<typeof buildIssuanceServer>>,
  options: {
    payload?: unknown;
    headers?: Record<string, string>;
    remoteAddress?: string;
    url?: string;
  } = {}
) {
  return server.inject({
    method: "POST",
    url: options.url ?? "/auth/service/local-agent/token",
    payload: options.payload ?? validPayload(),
    headers: options.headers,
    remoteAddress: options.remoteAddress ?? "127.0.0.1"
  });
}

test("service token issuance is disabled by default and returns no token", async () => {
  await withEnv(serviceEnv({ LOCAL_AGENT_SERVICE_AUTH_ENABLED: undefined }), async () => {
    const store = new LocalAgentServiceTokenStore();
    const server = await buildIssuanceServer({ store });
    try {
      const response = await injectTokenRequest(server);
      assert.equal(response.statusCode, 503);
      assert.equal(response.json().reason, "local_agent_service_auth_unavailable");
      assert.equal("accessToken" in response.json(), false);
      assert.equal(store.snapshot().length, 0);
    } finally {
      await server.close();
    }
  });
});
test("canonical production runtime hard-denies issuance before tenant validation", async () => {
  await withEnv(serviceEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "postgres" }), async () => {
    let tenantValidationCalls = 0;
    const store = new LocalAgentServiceTokenStore();
    const server = await buildIssuanceServer({
      store,
      validateTenant: async () => {
        tenantValidationCalls += 1;
        return true;
      }
    });
    try {
      const response = await injectTokenRequest(server);
      assert.equal(response.statusCode, 403);
      assert.equal(response.json().reason, "local_agent_service_auth_unavailable");
      assert.equal(tenantValidationCalls, 0);
      assert.equal(store.snapshot().length, 0);
    } finally {
      await server.close();
    }
  });
});

test("issuance accepts only safely normalized loopback socket addresses", async () => {
  assert.equal(normalizeLoopbackRemoteAddress("127.0.0.1"), "127.0.0.1");
  assert.equal(normalizeLoopbackRemoteAddress("::ffff:127.0.0.1"), "127.0.0.1");
  assert.equal(normalizeLoopbackRemoteAddress("::1"), "::1");
  assert.equal(normalizeLoopbackRemoteAddress("0:0:0:0:0:0:0:1"), "::1");
  assert.equal(normalizeLoopbackRemoteAddress("127.0.0.2"), null);
  assert.equal(normalizeLoopbackRemoteAddress("192.0.2.10"), null);

  await withEnv(serviceEnv(), async () => {
    const server = await buildIssuanceServer();
    try {
      const denied = await injectTokenRequest(server, { remoteAddress: "192.0.2.10" });
      assert.equal(denied.statusCode, 403);
      assert.equal(denied.json().reason, "local_agent_service_origin_denied");

      const mappedLoopback = await injectTokenRequest(server, { remoteAddress: "::ffff:127.0.0.1" });
      assert.equal(mappedLoopback.statusCode, 200);
    } finally {
      await server.close();
    }
  });
});

test("issuance rejects forwarded and browser origin headers without trusting proxy data", async () => {
  await withEnv(serviceEnv(), async () => {
    const server = await buildIssuanceServer();
    try {
      for (const name of ["forwarded", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "origin"]) {
        const response = await injectTokenRequest(server, { headers: { [name]: "untrusted-marker" } });
        assert.equal(response.statusCode, 403, name);
        assert.equal(response.json().reason, "local_agent_service_origin_denied", name);
      }
    } finally {
      await server.close();
    }
  });
});

test("wrong client id and wrong secret return the same safe credential error", async () => {
  await withEnv(serviceEnv(), async () => {
    const server = await buildIssuanceServer();
    try {
      const wrongClient = await injectTokenRequest(server, {
        payload: { clientId: "unknown-client", clientSecret: CLIENT_SECRET }
      });
      const wrongSecret = await injectTokenRequest(server, {
        payload: { clientId: CLIENT_ID, clientSecret: "wrong-secret-value-with-more-than-32-bytes" }
      });
      assert.equal(wrongClient.statusCode, 401);
      assert.equal(wrongSecret.statusCode, 401);
      assert.deepEqual(wrongClient.json(), wrongSecret.json());
      assert.deepEqual(wrongClient.json(), {
        error: "unauthorized",
        reason: "local_agent_service_credentials_invalid"
      });
    } finally {
      await server.close();
    }
  });
});

test("credential body is exact and query credentials are never accepted", async () => {
  await withEnv(serviceEnv(), async () => {
    const server = await buildIssuanceServer();
    try {
      for (const payload of [
        { clientId: CLIENT_ID },
        { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, tenantId: TENANT_ID },
        { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, extra: "unexpected" },
        [CLIENT_ID, CLIENT_SECRET]
      ]) {
        const response = await injectTokenRequest(server, { payload });
        assert.equal(response.statusCode, 401);
        assert.equal(response.json().reason, "local_agent_service_credentials_invalid");
      }
      const queryCredential = await injectTokenRequest(server, {
        url: "/auth/service/local-agent/token?clientId=query-value"
      });
      assert.equal(queryCredential.statusCode, 401);
      assert.equal(queryCredential.json().reason, "local_agent_service_credentials_invalid");
    } finally {
      await server.close();
    }
  });
});

test("invalid secret configuration and control-secret reuse fail closed", async () => {
  for (const overrides of [
    { LOCAL_AGENT_SERVICE_CLIENT_SECRET: "short" },
    { LOCAL_AGENT_SERVICE_CLIENT_SECRET: "     " },
    { LOCAL_AGENT_SERVICE_CLIENT_SECRET: CLIENT_SECRET, LOCAL_AGENT_CONTROL_TOKEN: CLIENT_SECRET }
  ]) {
    await withEnv(serviceEnv(overrides), async () => {
      const store = new LocalAgentServiceTokenStore();
      const server = await buildIssuanceServer({ store });
      try {
        const response = await injectTokenRequest(server);
        assert.equal(response.statusCode, 503);
        assert.equal(response.json().reason, "local_agent_service_auth_unavailable");
        assert.equal(store.snapshot().length, 0);
      } finally {
        await server.close();
      }
    });
  }
});

test("valid bootstrap issues a 32-byte opaque token with no cookie and no-store headers", async () => {
  await withEnv(serviceEnv(), async () => {
    const store = new LocalAgentServiceTokenStore();
    const server = await buildIssuanceServer({ store });
    try {
      const response = await injectTokenRequest(server);
      assert.equal(response.statusCode, 200);
      const payload = response.json() as { accessToken: string; tokenType: string; expiresIn: number };
      assert.equal(payload.tokenType, "Bearer");
      assert.equal(payload.expiresIn, 180);
      assert.match(payload.accessToken, /^la_svc_[A-Za-z0-9_-]{43}$/);
      assert.equal(Buffer.from(payload.accessToken.slice(LOCAL_AGENT_SERVICE_TOKEN_PREFIX.length), "base64url").length, 32);
      assert.equal(response.headers["set-cookie"], undefined);
      assert.equal(response.headers["cache-control"], "no-store");
      assert.equal(response.headers.pragma, "no-cache");

      const stored = JSON.stringify(store.snapshot());
      assert.equal(stored.includes(payload.accessToken), false);
      assert.equal(store.snapshot()[0]?.tokenDigest.length, 43);
      assert.deepEqual(store.snapshot()[0]?.capabilities, [
        "local_agent.jobs.read",
        "local_agent.jobs.transition",
        "local_agent.status.write"
      ]);
    } finally {
      await server.close();
    }
  });
});

test("TTL defaults to 180 seconds, accepts only 2-5 minutes, and invalid values fail closed", async () => {
  for (const [configured, expected] of [[undefined, 180], ["120", 120], ["300", 300]] as const) {
    await withEnv(serviceEnv({ LOCAL_AGENT_SERVICE_TOKEN_TTL_SECONDS: configured }), async () => {
      const server = await buildIssuanceServer();
      try {
        const response = await injectTokenRequest(server);
        assert.equal(response.statusCode, 200);
        assert.equal(response.json().expiresIn, expected);
      } finally {
        await server.close();
      }
    });
  }

  for (const configured of ["", "119", "301", "180.5", "not-a-number"]) {
    await withEnv(serviceEnv({ LOCAL_AGENT_SERVICE_TOKEN_TTL_SECONDS: configured }), async () => {
      const server = await buildIssuanceServer();
      try {
        const response = await injectTokenRequest(server);
        assert.equal(response.statusCode, 503);
        assert.equal(response.json().reason, "local_agent_service_auth_unavailable");
      } finally {
        await server.close();
      }
    });
  }
});

test("inactive or unavailable configured tenant fails closed without issuing a token", async () => {
  await withEnv(serviceEnv(), async () => {
    for (const validateTenant of [async () => false, async () => Promise.reject(new Error("tenant lookup failed"))]) {
      const store = new LocalAgentServiceTokenStore();
      const server = await buildIssuanceServer({ store, validateTenant });
      try {
        const response = await injectTokenRequest(server);
        assert.equal(response.statusCode, 503);
        assert.equal(response.json().reason, "local_agent_service_auth_unavailable");
        assert.equal(store.snapshot().length, 0);
      } finally {
        await server.close();
      }
    }
  });
});

test("default tenant validation uses the existing active tenant directory", async () => {
  await withEnv(serviceEnv({ LOCAL_AGENT_TENANT_ID: "tenant_1" }), async () => {
    const server = Fastify();
    await registerLocalAgentServiceAuthRoutes(server, {
      tokenStore: new LocalAgentServiceTokenStore(),
      rateLimiter: new LocalAgentServiceRateLimiter()
    });
    try {
      const response = await injectTokenRequest(server);
      assert.equal(response.statusCode, 200);
    } finally {
      await server.close();
    }
  });
});

test("bounded in-memory rate limiting blocks repeated invalid credential attempts", async () => {
  await withEnv(serviceEnv(), async () => {
    const limiter = new LocalAgentServiceRateLimiter({ maxAttempts: 1, windowMs: 60_000, maxBuckets: 2 });
    const server = await buildIssuanceServer({ rateLimiter: limiter });
    try {
      const first = await injectTokenRequest(server, {
        payload: { clientId: CLIENT_ID, clientSecret: "invalid-secret-value-with-more-than-32-bytes" }
      });
      const second = await injectTokenRequest(server, {
        payload: { clientId: CLIENT_ID, clientSecret: "another-invalid-secret-with-more-than-32-bytes" }
      });
      assert.equal(first.statusCode, 401);
      assert.equal(second.statusCode, 429);
      assert.equal(second.json().reason, "local_agent_service_rate_limited");
    } finally {
      await server.close();
    }
  });
});

test("issuance request logs do not contain credential, token, tenant, cookie, authorization, or query markers", async () => {
  const logLines: string[] = [];
  const logMarkerSecret = "log-marker-service-secret-value-00000001";
  const logMarkerTenant = "tenant_log_marker_value";
  const logMarkerCookie = "cookie-log-marker-value";
  const logMarkerAuthorization = "authorization-log-marker-value";

  await withEnv(
    serviceEnv({
      LOCAL_AGENT_SERVICE_CLIENT_SECRET: logMarkerSecret,
      LOCAL_AGENT_TENANT_ID: logMarkerTenant
    }),
    async () => {
      const store = new LocalAgentServiceTokenStore();
      const server = await buildIssuanceServer({
        store,
        logger: {
          level: "info",
          stream: { write: (line: string) => logLines.push(line) }
        }
      });
      try {
        const success = await injectTokenRequest(server, {
          payload: { clientId: CLIENT_ID, clientSecret: logMarkerSecret },
          headers: {
            cookie: logMarkerCookie,
            authorization: `Bearer ${logMarkerAuthorization}`
          }
        });
        assert.equal(success.statusCode, 200);
        const accessToken = String(success.json().accessToken);

        const queryAttempt = await injectTokenRequest(server, {
          url: `/auth/service/local-agent/token?clientSecret=${encodeURIComponent(logMarkerSecret)}`,
          payload: { clientId: CLIENT_ID, clientSecret: logMarkerSecret }
        });
        assert.equal(queryAttempt.statusCode, 401);

        await server.close();
        const logs = logLines.join("");
        for (const marker of [
          logMarkerSecret,
          logMarkerTenant,
          logMarkerCookie,
          logMarkerAuthorization,
          accessToken
        ]) {
          assert.equal(logs.includes(marker), false);
        }
        assert.equal(JSON.stringify(queryAttempt.json()).includes(logMarkerSecret), false);
      } finally {
        if (server.server.listening) await server.close();
      }
    }
  );
});
