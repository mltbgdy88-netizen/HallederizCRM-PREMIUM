import assert from "node:assert/strict";
import test from "node:test";
import {
  type ApprovalExecutionLogRepository,
  dispatchApprovedAction,
  InMemoryApprovalExecutionLogRepository,
  resetExecutionDispatcherState
} from "@hallederiz/domain";

function baseRequest(overrides: Partial<Parameters<typeof dispatchApprovedAction>[0]> = {}) {
  return {
    tenantId: "tenant_persist",
    approvalRequestId: "apr_persist_1",
    actionKey: "platform.users.create",
    actorId: "user_persist",
    approvedBy: "approver_persist",
    payload: { source: "test" },
    idempotencyKey: "idem_persist_1",
    requestedAt: "2026-05-12T10:00:00.000Z",
    approvedAt: "2026-05-12T10:01:00.000Z",
    ...overrides
  };
}

test("repository persists execution log and audit/timeline drafts", () => {
  resetExecutionDispatcherState();
  const repository = new InMemoryApprovalExecutionLogRepository();
  const result = dispatchApprovedAction(baseRequest(), { repository });

  assert.equal(result.status, "executed");
  assert.equal(result.persistenceMode, "repository");
  assert.equal(result.persistenceSkipped, false);
  assert.equal(repository.getExecutionLog(result.executionId)?.tenantId, "tenant_persist");
  assert.equal(repository.getExecutionLog(result.executionId)?.actionKey, "platform.users.create");
  assert.equal(repository.getExecutionLog(result.executionId)?.approvalRequestId, "apr_persist_1");
  assert.equal(result.auditEvent?.payload.idempotencyKey, "idem_persist_1");
  assert.equal(result.timelineEvent?.payload.executionId, result.executionId);
});

test("duplicate idempotency key does not execute second time with repository", () => {
  resetExecutionDispatcherState();
  const repository = new InMemoryApprovalExecutionLogRepository();
  const first = dispatchApprovedAction(baseRequest({ idempotencyKey: "idem_repo_dup" }), { repository });
  const second = dispatchApprovedAction(baseRequest({ idempotencyKey: "idem_repo_dup" }), { repository });

  assert.equal(first.status, "executed");
  assert.equal(second.status, "duplicate");
  assert.equal(second.executionId, first.executionId);
});

test("repository persistence failure returns failed status with reasons", () => {
  resetExecutionDispatcherState();
  const failingRepository: ApprovalExecutionLogRepository = {
    saveExecutionLog: () => {
      throw new Error("simulated_persistence_failure");
    },
    saveAuditEventDraft: (event) => event,
    saveTimelineEventDraft: (event) => event,
    findByIdempotencyKey: () => undefined,
    getExecutionLog: () => undefined
  };

  const result = dispatchApprovedAction(baseRequest({ idempotencyKey: "idem_repo_fail" }), {
    repository: failingRepository
  });
  assert.equal(result.status, "failed");
  assert.equal(result.ok, false);
  assert.ok(result.reasons.includes("execution_persistence_failed"));
});
