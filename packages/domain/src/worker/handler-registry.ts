import type { WorkerHandlerMode, WorkerJob, WorkerJobHandleResult } from "./model";
import {
  buildAuditTimelineWritebackPayload,
  validateAuditTimelineWritebackPayload
} from "../approval-execution/audit-timeline-writeback";
import type { ExecutionAuditEventDraft, ExecutionTimelineEventDraft } from "../approval-execution/execution-log";

export interface WorkerJobHandler {
  jobType: string;
  mode: WorkerHandlerMode;
  handle: (job: WorkerJob) => WorkerJobHandleResult;
}

const registry = new Map<string, WorkerJobHandler>();

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asAuditDraft(value: unknown): ExecutionAuditEventDraft | undefined {
  return asRecord(value) as ExecutionAuditEventDraft | undefined;
}

function asTimelineDraft(value: unknown): ExecutionTimelineEventDraft | undefined {
  return asRecord(value) as ExecutionTimelineEventDraft | undefined;
}

function createFoundationHandler(jobType: string): WorkerJobHandler {
  if (jobType === "approval.execution.dispatch") {
    return {
      jobType,
      mode: "dry_run",
      handle: (job) => {
        const payload = job.payload ?? {};
        const hasTenantId = typeof payload.tenantId === "string" && payload.tenantId.length > 0;
        const hasActionKey = typeof payload.actionKey === "string" && payload.actionKey.length > 0;
        const hasApprovalRequestId =
          typeof payload.approvalRequestId === "string" && payload.approvalRequestId.length > 0;
        const hasExecutionId = typeof payload.executionId === "string" && payload.executionId.length > 0;
        const requestedMode = typeof payload.requestedMode === "string" ? payload.requestedMode : payload.mode;
        const effectiveMode = typeof payload.effectiveMode === "string" ? payload.effectiveMode : payload.mode;
        const gateDecision = asRecord(payload.gateDecision);

        if (!hasTenantId || !hasActionKey || !hasApprovalRequestId || !hasExecutionId) {
          return {
            ok: false,
            retryable: false,
            reasons: [
              "invalid_approval_execution_dispatch_payload",
              "non_retryable_missing_required_payload",
              "mutation_executed:false",
              "provider_call_executed:false"
            ]
          };
        }

        if ((requestedMode === "execute" || effectiveMode === "execute") && !gateDecision) {
          return {
            ok: false,
            retryable: false,
            reasons: [
              "missing_execution_gate_metadata",
              "non_retryable_missing_required_payload",
              "mutation_executed:false",
              "provider_call_executed:false"
            ]
          };
        }

        if (effectiveMode === "execute" && gateDecision?.allowed !== true) {
          return {
            ok: false,
            retryable: false,
            reasons: [
              "execution_gate_not_allowed_for_worker_dispatch",
              "non_retryable_blocked_execution_payload",
              "mutation_executed:false",
              "provider_call_executed:false"
            ]
          };
        }

        return {
          ok: true,
          retryable: false,
          reasons: [
            "approval_execution_dispatch_dry_run_handled",
            gateDecision ? "execution_gate_metadata_verified" : "execution_gate_metadata_not_required_for_dry_run",
            "handled:true",
            "mode:dry_run",
            "mutation_executed:false",
            "provider_call_executed:false"
          ]
        };
      }
    };
  }

  if (jobType === "audit.timeline.writeback") {
    return {
      jobType,
      mode: "dry_run",
      handle: (job) => {
        const payload = job.payload ?? {};
        const payloadTenantId = typeof payload.tenantId === "string" ? payload.tenantId : "";
        const payloadActionKey = typeof payload.actionKey === "string" ? payload.actionKey : "";
        const payloadApprovalRequestId =
          typeof payload.approvalRequestId === "string" ? payload.approvalRequestId : "";
        const payloadExecutionId = typeof payload.executionId === "string" ? payload.executionId : "";
        const nestedRecord = asRecord(payload.auditTimelineWritebackPayload);
        const auditEvent = asAuditDraft(nestedRecord?.auditEvent);
        const timelineEvent = asTimelineDraft(nestedRecord?.timelineEvent);

        const writebackPayload = buildAuditTimelineWritebackPayload({
          tenantId:
            (nestedRecord?.tenantId as string | undefined) ??
            payloadTenantId,
          approvalRequestId:
            (nestedRecord?.approvalRequestId as string | undefined) ??
            payloadApprovalRequestId,
          executionId:
            (nestedRecord?.executionId as string | undefined) ??
            payloadExecutionId,
          actionKey:
            (nestedRecord?.actionKey as string | undefined) ??
            payloadActionKey,
          idempotencyKey:
            (nestedRecord?.idempotencyKey as string | undefined) ??
            (typeof payload.idempotencyKey === "string" ? payload.idempotencyKey : undefined),
          auditEvent,
          timelineEvent
        });

        const validation = validateAuditTimelineWritebackPayload(writebackPayload);
        if (!validation.ok) {
          return {
            ok: false,
            retryable: false,
            reasons: [
              "invalid_audit_timeline_writeback_payload",
              ...validation.reasons,
              "non_retryable_missing_required_payload",
              "mutation_executed:false",
              "provider_call_executed:false"
            ]
          };
        }

        return {
          ok: true,
          retryable: false,
          reasons: [
            "audit_timeline_writeback_foundation_validated",
            "handled:true",
            "mode:dry_run",
            "auditPersisted:false",
            "timelinePersisted:false",
            "persistenceMode:foundation_none",
            "mutation_executed:false",
            "provider_call_executed:false"
          ]
        };
      }
    };
  }

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
