import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbAiReplySuggestionRecord {
  id: string;
  tenantId: string;
  sessionId: string;
  conversationId: string;
  sourceMessageId?: string;
  draftText: string;
  confidence?: number;
  intent?: string;
  policyDecision: string;
  approvalRequestId?: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface SuggestionRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  session_id: string;
  conversation_id: string;
  source_message_id: string | null;
  draft_text: string;
  confidence: string | number | null;
  intent: string | null;
  policy_decision: string;
  approval_request_id: string | null;
  status: string;
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

function mapRow(row: SuggestionRow): DbAiReplySuggestionRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sessionId: row.session_id,
    conversationId: row.conversation_id,
    sourceMessageId: row.source_message_id ?? undefined,
    draftText: row.draft_text,
    confidence: row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    intent: row.intent ?? undefined,
    policyDecision: row.policy_decision,
    approvalRequestId: row.approval_request_id ?? undefined,
    status: row.status,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseAiReplySuggestionRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async createSuggestion(input: DbAiReplySuggestionRecord): Promise<DbAiReplySuggestionRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<SuggestionRow>(
      `INSERT INTO ai_reply_suggestions (
        id, tenant_id, session_id, conversation_id, source_message_id, draft_text, confidence, intent,
        policy_decision, approval_request_id, status, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::timestamptz,$14::timestamptz)
      RETURNING id, tenant_id, session_id, conversation_id, source_message_id, draft_text, confidence, intent,
        policy_decision, approval_request_id, status, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.sessionId,
        input.conversationId,
        input.sourceMessageId ?? null,
        input.draftText,
        input.confidence ?? null,
        input.intent ?? null,
        input.policyDecision,
        input.approvalRequestId ?? null,
        input.status,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("ai_reply_suggestion_create_failed");
    return mapRow(rows[0]);
  }

  async listByConversation(tenantId: string, conversationId: string): Promise<DbAiReplySuggestionRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<SuggestionRow>(
      `SELECT id, tenant_id, session_id, conversation_id, source_message_id, draft_text, confidence, intent,
        policy_decision, approval_request_id, status, metadata, created_at, updated_at
       FROM ai_reply_suggestions WHERE tenant_id = $1 AND conversation_id = $2 ORDER BY created_at DESC`,
      [tenantId, conversationId]
    );
    return rows.map(mapRow);
  }

  async updateStatus(id: string, status: string, approvalRequestId?: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE ai_reply_suggestions SET status = $2, approval_request_id = COALESCE($3, approval_request_id), updated_at = NOW() WHERE id = $1`,
      [id, status, approvalRequestId ?? null]
    );
  }
}

export function createDatabaseAiReplySuggestionRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseAiReplySuggestionRepository(options);
}
