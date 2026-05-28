import {
  persistAuditAndTimeline,
  listPersistedAuditEvents,
  writeAuditEventMemory,
  type AuditEventRecord
} from "./audit-service";
import type { RequestContext } from "./request-context";

export type { AuditEventRecord };

export function recordAuditEvent(
  context: RequestContext,
  input: Omit<AuditEventRecord, "id" | "tenantId" | "createdAt" | "actorType" | "actorId" | "actorName">
) {
  const event = writeAuditEventMemory(context, input);
  void persistAuditAndTimeline(context, {
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    actionKey: input.eventType,
    payload: input.payload,
    writeTimeline: true
  });
  return event;
}

export function listAuditEvents(tenantId: string, entityType?: string, entityId?: string) {
  return listPersistedAuditEvents(tenantId, entityType, entityId);
}

export async function recordAuditEventStrict(
  context: RequestContext,
  input: Omit<AuditEventRecord, "id" | "tenantId" | "createdAt" | "actorType" | "actorId" | "actorName">
) {
  const result = await persistAuditAndTimeline(context, {
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    actionKey: input.eventType,
    payload: input.payload,
    writeTimeline: true
  });
  return result;
}
