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
}
