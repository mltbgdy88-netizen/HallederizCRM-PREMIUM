import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseMigration } from "./migrations.js";
import { aiFoundationMigrationName, aiFoundationMigrationSql } from "./ai-foundation/index.js";

function resolveMigrationsDirectory(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(moduleDir, "migrations"),
    path.join(moduleDir, "..", "src", "migrations")
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error("Database migrations directory not found.");
}

const migrationsDir = resolveMigrationsDirectory();

/** Deterministic ordered SQL migrations (filename order). */
export const ORDERED_SQL_MIGRATION_FILES = [
  "0001_initial.sql",
  "0002_whatsapp_workflows.sql",
  "0003_payment_receipts_currency.sql",
  "0004_auth_users.sql",
  "0005_execution_worker_audit.sql",
  "0006_pending_approval_requests.sql",
  "0007_tenant_usage_events.sql",
  "0008_omnichannel_inbox.sql",
  "0009_durable_outbox_hardening.sql",
  "0010_sales_ai_knowledge.sql",
  "0011_payment_allocations.sql",
  "0012_warehouse_order_lines_tasks.sql",
  "0013_omnichannel_provider_accounts_ai.sql",
  "0014_commercial_line_tables.sql"
] as const;

/** Tables that must appear in the ordered migration SQL corpus (Sprint 1 foundation). */
export const FOUNDATION_TABLE_NAMES = [
  "tenants",
  "users",
  "customers",
  "offers",
  "sale_orders",
  "payment_receipts",
  "documents",
  "approval_execution_logs",
  "pending_approval_requests",
  "outbox_jobs",
  "dead_letter_jobs",
  "timeline_events",
  "audit_events",
  "omnichannel_conversations",
  "omnichannel_messages",
  "social_media_accounts",
  "ai_reply_jobs",
  "payment_allocations",
  "warehouse_order_lines",
  "warehouse_tasks",
  "payment_reversals",
  "delivery_lines",
  "invoice_lines",
  "return_lines",
  "document_deliveries"
] as const;

function loadSqlMigration(fileName: string): DatabaseMigration {
  const sql = readFileSync(path.join(migrationsDir, fileName), "utf8");
  const name = fileName.replace(/\.sql$/i, "");
  return { name, sql };
}

export function buildOrderedDatabaseMigrations(): DatabaseMigration[] {
  const sqlMigrations = ORDERED_SQL_MIGRATION_FILES.map(loadSqlMigration);
  return [
    {
      name: aiFoundationMigrationName,
      sql: aiFoundationMigrationSql
    },
    ...sqlMigrations
  ];
}

export function listMigrationRegistryNames(): string[] {
  return buildOrderedDatabaseMigrations().map((migration) => migration.name);
}
