import type { DatabaseConfig, QueryExecutor, QueryResultRow } from "./types";

class DemoQueryExecutor implements QueryExecutor {
  async query<T extends QueryResultRow = QueryResultRow>(_sql: string, _params?: unknown[]): Promise<T[]> {
    return [];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return operation(this);
  }
}

class PostgresQueryExecutor implements QueryExecutor {
  private poolPromise: Promise<unknown> | null = null;
  private readonly dynamicImport = new Function("moduleName", "return import(moduleName)") as (moduleName: string) => Promise<unknown>;

  constructor(private readonly config: DatabaseConfig) {}

  private async getPool(): Promise<{
    query: (sql: string, params?: unknown[]) => Promise<{ rows: QueryResultRow[] }>;
    connect: () => Promise<{ query: (sql: string, params?: unknown[]) => Promise<{ rows: QueryResultRow[] }>; release: () => void }>;
  }> {
    if (!this.config.postgresUrl) {
      throw new Error("POSTGRES_URL is required for postgres persistence mode.");
    }
    const connectionString = this.config.postgresUrl;

    if (!this.poolPromise) {
      this.poolPromise = (async () => {
        const pgModule = (await this.dynamicImport("pg").catch(() => null)) as { Pool: new (cfg: { connectionString: string }) => unknown } | null;
        if (!pgModule) {
          throw new Error("pg module is not installed. Install pg to use postgres persistence mode.");
        }
        return new pgModule.Pool({ connectionString });
      })();
    }

    return this.poolPromise as Promise<{
      query: (sql: string, params?: unknown[]) => Promise<{ rows: QueryResultRow[] }>;
      connect: () => Promise<{ query: (sql: string, params?: unknown[]) => Promise<{ rows: QueryResultRow[] }>; release: () => void }>;
    }>;
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
    const pool = await this.getPool();
    const result = await pool.query(sql, params);
    return result.rows as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    const pool = await this.getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const txExecutor: QueryExecutor = {
        query: async <R extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => {
          const result = await client.query(sql, params);
          return result.rows as R[];
        },
        transaction: async <R>(nestedOperation: (executor: QueryExecutor) => Promise<R>) => nestedOperation(txExecutor)
      };
      const output = await operation(txExecutor);
      await client.query("COMMIT");
      return output;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export function createQueryExecutor(config: DatabaseConfig): QueryExecutor {
  if (config.mode === "postgres") {
    return new PostgresQueryExecutor(config);
  }

  return new DemoQueryExecutor();
}
