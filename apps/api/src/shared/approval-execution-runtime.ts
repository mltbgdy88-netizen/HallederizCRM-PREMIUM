import type { PendingApprovalRepository, PendingApprovalRequest } from "@hallederiz/domain";
import type {
  ExecuteApprovalWithOutboxBridgeResult,
  TransactionalApprovalExecutionRequest
} from "@hallederiz/database";
import type { RequestContext } from "./request-context";

export type ApprovalBridgeTrigger = (
  context: RequestContext,
  request: TransactionalApprovalExecutionRequest
) => Promise<ExecuteApprovalWithOutboxBridgeResult>;

export interface ApprovalRepositoryResolutionLike {
  repository: PendingApprovalRepository | null;
  mode: string;
  reasons: string[];
}

export type ApprovalExecutionRuntimeStatus =
  | "approved"
  | "already_approved"
  | "rejected"
  | "not_found"
  | "repository_unavailable"
  | "bridge_unavailable"
  | "bridge_failed"
  | "invalid_state";

export interface ExecuteApprovedPendingApprovalInput {
  context: RequestContext;
  approvalRequestId: string;
  approverId: string;
  repositoryResolution: ApprovalRepositoryResolutionLike;
  bridgeTrigger: ApprovalBridgeTrigger | null;
  approvedAt?: string;
  idempotencyKey?: string;
}

export interface ExecuteApprovedPendingApprovalResult {
  ok: boolean;
  duplicate: boolean;
  status: ApprovalExecutionRuntimeStatus;
  approvalRequestId: string;
  approvalStatus?: PendingApprovalRequest["status"];
  executionId?: string;
  outboxJobId?: string;
  bridgeResult?: {
    status: ExecuteApprovalWithOutboxBridgeResult["status"];
    transactionMode: ExecuteApprovalWithOutboxBridgeResult["transactionMode"];
    persistenceMode: ExecuteApprovalWithOutboxBridgeResult["persistenceMode"];
    outboxJobEnqueued: boolean;
    outboxDuplicate: boolean;
    outboxJobId?: string;
    reasons: string[];
  };
  auditEvent?: Record<string, unknown>;
  timelineEvent?: Record<string, unknown>;
  gateDecision?: Record<string, unknown>;
  auditEventId?: string;
  timelineEventId?: string;
  auditTimelineWritebackQueued: boolean;
  auditTimelinePayload?: Record<string, unknown>;
  approvalPersistenceMode: string;
  bridgeMode: string;
  outboxMode: "queued" | "duplicate" | "none";
  outboxQueued: boolean;
  workerProcessingRecommended: boolean;
  reasons: string[];
  httpStatus: number;
}

function mapDecisionFailure(reason: string): { status: ApprovalExecutionRuntimeStatus; httpStatus: number; reasons: string[] } {
  if (reason === "tenant_mismatch") {
    return { status: "not_found", httpStatus: 404, reasons: [reason] };
  }
  if (reason === "approval_not_found") {
    return { status: "not_found", httpStatus: 404, reasons: [reason] };
  }
  if (reason === "approval_already_rejected") {
    return { status: "rejected", httpStatus: 409, reasons: [reason] };
  }
  if (reason === "approval_already_approved") {
    return { status: "already_approved", httpStatus: 200, reasons: [reason] };
  }
  return { status: "invalid_state", httpStatus: 409, reasons: [reason] };
}

function resolveWritebackPayload(
  bridgeResult: ExecuteApprovalWithOutboxBridgeResult
): Record<string, unknown> | undefined {
  const payloadFromBridge = bridgeResult.auditTimelineWritebackPayload;
  if (payloadFromBridge && typeof payloadFromBridge === "object") {
    return payloadFromBridge;
  }
  const payloadFromOutbox = bridgeResult.outboxJob?.payload?.auditTimelineWritebackPayload;
  if (payloadFromOutbox && typeof payloadFromOutbox === "object") {
    return payloadFromOutbox as Record<string, unknown>;
  }
  return undefined;
}

export async function executeApprovedPendingApproval(
  input: ExecuteApprovedPendingApprovalInput
): Promise<ExecuteApprovedPendingApprovalResult> {
  const repository = input.repositoryResolution.repository;
  if (!repository) {
    return {
      ok: false,
      duplicate: false,
      status: "repository_unavailable",
      approvalRequestId: input.approvalRequestId,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: "none",
      outboxMode: "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: false,
      reasons: input.repositoryResolution.reasons.length > 0
        ? input.repositoryResolution.reasons
        : ["approval_repository_dependency_missing"],
      httpStatus: 503
    };
  }

  const approvalRequest = await repository.getPendingApprovalRequest(input.approvalRequestId, input.context.tenantId);
  if (!approvalRequest) {
    return {
      ok: false,
      duplicate: false,
      status: "not_found",
      approvalRequestId: input.approvalRequestId,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: "none",
      outboxMode: "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: false,
      reasons: ["approval_not_found"],
      httpStatus: 404
    };
  }

  if (approvalRequest.status === "approved") {
    return {
      ok: true,
      duplicate: true,
      status: "already_approved",
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      executionId: approvalRequest.executionId,
      outboxJobId: approvalRequest.outboxJobId,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: approvalRequest.bridgeTransactionMode ?? "already_processed",
      outboxMode: approvalRequest.outboxJobId ? "duplicate" : "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: Boolean(approvalRequest.outboxJobId),
      reasons: ["approval_already_approved"],
      httpStatus: 200
    };
  }

  if (approvalRequest.status === "rejected") {
    return {
      ok: false,
      duplicate: false,
      status: "rejected",
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: "none",
      outboxMode: "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: false,
      reasons: ["approval_already_rejected"],
      httpStatus: 409
    };
  }

  if (approvalRequest.status !== "pending") {
    return {
      ok: false,
      duplicate: false,
      status: "invalid_state",
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: "none",
      outboxMode: "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: false,
      reasons: ["approval_not_pending"],
      httpStatus: 409
    };
  }

  if (!input.bridgeTrigger) {
    return {
      ok: false,
      duplicate: false,
      status: "bridge_unavailable",
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode: "none",
      outboxMode: "none",
      outboxQueued: false,
      auditTimelineWritebackQueued: false,
      workerProcessingRecommended: false,
      reasons: ["approval_bridge_unavailable"],
      httpStatus: 503
    };
  }

  const bridgeRequest: TransactionalApprovalExecutionRequest = {
    tenantId: approvalRequest.tenantId,
    approvalRequestId: approvalRequest.approvalRequestId,
    actionKey: approvalRequest.actionKey,
    actorId: approvalRequest.actorId,
    approvedBy: input.approverId,
    payload: approvalRequest.payload ?? {},
    idempotencyKey: input.idempotencyKey ?? approvalRequest.idempotencyKey,
    requestedAt: approvalRequest.requestedAt,
    approvedAt: input.approvedAt ?? new Date().toISOString()
  };

  const bridgeResult = await input.bridgeTrigger(input.context, bridgeRequest);
  const bridgeMode = `${bridgeResult.transactionMode}:${bridgeResult.persistenceMode}`;
  const outboxMode = bridgeResult.outboxJobEnqueued ? "queued" : bridgeResult.outboxDuplicate ? "duplicate" : "none";
  const writebackPayload = resolveWritebackPayload(bridgeResult);

  if (!bridgeResult.ok || !bridgeResult.executionResult) {
    return {
      ok: false,
      duplicate: false,
      status: "bridge_failed",
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode,
      outboxMode,
      outboxQueued: bridgeResult.outboxJobEnqueued,
      auditTimelineWritebackQueued: Boolean(bridgeResult.auditTimelineWritebackQueued),
      auditTimelinePayload: writebackPayload,
      workerProcessingRecommended: false,
      bridgeResult: {
        status: bridgeResult.status,
        transactionMode: bridgeResult.transactionMode,
        persistenceMode: bridgeResult.persistenceMode,
        outboxJobEnqueued: bridgeResult.outboxJobEnqueued,
        outboxDuplicate: bridgeResult.outboxDuplicate,
        outboxJobId: bridgeResult.outboxJob?.jobId,
        reasons: bridgeResult.reasons
      },
      reasons: bridgeResult.reasons.length > 0 ? bridgeResult.reasons : ["bridge_execution_failed"],
      httpStatus: 409
    };
  }

  const decision = await repository.markPendingApprovalApproved({
    approvalRequestId: approvalRequest.approvalRequestId,
    tenantId: input.context.tenantId,
    approvedBy: input.approverId,
    approvedAt: bridgeRequest.approvedAt,
    executionId: bridgeResult.executionResult.executionId,
    outboxJobId: bridgeResult.outboxJob?.jobId,
    bridgeReasons: bridgeResult.reasons,
    bridgeTransactionMode: bridgeResult.transactionMode,
    bridgePersistenceMode: bridgeResult.persistenceMode
  });

  if (!decision.ok) {
    const mapped = mapDecisionFailure(decision.reason);
    if (decision.reason === "approval_already_approved") {
      const latest = await repository.getPendingApprovalRequest(approvalRequest.approvalRequestId, input.context.tenantId);
      return {
        ok: true,
        duplicate: true,
        status: "already_approved",
        approvalRequestId: approvalRequest.approvalRequestId,
        approvalStatus: latest?.status ?? "approved",
        executionId: latest?.executionId ?? bridgeResult.executionResult.executionId,
        outboxJobId: latest?.outboxJobId ?? bridgeResult.outboxJob?.jobId,
        approvalPersistenceMode: input.repositoryResolution.mode,
        bridgeMode: latest?.bridgeTransactionMode ?? bridgeMode,
        outboxMode: latest?.outboxJobId ? "duplicate" : outboxMode,
        outboxQueued: false,
        auditTimelineWritebackQueued: false,
        workerProcessingRecommended: Boolean(latest?.outboxJobId ?? bridgeResult.outboxJob?.jobId),
        bridgeResult: {
          status: bridgeResult.status,
          transactionMode: bridgeResult.transactionMode,
          persistenceMode: bridgeResult.persistenceMode,
          outboxJobEnqueued: bridgeResult.outboxJobEnqueued,
          outboxDuplicate: bridgeResult.outboxDuplicate,
          outboxJobId: bridgeResult.outboxJob?.jobId,
          reasons: bridgeResult.reasons
        },
        reasons: mapped.reasons,
        httpStatus: mapped.httpStatus
      };
    }

    return {
      ok: false,
      duplicate: false,
      status: mapped.status,
      approvalRequestId: approvalRequest.approvalRequestId,
      approvalStatus: approvalRequest.status,
      approvalPersistenceMode: input.repositoryResolution.mode,
      bridgeMode,
      outboxMode,
      outboxQueued: bridgeResult.outboxJobEnqueued,
      auditTimelineWritebackQueued: Boolean(bridgeResult.auditTimelineWritebackQueued),
      auditTimelinePayload: writebackPayload,
      workerProcessingRecommended: false,
      bridgeResult: {
        status: bridgeResult.status,
        transactionMode: bridgeResult.transactionMode,
        persistenceMode: bridgeResult.persistenceMode,
        outboxJobEnqueued: bridgeResult.outboxJobEnqueued,
        outboxDuplicate: bridgeResult.outboxDuplicate,
        outboxJobId: bridgeResult.outboxJob?.jobId,
        reasons: bridgeResult.reasons
      },
      reasons: mapped.reasons,
      httpStatus: mapped.httpStatus
    };
  }

  return {
    ok: true,
    duplicate: false,
    status: "approved",
    approvalRequestId: decision.item.approvalRequestId,
    approvalStatus: decision.item.status,
    executionId: bridgeResult.executionResult.executionId,
    outboxJobId: bridgeResult.outboxJob?.jobId,
    bridgeResult: {
      status: bridgeResult.status,
      transactionMode: bridgeResult.transactionMode,
      persistenceMode: bridgeResult.persistenceMode,
      outboxJobEnqueued: bridgeResult.outboxJobEnqueued,
      outboxDuplicate: bridgeResult.outboxDuplicate,
      outboxJobId: bridgeResult.outboxJob?.jobId,
      reasons: bridgeResult.reasons
    },
    auditEvent: (bridgeResult.executionResult.auditEvent ?? undefined) as Record<string, unknown> | undefined,
    timelineEvent: (bridgeResult.executionResult.timelineEvent ?? undefined) as Record<string, unknown> | undefined,
    gateDecision: bridgeResult.executionResult.gateDecision as Record<string, unknown> | undefined,
    approvalPersistenceMode: input.repositoryResolution.mode,
    bridgeMode,
    outboxMode,
    outboxQueued: bridgeResult.outboxJobEnqueued,
    auditTimelineWritebackQueued: Boolean(bridgeResult.auditTimelineWritebackQueued),
    auditTimelinePayload: writebackPayload,
    workerProcessingRecommended: Boolean(bridgeResult.outboxJobEnqueued || bridgeResult.outboxDuplicate),
    auditEventId: bridgeResult.executionResult.auditEvent?.eventId,
    timelineEventId: bridgeResult.executionResult.timelineEvent?.eventId,
    reasons: bridgeResult.executionResult.reasons,
    httpStatus: 200
  };
}
