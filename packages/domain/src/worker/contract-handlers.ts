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
import {
  getWorkerDomainExecutionPort,
  routeApprovalExecutionAction,
  type WorkerDomainExecutionResult
} from "./execution-port";

function readPayload(job: WorkerJob): Record<string, unknown> {
  return job.payload && typeof job.payload === "object" ? (job.payload as Record<string, unknown>) : {};
}

function validateApprovalDispatchPayload(payload: Record<string, unknown>): string[] {
  const reasons = validateStandardJobPayload("approval.execution.dispatch", payload);
  if (typeof payload.executionId !== "string" || !payload.executionId.trim()) {
    reasons.push("missing_execution_id");
  }
  if (payload.auditRequired !== false && (!payload.auditEvent || typeof payload.auditEvent !== "object")) {
    reasons.push("missing_audit_event");
  }
  if (payload.timelineRequired !== false && (!payload.timelineEvent || typeof payload.timelineEvent !== "object")) {
    reasons.push("missing_timeline_event");
  }

  const requestedMode = typeof payload.requestedMode === "string" ? payload.requestedMode : payload.mode;
  const effectiveMode = typeof payload.effectiveMode === "string" ? payload.effectiveMode : payload.mode;
  const gateDecision = payload.gateDecision;
  const gateRecord = gateDecision && typeof gateDecision === "object"
    ? gateDecision as Record<string, unknown>
    : undefined;

  if ((requestedMode === "execute" || effectiveMode === "execute") && !gateRecord) {
    reasons.push("missing_execution_gate_metadata");
  }
  if (effectiveMode === "execute" && gateRecord?.allowed !== true) {
    reasons.push("execution_gate_not_allowed_for_worker_dispatch");
  }
  return reasons;
}

function mapDomainExecutionResult(
  jobType: string,
  result: WorkerDomainExecutionResult
): WorkerJobHandleResult {
  if (result.status === "completed" && result.mutation_executed) {
    return normalizeHandlerResult({
      ok: true,
      status: "completed",
      mutation_executed: true,
      entityType: result.entityType,
      entityId: result.entityId,
      auditEventId: result.auditEventId,
      timelineEventId: result.timelineEventId,
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

function dispatchThroughPort(job: WorkerJob, jobType: string): WorkerJobHandleResult | Promise<WorkerJobHandleResult> {
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

  return result instanceof Promise
    ? result.then((resolved) => mapDomainExecutionResult(jobType, resolved))
    : mapDomainExecutionResult(jobType, result);
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

function createApprovalExecutionDispatchHandler(): WorkerJobHandler {
  return {
    jobType: "approval.execution.dispatch",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    supportedActions: ["worker.approval.dispatch"],
    handle: (job) => {
      const validation = validateApprovalDispatchPayload(readPayload(job));
      if (validation.length > 0) {
        return invalidPayloadResult(validation);
      }
      const payload = readPayload(job);
      const actionKey = typeof payload.actionKey === "string" ? payload.actionKey : "";
      if (!actionKey.trim()) {
        return invalidPayloadResult(["missing_action_key"]);
      }
      return dispatchThroughPort(job, "approval.execution.dispatch");
    }
  };
}

function createAuditTimelineWritebackHandler(): WorkerJobHandler {
  return {
    jobType: "audit.timeline.writeback",
    mode: "execute",
    productionAllowed: true,
    liveReady: true,
    supportedActions: ["worker.audit.timeline.writeback"],
    handle: (job) => {
      const validation = validateStandardJobPayload("audit.timeline.writeback", readPayload(job));
      if (validation.length > 0) {
        return invalidPayloadResult(validation);
      }
      return dispatchThroughPort(job, "audit.timeline.writeback");
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
    createApprovalExecutionDispatchHandler(),
    createAuditTimelineWritebackHandler(),
    createApprovalExecutionHandler(),
    createAiReplySendHandler(),
    createIntegrationSyncHandler(),
    ...listDocumentJobHandlers()
  ];
}

export { routeApprovalExecutionAction };
