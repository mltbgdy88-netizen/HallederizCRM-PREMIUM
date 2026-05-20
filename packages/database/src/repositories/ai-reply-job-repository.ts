import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbAiReplyJobRecord {
  id: string;
  tenantId: string;
  conversationId: string;
  messageId?: string;
  suggestionId?: string;
  jobType: string;
  status: string;
  attempts: number;
  lastError?: string;
  nextRunAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface JobRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  conversation_id: string;
  message_id: string | null;
  suggestion_id: string | null;
  job_type: string;
  status: string;
  attempts: number;
  last_error: string | null;
  next_run_at: string | null;
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

function mapRow(row: JobRow): DbAiReplyJobRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    messageId: row.message_id ?? undefined,
    suggestionId: row.suggestion_id ?? undefined,
    jobType: row.job_type,
    status: row.status,
    attempts: row.attempts,
    lastError: row.last_error ?? undefined,
    nextRunAt: row.next_run_at ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseAiReplyJobRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async enqueue(input: DbAiReplyJobRecord): Promise<DbAiReplyJobRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<JobRow>(
      `INSERT INTO ai_reply_jobs (
        id, tenant_id, conversation_id, message_id, suggestion_id, job_type, status, attempts, last_error, next_run_at, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::timestamptz,$11::jsonb,$12::timestamptz,$13::timestamptz)
      RETURNING id, tenant_id, conversation_id, message_id, suggestion_id, job_type, status, attempts, last_error, next_run_at, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.conversationId,
        input.messageId ?? null,
        input.suggestionId ?? null,
        input.jobType,
        input.status,
        input.attempts,
        input.lastError ?? null,
        input.nextRunAt ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("ai_reply_job_enqueue_failed");
    return mapRow(rows[0]);
  }

  async claimNext(tenantId: string, limit = 5): Promise<DbAiReplyJobRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<JobRow>(
      `UPDATE ai_reply_jobs
       SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
       WHERE id IN (
         SELECT id FROM ai_reply_jobs
         WHERE tenant_id = $1 AND status = 'pending' AND (next_run_at IS NULL OR next_run_at <= NOW())
         ORDER BY created_at ASC
         LIMIT $2
         FOR UPDATE SKIP LOCKED
       )
       RETURNING id, tenant_id, conversation_id, message_id, suggestion_id, job_type, status, attempts, last_error, next_run_at, metadata, created_at, updated_at`,
      [tenantId, limit]
    );
    return rows.map(mapRow);
  }

  async markCompleted(id: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(`UPDATE ai_reply_jobs SET status = 'completed', updated_at = NOW() WHERE id = $1`, [id]);
  }

  async markFailed(id: string, error: string, nextRunAt?: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE ai_reply_jobs SET status = 'failed', last_error = $2, next_run_at = $3::timestamptz, updated_at = NOW() WHERE id = $1`,
      [id, error, nextRunAt ?? null]
    );
  }
}

export function createDatabaseAiReplyJobRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseAiReplyJobRepository(options);
}
