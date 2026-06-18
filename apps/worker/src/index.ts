import {
  createWorkerRuntimeApp,
  normalizeWorkerMode,
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

import {
  createWorkerRuntimeFromEnv,
  runWorkerProductionTick,
  type WorkerProductionTickResult
} from "./production-runtime.js";

export {
  createWorkerRuntimeFromEnv,
  runWorkerProductionTick,
  type WorkerProductionTickResult
};

const workerMode = normalizeWorkerMode(process.env.WORKER_MODE);

if (workerMode === "production") {
  const result = await runWorkerProductionTick();
  if (!result.ok) {
    console.error("[worker] production tick fail-closed", result.reasons.join(","));
    process.exitCode = 1;
  } else {
    console.log("[worker] production tick", JSON.stringify({
      processed: result.tickResult?.processed ?? 0,
      completed: result.tickResult?.completed ?? 0,
      failed: result.tickResult?.failed ?? 0,
      deadLettered: result.tickResult?.deadLettered ?? 0,
      noJob: result.tickResult?.noJob ?? true
    }));
  }
} else if (workerMode !== "disabled") {
  const bootstrap = runWorkerFoundationTick();
  console.log("[worker] foundation dry-run", JSON.stringify({
    processed: bootstrap.tickResult.processed,
    noJob: bootstrap.tickResult.noJob
  }));
}
