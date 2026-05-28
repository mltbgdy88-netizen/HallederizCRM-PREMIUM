import type { ActionRegistryEntry } from "@hallederiz/types";
import { getActionRegistryEntry } from "../policy/action-registry";
import { getActionExecutionHandler, type ActionExecutionMode } from "./handler-registry";
import {
  evaluateExecutionGate,
  type ExecutionGateDecision
} from "./execution-gate";
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
  requestedMode: ActionExecutionMode;
  effectiveMode: ActionExecutionMode;
  gateDecision?: ExecutionGateDecision;
  mutationExecuted: boolean;
  externalProviderCallExecuted: boolean;
  rollbackPlan?: string;
  foundationControlledExecution?: boolean;
}

export interface DispatchApprovedActionOptions {
  repository?: ApprovalExecutionLogRepository;
  executionMode?: ActionExecutionMode;
  executionAllowlist?: readonly string[];
  auditMetadataPresent?: boolean;
  timelineMetadataPresent?: boolean;
  realExecutionEnabled?: boolean;
  environment?: "production" | "staging" | "development" | "test" | "foundation";
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
    requestedMode?: ActionExecutionMode;
    effectiveMode?: ActionExecutionMode;
    gateDecision?: ExecutionGateDecision;
    mutationExecuted?: boolean;
    externalProviderCallExecuted?: boolean;
    rollbackPlan?: string;
    foundationControlledExecution?: boolean;
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
    persistenceSkipped: true,
    requestedMode: handlerContext?.requestedMode ?? handlerMode,
    effectiveMode: handlerContext?.effectiveMode ?? handlerMode,
    gateDecision: handlerContext?.gateDecision,
    mutationExecuted: handlerContext?.mutationExecuted ?? false,
    externalProviderCallExecuted: handlerContext?.externalProviderCallExecuted ?? false,
    rollbackPlan: handlerContext?.rollbackPlan,
    foundationControlledExecution: handlerContext?.foundationControlledExecution
  };
}

function resolveRequestedMode(request: ApprovalExecutionRequest, options?: DispatchApprovedActionOptions): ActionExecutionMode {
  if (options?.executionMode) return options.executionMode;
  const payloadMode = request.payload?.executionMode;
  if (payloadMode === "execute" || payloadMode === "dry_run" || payloadMode === "noop") return payloadMode;
  return "dry_run";
}

function resolveAllowlist(request: ApprovalExecutionRequest, options?: DispatchApprovedActionOptions): readonly string[] {
  if (options?.executionAllowlist) return options.executionAllowlist;
  const payloadAllowlist = request.payload?.executionAllowlist;
  if (Array.isArray(payloadAllowlist)) {
    return payloadAllowlist.filter((value): value is string => typeof value === "string");
  }
  return [];
}

export function dispatchApprovedAction(
  request: ApprovalExecutionRequest,
  options?: DispatchApprovedActionOptions
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
    const executionId = makeExecutionId(request);
    const requestedMode = resolveRequestedMode(request, options);
    const gateDecision = evaluateExecutionGate({
      tenantId: request.tenantId,
      actionKey: request.actionKey,
      approvalRequestId: request.approvalRequestId,
      executionId,
      actorId: request.actorId,
      approverId: request.approvedBy,
      mode: requestedMode,
      handlerSafetyChecklist: handler.safetyChecklist,
      idempotencyKey: request.idempotencyKey,
      auditRequired: action.auditRequired,
      timelineRequired: action.timelineRequired,
      auditMetadataPresent: options?.auditMetadataPresent ?? request.payload?.auditMetadataPresent === true,
      timelineMetadataPresent: options?.timelineMetadataPresent ?? request.payload?.timelineMetadataPresent === true,
      realExecutionEnabled: options?.realExecutionEnabled,
      allowlist: resolveAllowlist(request, options),
      environment: options?.environment
    });

    if (!gateDecision.allowed) {
      return resultFrom(
        request,
        "blocked",
        ["execution_gate_blocked", ...gateDecision.blockers],
        action,
        executionId,
        false,
        {
          handlerKey: handler.handlerKey,
          handlerMode: requestedMode === "execute" ? "execute" : handler.mode,
          requestedMode,
          effectiveMode: "dry_run",
          gateDecision,
          mutationExecuted: false,
          externalProviderCallExecuted: false,
          rollbackPlan: "no_mutation_to_rollback"
        }
      );
    }

    const handlerResult = handler.execute(request, action, gateDecision);
    const status = handlerResult.status ?? (handlerResult.ok ? "executed" : "failed");
    const result = resultFrom(
      request,
      status,
      handlerResult.reasons ?? [handlerResult.ok ? "handler_executed" : "handler_failed"],
      action,
      executionId,
      handlerResult.ok,
      {
        handlerKey: handler.handlerKey,
        handlerMode: handlerResult.effectiveMode ?? handler.mode,
        requestedMode: handlerResult.requestedMode ?? requestedMode,
        effectiveMode: handlerResult.effectiveMode ?? handler.mode,
        gateDecision: handlerResult.gateDecision ?? gateDecision,
        mutationExecuted: handlerResult.mutationExecuted ?? false,
        externalProviderCallExecuted: handlerResult.externalProviderCallExecuted ?? false,
        rollbackPlan: handlerResult.rollbackPlan,
        foundationControlledExecution: handlerResult.foundationControlledExecution
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
