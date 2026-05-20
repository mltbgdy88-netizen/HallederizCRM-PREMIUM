import { getWorkerJobHandler } from "./handler-registry";
import { isWorkerJobCompletable, normalizeHandlerResult } from "./handle-result";
import type { ProcessNextJobResult, WorkerJob, WorkerJobHandleResult } from "./model";
import { calculateNextRetryAt, classifyWorkerError, shouldRetryJob } from "./outbox";
import type { WorkerJobClaimOptions } from "./repository";
import type { WorkerLeaseOptions, WorkerRuntimeOptions, WorkerRuntimeResult } from "./runtime";

export interface AsyncOutboxJobRepository {
  claimNext: (now?: string, options?: WorkerJobClaimOptions) => Promise<WorkerJob | undefined>;
  complete: (jobId: string, completedAt?: string) => Promise<WorkerJob | undefined>;
  fail: (
    jobId: string,
    errorMessage: string,
    nextAvailableAt: string,
    failedAt?: string
  ) => Promise<WorkerJob | undefined>;
  moveToDeadLetter: (jobId: string, reason: string, movedAt?: string) => Promise<WorkerJob | undefined>;
}

function resolveNow(options?: WorkerRuntimeOptions) {
  if (options?.now) return options.now;
  if (options?.nowProvider) return options.nowProvider().toISOString();
  return new Date().toISOString();
}

function resolveLeaseOptions(options?: WorkerRuntimeOptions): WorkerLeaseOptions {
  return {
    workerId: options?.lease?.workerId ?? "worker.foundation",
    claimLeaseMs: Math.max(1000, options?.lease?.claimLeaseMs ?? 5 * 60 * 1000)
  };
}

export async function processClaimedJobAsync(
  job: WorkerJob,
  repository: AsyncOutboxJobRepository,
  options?: WorkerRuntimeOptions & { seenIdempotencyKeys?: Set<string> }
): Promise<ProcessNextJobResult> {
  const now = resolveNow(options);
  const seenIdempotencyKeys = options?.seenIdempotencyKeys;

  if (!job.tenantId) {
    const dead = await repository.moveToDeadLetter(job.jobId, "missing_tenant_context", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_tenant_context"]
    };
  }

  if (!job.idempotencyKey) {
    const dead = await repository.moveToDeadLetter(job.jobId, "missing_idempotency_key", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_idempotency_key"]
    };
  }

  if (job.status === "cancelled") {
    return {
      status: "failed",
      claimedJob: job,
      job,
      reasons: ["cancelled_job_not_executed"]
    };
  }

  if (seenIdempotencyKeys?.has(job.idempotencyKey)) {
    const completed = await repository.complete(job.jobId, now);
    return {
      status: "duplicate",
      claimedJob: job,
      job: completed,
      reasons: ["duplicate_idempotency_second_execution_blocked"]
    };
  }

  const handler = getWorkerJobHandler(job.jobType);
  if (!handler) {
    const dead = await repository.moveToDeadLetter(job.jobId, "missing_worker_handler", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_worker_handler"]
    };
  }

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (handler.productionAllowed !== true || handler.liveReady !== true)) {
    const dead = await repository.moveToDeadLetter(job.jobId, "foundation_blocked_in_production", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: [
        "foundation_handler_blocked_in_production",
        `productionAllowed:${String(handler.productionAllowed === true)}`,
        `liveReady:${String(handler.liveReady === true)}`,
        "mutation_executed:false",
        "provider_call_executed:false"
      ],
      handlerMode: handler.mode
    };
  }

  try {
    const result = normalizeHandlerResult(handler.handle(job));
    const reasons = result.reasons ?? [isWorkerJobCompletable(result) ? "handler_completed" : "handler_deferred"];

    if (isWorkerJobCompletable(result)) {
      const completed = await repository.complete(job.jobId, now);
      seenIdempotencyKeys?.add(job.idempotencyKey);
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
      const failed = await repository.fail(job.jobId, reasons.join(";"), nextRetryAt, now);
      return {
        status: "failed",
        claimedJob: job,
        job: failed,
        reasons,
        handlerMode: handler.mode
      };
    }

    const dead = await repository.moveToDeadLetter(
      job.jobId,
      retryable ? "max_attempts_reached" : "non_retryable_failure",
      now
    );
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
      const failed = await repository.fail(job.jobId, classified.message, nextRetryAt, now);
      return {
        status: "failed",
        claimedJob: job,
        job: failed,
        reasons: [classified.message]
      };
    }

    const dead = await repository.moveToDeadLetter(
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

export async function processWorkerTickAsync(
  repository: AsyncOutboxJobRepository,
  options?: WorkerRuntimeOptions
): Promise<WorkerRuntimeResult> {
  const now = resolveNow(options);
  const lease = resolveLeaseOptions(options);
  const maxJobsPerTick = Math.max(1, options?.maxJobsPerTick ?? 1);
  const seenIdempotencyKeys = new Set<string>();
  const results: ProcessNextJobResult[] = [];
  const reasons: string[] = [];

  let completed = 0;
  let failed = 0;
  let deadLettered = 0;
  let duplicates = 0;

  for (let i = 0; i < maxJobsPerTick; i += 1) {
    const job = await repository.claimNext(now, { workerId: lease.workerId, claimLeaseMs: lease.claimLeaseMs });
    if (!job) {
      if (results.length === 0) {
        reasons.push("no_job_available");
      }
      break;
    }

    const processed = await processClaimedJobAsync(job, repository, {
      ...options,
      now,
      lease,
      seenIdempotencyKeys
    });
    results.push(processed);

    if (processed.status === "completed") completed += 1;
    if (processed.status === "failed") failed += 1;
    if (processed.status === "dead_letter") deadLettered += 1;
    if (processed.status === "duplicate") duplicates += 1;
  }

  return {
    processed: results.length,
    completed,
    failed,
    deadLettered,
    duplicates,
    noJob: results.length === 0,
    results,
    reasons
  };
}
