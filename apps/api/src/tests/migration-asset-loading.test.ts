import assert from "node:assert/strict";
import test from "node:test";
import { ORDERED_SQL_MIGRATION_FILES, listPackageMigrationSqlContents } from "@hallederiz/database";

test("loadMigrationSqlFiles resolves src migrations after dist build", async () => {
  const files = await listPackageMigrationSqlContents();
  assert.equal(files.length, ORDERED_SQL_MIGRATION_FILES.length);
  const corpus = files.join("\n");
  assert.ok(corpus.includes("CREATE TABLE"));
  assert.ok(corpus.includes("payment_receipts"));
});
