import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { signHmacSha256Payload } from "../shared/webhook-security";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { resetOmnichannelRuntimeForTests } from "../shared/omnichannel-runtime";
import { resetOmnichannelWebhookMemoryForTests } from "../platform-core/routes/omnichannel-webhook-routes";
import { withEnv } from "./test-env";

function metaPayload(tenantId: string) {
  return {
    object: "page",
    tenantId,
    entry: [
      {
        id: "page_123",
        messaging: [
          {
            sender: { id: "user_456" },
            recipient: { id: "page_123" },
            timestamp: Date.now(),
            message: { mid: "m_1", text: "Merhaba fiyat nedir?" }
          }
        ]
      }
    ]
  };
}

test("meta webhook GET rejects invalid verify token in production", async () => {
  await withEnv({ NODE_ENV: "production", META_WEBHOOK_VERIFY_TOKEN: "expected" }, async () => {
    resetOmnichannelRuntimeForTests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const response = await server.inject({
      method: "GET",
      url: "/platform/omnichannel/webhooks/meta?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=wrong"
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("meta webhook GET accepts dev env verify token", async () => {
  await withEnv({ NODE_ENV: "development", META_WEBHOOK_VERIFY_TOKEN: "dev-token" }, async () => {
    resetOmnichannelRuntimeForTests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const response = await server.inject({
      method: "GET",
      url: "/platform/omnichannel/webhooks/meta?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=dev-token"
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, "12345");
    await server.close();
  });
});

test("meta webhook POST rejects invalid signature in production", async () => {
  await withEnv({ NODE_ENV: "production", META_WEBHOOK_APP_SECRET: "meta-secret" }, async () => {
    resetOmnichannelRuntimeForTests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const rawBody = JSON.stringify(metaPayload("tenant_1"));
    const response = await server.inject({
      method: "POST",
      url: "/platform/omnichannel/webhooks/meta",
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": `sha256=${"a".repeat(64)}`
      },
      payload: rawBody
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("meta webhook POST valid signature creates conversation in memory mode", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      META_WEBHOOK_APP_SECRET: "meta-secret",
      OMNICHANNEL_ALLOW_MOCK_PROVIDERS: "true"
    },
    async () => {
      resetOmnichannelRuntimeForTests();
      resetOmnichannelWebhookMemoryForTests();
      const server = Fastify();
      await registerPlatformCoreRoutes(server);
      const rawBody = JSON.stringify(metaPayload("tenant_1"));
      const response = await server.inject({
        method: "POST",
        url: "/platform/omnichannel/webhooks/meta",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${signHmacSha256Payload(rawBody, "meta-secret")}`
        },
        payload: rawBody
      });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().ok, true);
      assert.equal(response.json().duplicate, false);
      await server.close();
    }
  );
});

test("duplicate meta webhook returns duplicate true", async () => {
  await withEnv({ NODE_ENV: "development", META_WEBHOOK_APP_SECRET: "meta-secret" }, async () => {
    resetOmnichannelRuntimeForTests();
    resetOmnichannelWebhookMemoryForTests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const rawBody = JSON.stringify(metaPayload("tenant_1"));
    const headers = {
      "content-type": "application/json",
      "x-hub-signature-256": `sha256=${signHmacSha256Payload(rawBody, "meta-secret")}`
    };
    await server.inject({ method: "POST", url: "/platform/omnichannel/webhooks/meta", headers, payload: rawBody });
    const second = await server.inject({ method: "POST", url: "/platform/omnichannel/webhooks/meta", headers, payload: rawBody });
    assert.equal(second.json().duplicate, true);
    await server.close();
  });
});
