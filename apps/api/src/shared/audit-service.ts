import {
  createQueryExecutor,
  DatabaseAuditEventRepository,
  DatabaseTimelineEventRepository
} from "@hallederiz/database";
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

export interface AuditWriteInput {
  entityType: string;
  entityId: string;
  eventType: string;
  title: string;
  description: string;
  actionKey?: string;
  correlationId?: string;
  payload?: Record<string, unknown>;
  writeTimeline?: boolean;
}

export type AuditWriteResult =
  | { ok: true; event: AuditEventRecord; mode: "postgres" | "memory" }
  | { ok: false; mode: "unavailable"; reason: string };

const memoryEvents: AuditEventRecord[] = [];

function resolveActorType(context: RequestContext): AuditEventRecord["actorType"] {
  if (context.userId.startsWith("ai_")) return "ai";
  if (context.userId.startsWith("wa_")) return "whatsapp";
  if (context.userId === "system") return "system";
  return "user";
}

function getPostgresUrl(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

export function writeAuditEventMemory(
  context: RequestContext,
  input: Omit<AuditEventRecord, "id" | "tenantId" | "createdAt" | "actorType" | "actorId" | "actorName">
): AuditEventRecord {
  return writeMemory(context, {
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    payload: input.payload
  });
}

function writeMemory(context: RequestContext, input: AuditWriteInput): AuditEventRecord {
  const event: AuditEventRecord = {
    id: `audit_${memoryEvents.length + 1}`,
    tenantId: context.tenantId,
    createdAt: new Date().toISOString(),
    actorType: resolveActorType(context),
    actorId: context.userId,
    actorName: context.userId,
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    title: input.title,
    description: input.description,
    payload: input.payload
  };
  memoryEvents.unshift(event);
  return event;
}

export async function persistAuditAndTimeline(
  context: RequestContext,
  input: AuditWriteInput
): Promise<AuditWriteResult> {
  if (!context.tenantId?.trim()) {
    return { ok: false, mode: "unavailable", reason: "audit_tenant_id_required" };
  }

  const actionKey = input.actionKey ?? input.eventType;
  const isProduction = process.env.NODE_ENV === "production";

  if (context.persistenceMode === "postgres") {
    const postgresUrl = getPostgresUrl();
    if (!postgresUrl) {
      return isProduction
        ? { ok: false, mode: "unavailable", reason: "audit_persistence_unavailable" }
        : { ok: true, event: writeMemory(context, input), mode: "memory" };
    }

    try {
      const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
      const auditRepo = new DatabaseAuditEventRepository(executor);
      const timelineRepo = new DatabaseTimelineEventRepository(executor);
      const auditId = await auditRepo.insert({
        tenantId: context.tenantId,
        actorId: context.userId,
        actionKey,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        correlationId: input.correlationId,
        title: input.title,
        description: input.description,
        payload: input.payload
      });

      if (input.writeTimeline !== false) {
        await timelineRepo.insert({
          tenantId: context.tenantId,
          entityType: input.entityType,
          entityId: input.entityId,
          actionKey,
          eventType: input.eventType,
          title: input.title,
          description: input.description,
          correlationId: input.correlationId,
          actorId: context.userId,
          payload: input.payload
        });
      }

      const event: AuditEventRecord = {
        id: auditId,
        tenantId: context.tenantId,
        createdAt: new Date().toISOString(),
        actorType: resolveActorType(context),
        actorId: context.userId,
        actorName: context.userId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: input.eventType,
        title: input.title,
        description: input.description,
        payload: input.payload
      };
      memoryEvents.unshift(event);
      return { ok: true, event, mode: "postgres" };
    } catch {
      return isProduction
        ? { ok: false, mode: "unavailable", reason: "audit_persistence_unavailable" }
        : { ok: true, event: writeMemory(context, input), mode: "memory" };
    }
  }

  return { ok: true, event: writeMemory(context, input), mode: "memory" };
}

export function listPersistedAuditEvents(tenantId: string, entityType?: string, entityId?: string) {
  return memoryEvents.filter((event) => {
    if (event.tenantId !== tenantId) return false;
    if (entityType && event.entityType !== entityType) return false;
    if (entityId && event.entityId !== entityId) return false;
    return true;
  });
}
