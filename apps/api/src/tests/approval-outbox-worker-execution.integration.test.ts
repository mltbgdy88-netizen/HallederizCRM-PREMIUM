import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryOutboxJobRepository,
  processWorkerTickAsync,
  resetWorkerDomainExecutionPort,
  resetWorkerJobHandlers
} from "@hallederiz/domain";
import { bootstrapWorkerDomainExecutionPort } from "../shared/worker-domain-execution-port.js";

test("worker claim processes approval_execution without completing when mutation not executed", async () => {
  resetWorkerJobHandlers();
  resetWorkerDomainExecutionPort();
  bootstrapWorkerDomainExecutionPort();

  const repository = new InMemoryOutboxJobRepository();
  const now = new Date().toISOString();
  repository.enqueue({
    jobId: "job_bridge_worker_1",
    tenantId: "tenant_worker_1",
    jobType: "approval.execution.dispatch",
    actionKey: "platform.orders.create",
    payload: {
      tenantId: "tenant_worker_1",
      actionKey: "platform.orders.create",
      approvalRequestId: "apr_worker_1",
      executionId: "exec_worker_1",
      idempotencyKey: "idem_worker_1",
      auditEvent: { eventKey: "audit", createdAt: now },
      timelineEvent: { eventKey: "timeline", createdAt: now }
    },
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: "approval_outbox:idem_worker_1",
    availableAt: now,
    createdAt: now,
    updatedAt: now
  });

  const asyncRepository = {
    claimNext: async (now?: string, options?: { workerId?: string; claimLeaseMs?: number }) =>
      repository.claimNext(now, options),
    complete: async (jobId: string, completedAt?: string) => repository.complete(jobId, completedAt),
    fail: async (jobId: string, errorMessage: string, nextAvailableAt: string, failedAt?: string) =>
      repository.fail(jobId, errorMessage, nextAvailableAt, failedAt),
    moveToDeadLetter: async (jobId: string, reason: string, movedAt?: string) =>
      repository.moveToDeadLetter(jobId, reason, movedAt)
  };

  const tick = await processWorkerTickAsync(asyncRepository, { maxJobsPerTick: 1 });
  assert.equal(tick.processed, 1);
  const processed = tick.results[0];
  assert.notEqual(processed?.status, "completed");
  assert.ok(
    processed?.reasons?.some(
      (reason) =>
        reason.includes("mutation_executed:false") ||
        reason.includes("deferred") ||
        reason.includes("approval_execution_dispatch_deferred")
    )
  );
});
