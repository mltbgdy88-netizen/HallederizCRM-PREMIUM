import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { resolveOmnichannelRuntime, resetOmnichannelRuntimeForTests } from "../shared/omnichannel-runtime";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth, withEnv } from "./test-env";

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  return server;
}

test("omnichannel conversation list requires auth", async () => {
  await withDemoAuth(async () => {
    resetOmnichannelRuntimeForTests();
    const server = await buildServer();
    const response = await server.inject({ method: "GET", url: "/platform/omnichannel/conversations" });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("omnichannel conversation list is tenant scoped", async () => {
  await withDemoAuth(async () => {
    resetOmnichannelRuntimeForTests();
    const runtime = resolveOmnichannelRuntime({ tenantId: "tenant_1", userId: "user_1", persistenceMode: "demo" } as any);
    assert.ok(runtime.conversationRepository);

    await runtime.conversationRepository!.save({
      id: "conv_t1",
      tenantId: "tenant_1",
      channel: "whatsapp",
      externalConversationId: "ext_t1",
      status: "open",
      tags: [],
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });
    await runtime.conversationRepository!.save({
      id: "conv_t2",
      tenantId: "tenant_2",
      channel: "whatsapp",
      externalConversationId: "ext_t2",
      status: "open",
      tags: [],
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/platform/omnichannel/conversations",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.total, 1);
    assert.equal(body.items[0].tenantId, "tenant_1");
    await server.close();
  });
});

test("omnichannel reply missing permission denies", async () => {
  await withDemoAuth(async () => {
    resetOmnichannelRuntimeForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "operator@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/platform/omnichannel/conversations/conv_1/reply",
      headers: authHeaders(login.accessToken),
      payload: { text: "Merhaba" }
    });

    assert.equal(response.statusCode, 403);
    await server.close();
  });
});

test("AI source omnichannel reply stays approval/dry-run and does not live send", async () => {
  await withDemoAuth(async () => {
    resetOmnichannelRuntimeForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "POST",
      url: "/platform/omnichannel/conversations/conv_1/reply",
      headers: authHeaders(login.accessToken),
      payload: { text: "AI yaniti", source: "ai", channel: "whatsapp" }
    });

    assert.ok([202, 403].includes(response.statusCode));
    const body = response.json();
    if (response.statusCode === 202) {
      assert.ok(["require_approval", "dry_run_only"].includes(body.policyDecision));
    } else {
      assert.equal(body.policyDecision, "deny");
    }

    await server.close();
  });
});

test("production postgres mode does not silently fallback to memory", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "postgres", DATABASE_URL: "", POSTGRES_URL: "" }, async () => {
    resetOmnichannelRuntimeForTests();
    const resolution = resolveOmnichannelRuntime({ tenantId: "tenant_1", userId: "user_1", persistenceMode: "postgres" } as any);
    assert.equal(resolution.mode, "unsupported");
    assert.equal(resolution.conversationRepository, null);
    assert.ok(resolution.reasons.includes("omnichannel_postgres_url_missing"));
  });
});

test("mock providers are degraded and do not perform live send", async () => {
  await withDemoAuth(async () => {
    resetOmnichannelRuntimeForTests();
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const health = await server.inject({
      method: "GET",
      url: "/platform/omnichannel/health",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(health.statusCode, 200);
    const body = health.json();
    const instagram = body.providers.find((item: any) => item.kind === "instagram");
    assert.ok(instagram);
    assert.equal(instagram.ok, false);
    assert.ok(Array.isArray(instagram.reasons));
    await server.close();
  });
});
