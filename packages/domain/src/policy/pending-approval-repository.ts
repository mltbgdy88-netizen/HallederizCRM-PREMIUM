export type PendingApprovalRequestStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";

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
  status: PendingApprovalRequestStatus;
  createdAt: string;
  updatedAt: string;
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

export interface PendingApprovalMarkApprovedInput {
  approvalRequestId: string;
  tenantId: string;
  approvedBy: string;
  approvedAt?: string;
  executionId?: string;
  outboxJobId?: string;
  bridgeReasons?: string[];
  bridgeTransactionMode?: string;
  bridgePersistenceMode?: string;
}

export interface PendingApprovalMarkRejectedInput {
  approvalRequestId: string;
  tenantId: string;
  rejectedBy: string;
  rejectedAt?: string;
  reason?: string;
}

export interface PendingApprovalRepository {
  createPendingApprovalRequest: (
    input: PendingApprovalRequestInput & { approvalRequestId?: string }
  ) => PendingApprovalRequest;
  getPendingApprovalRequest: (approvalRequestId: string, tenantId: string) => PendingApprovalRequest | undefined;
  listPendingApprovalRequests: (tenantId: string) => PendingApprovalRequest[];
  listApprovalRequests: (tenantId: string) => PendingApprovalRequest[];
  markPendingApprovalApproved: (
    input: PendingApprovalMarkApprovedInput
  ) => { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string };
  markPendingApprovalRejected: (
    input: PendingApprovalMarkRejectedInput
  ) => { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string };
  findByIdempotencyKey: (tenantId: string, idempotencyKey: string) => PendingApprovalRequest | undefined;
  reset: () => void;
}

function assertNonEmpty(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function makeTenantScopedKey(tenantId: string, key: string) {
  return `${tenantId}:${key}`;
}

export class InMemoryPendingApprovalRepository implements PendingApprovalRepository {
  private approvalsById = new Map<string, PendingApprovalRequest>();
  private approvalsByIdempotency = new Map<string, PendingApprovalRequest>();
  private approvalOrder: string[] = [];
  private sequence = 0;

  createPendingApprovalRequest(input: PendingApprovalRequestInput & { approvalRequestId?: string }): PendingApprovalRequest {
    assertNonEmpty(input.tenantId, "tenant_id");
    assertNonEmpty(input.actorId, "actor_id");
    assertNonEmpty(input.actionKey, "action_key");
    const reasons = Array.isArray(input.reasons) ? input.reasons : [];

    this.sequence += 1;
    const approvalRequestId = input.approvalRequestId ?? `apr_req_${this.sequence}`;
    const idempotencyKey = input.idempotencyKey ?? `apr_idem_${this.sequence}`;
    const scopedIdempotency = makeTenantScopedKey(input.tenantId, idempotencyKey);

    const existingById = this.approvalsById.get(approvalRequestId);
    if (existingById) {
      if (existingById.tenantId !== input.tenantId) {
        throw new Error("tenant_mismatch");
      }
      return existingById;
    }

    const existingByIdempotency = this.approvalsByIdempotency.get(scopedIdempotency);
    if (existingByIdempotency) {
      return existingByIdempotency;
    }

    const now = new Date().toISOString();
    const created: PendingApprovalRequest = {
      approvalRequestId,
      tenantId: input.tenantId,
      actorId: input.actorId,
      actionKey: input.actionKey,
      reasons,
      payload: input.payload ?? {},
      idempotencyKey,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      requestedAt: input.requestedAt ?? now,
      auditRequired: input.auditRequired ?? true,
      timelineRequired: input.timelineRequired ?? true
    };

    this.approvalsById.set(created.approvalRequestId, created);
    this.approvalsByIdempotency.set(scopedIdempotency, created);
    this.approvalOrder.unshift(created.approvalRequestId);
    return created;
  }

  getPendingApprovalRequest(approvalRequestId: string, tenantId: string): PendingApprovalRequest | undefined {
    assertNonEmpty(approvalRequestId, "approval_request_id");
    assertNonEmpty(tenantId, "tenant_id");
    const item = this.approvalsById.get(approvalRequestId);
    if (!item) return undefined;
    if (item.tenantId !== tenantId) return undefined;
    return item;
  }

  listPendingApprovalRequests(tenantId: string): PendingApprovalRequest[] {
    assertNonEmpty(tenantId, "tenant_id");
    return this.listApprovalRequests(tenantId).filter((item) => item.status === "pending");
  }

  listApprovalRequests(tenantId: string): PendingApprovalRequest[] {
    assertNonEmpty(tenantId, "tenant_id");
    return this.approvalOrder
      .map((id) => this.approvalsById.get(id))
      .filter((item): item is PendingApprovalRequest => Boolean(item))
      .filter((item) => item.tenantId === tenantId);
  }

  markPendingApprovalApproved(
    input: PendingApprovalMarkApprovedInput
  ): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
    assertNonEmpty(input.approvalRequestId, "approval_request_id");
    assertNonEmpty(input.tenantId, "tenant_id");
    assertNonEmpty(input.approvedBy, "approved_by");

    const item = this.approvalsById.get(input.approvalRequestId);
    if (!item) return { ok: false, reason: "approval_not_found" };
    if (item.tenantId !== input.tenantId) return { ok: false, reason: "tenant_mismatch" };
    if (item.status === "approved") return { ok: false, reason: "approval_already_approved" };
    if (item.status === "rejected") return { ok: false, reason: "approval_already_rejected" };
    if (item.status !== "pending") return { ok: false, reason: "approval_not_pending" };

    const approvedAt = input.approvedAt ?? new Date().toISOString();
    const updated: PendingApprovalRequest = {
      ...item,
      status: "approved",
      approvedBy: input.approvedBy,
      approvedAt,
      executionId: input.executionId,
      outboxJobId: input.outboxJobId,
      bridgeReasons: input.bridgeReasons,
      bridgeTransactionMode: input.bridgeTransactionMode,
      bridgePersistenceMode: input.bridgePersistenceMode,
      updatedAt: approvedAt
    };

    this.approvalsById.set(updated.approvalRequestId, updated);
    this.approvalsByIdempotency.set(makeTenantScopedKey(updated.tenantId, updated.idempotencyKey), updated);
    return { ok: true, item: updated };
  }

  markPendingApprovalRejected(
    input: PendingApprovalMarkRejectedInput
  ): { ok: true; item: PendingApprovalRequest } | { ok: false; reason: string } {
    assertNonEmpty(input.approvalRequestId, "approval_request_id");
    assertNonEmpty(input.tenantId, "tenant_id");
    assertNonEmpty(input.rejectedBy, "rejected_by");

    const item = this.approvalsById.get(input.approvalRequestId);
    if (!item) return { ok: false, reason: "approval_not_found" };
    if (item.tenantId !== input.tenantId) return { ok: false, reason: "tenant_mismatch" };
    if (item.status === "rejected") return { ok: false, reason: "approval_already_rejected" };
    if (item.status === "approved") return { ok: false, reason: "approval_already_approved" };
    if (item.status !== "pending") return { ok: false, reason: "approval_not_pending" };

    const rejectedAt = input.rejectedAt ?? new Date().toISOString();
    const updated: PendingApprovalRequest = {
      ...item,
      status: "rejected",
      rejectedBy: input.rejectedBy,
      rejectedAt,
      rejectReason: input.reason,
      updatedAt: rejectedAt
    };

    this.approvalsById.set(updated.approvalRequestId, updated);
    this.approvalsByIdempotency.set(makeTenantScopedKey(updated.tenantId, updated.idempotencyKey), updated);
    return { ok: true, item: updated };
  }

  findByIdempotencyKey(tenantId: string, idempotencyKey: string): PendingApprovalRequest | undefined {
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(idempotencyKey, "idempotency_key");
    return this.approvalsByIdempotency.get(makeTenantScopedKey(tenantId, idempotencyKey));
  }

  reset() {
    this.approvalsById.clear();
    this.approvalsByIdempotency.clear();
    this.approvalOrder = [];
    this.sequence = 0;
  }
}
