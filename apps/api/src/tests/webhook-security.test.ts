import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerIntegrationRoutes } from "../integrations/routes";
import { signHmacSha256Payload, verifyHmacSha256Signature } from "../shared/webhook-security";
import { withEnv } from "./test-env";

test("webhook signature helper accepts valid plain and sha256 signatures", () => {
  const rawBody = JSON.stringify({ hello: "world" });
  const secret = "top-secret";
  const signature = signHmacSha256Payload(rawBody, secret);

  assert.equal(verifyHmacSha256Signature(rawBody, signature, secret), true);
  assert.equal(verifyHmacSha256Signature(rawBody, `sha256=${signature}`, secret), true);
});

test("webhook signature helper rejects missing, invalid and length-mismatched signatures", () => {
  const rawBody = JSON.stringify({ hello: "world" });
  const secret = "top-secret";

  assert.equal(verifyHmacSha256Signature(rawBody, undefined, secret), false);
  assert.equal(verifyHmacSha256Signature(rawBody, "not-hex", secret), false);
  assert.equal(verifyHmacSha256Signature(rawBody, "a".repeat(62), secret), false);
  assert.equal(verifyHmacSha256Signature(rawBody, "b".repeat(64), secret), false);
});

test("production WhatsApp webhook rejects missing secret", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      WHATSAPP_WEBHOOK_APP_SECRET: undefined
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({ entry: [] })
      });

      assert.equal(response.statusCode, 503);
      await server.close();
    }
  );
});

test("WhatsApp webhook rejects invalid signature and accepts valid raw body signature", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_WEBHOOK_APP_SECRET: "top-secret"
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const rawBody = JSON.stringify({ entry: [] });

      const invalid = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${"b".repeat(64)}`
        },
        payload: rawBody
      });
      assert.equal(invalid.statusCode, 403);

      const valid = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${signHmacSha256Payload(rawBody, "top-secret")}`
        },
        payload: rawBody
      });
      assert.equal(valid.statusCode, 200);
      assert.equal(valid.json().ok, true);
      await server.close();
    }
  );
});

test("production WhatsApp webhook rejects missing signature when secret is configured", async () => {
  await withEnv(
    {
      NODE_ENV: "production",
      WHATSAPP_WEBHOOK_APP_SECRET: "test-whatsapp-webhook-secret"
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({ entry: [] })
      });

      assert.equal(response.statusCode, 403);
      assert.equal(response.json().message, "Webhook signature is required.");
      await server.close();
    }
  );
});

test("live WhatsApp provider rejects missing webhook secret in development", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_WEBHOOK_APP_SECRET: undefined
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({ entry: [] })
      });

      assert.equal(response.statusCode, 503);
      assert.equal(response.json().message, "WhatsApp webhook secret is not configured.");
      await server.close();
    }
  );
});

test("live WhatsApp provider rejects missing and invalid signatures", async () => {
  const secret = "test-whatsapp-webhook-secret";
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_PROVIDER: "live",
      WHATSAPP_WEBHOOK_APP_SECRET: secret
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const rawBody = JSON.stringify({ entry: [], tenantId: "tenant_1" });

      const missing = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: rawBody
      });
      assert.equal(missing.statusCode, 403);
      assert.equal(missing.json().message, "Webhook signature is required.");

      const invalid = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": "sha256=bad"
        },
        payload: rawBody
      });
      assert.equal(invalid.statusCode, 403);
      assert.equal(invalid.json().message, "Webhook signature mismatch.");

      const valid = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${signHmacSha256Payload(rawBody, secret)}`
        },
        payload: rawBody
      });
      assert.equal(valid.statusCode, 200);
      assert.equal(valid.json().ok, true);
      await server.close();
    }
  );
});

test("demo development webhook remains legacy-compatible without provider or secret", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      WHATSAPP_PROVIDER: undefined,
      WHATSAPP_WEBHOOK_APP_SECRET: undefined
    },
    async () => {
      const server = Fastify();
      await registerIntegrationRoutes(server);
      const response = await server.inject({
        method: "POST",
        url: "/whatsapp/webhook",
        headers: { "content-type": "application/json" },
        payload: JSON.stringify({ entry: [] })
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().ok, true);
      await server.close();
    }
  );
});
