import type { ApprovalExecutionRequest, ApprovalExecutionStatus } from "./dispatcher";
import type { ActionExecutionMode } from "./handler-registry";

export interface ExecutionLogEntry {
  executionId: string;
  tenantId: string;
  approvalRequestId: string;
  actionKey: string;
  actorId: string;
  approvedBy: string;
  status: ApprovalExecutionStatus;
  mode: ActionExecutionMode;
  idempotencyKey: string;
  auditRequired: boolean;
  timelineRequired: boolean;
  reasons: string[];
  createdAt: string;
  completedAt?: string;
  handlerKey: string;
  handlerMode: ActionExecutionMode;
}

export interface ExecutionEventDraftPayload {
  tenantId: string;
  actionKey: string;
  approvalRequestId: string;
  executionId: string;
  status: ApprovalExecutionStatus;
  idempotencyKey: string;
  handlerKey: string;
  handlerMode: ActionExecutionMode;
  reasons: string[];
}

export interface ExecutionAuditEventDraft {
  eventKey: "approval.execution.audit";
  payload: ExecutionEventDraftPayload;
  createdAt: string;
}

export interface ExecutionTimelineEventDraft {
  eventKey: "approval.execution.timeline";
  payload: ExecutionEventDraftPayload;
  createdAt: string;
}

export function createExecutionLogEntry(input: {
  executionId: string;
  request: ApprovalExecutionRequest;
  status: ApprovalExecutionStatus;
  mode: ActionExecutionMode;
  handlerKey: string;
  handlerMode: ActionExecutionMode;
  auditRequired: boolean;
  timelineRequired: boolean;
  reasons: string[];
  createdAt?: string;
}): ExecutionLogEntry {
  return {
    executionId: input.executionId,
    tenantId: input.request.tenantId,
    approvalRequestId: input.request.approvalRequestId,
    actionKey: input.request.actionKey,
    actorId: input.request.actorId,
    approvedBy: input.request.approvedBy,
    status: input.status,
    mode: input.mode,
    idempotencyKey: input.request.idempotencyKey,
    auditRequired: input.auditRequired,
    timelineRequired: input.timelineRequired,
    reasons: input.reasons,
    createdAt: input.createdAt ?? new Date().toISOString(),
    handlerKey: input.handlerKey,
    handlerMode: input.handlerMode
  };
}

export function markExecutionLogCompleted(log: ExecutionLogEntry, status: ApprovalExecutionStatus, reasons: string[]): ExecutionLogEntry {
  return {
    ...log,
    status,
    reasons,
    completedAt: new Date().toISOString()
  };
}

export function createExecutionEventDrafts(log: ExecutionLogEntry): {
  auditEvent?: ExecutionAuditEventDraft;
  timelineEvent?: ExecutionTimelineEventDraft;
} {
  const payload: ExecutionEventDraftPayload = {
    tenantId: log.tenantId,
    actionKey: log.actionKey,
    approvalRequestId: log.approvalRequestId,
    executionId: log.executionId,
    status: log.status,
    idempotencyKey: log.idempotencyKey,
    handlerKey: log.handlerKey,
    handlerMode: log.handlerMode,
    reasons: log.reasons
  };

  return {
    auditEvent: log.auditRequired
      ? {
          eventKey: "approval.execution.audit",
          payload,
          createdAt: new Date().toISOString()
        }
      : undefined,
    timelineEvent: log.timelineRequired
      ? {
          eventKey: "approval.execution.timeline",
          payload,
          createdAt: new Date().toISOString()
        }
      : undefined
  };
}
