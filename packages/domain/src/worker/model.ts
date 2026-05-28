export type WorkerJobStatus = "pending" | "claimed" | "processing" | "completed" | "failed" | "dead_letter" | "cancelled";

export interface WorkerJob {
  jobId: string;
  tenantId: string;
  jobType: string;
  actionKey?: string;
  payload: Record<string, unknown>;
  status: WorkerJobStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  availableAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  deadLetterReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  leaseExpiresAt?: string;
}

export type WorkerHandlerMode = "noop" | "dry_run" | "execute";

export type WorkerHandlerStatus = "completed" | "deferred" | "failed" | "skipped";

export interface WorkerJobHandleResult {
  ok: boolean;
  status?: WorkerHandlerStatus;
  mutation_executed?: boolean;
  retryable?: boolean;
  reasons?: string[];
  entityType?: string;
  entityId?: string;
  auditEventId?: string;
  timelineEventId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessNextJobResult {
  status: "no_job" | "completed" | "failed" | "dead_letter" | "duplicate";
  claimedJob?: WorkerJob;
  job?: WorkerJob;
  reasons: string[];
  handlerMode?: WorkerHandlerMode;
}
