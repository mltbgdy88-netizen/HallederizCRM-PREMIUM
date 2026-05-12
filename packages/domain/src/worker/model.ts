export type WorkerJobStatus = "pending" | "processing" | "completed" | "failed" | "dead_letter";

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

export interface WorkerJobHandleResult {
  ok: boolean;
  retryable?: boolean;
  reasons?: string[];
}

export interface ProcessNextJobResult {
  status: "no_job" | "completed" | "failed" | "dead_letter" | "duplicate";
  claimedJob?: WorkerJob;
  job?: WorkerJob;
  reasons: string[];
  handlerMode?: WorkerHandlerMode;
}
