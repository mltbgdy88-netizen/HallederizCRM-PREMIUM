import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { omnichannelProviderAiSchemaSql } from "@hallederiz/database";

function migrationSql() {
  const testFilePath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(testFilePath), "..", "..", "..", "..");
  return readFileSync(
    path.join(root, "packages", "database", "src", "migrations", "0013_omnichannel_provider_accounts_ai.sql"),
    "utf8"
  );
}

test("omnichannel provider ai migration includes required tables", () => {
  const sql = migrationSql();
  assert.ok(sql.includes("social_media_accounts"));
  assert.ok(sql.includes("channel_credentials"));
  assert.ok(sql.includes("webhook_events"));
  assert.ok(sql.includes("ai_reply_suggestions"));
  assert.ok(sql.includes("ai_reply_jobs"));
  assert.ok(sql.includes("UNIQUE (tenant_id, provider, idempotency_key)"));
});

test("omnichannel provider ai schema export is available", () => {
  assert.ok(omnichannelProviderAiSchemaSql.includes("provider_message_receipts"));
  assert.ok(omnichannelProviderAiSchemaSql.includes("channel_templates"));
});
