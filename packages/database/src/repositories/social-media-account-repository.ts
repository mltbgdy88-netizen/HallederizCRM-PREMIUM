import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbSocialMediaAccountRecord {
  id: string;
  tenantId: string;
  provider: string;
  externalAccountId: string;
  displayName?: string;
  handle?: string;
  status: string;
  tokenRef?: string;
  scopes: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface AccountRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  provider: string;
  external_account_id: string;
  display_name: string | null;
  handle: string | null;
  status: string;
  token_ref: string | null;
  scopes: unknown;
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

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: AccountRow): DbSocialMediaAccountRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider,
    externalAccountId: row.external_account_id,
    displayName: row.display_name ?? undefined,
    handle: row.handle ?? undefined,
    status: row.status,
    tokenRef: row.token_ref ?? undefined,
    scopes: parseStringArray(row.scopes),
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseSocialMediaAccountRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async listByTenant(tenantId: string): Promise<DbSocialMediaAccountRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<AccountRow>(
      `SELECT id, tenant_id, provider, external_account_id, display_name, handle, status, token_ref, scopes, metadata, created_at, updated_at
       FROM social_media_accounts WHERE tenant_id = $1 ORDER BY updated_at DESC`,
      [tenantId]
    );
    return rows.map(mapRow);
  }

  async getByExternalAccount(tenantId: string, provider: string, externalAccountId: string): Promise<DbSocialMediaAccountRecord | undefined> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<AccountRow>(
      `SELECT id, tenant_id, provider, external_account_id, display_name, handle, status, token_ref, scopes, metadata, created_at, updated_at
       FROM social_media_accounts WHERE tenant_id = $1 AND provider = $2 AND external_account_id = $3 LIMIT 1`,
      [tenantId, provider, externalAccountId]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async findByExternalAccount(provider: string, externalAccountId: string): Promise<DbSocialMediaAccountRecord | undefined> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<AccountRow>(
      `SELECT id, tenant_id, provider, external_account_id, display_name, handle, status, token_ref, scopes, metadata, created_at, updated_at
       FROM social_media_accounts WHERE provider = $1 AND external_account_id = $2 LIMIT 1`,
      [provider, externalAccountId]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async upsert(account: DbSocialMediaAccountRecord): Promise<DbSocialMediaAccountRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<AccountRow>(
      `INSERT INTO social_media_accounts (
        id, tenant_id, provider, external_account_id, display_name, handle, status, token_ref, scopes, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::timestamptz,$12::timestamptz)
      ON CONFLICT (tenant_id, provider, external_account_id)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        handle = EXCLUDED.handle,
        status = EXCLUDED.status,
        token_ref = EXCLUDED.token_ref,
        scopes = EXCLUDED.scopes,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, provider, external_account_id, display_name, handle, status, token_ref, scopes, metadata, created_at, updated_at`,
      [
        account.id,
        account.tenantId,
        account.provider,
        account.externalAccountId,
        account.displayName ?? null,
        account.handle ?? null,
        account.status,
        account.tokenRef ?? null,
        JSON.stringify(account.scopes ?? []),
        JSON.stringify(account.metadata ?? {}),
        account.createdAt,
        account.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("social_media_account_upsert_failed");
    return mapRow(rows[0]);
  }
}

export function createDatabaseSocialMediaAccountRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseSocialMediaAccountRepository(options);
}
