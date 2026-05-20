import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbProviderMessageReceiptRecord {
  id: string;
  tenantId: string;
  provider: string;
  accountId?: string;
  externalMessageId: string;
  conversationId: string;
  messageId?: string;
  status: string;
  rawPayload: Record<string, unknown>;
  receivedAt: string;
}

interface ReceiptRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  provider: string;
  account_id: string | null;
  external_message_id: string;
  conversation_id: string;
  message_id: string | null;
  status: string;
  raw_payload: unknown;
  received_at: string;
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

function mapRow(row: ReceiptRow): DbProviderMessageReceiptRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider,
    accountId: row.account_id ?? undefined,
    externalMessageId: row.external_message_id,
    conversationId: row.conversation_id,
    messageId: row.message_id ?? undefined,
    status: row.status,
    rawPayload: parseObject(row.raw_payload),
    receivedAt: row.received_at
  };
}

export class DatabaseProviderMessageReceiptRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async recordReceipt(input: DbProviderMessageReceiptRecord): Promise<DbProviderMessageReceiptRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<ReceiptRow>(
      `INSERT INTO provider_message_receipts (
        id, tenant_id, provider, account_id, external_message_id, conversation_id, message_id, status, raw_payload, received_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz)
      ON CONFLICT (tenant_id, provider, external_message_id, status) DO NOTHING
      RETURNING id, tenant_id, provider, account_id, external_message_id, conversation_id, message_id, status, raw_payload, received_at`,
      [
        input.id,
        input.tenantId,
        input.provider,
        input.accountId ?? null,
        input.externalMessageId,
        input.conversationId,
        input.messageId ?? null,
        input.status,
        JSON.stringify(input.rawPayload ?? {}),
        input.receivedAt
      ]
    );
    if (!rows[0]) {
      return input;
    }
    return mapRow(rows[0]);
  }

  async listByConversation(tenantId: string, conversationId: string): Promise<DbProviderMessageReceiptRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<ReceiptRow>(
      `SELECT id, tenant_id, provider, account_id, external_message_id, conversation_id, message_id, status, raw_payload, received_at
       FROM provider_message_receipts WHERE tenant_id = $1 AND conversation_id = $2 ORDER BY received_at DESC`,
      [tenantId, conversationId]
    );
    return rows.map(mapRow);
  }
}

export function createDatabaseProviderMessageReceiptRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseProviderMessageReceiptRepository(options);
}
