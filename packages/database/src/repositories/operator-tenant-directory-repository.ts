import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbOperatorTenantSummary {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string;
}

interface TenantRow extends QueryResultRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan_code: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function mapRow(row: TenantRow): DbOperatorTenantSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    planCode: row.plan_code
  };
}

export class DatabaseOperatorTenantDirectoryRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("db_repository_postgres_mode_required");
    }
  }

  async listTenants(): Promise<DbOperatorTenantSummary[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<TenantRow>(
      `SELECT id, slug, name, status, plan_code
       FROM tenants
       ORDER BY name ASC`
    );
    return rows.map(mapRow);
  }

  async findById(tenantId: string): Promise<DbOperatorTenantSummary | null> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<TenantRow>(
      `SELECT id, slug, name, status, plan_code
       FROM tenants
       WHERE id = $1
       LIMIT 1`,
      [tenantId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<DbOperatorTenantSummary | null> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<TenantRow>(
      `SELECT id, slug, name, status, plan_code
       FROM tenants
       WHERE LOWER(slug) = LOWER($1)
       LIMIT 1`,
      [slug]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}

export function createDatabaseOperatorTenantDirectoryRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseOperatorTenantDirectoryRepository(options);
}
