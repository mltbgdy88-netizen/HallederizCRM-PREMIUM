import type { WorkerJob } from "./model";
import type { OutboxJobRepository } from "./repository";
import { createHash } from "node:crypto";

function nowIso() {
  return new Date().toISOString();
}

export function createOutboxJobId(tenantId: string, idempotencyKey: string) {
  const compactTenant = tenantId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "tenant";
  const digest = createHash("sha256")
    .update(`${tenantId}:${idempotencyKey}`)
    .digest("hex")
    .slice(0, 20);
  return `job_${compactTenant}_${digest}`;
}

function createJobId(tenantId: string, idempotencyKey: string) {
  return createOutboxJobId(tenantId, idempotencyKey);
}

export function createOutboxJob(
  repository: OutboxJobRepository,
  input: {
    tenantId: string;
    jobType: string;
    actionKey?: string;
    payload: Record<string, unknown>;
    idempotencyKey: string;
    maxAttempts: number;
    availableAt?: string;
  }
): { job: WorkerJob; created: boolean; duplicate: boolean } {
  if (!input.tenantId) {
    throw new Error("missing_tenant_id");
  }
  if (!input.idempotencyKey) {
    throw new Error("missing_idempotency_key");
  }
  if (input.maxAttempts <= 0) {
    throw new Error("invalid_max_attempts");
  }

  const existing = repository.findByIdempotencyKey(input.tenantId, input.idempotencyKey);
  if (existing) {
    return { job: existing, created: false, duplicate: true };
  }

  const createdAt = nowIso();
  const job: WorkerJob = {
    jobId: createJobId(input.tenantId, input.idempotencyKey),
    tenantId: input.tenantId,
    jobType: input.jobType,
    actionKey: input.actionKey,
    payload: input.payload,
    status: "pending",
    attempts: 0,
    maxAttempts: input.maxAttempts,
    idempotencyKey: input.idempotencyKey,
    availableAt: input.availableAt ?? createdAt,
    createdAt,
    updatedAt: createdAt
  };

  return { job: repository.enqueue(job), created: true, duplicate: false };
}

export function markJobProcessing(
  job: WorkerJob,
  at = nowIso(),
  options?: {
    workerId?: string;
    claimLeaseMs?: number;
  }
): WorkerJob {
  const leaseMs = Math.max(0, options?.claimLeaseMs ?? 0);
  const leaseExpiresAt = leaseMs > 0 ? new Date(new Date(at).getTime() + leaseMs).toISOString() : undefined;
  return {
    ...job,
    status: "claimed",
    attempts: job.attempts + 1,
    updatedAt: at,
    lockedAt: at,
    lockedBy: options?.workerId,
    leaseExpiresAt
  };
}

export function markJobCompleted(job: WorkerJob, at = nowIso()): WorkerJob {
  return {
    ...job,
    status: "completed",
    updatedAt: at,
    lockedAt: undefined,
    lockedBy: undefined,
    leaseExpiresAt: undefined
  };
}

export function markJobFailed(job: WorkerJob, errorMessage: string, nextAvailableAt: string, at = nowIso()): WorkerJob {
  return {
    ...job,
    status: "failed",
    lastError: errorMessage,
    availableAt: nextAvailableAt,
    updatedAt: at,
    lockedAt: undefined,
    lockedBy: undefined,
    leaseExpiresAt: undefined
  };
}

export function moveJobToDeadLetter(job: WorkerJob, reason: string, at = nowIso()): WorkerJob {
  return {
    ...job,
    status: "dead_letter",
    deadLetterReason: reason,
    updatedAt: at,
    lockedAt: undefined,
    lockedBy: undefined,
    leaseExpiresAt: undefined
  };
}

export function shouldRetryJob(job: WorkerJob, retryable: boolean): boolean {
  if (!retryable) {
    return false;
  }
  return job.attempts < job.maxAttempts;
}

export function calculateNextRetryAt(
  attempts: number,
  baseDelayMs = 1000,
  maxDelayMs = 60000,
  from = new Date()
): string {
  const boundedBase = Math.max(1, baseDelayMs);
  const boundedMax = Math.max(boundedBase, maxDelayMs);
  const multiplier = Math.max(0, attempts - 1);
  const delay = Math.min(boundedMax, boundedBase * 2 ** multiplier);
  return new Date(from.getTime() + delay).toISOString();
}

export function classifyWorkerError(error: unknown): { message: string; retryable: boolean } {
  const message = error instanceof Error ? error.message : String(error ?? "unknown_worker_error");
  const normalized = message.toLowerCase();
  const nonRetryable = normalized.includes("[non_retryable]") || normalized.includes("non_retryable");
  return {
    message,
    retryable: !nonRetryable
  };
}
