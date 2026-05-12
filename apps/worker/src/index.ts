import {
  InMemoryOutboxJobRepository,
  processWorkerTick,
  type WorkerRuntimeOptions
} from "@hallederiz/domain";

export interface WorkerBootstrapResult {
  mode: "foundation_dry_run";
  tickResult: ReturnType<typeof processWorkerTick>;
}

export function runWorkerFoundationTick(options?: WorkerRuntimeOptions): WorkerBootstrapResult {
  const repository = new InMemoryOutboxJobRepository();
  const tickResult = processWorkerTick(repository, {
    dryRun: true,
    maxJobsPerTick: 1,
    ...options
  });

  return {
    mode: "foundation_dry_run",
    tickResult
  };
}
