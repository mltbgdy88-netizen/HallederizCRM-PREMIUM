export type ApprovalInboxStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";

export type ApprovalInboxStatusFilter = "all" | ApprovalInboxStatus;

export interface ApprovalInboxItem {
  approvalRequestId: string;
  tenantId: string;
  actorId: string;
  actionKey: string;
  status: ApprovalInboxStatus;
  reasons: string[];
  payload?: Record<string, unknown>;
  idempotencyKey: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
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

export interface ApprovalListResponse {
  items: ApprovalInboxItem[];
  total: number;
  repositoryMode?: string;
}

export interface ApprovalDetailResponse {
  item: ApprovalInboxItem;
}

export interface ApprovalActionResponse {
  ok?: boolean;
  duplicate?: boolean;
  approvalRequestId?: string;
  status?: string;
  executionId?: string;
  outboxJobId?: string;
  approvalPersistenceMode?: string;
  reasons?: string[];
  bridgeResult?: {
    transactionMode?: string;
    persistenceMode?: string;
    outboxJobEnqueued?: boolean;
    outboxDuplicate?: boolean;
    reasons?: string[];
  };
  error?: string;
  message?: string;
}

export interface WorkerHealthResponse {
  ok: boolean;
  tenantId?: string;
  workerPersistenceMode?: string;
  health?: {
    ok: boolean;
    mode: string;
    workerId: string;
    persistenceMode: string;
    summary?: {
      processed: number;
      completed: number;
      failed: number;
      deadLettered: number;
      retried: number;
      noJob: boolean;
    };
    reasons?: string[];
  };
  error?: string;
  message?: string;
  reasons?: string[];
  productionSafety?: {
    ok?: boolean;
    blockers?: string[];
    labels?: string[];
    reasons?: string[];
    signals?: Record<string, boolean | string>;
  };
}

export type ApprovalClientErrorKind = "network" | "unauthorized" | "forbidden" | "unsupported" | "not_found" | "unknown";

export interface ApprovalClientError {
  kind: ApprovalClientErrorKind;
  status?: number;
  message: string;
  reasons?: string[];
}
