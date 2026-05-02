import { applyDatabaseMigrations, createPostgresMigrationExecutor, listAppliedMigrations } from "./migrations";
import { loadMigrationSqlFiles, loadSeedSqlFiles } from "./scripts";

function getPostgresUrl(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

async function main() {
  const target = process.argv[2];

  if (target === "migrations") {
    const files = await loadMigrationSqlFiles(import.meta.url);
    console.log(`Migrations loaded: ${files.length}`);
    return;
  }

  if (target === "seeds") {
    const files = await loadSeedSqlFiles(import.meta.url);
    console.log(`Seeds loaded: ${files.length}`);
    return;
  }

  if (target === "migrate:status") {
    const postgresUrl = getPostgresUrl();
    if (!postgresUrl) {
      throw new Error("POSTGRES_URL or DATABASE_URL is required for migrate:status.");
    }
    const executor = createPostgresMigrationExecutor({ mode: "postgres", postgresUrl });
    const rows = await listAppliedMigrations(executor);
    console.log(`Applied migrations: ${rows.length}`);
    for (const row of rows) {
      console.log(`${row.name} ${row.checksum} ${row.applied_at}`);
    }
    return;
  }

  if (target === "migrate:apply") {
    const postgresUrl = getPostgresUrl();
    if (!postgresUrl) {
      throw new Error("POSTGRES_URL or DATABASE_URL is required for migrate:apply.");
    }
    const executor = createPostgresMigrationExecutor({ mode: "postgres", postgresUrl });
    const results = await applyDatabaseMigrations(executor);
    for (const result of results) {
      console.log(`${result.status.toUpperCase()} ${result.name} ${result.checksum}`);
    }
    return;
  }

  console.log("Usage: node dist/cli.js [migrations|seeds|migrate:status|migrate:apply]");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
