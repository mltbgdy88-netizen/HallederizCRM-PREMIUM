import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbChannelCredentialRecord {
  id: string;
  tenantId: string;
  accountId: string;
  provider: string;
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  expiresAt?: string;
  appId?: string;
  appSecretRef?: string;
  verifyTokenHash?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CredentialRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  account_id: string;
  provider: string;
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  expires_at: string | null;
  app_id: string | null;
  app_secret_ref: string | null;
  verify_token_hash: string | null;
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

function mapRow(row: CredentialRow): DbChannelCredentialRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    accountId: row.account_id,
    provider: row.provider,
    encryptedAccessToken: row.encrypted_access_token ?? undefined,
    encryptedRefreshToken: row.encrypted_refresh_token ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    appId: row.app_id ?? undefined,
    appSecretRef: row.app_secret_ref ?? undefined,
    verifyTokenHash: row.verify_token_hash ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseChannelCredentialRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async getByAccount(tenantId: string, accountId: string): Promise<DbChannelCredentialRecord | undefined> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<CredentialRow>(
      `SELECT id, tenant_id, account_id, provider, encrypted_access_token, encrypted_refresh_token, expires_at,
        app_id, app_secret_ref, verify_token_hash, metadata, created_at, updated_at
       FROM channel_credentials WHERE tenant_id = $1 AND account_id = $2 LIMIT 1`,
      [tenantId, accountId]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async findByVerifyTokenHash(verifyTokenHash: string): Promise<DbChannelCredentialRecord | undefined> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<CredentialRow>(
      `SELECT id, tenant_id, account_id, provider, encrypted_access_token, encrypted_refresh_token, expires_at,
        app_id, app_secret_ref, verify_token_hash, metadata, created_at, updated_at
       FROM channel_credentials WHERE verify_token_hash = $1 LIMIT 1`,
      [verifyTokenHash]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }

  async saveCredential(input: DbChannelCredentialRecord): Promise<DbChannelCredentialRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<CredentialRow>(
      `INSERT INTO channel_credentials (
        id, tenant_id, account_id, provider, encrypted_access_token, encrypted_refresh_token, expires_at,
        app_id, app_secret_ref, verify_token_hash, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::timestamptz,$8,$9,$10,$11::jsonb,$12::timestamptz,$13::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        encrypted_access_token = EXCLUDED.encrypted_access_token,
        encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
        expires_at = EXCLUDED.expires_at,
        app_id = EXCLUDED.app_id,
        app_secret_ref = EXCLUDED.app_secret_ref,
        verify_token_hash = EXCLUDED.verify_token_hash,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, account_id, provider, encrypted_access_token, encrypted_refresh_token, expires_at,
        app_id, app_secret_ref, verify_token_hash, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.accountId,
        input.provider,
        input.encryptedAccessToken ?? null,
        input.encryptedRefreshToken ?? null,
        input.expiresAt ?? null,
        input.appId ?? null,
        input.appSecretRef ?? null,
        input.verifyTokenHash ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("channel_credential_save_failed");
    return mapRow(rows[0]);
  }

  async markExpired(tenantId: string, accountId: string): Promise<void> {
    this.assertPersistenceSupported();
    await this.executor.query(
      `UPDATE channel_credentials SET expires_at = NOW(), updated_at = NOW() WHERE tenant_id = $1 AND account_id = $2`,
      [tenantId, accountId]
    );
  }
}

export function createDatabaseChannelCredentialRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseChannelCredentialRepository(options);
}
