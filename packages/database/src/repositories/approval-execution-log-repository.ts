import type { QueryExecutor, QueryResultRow } from "../types";

export interface ApprovalExecutionLogEntryRecord {
  executionId: string;
  tenantId: string;
  approvalRequestId: string;
  actionKey: string;
  actorId: string;
  approvedBy: string;
  status: "executed" | "blocked" | "unsupported_action" | "duplicate" | "failed";
  mode: "noop" | "dry_run" | "execute";
  idempotencyKey: string;
  auditRequired: boolean;
  timelineRequired: boolean;
  reasons: string[];
  createdAt: string;
  completedAt?: string;
  handlerKey: string;
  handlerMode: "noop" | "dry_run" | "execute";
}

export interface ApprovalExecutionEventDraftPayloadRecord {
  tenantId: string;
  actionKey: string;
  approvalRequestId: string;
  executionId: string;
  status: "executed" | "blocked" | "unsupported_action" | "duplicate" | "failed";
  idempotencyKey: string;
  handlerKey: string;
  handlerMode: "noop" | "dry_run" | "execute";
  reasons: string[];
}

export interface ApprovalExecutionAuditEventDraftRecord {
  eventKey: "approval.execution.audit";
  payload: ApprovalExecutionEventDraftPayloadRecord;
  createdAt: string;
  eventId?: string;
}

export interface ApprovalExecutionTimelineEventDraftRecord {
  eventKey: "approval.execution.timeline";
  payload: ApprovalExecutionEventDraftPayloadRecord;
  createdAt: string;
  eventId?: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

interface ApprovalExecutionLogRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  approval_request_id: string;
  action_key: string;
  actor_id: string;
  approved_by: string;
  status: ApprovalExecutionLogEntryRecord["status"];
  mode: ApprovalExecutionLogEntryRecord["mode"];
  idempotency_key: string;
  audit_required: boolean;
  timeline_required: boolean;
  reasons: unknown;
  created_at: string;
  completed_at: string | null;
  handler_key: string;
  handler_mode: ApprovalExecutionLogEntryRecord["handlerMode"];
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function assertNonEmpty(value: string, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function validateExecutionLogEntry(entry: ApprovalExecutionLogEntryRecord) {
  assertNonEmpty(entry.executionId, "execution_id");
  assertNonEmpty(entry.tenantId, "tenant_id");
  assertNonEmpty(entry.approvalRequestId, "approval_request_id");
  assertNonEmpty(entry.actionKey, "action_key");
  assertNonEmpty(entry.idempotencyKey, "idempotency_key");
  assertNonEmpty(entry.handlerKey, "handler_key");
}

function validateDraftPayload(payload: ApprovalExecutionEventDraftPayloadRecord) {
  assertNonEmpty(payload.tenantId, "tenant_id");
  assertNonEmpty(payload.actionKey, "action_key");
  assertNonEmpty(payload.approvalRequestId, "approval_request_id");
  assertNonEmpty(payload.executionId, "execution_id");
  assertNonEmpty(payload.idempotencyKey, "idempotency_key");
}

export function mapExecutionLogEntryToSqlParams(entry: ApprovalExecutionLogEntryRecord): unknown[] {
  validateExecutionLogEntry(entry);
  return [
    entry.executionId,
    entry.tenantId,
    entry.approvalRequestId,
    entry.actionKey,
    entry.actorId,
    entry.approvedBy,
    entry.status,
    entry.mode,
    entry.idempotencyKey,
    entry.auditRequired,
    entry.timelineRequired,
    stringifyJson(entry.reasons),
    stringifyJson({
      actorId: entry.actorId,
      approvedBy: entry.approvedBy,
      actionKey: entry.actionKey
    }),
    entry.handlerKey,
    entry.handlerMode,
    entry.createdAt,
    entry.completedAt ?? null
  ];
}

export function mapExecutionLogRowToDomainRecord(row: ApprovalExecutionLogRow): ApprovalExecutionLogEntryRecord {
  return {
    executionId: row.id,
    tenantId: row.tenant_id,
    approvalRequestId: row.approval_request_id,
    actionKey: row.action_key,
    actorId: row.actor_id,
    approvedBy: row.approved_by,
    status: row.status,
    mode: row.mode,
    idempotencyKey: row.idempotency_key,
    auditRequired: row.audit_required,
    timelineRequired: row.timeline_required,
    reasons: parseStringArray(row.reasons),
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    handlerKey: row.handler_key,
    handlerMode: row.handler_mode
  };
}

export class DatabaseApprovalExecutionLogRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("db_repository_postgres_mode_required");
    }
  }

  async saveExecutionLog(entry: ApprovalExecutionLogEntryRecord): Promise<ApprovalExecutionLogEntryRecord> {
    this.assertPersistenceSupported();
    const params = mapExecutionLogEntryToSqlParams(entry);
    const rows = await this.executor.query<ApprovalExecutionLogRow>(
      `INSERT INTO approval_execution_logs (
        id, tenant_id, approval_request_id, action_key, actor_id, approved_by, status, mode, idempotency_key,
        audit_required, timeline_required, reasons, payload, handler_key, handler_mode, created_at, completed_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12::jsonb,$13::jsonb,$14,$15,$16::timestamptz,$17::timestamptz, now()
      )
      ON CONFLICT (tenant_id, idempotency_key)
      DO UPDATE SET
        approval_request_id = EXCLUDED.approval_request_id,
        action_key = EXCLUDED.action_key,
        actor_id = EXCLUDED.actor_id,
        approved_by = EXCLUDED.approved_by,
        status = EXCLUDED.status,
        mode = EXCLUDED.mode,
        audit_required = EXCLUDED.audit_required,
        timeline_required = EXCLUDED.timeline_required,
        reasons = EXCLUDED.reasons,
        payload = EXCLUDED.payload,
        handler_key = EXCLUDED.handler_key,
        handler_mode = EXCLUDED.handler_mode,
        completed_at = EXCLUDED.completed_at,
        updated_at = now()
      RETURNING
        id, tenant_id, approval_request_id, action_key, actor_id, approved_by, status, mode, idempotency_key,
        audit_required, timeline_required, reasons, created_at, completed_at, handler_key, handler_mode`,
      params
    );
    if (!rows[0]) {
      throw new Error("execution_log_insert_failed");
    }
    return mapExecutionLogRowToDomainRecord(rows[0]);
  }

  async saveAuditEventDraft(event: ApprovalExecutionAuditEventDraftRecord): Promise<ApprovalExecutionAuditEventDraftRecord> {
    this.assertPersistenceSupported();
    validateDraftPayload(event.payload);
    await this.executor.query(
      `INSERT INTO audit_events (
        tenant_id, actor_user_id, actor_id, action, action_key, entity_type, entity_id, source, event_type, summary, payload_redacted, payload, correlation_id, idempotency_key, created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13,$14,$15::timestamptz
      )`,
      [
        event.payload.tenantId,
        null,
        null,
        event.payload.actionKey,
        event.payload.actionKey,
        "approval_execution",
        event.payload.executionId,
        "approval_dispatcher",
        event.eventKey,
        `approval execution audit event for ${event.payload.executionId}`,
        stringifyJson({
          reasons: event.payload.reasons
        }),
        stringifyJson(event.payload),
        event.payload.approvalRequestId,
        event.payload.idempotencyKey,
        event.createdAt
      ]
    );
    return {
      ...event,
      eventId: event.eventId ?? `audit_${event.payload.executionId}`
    };
  }

  async saveTimelineEventDraft(
    event: ApprovalExecutionTimelineEventDraftRecord
  ): Promise<ApprovalExecutionTimelineEventDraftRecord> {
    this.assertPersistenceSupported();
    validateDraftPayload(event.payload);
    await this.executor.query(
      `INSERT INTO timeline_events (
        id, tenant_id, subject_type, subject_id, actor_id, action_key, event_type, title, description, payload, correlation_id, idempotency_key, created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::timestamptz
      )`,
      [
        `timeline_${event.payload.executionId}`,
        event.payload.tenantId,
        "approval_execution",
        event.payload.executionId,
        null,
        event.payload.actionKey,
        event.eventKey,
        "Approval Execution Timeline Draft",
        `Draft timeline event for ${event.payload.executionId}`,
        stringifyJson(event.payload),
        event.payload.approvalRequestId,
        event.payload.idempotencyKey,
        event.createdAt
      ]
    );
    return {
      ...event,
      eventId: event.eventId ?? `timeline_${event.payload.executionId}`
    };
  }

  async findByIdempotencyKey(
    tenantId: string,
    idempotencyKey: string
  ): Promise<ApprovalExecutionLogEntryRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(idempotencyKey, "idempotency_key");
    const rows = await this.executor.query<ApprovalExecutionLogRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, approved_by, status, mode, idempotency_key,
        audit_required, timeline_required, reasons, created_at, completed_at, handler_key, handler_mode
      FROM approval_execution_logs
      WHERE tenant_id = $1 AND idempotency_key = $2
      LIMIT 1`,
      [tenantId, idempotencyKey]
    );
    return rows[0] ? mapExecutionLogRowToDomainRecord(rows[0]) : undefined;
  }

  async getExecutionLog(executionId: string): Promise<ApprovalExecutionLogEntryRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(executionId, "execution_id");
    const rows = await this.executor.query<ApprovalExecutionLogRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, approved_by, status, mode, idempotency_key,
        audit_required, timeline_required, reasons, created_at, completed_at, handler_key, handler_mode
      FROM approval_execution_logs
      WHERE id = $1
      LIMIT 1`,
      [executionId]
    );
    return rows[0] ? mapExecutionLogRowToDomainRecord(rows[0]) : undefined;
  }
}
