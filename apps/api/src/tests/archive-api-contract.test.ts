import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerArchiveRoutes } from "../modules/archive/routes";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  server.get("/health", async () => ({ status: "ok", service: "api" }));
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  await registerArchiveRoutes(server);
  return server;
}

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

test("GET /archive returns live records in foundation mode", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/archive",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json() as { items: unknown[]; liveReady: boolean; total: number };
    assert.equal(payload.liveReady, true);
    assert.ok(payload.total >= 1);

    await server.close();
  });
});

test("GET /archive/:id/download-url returns 200 when document file is ready", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const listResponse = await server.inject({
      method: "GET",
      url: "/archive",
      headers: authHeaders(login.accessToken)
    });
    const listPayload = listResponse.json() as { items: Array<{ id: string; documentId?: string; downloadUrl?: string }> };
    const ready = listPayload.items.find((row) => row.downloadUrl?.startsWith("https://"));
    assert.ok(ready?.id);

    const response = await server.inject({
      method: "GET",
      url: `/archive/${ready.id}/download-url`,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 200);
    const payload = response.json() as { item: { status: string; downloadUrl?: string } };
    assert.equal(payload.item.status, "ready");
    assert.match(payload.item.downloadUrl ?? "", /^https:\/\//);

    await server.close();
  });
});

test("GET /archive/:id returns 404 for unknown archive", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/archive/missing_archive",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 404);
    await server.close();
  });
});
