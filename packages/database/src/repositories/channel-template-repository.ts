import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbChannelTemplateRecord {
  id: string;
  tenantId: string;
  provider: string;
  templateCode: string;
  language: string;
  body: string;
  status: string;
  externalTemplateId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface TemplateRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  provider: string;
  template_code: string;
  language: string;
  body: string;
  status: string;
  external_template_id: string | null;
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

function mapRow(row: TemplateRow): DbChannelTemplateRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider,
    templateCode: row.template_code,
    language: row.language,
    body: row.body,
    status: row.status,
    externalTemplateId: row.external_template_id ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseChannelTemplateRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async upsert(input: DbChannelTemplateRecord): Promise<DbChannelTemplateRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<TemplateRow>(
      `INSERT INTO channel_templates (
        id, tenant_id, provider, template_code, language, body, status, external_template_id, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz,$11::timestamptz)
      ON CONFLICT (tenant_id, provider, template_code, language)
      DO UPDATE SET body = EXCLUDED.body, status = EXCLUDED.status, external_template_id = EXCLUDED.external_template_id,
        metadata = EXCLUDED.metadata, updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, provider, template_code, language, body, status, external_template_id, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.provider,
        input.templateCode,
        input.language,
        input.body,
        input.status,
        input.externalTemplateId ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("channel_template_upsert_failed");
    return mapRow(rows[0]);
  }
}

export function createDatabaseChannelTemplateRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseChannelTemplateRepository(options);
}
