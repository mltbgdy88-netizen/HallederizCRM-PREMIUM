import { createHash } from "node:crypto";
import { DatabaseIdempotencyRecordRepository } from "@hallederiz/database";
import type { RequestContext } from "./request-context";
import { buildRepositoryRuntime } from "./db-runtime";

interface MemoryStoredEntry {
  requestHash: string;
  body: unknown;
  createdAt: number;
}

const memoryStore = new Map<string, MemoryStoredEntry>();

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_TTL_MS = 60 * 60 * 1000;
const WARN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
let ttlWarningLogged = false;

export function resolveIdempotencyTtlMs(): number {
  const rawMs = process.env.IDEMPOTENCY_TTL_MS?.trim();
  const rawHours = process.env.IDEMPOTENCY_TTL_HOURS?.trim();
  let ttlMs = DEFAULT_TTL_MS;

  if (rawMs) {
    ttlMs = Number(rawMs);
  } else if (rawHours) {
    ttlMs = Number(rawHours) * 60 * 60 * 1000;
  }

  if (!Number.isFinite(ttlMs) || ttlMs < MIN_TTL_MS) {
    return MIN_TTL_MS;
  }

  if (ttlMs > WARN_TTL_MS && !ttlWarningLogged) {
    ttlWarningLogged = true;
    console.warn(
      JSON.stringify({
        type: "idempotency_ttl_warning",
        message: "Idempotency TTL 7 gunden uzun; operasyonel temizlik riski artabilir.",
        ttlMs
      })
    );
  }

  return ttlMs;
}

function buildStoreKey(tenantId: string, scope: string, idempotencyKey: string): string {
  return `${tenantId}:${scope}:${idempotencyKey}`;
}

export function hashIdempotencyRequest(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export type IdempotencyCheckResult =
  | { type: "new" }
  | { type: "replay"; body: unknown }
  | { type: "conflict" };

function shouldUsePersistentStore(context: RequestContext): boolean {
  if (context.persistenceMode !== "postgres") {
    return false;
  }
  return buildRepositoryRuntime(context).dbEnabled;
}

export async function checkIdempotency(
  context: RequestContext,
  scope: string,
  idempotencyKey: string,
  body: unknown
): Promise<IdempotencyCheckResult> {
  const requestHash = hashIdempotencyRequest(body);

  if (shouldUsePersistentStore(context)) {
    const runtime = buildRepositoryRuntime(context);
    const repository = new DatabaseIdempotencyRecordRepository(runtime.executor);
    const existing = await repository.findActive(context.tenantId, scope, idempotencyKey);
    if (!existing) {
      return { type: "new" };
    }
    if (existing.request_hash === requestHash) {
      return { type: "replay", body: existing.response_json };
    }
    return { type: "conflict" };
  }

  const key = buildStoreKey(context.tenantId, scope, idempotencyKey);
  const existing = memoryStore.get(key);
  if (!existing) {
    return { type: "new" };
  }
  const ttlMs = resolveIdempotencyTtlMs();
  if (Date.now() - existing.createdAt >= ttlMs) {
    memoryStore.delete(key);
    return { type: "new" };
  }
  if (existing.requestHash === requestHash) {
    return { type: "replay", body: existing.body };
  }
  return { type: "conflict" };
}

export async function storeIdempotencyResult(
  context: RequestContext,
  scope: string,
  idempotencyKey: string,
  body: unknown,
  result: unknown,
  statusCode = 200
): Promise<void> {
  const requestHash = hashIdempotencyRequest(body);
  const expiresAt = new Date(Date.now() + resolveIdempotencyTtlMs());

  if (shouldUsePersistentStore(context)) {
    const runtime = buildRepositoryRuntime(context);
    const repository = new DatabaseIdempotencyRecordRepository(runtime.executor);
    await repository.insert({
      tenantId: context.tenantId,
      scope,
      idempotencyKey,
      requestHash,
      responseJson: result,
      statusCode,
      expiresAt
    });
    return;
  }

  const key = buildStoreKey(context.tenantId, scope, idempotencyKey);
  memoryStore.set(key, {
    requestHash,
    body: result,
    createdAt: Date.now()
  });
}

export function clearIdempotencyStoreForTests(): void {
  memoryStore.clear();
}

export function setMemoryIdempotencyCreatedAtForTests(
  tenantId: string,
  scope: string,
  idempotencyKey: string,
  createdAt: number
): void {
  const key = buildStoreKey(tenantId, scope, idempotencyKey);
  const existing = memoryStore.get(key);
  if (!existing) {
    throw new Error("memory_idempotency_entry_missing");
  }
  memoryStore.set(key, { ...existing, createdAt });
}

export function countExpiredMemoryIdempotencyRecords(now = new Date(), ttlMs = resolveIdempotencyTtlMs()): number {
  const cutoff = now.getTime() - ttlMs;
  let count = 0;
  for (const entry of memoryStore.values()) {
    if (entry.createdAt <= cutoff) {
      count += 1;
    }
  }
  return count;
}

export function purgeMemoryIdempotencyStore(nowMs = Date.now(), ttlMs = resolveIdempotencyTtlMs()): number {
  const cutoff = nowMs - ttlMs;
  let deleted = 0;
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.createdAt <= cutoff) {
      memoryStore.delete(key);
      deleted += 1;
    }
  }
  return deleted;
}

export function resolveIdempotencyKeyFromHeader(header: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(header) ? header[0] : header;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}
