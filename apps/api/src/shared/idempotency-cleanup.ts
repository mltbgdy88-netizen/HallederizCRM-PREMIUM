import {
  createQueryExecutor,
  DatabaseIdempotencyRecordRepository,
  type IdempotencyPurgeResult
} from "@hallederiz/database";
import { countExpiredMemoryIdempotencyRecords, purgeMemoryIdempotencyStore, resolveIdempotencyTtlMs } from "./idempotency-store";

export interface IdempotencyCleanupResult extends IdempotencyPurgeResult {
  mode: "postgres" | "memory";
  ttlMs: number;
  memoryDeletedCount?: number;
}

export interface RunIdempotencyCleanupOptions {
  dryRun?: boolean;
  limit?: number;
  before?: Date;
  persistenceMode?: string;
}

export async function runIdempotencyCleanup(
  options: RunIdempotencyCleanupOptions = {}
): Promise<IdempotencyCleanupResult> {
  const persistenceMode = options.persistenceMode ?? process.env.PERSISTENCE_MODE ?? "demo";
  const dryRun = options.dryRun ?? true;
  const before = options.before ?? new Date();
  const ttlMs = resolveIdempotencyTtlMs();

  if (persistenceMode !== "postgres") {
    const expiredCount = countExpiredMemoryIdempotencyRecords(before, ttlMs);
    const memoryDeletedCount = dryRun ? 0 : purgeMemoryIdempotencyStore(before.getTime(), ttlMs);
    return {
      mode: "memory",
      ttlMs,
      dryRun,
      before: before.toISOString(),
      limit: options.limit ?? 0,
      expiredCount,
      deletedCount: memoryDeletedCount,
      remainingEstimate: dryRun ? expiredCount : Math.max(0, expiredCount - memoryDeletedCount),
      memoryDeletedCount
    };
  }

  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!postgresUrl?.trim()) {
    throw new Error("database_url_missing");
  }

  const executor = createQueryExecutor({
    mode: "postgres",
    postgresUrl
  });
  const repository = new DatabaseIdempotencyRecordRepository(executor);
  const purgeResult = await repository.purgeExpiredIdempotencyRecords({
    before,
    limit: options.limit,
    dryRun
  });

  return {
    mode: "postgres",
    ttlMs,
    ...purgeResult
  };
}
