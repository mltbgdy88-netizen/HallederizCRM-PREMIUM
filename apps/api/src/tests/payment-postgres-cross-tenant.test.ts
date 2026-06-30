import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { hasPostgresTestHarness, withPostgresAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  return server;
}

function authHeaders(token: string, options?: { tenantId?: string }) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(options?.tenantId ? { "x-tenant-id": options.tenantId } : {})
  };
}

test(
  "postgres tenant B session cannot read tenant A payment by id",
  { skip: hasPostgresTestHarness() ? false : "DATABASE_URL or POSTGRES_URL required" },
  async () => {
    await withPostgresAuth(async () => {
      const server = await buildServer();
      const tenantA = createSession({
        tenantSlug: process.env.AUTH_SEED_TENANT_SLUG ?? "hallederiz",
        email: process.env.AUTH_SEED_EMAIL ?? "admin@hallederiz.com",
        password: process.env.AUTH_SEED_PASSWORD ?? "demo"
      });
      const tenantB = createSession({
        tenantSlug: process.env.AUTH_SEED_TENANT_B_SLUG ?? "tenant_b",
        email: process.env.AUTH_SEED_TENANT_B_EMAIL ?? "admin-b@tenant-b.local",
        password: process.env.AUTH_SEED_TENANT_B_PASSWORD ?? "demo"
      });

      const spoof = await server.inject({
        method: "GET",
        url: "/payments/payment_1",
        headers: authHeaders(tenantA.accessToken, { tenantId: "tenant_b" })
      });
      assert.equal(spoof.statusCode, 403);

      const crossRead = await server.inject({
        method: "GET",
        url: "/payments/payment_1",
        headers: authHeaders(tenantB.accessToken)
      });
      assert.ok([403, 404].includes(crossRead.statusCode), `unexpected status ${crossRead.statusCode}`);

      await server.close();
    });
  }
);
