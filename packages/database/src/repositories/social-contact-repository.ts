import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbSocialContactRecord {
  id: string;
  tenantId: string;
  provider: string;
  externalUserId: string;
  displayName?: string;
  username?: string;
  profileUrl?: string;
  linkedCustomerId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ContactRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  provider: string;
  external_user_id: string;
  display_name: string | null;
  username: string | null;
  profile_url: string | null;
  linked_customer_id: string | null;
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

function mapRow(row: ContactRow): DbSocialContactRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    provider: row.provider,
    externalUserId: row.external_user_id,
    displayName: row.display_name ?? undefined,
    username: row.username ?? undefined,
    profileUrl: row.profile_url ?? undefined,
    linkedCustomerId: row.linked_customer_id ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class DatabaseSocialContactRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async upsertContact(input: DbSocialContactRecord): Promise<DbSocialContactRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<ContactRow>(
      `INSERT INTO social_contacts (
        id, tenant_id, provider, external_user_id, display_name, username, profile_url, linked_customer_id, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz,$11::timestamptz)
      ON CONFLICT (tenant_id, provider, external_user_id)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        username = EXCLUDED.username,
        profile_url = EXCLUDED.profile_url,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, provider, external_user_id, display_name, username, profile_url, linked_customer_id, metadata, created_at, updated_at`,
      [
        input.id,
        input.tenantId,
        input.provider,
        input.externalUserId,
        input.displayName ?? null,
        input.username ?? null,
        input.profileUrl ?? null,
        input.linkedCustomerId ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdAt,
        input.updatedAt
      ]
    );
    if (!rows[0]) throw new Error("social_contact_upsert_failed");
    return mapRow(rows[0]);
  }

  async linkToCustomer(tenantId: string, contactId: string, customerId: string): Promise<DbSocialContactRecord | undefined> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<ContactRow>(
      `UPDATE social_contacts SET linked_customer_id = $3, updated_at = NOW()
       WHERE tenant_id = $1 AND id = $2
       RETURNING id, tenant_id, provider, external_user_id, display_name, username, profile_url, linked_customer_id, metadata, created_at, updated_at`,
      [tenantId, contactId, customerId]
    );
    return rows[0] ? mapRow(rows[0]) : undefined;
  }
}

export function createDatabaseSocialContactRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseSocialContactRepository(options);
}
