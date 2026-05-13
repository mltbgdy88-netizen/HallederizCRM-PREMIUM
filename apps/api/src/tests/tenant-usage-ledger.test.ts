import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { InMemoryTenantUsageLedger } from "@hallederiz/domain";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { resetTenantUsageRuntimeForTests } from "../shared/tenant-usage-runtime";
import { withDemoAuth, withEnv } from "./test-env";

test("tenant usage ledger records and summarizes scoped usage events", async () => {
  const ledger = new InMemoryTenantUsageLedger();
  await ledger.record({
    tenantId: "tenant_1",
    eventType: "ai_request",
    source: "approval_inbox",
    quantity: 2,
    unit: "request",
    occurredAt: "2026-05-01T00:00:00.000Z"
  });
  await ledger.record({
    tenantId: "tenant_2",
    eventType: "ai_request",
    source: "approval_inbox",
    quantity: 99,
    unit: "request",
    occurredAt: "2026-05-01T00:00:00.000Z"
  });

  const summary = await ledger.summarize({
    tenantId: "tenant_1",
    limits: { ai_request: 1 }
  });

  assert.equal(summary.totalEvents, 1);
  assert.equal(summary.totalQuantity, 2);
  assert.equal(summary.items[0]?.quantity, 2);
  assert.equal(summary.byEventType[0]?.eventType, "ai_request");
  assert.equal(summary.bySource[0]?.source, "approval_inbox");
  assert.equal(summary.byUnit[0]?.unit, "request");
  assert.equal(summary.dailyBuckets[0]?.date, "2026-05-01");
  assert.equal(summary.limitExceeded, true);
});

test("tenant usage API requires auth and returns tenant scoped summary", async () => {
  await withDemoAuth(async () => {
    resetTenantUsageRuntimeForTests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const unauthenticated = await server.inject({
      method: "GET",
      url: "/platform/tenant-usage/summary"
    });
    assert.equal(unauthenticated.statusCode, 401);

    const created = await server.inject({
      method: "POST",
      url: "/platform/tenant-usage/events",
      headers: {
        "x-session-token": login.accessToken,
        "x-tenant-id": login.session.tenant.id
      },
      payload: {
        tenantId: "tenant_spoof",
        eventType: "workflow_execution",
        source: "smoke",
        quantity: 1,
        unit: "execution"
      }
    });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().item.tenantId, "tenant_1");
    assert.equal(created.json().usagePersistenceMode, "memory");

    const summary = await server.inject({
      method: "GET",
      url: "/platform/tenant-usage/summary?eventType=workflow_execution&source=smoke",
      headers: {
        "x-session-token": login.accessToken,
        "x-tenant-id": login.session.tenant.id
      }
    });

    assert.equal(summary.statusCode, 200);
    assert.equal(summary.json().item.tenantId, "tenant_1");
    assert.equal(summary.json().item.totalEvents, 1);
    assert.equal(summary.json().item.items[0]?.source, "smoke");

    const tenantMismatch = await server.inject({
      method: "GET",
      url: "/platform/tenant-usage/summary",
      headers: {
        "x-session-token": login.accessToken,
        "x-tenant-id": "tenant_spoof"
      }
    });
    assert.equal(tenantMismatch.statusCode, 403);
    await server.close();
  });
});

test("tenant usage API does not silently use memory fallback for production postgres mode", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo",
      AUTH_SESSION_SECRET: "tenant-usage-test-secret",
      POSTGRES_URL: undefined,
      DATABASE_URL: undefined,
      DEMO_AUTH_ENABLED: "true"
    },
    async () => {
      const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
      await withEnv(
        {
          NODE_ENV: "production",
          PERSISTENCE_MODE: "postgres",
          AUTH_SESSION_SECRET: "tenant-usage-test-secret",
          POSTGRES_URL: undefined,
          DATABASE_URL: undefined,
          DEMO_AUTH_ENABLED: "false"
        },
        async () => {
          resetTenantUsageRuntimeForTests();
          const server = Fastify();
          await registerPlatformCoreRoutes(server);
          const response = await server.inject({
            method: "GET",
            url: "/platform/tenant-usage/summary",
            headers: {
              "x-session-token": login.accessToken,
              "x-tenant-id": login.session.tenant.id
            }
          });
          assert.equal(response.statusCode, 503);
          assert.equal(response.json().usagePersistenceMode, "unsupported");
          assert.equal(response.json().usagePersistenceSkipped, true);
          assert.deepEqual(response.json().reasons, ["tenant_usage_postgres_url_missing"]);
          await server.close();
        }
      );
    }
  );
});
