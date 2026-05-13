import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  DatabaseTenantUsageLedger,
  mapTenantUsageDomainRecordToSqlParams,
  mapTenantUsageRowToDomainRecord,
  tenantUsageEventsSchemaSql,
  type QueryExecutor,
  type QueryResultRow
} from "@hallederiz/database";

const repoRoot = join(process.cwd(), "..", "..");

test("tenant usage migration defines tenant scoped usage event table and indexes", () => {
  const migration = readFileSync(
    join(repoRoot, "packages", "database", "src", "migrations", "0007_tenant_usage_events.sql"),
    "utf8"
  );

  assert.match(migration, /CREATE TABLE IF NOT EXISTS tenant_usage_events/);
  assert.match(migration, /tenant_id TEXT NOT NULL/);
  assert.match(migration, /metadata JSONB NOT NULL/);
  assert.match(migration, /idx_tenant_usage_events_tenant_occurred_at/);
  assert.match(migration, /idx_tenant_usage_events_tenant_event_type_occurred_at/);
  assert.match(migration, /idx_tenant_usage_events_tenant_source_occurred_at/);
  assert.match(tenantUsageEventsSchemaSql, /tenant_usage_events/);
});

test("tenant usage database mapper preserves tenant and aggregation fields", () => {
  const row = mapTenantUsageRowToDomainRecord({
    id: "usage_1",
    tenant_id: "tenant_1",
    event_type: "ai_request",
    source: "assistant",
    quantity: "3",
    unit: "request",
    metadata: { model: "local" },
    occurred_at: "2026-05-01T00:00:00.000Z",
    created_at: "2026-05-01T00:00:01.000Z"
  });

  assert.equal(row.tenantId, "tenant_1");
  assert.equal(row.eventType, "ai_request");
  assert.equal(row.quantity, 3);
  assert.equal(row.metadata?.model, "local");

  const params = mapTenantUsageDomainRecordToSqlParams(row);
  assert.equal(params[1], "tenant_1");
  assert.equal(params[2], "ai_request");
  assert.equal(params[3], "assistant");
});

test("tenant usage database ledger fails closed outside postgres persistence mode", async () => {
  const executor: QueryExecutor = {
    async query<T extends QueryResultRow = QueryResultRow>(): Promise<T[]> {
      throw new Error("query_should_not_run");
    },
    async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
      return operation(this);
    }
  };
  const ledger = new DatabaseTenantUsageLedger({ executor, persistenceMode: "demo" });

  await assert.rejects(
    () =>
      ledger.record({
        tenantId: "tenant_1",
        eventType: "document_generation",
        source: "document_service",
        quantity: 1,
        unit: "document"
      }),
    /tenant_usage_postgres_mode_required/
  );
});

