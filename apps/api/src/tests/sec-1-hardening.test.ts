import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerImportRoutes } from "../imports/routes";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { clearRateLimitBucketsForTests } from "../shared/rate-limit";
import { withDemoAuth } from "./test-env";

async function buildServer() {
  const server = Fastify();
  await registerPlatformCoreRoutes(server);
  await registerImportRoutes(server);
  return server;
}

test("imports templates requires auth", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const response = await server.inject({ method: "GET", url: "/imports/templates" });
    assert.equal(response.statusCode, 401);
    await server.close();
  });
});

test("imports templates allows authenticated read", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({ tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" });
    const response = await server.inject({
      method: "GET",
      url: "/imports/templates",
      headers: {
        "x-session-token": login.accessToken,
        authorization: `Bearer ${login.accessToken}`
      }
    });
    assert.equal(response.statusCode, 200);
    assert.ok(Array.isArray(response.json().items));
    await server.close();
  });
});

test("login route rate limit returns 429 after threshold", async () => {
  await withDemoAuth(async () => {
    clearRateLimitBucketsForTests();
    const server = Fastify();
    const { registerApiRateLimits } = await import("../shared/rate-limit");
    registerApiRateLimits(server);
    await registerPlatformCoreRoutes(server);

    let lastStatus = 0;
    for (let index = 0; index < 65; index += 1) {
      const response = await server.inject({
        method: "POST",
        url: "/auth/login",
        payload: { tenantSlug: "hallederiz", email: "admin@hallederiz.com", password: "demo" }
      });
      lastStatus = response.statusCode;
    }
    assert.equal(lastStatus, 429);
    await server.close();
  });
});
