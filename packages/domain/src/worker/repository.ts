import type { WorkerJob } from "./model";
import { markJobCompleted, markJobFailed, markJobProcessing, moveJobToDeadLetter } from "./outbox";

export interface WorkerJobClaimOptions {
  workerId?: string;
  claimLeaseMs?: number;
}

export interface OutboxJobRepository {
  enqueue: (job: WorkerJob) => WorkerJob;
  claimNext: (now?: string, options?: WorkerJobClaimOptions) => WorkerJob | undefined;
  complete: (jobId: string, completedAt?: string) => WorkerJob | undefined;
  fail: (jobId: string, errorMessage: string, nextAvailableAt: string, failedAt?: string) => WorkerJob | undefined;
  moveToDeadLetter: (jobId: string, reason: string, movedAt?: string) => WorkerJob | undefined;
  findByIdempotencyKey: (tenantId: string, idempotencyKey: string) => WorkerJob | undefined;
  listJobs: () => WorkerJob[];
}

export class InMemoryOutboxJobRepository implements OutboxJobRepository {
  private readonly jobsById = new Map<string, WorkerJob>();
  private readonly jobsByIdempotency = new Map<string, WorkerJob>();

  enqueue(job: WorkerJob): WorkerJob {
    const composite = `${job.tenantId}:${job.idempotencyKey}`;
    const existing = this.jobsByIdempotency.get(composite);
    if (existing) {
      return existing;
    }
    this.jobsById.set(job.jobId, job);
    this.jobsByIdempotency.set(composite, job);
    return job;
  }

  claimNext(now = new Date().toISOString(), options?: WorkerJobClaimOptions): WorkerJob | undefined {
    const candidates = [...this.jobsById.values()]
      .filter(
        (job) =>
          (job.status === "pending" || job.status === "failed") &&
          job.availableAt <= now &&
          (!job.lockedAt || !job.leaseExpiresAt || job.leaseExpiresAt <= now)
      )
      .sort((a, b) => a.availableAt.localeCompare(b.availableAt));
    const next = candidates[0];
    if (!next) {
      return undefined;
    }
    const processing = markJobProcessing(next, now, options);
    this.jobsById.set(processing.jobId, processing);
    this.jobsByIdempotency.set(`${processing.tenantId}:${processing.idempotencyKey}`, processing);
    return processing;
  }

  complete(jobId: string, completedAt = new Date().toISOString()): WorkerJob | undefined {
    const job = this.jobsById.get(jobId);
    if (!job) {
      return undefined;
    }
    const completed = markJobCompleted(job, completedAt);
    this.jobsById.set(jobId, completed);
    this.jobsByIdempotency.set(`${completed.tenantId}:${completed.idempotencyKey}`, completed);
    return completed;
  }

  fail(jobId: string, errorMessage: string, nextAvailableAt: string, failedAt = new Date().toISOString()): WorkerJob | undefined {
    const job = this.jobsById.get(jobId);
    if (!job) {
      return undefined;
    }
    const failed = markJobFailed(job, errorMessage, nextAvailableAt, failedAt);
    this.jobsById.set(jobId, failed);
    this.jobsByIdempotency.set(`${failed.tenantId}:${failed.idempotencyKey}`, failed);
    return failed;
  }

  moveToDeadLetter(jobId: string, reason: string, movedAt = new Date().toISOString()): WorkerJob | undefined {
    const job = this.jobsById.get(jobId);
    if (!job) {
      return undefined;
    }
    const deadLetter = moveJobToDeadLetter(job, reason, movedAt);
    this.jobsById.set(jobId, deadLetter);
    this.jobsByIdempotency.set(`${deadLetter.tenantId}:${deadLetter.idempotencyKey}`, deadLetter);
    return deadLetter;
  }

  findByIdempotencyKey(tenantId: string, idempotencyKey: string): WorkerJob | undefined {
    return this.jobsByIdempotency.get(`${tenantId}:${idempotencyKey}`);
  }

  listJobs(): WorkerJob[] {
    return [...this.jobsById.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
