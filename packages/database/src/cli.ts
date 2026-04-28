import { loadMigrationSqlFiles, loadSeedSqlFiles } from "./scripts";

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

  console.log("Usage: node dist/cli.js [migrations|seeds]");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
