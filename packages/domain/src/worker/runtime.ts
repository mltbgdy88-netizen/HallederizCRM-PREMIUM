import { getWorkerJobHandler } from "./handler-registry";
import type { ProcessNextJobResult, WorkerJob } from "./model";
import { calculateNextRetryAt, classifyWorkerError, shouldRetryJob } from "./outbox";
import type { OutboxJobRepository, WorkerJobClaimOptions } from "./repository";

export interface WorkerLeaseOptions extends WorkerJobClaimOptions {
  workerId: string;
  claimLeaseMs: number;
}

export interface WorkerRuntimeOptions {
  lease?: Partial<WorkerLeaseOptions>;
  now?: string;
  nowProvider?: () => Date;
  maxJobsPerTick?: number;
  baseRetryDelayMs?: number;
  maxRetryDelayMs?: number;
  dryRun?: boolean;
}

export interface WorkerRuntimeResult {
  processed: number;
  completed: number;
  failed: number;
  deadLettered: number;
  duplicates: number;
  noJob: boolean;
  results: ProcessNextJobResult[];
  reasons: string[];
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

export function processClaimedJob(
  job: WorkerJob,
  repository: OutboxJobRepository,
  options?: WorkerRuntimeOptions & { seenIdempotencyKeys?: Set<string> }
): ProcessNextJobResult {
  const now = resolveNow(options);
  const seenIdempotencyKeys = options?.seenIdempotencyKeys;

  if (!job.tenantId) {
    const dead = repository.moveToDeadLetter(job.jobId, "missing_tenant_context", now);
    return {
      status: "dead_letter",
      claimedJob: job,
      job: dead,
      reasons: ["missing_tenant_context"]
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
    const completed = repository.complete(job.jobId, now);
    return {
      status: "duplicate",
      claimedJob: job,
      job: completed,
      reasons: ["duplicate_idempotency_second_execution_blocked"]
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

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (handler.productionAllowed !== true || handler.liveReady !== true)) {
    const dead = repository.moveToDeadLetter(job.jobId, "foundation_blocked_in_production", now);
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
    const result = handler.handle(job);
    const reasons = result.reasons ?? [result.ok ? "handler_completed" : "handler_failed"];

    if (result.ok) {
      const completed = repository.complete(job.jobId, now);
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
      const failed = repository.fail(job.jobId, reasons.join(";"), nextRetryAt, now);
      return {
        status: "failed",
        claimedJob: job,
        job: failed,
        reasons,
        handlerMode: handler.mode
      };
    }

    const dead = repository.moveToDeadLetter(
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

export function processWorkerTick(repository: OutboxJobRepository, options?: WorkerRuntimeOptions): WorkerRuntimeResult {
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
    const job = repository.claimNext(now, { workerId: lease.workerId, claimLeaseMs: lease.claimLeaseMs });
    if (!job) {
      if (results.length === 0) {
        reasons.push("no_job_available");
      }
      break;
    }

    const processed = processClaimedJob(job, repository, {
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
