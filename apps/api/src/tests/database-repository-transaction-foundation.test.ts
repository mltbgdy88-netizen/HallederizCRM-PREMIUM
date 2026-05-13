import assert from "node:assert/strict";
import test from "node:test";
import {
  DatabaseApprovalExecutionLogRepository,
  DatabaseOutboxJobRepository,
  createDatabaseTransactionRunner,
  mapExecutionLogEntryToSqlParams,
  mapExecutionLogRowToDomainRecord,
  mapOutboxDomainRecordToSqlParams,
  mapOutboxRowToDomainRecord,
  withDatabaseTransaction,
  writeApprovalExecutionInTransaction,
  type ApprovalExecutionAuditEventDraftRecord,
  type ApprovalExecutionLogEntryRecord,
  type ApprovalExecutionTimelineEventDraftRecord,
  type DbWorkerJobRecord,
  type QueryExecutor,
  type QueryResultRow
} from "@hallederiz/database";

class FakeQueryExecutor implements QueryExecutor {
  public readonly calls: Array<{ sql: string; params?: unknown[] }> = [];

  constructor(
    private readonly handler: (sql: string, params: unknown[] | undefined) => Promise<QueryResultRow[]>
  ) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]> {
    this.calls.push({ sql, params });
    const rows = await this.handler(sql, params);
    return rows as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    this.calls.push({ sql: "__transaction_begin__", params: [] });
    return operation(this);
  }
}

function sampleExecutionLog(overrides: Partial<ApprovalExecutionLogEntryRecord> = {}): ApprovalExecutionLogEntryRecord {
  return {
    executionId: "exec_1",
    tenantId: "tenant_1",
    approvalRequestId: "apr_1",
    actionKey: "platform.users.create",
    actorId: "actor_1",
    approvedBy: "approver_1",
    status: "executed",
    mode: "dry_run",
    idempotencyKey: "idem_exec_1",
    auditRequired: true,
    timelineRequired: true,
    reasons: ["ok"],
    createdAt: "2026-05-12T10:00:00.000Z",
    completedAt: "2026-05-12T10:01:00.000Z",
    handlerKey: "handler.platform.users.create",
    handlerMode: "dry_run",
    ...overrides
  };
}

function sampleAuditDraft(): ApprovalExecutionAuditEventDraftRecord {
  return {
    eventKey: "approval.execution.audit",
    createdAt: "2026-05-12T10:02:00.000Z",
    payload: {
      tenantId: "tenant_1",
      actionKey: "platform.users.create",
      approvalRequestId: "apr_1",
      executionId: "exec_1",
      status: "executed",
      idempotencyKey: "idem_exec_1",
      handlerKey: "handler.platform.users.create",
      handlerMode: "dry_run",
      reasons: ["ok"]
    }
  };
}

function sampleTimelineDraft(): ApprovalExecutionTimelineEventDraftRecord {
  return {
    eventKey: "approval.execution.timeline",
    createdAt: "2026-05-12T10:02:00.000Z",
    payload: {
      tenantId: "tenant_1",
      actionKey: "platform.users.create",
      approvalRequestId: "apr_1",
      executionId: "exec_1",
      status: "executed",
      idempotencyKey: "idem_exec_1",
      handlerKey: "handler.platform.users.create",
      handlerMode: "dry_run",
      reasons: ["ok"]
    }
  };
}

function sampleOutboxJob(overrides: Partial<DbWorkerJobRecord> = {}): DbWorkerJobRecord {
  return {
    jobId: "job_1",
    tenantId: "tenant_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.users.create",
    payload: { foo: "bar" },
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "idem_job_1",
    availableAt: "2026-05-12T10:00:00.000Z",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T10:00:00.000Z",
    ...overrides
  };
}

test("transaction contract exports and executes wrapped operation", async () => {
  const executor = new FakeQueryExecutor(async () => []);
  const runner = createDatabaseTransactionRunner(executor);
  const output = await withDatabaseTransaction(executor, async () => "ok");
  const outputWithRunner = await runner.withTransaction(async () => "ok_runner");
  assert.equal(output, "ok");
  assert.equal(outputWithRunner, "ok_runner");
  assert.ok(executor.calls.some((call) => call.sql === "__transaction_begin__"));
});

test("approval execution repository exposes expected contract methods", () => {
  const executor = new FakeQueryExecutor(async () => []);
  const repository = new DatabaseApprovalExecutionLogRepository({
    executor,
    persistenceMode: "postgres"
  });
  assert.equal(typeof repository.saveExecutionLog, "function");
  assert.equal(typeof repository.saveAuditEventDraft, "function");
  assert.equal(typeof repository.saveTimelineEventDraft, "function");
  assert.equal(typeof repository.findByIdempotencyKey, "function");
  assert.equal(typeof repository.getExecutionLog, "function");
});

test("outbox repository exposes expected contract methods", () => {
  const executor = new FakeQueryExecutor(async () => []);
  const repository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "postgres"
  });
  assert.equal(typeof repository.enqueue, "function");
  assert.equal(typeof repository.claimNext, "function");
  assert.equal(typeof repository.complete, "function");
  assert.equal(typeof repository.fail, "function");
  assert.equal(typeof repository.moveToDeadLetter, "function");
  assert.equal(typeof repository.findByIdempotencyKey, "function");
  assert.equal(typeof repository.listJobs, "function");
});

test("tenantId and idempotency validation fails for missing values", async () => {
  const executor = new FakeQueryExecutor(async () => []);
  const approvalRepository = new DatabaseApprovalExecutionLogRepository({
    executor,
    persistenceMode: "postgres"
  });
  await assert.rejects(
    () => approvalRepository.findByIdempotencyKey("", "idem"),
    /missing_tenant_id/
  );
  await assert.rejects(
    () => approvalRepository.findByIdempotencyKey("tenant", ""),
    /missing_idempotency_key/
  );

  const outboxRepository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "postgres"
  });
  await assert.rejects(
    () => outboxRepository.findByIdempotencyKey("", "idem"),
    /missing_tenant_id/
  );
  await assert.rejects(
    () => outboxRepository.findByIdempotencyKey("tenant", ""),
    /missing_idempotency_key/
  );
});

test("repositories fail-closed when persistence mode is not postgres", async () => {
  const executor = new FakeQueryExecutor(async () => []);
  const approvalRepository = new DatabaseApprovalExecutionLogRepository({
    executor,
    persistenceMode: "demo"
  });
  const outboxRepository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "demo"
  });
  await assert.rejects(
    () => approvalRepository.saveExecutionLog(sampleExecutionLog()),
    /db_repository_postgres_mode_required/
  );
  await assert.rejects(
    () => outboxRepository.enqueue(sampleOutboxJob()),
    /db_repository_postgres_mode_required/
  );
});

test("execution log mapping helpers preserve key metadata", () => {
  const entry = sampleExecutionLog();
  const params = mapExecutionLogEntryToSqlParams(entry);
  assert.equal(params[0], "exec_1");
  assert.equal(params[1], "tenant_1");
  assert.equal(params[8], "idem_exec_1");

  const row = {
    id: "exec_1",
    tenant_id: "tenant_1",
    approval_request_id: "apr_1",
    action_key: "platform.users.create",
    actor_id: "actor_1",
    approved_by: "approver_1",
    status: "executed",
    mode: "dry_run",
    idempotency_key: "idem_exec_1",
    audit_required: true,
    timeline_required: true,
    reasons: ["ok"],
    created_at: "2026-05-12T10:00:00.000Z",
    completed_at: "2026-05-12T10:01:00.000Z",
    handler_key: "handler.platform.users.create",
    handler_mode: "dry_run"
  } as const;
  const mapped = mapExecutionLogRowToDomainRecord(row);
  assert.equal(mapped.tenantId, "tenant_1");
  assert.equal(mapped.idempotencyKey, "idem_exec_1");
  assert.equal(mapped.actionKey, "platform.users.create");
});

test("outbox mapping helpers preserve tenant and idempotency", () => {
  const job = sampleOutboxJob();
  const params = mapOutboxDomainRecordToSqlParams(job);
  assert.equal(params[1], "tenant_1");
  assert.equal(params[8], "idem_job_1");

  const row = {
    id: "job_1",
    tenant_id: "tenant_1",
    job_type: "approval.execution.dispatch",
    action_key: "platform.users.create",
    payload: { foo: "bar" },
    status: "pending",
    attempts: 0,
    max_attempts: 3,
    idempotency_key: "idem_job_1",
    available_at: "2026-05-12T10:00:00.000Z",
    created_at: "2026-05-12T10:00:00.000Z",
    updated_at: "2026-05-12T10:00:00.000Z",
    last_error: null,
    dead_letter_reason: null,
    locked_at: null,
    locked_by: null,
    lease_expires_at: null
  } as const;
  const mapped = mapOutboxRowToDomainRecord(row);
  assert.equal(mapped.tenantId, "tenant_1");
  assert.equal(mapped.idempotencyKey, "idem_job_1");
});

test("outbox enqueue SQL contract keeps duplicate idempotency guard", async () => {
  const executor = new FakeQueryExecutor(async (sql) => {
    if (sql.includes("INSERT INTO outbox_jobs")) {
      return [
        {
          id: "job_1",
          tenant_id: "tenant_1",
          job_type: "approval.execution.dispatch",
          action_key: "platform.users.create",
          payload: { foo: "bar" },
          status: "pending",
          attempts: 0,
          max_attempts: 3,
          idempotency_key: "idem_job_1",
          available_at: "2026-05-12T10:00:00.000Z",
          created_at: "2026-05-12T10:00:00.000Z",
          updated_at: "2026-05-12T10:00:00.000Z",
          last_error: null,
          dead_letter_reason: null,
          locked_at: null,
          locked_by: null,
          lease_expires_at: null
        }
      ];
    }
    return [];
  });
  const repository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "postgres"
  });
  await repository.enqueue(sampleOutboxJob());

  const insertCall = executor.calls.find((call) => call.sql.includes("INSERT INTO outbox_jobs"));
  assert.ok(insertCall);
  assert.ok(insertCall.sql.includes("ON CONFLICT (tenant_id, idempotency_key)"));
});

test("transaction write helper keeps execution + audit + timeline in one boundary", async () => {
  const executor = new FakeQueryExecutor(async (sql) => {
    if (sql.includes("INSERT INTO approval_execution_logs")) {
      return [
        {
          id: "exec_1",
          tenant_id: "tenant_1",
          approval_request_id: "apr_1",
          action_key: "platform.users.create",
          actor_id: "actor_1",
          approved_by: "approver_1",
          status: "executed",
          mode: "dry_run",
          idempotency_key: "idem_exec_1",
          audit_required: true,
          timeline_required: true,
          reasons: ["ok"],
          created_at: "2026-05-12T10:00:00.000Z",
          completed_at: "2026-05-12T10:01:00.000Z",
          handler_key: "handler.platform.users.create",
          handler_mode: "dry_run"
        }
      ];
    }
    return [];
  });
  const repository = new DatabaseApprovalExecutionLogRepository({
    executor,
    persistenceMode: "postgres"
  });
  const runner = createDatabaseTransactionRunner(executor);
  const persisted = await writeApprovalExecutionInTransaction(runner, repository, {
    executionLog: sampleExecutionLog(),
    auditEvent: sampleAuditDraft(),
    timelineEvent: sampleTimelineDraft()
  });

  assert.equal(persisted.executionLog.executionId, "exec_1");
  assert.equal(persisted.auditEvent?.payload.tenantId, "tenant_1");
  assert.equal(persisted.timelineEvent?.payload.approvalRequestId, "apr_1");
  assert.ok(executor.calls.some((call) => call.sql === "__transaction_begin__"));
});
