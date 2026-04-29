import assert from "node:assert/strict";
import test from "node:test";
import { createSession } from "../shared/session-store";
import { buildRequestContext } from "../shared/request-context";
import { assertAuthenticated, assertTenantAccess } from "../shared/auth-guards";
import { createApprovalExecution, runApprovalExecution } from "../ai-local-output-store";
import { listAuditEvents } from "../shared/audit-timeline";

test("auth/session resolver: valid session token sets authenticated context", () => {
  const login = createSession({
    tenantSlug: "hallederiz",
    email: "admin@hallederiz.com",
    password: "demo"
  });

  const request = {
    headers: {
      "x-session-token": login.accessToken,
      authorization: `Bearer ${login.accessToken}`
    }
  } as never;

  const context = buildRequestContext(request);
  assert.equal(context.isAuthenticated, true);
  assert.equal(context.tenantId, "tenant_1");
  assert.ok((context.permissions ?? []).length > 0);
});

test("tenant guard: mismatch throws forbidden", () => {
  const context = {
    tenantId: "tenant_1",
    userId: "user_admin",
    persistenceMode: "demo",
    isAuthenticated: true
  } as const;

  assert.throws(() => assertTenantAccess(context, "tenant_2"));
});

test("approval execution dispatch: happy path and failure path", () => {
  const success = createApprovalExecution({
    operationType: "create_order",
    targetId: "order_new",
    targetType: "order",
    requestedBy: "user_admin",
    authorizedBy: "user_admin"
  });
  const successResult = runApprovalExecution(success.id);
  assert.equal(successResult?.status, "executed");

  const failed = createApprovalExecution({
    operationType: "unsupported_test_action" as never,
    targetId: "delivery_missing",
    targetType: "delivery",
    requestedBy: "user_admin",
    authorizedBy: "user_admin"
  });
  const failedResult = runApprovalExecution(failed.id);
  assert.equal(failedResult?.status, "failed");
  assert.ok(failedResult?.result?.message);
});

test("audit timeline write-back: execution emits records", () => {
  const events = listAuditEvents("tenant_1", "approval_execution");
  assert.ok(events.length > 0);
});

test("auth guard: anonymous blocked", () => {
  const context = {
    tenantId: "tenant_1",
    userId: "anonymous",
    persistenceMode: "demo",
    isAuthenticated: false
  } as const;

  assert.throws(() => assertAuthenticated(context));
});
