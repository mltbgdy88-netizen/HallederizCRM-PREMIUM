import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { withDemoAuth } from "./test-env";

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

test("POST /users returns require_approval after guard pass and does not execute mutation", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const before = await server.inject({
      method: "GET",
      url: "/users",
      headers: authHeaders(login.accessToken)
    });
    const beforeCount = before.json().total;

    const response = await server.inject({
      method: "POST",
      url: "/users",
      headers: authHeaders(login.accessToken),
      payload: {
        email: "new.user@hallederiz.com",
        fullName: "New User"
      }
    });

    assert.equal(response.statusCode, 202);
    assert.equal(response.json().status, "require_approval");

    const after = await server.inject({
      method: "GET",
      url: "/users",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(after.json().total, beforeCount);
    await server.close();
  });
});

test("PATCH /settings returns require_approval after guard pass and does not execute mutation", async () => {
  await withDemoAuth(async () => {
    const server = await buildServer();
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const before = await server.inject({
      method: "GET",
      url: "/settings",
      headers: authHeaders(login.accessToken)
    });
    const beforeName = before.json().data.company.name;

    const response = await server.inject({
      method: "PATCH",
      url: "/settings",
      headers: authHeaders(login.accessToken),
      payload: {
        company: {
          name: "Policy Should Block"
        }
      }
    });

    assert.equal(response.statusCode, 202);
    assert.equal(response.json().status, "require_approval");

    const after = await server.inject({
      method: "GET",
      url: "/settings",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(after.json().data.company.name, beforeName);
    await server.close();
  });
});
