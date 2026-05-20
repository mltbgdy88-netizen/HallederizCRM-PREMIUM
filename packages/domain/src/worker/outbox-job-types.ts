export const STANDARD_OUTBOX_JOB_TYPES = [
  "approval.execution.dispatch",
  "document.send",
  "document.archive",
  "document.render",
  "omnichannel.reply.dispatch",
  "erp.sync",
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
