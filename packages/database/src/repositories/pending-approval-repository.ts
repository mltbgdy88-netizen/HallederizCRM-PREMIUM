import type { QueryExecutor, QueryResultRow } from "../types";

export type DbPendingApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";

export interface DbPendingApprovalRequestRecord {
  id: string;
  tenantId: string;
  approvalRequestId: string;
  actionKey: string;
  actorId: string;
  status: DbPendingApprovalStatus;
  reasons: string[];
  payload: Record<string, unknown>;
  idempotencyKey?: string;
  requestedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
}

export interface DbPendingApprovalMarkApprovedInput {
  tenantId: string;
  approvalRequestId: string;
  approvedBy: string;
  approvedAt?: string;
}

export interface DbPendingApprovalMarkRejectedInput {
  tenantId: string;
  approvalRequestId: string;
  rejectedBy: string;
  rejectedAt?: string;
  rejectReason?: string;
}

interface PendingApprovalRequestRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  approval_request_id: string;
  action_key: string;
  actor_id: string;
  status: DbPendingApprovalStatus;
  reasons: unknown;
  payload: unknown;
  idempotency_key: string | null;
  requested_by: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  expires_at: string | null;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

export function createDatabasePendingApprovalRepository(options: DatabaseRepositoryOptions) {
  return new DatabasePendingApprovalRepository(options);
}

function assertNonEmpty(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
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

function parseObjectPayload(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

export function mapPendingApprovalRowToDomainRecord(row: PendingApprovalRequestRow): DbPendingApprovalRequestRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    approvalRequestId: row.approval_request_id,
    actionKey: row.action_key,
    actorId: row.actor_id,
    status: row.status,
    reasons: parseStringArray(row.reasons),
    payload: parseObjectPayload(row.payload),
    idempotencyKey: row.idempotency_key ?? undefined,
    requestedBy: row.requested_by ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    rejectedBy: row.rejected_by ?? undefined,
    rejectReason: row.reject_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    expiresAt: row.expires_at ?? undefined
  };
}

export function mapPendingApprovalDomainRecordToSqlParams(record: DbPendingApprovalRequestRecord): unknown[] {
  assertNonEmpty(record.id, "id");
  assertNonEmpty(record.tenantId, "tenant_id");
  assertNonEmpty(record.approvalRequestId, "approval_request_id");
  assertNonEmpty(record.actionKey, "action_key");
  assertNonEmpty(record.actorId, "actor_id");
  assertNonEmpty(record.status, "status");
  return [
    record.id,
    record.tenantId,
    record.approvalRequestId,
    record.actionKey,
    record.actorId,
    record.status,
    stringifyJson(record.reasons),
    stringifyJson(record.payload),
    record.idempotencyKey ?? null,
    record.requestedBy ?? record.actorId,
    record.approvedBy ?? null,
    record.rejectedBy ?? null,
    record.rejectReason ?? null,
    record.createdAt,
    record.updatedAt,
    record.approvedAt ?? null,
    record.rejectedAt ?? null,
    record.expiresAt ?? null
  ];
}

export class DatabasePendingApprovalRepository {
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

  async createPendingApprovalRequest(record: DbPendingApprovalRequestRecord): Promise<DbPendingApprovalRequestRecord> {
    this.assertPersistenceSupported();
    if (record.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(record.tenantId, record.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `INSERT INTO pending_approval_requests (
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14::timestamptz,$15::timestamptz,$16::timestamptz,$17::timestamptz,$18::timestamptz
      )
      ON CONFLICT (tenant_id, approval_request_id)
      DO UPDATE SET
        action_key = EXCLUDED.action_key,
        actor_id = EXCLUDED.actor_id,
        status = EXCLUDED.status,
        reasons = EXCLUDED.reasons,
        payload = EXCLUDED.payload,
        idempotency_key = EXCLUDED.idempotency_key,
        requested_by = EXCLUDED.requested_by,
        approved_by = EXCLUDED.approved_by,
        rejected_by = EXCLUDED.rejected_by,
        reject_reason = EXCLUDED.reject_reason,
        updated_at = EXCLUDED.updated_at,
        approved_at = EXCLUDED.approved_at,
        rejected_at = EXCLUDED.rejected_at,
        expires_at = EXCLUDED.expires_at
      RETURNING
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at`,
      mapPendingApprovalDomainRecordToSqlParams(record)
    );

    if (!rows[0]) {
      throw new Error("pending_approval_insert_failed");
    }
    return mapPendingApprovalRowToDomainRecord(rows[0]);
  }

  async getPendingApprovalRequest(
    approvalRequestId: string,
    tenantId: string
  ): Promise<DbPendingApprovalRequestRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(approvalRequestId, "approval_request_id");
    assertNonEmpty(tenantId, "tenant_id");
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at
      FROM pending_approval_requests
      WHERE tenant_id = $1 AND approval_request_id = $2
      LIMIT 1`,
      [tenantId, approvalRequestId]
    );
    return rows[0] ? mapPendingApprovalRowToDomainRecord(rows[0]) : undefined;
  }

  async listPendingApprovalRequests(tenantId: string): Promise<DbPendingApprovalRequestRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at
      FROM pending_approval_requests
      WHERE tenant_id = $1 AND status = 'pending'
      ORDER BY created_at DESC`,
      [tenantId]
    );
    return rows.map((row) => mapPendingApprovalRowToDomainRecord(row));
  }

  async listApprovalRequests(tenantId: string): Promise<DbPendingApprovalRequestRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at
      FROM pending_approval_requests
      WHERE tenant_id = $1
      ORDER BY created_at DESC`,
      [tenantId]
    );
    return rows.map((row) => mapPendingApprovalRowToDomainRecord(row));
  }

  async markPendingApprovalApproved(
    input: DbPendingApprovalMarkApprovedInput
  ): Promise<{ ok: true; item: DbPendingApprovalRequestRecord } | { ok: false; reason: string }> {
    this.assertPersistenceSupported();
    assertNonEmpty(input.tenantId, "tenant_id");
    assertNonEmpty(input.approvalRequestId, "approval_request_id");
    assertNonEmpty(input.approvedBy, "approved_by");

    const current = await this.getPendingApprovalRequest(input.approvalRequestId, input.tenantId);
    if (!current) return { ok: false, reason: "approval_not_found" };
    if (current.status === "approved") return { ok: false, reason: "approval_already_approved" };
    if (current.status === "rejected") return { ok: false, reason: "approval_already_rejected" };
    if (current.status !== "pending") return { ok: false, reason: "approval_not_pending" };

    const approvedAt = input.approvedAt ?? new Date().toISOString();
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `UPDATE pending_approval_requests
      SET
        status = 'approved',
        approved_by = $3,
        approved_at = $4::timestamptz,
        updated_at = $4::timestamptz
      WHERE tenant_id = $1 AND approval_request_id = $2
      RETURNING
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at`,
      [input.tenantId, input.approvalRequestId, input.approvedBy, approvedAt]
    );

    if (!rows[0]) return { ok: false, reason: "approval_not_found" };
    return { ok: true, item: mapPendingApprovalRowToDomainRecord(rows[0]) };
  }

  async markPendingApprovalRejected(
    input: DbPendingApprovalMarkRejectedInput
  ): Promise<{ ok: true; item: DbPendingApprovalRequestRecord } | { ok: false; reason: string }> {
    this.assertPersistenceSupported();
    assertNonEmpty(input.tenantId, "tenant_id");
    assertNonEmpty(input.approvalRequestId, "approval_request_id");
    assertNonEmpty(input.rejectedBy, "rejected_by");

    const current = await this.getPendingApprovalRequest(input.approvalRequestId, input.tenantId);
    if (!current) return { ok: false, reason: "approval_not_found" };
    if (current.status === "rejected") return { ok: false, reason: "approval_already_rejected" };
    if (current.status === "approved") return { ok: false, reason: "approval_already_approved" };
    if (current.status !== "pending") return { ok: false, reason: "approval_not_pending" };

    const rejectedAt = input.rejectedAt ?? new Date().toISOString();
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `UPDATE pending_approval_requests
      SET
        status = 'rejected',
        rejected_by = $3,
        reject_reason = $4,
        rejected_at = $5::timestamptz,
        updated_at = $5::timestamptz
      WHERE tenant_id = $1 AND approval_request_id = $2
      RETURNING
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at`,
      [input.tenantId, input.approvalRequestId, input.rejectedBy, input.rejectReason ?? null, rejectedAt]
    );

    if (!rows[0]) return { ok: false, reason: "approval_not_found" };
    return { ok: true, item: mapPendingApprovalRowToDomainRecord(rows[0]) };
  }

  async findByIdempotencyKey(
    tenantId: string,
    idempotencyKey: string
  ): Promise<DbPendingApprovalRequestRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(idempotencyKey, "idempotency_key");
    const rows = await this.executor.query<PendingApprovalRequestRow>(
      `SELECT
        id, tenant_id, approval_request_id, action_key, actor_id, status, reasons, payload, idempotency_key,
        requested_by, approved_by, rejected_by, reject_reason, created_at, updated_at, approved_at, rejected_at, expires_at
      FROM pending_approval_requests
      WHERE tenant_id = $1 AND idempotency_key = $2
      LIMIT 1`,
      [tenantId, idempotencyKey]
    );
    return rows[0] ? mapPendingApprovalRowToDomainRecord(rows[0]) : undefined;
  }
}
