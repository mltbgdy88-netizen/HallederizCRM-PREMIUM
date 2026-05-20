import assert from "node:assert/strict";
import test from "node:test";
import { buildOrderedDatabaseMigrations, FOUNDATION_TABLE_NAMES } from "@hallederiz/database";

const LINE_TABLES = [
  "payment_reversals",
  "delivery_lines",
  "invoice_lines",
  "return_lines",
  "document_deliveries"
] as const;

test("commercial line tables exist in migration corpus", () => {
  const corpus = buildOrderedDatabaseMigrations().map((migration) => migration.sql).join("\n");
  for (const table of LINE_TABLES) {
    assert.ok(corpus.includes(table), `missing table ${table}`);
  }
});

test("foundation table list includes commercial line tables", () => {
  for (const table of LINE_TABLES) {
    assert.ok((FOUNDATION_TABLE_NAMES as readonly string[]).includes(table));
  }
});
