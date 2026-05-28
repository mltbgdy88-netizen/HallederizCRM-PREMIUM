import type { WorkerJob, WorkerJobHandleResult } from "./model";
import type { WorkerJobHandler } from "./handler-registry";
import { validateStandardJobPayload } from "./outbox-job-types";
import { listDocumentJobHandlers } from "./document-job-handlers";
import {
  deferredHandlerResult,
  failedHandlerResult,
  invalidPayloadResult,
  normalizeHandlerResult
} from "./handle-result";
import { getWorkerDomainExecutionPort, routeApprovalExecutionAction } from "./execution-port";

function readPayload(job: WorkerJob): Record<string, unknown> {
  return job.payload && typeof job.payload === "object" ? (job.payload as Record<string, unknown>) : {};
}

function dispatchThroughPort(job: WorkerJob, jobType: string): WorkerJobHandleResult {
  const port = getWorkerDomainExecutionPort();
  if (!port) {
    return deferredHandlerResult(jobType, "domain_execution_port_not_registered");
  }

  const payload = readPayload(job);
  const actionKey = typeof payload.actionKey === "string" ? payload.actionKey : job.actionKey ?? "";
  const result = port({
    jobType,
    tenantId: job.tenantId,
    actionKey,
    payload,
    idempotencyKey: job.idempotencyKey
  });

  if (result.status === "completed" && result.mutation_executed) {
    return normalizeHandlerResult({
      ok: true,
      status: "completed",
      mutation_executed: true,
      entityType: result.entityType,
      entityId: result.entityId,
      metadata: result.metadata,
      retryable: false,
      reasons: ["domain_execution_completed", ...result.reasons, "mutation_executed:true"]
    });
  }

  if (result.status === "failed") {
    return failedHandlerResult(jobType, result.reasons.join(";"), false);
  }

  return deferredHandlerResult(jobType, result.reasons[0] ?? "domain_execution_deferred", {
    entityType: result.entityType,
    entityId: result.entityId
  });
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
        return invalidPayloadResult(validation);
      }
      return failedHandlerResult(jobType, "unsupported_job_type", false);
    }
  };
}

function createApprovalExecutionHandler(): WorkerJobHandler {
  return {
    jobType: "approval_execution",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    handle: (job) => {
      const validation = validateStandardJobPayload("approval_execution", readPayload(job));
      if (validation.length > 0) {
        return invalidPayloadResult(validation);
      }
      const payload = readPayload(job);
      const actionKey = typeof payload.actionKey === "string" ? payload.actionKey : "";
      if (!actionKey.trim()) {
        return invalidPayloadResult(["missing_action_key"]);
      }
      return dispatchThroughPort(job, "approval_execution");
    }
  };
}

function createAiReplySendHandler(): WorkerJobHandler {
  return {
    jobType: "ai_reply_send",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    handle: (job) => {
      const validation = validateStandardJobPayload("ai_reply_send", readPayload(job));
      if (validation.length > 0) {
        return invalidPayloadResult(validation);
      }
      return dispatchThroughPort(job, "ai_reply_send");
    }
  };
}

function createIntegrationSyncHandler(): WorkerJobHandler {
  return {
    jobType: "integration_sync",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    handle: (job) => {
      const validation = validateStandardJobPayload("integration_sync", readPayload(job));
      if (validation.length > 0) {
        return invalidPayloadResult(validation);
      }
      return dispatchThroughPort(job, "integration_sync");
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

export { routeApprovalExecutionAction };
