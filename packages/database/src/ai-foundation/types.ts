export type AiFoundationSource = "crm_ui" | "whatsapp" | "voice" | "system";
export type AiProposalStatus = "draft" | "waiting_approval" | "approved" | "rejected" | "executed" | "failed" | "cancelled";
export type AiRiskLevel = "low" | "medium" | "high" | "critical";
export type AiOperationRiskClass = "L0_READ_ONLY" | "L1_DRAFT" | "L2_BUSINESS_MUTATION" | "L3_EXTERNAL_SIDE_EFFECT";
export type ApprovalTicketStatus = "pending" | "approved" | "rejected" | "expired" | "executing" | "executed" | "failed" | "cancelled";
export type ApprovalSourceType = "ai_proposal" | "whatsapp_action" | "manual_operation" | "system";
export type OutboxEventStatus = "pending" | "processing" | "sent" | "failed" | "dead_lettered" | "cancelled";
export type InboxEventStatus = "received" | "processing" | "processed" | "duplicate" | "rejected" | "failed";
export type IdempotencyKeyStatus = "reserved" | "completed" | "failed" | "expired";

export interface AuditEventInsert {
  tenantId: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  correlationId?: string;
  requestId?: string;
  source?: string;
  severity?: "info" | "warning" | "critical";
  summary: string;
  payloadRedacted?: Record<string, unknown>;
}

export interface OutboxEventInsert {
  tenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  nextAttemptAt?: string;
}

export interface InboxEventInsert {
  tenantId: string;
  provider: string;
  providerEventId: string;
  contentHash?: string;
  payloadRedacted?: Record<string, unknown>;
}

export interface IdempotencyKeyInsert {
  tenantId: string;
  scope: string;
  key: string;
  expiresAt: string;
  resultRefType?: string;
  resultRefId?: string;
}

export interface AiProposalInsert {
  tenantId: string;
  proposalNo: string;
  sessionId?: string;
  source?: AiFoundationSource;
  status?: AiProposalStatus;
  schemaVersion: string;
  language?: "tr-TR";
  reply: string;
  confidence: number;
  riskLevel: AiRiskLevel;
  requiresApproval: boolean;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  requestedBy?: string;
}

export interface AiProposalOperationInsert {
  tenantId: string;
  proposalId: string;
  operationType: string;
  riskClass: AiOperationRiskClass;
  idempotencyKey: string;
  summary: string;
  requiresApproval: boolean;
  confidence: number;
  target?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  reasons?: string[];
  sortOrder?: number;
}

export interface AiProposalValidationInsert {
  tenantId: string;
  proposalId?: string;
  status: "valid" | "invalid" | "rejected";
  validator: string;
  issues?: Array<Record<string, unknown>>;
}

export interface AiPromptAuditInsert {
  tenantId: string;
  proposalId?: string;
  promptHash: string;
  snapshotHash: string;
  modelProvider?: string;
  modelName?: string;
  piiMinimized?: boolean;
}

export interface ApprovalPolicyInsert {
  tenantId: string;
  operationType: string;
  requiredRole: string;
  minApproverCount?: number;
  riskLevel?: AiRiskLevel;
  active?: boolean;
}

export interface ApprovalTicketInsert {
  tenantId: string;
  ticketNo: string;
  policyId?: string;
  sourceType: ApprovalSourceType;
  sourceId: string;
  operationType: string;
  status?: ApprovalTicketStatus;
  requiredRole: string;
  requestedBy?: string;
  expiresAt?: string;
  riskLevel?: AiRiskLevel;
  payloadSummary: string;
  payload?: Record<string, unknown>;
}

export interface ApprovalAttemptInsert {
  tenantId: string;
  ticketId: string;
  actorUserId?: string;
  actorPhoneHash?: string;
  decision: "approve" | "reject" | "review" | "execute" | "invalid";
  accepted: boolean;
  reason?: string;
}

export interface ApprovalExecutionInsert {
  tenantId: string;
  ticketId: string;
  proposalId?: string;
  status?: "pending" | "authorized" | "running" | "executed" | "failed" | "cancelled";
  operationType: string;
  idempotencyKey: string;
  requestedBy?: string;
  authorizedBy?: string;
  authorizedAt?: string;
}

export interface ApprovalExecutionStepInsert {
  tenantId: string;
  executionId: string;
  stepKey: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  message?: string;
  payload?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}
