import assert from "node:assert/strict";
import test from "node:test";
import {
  completedHandlerResult,
  deferredHandlerResult,
  isWorkerJobCompletable,
  listContractJobHandlers,
  normalizeHandlerResult,
  registerWorkerDomainExecutionPort,
  resetWorkerDomainExecutionPort,
  validateStandardJobPayload
} from "@hallederiz/domain";

test("normalizeHandlerResult blocks completed without mutation_executed", () => {
  const normalized = normalizeHandlerResult({
    ok: true,
    status: "completed",
    mutation_executed: false,
    reasons: ["fake_complete"]
  });
  assert.equal(normalized.ok, false);
  assert.equal(normalized.status, "deferred");
  assert.equal(normalized.mutation_executed, false);
});

test("completedHandlerResult is completable", () => {
  const result = completedHandlerResult({ jobType: "approval_execution", entityType: "order", entityId: "order_1" });
  assert.equal(isWorkerJobCompletable(result), true);
});

test("deferredHandlerResult is not completable", () => {
  const result = deferredHandlerResult("approval_execution", "domain_execution_not_wired");
  assert.equal(isWorkerJobCompletable(result), false);
});

test("approval_execution handler defers without execution port", () => {
  resetWorkerDomainExecutionPort();
  const handler = listContractJobHandlers().find((item) => item.jobType === "approval_execution");
  assert.ok(handler);
  const now = new Date().toISOString();
  const raw = handler!.handle({
    jobId: "job_live_1",
    tenantId: "tenant_1",
    jobType: "approval_execution",
    status: "pending",
    idempotencyKey: "idem_live_1",
    payload: {
      tenantId: "tenant_1",
      actionKey: "platform.orders.create",
      approvalId: "apr_1",
      idempotencyKey: "idem_live_1",
      source: "quick-operations.submit",
      operationType: "sale_order",
      customerId: "customer_1",
      lines: [{ id: "line_1", productCode: "P1", productName: "Urun", quantity: 1, unitPrice: 10, lineTotal: 10 }]
    },
    attempts: 0,
    maxAttempts: 3,
    availableAt: now,
    createdAt: now,
    updatedAt: now
  });
  const result = normalizeHandlerResult(raw);
  assert.equal(result.ok, false);
  assert.ok(result.reasons?.some((reason) => reason.includes("mutation_executed:false")));
});

test("approval_execution with port never returns fake entity id", () => {
  registerWorkerDomainExecutionPort(() => ({
    status: "deferred",
    mutation_executed: false,
    reasons: ["domain_execution_not_wired"]
  }));
  const handler = listContractJobHandlers().find((item) => item.jobType === "approval_execution");
  assert.ok(handler);
  const now = new Date().toISOString();
  const result = normalizeHandlerResult(
    handler!.handle({
      jobId: "job_live_2",
      tenantId: "tenant_1",
      jobType: "approval_execution",
      status: "pending",
      idempotencyKey: "idem_live_2",
      payload: {
        tenantId: "tenant_1",
        actionKey: "platform.orders.create",
        approvalId: "apr_2",
        idempotencyKey: "idem_live_2",
        source: "quick-operations.submit",
        operationType: "sale_order",
        customerId: "customer_1",
        lines: [{ id: "line_1", productCode: "P1", productName: "Urun", quantity: 1, unitPrice: 10, lineTotal: 10 }]
      },
      attempts: 0,
      maxAttempts: 3,
      availableAt: now,
      createdAt: now,
      updatedAt: now
    })
  );
  assert.equal(result.ok, false);
  assert.equal(result.entityId, undefined);
  resetWorkerDomainExecutionPort();
});

test("validateStandardJobPayload requires tenant and idempotency", () => {
  const reasons = validateStandardJobPayload("approval_execution", { actionKey: "platform.orders.create" });
  assert.ok(reasons.includes("missing_tenant_id"));
  assert.ok(reasons.includes("missing_idempotency_key"));
});
