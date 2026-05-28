import type { WorkerJob } from "./model";
import type { OutboxJobRepository } from "./repository";

export interface WorkerOutboxAdminRepository extends OutboxJobRepository {
  listOutboxJobs: (tenantId: string) => WorkerJob[];
  listDeadLetterJobs: (tenantId: string) => WorkerJob[];
  replayDeadLetterJob: (jobId: string, tenantId: string, replayedAt?: string) => WorkerJob | undefined;
}

export function replayDeadLetterJobFoundation(
  repository: OutboxJobRepository,
  jobId: string,
  tenantId: string,
  replayedAt = new Date().toISOString()
): WorkerJob | undefined {
  const job = repository.listJobs().find((item) => item.jobId === jobId);
  if (!job || job.tenantId !== tenantId) {
    return undefined;
  }
  if (job.status !== "dead_letter") {
    return undefined;
  }

  const replayed: WorkerJob = {
    ...job,
    status: "pending",
    availableAt: replayedAt,
    updatedAt: replayedAt,
    deadLetterReason: undefined,
    lastError: undefined,
    lockedAt: undefined,
    lockedBy: undefined,
    leaseExpiresAt: undefined
  };

  repository.enqueue(replayed);
  return replayed;
}
