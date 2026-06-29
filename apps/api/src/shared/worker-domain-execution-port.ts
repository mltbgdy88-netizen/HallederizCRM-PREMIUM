import {
  registerWorkerDomainExecutionPort,
  routeApprovalExecutionAction,
  type WorkerDomainExecutionRequest,
  type WorkerDomainExecutionResult
} from "@hallederiz/domain";
import type { QuickOperationLine, QuickOperationSubmitRequest } from "@hallederiz/types";
import type { RequestContext } from "./request-context";
import {
  executeDocumentArchiveJob,
  executeDocumentRenderJob
} from "../modules/documents/document-execution-service";

function buildWorkerContext(tenantId: string, payload: Record<string, unknown>): RequestContext {
  const actorId = typeof payload.actorId === "string" ? payload.actorId : "worker_system";
  const persistenceMode =
    process.env.PERSISTENCE_MODE === "postgres" && (process.env.DATABASE_URL || process.env.POSTGRES_URL)
      ? "postgres"
      : "demo";
  return {
    tenantId,
    userId: actorId,
    persistenceMode,
    isAuthenticated: true,
    roles: ["worker"],
    permissions: [
      "orders.write",
      "payments.write",
      "offers.write",
      "deliveries.write",
      "documents.write",
      "approvals.execute"
    ]
  };
}

function deferred(reason: string, entityType?: string, entityId?: string): WorkerDomainExecutionResult {
  return {
    status: "deferred",
    mutation_executed: false,
    entityType,
    entityId,
    reasons: [reason]
  };
}

function asQuickOperationPayload(payload: Record<string, unknown>): QuickOperationSubmitRequest | null {
  if (payload.source !== "quick-operations.submit") {
    return null;
  }
  const operationType = payload.operationType;
  const customerId = payload.customerId;
  const lines = payload.lines;
  if (
    typeof operationType !== "string" ||
    typeof customerId !== "string" ||
    !Array.isArray(lines) ||
    lines.length === 0
  ) {
    return null;
  }
  return {
    operationType: operationType as QuickOperationSubmitRequest["operationType"],
    customerId,
    customerName: typeof payload.customerName === "string" ? payload.customerName : undefined,
    note: typeof payload.note === "string" ? payload.note : undefined,
    lines: lines as QuickOperationLine[],
    orderId: typeof payload.orderId === "string" ? payload.orderId : undefined,
    deliveryId: typeof payload.deliveryId === "string" ? payload.deliveryId : undefined
  };
}

function executeQuickOperationApproval(
  context: RequestContext,
  payload: Record<string, unknown>
): WorkerDomainExecutionResult {
  const quickPayload = asQuickOperationPayload(payload);
  if (!quickPayload) {
    return deferred("quick_operation_payload_invalid");
  }
  if (context.persistenceMode !== "postgres") {
    return deferred("domain_execution_not_wired", "approval", typeof payload.approvalId === "string" ? payload.approvalId : undefined);
  }
  return deferred("domain_execution_not_wired", "approval", quickPayload.customerId);
}

function executeDocumentJob(
  context: RequestContext,
  jobType: string,
  payload: Record<string, unknown>
): WorkerDomainExecutionResult {
  const documentId = typeof payload.documentId === "string" ? payload.documentId : "";
  if (!documentId) {
    return deferred("missing_document_id");
  }
  if (jobType === "document_render") {
    return executeDocumentRenderJob(context, documentId);
  }
  if (jobType === "document_archive") {
    return executeDocumentArchiveJob(context, documentId);
  }
  return deferred("unsupported_document_job", "document", documentId);
}

function dispatchWorkerExecution(request: WorkerDomainExecutionRequest): WorkerDomainExecutionResult {
  const tenantId = request.tenantId?.trim();
  if (!tenantId) {
    return { status: "failed", mutation_executed: false, reasons: ["missing_tenant_id"] };
  }
  if (!request.idempotencyKey?.trim()) {
    return { status: "failed", mutation_executed: false, reasons: ["missing_idempotency_key"] };
  }

  const context = buildWorkerContext(tenantId, request.payload);
  const actionKey = request.actionKey ?? (typeof request.payload.actionKey === "string" ? request.payload.actionKey : "");

  if (request.jobType === "ai_reply_send") {
    return deferred("omnichannel_provider_not_ready", "conversation", String(request.payload.conversationId ?? ""));
  }
  if (request.jobType === "integration_sync") {
    return deferred("erp_factory_adapter_not_configured");
  }
  if (request.jobType === "document_render" || request.jobType === "document_archive") {
    return executeDocumentJob(context, request.jobType, request.payload);
  }
  if (
    actionKey === "platform.offers.create" ||
    actionKey === "platform.orders.create" ||
    actionKey === "platform.payments.create"
  ) {
    return executeQuickOperationApproval(context, request.payload);
  }

  const routed = routeApprovalExecutionAction(actionKey);
  if (routed === "document_render" || routed === "document_archive") {
    return executeDocumentJob(context, routed, request.payload);
  }

  return deferred(
    "domain_execution_handler_not_wired",
    "approval",
    String(request.payload.approvalId ?? request.payload.approvalRequestId ?? "")
  );
}

export function bootstrapWorkerDomainExecutionPort(): void {
  registerWorkerDomainExecutionPort(dispatchWorkerExecution);
}
