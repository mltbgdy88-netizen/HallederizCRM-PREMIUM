import type { ActionRegistryEntry } from "@hallederiz/types";
import { getActionRegistryEntry } from "../policy/action-registry";

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
}

type ExecutionHandlerResult = {
  ok: boolean;
  reasons?: string[];
};

type ExecutionHandler = (request: ApprovalExecutionRequest, action: ActionRegistryEntry) => ExecutionHandlerResult;

const idempotencyStore = new Map<string, ApprovalExecutionResult>();

const handlers: Record<string, ExecutionHandler> = {
  "platform.users.create": (request) => ({
    ok: true,
    reasons: [
      "supported_action_noop",
      "execution_foundation_phase_only",
      `action:${request.actionKey}`
    ]
  }),
  "platform.settings.update": (request) => ({
    ok: true,
    reasons: [
      "supported_action_noop",
      "execution_foundation_phase_only",
      `action:${request.actionKey}`
    ]
  })
};

function makeExecutionId(request: ApprovalExecutionRequest) {
  return `exec_${request.approvalRequestId}_${request.idempotencyKey}`;
}

function resultFrom(
  request: ApprovalExecutionRequest,
  status: ApprovalExecutionStatus,
  reasons: string[],
  action?: ActionRegistryEntry,
  executionId?: string,
  ok?: boolean
): ApprovalExecutionResult {
  return {
    ok: ok ?? status === "executed",
    status,
    actionKey: request.actionKey,
    approvalRequestId: request.approvalRequestId,
    executionId: executionId ?? makeExecutionId(request),
    reasons,
    auditRequired: action?.auditRequired ?? true,
    timelineRequired: action?.timelineRequired ?? true,
    idempotencyKey: request.idempotencyKey
  };
}

export function dispatchApprovedAction(request: ApprovalExecutionRequest): ApprovalExecutionResult {
  if (!request.approvalRequestId) {
    return resultFrom(request, "blocked", ["missing_approval_request_id"]);
  }

  if (!request.idempotencyKey) {
    return resultFrom(request, "blocked", ["missing_idempotency_key"]);
  }

  const idempotencyComposite = `${request.tenantId}:${request.idempotencyKey}`;
  const existing = idempotencyStore.get(idempotencyComposite);
  if (existing) {
    return {
      ...existing,
      status: "duplicate",
      reasons: [...existing.reasons, "duplicate_idempotency_key"]
    };
  }

  const action = getActionRegistryEntry(request.actionKey);
  if (!action) {
    return resultFrom(request, "unsupported_action", ["unknown_action_registry_key"]);
  }

  if (action.approvalRequired && !request.approvalRequestId) {
    return resultFrom(request, "blocked", ["approval_required_missing_request"], action);
  }

  const handler = handlers[request.actionKey];
  if (!handler) {
    return resultFrom(request, "unsupported_action", ["no_handler_registered"], action);
  }

  try {
    const handlerResult = handler(request, action);
    const result = resultFrom(
      request,
      handlerResult.ok ? "executed" : "failed",
      handlerResult.reasons ?? [handlerResult.ok ? "handler_executed" : "handler_failed"],
      action,
      makeExecutionId(request),
      handlerResult.ok
    );

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
