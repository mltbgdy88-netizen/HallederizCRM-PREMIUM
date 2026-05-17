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
  /** Present after approve bridge when API returns enriched item */
  approvalPersisted?: boolean;
  workerProcessingRecommended?: boolean;
  auditTimelineWritebackQueued?: boolean;
  gateDecision?: Record<string, unknown>;
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
  approvalStatus?: string;
  executionId?: string;
  outboxJobId?: string;
  approvalPersistenceMode?: string;
  bridgeMode?: string;
  outboxMode?: string;
  outboxQueued?: boolean;
  workerProcessingRecommended?: boolean;
  auditTimelineWritebackQueued?: boolean;
  gateDecision?: Record<string, unknown>;
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

export interface ApprovalSandboxAvailabilityResponse {
  sandboxSeedAvailable: boolean;
  sandboxSeedRouteEnabled: boolean;
  approvalRepositoryReady: boolean;
  approvalPersistenceMode?: string;
  reasons?: string[];
}

export interface ApprovalSandboxSeedSkipped {
  idempotencyKey: string;
  approvalRequestId: string;
  status: string;
}

export interface ApprovalSandboxSeedResponse {
  ok: boolean;
  repositoryMode?: string;
  created?: ApprovalInboxItem[];
  skipped?: ApprovalSandboxSeedSkipped[];
  error?: string;
  message?: string;
}

/** /worker/outbox ve /worker/dead-letter satirlari (API WorkerJob JSON). */
export interface WorkerOutboxJobSnapshot {
  jobId: string;
  tenantId?: string;
  jobType: string;
  actionKey?: string;
  status: string;
  attempts?: number;
  maxAttempts?: number;
  idempotencyKey?: string;
  deadLetterReason?: string;
  lastError?: string;
}

export interface WorkerJobListResponse {
  items: WorkerOutboxJobSnapshot[];
  total: number;
  workerPersistenceMode?: string;
}

export interface WorkerHealthResponse {
  ok: boolean;
  tenantId?: string;
  /** /worker/health — tenant outbox + DLQ sayimlari */
  counts?: {
    pending: number;
    claimed: number;
    failed: number;
    deadLetter: number;
  };
  /** Present on /worker/safety — operator smoke uses for security signals */
  providerWritesEnabled?: boolean;
  realExecutionEnabled?: boolean;
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
      duplicates?: number;
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

export type ApprovalClientErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "unsupported"
  | "not_found"
  | "conflict"
  | "invalid_request"
  | "unknown";

export interface ApprovalClientError {
  kind: ApprovalClientErrorKind;
  status?: number;
  message: string;
  reasons?: string[];
}
