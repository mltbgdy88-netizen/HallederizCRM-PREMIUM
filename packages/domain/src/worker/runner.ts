import { getWorkerJobHandler } from "./handler-registry";
import type { ProcessNextJobResult } from "./model";
import { calculateNextRetryAt, classifyWorkerError, shouldRetryJob } from "./outbox";
import type { OutboxJobRepository } from "./repository";

export interface WorkerRunnerOptions {
  now?: string;
  baseRetryDelayMs?: number;
  maxRetryDelayMs?: number;
}

export function processNextJob(
  repository: OutboxJobRepository,
  options?: WorkerRunnerOptions
): ProcessNextJobResult {
  const now = options?.now ?? new Date().toISOString();
  const job = repository.claimNext(now);
  if (!job) {
    return {
      status: "no_job",
      reasons: ["no_job_available"]
    };
  }

  if (!job.tenantId) {
    const dead = repository.moveToDeadLetter(job.jobId, "missing_tenant_context", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_tenant_context"]
    };
  }

  const handler = getWorkerJobHandler(job.jobType);
  if (!handler) {
    const dead = repository.moveToDeadLetter(job.jobId, "missing_worker_handler", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_worker_handler"]
    };
  }

  try {
    const result = handler.handle(job);
    const reasons = result.reasons ?? [result.ok ? "handler_completed" : "handler_failed"];

    if (result.ok) {
      const completed = repository.complete(job.jobId, now);
      return {
        status: "completed",
        claimedJob: job,
        job: completed,
        reasons,
        handlerMode: handler.mode
      };
    }

    const retryable = result.retryable ?? true;
    if (shouldRetryJob(job, retryable)) {
      const nextRetryAt = calculateNextRetryAt(
        job.attempts,
        options?.baseRetryDelayMs,
        options?.maxRetryDelayMs,
        new Date(now)
      );
      const failed = repository.fail(job.jobId, reasons.join(";"), nextRetryAt, now);
      return {
        status: "failed",
        claimedJob: job,
        job: failed,
        reasons,
        handlerMode: handler.mode
      };
    }

    const dead = repository.moveToDeadLetter(job.jobId, retryable ? "max_attempts_reached" : "non_retryable_failure", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons,
      handlerMode: handler.mode
    };
  } catch (error) {
    const classified = classifyWorkerError(error);
    if (shouldRetryJob(job, classified.retryable)) {
      const nextRetryAt = calculateNextRetryAt(
        job.attempts,
        options?.baseRetryDelayMs,
        options?.maxRetryDelayMs,
        new Date(now)
      );
      const failed = repository.fail(job.jobId, classified.message, nextRetryAt, now);
      return {
        status: "failed",
        claimedJob: job,
        job: failed,
        reasons: [classified.message]
      };
    }

    const dead = repository.moveToDeadLetter(
      job.jobId,
      classified.retryable ? "max_attempts_reached" : "non_retryable_failure",
      now
    );
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: [classified.message]
    };
  }
}
