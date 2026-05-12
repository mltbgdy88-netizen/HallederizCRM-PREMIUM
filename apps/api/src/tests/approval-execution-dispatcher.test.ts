import assert from "node:assert/strict";
import test from "node:test";
import { dispatchApprovedAction, resetExecutionDispatcherState } from "@hallederiz/domain";

function baseRequest(overrides: Partial<Parameters<typeof dispatchApprovedAction>[0]> = {}) {
  return {
    tenantId: "tenant_1",
    approvalRequestId: "apr_req_42",
    actionKey: "platform.users.create",
    actorId: "user_1",
    approvedBy: "user_manager",
    payload: { email: "test@hallederiz.com" },
    idempotencyKey: "idem_1",
    requestedAt: "2026-05-12T10:00:00.000Z",
    approvedAt: "2026-05-12T10:01:00.000Z",
    ...overrides
  };
}

test("dispatcher returns unsupported_action for unknown action", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ actionKey: "unknown.action" }));
  assert.equal(result.status, "unsupported_action");
  assert.equal(result.ok, false);
});

test("dispatcher blocks critical action without approvalRequestId", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ approvalRequestId: "" }));
  assert.equal(result.status, "blocked");
  assert.equal(result.ok, false);
});

test("dispatcher returns duplicate for same idempotency key", () => {
  resetExecutionDispatcherState();
  const first = dispatchApprovedAction(baseRequest({ idempotencyKey: "idem_dup" }));
  const second = dispatchApprovedAction(baseRequest({ idempotencyKey: "idem_dup" }));
  assert.equal(first.status, "executed");
  assert.equal(second.status, "duplicate");
});

test("supported action returns executionId without real mutation", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ actionKey: "platform.settings.update", idempotencyKey: "idem_settings" }));
  assert.equal(result.status, "executed");
  assert.equal(result.ok, true);
  assert.ok(result.executionId.length > 0);
});

test("dispatcher keeps audit/timeline flags and tenant/action metadata", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ actionKey: "platform.users.create", idempotencyKey: "idem_meta" }));
  assert.equal(result.approvalRequestId, "apr_req_42");
  assert.equal(result.actionKey, "platform.users.create");
  assert.equal(result.auditRequired, true);
  assert.equal(result.timelineRequired, true);
});
