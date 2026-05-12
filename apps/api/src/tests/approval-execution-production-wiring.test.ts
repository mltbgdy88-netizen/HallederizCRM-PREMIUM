import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryPendingApprovalRepository, type PendingApprovalRequest } from "@hallederiz/domain";
import type {
  ExecuteApprovalWithOutboxBridgeResult,
  TransactionalApprovalExecutionRequest
} from "@hallederiz/database";
import {
  executeApprovedPendingApproval,
  type ApprovalBridgeTrigger
} from "../shared/approval-execution-runtime";
import type { RequestContext } from "../shared/request-context";

function contextFixture(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    tenantId: "tenant_1",
    userId: "user_admin",
    persistenceMode: "demo",
    isAuthenticated: true,
    ...overrides
  };
}

function bridgeFixture(
  request: TransactionalApprovalExecutionRequest,
  overrides: Partial<ExecuteApprovalWithOutboxBridgeResult> = {}
): ExecuteApprovalWithOutboxBridgeResult {
  const executionId = `exec_${request.approvalRequestId}`;
  return {
    ok: true,
    status: "executed",
    executionResult: {
      ok: true,
      status: "executed",
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId,
      reasons: ["bridge_dispatched"],
      auditRequired: true,
      timelineRequired: true,
      idempotencyKey: request.idempotencyKey,
      handlerKey: `handler.${request.actionKey}`,
      handlerMode: "dry_run",
      executionLog: {
        executionId,
        tenantId: request.tenantId,
        approvalRequestId: request.approvalRequestId,
        actionKey: request.actionKey,
        actorId: request.actorId,
        approvedBy: request.approvedBy,
        status: "executed",
        mode: "dry_run",
        idempotencyKey: request.idempotencyKey,
        auditRequired: true,
        timelineRequired: true,
        reasons: ["bridge_dispatched"],
        createdAt: "2026-05-12T12:00:00.000Z",
        completedAt: "2026-05-12T12:00:01.000Z",
        handlerKey: `handler.${request.actionKey}`,
        handlerMode: "dry_run"
      },
      auditEvent: {
        eventKey: "approval.execution.audit",
        eventId: `audit_${executionId}`,
        createdAt: "2026-05-12T12:00:01.000Z",
        payload: {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId,
          status: "executed",
          idempotencyKey: request.idempotencyKey,
          handlerKey: `handler.${request.actionKey}`,
          handlerMode: "dry_run",
          reasons: ["bridge_dispatched"]
        }
      },
      timelineEvent: {
        eventKey: "approval.execution.timeline",
        eventId: `timeline_${executionId}`,
        createdAt: "2026-05-12T12:00:01.000Z",
        payload: {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId,
          status: "executed",
          idempotencyKey: request.idempotencyKey,
          handlerKey: `handler.${request.actionKey}`,
          handlerMode: "dry_run",
          reasons: ["bridge_dispatched"]
        }
      },
      persistenceMode: "repository",
      persistenceSkipped: false
    },
    executionLogPersisted: true,
    auditEventPersisted: true,
    timelineEventPersisted: true,
    outboxJobEnqueued: true,
    outboxDuplicate: false,
    outboxJob: {
      jobId: `job_${request.approvalRequestId}`,
      tenantId: request.tenantId,
      jobType: "approval.execution.dispatch",
      actionKey: request.actionKey,
      payload: {
        tenantId: request.tenantId,
        actionKey: request.actionKey,
        approvalRequestId: request.approvalRequestId,
        executionId,
        auditTimelineWritebackPayload: {
          tenantId: request.tenantId,
          actionKey: request.actionKey,
          approvalRequestId: request.approvalRequestId,
          executionId,
          idempotencyKey: request.idempotencyKey,
          auditEvent: {
            eventId: `audit_${executionId}`,
            eventKey: "approval.execution.audit"
          },
          timelineEvent: {
            eventId: `timeline_${executionId}`,
            eventKey: "approval.execution.timeline"
          }
        }
      },
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: `approval_outbox:${request.idempotencyKey}`,
      availableAt: "2026-05-12T12:00:01.000Z",
      createdAt: "2026-05-12T12:00:01.000Z",
      updatedAt: "2026-05-12T12:00:01.000Z"
    },
    outboxJobId: `job_${request.approvalRequestId}`,
    transactionMode: "transaction",
    persistenceMode: "repository",
    auditTimelineWritebackPayload: {
      tenantId: request.tenantId,
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId,
      idempotencyKey: request.idempotencyKey,
      auditEvent: {
        eventId: `audit_${executionId}`,
        eventKey: "approval.execution.audit"
      },
      timelineEvent: {
        eventId: `timeline_${executionId}`,
        eventKey: "approval.execution.timeline"
      }
    },
    auditTimelineWritebackQueued: true,
    reasons: ["bridge_completed"],
    ...overrides
  };
}

function createPendingApproval(repository: InMemoryPendingApprovalRepository, overrides: Partial<PendingApprovalRequest> = {}) {
  return repository.createPendingApprovalRequest({
    tenantId: "tenant_1",
    actorId: "user_requester",
    actionKey: "platform.users.create",
    reasons: ["critical_mutation_requires_approval"],
    payload: {
      tenantId: "tenant_1",
      actionKey: "platform.users.create"
    },
    idempotencyKey: "idem_apr_1",
    approvalRequestId: "apr_req_1",
    requestedAt: "2026-05-12T11:59:00.000Z",
    ...overrides
  });
}

test("executeApprovedPendingApproval export is callable", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);
  const result = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: async (_context, request) => bridgeFixture(request)
  });
  assert.equal(typeof executeApprovedPendingApproval, "function");
  assert.equal(result.ok, true);
});

test("approve runtime resolves pending approval and returns execution/outbox metadata", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);
  let calls = 0;
  const trigger: ApprovalBridgeTrigger = async (_context, request) => {
    calls += 1;
    return bridgeFixture(request);
  };

  const result = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: trigger
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, "approved");
  assert.equal(result.executionId, `exec_${pending.approvalRequestId}`);
  assert.equal(result.outboxJobId, `job_${pending.approvalRequestId}`);
  assert.equal(result.outboxQueued, true);
  assert.equal(result.auditTimelineWritebackQueued, true);
  assert.ok(result.auditTimelinePayload);
  assert.ok(typeof result.auditEventId === "string");
  assert.ok(typeof result.timelineEventId === "string");
  assert.equal(result.workerProcessingRecommended, true);
  assert.equal(calls, 1);

  const updated = repository.getPendingApprovalRequest(pending.approvalRequestId, pending.tenantId);
  assert.equal(updated?.status, "approved");
});

test("duplicate approve is idempotent and does not call bridge again", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);
  let calls = 0;
  const trigger: ApprovalBridgeTrigger = async (_context, request) => {
    calls += 1;
    return bridgeFixture(request);
  };

  const first = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: trigger
  });
  const second = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: trigger
  });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.duplicate, true);
  assert.equal(second.status, "already_approved");
  assert.equal(calls, 1);
});

test("rejected approval cannot be approved", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);
  const rejected = repository.markPendingApprovalRejected({
    approvalRequestId: pending.approvalRequestId,
    tenantId: pending.tenantId,
    rejectedBy: "user_admin",
    reason: "manual_reject"
  });
  assert.equal(rejected.ok, true);

  const result = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: async (_context, request) => bridgeFixture(request)
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "rejected");
  assert.equal(result.httpStatus, 409);
});

test("bridge failure keeps approval pending", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);

  const result = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: async (_context, request) =>
      bridgeFixture(request, {
        ok: false,
        status: "failed",
        executionResult: undefined,
        outboxJobEnqueued: false,
        outboxDuplicate: false,
        reasons: ["bridge_failed_for_test"]
      })
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "bridge_failed");
  const current = repository.getPendingApprovalRequest(pending.approvalRequestId, pending.tenantId);
  assert.equal(current?.status, "pending");
});

test("tenant mismatch fails closed and returns not_found", async () => {
  const repository = new InMemoryPendingApprovalRepository();
  const pending = createPendingApproval(repository);

  const result = await executeApprovedPendingApproval({
    context: contextFixture({ tenantId: "tenant_2" }),
    approvalRequestId: pending.approvalRequestId,
    approverId: "user_admin",
    repositoryResolution: { repository, mode: "memory", reasons: [] },
    bridgeTrigger: async (_context, request) => bridgeFixture(request)
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "not_found");
  assert.equal(result.httpStatus, 404);
});

test("unsupported repository never fail-opens", async () => {
  const result = await executeApprovedPendingApproval({
    context: contextFixture(),
    approvalRequestId: "apr_missing",
    approverId: "user_admin",
    repositoryResolution: {
      repository: null,
      mode: "unsupported",
      reasons: ["pending_approval_memory_fallback_forbidden_in_production"]
    },
    bridgeTrigger: async (_context, request) => bridgeFixture(request)
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "repository_unavailable");
  assert.equal(result.httpStatus, 503);
});
