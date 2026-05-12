import { listWorkerJobHandlers } from "./handler-registry";
import type { WorkerRuntimeResult } from "./runtime";
import { processWorkerTick, type WorkerRuntimeOptions } from "./runtime";
import type { OutboxJobRepository } from "./repository";
import { InMemoryOutboxJobRepository } from "./repository";

export type WorkerPersistenceMode = "foundation_memory" | "demo" | "postgres" | "unsupported";

export interface WorkerRuntimeSummary {
  processed: number;
  completed: number;
  failed: number;
  deadLettered: number;
  retried: number;
  duplicates: number;
  noJob: boolean;
  mode: "foundation" | "dry_run";
  workerId: string;
  persistenceMode: WorkerPersistenceMode;
  reasons: string[];
}

export interface WorkerRuntimeHealth {
  ok: boolean;
  mode: "foundation";
  workerId: string;
  persistenceMode: WorkerPersistenceMode;
  handlers: Array<{ jobType: string; mode: string }>;
  summary: WorkerRuntimeSummary;
  reasons: string[];
}

export interface WorkerRuntimeAppConfig {
  repository?: OutboxJobRepository;
  persistenceMode?: WorkerPersistenceMode;
  workerId?: string;
  claimLeaseMs?: number;
}

export interface WorkerRuntimeApp {
  readonly workerId: string;
  readonly persistenceMode: WorkerPersistenceMode;
  processTick: (options?: WorkerRuntimeOptions) => WorkerRuntimeResult;
  startOnce: (options?: WorkerRuntimeOptions) => WorkerRuntimeResult;
  dryRunHealthCheck: (options?: WorkerRuntimeOptions) => WorkerRuntimeHealth;
  buildSummary: (tickResult: WorkerRuntimeResult, mode?: WorkerRuntimeSummary["mode"]) => WorkerRuntimeSummary;
}

export function buildWorkerRuntimeSummary(
  tickResult: WorkerRuntimeResult,
  config: { workerId: string; persistenceMode: WorkerPersistenceMode; mode?: WorkerRuntimeSummary["mode"] }
): WorkerRuntimeSummary {
  return {
    processed: tickResult.processed,
    completed: tickResult.completed,
    failed: tickResult.failed,
    deadLettered: tickResult.deadLettered,
    retried: tickResult.failed,
    duplicates: tickResult.duplicates,
    noJob: tickResult.noJob,
    mode: config.mode ?? "foundation",
    workerId: config.workerId,
    persistenceMode: config.persistenceMode,
    reasons: tickResult.reasons
  };
}

export function createWorkerRuntimeApp(config: WorkerRuntimeAppConfig = {}): WorkerRuntimeApp {
  const repository = config.repository ?? new InMemoryOutboxJobRepository();
  const workerId = config.workerId ?? "worker.foundation";
  const persistenceMode = config.persistenceMode ?? "foundation_memory";
  const claimLeaseMs = config.claimLeaseMs ?? 5 * 60 * 1000;

  const processTick = (options?: WorkerRuntimeOptions) =>
    processWorkerTick(repository, {
      maxJobsPerTick: 1,
      ...options,
      lease: {
        workerId,
        claimLeaseMs,
        ...options?.lease
      }
    });

  return {
    workerId,
    persistenceMode,
    processTick,
    startOnce: processTick,
    buildSummary: (tickResult, mode = "foundation") =>
      buildWorkerRuntimeSummary(tickResult, {
        workerId,
        persistenceMode,
        mode
      }),
    dryRunHealthCheck: (options) => {
      const tickResult = processTick({ ...options, dryRun: true, maxJobsPerTick: 1 });
      return {
        ok: true,
        mode: "foundation",
        workerId,
        persistenceMode,
        handlers: listWorkerJobHandlers().map((handler) => ({
          jobType: handler.jobType,
          mode: handler.mode
        })),
        summary: buildWorkerRuntimeSummary(tickResult, {
          workerId,
          persistenceMode,
          mode: "dry_run"
        }),
        reasons: ["worker_runtime_health_foundation"]
      };
    }
  };
}
