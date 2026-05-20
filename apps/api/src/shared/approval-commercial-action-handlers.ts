import {
  registerActionExecutionHandler,
  type ActionExecutionHandler,
  type ActionExecutionHandlerResult,
  type ApprovalExecutionRequest
} from "@hallederiz/domain";
import type { ExecutionGateDecision } from "@hallederiz/domain";

function dryRunExecuted(
  request: ApprovalExecutionRequest,
  gateDecision: ExecutionGateDecision,
  reasons: string[]
): ActionExecutionHandlerResult {
  return {
    ok: true,
    status: "executed",
    reasons: [...reasons, "mutation_executed:false", "external_provider_call_executed:false", "worker_follow_up_required:true"],
    requestedMode: gateDecision.mode,
    effectiveMode: gateDecision.mode === "execute" ? "execute" : "dry_run",
    gateDecision,
    mutationExecuted: false,
    externalProviderCallExecuted: false,
    rollbackPlan: "worker_execution_pending"
  };
}

function validateQuickOperationPayload(payload: Record<string, unknown> | undefined): string[] {
  const reasons: string[] = [];
  if (!payload || payload.source !== "quick-operations.submit") {
    reasons.push("quick_operation_payload_invalid");
    return reasons;
  }
  if (typeof payload.customerId !== "string" || !payload.customerId.trim()) {
    reasons.push("missing_customer_id");
  }
  if (!Array.isArray(payload.lines) || payload.lines.length === 0) {
    reasons.push("missing_operation_lines");
  }
  if (typeof payload.operationType !== "string" || !payload.operationType.trim()) {
    reasons.push("missing_operation_type");
  }
  return reasons;
}

function createQuickOperationHandler(actionKey: string, handlerKey: string): ActionExecutionHandler {
  return {
    handlerKey,
    actionKey,
    supported: true,
    mode: "execute",
    safetyChecklist: {
      requiresApproval: true,
      mutatesState: true,
      externalWrite: false,
      idempotencyRequired: true,
      auditRequired: true,
      timelineRequired: true,
      dryRunOnly: false,
      realExecutionEnabled: true
    },
    execute: (request, _action, gateDecision) => {
      const payloadIssues = validateQuickOperationPayload(request.payload);
      if (payloadIssues.length > 0) {
        return {
          ok: false,
          status: "blocked",
          reasons: [...payloadIssues, "mutation_executed:false"],
          gateDecision,
          mutationExecuted: false
        };
      }

      if (gateDecision.mode === "execute" && gateDecision.allowed) {
        return dryRunExecuted(request, gateDecision, [
          "quick_operation_approval_validated",
          "domain_execution_deferred_to_worker"
        ]);
      }

      return dryRunExecuted(request, gateDecision, ["quick_operation_approval_recorded"]);
    }
  };
}

export function bootstrapApprovalCommercialActionHandlers(): void {
  registerActionExecutionHandler(createQuickOperationHandler("platform.offers.create", "handler.platform.offers.create"));
  registerActionExecutionHandler(createQuickOperationHandler("platform.orders.create", "handler.platform.orders.create"));
  registerActionExecutionHandler(createQuickOperationHandler("platform.payments.create", "handler.platform.payments.create"));
}
