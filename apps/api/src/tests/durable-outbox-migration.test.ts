import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

function migrationSql() {
  const testFilePath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(testFilePath), "..", "..", "..", "..");
  const migrationPath = path.join(
    root,
    "packages",
    "database",
    "src",
    "migrations",
    "0009_durable_outbox_hardening.sql"
  );
  return readFileSync(migrationPath, "utf8");
}

test("durable outbox migration adds lease/idempotency/approval columns and indexes", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("ALTER TABLE outbox_jobs"));
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS approval_request_id"));
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS lease_expires_at"));
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS completed_at"));
  assert.ok(sql.includes("ADD COLUMN IF NOT EXISTS dead_lettered_at"));
  assert.ok(sql.includes("CHECK (status IN ('pending', 'claimed', 'processing', 'completed', 'failed', 'dead_letter', 'cancelled'))"));
  assert.ok(sql.includes("idx_outbox_jobs_tenant_status_available"));
  assert.ok(sql.includes("idx_outbox_jobs_tenant_action_created"));
  assert.ok(sql.includes("idx_outbox_jobs_lease_expires_at"));
  assert.ok(sql.includes("idx_outbox_jobs_approval_request_id"));
});
