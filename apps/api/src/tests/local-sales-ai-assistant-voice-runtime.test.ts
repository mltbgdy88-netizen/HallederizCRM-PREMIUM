import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { resetSalesAiRuntimeForTests, resolveSalesAiKnowledgeRepository } from "../shared/sales-ai-runtime";
import { withDemoAuth, withEnv } from "./test-env";

function authHeaders(token: string, extra?: Record<string, string>) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(extra ?? {})
  };
}

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  return server;
}

test("sales assistant health returns degraded when ollama is unavailable", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("connection refused");
    }) as typeof fetch;
    try {
      const response = await server.inject({
        method: "GET",
        url: "/platform/ai/sales-assistant/health",
        headers: authHeaders(login.accessToken)
      });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().item.status, "degraded");
    } finally {
      globalThis.fetch = originalFetch;
      await server.close();
      resetSalesAiRuntimeForTests();
    }
  });
});

test("sales assistant health returns not_configured when configured models are missing", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.includes("/api/tags")) {
        return new Response(JSON.stringify({ models: [{ name: "other-model:latest" }] }), { status: 200 });
      }
      return new Response("{}", { status: 404 });
    }) as typeof fetch;
    try {
      const response = await server.inject({
        method: "GET",
        url: "/platform/ai/sales-assistant/health",
        headers: authHeaders(login.accessToken)
      });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().item.status, "not_configured");
    } finally {
      globalThis.fetch = originalFetch;
      await server.close();
      resetSalesAiRuntimeForTests();
    }
  });
});

test("sales assistant chat denies unauthenticated access", async () => {
  const server = await buildServer();
  const response = await server.inject({
    method: "POST",
    url: "/platform/ai/sales-assistant/chat",
    payload: { message: "Merhaba" }
  });
  assert.equal(response.statusCode, 401);
  await server.close();
});

test("sales assistant chat is tenant fail-closed on mismatch", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/platform/ai/sales-assistant/chat",
      headers: authHeaders(login.accessToken, { "x-tenant-id": "tenant_other" }),
      payload: { message: "Merhaba" }
    });
    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("sales knowledge CRUD does not fallback when postgres repository is unavailable", async () => {
  await withEnv(
    {
      NODE_ENV: "development",
      PERSISTENCE_MODE: "postgres",
      DATABASE_URL: ""
    },
    async () => {
      const resolution = resolveSalesAiKnowledgeRepository({
        tenantId: "tenant_hallederiz",
        userId: "user_test",
        persistenceMode: "postgres",
        roles: ["admin"],
        permissions: ["*"]
      });
      assert.equal(resolution.mode, "unsupported");
      assert.equal(resolution.repository, null);
      assert.equal(resolution.skipped, true);
      resetSalesAiRuntimeForTests();
    }
  );
});

test("chat uses tenant scoped knowledge and does not hallucinate hidden price", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const otherLogin = createSession({ tenantSlug: "other", email: "admin@hallederiz.com", password: "demo" });

    const createTenantOne = await server.inject({
      method: "POST",
      url: "/platform/ai/sales-knowledge",
      headers: authHeaders(login.accessToken),
      payload: {
        productId: "p-100",
        productName: "Alpha Pompa",
        priceVisibility: "hidden",
        stockVisibility: "visible",
        salesNotes: "Yalnizca yetkili fiyat gorur"
      }
    });
    assert.equal(createTenantOne.statusCode, 201);

    const createTenantOther = await server.inject({
      method: "POST",
      url: "/platform/ai/sales-knowledge",
      headers: authHeaders(otherLogin.accessToken),
      payload: {
        productId: "p-200",
        productName: "Beta Valf",
        priceVisibility: "visible",
        stockVisibility: "visible"
      }
    });
    assert.equal(createTenantOther.statusCode, 201);

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.includes("/api/tags")) {
        return new Response(JSON.stringify({ models: [{ name: "RefinedNeuro/Turkcell-LLM-7b-v1:latest" }] }), { status: 200 });
      }
      if (url.includes("/api/generate")) {
        return new Response(JSON.stringify({ response: "Sistemde fiyat görünmüyor." }), { status: 200 });
      }
      throw new Error(`unexpected_fetch_${url}`);
    }) as typeof fetch;

    try {
      const chat = await server.inject({
        method: "POST",
        url: "/platform/ai/sales-assistant/chat",
        headers: authHeaders(login.accessToken),
        payload: { message: "Alpha Pompa fiyatı nedir?" }
      });
      assert.equal(chat.statusCode, 200);
      assert.equal(chat.json().item.intent, "price_question");
      assert.match(chat.json().item.reply, /sistemde görünmüyor/i);
      assert.equal(chat.json().item.mutationExecuted, false);
      assert.equal(chat.json().item.externalProviderCallExecuted, false);
      assert.ok(Array.isArray(chat.json().item.usedSources));
      assert.equal(chat.json().item.usedSources.every((source: { id: string }) => source.id !== createTenantOther.json().item.id), true);
    } finally {
      globalThis.fetch = originalFetch;
      await server.close();
      resetSalesAiRuntimeForTests();
    }
  });
});

test("order intent only returns suggested actions and never executes mutation", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.includes("/api/tags")) {
        return new Response(JSON.stringify({ models: [{ name: "RefinedNeuro/Turkcell-LLM-7b-v1:latest" }] }), { status: 200 });
      }
      if (url.includes("/api/generate")) {
        return new Response(JSON.stringify({ response: "Sipariş için taslak hazırlayıp onay akışına yönlendirebilirim." }), { status: 200 });
      }
      throw new Error(`unexpected_fetch_${url}`);
    }) as typeof fetch;

    try {
      const response = await server.inject({
        method: "POST",
        url: "/platform/ai/sales-assistant/chat",
        headers: authHeaders(login.accessToken),
        payload: { message: "Hemen sipariş açalım." }
      });
      assert.equal(response.statusCode, 200);
      assert.equal(response.json().item.intent, "order_intent");
      assert.equal(response.json().item.mutationExecuted, false);
      assert.equal(response.json().item.externalProviderCallExecuted, false);
      assert.ok(Array.isArray(response.json().item.suggestedActions));
      assert.equal(response.json().item.suggestedActions.length > 0, true);
    } finally {
      globalThis.fetch = originalFetch;
      await server.close();
      resetSalesAiRuntimeForTests();
    }
  });
});

test("voice runtime returns degraded when local providers are unavailable", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("voice_provider_unavailable");
    }) as typeof fetch;

    try {
      const transcribe = await server.inject({
        method: "POST",
        url: "/platform/ai/sales-assistant/voice/transcribe",
        headers: authHeaders(login.accessToken),
        payload: { audioBase64: "ZGVtbw==" }
      });
      assert.equal(transcribe.statusCode, 200);
      assert.equal(transcribe.json().item.status, "degraded");

      const speak = await server.inject({
        method: "POST",
        url: "/platform/ai/sales-assistant/voice/speak",
        headers: authHeaders(login.accessToken),
        payload: { text: "Merhaba" }
      });
      assert.equal(speak.statusCode, 200);
      assert.equal(speak.json().item.status, "degraded");
    } finally {
      globalThis.fetch = originalFetch;
      await server.close();
      resetSalesAiRuntimeForTests();
    }
  });
});
