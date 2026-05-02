import { createHash } from "node:crypto";
import { createQueryExecutor } from "./client";
import type { DatabaseConfig, QueryExecutor, QueryResultRow } from "./types";
import { aiFoundationMigrationName, aiFoundationMigrationSql } from "./ai-foundation";

export interface DatabaseMigration {
  name: string;
  sql: string;
}

export interface AppliedMigrationRow extends QueryResultRow {
  name: string;
  checksum: string;
  applied_at: string;
}

export interface MigrationApplyResult {
  name: string;
  status: "applied" | "skipped";
  checksum: string;
}

export const databaseMigrations: DatabaseMigration[] = [
  {
    name: aiFoundationMigrationName,
    sql: aiFoundationMigrationSql,
  },
];

export function calculateMigrationChecksum(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

export async function ensureSchemaMigrationsTable(executor: QueryExecutor): Promise<void> {
  await executor.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function listAppliedMigrations(executor: QueryExecutor): Promise<AppliedMigrationRow[]> {
  await ensureSchemaMigrationsTable(executor);
  return executor.query<AppliedMigrationRow>("SELECT name, checksum, applied_at FROM schema_migrations ORDER BY applied_at ASC");
}

export async function applyDatabaseMigrations(executor: QueryExecutor, migrations: DatabaseMigration[] = databaseMigrations): Promise<MigrationApplyResult[]> {
  await ensureSchemaMigrationsTable(executor);
  const results: MigrationApplyResult[] = [];

  for (const migration of migrations) {
    const checksum = calculateMigrationChecksum(migration.sql);

    const existing = await executor.query<AppliedMigrationRow>(
      "SELECT name, checksum, applied_at FROM schema_migrations WHERE name = $1",
      [migration.name]
    );

    if (existing[0]) {
      if (existing[0].checksum !== checksum) {
        throw new Error(`Migration checksum mismatch for ${migration.name}. Existing migration cannot be modified after being applied.`);
      }
      results.push({ name: migration.name, status: "skipped", checksum });
      continue;
    }

    await executor.transaction(async (tx) => {
      await tx.query(migration.sql);
      await tx.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [migration.name, checksum]);
    });

    results.push({ name: migration.name, status: "applied", checksum });
  }

  return results;
}

export function createPostgresMigrationExecutor(config: DatabaseConfig): QueryExecutor {
  if (config.mode !== "postgres") {
    throw new Error("Migrations require postgres mode.");
  }

  return createQueryExecutor(config);
}
