import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbAiChatSessionRecord {
  id: string;
  tenantId: string;
  conversationId: string;
  customerId?: string;
  channel: string;
  status: string;
  lastIntent?: string;
  aiModel?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface SessionRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  conversation_id: string;
  customer_id: string | null;
  channel: string;
  status: string;
  last_intent: string | null;
  ai_model: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
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

function mapRow(row: SessionRow): DbAiChatSessionRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    customerId: row.customer_id ?? undefined,
    channel: row.channel,
    status: row.status,
    lastIntent: row.last_intent ?? undefined,
    aiModel: row.ai_model ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseAiChatSessionRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async getOrCreateForConversation(input: DbAiChatSessionRecord): Promise<DbAiChatSessionRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<SessionRow>(
      `INSERT INTO ai_chat_sessions (
        id, tenant_id, conversation_id, customer_id, channel, status, last_intent, ai_model, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz,$11::timestamptz)
      ON CONFLICT (tenant_id, conversation_id)
      DO UPDATE SET updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, conversation_id, customer_id, channel, status, last_intent, ai_model, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.conversationId,
        input.customerId ?? null,
        input.channel,
        input.status,
        input.lastIntent ?? null,
        input.aiModel ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("ai_chat_session_upsert_failed");
    return mapRow(rows[0]);
  }

  async updateIntent(tenantId: string, conversationId: string, lastIntent: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE ai_chat_sessions SET last_intent = $3, updated_at = NOW() WHERE tenant_id = $1 AND conversation_id = $2`,
      [tenantId, conversationId, lastIntent]
    );
  }

  async updateStatus(tenantId: string, conversationId: string, status: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE ai_chat_sessions SET status = $3, updated_at = NOW() WHERE tenant_id = $1 AND conversation_id = $2`,
      [tenantId, conversationId, status]
    );
  }
}

export function createDatabaseAiChatSessionRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseAiChatSessionRepository(options);
}
