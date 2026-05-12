import type { ApprovalExecutionLogRepository } from "./persistence";
import type { ExecutionAuditEventDraft, ExecutionTimelineEventDraft } from "./execution-log";

export interface AuditTimelineWritebackPayload {
  tenantId: string;
  approvalRequestId: string;
  executionId: string;
  actionKey: string;
  idempotencyKey?: string;
  auditEvent?: ExecutionAuditEventDraft;
  timelineEvent?: ExecutionTimelineEventDraft;
}

export interface AuditTimelineWritebackValidationResult {
  ok: boolean;
  reasons: string[];
}

export interface AuditTimelineWritebackResult {
  ok: boolean;
  auditPersisted: boolean;
  timelinePersisted: boolean;
  auditEventId?: string;
  timelineEventId?: string;
  mode: "direct" | "foundation";
  persistenceMode: "repository" | "none" | "unsupported";
  reasons: string[];
}

export interface WriteBackAuditTimelineDraftsOptions {
  repository?: ApprovalExecutionLogRepository | null;
  mode?: "direct" | "foundation";
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateAuditTimelineWritebackPayload(
  payload: AuditTimelineWritebackPayload
): AuditTimelineWritebackValidationResult {
  const reasons: string[] = [];

  if (!hasText(payload.tenantId)) reasons.push("missing_tenant_id");
  if (!hasText(payload.executionId)) reasons.push("missing_execution_id");
  if (!hasText(payload.actionKey)) reasons.push("missing_action_key");
  if (!hasText(payload.approvalRequestId)) reasons.push("missing_approval_request_id");
  if (!payload.auditEvent && !payload.timelineEvent) reasons.push("missing_audit_and_timeline_drafts");

  if (payload.auditEvent?.payload.executionId && payload.auditEvent.payload.executionId !== payload.executionId) {
    reasons.push("audit_execution_id_mismatch");
  }
  if (payload.timelineEvent?.payload.executionId && payload.timelineEvent.payload.executionId !== payload.executionId) {
    reasons.push("timeline_execution_id_mismatch");
  }
  if (payload.auditEvent?.payload.tenantId && payload.auditEvent.payload.tenantId !== payload.tenantId) {
    reasons.push("audit_tenant_id_mismatch");
  }
  if (payload.timelineEvent?.payload.tenantId && payload.timelineEvent.payload.tenantId !== payload.tenantId) {
    reasons.push("timeline_tenant_id_mismatch");
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}

export function buildAuditTimelineWritebackPayload(input: {
  tenantId: string;
  approvalRequestId: string;
  executionId: string;
  actionKey: string;
  idempotencyKey?: string;
  auditEvent?: ExecutionAuditEventDraft;
  timelineEvent?: ExecutionTimelineEventDraft;
}): AuditTimelineWritebackPayload {
  return {
    tenantId: input.tenantId,
    approvalRequestId: input.approvalRequestId,
    executionId: input.executionId,
    actionKey: input.actionKey,
    idempotencyKey: input.idempotencyKey,
    auditEvent: input.auditEvent,
    timelineEvent: input.timelineEvent
  };
}

export function writeBackAuditTimelineDrafts(
  payload: AuditTimelineWritebackPayload,
  options: WriteBackAuditTimelineDraftsOptions = {}
): AuditTimelineWritebackResult {
  const mode = options.mode ?? "foundation";
  const validation = validateAuditTimelineWritebackPayload(payload);
  if (!validation.ok) {
    return {
      ok: false,
      auditPersisted: false,
      timelinePersisted: false,
      mode,
      persistenceMode: "none",
      reasons: validation.reasons
    };
  }

  const repository = options.repository;
  if (!repository) {
    return {
      ok: false,
      auditPersisted: false,
      timelinePersisted: false,
      mode,
      persistenceMode: "unsupported",
      reasons: ["missing_writeback_repository"]
    };
  }

  let savedAudit: ExecutionAuditEventDraft | undefined;
  let savedTimeline: ExecutionTimelineEventDraft | undefined;

  try {
    if (payload.auditEvent) {
      savedAudit = repository.saveAuditEventDraft({
        ...payload.auditEvent,
        eventId: payload.auditEvent.eventId ?? `audit_${payload.executionId}`
      });
    }
    if (payload.timelineEvent) {
      savedTimeline = repository.saveTimelineEventDraft({
        ...payload.timelineEvent,
        eventId: payload.timelineEvent.eventId ?? `timeline_${payload.executionId}`
      });
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "audit_timeline_writeback_failed";
    return {
      ok: false,
      auditPersisted: Boolean(savedAudit),
      timelinePersisted: Boolean(savedTimeline),
      auditEventId: savedAudit?.eventId,
      timelineEventId: savedTimeline?.eventId,
      mode,
      persistenceMode: "repository",
      reasons: ["audit_timeline_writeback_failed", reason]
    };
  }

  if ((payload.auditEvent && !savedAudit) || (payload.timelineEvent && !savedTimeline)) {
    return {
      ok: false,
      auditPersisted: Boolean(savedAudit),
      timelinePersisted: Boolean(savedTimeline),
      auditEventId: savedAudit?.eventId,
      timelineEventId: savedTimeline?.eventId,
      mode,
      persistenceMode: "repository",
      reasons: ["audit_timeline_partial_persistence"]
    };
  }

  return {
    ok: true,
    auditPersisted: Boolean(savedAudit),
    timelinePersisted: Boolean(savedTimeline),
    auditEventId: savedAudit?.eventId,
    timelineEventId: savedTimeline?.eventId,
    mode,
    persistenceMode: "repository",
    reasons: ["audit_timeline_writeback_completed"]
  };
}
