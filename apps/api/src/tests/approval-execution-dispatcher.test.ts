import assert from "node:assert/strict";
import test from "node:test";
import {
  dispatchApprovedAction,
  getActionExecutionHandler,
  hasActionExecutionHandler,
  listActionExecutionHandlers,
  resetExecutionDispatcherState
} from "@hallederiz/domain";

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
  assert.equal(second.executionId, first.executionId);
});

test("supported action returns executionId without real mutation", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ actionKey: "platform.settings.update", idempotencyKey: "idem_settings" }));
  assert.equal(result.status, "executed");
  assert.equal(result.ok, true);
  assert.ok(result.executionId.length > 0);
  assert.ok(result.reasons.includes("no_real_mutation_executed"));
  assert.equal(result.handlerMode, "dry_run");
  assert.ok(result.handlerKey.length > 0);
  assert.equal(result.executionLog.mode, "dry_run");
});

test("dispatcher keeps audit/timeline flags and tenant/action metadata", () => {
  resetExecutionDispatcherState();
  const result = dispatchApprovedAction(baseRequest({ actionKey: "platform.users.create", idempotencyKey: "idem_meta" }));
  assert.equal(result.approvalRequestId, "apr_req_42");
  assert.equal(result.actionKey, "platform.users.create");
  assert.equal(result.auditRequired, true);
  assert.equal(result.timelineRequired, true);
  assert.equal(result.executionLog.tenantId, "tenant_1");
  assert.equal(result.executionLog.approvalRequestId, "apr_req_42");
  assert.equal(result.executionLog.actionKey, "platform.users.create");
  assert.equal(result.executionLog.handlerMode, "dry_run");
  assert.equal(result.executionLog.completedAt !== undefined, true);
  assert.equal(result.auditEvent?.payload.tenantId, "tenant_1");
  assert.equal(result.auditEvent?.payload.executionId, result.executionId);
  assert.equal(result.timelineEvent?.payload.actionKey, "platform.users.create");
});

test("handler registry lists foundation handlers", () => {
  const handlers = listActionExecutionHandlers();
  assert.ok(handlers.some((handler) => handler.actionKey === "platform.users.create"));
  assert.ok(handlers.some((handler) => handler.actionKey === "platform.settings.update"));
  assert.equal(hasActionExecutionHandler("platform.users.create"), true);
  assert.equal(hasActionExecutionHandler("unknown.action"), false);
});

test("settings handler is supported in dry_run mode", () => {
  const handler = getActionExecutionHandler("platform.settings.update");
  assert.ok(handler);
  assert.equal(handler.supported, true);
  assert.equal(handler.mode, "dry_run");
  assert.equal(handler.safetyChecklist.realExecutionEnabled, false);
  assert.equal(handler.safetyChecklist.dryRunOnly, true);
  assert.equal(handler.safetyChecklist.requiresApproval, true);
});
