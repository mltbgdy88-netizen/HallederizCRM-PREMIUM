import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { CommercialCoreService } from "../modules/commercial-core/service";
import { createSession } from "../shared/session-store";
import { getPersistencePolicy } from "../shared/persistence-policy";
import { withEnv } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerCommercialOperationsRoutes(server);
  return server;
}

test("production postgres mode disables demo fallback and throws on DB failure", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      PERSISTENCE_MODE: "postgres",
      ALLOW_DEMO_FALLBACK: "true"
    },
    () => {
      const policy = getPersistencePolicy();
      assert.equal(policy.persistenceMode, "postgres");
      assert.equal(policy.isProduction, true);
      assert.equal(policy.demoFallbackAllowed, false);
      assert.equal(policy.dbFallbackAllowed, false);
      assert.equal(policy.shouldThrowOnDbFailure, true);
    }
  );
});

test("development demo mode can explicitly allow fallback", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo",
      ALLOW_DEMO_FALLBACK: "true"
    },
    () => {
      const policy = getPersistencePolicy();
      assert.equal(policy.demoFallbackAllowed, true);
      assert.equal(policy.dbFallbackAllowed, true);
      assert.equal(policy.shouldThrowOnDbFailure, false);
    }
  );
});

test("postgres mode with fallback disabled does not return mock data on DB failure", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      ALLOW_DEMO_FALLBACK: "false"
    },
    async () => {
      const service = new CommercialCoreService({
        tenantId: "tenant_1",
        userId: "user_admin",
        persistenceMode: "postgres",
        isAuthenticated: true,
        roles: ["admin"],
        permissions: ["orders.read"]
      });

      await assert.rejects(() => service.listOrders(), (error: unknown) => {
        assert.equal((error as { code?: string }).code, "persistence_unavailable");
        return true;
      });
    }
  );
});

test("demo persistence mode without database URL keeps demo store behavior", async () => {
  await withEnv(
    {
      DEMO_AUTH_ENABLED: "true",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      ALLOW_DEMO_FALLBACK: "false"
    },
    async () => {
      const server = await buildServer();
      const login = createSession({
        tenantSlug: "hallederiz",
        email: "admin@hallederiz.com",
        password: "demo"
      });
      const response = await server.inject({
        method: "GET",
        url: "/orders",
        headers: {
          authorization: `Bearer ${login.accessToken}`,
          "x-session-token": login.accessToken
        }
      });

      assert.equal(response.statusCode, 200);
      assert.ok(Array.isArray(response.json().items));
      await server.close();
    }
  );
});
