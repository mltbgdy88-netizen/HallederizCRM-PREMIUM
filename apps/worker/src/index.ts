import {
  createWorkerRuntimeApp,
  processWorkerTick,
  type WorkerRuntimeApp,
  type WorkerRuntimeAppConfig,
  type WorkerRuntimeHealth,
  type WorkerRuntimeOptions,
  type WorkerRuntimeSummary
} from "@hallederiz/domain";

export type {
  WorkerRuntimeApp,
  WorkerRuntimeAppConfig,
  WorkerRuntimeHealth,
  WorkerRuntimeSummary
};

export { createWorkerRuntimeApp };

export interface WorkerBootstrapResult {
  mode: "foundation_dry_run";
  tickResult: ReturnType<typeof processWorkerTick>;
}

export function runWorkerFoundationTick(options?: WorkerRuntimeOptions): WorkerBootstrapResult {
  const app = createWorkerRuntimeApp({ persistenceMode: "foundation_memory" });
  const tickResult = app.processTick({
    dryRun: true,
    maxJobsPerTick: 1,
    ...options
  });

  return {
    mode: "foundation_dry_run",
    tickResult
  };
}
