import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Fastify from "fastify";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { registerQuickOperationsRoutes } from "../quick-operations/routes";
import { registerOriginGuard } from "../shared/origin-guard";
import { withEnv } from "./test-env";

const repoRoot = join(process.cwd(), "..", "..");

test("idempotency migration defines tenant scoped unique record table", () => {
  const migration = readFileSync(
    join(repoRoot, "packages", "database", "src", "migrations", "0015_idempotency_records.sql"),
    "utf8"
  );
  assert.match(migration, /CREATE TABLE IF NOT EXISTS idempotency_records/);
  assert.match(migration, /tenant_id TEXT NOT NULL/);
  assert.match(migration, /UNIQUE \(tenant_id, scope, idempotency_key\)/);
  assert.match(migration, /expires_at TIMESTAMPTZ NOT NULL/);
});

test("origin guard rejects disallowed origin on unsafe method in production", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      API_CORS_ORIGINS: "https://app.example.com",
      WEB_URL: "https://app.example.com"
    },
    async () => {
      const server = Fastify();
      registerOriginGuard(server);
      await registerPlatformCoreRoutes(server);

      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        headers: { origin: "https://evil.example.com", "content-type": "application/json" },
        payload: { tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" }
      });

      assert.equal(response.statusCode, 403);
      assert.equal(response.json().reason, "origin_not_allowed");
      await server.close();
    }
  );
});

test("origin guard allows configured origin on unsafe method in production", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      DEMO_AUTH_ENABLED: "false",
      LOCAL_PILOT_AUTH_ENABLED: "false",
      API_CORS_ORIGINS: "https://app.example.com",
      WEB_URL: "https://app.example.com"
    },
    async () => {
      const server = Fastify();
      registerOriginGuard(server);
      await registerPlatformCoreRoutes(server);

      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        headers: { origin: "https://app.example.com", "content-type": "application/json" },
        payload: { tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" }
      });

      assert.notEqual(response.statusCode, 403);
      await server.close();
    }
  );
});

test("quick-operations submit requires origin in production", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      API_CORS_ORIGINS: "https://app.example.com",
      WEB_URL: "https://app.example.com"
    },
    async () => {
      const server = Fastify();
      registerOriginGuard(server);
      await registerPlatformCoreRoutes(server);
      await registerQuickOperationsRoutes(server);

      const response = await server.inject({
        method: "POST",
        url: "/quick-operations/submit",
        headers: {
          "x-session-token": "mock_access_hallederiz:admin@hallederiz.com",
          authorization: "Bearer mock_access_hallederiz:admin@hallederiz.com"
        },
        payload: {
          operationType: "sale_order",
          customerId: "customer_1",
          lines: []
        }
      });

      assert.equal(response.statusCode, 403);
      assert.equal(response.json().reason, "origin_required");
      await server.close();
    }
  );
});
