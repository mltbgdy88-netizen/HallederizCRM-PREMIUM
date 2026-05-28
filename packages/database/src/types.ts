export type PersistenceMode = "demo" | "postgres";

export interface TenantContextHeaders {
  tenantId: string;
  userId?: string;
}

export interface QueryResultRow {
  [key: string]: unknown;
}

export interface QueryExecutor {
  query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T>;
}

export interface DatabaseConfig {
  mode: PersistenceMode;
  postgresUrl?: string;
}
