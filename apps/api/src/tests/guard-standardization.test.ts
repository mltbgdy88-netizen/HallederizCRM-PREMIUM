import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerIntegrationRoutes } from "../integrations/routes";
import { requireTenantPermissionGuards } from "../shared/auth-guards";
import { signHmacSha256Payload } from "../shared/webhook-security";
import type { RequestContext } from "../shared/request-context";
import { withEnv } from "./test-env";

test("requireTenantPermissionGuards enforces tenant isolation before permission checks", () => {
  const guards = requireTenantPermissionGuards(["orders.write"], (context) => context.requestedTenantId);
  const mismatchedContext: RequestContext = {
    tenantId: "tenant_1",
    userId: "user_admin",
    persistenceMode: "demo",
    requestedTenantId: "tenant_2",
    isAuthenticated: true,
    permissions: ["orders.write"]
  };

  assert.throws(() => {
    for (const guard of guards) {
      guard(mismatchedContext);
    }
  });
});

test("production webhook rejects missing tenant context", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      WHATSAPP_WEBHOOK_APP_SECRET: "guard-secret"
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const payload = JSON.stringify({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [{ from: "905321112233", id: "wamid.guard.prod.1", text: { body: "merhaba" }, type: "text" }]
                }
              }
            ]
          }
        ]
      });
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${signHmacSha256Payload(payload, "guard-secret")}`
        },
        payload
      });

      assert.equal(response.statusCode, 400);
      await server.close();
    }
  );
});

test("development webhook keeps safe default tenant fallback for legacy payloads", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_WEBHOOK_APP_SECRET: undefined
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [{ from: "905321112233", id: "wamid.guard.dev.1", text: { body: "merhaba" }, type: "text" }]
                  }
                }
              ]
            }
          ]
        })
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().ok, true);
      await server.close();
    }
  );
});
