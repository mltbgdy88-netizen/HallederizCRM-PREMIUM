import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryOutboxJobRepository,
  createOutboxJob,
  processWorkerTick,
  registerWorkerJobHandler,
  resetWorkerJobHandlers
} from "@hallederiz/domain";
import {
  mapOutboxClaimLeaseParams,
  normalizeOutboxClaimLeaseOptions
} from "@hallederiz/database";

function baseJobInput(overrides: Partial<Parameters<typeof createOutboxJob>[1]> = {}) {
  return {
    tenantId: "tenant_worker_runtime_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.users.create",
    payload: {
      tenantId: "tenant_worker_runtime_1",
      actionKey: "platform.users.create",
      approvalRequestId: "apr_req_runtime_1",
      executionId: "exec_runtime_1",
      idempotencyKey: "idem_worker_runtime_1",
      auditRequired: true,
      timelineRequired: true,
      auditEvent: { eventKey: "approval.execution.audit" },
      timelineEvent: { eventKey: "approval.execution.timeline" }
    },
    idempotencyKey: "idem_worker_runtime_1",
    maxAttempts: 3,
    ...overrides
  };
}

test("processWorkerTick returns no_job when queue is empty", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const result = processWorkerTick(repository, { maxJobsPerTick: 2 });
  assert.equal(result.noJob, true);
  assert.equal(result.processed, 0);
  assert.equal(result.reasons.includes("no_job_available"), true);
});

test("pending available job is claimed with lease metadata and completed", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T10:00:00.000Z";
  createOutboxJob(repository, baseJobInput({ availableAt: now, idempotencyKey: "idem_claim_complete" }));

  const result = processWorkerTick(repository, {
    now,
    maxJobsPerTick: 1,
    lease: {
      workerId: "worker_runtime_A",
      claimLeaseMs: 60_000
    }
  });

  assert.equal(result.processed, 1);
  assert.equal(result.completed, 1);
  assert.equal(result.results[0]?.status, "completed");
  assert.equal(result.results[0]?.claimedJob?.lockedBy, "worker_runtime_A");
  assert.equal(result.results[0]?.claimedJob?.lockedAt, now);
});

test("approval.execution.dispatch handler runs dry_run and does not execute mutation/provider", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_dispatch_dry_run" }));

  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.results[0]?.status, "completed");
  const reasons = result.results[0]?.reasons ?? [];
  assert.equal(reasons.includes("mutation_executed:false"), true);
  assert.equal(reasons.includes("provider_call_executed:false"), true);
});

test("approval.execution.dispatch missing payload moves job to dead_letter as non-retryable", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(
    repository,
    baseJobInput({
      idempotencyKey: "idem_dispatch_invalid_payload",
      payload: {}
    })
  );

  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.results[0]?.status, "dead_letter");
  assert.equal(result.results[0]?.job?.deadLetterReason, "non_retryable_failure");
});

test("retryable failure increments attempts and pushes availableAt forward", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.runtime.retryable",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: true,
      reasons: ["transient_runtime_error"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T11:00:00.000Z";
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "custom.runtime.retryable",
      idempotencyKey: "idem_runtime_retryable",
      availableAt: now
    })
  );

  const result = processWorkerTick(repository, { now, baseRetryDelayMs: 1000, maxRetryDelayMs: 8000 });
  assert.equal(result.results[0]?.status, "failed");
  assert.equal(result.results[0]?.job?.attempts, 1);
  assert.equal((result.results[0]?.job?.availableAt ?? now) > now, true);
});

test("maxAttempts exceeded moves to dead_letter", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.runtime.max_attempts",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: true,
      reasons: ["temporary_error"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "custom.runtime.max_attempts",
      idempotencyKey: "idem_runtime_max",
      maxAttempts: 1
    })
  );

  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.results[0]?.status, "dead_letter");
  assert.equal(result.results[0]?.job?.deadLetterReason, "max_attempts_reached");
});

test("unknown handler does not fail-open and moves job to dead_letter", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "unknown.runtime.handler",
      idempotencyKey: "idem_runtime_unknown"
    })
  );

  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.results[0]?.status, "dead_letter");
  assert.equal(result.results[0]?.job?.deadLetterReason, "missing_worker_handler");
});

test("duplicate idempotency does not produce second execution", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_runtime_duplicate" }));
  const duplicate = createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_runtime_duplicate" }));

  assert.equal(duplicate.duplicate, true);
  assert.equal(repository.listJobs().length, 1);

  const firstTick = processWorkerTick(repository, { maxJobsPerTick: 1 });
  const secondTick = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(firstTick.processed, 1);
  assert.equal(secondTick.processed, 0);
});

test("DB outbox claim/lease helper exports are available", () => {
  const normalized = normalizeOutboxClaimLeaseOptions({
    workerId: "worker_db_test",
    claimLeaseMs: 30_000
  });
  assert.equal(normalized.workerId, "worker_db_test");
  assert.equal(normalized.claimLeaseMs, 30_000);

  const params = mapOutboxClaimLeaseParams("2026-05-12T12:00:00.000Z", normalized);
  assert.equal(params.workerId, "worker_db_test");
  assert.equal(params.nowIso, "2026-05-12T12:00:00.000Z");
  assert.equal(params.leaseExpiredBeforeIso < params.nowIso, true);
});
