import { randomUUID } from "node:crypto";
import type { QueryExecutor } from "../types";

export type DocumentDeliveryStatus = "queued" | "sent" | "delivered" | "failed";

export interface DocumentDeliveryRecord {
  id: string;
  tenantId: string;
  documentId: string;
  channel: string;
  recipient?: string;
  providerMessageId?: string;
  status: DocumentDeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  approvalId?: string;
  outboxJobId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDeliveryInsertInput {
  tenantId: string;
  documentId: string;
  channel: string;
  recipient?: string;
  status?: DocumentDeliveryRecord["status"];
  approvalId?: string;
  outboxJobId?: string;
  metadata?: Record<string, unknown>;
}

interface DocumentDeliveryRow {
  [key: string]: unknown;
  id: string;
  tenant_id: string;
  document_id: string;
  channel: string;
  recipient: string | null;
  provider_message_id: string | null;
  status: DocumentDeliveryRecord["status"];
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  approval_id: string | null;
  outbox_job_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapRow(row: DocumentDeliveryRow): DocumentDeliveryRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    documentId: row.document_id,
    channel: row.channel,
    recipient: row.recipient ?? undefined,
    providerMessageId: row.provider_message_id ?? undefined,
    status: row.status,
    sentAt: row.sent_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
    approvalId: row.approval_id ?? undefined,
    outboxJobId: row.outbox_job_id ?? undefined,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseDocumentDeliveryRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async insert(input: DocumentDeliveryInsertInput): Promise<DocumentDeliveryRecord> {
    if (!input.tenantId?.trim()) {
      throw new Error("document_delivery_tenant_id_required");
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    await this.executor.query(
      `INSERT INTO document_deliveries (
        id, tenant_id, document_id, channel, recipient, status, approval_id, outbox_job_id,
        metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)`,
      [
        id,
        input.tenantId,
        input.documentId,
        input.channel,
        input.recipient ?? null,
        input.status ?? "queued",
        input.approvalId ?? null,
        input.outboxJobId ?? null,
        JSON.stringify(input.metadata ?? {}),
        now,
        now
      ]
    );
    const rows = await this.listByDocument(input.tenantId, input.documentId);
    const created = rows.find((row) => row.id === id);
    if (!created) {
      throw new Error("document_delivery_insert_failed");
    }
    return created;
  }

  async listByDocument(tenantId: string, documentId: string): Promise<DocumentDeliveryRecord[]> {
    const rows = await this.executor.query<DocumentDeliveryRow>(
      `SELECT * FROM document_deliveries WHERE tenant_id = $1 AND document_id = $2 ORDER BY created_at DESC`,
      [tenantId, documentId]
    );
    return rows.map(mapRow);
  }
}
