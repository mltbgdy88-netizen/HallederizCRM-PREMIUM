import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { pendingApprovalRequestsSchemaSql } from "@hallederiz/database";

function migrationSql() {
  const testFilePath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(testFilePath), "..", "..", "..", "..");
  const migrationPath = path.join(
    root,
    "packages",
    "database",
    "src",
    "migrations",
    "0006_pending_approval_requests.sql"
  );
  return readFileSync(migrationPath, "utf8");
}

test("pending approval migration exists with required table and columns", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS pending_approval_requests"));
  assert.ok(sql.includes("tenant_id TEXT NOT NULL"));
  assert.ok(sql.includes("approval_request_id TEXT NOT NULL"));
  assert.ok(sql.includes("action_key TEXT NOT NULL"));
  assert.ok(sql.includes("actor_id TEXT NOT NULL"));
  assert.ok(sql.includes("status TEXT NOT NULL"));
  assert.ok(sql.includes("idempotency_key TEXT"));
});

test("pending approval migration includes required index and unique constraints", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("UNIQUE (tenant_id, approval_request_id)"));
  assert.ok(sql.includes("UNIQUE (tenant_id, idempotency_key)"));
  assert.ok(sql.includes("idx_pending_approval_requests_status"));
  assert.ok(sql.includes("idx_pending_approval_requests_action_key"));
  assert.ok(sql.includes("idx_pending_approval_requests_created_at"));
});

test("pending approval schema export is available", () => {
  assert.ok(pendingApprovalRequestsSchemaSql.includes("pending_approval_requests"));
  assert.ok(pendingApprovalRequestsSchemaSql.includes("approval_request_id"));
});
