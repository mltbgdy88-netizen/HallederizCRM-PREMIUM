import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerCommercialOperationsRoutes } from "../commercial-operations/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  server.get("/health", async () => ({ status: "ok", service: "api" }));
  await registerPlatformCoreRoutes(server);
  await registerCommercialOperationsRoutes(server);
  return server;
}

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

test("GET /documents/:id/download-url returns 202 when file not ready", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const listResponse = await server.inject({
      method: "GET",
      url: "/documents",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(listResponse.statusCode, 200);
    const listPayload = listResponse.json() as { items: Array<{ id: string }> };
    const documentId = listPayload.items[0]?.id;
    assert.ok(documentId);

    const response = await server.inject({
      method: "GET",
      url: `/documents/${documentId}/download-url`,
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 202);
    const payload = response.json() as { item: { status: string; documentId: string } };
    assert.equal(payload.item.documentId, documentId);
    assert.equal(payload.item.status, "pending");
    assert.equal((payload.item as { downloadUrl?: string }).downloadUrl, undefined);

    await server.close();
  });
});

test("GET /documents/:id/download-url returns 404 for unknown document", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "GET",
      url: "/documents/missing_document/download-url",
      headers: authHeaders(login.accessToken)
    });

    assert.equal(response.statusCode, 404);
    await server.close();
  });
});
