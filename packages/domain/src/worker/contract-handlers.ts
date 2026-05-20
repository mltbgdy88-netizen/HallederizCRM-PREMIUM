import type { WorkerJob, WorkerJobHandleResult } from "./model";
import type { WorkerJobHandler } from "./handler-registry";
import { validateStandardJobPayload } from "./outbox-job-types";
import { listDocumentJobHandlers } from "./document-job-handlers";

const CONTRACT_JOB_TYPES = [
  "approval_execution",
  "ai_reply_send",
  "integration_sync"
] as const;

function readPayload(job: WorkerJob): Record<string, unknown> {
  return job.payload && typeof job.payload === "object" ? (job.payload as Record<string, unknown>) : {};
}

function invalidPayload(reasons: string[]): WorkerJobHandleResult {
  return {
    ok: false,
    retryable: false,
    reasons: [...reasons, "mutation_executed:false", "provider_call_executed:false"]
  };
}

function deferredResult(jobType: string, detail: string, retryable = true): WorkerJobHandleResult {
  return {
    ok: false,
    retryable,
    reasons: [
      "handler_deferred",
      `job_type:${jobType}`,
      detail,
      "mutation_executed:false",
      "provider_call_executed:false"
    ]
  };
}

export function createUnsupportedContractHandler(jobType: string): WorkerJobHandler {
  return {
    jobType,
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validation = validateStandardJobPayload(jobType, readPayload(job));
      if (validation.length > 0) {
        return invalidPayload(validation);
      }
      return {
        ok: false,
        retryable: false,
        reasons: ["unsupported_job_type", `job_type:${jobType}`, "mutation_executed:false", "provider_call_executed:false"]
      };
    }
  };
}

function createApprovalExecutionHandler(): WorkerJobHandler {
  return {
    jobType: "approval_execution",
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validation = validateStandardJobPayload("approval_execution", readPayload(job));
      if (validation.length > 0) {
        return invalidPayload(validation);
      }
      const payload = readPayload(job);
      const actionKey = typeof payload.actionKey === "string" ? payload.actionKey : "";
      if (!actionKey.trim()) {
        return invalidPayload(["missing_action_key"]);
      }
      return deferredResult("approval_execution", "domain_execution_handler_not_wired");
    }
  };
}

function createAiReplySendHandler(): WorkerJobHandler {
  return {
    jobType: "ai_reply_send",
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validation = validateStandardJobPayload("ai_reply_send", readPayload(job));
      if (validation.length > 0) {
        return invalidPayload(validation);
      }
      return deferredResult("ai_reply_send", "omnichannel_provider_not_ready");
    }
  };
}

function createIntegrationSyncHandler(): WorkerJobHandler {
  return {
    jobType: "integration_sync",
    mode: "dry_run",
    productionAllowed: true,
    liveReady: false,
    handle: (job) => {
      const validation = validateStandardJobPayload("integration_sync", readPayload(job));
      if (validation.length > 0) {
        return invalidPayload(validation);
      }
      return deferredResult("integration_sync", "erp_factory_adapter_not_configured");
    }
  };
}

export function listContractJobHandlers(): WorkerJobHandler[] {
  return [
    createApprovalExecutionHandler(),
    createAiReplySendHandler(),
    createIntegrationSyncHandler(),
    ...listDocumentJobHandlers()
  ];
}
