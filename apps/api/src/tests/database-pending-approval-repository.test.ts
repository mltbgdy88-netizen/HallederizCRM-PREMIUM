import assert from "node:assert/strict";
import test from "node:test";
import {
  DatabasePendingApprovalRepository,
  mapPendingApprovalDomainRecordToSqlParams,
  mapPendingApprovalRowToDomainRecord,
  type DbPendingApprovalRequestRecord,
  type QueryExecutor,
  type QueryResultRow
} from "@hallederiz/database";

class FakeQueryExecutor implements QueryExecutor {
  public readonly calls: Array<{ sql: string; params?: unknown[] }> = [];

  constructor(
    private readonly handler: (sql: string, params: unknown[] | undefined) => Promise<QueryResultRow[]>
  ) {}

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
    this.calls.push({ sql, params });
    const rows = await this.handler(sql, params);
    return rows as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return operation(this);
  }
}

function samplePendingApproval(overrides: Partial<DbPendingApprovalRequestRecord> = {}): DbPendingApprovalRequestRecord {
  return {
    id: "apr_row_1",
    tenantId: "tenant_1",
    approvalRequestId: "apr_req_1",
    actionKey: "platform.users.create",
    actorId: "user_1",
    status: "pending",
    reasons: ["critical_mutation_requires_approval"],
    payload: { email: "approval@hallederiz.com" },
    idempotencyKey: "apr_idem_1",
    requestedBy: "user_1",
    createdAt: "2026-05-12T12:00:00.000Z",
    updatedAt: "2026-05-12T12:00:00.000Z",
    ...overrides
  };
}

test("pending approval DB repository adapter export is available", () => {
  const repository = new DatabasePendingApprovalRepository({
    executor: new FakeQueryExecutor(async () => []),
    persistenceMode: "postgres"
  });
  assert.equal(typeof repository.createPendingApprovalRequest, "function");
  assert.equal(typeof repository.getPendingApprovalRequest, "function");
  assert.equal(typeof repository.listPendingApprovalRequests, "function");
  assert.equal(typeof repository.markPendingApprovalApproved, "function");
  assert.equal(typeof repository.markPendingApprovalRejected, "function");
  assert.equal(typeof repository.findByIdempotencyKey, "function");
});

test("pending approval DB repository fails closed when persistence mode is not postgres", async () => {
  const repository = new DatabasePendingApprovalRepository({
    executor: new FakeQueryExecutor(async () => []),
    persistenceMode: "demo"
  });
  await assert.rejects(() => repository.listPendingApprovalRequests("tenant_1"), /db_repository_postgres_mode_required/);
});

test("pending approval DB repository validates tenant/idempotency fields", async () => {
  const repository = new DatabasePendingApprovalRepository({
    executor: new FakeQueryExecutor(async () => []),
    persistenceMode: "postgres"
  });
  await assert.rejects(() => repository.findByIdempotencyKey("", "idem"), /missing_tenant_id/);
  await assert.rejects(() => repository.findByIdempotencyKey("tenant_1", ""), /missing_idempotency_key/);
});

test("pending approval mapper helpers preserve key metadata", () => {
  const params = mapPendingApprovalDomainRecordToSqlParams(samplePendingApproval());
  assert.equal(params[1], "tenant_1");
  assert.equal(params[2], "apr_req_1");
  assert.equal(params[3], "platform.users.create");
  assert.equal(params[8], "apr_idem_1");

  const row = {
    id: "apr_row_1",
    tenant_id: "tenant_1",
    approval_request_id: "apr_req_1",
    action_key: "platform.users.create",
    actor_id: "user_1",
    status: "pending",
    reasons: ["critical_mutation_requires_approval"],
    payload: { email: "approval@hallederiz.com" },
    idempotency_key: "apr_idem_1",
    requested_by: "user_1",
    approved_by: null,
    rejected_by: null,
    reject_reason: null,
    created_at: "2026-05-12T12:00:00.000Z",
    updated_at: "2026-05-12T12:00:00.000Z",
    approved_at: null,
    rejected_at: null,
    expires_at: null
  } as const;
  const mapped = mapPendingApprovalRowToDomainRecord(row);
  assert.equal(mapped.tenantId, "tenant_1");
  assert.equal(mapped.actionKey, "platform.users.create");
  assert.equal(mapped.approvalRequestId, "apr_req_1");
  assert.equal(mapped.idempotencyKey, "apr_idem_1");
});

test("pending approval create uses tenant-scoped idempotency lookup before insert", async () => {
  const executor = new FakeQueryExecutor(async (sql) => {
    if (sql.includes("FROM pending_approval_requests") && sql.includes("idempotency_key")) {
      return [];
    }
    if (sql.includes("INSERT INTO pending_approval_requests")) {
      return [
        {
          id: "apr_row_1",
          tenant_id: "tenant_1",
          approval_request_id: "apr_req_1",
          action_key: "platform.users.create",
          actor_id: "user_1",
          status: "pending",
          reasons: ["critical_mutation_requires_approval"],
          payload: { email: "approval@hallederiz.com" },
          idempotency_key: "apr_idem_1",
          requested_by: "user_1",
          approved_by: null,
          rejected_by: null,
          reject_reason: null,
          created_at: "2026-05-12T12:00:00.000Z",
          updated_at: "2026-05-12T12:00:00.000Z",
          approved_at: null,
          rejected_at: null,
          expires_at: null
        }
      ];
    }
    return [];
  });

  const repository = new DatabasePendingApprovalRepository({
    executor,
    persistenceMode: "postgres"
  });
  const created = await repository.createPendingApprovalRequest(samplePendingApproval());
  assert.equal(created.approvalRequestId, "apr_req_1");

  const insertCall = executor.calls.find((call) => call.sql.includes("INSERT INTO pending_approval_requests"));
  assert.ok(insertCall);
  assert.ok(insertCall.sql.includes("ON CONFLICT (tenant_id, approval_request_id)"));
});
