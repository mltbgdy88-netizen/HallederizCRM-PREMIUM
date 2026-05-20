import type { EntityTimelineItem } from "@hallederiz/types";
import { createQueryExecutor, DatabaseTimelineEventRepository } from "@hallederiz/database";
import { listPersistedAuditEvents } from "./audit-service";
import type { RequestContext } from "./request-context";

function actorLabel(actorId: string | null | undefined, fallback: string): string {
  if (actorId && actorId.trim()) {
    return actorId.startsWith("ai_") ? "AI Asistan" : actorId.startsWith("wa_") ? "WhatsApp" : "Kullanıcı";
  }
  return fallback;
}

function mapMemoryToTimeline(context: RequestContext, entityType: string, entityId: string): EntityTimelineItem[] {
  return listPersistedAuditEvents(context.tenantId, entityType, entityId).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    actorLabel: actorLabel(event.actorId, "Sistem"),
    createdAt: event.createdAt,
    eventType: event.eventType,
    actionKey: event.eventType
  }));
}

export async function listEntityTimeline(
  context: RequestContext,
  entityType: string,
  entityId: string
): Promise<{ items: EntityTimelineItem[]; mode: "postgres" | "memory" }> {
  if (!context.tenantId?.trim()) {
    return { items: [], mode: "memory" };
  }

  if (context.persistenceMode === "postgres") {
    const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (postgresUrl) {
      try {
        const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
        const repo = new DatabaseTimelineEventRepository(executor);
        const rows = await repo.listByEntity(context.tenantId, entityType, entityId);
        return {
          mode: "postgres",
          items: rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description ?? "",
            actorLabel: actorLabel(row.actorId, "Sistem"),
            createdAt: row.createdAt,
            eventType: row.eventType,
            actionKey: row.actionKey
          }))
        };
      } catch {
        return { items: mapMemoryToTimeline(context, entityType, entityId), mode: "memory" };
      }
    }
  }

  return { items: mapMemoryToTimeline(context, entityType, entityId), mode: "memory" };
}
