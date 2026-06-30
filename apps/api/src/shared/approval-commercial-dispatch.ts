import {
  dispatchApprovedAction,
  markExecutionLogCompleted,
  type ApprovalExecutionRequest,
  type ApprovalExecutionResult,
  type DispatchApprovedActionOptions
} from "@hallederiz/domain";
import type {
  QuickOperationLine,
  QuickOperationSubmitRequest,
  QuickOperationValidationIssue
} from "@hallederiz/types";
import { QuickOperationsService } from "../modules/quick-operations/service";
import type { RequestContext } from "./request-context";

function formatValidationIssues(issues?: QuickOperationValidationIssue[]): string[] {
  return (issues ?? []).map((issue) => issue.message || issue.code);
}

const QUICK_OPERATION_ACTION_KEYS = new Set([
  "platform.offers.create",
  "platform.orders.create",
  "platform.payments.create"
]);

function asQuickOperationPayload(payload: Record<string, unknown>): QuickOperationSubmitRequest | null {
  if (payload.source !== "quick-operations.submit") {
    return null;
  }
  const operationType = payload.operationType;
  const customerId = payload.customerId;
  const lines = payload.lines;
  if (typeof operationType !== "string" || typeof customerId !== "string" || !Array.isArray(lines) || lines.length === 0) {
    return null;
  }
  return {
    operationType: operationType as QuickOperationSubmitRequest["operationType"],
    customerId,
    customerName: typeof payload.customerName === "string" ? payload.customerName : undefined,
    note: typeof payload.note === "string" ? payload.note : undefined,
    lines: lines as QuickOperationLine[],
    orderId: typeof payload.orderId === "string" ? payload.orderId : undefined,
    deliveryId: typeof payload.deliveryId === "string" ? payload.deliveryId : undefined,
    paidAmount: typeof payload.paidAmount === "number" ? payload.paidAmount : undefined,
    payment: payload.payment as QuickOperationSubmitRequest["payment"],
    paymentMethod: payload.paymentMethod as QuickOperationSubmitRequest["paymentMethod"],
    paymentReceivedAt: typeof payload.paymentReceivedAt === "string" ? payload.paymentReceivedAt : undefined,
    paymentReferenceNo: typeof payload.paymentReferenceNo === "string" ? payload.paymentReferenceNo : undefined,
    paymentNote: typeof payload.paymentNote === "string" ? payload.paymentNote : undefined,
    allocatePaymentToOrder:
      typeof payload.allocatePaymentToOrder === "boolean" ? payload.allocatePaymentToOrder : undefined
  };
}

function buildDispatchOptions(
  request: ApprovalExecutionRequest,
  context: RequestContext
): DispatchApprovedActionOptions {
  return {
    executionMode: "execute",
    realExecutionEnabled: true,
    executionAllowlist: [request.actionKey],
    auditMetadataPresent: true,
    timelineMetadataPresent: true,
    environment: context.persistenceMode === "postgres" ? "production" : "development"
  };
}

export async function dispatchApprovedActionWithCommercialExecution(
  request: ApprovalExecutionRequest,
  context: RequestContext,
  options?: DispatchApprovedActionOptions
): Promise<ApprovalExecutionResult> {
  const quickPayload = asQuickOperationPayload(request.payload);
  const isQuickOperation =
    quickPayload !== null && QUICK_OPERATION_ACTION_KEYS.has(request.actionKey);

  if (!isQuickOperation) {
    return dispatchApprovedAction(request, options);
  }

  const dispatchOptions = { ...buildDispatchOptions(request, context), ...options };
  const gateProbe = dispatchApprovedAction(request, dispatchOptions);
  if (!gateProbe.ok || gateProbe.status !== "executed") {
    return gateProbe;
  }
  if (gateProbe.mutationExecuted) {
    return gateProbe;
  }

  const service = new QuickOperationsService({
    ...context,
    tenantId: request.tenantId,
    userId: request.approvedBy
  });
  const submitResult = await service.executeApprovedSubmission(quickPayload);
  if (!submitResult.ok || submitResult.mode !== "executed" || !submitResult.createdEntityId) {
    return {
      ...gateProbe,
      ok: false,
      status: "failed",
      mutationExecuted: false,
      reasons: [
        ...gateProbe.reasons.filter((reason) => !reason.includes("mutation_executed")),
        "quick_operation_execution_failed",
        ...formatValidationIssues(submitResult.validationIssues)
      ],
      executionLog: markExecutionLogCompleted(gateProbe.executionLog, "failed", [
        "quick_operation_execution_failed",
        ...formatValidationIssues(submitResult.validationIssues)
      ])
    };
  }

  const successReasons = [
    ...gateProbe.reasons.filter((reason) => !reason.includes("mutation_executed")),
    "quick_operation_entity_created",
    `entity_id:${submitResult.createdEntityId}`,
    "mutation_executed:true"
  ];

  return {
    ...gateProbe,
    ok: true,
    status: "executed",
    mutationExecuted: true,
    reasons: successReasons,
    executionLog: markExecutionLogCompleted(gateProbe.executionLog, "executed", successReasons)
  };
}
