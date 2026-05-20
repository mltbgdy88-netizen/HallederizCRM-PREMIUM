import { randomUUID } from "node:crypto";
import type { QueryExecutor } from "../types";
import { redactAuditPayload } from "../audit/redaction.js";

export interface TimelineEventInsertInput {
  tenantId: string;
  entityType: string;
  entityId: string;
  actionKey: string;
  eventType: string;
  title: string;
  description?: string;
  correlationId?: string;
  actorId?: string;
  idempotencyKey?: string;
  payload?: Record<string, unknown>;
  visibility?: "internal" | "customer" | "operator";
}

export class DatabaseTimelineEventRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async insert(input: TimelineEventInsertInput): Promise<string> {
    if (!input.tenantId?.trim()) {
      throw new Error("timeline_tenant_id_required");
    }
    if (!input.entityType?.trim() || !input.entityId?.trim()) {
      throw new Error("timeline_entity_required");
    }

    const id = randomUUID();
    const payload = redactAuditPayload(input.payload);

    await this.executor.query(
      `INSERT INTO timeline_events (
        id, tenant_id, subject_type, subject_id, actor_id, action_key, event_type,
        title, description, payload, correlation_id, idempotency_key
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)`,
      [
        id,
        input.tenantId,
        input.entityType,
        input.entityId,
        input.actorId ?? null,
        input.actionKey,
        input.eventType,
        input.title,
        input.description ?? null,
        JSON.stringify(payload),
        input.correlationId ?? null,
        input.idempotencyKey ?? null
      ]
    );

    return id;
  }

  async listByEntity(tenantId: string, entityType: string, entityId: string, limit = 50): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      eventType: string;
      actionKey: string;
      actorId: string | null;
      createdAt: string;
    }>
  > {
    if (!tenantId?.trim()) {
      throw new Error("timeline_tenant_id_required");
    }
    const rows = await this.executor.query<{
      id: string;
      title: string;
      description: string | null;
      event_type: string;
      action_key: string;
      actor_id: string | null;
      created_at: string;
    }>(
      `SELECT id, title, description, event_type, action_key, actor_id, created_at
       FROM timeline_events
       WHERE tenant_id = $1 AND subject_type = $2 AND subject_id = $3
       ORDER BY created_at DESC
       LIMIT $4`,
      [tenantId, entityType, entityId, limit]
    );
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      eventType: row.event_type,
      actionKey: row.action_key,
      actorId: row.actor_id,
      createdAt: row.created_at
    }));
  }
}
