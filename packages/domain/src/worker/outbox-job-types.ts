export const STANDARD_OUTBOX_JOB_TYPES = [
  "approval.execution.dispatch",
  "approval_execution",
  "document.send",
  "document.archive",
  "document_render",
  "document_archive",
  "omnichannel.reply.dispatch",
  "ai_reply_send",
  "erp.sync",
  "integration_sync",
  "factory.order.dispatch",
  "audit.timeline.writeback"
] as const;

export type StandardOutboxJobType = (typeof STANDARD_OUTBOX_JOB_TYPES)[number];

export interface StandardOutboxJobPayload {
  tenantId: string;
  actionKey: string;
  entityType?: string;
  entityId?: string;
  approvalRequestId?: string;
  approvalId?: string;
  executionLogId?: string;
  idempotencyKey: string;
  actorId?: string;
  payload?: Record<string, unknown>;
  createdAt?: string;
}

export function validateStandardOutboxPayload(payload: Record<string, unknown> | undefined): string[] {
  const reasons: string[] = [];
  if (!payload || typeof payload !== "object") {
    return ["missing_payload"];
  }
  if (typeof payload.tenantId !== "string" || !payload.tenantId.trim()) {
    reasons.push("missing_tenant_id");
  }
  if (typeof payload.actionKey !== "string" || !payload.actionKey.trim()) {
    reasons.push("missing_action_key");
  }
  if (typeof payload.idempotencyKey !== "string" || !payload.idempotencyKey.trim()) {
    reasons.push("missing_idempotency_key");
  }
  return reasons;
}

export function validateStandardJobPayload(
  jobType: string,
  payload: Record<string, unknown> | undefined
): string[] {
  const base = validateStandardOutboxPayload(payload);
  if (base.length > 0) {
    return base;
  }
  const record = payload as Record<string, unknown>;

  if (jobType === "approval_execution" || jobType === "approval.execution.dispatch") {
    const approvalId =
      (typeof record.approvalRequestId === "string" && record.approvalRequestId) ||
      (typeof record.approvalId === "string" && record.approvalId);
    if (!approvalId) {
      base.push("missing_approval_id");
    }
  }

  if (jobType === "document_render" || jobType === "document_archive") {
    const documentId = typeof record.documentId === "string" ? record.documentId : record.entityId;
    if (typeof documentId !== "string" || !documentId.trim()) {
      base.push("missing_document_id");
    }
  }

  if (jobType === "ai_reply_send" || jobType === "omnichannel.reply.dispatch") {
    const conversationId =
      typeof record.conversationId === "string"
        ? record.conversationId
        : record.entityType === "conversation"
          ? record.entityId
          : undefined;
    if (typeof conversationId !== "string" || !conversationId.trim()) {
      base.push("missing_conversation_id");
    }
  }

  if (jobType === "integration_sync" || jobType === "erp.sync") {
    if (typeof record.integrationKind !== "string" && typeof record.syncTarget !== "string") {
      base.push("missing_integration_target");
    }
  }

  return base;
}

export function isStandardOutboxJobType(jobType: string): jobType is StandardOutboxJobType {
  return (STANDARD_OUTBOX_JOB_TYPES as readonly string[]).includes(jobType);
}
