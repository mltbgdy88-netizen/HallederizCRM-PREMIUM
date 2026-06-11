#!/usr/bin/env node

function parseArgs(argv) {
  const parsed = {
    execute: false,
    dryRun: true,
    limit: undefined
  };

  for (const arg of argv) {
    if (arg === "--execute") {
      parsed.execute = true;
      parsed.dryRun = false;
      continue;
    }
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      parsed.execute = false;
      continue;
    }
    if (arg.startsWith("--limit=")) {
      parsed.limit = Number(arg.slice("--limit=".length));
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Kullanim:
  pnpm ops:idempotency-cleanup:dry-run [--limit=1000]
  pnpm ops:idempotency-cleanup -- --execute [--limit=1000]

Varsayilan dry-run modudur. Silme icin --execute zorunludur.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const persistenceMode = process.env.PERSISTENCE_MODE ?? "demo";
  if (args.execute && persistenceMode !== "postgres") {
    console.error("Execute modu icin PERSISTENCE_MODE=postgres gerekir.");
    process.exit(2);
  }

  if (persistenceMode !== "postgres") {
    console.log(`Dry-run: ${args.dryRun ? "evet" : "hayir"}`);
    console.log("Mod: memory");
    console.log("Suresi dolan idempotency kaydi: 0");
    console.log("Silinen kayit: 0");
    console.log("Not: CLI cleanup yalnizca postgres modunda veritabani kaydi siler.");
    process.exit(0);
  }

  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!postgresUrl?.trim()) {
    console.error("DATABASE_URL veya POSTGRES_URL bulunamadi.");
    process.exit(2);
  }

  try {
    const { createQueryExecutor, DatabaseIdempotencyRecordRepository } = await import("@hallederiz/database");
    const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
    const repository = new DatabaseIdempotencyRecordRepository(executor);
    const result = await repository.purgeExpiredIdempotencyRecords({
      before: new Date(),
      limit: args.limit,
      dryRun: args.dryRun
    });

    console.log(`Dry-run: ${result.dryRun ? "evet" : "hayir"}`);
    console.log("Mod: postgres");
    console.log(`Suresi dolan idempotency kaydi: ${result.expiredCount}`);
    console.log(`Silinen kayit: ${result.deletedCount}`);
    console.log(`Kalan tahmini kayit: ${result.remainingEstimate}`);
    console.log(`Limit: ${result.limit}`);
    console.log(`Before: ${result.before}`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Idempotency cleanup basarisiz: ${message}`);
    process.exit(1);
  }
}

module.exports = { parseArgs };

if (require.main === module) {
  main();
}
