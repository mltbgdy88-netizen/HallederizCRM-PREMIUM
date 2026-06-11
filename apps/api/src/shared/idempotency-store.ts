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
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_MS);

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

export function resolveIdempotencyKeyFromHeader(header: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(header) ? header[0] : header;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}
