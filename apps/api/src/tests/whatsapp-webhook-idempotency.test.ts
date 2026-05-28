import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerIntegrationRoutes } from "../integrations/routes";
import { whatsAppWorkflowStoreService } from "../modules/whatsapp-workflow/store";
import { signHmacSha256Payload } from "../shared/webhook-security";
import { withEnv } from "./test-env";

function buildWebhookPayload(messageId: string, text: string) {
  return {
    tenantId: "tenant_idempotency",
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: "905321112233",
                  id: messageId,
                  text: { body: text },
                  type: "text"
                }
              ]
            }
          }
        ]
      }
    ]
  };
}

test("WhatsApp webhook reserves first inbound message and flags same message id as duplicate", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_WEBHOOK_APP_SECRET: "workflow-secret"
    },
    async () => {
      whatsAppWorkflowStoreService.clear("tenant_idempotency");
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const rawBody = JSON.stringify(buildWebhookPayload("wamid.workflow.1", "Siparis durumunu ogrenebilir miyim?"));
      const signature = `sha256=${signHmacSha256Payload(rawBody, "workflow-secret")}`;

      const first = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": signature
        },
        payload: rawBody
      });
      assert.equal(first.statusCode, 200);
      assert.equal(first.json().ok, true);
      assert.equal(first.json().duplicate, false);
      assert.equal(first.json().workflowReserved, true);

      const second = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": signature
        },
        payload: rawBody
      });
      assert.equal(second.statusCode, 200);
      assert.equal(second.json().ok, true);
      assert.equal(second.json().duplicate, true);
      assert.equal(second.json().duplicateReason, "same_message_processed");
      assert.deepEqual(second.json().outbound, []);

      await server.close();
      whatsAppWorkflowStoreService.clear("tenant_idempotency");
    }
  );
});

test("WhatsApp webhook idempotency keeps invalid signature fail-closed", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_WEBHOOK_APP_SECRET: "workflow-secret"
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const rawBody = JSON.stringify(buildWebhookPayload("wamid.workflow.invalid", "Merhaba"));

      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${"b".repeat(64)}`
        },
        payload: rawBody
      });

      assert.equal(response.statusCode, 403);
      await server.close();
    }
  );
});
