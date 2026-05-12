import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryOutboxJobRepository,
  createOutboxJob,
  createWorkerRuntimeApp,
  processWorkerTick,
  registerWorkerJobHandler,
  resetWorkerJobHandlers
} from "@hallederiz/domain";

function baseJobInput(overrides: Partial<Parameters<typeof createOutboxJob>[1]> = {}) {
  return {
    tenantId: "tenant_worker_pack_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.users.create",
    payload: {
      tenantId: "tenant_worker_pack_1",
      actionKey: "platform.users.create",
      approvalRequestId: "apr_req_pack_1",
      executionId: "exec_pack_1"
    },
    idempotencyKey: "idem_worker_pack_1",
    maxAttempts: 3,
    ...overrides
  };
}

test("worker runtime app import does not start infinite loop", () => {
  const app = createWorkerRuntimeApp({ workerId: "worker_pack_idle" });
  assert.equal(app.workerId, "worker_pack_idle");
  assert.equal(typeof app.processTick, "function");
  assert.equal(typeof app.startOnce, "function");
  assert.equal(typeof app.dryRunHealthCheck, "function");
});

test("worker runtime process tick returns no_job on empty queue", () => {
  resetWorkerJobHandlers();
  const app = createWorkerRuntimeApp({ repository: new InMemoryOutboxJobRepository() });
  const result = app.processTick({ maxJobsPerTick: 1 });
  assert.equal(result.noJob, true);
  assert.equal(result.processed, 0);
  assert.equal(result.reasons.includes("no_job_available"), true);
});

test("worker runtime process tick claims and completes available job", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T13:00:00.000Z";
  createOutboxJob(repository, baseJobInput({ availableAt: now, idempotencyKey: "idem_pack_complete" }));
  const app = createWorkerRuntimeApp({ repository, workerId: "worker_pack_A" });

  const result = app.processTick({ now, maxJobsPerTick: 1, lease: { claimLeaseMs: 60_000 } });
  assert.equal(result.processed, 1);
  assert.equal(result.completed, 1);
  assert.equal(result.results[0]?.status, "completed");
  assert.equal(result.results[0]?.claimedJob?.lockedBy, "worker_pack_A");
});

test("worker runtime retryable failure produces retry metadata", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.pack.retryable",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: true,
      reasons: ["transient_pack_error"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T13:10:00.000Z";
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "custom.pack.retryable",
      idempotencyKey: "idem_pack_retryable",
      availableAt: now
    })
  );
  const app = createWorkerRuntimeApp({ repository });

  const result = app.processTick({ now, baseRetryDelayMs: 1000, maxRetryDelayMs: 8000 });
  assert.equal(result.failed, 1);
  assert.equal(result.results[0]?.status, "failed");
  assert.equal(result.results[0]?.job?.attempts, 1);
  assert.equal((result.results[0]?.job?.availableAt ?? now) > now, true);
});

test("worker runtime non_retryable failure moves job to dead_letter", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.pack.non_retryable",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: false,
      reasons: ["non_retryable_pack_error"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "custom.pack.non_retryable",
      idempotencyKey: "idem_pack_non_retryable"
    })
  );
  const app = createWorkerRuntimeApp({ repository });

  const result = app.processTick({ maxJobsPerTick: 1 });
  assert.equal(result.deadLettered, 1);
  assert.equal(result.results[0]?.status, "dead_letter");
  assert.equal(result.results[0]?.job?.deadLetterReason, "non_retryable_failure");
});

test("approval.execution.dispatch remains dry_run noop", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_pack_dispatch_dry_run" }));
  const app = createWorkerRuntimeApp({ repository });

  const result = app.processTick({ maxJobsPerTick: 1 });
  const reasons = result.results[0]?.reasons ?? [];
  assert.equal(result.completed, 1);
  assert.equal(reasons.includes("mutation_executed:false"), true);
  assert.equal(reasons.includes("provider_call_executed:false"), true);
});

test("worker runtime summary exposes metrics contract", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const app = createWorkerRuntimeApp({ repository, workerId: "worker_pack_metrics" });
  const tickResult = app.processTick({ maxJobsPerTick: 1 });
  const summary = app.buildSummary(tickResult, "foundation");

  assert.equal(summary.workerId, "worker_pack_metrics");
  assert.equal(summary.persistenceMode, "foundation_memory");
  assert.equal(summary.noJob, true);
  assert.equal(summary.retried, tickResult.failed);
});

test("legacy processWorkerTick contract remains available", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const result = processWorkerTick(repository, { maxJobsPerTick: 1 });
  assert.equal(result.noJob, true);
});
