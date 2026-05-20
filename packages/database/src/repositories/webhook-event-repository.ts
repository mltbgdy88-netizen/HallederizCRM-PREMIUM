import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbWebhookEventRecord {
  id: string;
  tenantId: string;
  provider: string;
  accountId?: string;
  externalEventId?: string;
  eventType: string;
  rawPayload: Record<string, unknown>;
  signatureValid: boolean;
  processingStatus: string;
  idempotencyKey: string;
  receivedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

interface WebhookEventRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  provider: string;
  account_id: string | null;
  external_event_id: string | null;
  event_type: string;
  raw_payload: unknown;
  signature_valid: boolean;
  processing_status: string;
  idempotency_key: string;
  received_at: string;
  processed_at: string | null;
  error_message: string | null;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function parseObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function mapRow(row: WebhookEventRow): DbWebhookEventRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider,
    accountId: row.account_id ?? undefined,
    externalEventId: row.external_event_id ?? undefined,
    eventType: row.event_type,
    rawPayload: parseObject(row.raw_payload),
    signatureValid: row.signature_valid,
    processingStatus: row.processing_status,
    idempotencyKey: row.idempotency_key,
    receivedAt: row.received_at,
    processedAt: row.processed_at ?? undefined,
    errorMessage: row.error_message ?? undefined
  };
}

export class DatabaseWebhookEventRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async reserveEvent(input: DbWebhookEventRecord): Promise<{ reserved: boolean; event?: DbWebhookEventRecord; reason?: string }> {
    this.assertPersistenceSupported();
    try {
      const rows = await this.executor.query<WebhookEventRow>(
        `INSERT INTO webhook_events (
          id, tenant_id, provider, account_id, external_event_id, event_type, raw_payload,
          signature_valid, processing_status, idempotency_key, received_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11::timestamptz)
        ON CONFLICT (tenant_id, provider, idempotency_key) DO NOTHING
        RETURNING id, tenant_id, provider, account_id, external_event_id, event_type, raw_payload,
          signature_valid, processing_status, idempotency_key, received_at, processed_at, error_message`,
        [
          input.id,
          input.tenantId,
          input.provider,
          input.accountId ?? null,
          input.externalEventId ?? null,
          input.eventType,
          JSON.stringify(input.rawPayload ?? {}),
          input.signatureValid,
          input.processingStatus,
          input.idempotencyKey,
          input.receivedAt
        ]
      );
      if (!rows[0]) {
        return { reserved: false, reason: "duplicate" };
      }
      return { reserved: true, event: mapRow(rows[0]) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "webhook_reserve_failed";
      if (message.includes("duplicate") || message.includes("unique")) {
        return { reserved: false, reason: "duplicate" };
      }
      throw error;
    }
  }

  async markProcessed(id: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE webhook_events SET processing_status = 'processed', processed_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE webhook_events SET processing_status = 'failed', processed_at = NOW(), error_message = $2 WHERE id = $1`,
      [id, errorMessage]
    );
  }
}

export function createDatabaseWebhookEventRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseWebhookEventRepository(options);
}
