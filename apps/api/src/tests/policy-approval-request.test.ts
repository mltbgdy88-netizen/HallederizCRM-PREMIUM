import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { listPendingApprovalRequests } from "../shared/policy-bridge";
import { withDemoAuth } from "./test-env";

function authHeaders(token: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`
  };
}

test("require_approval returns approvalRequestId and keeps mutation blocked", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server);

    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const beforeUsers = await server.inject({
      method: "GET",
      url: "/users",
      headers: authHeaders(login.accessToken)
    });
    const beforeCount = beforeUsers.json().total;

    const response = await server.inject({
      method: "POST",
      url: "/users",
      headers: authHeaders(login.accessToken),
      payload: {
        email: "approval.bridge@hallederiz.com",
        fullName: "Approval Bridge"
      }
    });

    assert.equal(response.statusCode, 202);
    const payload = response.json();
    assert.equal(payload.policyDecision, "require_approval");
    assert.equal(payload.approvalRequired, true);
    assert.ok(typeof payload.approvalRequestId === "string");
    assert.ok(payload.approvalRequestId.length > 0);

    const pending = listPendingApprovalRequests("tenant_1");
    const created = pending.find((item) => item.approvalRequestId === payload.approvalRequestId);
    assert.ok(created);
    assert.equal(created?.tenantId, "tenant_1");
    assert.equal(created?.actorId, "user_1");
    assert.equal(created?.actionKey, "platform.users.create");
    assert.equal(created?.status, "pending");

    const afterUsers = await server.inject({
      method: "GET",
      url: "/users",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(afterUsers.json().total, beforeCount);

    await server.close();
  });
});

test("deny decisions stay fail-closed", async () => {
  await withDemoAuth(async () => {
    const server = Fastify();
    await registerPlatformCoreRoutes(server);

    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const response = await server.inject({
      method: "POST",
      url: "/users",
      headers: {
        ...authHeaders(login.accessToken),
        "x-tenant-id": "tenant_other"
      },
      payload: {
        email: "blocked@hallederiz.com",
        fullName: "Blocked"
      }
    });

    assert.equal(response.statusCode, 403);
    await server.close();
  });
});
