import type { RequestContext } from "./request-context";

export interface AuditEventRecord {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  eventType: string;
  title: string;
  description: string;
  actorType: "user" | "system" | "ai" | "whatsapp";
  actorId: string;
  actorName: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

const auditEvents: AuditEventRecord[] = [];

function resolveActorType(context: RequestContext): AuditEventRecord["actorType"] {
  if (context.userId.startsWith("ai_")) return "ai";
  if (context.userId.startsWith("wa_")) return "whatsapp";
  if (context.userId === "system") return "system";
  return "user";
}

export function recordAuditEvent(
  context: RequestContext,
  input: Omit<AuditEventRecord, "id" | "tenantId" | "createdAt" | "actorType" | "actorId" | "actorName">
) {
  const event: AuditEventRecord = {
    id: `audit_${auditEvents.length + 1}`,
    tenantId: context.tenantId,
    createdAt: new Date().toISOString(),
    actorType: resolveActorType(context),
    actorId: context.userId,
    actorName: context.userId,
    ...input
  };
  auditEvents.unshift(event);
  return event;
}

export function listAuditEvents(tenantId: string, entityType?: string, entityId?: string) {
  return auditEvents.filter((event) => {
    if (event.tenantId !== tenantId) return false;
    if (entityType && event.entityType !== entityType) return false;
    if (entityId && event.entityId !== entityId) return false;
    return true;
  });
}

