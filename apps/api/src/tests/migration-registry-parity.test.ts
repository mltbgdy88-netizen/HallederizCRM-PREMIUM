import assert from "node:assert/strict";
import test from "node:test";
import {
  ORDERED_SQL_MIGRATION_FILES,
  FOUNDATION_TABLE_NAMES,
  buildOrderedDatabaseMigrations,
  listMigrationRegistryNames
} from "@hallederiz/database";

test("migration registry includes ai foundation and ordered sql files", () => {
  const names = listMigrationRegistryNames();
  assert.ok(names.includes("20260502_ai_foundation"));
  assert.ok(names.includes("0014_commercial_line_tables"));
  for (const file of ORDERED_SQL_MIGRATION_FILES) {
    const id = file.replace(/\.sql$/i, "");
    assert.ok(names.includes(id), `missing migration ${id}`);
  }
  const unique = new Set(names);
  assert.equal(unique.size, names.length);
});

test("foundation tables exist in migration SQL corpus", () => {
  const migrations = buildOrderedDatabaseMigrations();
  const corpus = migrations.map((migration) => migration.sql).join("\n");
  for (const table of FOUNDATION_TABLE_NAMES) {
    assert.ok(
      corpus.includes(table),
      `expected table reference ${table} in migration corpus`
    );
  }
});

test("ordered migration files are deterministic", () => {
  const migrations = buildOrderedDatabaseMigrations();
  const firstSql = migrations.find((migration) => migration.name === ORDERED_SQL_MIGRATION_FILES[0].replace(/\.sql$/i, ""))?.sql;
  assert.ok(firstSql && firstSql.includes("CREATE TABLE"));
});
