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

  async deleteExpired(before = new Date()): Promise<number> {
    const rows = await this.executor.query<{ id: string }>(
      `DELETE FROM idempotency_records WHERE expires_at <= $1 RETURNING id`,
      [before.toISOString()]
    );
    return rows.length;
  }
}
