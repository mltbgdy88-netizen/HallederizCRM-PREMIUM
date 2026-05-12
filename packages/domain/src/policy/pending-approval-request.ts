export interface PendingApprovalRequestInput {
  tenantId: string;
  actorId: string;
  actionKey: string;
  reasons: string[];
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
  requestedAt?: string;
  auditRequired?: boolean;
  timelineRequired?: boolean;
}

export interface PendingApprovalRequest extends PendingApprovalRequestInput {
  approvalRequestId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  requestedAt: string;
  idempotencyKey: string;
  auditRequired: boolean;
  timelineRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectReason?: string;
  executionId?: string;
  outboxJobId?: string;
  bridgeReasons?: string[];
  bridgeTransactionMode?: string;
  bridgePersistenceMode?: string;
}

const pendingApprovalRequests: PendingApprovalRequest[] = [];
let approvalSequence = 0;

export function createPendingApprovalRequest(input: PendingApprovalRequestInput): PendingApprovalRequest {
  approvalSequence += 1;
  const createdAt = new Date().toISOString();
  const approvalRequest: PendingApprovalRequest = {
    approvalRequestId: `apr_req_${approvalSequence}`,
    tenantId: input.tenantId,
    actorId: input.actorId,
    actionKey: input.actionKey,
    reasons: input.reasons,
    payload: input.payload ?? {},
    idempotencyKey: input.idempotencyKey ?? `apr_idem_${approvalSequence}`,
    status: "pending",
    createdAt,
    requestedAt: input.requestedAt ?? createdAt,
    auditRequired: input.auditRequired ?? true,
    timelineRequired: input.timelineRequired ?? true
  };

  pendingApprovalRequests.unshift(approvalRequest);
  return approvalRequest;
}

export function listPendingApprovalRequests(tenantId?: string): PendingApprovalRequest[] {
  const pending = pendingApprovalRequests.filter((item) => item.status === "pending");
  if (!tenantId) return pending;
  return pending.filter((item) => item.tenantId === tenantId);
}

export function getApprovalRequestById(approvalRequestId: string, tenantId?: string): PendingApprovalRequest | undefined {
  const item = pendingApprovalRequests.find((request) => request.approvalRequestId === approvalRequestId);
  if (!item) return undefined;
  if (tenantId && item.tenantId !== tenantId) return undefined;
  return item;
}

export function listApprovalRequests(tenantId?: string): PendingApprovalRequest[] {
  if (!tenantId) return [...pendingApprovalRequests];
  return pendingApprovalRequests.filter((item) => item.tenantId === tenantId);
}

export function approveApprovalRequest(input: {
  approvalRequestId: string;
  tenantId: string;
  approvedBy: string;
  approvedAt?: string;
  executionId?: string;
  outboxJobId?: string;
  bridgeReasons?: string[];
  bridgeTransactionMode?: string;
  bridgePersistenceMode?: string;
}): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
  const item = pendingApprovalRequests.find((request) => request.approvalRequestId === input.approvalRequestId);
  if (!item) {
    return { ok: false, reason: "approval_not_found" };
  }
  if (item.tenantId !== input.tenantId) {
    return { ok: false, reason: "tenant_mismatch" };
  }
  if (item.status === "approved") {
    return { ok: false, reason: "approval_already_approved" };
  }
  if (item.status === "rejected") {
    return { ok: false, reason: "approval_already_rejected" };
  }

  item.status = "approved";
  item.approvedBy = input.approvedBy;
  item.approvedAt = input.approvedAt ?? new Date().toISOString();
  item.executionId = input.executionId;
  item.outboxJobId = input.outboxJobId;
  item.bridgeReasons = input.bridgeReasons;
  item.bridgeTransactionMode = input.bridgeTransactionMode;
  item.bridgePersistenceMode = input.bridgePersistenceMode;
  return { ok: true, item };
}

export function rejectApprovalRequest(input: {
  approvalRequestId: string;
  tenantId: string;
  rejectedBy: string;
  rejectedAt?: string;
  reason?: string;
}): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
  const item = pendingApprovalRequests.find((request) => request.approvalRequestId === input.approvalRequestId);
  if (!item) {
    return { ok: false, reason: "approval_not_found" };
  }
  if (item.tenantId !== input.tenantId) {
    return { ok: false, reason: "tenant_mismatch" };
  }
  if (item.status === "rejected") {
    return { ok: false, reason: "approval_already_rejected" };
  }
  if (item.status === "approved") {
    return { ok: false, reason: "approval_already_approved" };
  }

  item.status = "rejected";
  item.rejectedBy = input.rejectedBy;
  item.rejectedAt = input.rejectedAt ?? new Date().toISOString();
  item.rejectReason = input.reason;
  return { ok: true, item };
}

export function resetPendingApprovalRequests() {
  pendingApprovalRequests.length = 0;
  approvalSequence = 0;
}
