import type { WorkerHandlerMode, WorkerJob, WorkerJobHandleResult } from "./model";

export interface WorkerJobHandler {
  jobType: string;
  mode: WorkerHandlerMode;
  handle: (job: WorkerJob) => WorkerJobHandleResult;
}

const registry = new Map<string, WorkerJobHandler>();

function createFoundationHandler(jobType: string): WorkerJobHandler {
  return {
    jobType,
    mode: "dry_run",
    handle: () => ({
      ok: true,
      retryable: false,
      reasons: [
        "foundation_handler_dry_run",
        "no_real_provider_or_mutation_execution"
      ]
    })
  };
}

function registerDefaults() {
  registerWorkerJobHandler(createFoundationHandler("approval.execution.dispatch"));
  registerWorkerJobHandler(createFoundationHandler("audit.timeline.writeback"));
  registerWorkerJobHandler(createFoundationHandler("notification.dispatch"));
}

registerDefaults();

export function registerWorkerJobHandler(handler: WorkerJobHandler) {
  registry.set(handler.jobType, handler);
}

export function getWorkerJobHandler(jobType: string): WorkerJobHandler | undefined {
  return registry.get(jobType);
}

export function hasWorkerJobHandler(jobType: string): boolean {
  return registry.has(jobType);
}

export function listWorkerJobHandlers(): WorkerJobHandler[] {
  return [...registry.values()];
}

export function resetWorkerJobHandlers() {
  registry.clear();
  registerDefaults();
}
