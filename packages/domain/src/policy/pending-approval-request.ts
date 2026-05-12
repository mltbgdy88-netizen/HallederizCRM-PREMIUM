export interface PendingApprovalRequestInput {
  tenantId: string;
  actorId: string;
  actionKey: string;
  reasons: string[];
}

export interface PendingApprovalRequest extends PendingApprovalRequestInput {
  approvalRequestId: string;
  status: "pending";
  createdAt: string;
}

const pendingApprovalRequests: PendingApprovalRequest[] = [];

export function createPendingApprovalRequest(input: PendingApprovalRequestInput): PendingApprovalRequest {
  const approvalRequest: PendingApprovalRequest = {
    approvalRequestId: `apr_req_${pendingApprovalRequests.length + 1}`,
    tenantId: input.tenantId,
    actorId: input.actorId,
    actionKey: input.actionKey,
    reasons: input.reasons,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  pendingApprovalRequests.unshift(approvalRequest);
  return approvalRequest;
}

export function listPendingApprovalRequests(tenantId?: string): PendingApprovalRequest[] {
  if (!tenantId) return pendingApprovalRequests;
  return pendingApprovalRequests.filter((item) => item.tenantId === tenantId);
}
