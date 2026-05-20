import assert from "node:assert/strict";
import test from "node:test";
import {
  dispatchApprovedAction,
  getActionExecutionHandler,
  registerActionExecutionHandler,
  resetExecutionDispatcherState
} from "@hallederiz/domain";
function registerQuickOperationHandlers() {
  const register = (actionKey: string, handlerKey: string) => {
    registerActionExecutionHandler({
      handlerKey,
      actionKey,
      supported: true,
      mode: "execute",
      safetyChecklist: {
        requiresApproval: true,
        mutatesState: true,
        externalWrite: false,
        idempotencyRequired: true,
        auditRequired: true,
        timelineRequired: true,
        dryRunOnly: false,
        realExecutionEnabled: true
      },
      execute: (request, _action, gateDecision) => {
        const payload = request.payload ?? {};
        if (payload.source !== "quick-operations.submit") {
          return { ok: false, status: "blocked", reasons: ["quick_operation_payload_invalid"], mutationExecuted: false };
        }
        if (typeof payload.customerId !== "string" || !Array.isArray(payload.lines) || payload.lines.length === 0) {
          return { ok: false, status: "blocked", reasons: ["missing_customer_or_lines"], mutationExecuted: false };
        }
        return {
          ok: true,
          status: "executed",
          reasons: ["quick_operation_approval_validated", "mutation_executed:false", "worker_follow_up_required:true"],
          gateDecision,
          mutationExecuted: false,
          effectiveMode: gateDecision.mode === "execute" ? "execute" : "dry_run"
        };
      }
    });
  };
  register("platform.offers.create", "handler.platform.offers.create");
  register("platform.orders.create", "handler.platform.orders.create");
  register("platform.payments.create", "handler.platform.payments.create");
}

test("quick operation approval handlers are registered", () => {
  resetExecutionDispatcherState();
  registerQuickOperationHandlers();
  assert.ok(getActionExecutionHandler("platform.offers.create"));
  assert.ok(getActionExecutionHandler("platform.orders.create"));
  assert.ok(getActionExecutionHandler("platform.payments.create"));
});

test("quick operation approval validates payload and does not emit fake entity id", () => {
  resetExecutionDispatcherState();
  registerQuickOperationHandlers();
  const result = dispatchApprovedAction(
    {
      tenantId: "tenant_qo_1",
      approvalRequestId: "apr_qo_1",
      actionKey: "platform.orders.create",
      actorId: "actor_1",
      approvedBy: "approver_1",
      payload: {
        source: "quick-operations.submit",
        operationType: "sale_order",
        customerId: "customer_1",
        lines: [{ id: "line_1", productCode: "P1", productName: "Urun", quantity: 1, unitPrice: 10, lineTotal: 10 }]
      },
      idempotencyKey: "idem_qo_1",
      requestedAt: "2026-05-12T10:00:00.000Z",
      approvedAt: "2026-05-12T10:01:00.000Z"
    },
    { environment: "development", executionMode: "dry_run" }
  );

  assert.equal(result.status, "executed");
  assert.equal(result.mutationExecuted, false);
  assert.ok(!result.reasons.some((reason) => reason.startsWith("entityId:")));
});

test("quick operation approval rejects invalid payload", () => {
  resetExecutionDispatcherState();
  registerQuickOperationHandlers();
  const result = dispatchApprovedAction(
    {
      tenantId: "tenant_qo_2",
      approvalRequestId: "apr_qo_2",
      actionKey: "platform.payments.create",
      actorId: "actor_1",
      approvedBy: "approver_1",
      payload: { source: "quick-operations.submit", operationType: "payment" },
      idempotencyKey: "idem_qo_2",
      requestedAt: "2026-05-12T10:00:00.000Z",
      approvedAt: "2026-05-12T10:01:00.000Z"
    },
    { environment: "development", executionMode: "dry_run" }
  );
  assert.equal(result.ok, false);
  assert.ok(result.status === "blocked" || result.status === "failed");
});
