import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryOutboxJobRepository,
  createOutboxJob,
  processNextJob,
  registerWorkerJobHandler,
  resetWorkerJobHandlers
} from "@hallederiz/domain";

function baseJobInput(overrides: Partial<Parameters<typeof createOutboxJob>[1]> = {}) {
  return {
    tenantId: "tenant_worker_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.users.create",
    payload: { source: "test" },
    idempotencyKey: "idem_worker_1",
    maxAttempts: 3,
    ...overrides
  };
}

test("job enqueue preserves tenant context", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const created = createOutboxJob(repository, baseJobInput());
  assert.equal(created.created, true);
  assert.equal(created.job.tenantId, "tenant_worker_1");
});

test("duplicate idempotency key does not create second job", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const first = createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_dup_worker" }));
  const second = createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_dup_worker" }));
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(second.duplicate, true);
  assert.equal(repository.listJobs().length, 1);
});

test("processNextJob returns no_job when outbox is empty", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  const result = processNextJob(repository);
  assert.equal(result.status, "no_job");
});

test("registered dry_run handler completes job", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ idempotencyKey: "idem_dry_run" }));
  const result = processNextJob(repository);
  assert.equal(result.status, "completed");
  assert.equal(result.job?.status, "completed");
  assert.equal(result.handlerMode, "dry_run");
});

test("unknown handler moves job to dead_letter", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ jobType: "unknown.handler.type", idempotencyKey: "idem_unknown" }));
  const result = processNextJob(repository);
  assert.equal(result.status, "dead_letter");
  assert.equal(result.job?.status, "dead_letter");
  assert.equal(result.job?.deadLetterReason, "missing_worker_handler");
});

test("retryable failure increments attempts and pushes availableAt forward", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.retryable.failure",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: true,
      reasons: ["transient_network_issue"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T10:00:00.000Z";
  createOutboxJob(
    repository,
    baseJobInput({
      jobType: "custom.retryable.failure",
      idempotencyKey: "idem_retryable",
      maxAttempts: 3,
      availableAt: now
    })
  );
  const result = processNextJob(repository, { now, baseRetryDelayMs: 1000, maxRetryDelayMs: 8000 });
  assert.equal(result.status, "failed");
  assert.equal(result.job?.attempts, 1);
  assert.equal((result.job?.availableAt ?? now) > now, true);
});

test("maxAttempts reached sends retryable failures to dead_letter", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.max.attempts",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: true,
      reasons: ["temporary_error"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  const now = "2026-05-12T10:00:00.000Z";
  createOutboxJob(
    repository,
    baseJobInput({ jobType: "custom.max.attempts", idempotencyKey: "idem_max", maxAttempts: 1, availableAt: now })
  );
  const result = processNextJob(repository, { now });
  assert.equal(result.status, "dead_letter");
  assert.equal(result.job?.deadLetterReason, "max_attempts_reached");
});

test("non-retryable failures move directly to dead_letter", () => {
  resetWorkerJobHandlers();
  registerWorkerJobHandler({
    jobType: "custom.non.retryable",
    mode: "dry_run",
    handle: () => ({
      ok: false,
      retryable: false,
      reasons: ["validation_failure_non_retryable"]
    })
  });
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ jobType: "custom.non.retryable", idempotencyKey: "idem_non_retry", maxAttempts: 3 }));
  const result = processNextJob(repository);
  assert.equal(result.status, "dead_letter");
  assert.equal(result.job?.deadLetterReason, "non_retryable_failure");
});

test("DLQ preserves tenant/action/idempotency metadata", () => {
  resetWorkerJobHandlers();
  const repository = new InMemoryOutboxJobRepository();
  createOutboxJob(repository, baseJobInput({ jobType: "unknown.handler.dlq", idempotencyKey: "idem_dlq_preserve" }));
  const result = processNextJob(repository);
  assert.equal(result.status, "dead_letter");
  assert.equal(result.job?.tenantId, "tenant_worker_1");
  assert.equal(result.job?.actionKey, "platform.users.create");
  assert.equal(result.job?.idempotencyKey, "idem_dlq_preserve");
});
