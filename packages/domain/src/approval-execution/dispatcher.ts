import type { ActionRegistryEntry } from "@hallederiz/types";
import { getActionRegistryEntry } from "../policy/action-registry";
import { getActionExecutionHandler } from "./handler-registry";
import {
  createExecutionEventDrafts,
  createExecutionLogEntry,
  markExecutionLogCompleted,
  type ExecutionAuditEventDraft,
  type ExecutionLogEntry,
  type ExecutionTimelineEventDraft
} from "./execution-log";
import type { ApprovalExecutionLogRepository } from "./persistence";

export interface ApprovalExecutionRequest {
  tenantId: string;
  approvalRequestId: string;
  actionKey: string;
  actorId: string;
  approvedBy: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  requestedAt: string;
  approvedAt: string;
}

export type ApprovalExecutionStatus = "executed" | "blocked" | "unsupported_action" | "duplicate" | "failed";

export interface ApprovalExecutionResult {
  ok: boolean;
  status: ApprovalExecutionStatus;
  actionKey: string;
  approvalRequestId: string;
  executionId: string;
  reasons: string[];
  auditRequired: boolean;
  timelineRequired: boolean;
  idempotencyKey: string;
  handlerKey: string;
  handlerMode: "noop" | "dry_run" | "execute";
  executionLog: ExecutionLogEntry;
  auditEvent?: ExecutionAuditEventDraft;
  timelineEvent?: ExecutionTimelineEventDraft;
  persistenceMode: "none" | "repository";
  persistenceSkipped: boolean;
}

const idempotencyStore = new Map<string, ApprovalExecutionResult>();

function makeExecutionId(request: ApprovalExecutionRequest) {
  return `exec_${request.approvalRequestId}_${request.idempotencyKey}`;
}

function resultFrom(
  request: ApprovalExecutionRequest,
  status: ApprovalExecutionStatus,
  reasons: string[],
  action?: ActionRegistryEntry,
  executionId?: string,
  ok?: boolean,
  handlerContext?: {
    handlerKey?: string;
    handlerMode?: "noop" | "dry_run" | "execute";
  }
): ApprovalExecutionResult {
  const resolvedExecutionId = executionId ?? makeExecutionId(request);
  const handlerKey = handlerContext?.handlerKey ?? "handler.unresolved";
  const handlerMode = handlerContext?.handlerMode ?? "noop";
  const executionLog = markExecutionLogCompleted(
    createExecutionLogEntry({
      executionId: resolvedExecutionId,
      request,
      status,
      mode: handlerMode,
      handlerKey,
      handlerMode,
      auditRequired: action?.auditRequired ?? true,
      timelineRequired: action?.timelineRequired ?? true,
      reasons
    }),
    status,
    reasons
  );
  const eventDrafts = createExecutionEventDrafts(executionLog);
  return {
    ok: ok ?? status === "executed",
    status,
    actionKey: request.actionKey,
    approvalRequestId: request.approvalRequestId,
    executionId: resolvedExecutionId,
    reasons,
    auditRequired: action?.auditRequired ?? true,
    timelineRequired: action?.timelineRequired ?? true,
    idempotencyKey: request.idempotencyKey,
    handlerKey,
    handlerMode,
    executionLog,
    auditEvent: eventDrafts.auditEvent,
    timelineEvent: eventDrafts.timelineEvent,
    persistenceMode: "none",
    persistenceSkipped: true
  };
}

export function dispatchApprovedAction(
  request: ApprovalExecutionRequest,
  options?: { repository?: ApprovalExecutionLogRepository }
): ApprovalExecutionResult {
  if (!request.approvalRequestId) {
    return resultFrom(request, "blocked", ["missing_approval_request_id"]);
  }

  if (!request.idempotencyKey) {
    return resultFrom(request, "blocked", ["missing_idempotency_key"]);
  }

  const idempotencyComposite = `${request.tenantId}:${request.idempotencyKey}`;
  const existing = idempotencyStore.get(idempotencyComposite);
  const existingFromRepository = options?.repository?.findByIdempotencyKey(request.tenantId, request.idempotencyKey);
  if (existingFromRepository && !existing) {
    const recoveredResult = resultFrom(
      request,
      "executed",
      existingFromRepository.reasons,
      getActionRegistryEntry(existingFromRepository.actionKey),
      existingFromRepository.executionId,
      true,
      {
        handlerKey: existingFromRepository.handlerKey,
        handlerMode: existingFromRepository.handlerMode
      }
    );
    recoveredResult.executionLog = existingFromRepository;
    recoveredResult.persistenceMode = "repository";
    recoveredResult.persistenceSkipped = false;
    idempotencyStore.set(idempotencyComposite, recoveredResult);
  }

  const existingResolved = idempotencyStore.get(idempotencyComposite);
  if (existingResolved) {
    return {
      ...existingResolved,
      status: "duplicate",
      reasons: [...existingResolved.reasons, "duplicate_idempotency_key"],
      executionLog: markExecutionLogCompleted(existingResolved.executionLog, "duplicate", [...existingResolved.reasons, "duplicate_idempotency_key"]),
      persistenceMode: options?.repository ? "repository" : existingResolved.persistenceMode,
      persistenceSkipped: options?.repository ? false : existingResolved.persistenceSkipped
    };
  }

  const action = getActionRegistryEntry(request.actionKey);
  if (!action) {
    return resultFrom(request, "unsupported_action", ["unknown_action_registry_key"]);
  }

  if (action.approvalRequired && !request.approvalRequestId) {
    return resultFrom(request, "blocked", ["approval_required_missing_request"], action);
  }

  const handler = getActionExecutionHandler(request.actionKey);
  if (!handler) {
    return resultFrom(request, "unsupported_action", ["no_handler_registered"], action);
  }
  if (!handler.supported) {
    return resultFrom(request, "unsupported_action", ["handler_marked_unsupported"], action, undefined, undefined, {
      handlerKey: handler.handlerKey,
      handlerMode: handler.mode
    });
  }
  if (handler.safetyChecklist.requiresApproval && !request.approvalRequestId) {
    return resultFrom(request, "blocked", ["handler_requires_approval_request"], action, undefined, undefined, {
      handlerKey: handler.handlerKey,
      handlerMode: handler.mode
    });
  }

  try {
    const handlerResult = handler.execute(request, action);
    const status = handlerResult.status ?? (handlerResult.ok ? "executed" : "failed");
    const result = resultFrom(
      request,
      status,
      handlerResult.reasons ?? [handlerResult.ok ? "handler_executed" : "handler_failed"],
      action,
      makeExecutionId(request),
      handlerResult.ok,
      {
        handlerKey: handler.handlerKey,
        handlerMode: handler.mode
      }
    );

    if (options?.repository) {
      try {
        const savedLog = options.repository.saveExecutionLog(result.executionLog);
        const savedAuditEvent = result.auditEvent ? options.repository.saveAuditEventDraft(result.auditEvent) : undefined;
        const savedTimelineEvent = result.timelineEvent ? options.repository.saveTimelineEventDraft(result.timelineEvent) : undefined;
        result.executionLog = savedLog;
        result.auditEvent = savedAuditEvent;
        result.timelineEvent = savedTimelineEvent;
        result.persistenceMode = "repository";
        result.persistenceSkipped = false;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "execution_persistence_failed";
        return resultFrom(
          request,
          "failed",
          ["execution_persistence_failed", reason],
          action,
          makeExecutionId(request),
          false,
          {
            handlerKey: handler.handlerKey,
            handlerMode: handler.mode
          }
        );
      }
    }

    idempotencyStore.set(idempotencyComposite, result);
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "dispatcher_exception";
    return resultFrom(request, "failed", [reason], action);
  }
}

export function resetExecutionDispatcherState() {
  idempotencyStore.clear();
}
