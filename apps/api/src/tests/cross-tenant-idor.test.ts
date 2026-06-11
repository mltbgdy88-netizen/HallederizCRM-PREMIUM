import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerSalesCrmRoutes } from "../sales-crm/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerSalesCrmRoutes(server);
  await registerCommercialOperationsRoutes(server);
  return server;
}

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

test("cross-tenant order access returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/orders/order_1",
      headers: authHeaders(login.accessToken, "tenant_other")
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant offer access returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/offers/offer_1",
      headers: authHeaders(login.accessToken, "tenant_other")
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("cross-tenant customer access returns 403", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/customers/customer_1",
      headers: authHeaders(login.accessToken, "tenant_other")
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});
