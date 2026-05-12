import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { resetPendingApprovalRequests } from "@hallederiz/domain";
import { registerPlatformCoreRoutes } from "../platform-core/routes";
import { createSession } from "../shared/session-store";
import { resetPendingApprovalRuntimeForTests } from "../shared/approval-repository-runtime";
import { APPROVAL_SANDBOX_IDEMPOTENCY, isApprovalSandboxSeedRouteEnabled } from "../shared/approval-sandbox-seed";
import { withDemoAuth, withEnv } from "./test-env";

function authHeaders(token: string, tenantId?: string) {
  return {
    "x-session-token": token,
    authorization: `Bearer ${token}`,
    ...(tenantId ? { "x-tenant-id": tenantId } : {})
  };
}

test("sandbox seed route flag is false in production", async () => {
  await withEnv({ NODE_ENV: "production", PERSISTENCE_MODE: "demo", DEMO_AUTH_ENABLED: "true" }, async () => {
    assert.equal(isApprovalSandboxSeedRouteEnabled(), false);
  });
});

test("sandbox seed creates pending approvals idempotently in development demo", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRuntimeForTests();
    resetPendingApprovalRequests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const login = createSession({
      tenantSlug: "hallederiz",
      email: "admin@hallederiz.com",
      password: "demo"
    });

    const avail = await server.inject({
      method: "GET",
      url: "/platform/approvals/sandbox/availability",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(avail.statusCode, 200);
    const availBody = avail.json() as { sandboxSeedAvailable: boolean };
    assert.equal(availBody.sandboxSeedAvailable, true);

    const first = await server.inject({
      method: "POST",
      url: "/platform/approvals/sandbox/seed",
      headers: authHeaders(login.accessToken),
      payload: {}
    });
    assert.equal(first.statusCode, 200);
    const firstBody = first.json() as { created: { idempotencyKey: string }[]; skipped: unknown[] };
    assert.equal(firstBody.created.length, 2);
    assert.equal(firstBody.skipped.length, 0);

    const second = await server.inject({
      method: "POST",
      url: "/platform/approvals/sandbox/seed",
      headers: authHeaders(login.accessToken),
      payload: {}
    });
    assert.equal(second.statusCode, 200);
    const secondBody = second.json() as { created: unknown[]; skipped: { idempotencyKey: string }[] };
    assert.equal(secondBody.created.length, 0);
    assert.equal(secondBody.skipped.length, 2);

    const list = await server.inject({
      method: "GET",
      url: "/platform/approvals",
      headers: authHeaders(login.accessToken)
    });
    assert.equal(list.statusCode, 200);
    const items = (list.json() as { items: { idempotencyKey: string; approvalRequestId: string; status: string }[] }).items;
    const keys = new Set(items.map((i) => i.idempotencyKey));
    assert.ok(keys.has(APPROVAL_SANDBOX_IDEMPOTENCY.settingsUpdate));
    assert.ok(keys.has(APPROVAL_SANDBOX_IDEMPOTENCY.usersCreate));

    const settingsRow = items.find((i) => i.idempotencyKey === APPROVAL_SANDBOX_IDEMPOTENCY.settingsUpdate);
    assert.ok(settingsRow);
    const approve = await server.inject({
      method: "POST",
      url: `/platform/approvals/${settingsRow!.approvalRequestId}/approve`,
      headers: authHeaders(login.accessToken),
      payload: {}
    });
    assert.equal(approve.statusCode, 200);

    const usersRow = items.find((i) => i.idempotencyKey === APPROVAL_SANDBOX_IDEMPOTENCY.usersCreate);
    assert.ok(usersRow);
    const rejectEmpty = await server.inject({
      method: "POST",
      url: `/platform/approvals/${usersRow!.approvalRequestId}/reject`,
      headers: authHeaders(login.accessToken),
      payload: { reason: "   " }
    });
    assert.equal(rejectEmpty.statusCode, 400);

    await server.close();
  });
});

test("sandbox seed rejects without auth", async () => {
  await withDemoAuth(async () => {
    resetPendingApprovalRuntimeForTests();
    resetPendingApprovalRequests();
    const server = Fastify();
    await registerPlatformCoreRoutes(server);
    const res = await server.inject({
      method: "POST",
      url: "/platform/approvals/sandbox/seed"
    });
    assert.equal(res.statusCode, 401);
    await server.close();
  });
});
