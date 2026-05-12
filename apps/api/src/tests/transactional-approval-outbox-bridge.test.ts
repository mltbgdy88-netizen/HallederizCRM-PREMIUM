import assert from "node:assert/strict";
import test from "node:test";
import {
  executeApprovalWithOutboxBridge,
  type ApprovalExecutionAuditEventDraftRecord,
  type ApprovalExecutionLogEntryRecord,
  type ApprovalExecutionTimelineEventDraftRecord,
  type DatabaseTransactionRunner,
  type DbWorkerJobRecord,
  type ExecuteApprovalWithOutboxBridgeOptions,
  type TransactionalApprovalExecutionRequest,
  type TransactionalApprovalExecutionResult,
  type TransactionalApprovalExecutionLogRepositoryContract,
  type TransactionalOutboxRepositoryContract
} from "@hallederiz/database";

class FakeTransactionRunner implements DatabaseTransactionRunner {
  public calls = 0;
  async withTransaction<T>(operation: (context: DatabaseTransactionContext) => Promise<T>): Promise<T> {
    this.calls += 1;
    return operation({
      executor: {
        query: async () => [],
        transaction: async (nestedOperation) =>
          nestedOperation({
            query: async () => [],
            transaction: async (nextOperation) =>
              nextOperation({
                query: async () => [],
                transaction: async (lastOperation) =>
                  lastOperation({
                    query: async () => [],
                    transaction: async () => {
                      throw new Error("nested_transaction_not_supported_in_fake_runner");
                    }
                  })
              })
          })
      }
    });
  }
}

class FakeApprovalExecutionRepository implements TransactionalApprovalExecutionLogRepositoryContract {
  public logs: ApprovalExecutionLogEntryRecord[] = [];
  public auditEvents: ApprovalExecutionAuditEventDraftRecord[] = [];
  public timelineEvents: ApprovalExecutionTimelineEventDraftRecord[] = [];
  public failOn: "execution" | "audit" | "timeline" | undefined;

  async saveExecutionLog(entry: ApprovalExecutionLogEntryRecord): Promise<ApprovalExecutionLogEntryRecord> {
    if (this.failOn === "execution") {
      throw new Error("execution_repo_failure");
    }
    this.logs.push(entry);
    return entry;
  }

  async saveAuditEventDraft(
    event: ApprovalExecutionAuditEventDraftRecord
  ): Promise<ApprovalExecutionAuditEventDraftRecord> {
    if (this.failOn === "audit") {
      throw new Error("audit_repo_failure");
    }
    this.auditEvents.push(event);
    return event;
  }

  async saveTimelineEventDraft(
    event: ApprovalExecutionTimelineEventDraftRecord
  ): Promise<ApprovalExecutionTimelineEventDraftRecord> {
    if (this.failOn === "timeline") {
      throw new Error("timeline_repo_failure");
    }
    this.timelineEvents.push(event);
    return event;
  }
}

class FakeOutboxRepository implements TransactionalOutboxRepositoryContract {
  public jobs = new Map<string, DbWorkerJobRecord>();
  public failOnEnqueue = false;

  private key(tenantId: string, idempotencyKey: string) {
    return `${tenantId}:${idempotencyKey}`;
  }

  async enqueue(job: DbWorkerJobRecord): Promise<DbWorkerJobRecord> {
    if (this.failOnEnqueue) {
      throw new Error("outbox_enqueue_failure");
    }
    const composite = this.key(job.tenantId, job.idempotencyKey);
    const existing = this.jobs.get(composite);
    if (existing) {
      return existing;
    }
    this.jobs.set(composite, job);
    return job;
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<DbWorkerJobRecord | undefined> {
    return this.jobs.get(this.key(tenantId, idempotencyKey));
  }
}

function requestFixture(
  overrides: Partial<TransactionalApprovalExecutionRequest> = {}
): TransactionalApprovalExecutionRequest {
  return {
    tenantId: "tenant_bridge_1",
    approvalRequestId: "apr_bridge_1",
    actionKey: "platform.users.create",
    actorId: "actor_bridge_1",
    approvedBy: "approver_bridge_1",
    payload: { source: "test" },
    idempotencyKey: "idem_bridge_1",
    requestedAt: "2026-05-12T11:00:00.000Z",
    approvedAt: "2026-05-12T11:01:00.000Z",
    ...overrides
  };
}

function dispatchedResultFixture(
  request: TransactionalApprovalExecutionRequest,
  overrides: Partial<TransactionalApprovalExecutionResult> = {}
): TransactionalApprovalExecutionResult {
  const executionLog: ApprovalExecutionLogEntryRecord = {
    executionId: "exec_bridge_1",
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
    reasons: ["dry_run_foundation"],
    createdAt: "2026-05-12T11:01:30.000Z",
    completedAt: "2026-05-12T11:01:31.000Z",
    handlerKey: "handler.platform.users.create",
    handlerMode: "dry_run"
  };
  const auditEvent: ApprovalExecutionAuditEventDraftRecord = {
    eventKey: "approval.execution.audit",
    createdAt: "2026-05-12T11:01:31.000Z",
    payload: {
      tenantId: request.tenantId,
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId: executionLog.executionId,
      status: "executed",
      idempotencyKey: request.idempotencyKey,
      handlerKey: executionLog.handlerKey,
      handlerMode: executionLog.handlerMode,
      reasons: executionLog.reasons
    }
  };
  const timelineEvent: ApprovalExecutionTimelineEventDraftRecord = {
    eventKey: "approval.execution.timeline",
    createdAt: "2026-05-12T11:01:31.000Z",
    payload: {
      tenantId: request.tenantId,
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId: executionLog.executionId,
      status: "executed",
      idempotencyKey: request.idempotencyKey,
      handlerKey: executionLog.handlerKey,
      handlerMode: executionLog.handlerMode,
      reasons: executionLog.reasons
    }
  };
  return {
    ok: true,
    status: "executed",
    actionKey: request.actionKey,
    approvalRequestId: request.approvalRequestId,
    executionId: executionLog.executionId,
    reasons: ["handler_executed", "no_real_mutation_executed"],
    auditRequired: true,
    timelineRequired: true,
    idempotencyKey: request.idempotencyKey,
    handlerKey: executionLog.handlerKey,
    handlerMode: executionLog.handlerMode,
    executionLog,
    auditEvent,
    timelineEvent,
    persistenceMode: "none",
    persistenceSkipped: true,
    ...overrides
  };
}

function baseOptions(
  request: TransactionalApprovalExecutionRequest
): ExecuteApprovalWithOutboxBridgeOptions & {
  runner: FakeTransactionRunner;
  approvalRepository: FakeApprovalExecutionRepository;
  outboxRepository: FakeOutboxRepository;
} {
  const runner = new FakeTransactionRunner();
  const approvalRepository = new FakeApprovalExecutionRepository();
  const outboxRepository = new FakeOutboxRepository();
  return {
    runner,
    approvalRepository,
    dispatchApprovedAction: async (input) => dispatchedResultFixture(input),
    transactionRunner: runner,
    approvalExecutionRepository: approvalRepository,
    outboxRepository: outboxRepository
  };
}

test("bridge export is callable", async () => {
  const request = requestFixture();
  const opts = baseOptions(request);
  const result = await executeApprovalWithOutboxBridge(request, opts);
  assert.equal(typeof executeApprovalWithOutboxBridge, "function");
  assert.equal(result.ok, true);
});

test("missing repositories does not fail-open", async () => {
  const request = requestFixture();
  const result = await executeApprovalWithOutboxBridge(request, {
    dispatchApprovedAction: async (input) => dispatchedResultFixture(input),
    transactionRunner: new FakeTransactionRunner()
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "unsupported");
  assert.ok(result.reasons.includes("missing_bridge_repositories"));
});

test("missing transaction runner returns explicit unsupported", async () => {
  const request = requestFixture();
  const result = await executeApprovalWithOutboxBridge(request, {
    dispatchApprovedAction: async (input) => dispatchedResultFixture(input)
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "unsupported");
  assert.ok(result.reasons.includes("missing_transaction_runner"));
});

test("successful dry_run dispatch persists execution/audit/timeline and enqueues outbox", async () => {
  const request = requestFixture();
  const opts = baseOptions(request);
  const result = await executeApprovalWithOutboxBridge(request, opts);

  assert.equal(result.ok, true);
  assert.equal(result.status, "executed");
  assert.equal(result.executionLogPersisted, true);
  assert.equal(result.auditEventPersisted, true);
  assert.equal(result.timelineEventPersisted, true);
  assert.equal(result.outboxJobEnqueued, true);
  assert.equal(result.outboxDuplicate, false);
  assert.equal(result.outboxJobId, result.outboxJob?.jobId);
  assert.equal(result.transactionMode, "transaction");
  assert.equal(result.persistenceMode, "repository");
  assert.equal(opts.runner.calls, 1);
  assert.equal(opts.approvalRepository.logs.length, 1);
  assert.equal(opts.approvalRepository.auditEvents.length, 1);
  assert.equal(opts.approvalRepository.timelineEvents.length, 1);
  assert.ok(result.outboxJob);
  assert.equal(result.outboxJob?.payload.tenantId, request.tenantId);
  assert.equal(result.outboxJob?.payload.actionKey, request.actionKey);
  assert.equal(result.outboxJob?.payload.approvalRequestId, request.approvalRequestId);
  assert.equal(result.outboxJob?.payload.executionId, result.executionResult?.executionId);
});

test("duplicate idempotencyKey does not enqueue second outbox job", async () => {
  const request = requestFixture({ idempotencyKey: "idem_bridge_dup" });
  const opts = baseOptions(request);
  const first = await executeApprovalWithOutboxBridge(request, opts);
  const second = await executeApprovalWithOutboxBridge(request, opts);

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(second.outboxJobEnqueued, false);
  assert.equal(second.outboxDuplicate, true);
  assert.equal(opts.outboxRepository.jobs.size, 1);
});

test("repository failure returns failed and does not pretend success", async () => {
  const request = requestFixture({ idempotencyKey: "idem_bridge_repo_fail" });
  const opts = baseOptions(request);
  opts.approvalRepository.failOn = "timeline";
  const result = await executeApprovalWithOutboxBridge(request, opts);

  assert.equal(result.ok, false);
  assert.equal(result.status, "failed");
  assert.equal(result.executionLogPersisted, false);
  assert.equal(result.auditEventPersisted, false);
  assert.equal(result.timelineEventPersisted, false);
  assert.equal(result.outboxJobEnqueued, false);
  assert.ok(result.reasons.includes("transactional_bridge_failed"));
});
import type { DatabaseTransactionContext } from "@hallederiz/database";
