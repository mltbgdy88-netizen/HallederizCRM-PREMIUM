import {
  getDefaultPendingApprovalRepository,
  type PendingApprovalMarkApprovedInput,
  type PendingApprovalMarkRejectedInput,
  type PendingApprovalRepository,
  type PendingApprovalRequest,
  type PendingApprovalRequestInput
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  DatabasePendingApprovalRepository,
  type DbPendingApprovalRequestRecord
} from "@hallederiz/database";
import type { RequestContext } from "./request-context";
import { getAuthMode } from "./auth-mode";

export type PendingApprovalPersistenceMode = "memory" | "postgres" | "unsupported" | "none";

export interface PendingApprovalRepositoryResolution {
  repository: PendingApprovalRepository | null;
  mode: PendingApprovalPersistenceMode;
  skipped: boolean;
  reasons: string[];
}

let dbApprovalSequence = 0;
let cachedPostgresRepository: PendingApprovalRepository | null = null;
let cachedPostgresUrl: string | null = null;

function createDbApprovalRequestId() {
  dbApprovalSequence += 1;
  return `apr_req_db_${dbApprovalSequence}`;
}

function getPostgresUrl() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

function mapDbRecordToDomain(
  record: DbPendingApprovalRequestRecord,
  overrides?: Partial<PendingApprovalRequest>
): PendingApprovalRequest {
  return {
    approvalRequestId: record.approvalRequestId,
    tenantId: record.tenantId,
    actorId: record.actorId,
    actionKey: record.actionKey,
    reasons: record.reasons,
    payload: record.payload,
    idempotencyKey: record.idempotencyKey ?? `apr_idem_${record.approvalRequestId}`,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    requestedAt: record.createdAt,
    auditRequired: true,
    timelineRequired: true,
    approvedBy: record.approvedBy,
    approvedAt: record.approvedAt,
    rejectedBy: record.rejectedBy,
    rejectedAt: record.rejectedAt,
    rejectReason: record.rejectReason,
    ...overrides
  };
}

function toDbRecord(input: PendingApprovalRequestInput & { approvalRequestId?: string }): DbPendingApprovalRequestRecord {
  const now = new Date().toISOString();
  const approvalRequestId = input.approvalRequestId ?? createDbApprovalRequestId();
  const idempotencyKey = input.idempotencyKey ?? `apr_idem_${approvalRequestId}`;
  return {
    id: `pending_${approvalRequestId}`,
    tenantId: input.tenantId,
    approvalRequestId,
    actionKey: input.actionKey,
    actorId: input.actorId,
    status: "pending",
    reasons: input.reasons,
    payload: input.payload ?? {},
    idempotencyKey,
    requestedBy: input.actorId,
    createdAt: input.requestedAt ?? now,
    updatedAt: now
  };
}

class RuntimeDatabasePendingApprovalRepository implements PendingApprovalRepository {
  constructor(private readonly repository: DatabasePendingApprovalRepository) {}

  async createPendingApprovalRequest(input: PendingApprovalRequestInput & { approvalRequestId?: string }) {
    const created = await this.repository.createPendingApprovalRequest(toDbRecord(input));
    return mapDbRecordToDomain(created);
  }

  async getPendingApprovalRequest(approvalRequestId: string, tenantId: string) {
    const item = await this.repository.getPendingApprovalRequest(approvalRequestId, tenantId);
    return item ? mapDbRecordToDomain(item) : undefined;
  }

  async listPendingApprovalRequests(tenantId: string) {
    const rows = await this.repository.listPendingApprovalRequests(tenantId);
    return rows.map((row) => mapDbRecordToDomain(row));
  }

  async listApprovalRequests(tenantId: string) {
    const rows = await this.repository.listApprovalRequests(tenantId);
    return rows.map((row) => mapDbRecordToDomain(row));
  }

  async markPendingApprovalApproved(
    input: PendingApprovalMarkApprovedInput
  ): Promise<{ ok: true; item: PendingApprovalRequest } | { ok: false; reason: string }> {
    const result = await this.repository.markPendingApprovalApproved({
      tenantId: input.tenantId,
      approvalRequestId: input.approvalRequestId,
      approvedBy: input.approvedBy,
      approvedAt: input.approvedAt
    });

    if (!result.ok) return result;
    return {
      ok: true,
      item: mapDbRecordToDomain(result.item, {
        executionId: input.executionId,
        outboxJobId: input.outboxJobId,
        bridgeReasons: input.bridgeReasons,
        bridgeTransactionMode: input.bridgeTransactionMode,
        bridgePersistenceMode: input.bridgePersistenceMode
      })
    };
  }

  async markPendingApprovalRejected(
    input: PendingApprovalMarkRejectedInput
  ): Promise<{ ok: true; item: PendingApprovalRequest } | { ok: false; reason: string }> {
    const result = await this.repository.markPendingApprovalRejected({
      tenantId: input.tenantId,
      approvalRequestId: input.approvalRequestId,
      rejectedBy: input.rejectedBy,
      rejectedAt: input.rejectedAt,
      rejectReason: input.reason
    });
    if (!result.ok) return result;
    return { ok: true, item: mapDbRecordToDomain(result.item) };
  }

  async findByIdempotencyKey(tenantId: string, idempotencyKey: string) {
    const row = await this.repository.findByIdempotencyKey(tenantId, idempotencyKey);
    return row ? mapDbRecordToDomain(row) : undefined;
  }

  async reset() {
    // DB-backed runtime repository cannot be safely reset from application runtime.
  }
}

function resolvePostgresRepository(): PendingApprovalRepositoryResolution {
  const postgresUrl = getPostgresUrl();
  if (!postgresUrl) {
    return {
      repository: null,
      mode: "unsupported",
      skipped: true,
      reasons: ["pending_approval_postgres_url_missing"]
    };
  }

  if (!cachedPostgresRepository || cachedPostgresUrl !== postgresUrl) {
    const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
    const dbRepository = new DatabasePendingApprovalRepository({
      executor,
      persistenceMode: "postgres"
    });
    cachedPostgresRepository = new RuntimeDatabasePendingApprovalRepository(dbRepository);
    cachedPostgresUrl = postgresUrl;
  }

  return {
    repository: cachedPostgresRepository,
    mode: "postgres",
    skipped: false,
    reasons: []
  };
}

export function resolvePendingApprovalRepository(context?: RequestContext): PendingApprovalRepositoryResolution {
  const authMode = getAuthMode();
  const persistenceMode = context?.persistenceMode ?? authMode.persistenceMode;

  if (persistenceMode === "postgres") {
    return resolvePostgresRepository();
  }

  if (authMode.isProduction) {
    return {
      repository: null,
      mode: "unsupported",
      skipped: true,
      reasons: ["pending_approval_memory_fallback_forbidden_in_production"]
    };
  }

  return {
    repository: getDefaultPendingApprovalRepository(),
    mode: "memory",
    skipped: false,
    reasons: []
  };
}

export function getPendingApprovalPersistenceMode(context?: RequestContext): PendingApprovalPersistenceMode {
  return resolvePendingApprovalRepository(context).mode;
}

export function resetPendingApprovalRuntimeForTests() {
  cachedPostgresRepository = null;
  cachedPostgresUrl = null;
  dbApprovalSequence = 0;
}
