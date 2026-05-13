export type TenantUsageEventType =
  | "ai_request"
  | "channel_message"
  | "document_generation"
  | "workflow_execution";

export interface TenantUsageEvent {
  id: string;
  tenantId: string;
  eventType: TenantUsageEventType;
  source: string;
  quantity: number;
  unit: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  createdAt?: string;
}

export type TenantUsageEventInput = Omit<TenantUsageEvent, "id" | "occurredAt" | "createdAt"> & {
  id?: string;
  occurredAt?: string;
  createdAt?: string;
};

export interface TenantUsageSummaryItem {
  eventType: TenantUsageEventType;
  source: string;
  unit: string;
  quantity: number;
  eventCount: number;
}

export interface TenantUsageSummary {
  tenantId: string;
  from?: string;
  to?: string;
  eventType?: TenantUsageEventType;
  source?: string;
  totalEvents: number;
  totalQuantity: number;
  items: TenantUsageSummaryItem[];
  byEventType: Array<{ eventType: TenantUsageEventType; quantity: number; eventCount: number }>;
  bySource: Array<{ source: string; quantity: number; eventCount: number }>;
  byUnit: Array<{ unit: string; quantity: number; eventCount: number }>;
  dailyBuckets: Array<{ date: string; quantity: number; eventCount: number }>;
  limitExceeded: boolean;
  limitWarnings: string[];
}

export interface TenantUsageSummaryInput {
  tenantId: string;
  from?: string;
  to?: string;
  eventType?: TenantUsageEventType;
  source?: string;
  limits?: Partial<Record<TenantUsageEventType, number>>;
}

export interface TenantUsageLedger {
  record(event: TenantUsageEventInput): Promise<TenantUsageEvent>;
  list(tenantId: string): Promise<TenantUsageEvent[]>;
  summarize(input: TenantUsageSummaryInput): Promise<TenantUsageSummary>;
}

function assertUsageInput(event: TenantUsageEventInput) {
  if (!event.tenantId) throw new Error("tenantId is required for usage events.");
  if (!event.eventType) throw new Error("eventType is required for usage events.");
  if (!event.source) throw new Error("source is required for usage events.");
  if (!Number.isFinite(event.quantity) || event.quantity <= 0) throw new Error("quantity must be a positive number.");
  if (!event.unit) throw new Error("unit is required for usage events.");
}

function isWithinRange(event: TenantUsageEvent, input: TenantUsageSummaryInput): boolean {
  const time = new Date(event.occurredAt).getTime();
  if (input.from && time < new Date(input.from).getTime()) return false;
  if (input.to && time > new Date(input.to).getTime()) return false;
  if (input.eventType && event.eventType !== input.eventType) return false;
  if (input.source && event.source !== input.source) return false;
  return true;
}

function addAggregate<T extends string>(
  map: Map<T, { key: T; quantity: number; eventCount: number }>,
  key: T,
  quantity: number
) {
  const current = map.get(key) ?? { key, quantity: 0, eventCount: 0 };
  current.quantity += quantity;
  current.eventCount += 1;
  map.set(key, current);
}

export function summarizeTenantUsageEvents(events: TenantUsageEvent[], input: TenantUsageSummaryInput): TenantUsageSummary {
  const scoped = events.filter((event) => event.tenantId === input.tenantId && isWithinRange(event, input));
  const byKey = new Map<string, TenantUsageSummaryItem>();
  const byEventType = new Map<TenantUsageEventType, { key: TenantUsageEventType; quantity: number; eventCount: number }>();
  const bySource = new Map<string, { key: string; quantity: number; eventCount: number }>();
  const byUnit = new Map<string, { key: string; quantity: number; eventCount: number }>();
  const dailyBuckets = new Map<string, { key: string; quantity: number; eventCount: number }>();

  for (const event of scoped) {
    const key = `${event.eventType}:${event.source}:${event.unit}`;
    const item = byKey.get(key) ?? {
      eventType: event.eventType,
      source: event.source,
      unit: event.unit,
      quantity: 0,
      eventCount: 0
    };
    item.quantity += event.quantity;
    item.eventCount += 1;
    byKey.set(key, item);
    addAggregate(byEventType, event.eventType, event.quantity);
    addAggregate(bySource, event.source, event.quantity);
    addAggregate(byUnit, event.unit, event.quantity);
    addAggregate(dailyBuckets, event.occurredAt.slice(0, 10), event.quantity);
  }

  const items = [...byKey.values()].sort((a, b) => a.eventType.localeCompare(b.eventType) || a.source.localeCompare(b.source));
  const limitWarnings = items.flatMap((item) => {
    const limit = input.limits?.[item.eventType];
    return typeof limit === "number" && item.quantity > limit
      ? [`${item.eventType}:${item.quantity}/${limit} ${item.unit}`]
      : [];
  });

  return {
    tenantId: input.tenantId,
    from: input.from,
    to: input.to,
    eventType: input.eventType,
    source: input.source,
    totalEvents: scoped.length,
    totalQuantity: scoped.reduce((sum, event) => sum + event.quantity, 0),
    items,
    byEventType: [...byEventType.values()].map((item) => ({ eventType: item.key, quantity: item.quantity, eventCount: item.eventCount })),
    bySource: [...bySource.values()].map((item) => ({ source: item.key, quantity: item.quantity, eventCount: item.eventCount })),
    byUnit: [...byUnit.values()].map((item) => ({ unit: item.key, quantity: item.quantity, eventCount: item.eventCount })),
    dailyBuckets: [...dailyBuckets.values()]
      .map((item) => ({ date: item.key, quantity: item.quantity, eventCount: item.eventCount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    limitExceeded: limitWarnings.length > 0,
    limitWarnings
  };
}

export class InMemoryTenantUsageLedger implements TenantUsageLedger {
  private readonly events = new Map<string, TenantUsageEvent[]>();

  async record(event: TenantUsageEventInput): Promise<TenantUsageEvent> {
    assertUsageInput(event);
    const now = new Date().toISOString();
    const saved: TenantUsageEvent = {
      ...event,
      id: event.id ?? `usage_${event.tenantId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      occurredAt: event.occurredAt ?? now,
      createdAt: event.createdAt ?? now
    };
    const current = this.events.get(saved.tenantId) ?? [];
    current.push(saved);
    this.events.set(saved.tenantId, current);
    return saved;
  }

  async list(tenantId: string): Promise<TenantUsageEvent[]> {
    return [...(this.events.get(tenantId) ?? [])].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  async summarize(input: TenantUsageSummaryInput): Promise<TenantUsageSummary> {
    return summarizeTenantUsageEvents(await this.list(input.tenantId), input);
  }

  reset() {
    this.events.clear();
  }
}

export async function recordAiRequestUsage(
  ledger: TenantUsageLedger,
  input: Omit<TenantUsageEventInput, "eventType" | "unit" | "quantity"> & { quantity?: number; unit?: string }
) {
  return ledger.record({ ...input, eventType: "ai_request", quantity: input.quantity ?? 1, unit: input.unit ?? "request" });
}

export async function recordChannelMessageUsage(
  ledger: TenantUsageLedger,
  input: Omit<TenantUsageEventInput, "eventType" | "unit" | "quantity"> & { quantity?: number; unit?: string }
) {
  return ledger.record({ ...input, eventType: "channel_message", quantity: input.quantity ?? 1, unit: input.unit ?? "message" });
}

export async function recordDocumentGenerationUsage(
  ledger: TenantUsageLedger,
  input: Omit<TenantUsageEventInput, "eventType" | "unit" | "quantity"> & { quantity?: number; unit?: string }
) {
  return ledger.record({ ...input, eventType: "document_generation", quantity: input.quantity ?? 1, unit: input.unit ?? "document" });
}

export async function recordWorkflowExecutionUsage(
  ledger: TenantUsageLedger,
  input: Omit<TenantUsageEventInput, "eventType" | "unit" | "quantity"> & { quantity?: number; unit?: string }
) {
  return ledger.record({ ...input, eventType: "workflow_execution", quantity: input.quantity ?? 1, unit: input.unit ?? "execution" });
}

export const tenantUsageLedger = new InMemoryTenantUsageLedger();
