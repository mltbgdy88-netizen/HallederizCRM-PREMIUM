import assert from "node:assert/strict";
import test from "node:test";
import {
  DatabaseOutboxJobRepository,
  FoundationOutboxClaimSimulator,
  OUTBOX_ATOMIC_CLAIM_FOUNDATION_METADATA,
  buildClaimNextOutboxJobSql,
  calculateLeaseExpiresAt,
  isOutboxJobClaimEligible,
  mapClaimedOutboxJobRow,
  mapOutboxClaimLeaseParams,
  normalizeOutboxClaimLeaseOptions,
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
    return operation(this);
  }
}

const sampleClaimedRow = {
  id: "job_atomic_1",
  tenant_id: "tenant_atomic_1",
  job_type: "approval.execution.dispatch",
  action_key: "platform.users.create",
  payload: { tenantId: "tenant_atomic_1" },
  status: "claimed" as const,
  attempts: 1,
  max_attempts: 3,
  idempotency_key: "idem_atomic_1",
  available_at: "2026-05-12T10:00:00.000Z",
  created_at: "2026-05-12T10:00:00.000Z",
  updated_at: "2026-05-12T10:00:00.000Z",
  last_error: null,
  dead_letter_reason: null,
  locked_at: "2026-05-12T10:00:00.000Z",
  locked_by: "worker_atomic_A",
  lease_expires_at: "2026-05-12T10:01:00.000Z"
};

test("DB outbox atomic claim helpers are exported", () => {
  assert.equal(typeof buildClaimNextOutboxJobSql, "function");
  assert.equal(typeof mapClaimedOutboxJobRow, "function");
  assert.equal(typeof calculateLeaseExpiresAt, "function");
  assert.equal(typeof isOutboxJobClaimEligible, "function");
  assert.equal(typeof FoundationOutboxClaimSimulator, "function");
  assert.equal(OUTBOX_ATOMIC_CLAIM_FOUNDATION_METADATA.productionDistributedLock, false);
  assert.equal(OUTBOX_ATOMIC_CLAIM_FOUNDATION_METADATA.usesPostgresSkipLocked, true);
});

test("claim SQL contract targets only available pending or failed jobs", () => {
  const sql = buildClaimNextOutboxJobSql();
  assert.ok(sql.includes("status IN ('pending', 'failed')"));
  assert.ok(sql.includes("available_at <= $1::timestamptz"));
  assert.ok(sql.includes("FOR UPDATE SKIP LOCKED"));
});

test("claim SQL contract includes unlocked or expired lease predicate", () => {
  const sql = buildClaimNextOutboxJobSql();
  assert.ok(sql.includes("lease_expires_at IS NULL OR lease_expires_at <= $1::timestamptz"));
});

test("active lease blocks claim eligibility contract", () => {
  const now = "2026-05-12T12:00:00.000Z";
  const params = mapOutboxClaimLeaseParams(now, { workerId: "worker_A", claimLeaseMs: 60_000 });
  assert.equal(
    isOutboxJobClaimEligible({
      status: "pending",
      availableAt: "2026-05-12T11:00:00.000Z",
      leaseExpiresAt: "2026-05-12T12:00:30.000Z",
      nowIso: params.nowIso
    }),
    false
  );
});

test("expired lease becomes claimable again", () => {
  const now = "2026-05-12T12:00:00.000Z";
  const params = mapOutboxClaimLeaseParams(now, { workerId: "worker_A", claimLeaseMs: 60_000 });
  assert.equal(
    isOutboxJobClaimEligible({
      status: "failed",
      availableAt: "2026-05-12T11:00:00.000Z",
      leaseExpiresAt: "2026-05-12T11:59:00.000Z",
      nowIso: params.nowIso
    }),
    true
  );
});

test("claimed row mapping preserves worker lease metadata", () => {
  const claimLeaseMs = 45_000;
  const mapped = mapClaimedOutboxJobRow(sampleClaimedRow, claimLeaseMs);
  assert.equal(mapped.lockedBy, "worker_atomic_A");
  assert.equal(mapped.lockedAt, "2026-05-12T10:00:00.000Z");
  assert.equal(mapped.leaseExpiresAt, "2026-05-12T10:01:00.000Z");
});

test("claimLeaseMs drives leaseExpiresAt calculation", () => {
  const lockedAt = "2026-05-12T10:00:00.000Z";
  const claimLeaseMs = 30_000;
  assert.equal(calculateLeaseExpiresAt(lockedAt, claimLeaseMs), "2026-05-12T10:00:30.000Z");
});

test("DB outbox repository does not fail-open when persistence mode is not postgres", async () => {
  const executor = new FakeQueryExecutor(async () => [sampleClaimedRow]);
  const repository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "demo"
  });
  await assert.rejects(
    () => repository.claimNext("2026-05-12T10:00:00.000Z", { workerId: "worker_demo", claimLeaseMs: 60_000 }),
    /db_repository_postgres_mode_required/
  );
  assert.equal(executor.calls.length, 0);
});

test("foundation concurrent claim simulation does not assign same job twice", () => {
  const now = "2026-05-12T12:00:00.000Z";
  const simulator = new FoundationOutboxClaimSimulator([
    {
      jobId: "job_concurrent_1",
      status: "pending",
      availableAt: "2026-05-12T11:00:00.000Z"
    }
  ]);
  const first = simulator.claimNext(now, { workerId: "worker_A", claimLeaseMs: 60_000 });
  const second = simulator.claimNext(now, { workerId: "worker_B", claimLeaseMs: 60_000 });
  assert.equal(first?.lockedBy, "worker_A");
  assert.equal(second, undefined);
});

test("database claimNext uses atomic claim SQL and maps lease metadata", async () => {
  const executor = new FakeQueryExecutor(async () => [sampleClaimedRow]);
  const repository = new DatabaseOutboxJobRepository({
    executor,
    persistenceMode: "postgres"
  });
  const claimOptions = normalizeOutboxClaimLeaseOptions({
    workerId: "worker_atomic_A",
    claimLeaseMs: 60_000
  });
  const claimed = await repository.claimNext("2026-05-12T10:00:00.000Z", claimOptions);
  const claimCall = executor.calls[0];
  assert.ok(claimCall);
  assert.equal(claimCall.sql, buildClaimNextOutboxJobSql());
  assert.equal(claimCall.params?.[1], "worker_atomic_A");
  assert.equal(claimed?.lockedBy, "worker_atomic_A");
  assert.equal(claimed?.leaseExpiresAt, calculateLeaseExpiresAt("2026-05-12T10:00:00.000Z", 60_000));
});
