import type {
  ExecutionAuditEventDraft,
  ExecutionLogEntry,
  ExecutionTimelineEventDraft
} from "./execution-log";

export interface ApprovalExecutionLogRepository {
  saveExecutionLog: (entry: ExecutionLogEntry) => ExecutionLogEntry;
  saveAuditEventDraft: (event: ExecutionAuditEventDraft) => ExecutionAuditEventDraft;
  saveTimelineEventDraft: (event: ExecutionTimelineEventDraft) => ExecutionTimelineEventDraft;
  findByIdempotencyKey: (tenantId: string, idempotencyKey: string) => ExecutionLogEntry | undefined;
  getExecutionLog: (executionId: string) => ExecutionLogEntry | undefined;
}

export class InMemoryApprovalExecutionLogRepository implements ApprovalExecutionLogRepository {
  private readonly logsByExecutionId = new Map<string, ExecutionLogEntry>();
  private readonly logsByIdempotency = new Map<string, ExecutionLogEntry>();
  private readonly auditEvents = new Map<string, ExecutionAuditEventDraft>();
  private readonly timelineEvents = new Map<string, ExecutionTimelineEventDraft>();

  saveExecutionLog(entry: ExecutionLogEntry): ExecutionLogEntry {
    const idempotencyComposite = `${entry.tenantId}:${entry.idempotencyKey}`;
    const existing = this.logsByIdempotency.get(idempotencyComposite);
    if (existing && existing.executionId !== entry.executionId) {
      throw new Error("duplicate_idempotency_persistence_conflict");
    }

    this.logsByExecutionId.set(entry.executionId, entry);
    this.logsByIdempotency.set(idempotencyComposite, entry);
    return entry;
  }

  saveAuditEventDraft(event: ExecutionAuditEventDraft): ExecutionAuditEventDraft {
    const withId = {
      ...event,
      eventId: event.eventId ?? `audit_${event.payload.executionId}`
    };
    this.auditEvents.set(withId.eventId, withId);
    return withId;
  }

  saveTimelineEventDraft(event: ExecutionTimelineEventDraft): ExecutionTimelineEventDraft {
    const withId = {
      ...event,
      eventId: event.eventId ?? `timeline_${event.payload.executionId}`
    };
    this.timelineEvents.set(withId.eventId, withId);
    return withId;
  }

  findByIdempotencyKey(tenantId: string, idempotencyKey: string): ExecutionLogEntry | undefined {
    return this.logsByIdempotency.get(`${tenantId}:${idempotencyKey}`);
  }

  getExecutionLog(executionId: string): ExecutionLogEntry | undefined {
    return this.logsByExecutionId.get(executionId);
  }
}
