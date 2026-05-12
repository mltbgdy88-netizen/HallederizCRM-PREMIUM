import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { executionWorkerAuditSchemaSql } from "@hallederiz/database";

function migrationSql() {
  const testFilePath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(testFilePath), "..", "..", "..", "..");
  const migrationPath = path.join(root, "packages", "database", "src", "migrations", "0005_execution_worker_audit.sql");
  return readFileSync(migrationPath, "utf8");
}

test("execution worker migration exists with required tables", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS approval_execution_logs"));
  assert.ok(sql.includes("ALTER TABLE audit_events"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS timeline_events"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS outbox_jobs"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS dead_letter_jobs"));
});

test("migration enforces tenant scoped idempotency and outbox scheduling index", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("UNIQUE (tenant_id, idempotency_key)"));
  assert.ok(sql.includes("idx_outbox_jobs_status_available_at"));
  assert.ok(sql.includes("ON outbox_jobs (status, available_at)"));
  assert.ok(sql.includes("idx_dead_letter_jobs_moved_at"));
});

test("schema export includes execution worker foundation tables", () => {
  assert.ok(executionWorkerAuditSchemaSql.includes("approval_execution_logs"));
  assert.ok(executionWorkerAuditSchemaSql.includes("timeline_events"));
  assert.ok(executionWorkerAuditSchemaSql.includes("outbox_jobs"));
  assert.ok(executionWorkerAuditSchemaSql.includes("dead_letter_jobs"));
});
