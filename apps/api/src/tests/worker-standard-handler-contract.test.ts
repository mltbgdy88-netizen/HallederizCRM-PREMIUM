import assert from "node:assert/strict";
import test from "node:test";
import { listContractJobHandlers, validateStandardJobPayload } from "@hallederiz/domain";

test("standard job payload validation requires tenant and idempotency", () => {
  const reasons = validateStandardJobPayload("approval_execution", {
    actionKey: "platform.orders.create"
  });
  assert.ok(reasons.includes("missing_tenant_id"));
  assert.ok(reasons.includes("missing_idempotency_key"));
});

test("approval_execution requires approval id", () => {
  const reasons = validateStandardJobPayload("approval_execution", {
    tenantId: "tenant_1",
    actionKey: "platform.orders.create",
    idempotencyKey: "idem_1"
  });
  assert.ok(reasons.includes("missing_approval_id"));
});

test("unsupported contract handlers never return ok true", () => {
  const handlers = listContractJobHandlers();
  const approval = handlers.find((handler) => handler.jobType === "approval_execution");
  assert.ok(approval);
  const now = new Date().toISOString();
  const result = approval!.handle({
    jobId: "job_1",
    tenantId: "tenant_1",
    jobType: "approval_execution",
    status: "pending",
    idempotencyKey: "idem_1",
    payload: {
      tenantId: "tenant_1",
      actionKey: "platform.orders.create",
      idempotencyKey: "idem_1",
      approvalId: "apr_1"
    },
    attempts: 0,
    maxAttempts: 3,
    availableAt: now,
    createdAt: now,
    updatedAt: now
  });
  assert.equal(result.ok, false);
  assert.ok(result.reasons?.some((reason) => reason.includes("mutation_executed:false")));
});
