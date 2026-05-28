import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession, getSessionByToken } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

async function buildServer() {
  const server = Fastify();
  server.get("/health", async () => ({ status: "ok", service: "api" }));
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  return server;
}

function authHeaders(token: string, extra?: Record<string, string>) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(extra ?? {})
  };
}

test("GET /orders returns 401 without auth when demo auth disabled", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({ method: "GET", url: "/orders" });
      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("GET /documents returns 401 without auth when demo auth disabled", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({ method: "GET", url: "/documents" });
      assert.equal(response.statusCode, 401);
      await server.close();
    }
  );
});

test("demo login session can read GET /orders", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "GET",
      url: "/orders",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().items));
    await server.close();
  });
});

test("authenticated user without orders permission gets 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const session = getSessionByToken(login.accessToken);
    assert.ok(session);
    if (session) {
      session.permissions = session.permissions.filter((permission) => !permission.key.startsWith("orders."));
    }

    const response = await server.inject({
      method: "GET",
      url: "/orders",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("tenant mismatch remains forbidden on protected read endpoints", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });
    const response = await server.inject({
      method: "GET",
      url: "/orders",
      headers: authHeaders(login.accessToken, { "x-tenant-id": "tenant_other" })
    });

    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("public GET /health remains available", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres"
    },
    async () => {
      const server = await buildServer();
      const response = await server.inject({ method: "GET", url: "/health" });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().status, "ok");
      await server.close();
    }
  );
});
