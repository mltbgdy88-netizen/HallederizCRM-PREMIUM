import {
  createWorkerRuntimeApp,
  processWorkerTickAsync,
  resolveWorkerRuntimeConfig,
  type AsyncOutboxJobRepository,
  type WorkerJob,
  type WorkerRuntimeOptions,
  type WorkerRuntimeResult
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  DatabaseOutboxJobRepository,
  mapOutboxRowToDomainRecord,
  type DbWorkerJobRecord
} from "@hallederiz/database";

function mapDbRecordToWorkerJob(record: DbWorkerJobRecord): WorkerJob {
  return {
    jobId: record.jobId,
    tenantId: record.tenantId,
    jobType: record.jobType,
    actionKey: record.actionKey,
    payload: record.payload,
    status: record.status,
    attempts: record.attempts,
    maxAttempts: record.maxAttempts,
    idempotencyKey: record.idempotencyKey,
    availableAt: record.availableAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastError: record.lastError,
    deadLetterReason: record.deadLetterReason,
    lockedAt: record.lockedAt,
    lockedBy: record.lockedBy,
    leaseExpiresAt: record.leaseExpiresAt
  };
}

function createPostgresAsyncRepository(postgresUrl: string, workerId: string): AsyncOutboxJobRepository {
  const db = new DatabaseOutboxJobRepository({
    executor: createQueryExecutor({ mode: "postgres", postgresUrl }),
    persistenceMode: "postgres"
  });

  return {
    claimNext: async (now, options) => {
      const claimed = await db.claimNext(now, {
        workerId: options?.workerId ?? workerId,
        claimLeaseMs: options?.claimLeaseMs
      });
      return claimed ? mapDbRecordToWorkerJob(claimed) : undefined;
    },
    complete: async (jobId, completedAt) => {
      const completed = await db.complete(jobId, completedAt);
      return completed ? mapDbRecordToWorkerJob(completed) : undefined;
    },
    fail: async (jobId, errorMessage, nextAvailableAt, failedAt) => {
      const failed = await db.fail(jobId, errorMessage, nextAvailableAt, failedAt);
      return failed ? mapDbRecordToWorkerJob(failed) : undefined;
    },
    moveToDeadLetter: async (jobId, reason, movedAt) => {
      const dead = await db.moveToDeadLetter(jobId, reason, movedAt);
      return dead ? mapDbRecordToWorkerJob(dead) : undefined;
    }
  };
}

export interface WorkerProductionTickResult {
  mode: "foundation_dry_run" | "production" | "disabled" | "fail_closed";
  ok: boolean;
  tickResult?: WorkerRuntimeResult;
  reasons: string[];
  persistenceMode?: string;
}

export function createWorkerRuntimeFromEnv(env: NodeJS.ProcessEnv = process.env) {
  const resolution = resolveWorkerRuntimeConfig(env);
  if (!resolution.ok || !resolution.config) {
    return { resolution, app: null as ReturnType<typeof createWorkerRuntimeApp> | null };
  }

  if (resolution.config.workerMode === "foundation_dry_run") {
    return {
      resolution,
      app: createWorkerRuntimeApp({
        persistenceMode: "foundation_memory",
        workerId: resolution.config.workerId,
        claimLeaseMs: resolution.config.claimLeaseMs
      })
    };
  }

  return { resolution, app: null };
}

export async function runWorkerProductionTick(
  options?: WorkerRuntimeOptions & { env?: NodeJS.ProcessEnv }
): Promise<WorkerProductionTickResult> {
  const env = options?.env ?? process.env;
  const resolution = resolveWorkerRuntimeConfig(env);

  if (resolution.config?.workerMode === "disabled") {
    return { mode: "disabled", ok: false, reasons: resolution.reasons };
  }

  if (resolution.config?.workerMode === "foundation_dry_run") {
    const app = createWorkerRuntimeApp({
      persistenceMode: "foundation_memory",
      workerId: resolution.config.workerId,
      claimLeaseMs: resolution.config.claimLeaseMs
    });
    const tickResult = app.processTick({
      dryRun: true,
      maxJobsPerTick: options?.maxJobsPerTick ?? 1,
      ...options
    });
    return {
      mode: "foundation_dry_run",
      ok: true,
      tickResult,
      reasons: resolution.reasons,
      persistenceMode: resolution.persistenceMode
    };
  }

  if (!resolution.ok || !resolution.config?.postgresUrl) {
    return {
      mode: "fail_closed",
      ok: false,
      reasons: resolution.reasons.length > 0 ? resolution.reasons : ["worker_production_config_invalid"],
      persistenceMode: resolution.persistenceMode
    };
  }

  const repository = createPostgresAsyncRepository(resolution.config.postgresUrl, resolution.config.workerId);
  const tickResult = await processWorkerTickAsync(repository, {
    maxJobsPerTick: options?.maxJobsPerTick ?? 1,
    lease: {
      workerId: resolution.config.workerId,
      claimLeaseMs: resolution.config.claimLeaseMs
    },
    ...options
  });

  return {
    mode: "production",
    ok: true,
    tickResult,
    reasons: resolution.reasons,
    persistenceMode: "postgres"
  };
}
