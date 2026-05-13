import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";
import { evaluateProductionReadiness } from "../shared/production-readiness-runtime";
import type { RequestContext } from "../shared/request-context";

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

function withEnvPatch<T>(patch: Record<string, string | undefined>, fn: () => Promise<T> | T): Promise<T> | T {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  const finalize = () => {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  try {
    const result = fn();
    if (result && typeof (result as Promise<T>).then === "function") {
      return (result as Promise<T>).finally(finalize);
    }
    finalize();
    return result;
  } catch (error) {
    finalize();
    throw error;
  }
}

test("production readiness endpoint requires auth", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const response = await server.inject({
      method: "GET",
      url: "/platform/production-readiness"
    });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("production readiness is tenant-scoped and fail-closed on mismatch", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "GET",
      url: "/platform/production-readiness",
      headers: authHeaders(login.accessToken, "tenant_other")
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("production readiness blocks when production DB and auth env are missing", async () => {
  await withEnvPatch(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: undefined,
      POSTGRES_URL: undefined,
      AUTH_SESSION_SECRET: undefined,
      APP_BASE_URL: undefined,
      API_BASE_URL: undefined,
      WORKER_MODE: "foundation",
      APPROVAL_EXECUTION_MODE: "foundation"
    },
    async () => {
      const payload = await evaluateProductionReadiness({
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        permissions: ["platform.settings.read"]
      } satisfies RequestContext);
      assert.equal(payload.overallStatus, "blocked");
      assert.equal(payload.database.configured, false);
      assert.equal(payload.auth.sessionSecretConfigured, false);
      assert.ok(payload.blockers.includes("production_requires_postgres_persistence_mode") || payload.blockers.includes("missing_env_database_url"));
    }
  );
});

test("production readiness reports mock providers as blocked in production", async () => {
  await withEnvPatch(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: "postgres://demo:demo@localhost:5432/demo",
      AUTH_SESSION_SECRET: "test-secret",
      APP_BASE_URL: "https://app.example.com",
      API_BASE_URL: "https://api.example.com",
      WORKER_MODE: "durable",
      APPROVAL_EXECUTION_MODE: "controlled"
    },
    async () => {
      const payload = await evaluateProductionReadiness({
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        permissions: ["platform.settings.read"]
      } satisfies RequestContext);
      assert.ok(payload.blockers.includes("mock_providers_detected_in_production"));
    }
  );
});
