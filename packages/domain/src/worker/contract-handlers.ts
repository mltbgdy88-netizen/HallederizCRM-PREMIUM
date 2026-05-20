import type { WorkerJobHandler } from "./handler-registry";

const CONTRACT_JOB_TYPES = [
  "approval_execution",
  "ai_reply_send",
  "document_render",
  "document_archive",
  "integration_sync"
] as const;

export function createUnsupportedContractHandler(jobType: string): WorkerJobHandler {
  return {
    jobType,
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: () => ({
      ok: false,
      retryable: false,
      reasons: ["unsupported_job_type", `job_type:${jobType}`, "mutation_executed:false", "provider_call_executed:false"]
    })
  };
}

export function listContractJobHandlers(): WorkerJobHandler[] {
  return CONTRACT_JOB_TYPES.map((jobType) => createUnsupportedContractHandler(jobType));
}
