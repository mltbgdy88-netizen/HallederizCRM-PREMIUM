import { randomUUID } from "node:crypto";
import type { QueryExecutor } from "../types";
import { redactAuditPayload } from "../audit/redaction.js";

export interface AuditEventInsertInput {
  tenantId: string;
  actorId?: string;
  actionKey: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
}

interface AuditEventRow {
  id: string;
}

export class DatabaseAuditEventRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async insert(input: AuditEventInsertInput): Promise<string> {
    if (!input.tenantId?.trim()) {
      throw new Error("audit_tenant_id_required");
    }

    const id = randomUUID();
    const payloadRedacted = redactAuditPayload(input.payload);
    const summary = input.description?.trim() || input.title;

    await this.executor.query(
      `INSERT INTO audit_events (
        id, tenant_id, actor_user_id, action, entity_type, entity_id,
        correlation_id, source, severity, summary, payload_redacted,
        actor_id, action_key, event_type, payload
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11::jsonb,
        $12, $13, $14, $15::jsonb
      )`,
      [
        id,
        input.tenantId,
        input.actorId ?? null,
        input.actionKey,
        input.entityType ?? "system",
        input.entityId ?? null,
        input.correlationId ?? null,
        "api",
        "info",
        summary,
        JSON.stringify(payloadRedacted),
        input.actorId ?? null,
        input.actionKey,
        input.eventType,
        JSON.stringify(payloadRedacted)
      ]
    );

    return id;
  }
}
