import assert from "node:assert/strict";
import test from "node:test";
import type {
  ApprovalExecutionLogEntryRecord
} from "@hallederiz/database";
import type { WorkerDomainExecutionRequest } from "@hallederiz/domain";
import { createApprovalExecutionConfirmationPort } from "../execution-confirmation-port.js";

const execution: ApprovalExecutionLogEntryRecord = {
  executionId: "exec_1",
  tenantId: "tenant_1",
  approvalRequestId: "apr_1",
  actionKey: "platform.orders.create",
  actorId: "user_1",
  approvedBy: "admin_1",
  status: "executed",
  mode: "execute",
  idempotencyKey: "idem_1",
  auditRequired: true,
  timelineRequired: true,
  reasons: ["mutation_executed:true"],
  createdAt: "2026-09-25T00:00:00.000Z",
  completedAt: "2026-09-25T00:00:01.000Z",
  handlerKey: "quick_operation.sale_order",
  handlerMode: "execute"
};

function request(overrides: Partial<WorkerDomainExecutionRequest> = {}): WorkerDomainExecutionRequest {
  return {
    jobType: "approval.execution.dispatch",
    tenantId: "tenant_1",
    actionKey: "platform.orders.create",
    idempotencyKey: "approval_outbox:idem_1",
    payload: {
      tenantId: "tenant_1",
      executionId: "exec_1",
      approvalRequestId: "apr_1",
      actionKey: "platform.orders.create",
      idempotencyKey: "idem_1"
    },
    ...overrides
  };
}

test("completes only after tenant-scoped durable execution evidence is verified", async () => {
  const port = createApprovalExecutionConfirmationPort({
    getExecutionLogForTenant: async (tenantId, executionId) => {
      assert.equal(tenantId, "tenant_1");
      assert.equal(executionId, "exec_1");
      return execution;
    }
  });

  const result = await port(request());
  assert.equal(result.status, "completed");
  assert.equal(result.mutation_executed, true);
  assert.equal(result.metadata?.executionVerified, true);
  assert.equal(result.auditEventId, "audit_exec_1");
  assert.equal(result.timelineEventId, "timeline_exec_1");
});

test("rejects tenant spoofing before repository access", async () => {
  let reads = 0;
  const port = createApprovalExecutionConfirmationPort({
    getExecutionLogForTenant: async () => {
      reads += 1;
      return execution;
    }
  });

  const result = await port(request({
    tenantId: "tenant_2"
  }));
  assert.equal(result.status, "failed");
  assert.equal(result.mutation_executed, false);
  assert.equal(result.reasons.includes("worker_execution_tenant_mismatch"), true);
  assert.equal(reads, 0);
});

test("database read failure remains retryable through deferred status", async () => {
  const port = createApprovalExecutionConfirmationPort({
    getExecutionLogForTenant: async () => {
      throw new Error("database_unavailable");
    }
  });

  const result = await port(request());
  assert.equal(result.status, "deferred");
  assert.equal(result.mutation_executed, false);
  assert.equal(result.reasons.includes("approval_execution_log_read_failed"), true);
});

test("does not complete a blocked or evidence-free execution", async () => {
  const port = createApprovalExecutionConfirmationPort({
    getExecutionLogForTenant: async () => ({
      ...execution,
      reasons: [],
      status: "blocked"
    })
  });

  const result = await port(request());
  assert.equal(result.status, "failed");
  assert.equal(result.mutation_executed, false);
});
