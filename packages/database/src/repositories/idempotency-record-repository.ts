import { randomUUID } from "node:crypto";
import type { QueryExecutor, QueryResultRow } from "../types.js";

export interface IdempotencyRecordRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  scope: string;
  idempotency_key: string;
  request_hash: string;
  response_json: unknown;
  status_code: number;
  created_at: string;
  expires_at: string;
}

export interface IdempotencyRecordInsertInput {
  tenantId: string;
  scope: string;
  idempotencyKey: string;
  requestHash: string;
  responseJson: unknown;
  statusCode?: number;
  expiresAt: Date;
}

export interface IdempotencyPurgeOptions {
  before?: Date;
  limit?: number;
  dryRun?: boolean;
}

export interface IdempotencyPurgeResult {
  deletedCount: number;
  dryRun: boolean;
  before: string;
  limit: number;
  expiredCount: number;
  remainingEstimate: number;
}

export const DEFAULT_IDEMPOTENCY_PURGE_LIMIT = 1000;
export const MAX_IDEMPOTENCY_PURGE_LIMIT = 10000;
export const MIN_IDEMPOTENCY_PURGE_LIMIT = 1;

export function normalizeIdempotencyPurgeLimit(limit?: number): number {
  if (limit === undefined) {
    return DEFAULT_IDEMPOTENCY_PURGE_LIMIT;
  }
  if (!Number.isFinite(limit) || limit < MIN_IDEMPOTENCY_PURGE_LIMIT) {
    throw new Error(`idempotency_purge_limit_invalid:${MIN_IDEMPOTENCY_PURGE_LIMIT}`);
  }
  return Math.min(Math.floor(limit), MAX_IDEMPOTENCY_PURGE_LIMIT);
}

export class DatabaseIdempotencyRecordRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async findActive(
    tenantId: string,
    scope: string,
    idempotencyKey: string
  ): Promise<IdempotencyRecordRow | null> {
    const rows = await this.executor.query<IdempotencyRecordRow>(
      `SELECT id, tenant_id, scope, idempotency_key, request_hash, response_json, status_code, created_at, expires_at
       FROM idempotency_records
       WHERE tenant_id = $1 AND scope = $2 AND idempotency_key = $3 AND expires_at > NOW()
       LIMIT 1`,
      [tenantId, scope, idempotencyKey]
    );
    return rows[0] ?? null;
  }

  async insert(input: IdempotencyRecordInsertInput): Promise<string> {
    const id = randomUUID();
    await this.executor.query(
      `INSERT INTO idempotency_records (
        id, tenant_id, scope, idempotency_key, request_hash, response_json, status_code, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
      [
        id,
        input.tenantId,
        input.scope,
        input.idempotencyKey,
        input.requestHash,
        JSON.stringify(input.responseJson),
        input.statusCode ?? 200,
        input.expiresAt.toISOString()
      ]
    );
    return id;
  }

  async countExpiredIdempotencyRecords(before = new Date()): Promise<number> {
    const rows = await this.executor.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM idempotency_records WHERE expires_at <= $1`,
      [before.toISOString()]
    );
    return Number(rows[0]?.count ?? 0);
  }

  async purgeExpiredIdempotencyRecords(options: IdempotencyPurgeOptions = {}): Promise<IdempotencyPurgeResult> {
    const before = options.before ?? new Date();
    const limit = normalizeIdempotencyPurgeLimit(options.limit);
    const dryRun = options.dryRun ?? false;
    const expiredCount = await this.countExpiredIdempotencyRecords(before);

    if (dryRun) {
      return {
        deletedCount: 0,
        dryRun: true,
        before: before.toISOString(),
        limit,
        expiredCount,
        remainingEstimate: expiredCount
      };
    }

    const rows = await this.executor.query<{ id: string }>(
      `DELETE FROM idempotency_records
       WHERE id IN (
         SELECT id FROM idempotency_records
         WHERE expires_at <= $1
         ORDER BY expires_at ASC
         LIMIT $2
       )
       RETURNING id`,
      [before.toISOString(), limit]
    );

    const deletedCount = rows.length;
    return {
      deletedCount,
      dryRun: false,
      before: before.toISOString(),
      limit,
      expiredCount,
      remainingEstimate: Math.max(0, expiredCount - deletedCount)
    };
  }

  async deleteExpired(before = new Date()): Promise<number> {
    const result = await this.purgeExpiredIdempotencyRecords({
      before,
      dryRun: false,
      limit: MAX_IDEMPOTENCY_PURGE_LIMIT
    });
    return result.deletedCount;
  }
}
