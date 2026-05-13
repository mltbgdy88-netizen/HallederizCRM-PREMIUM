import type { QueryExecutor, QueryResultRow } from "../types";

export type DbTenantUsageEventType = "ai_request" | "channel_message" | "document_generation" | "workflow_execution";

export interface DbTenantUsageEventRecord {
  id: string;
  tenantId: string;
  eventType: DbTenantUsageEventType;
  source: string;
  quantity: number;
  unit: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  createdAt?: string;
}

export type DbTenantUsageEventInput = Omit<DbTenantUsageEventRecord, "id" | "occurredAt" | "createdAt"> & {
  id?: string;
  occurredAt?: string;
  createdAt?: string;
};

export interface DbTenantUsageSummaryInput {
  tenantId: string;
  from?: string;
  to?: string;
  eventType?: DbTenantUsageEventType;
  source?: string;
  limits?: Partial<Record<DbTenantUsageEventType, number>>;
}

export interface DbTenantUsageSummaryItem {
  eventType: DbTenantUsageEventType;
  source: string;
  unit: string;
  quantity: number;
  eventCount: number;
}

export interface DbTenantUsageSummary {
  tenantId: string;
  from?: string;
  to?: string;
  eventType?: DbTenantUsageEventType;
  source?: string;
  totalEvents: number;
  totalQuantity: number;
  items: DbTenantUsageSummaryItem[];
  byEventType: Array<{ eventType: DbTenantUsageEventType; quantity: number; eventCount: number }>;
  bySource: Array<{ source: string; quantity: number; eventCount: number }>;
  byUnit: Array<{ unit: string; quantity: number; eventCount: number }>;
  dailyBuckets: Array<{ date: string; quantity: number; eventCount: number }>;
  limitExceeded: boolean;
  limitWarnings: string[];
}

interface TenantUsageEventRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  event_type: DbTenantUsageEventType;
  source: string;
  quantity: string | number;
  unit: string;
  metadata: unknown;
  occurred_at: string;
  created_at: string;
}

interface DatabaseTenantUsageLedgerOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function assertNonEmpty(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`missing_${fieldName}`);
  }
}

function assertPositiveQuantity(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("quantity_must_be_positive");
  }
}

function parseObjectPayload(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

function normalizeQuantity(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("invalid_usage_quantity_from_database");
  }
  return parsed;
}

function isWithinRange(event: DbTenantUsageEventRecord, input: DbTenantUsageSummaryInput): boolean {
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

function summarizeDbTenantUsageEvents(events: DbTenantUsageEventRecord[], input: DbTenantUsageSummaryInput): DbTenantUsageSummary {
  const scoped = events.filter((event) => event.tenantId === input.tenantId && isWithinRange(event, input));
  const byKey = new Map<string, DbTenantUsageSummaryItem>();
  const byEventType = new Map<DbTenantUsageEventType, { key: DbTenantUsageEventType; quantity: number; eventCount: number }>();
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

export function mapTenantUsageRowToDomainRecord(row: TenantUsageEventRow): DbTenantUsageEventRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    eventType: row.event_type,
    source: row.source,
    quantity: normalizeQuantity(row.quantity),
    unit: row.unit,
    metadata: parseObjectPayload(row.metadata),
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

export function mapTenantUsageDomainRecordToSqlParams(record: DbTenantUsageEventRecord): unknown[] {
  assertNonEmpty(record.id, "id");
  assertNonEmpty(record.tenantId, "tenant_id");
  assertNonEmpty(record.eventType, "event_type");
  assertNonEmpty(record.source, "source");
  assertPositiveQuantity(record.quantity);
  assertNonEmpty(record.unit, "unit");
  return [
    record.id,
    record.tenantId,
    record.eventType,
    record.source,
    record.quantity,
    record.unit,
    stringifyJson(record.metadata),
    record.occurredAt,
    record.createdAt
  ];
}

function toDbRecord(input: DbTenantUsageEventInput): DbTenantUsageEventRecord {
  const now = new Date().toISOString();
  assertNonEmpty(input.tenantId, "tenant_id");
  assertNonEmpty(input.eventType, "event_type");
  assertNonEmpty(input.source, "source");
  assertPositiveQuantity(input.quantity);
  assertNonEmpty(input.unit, "unit");
  return {
    id: input.id ?? `usage_${input.tenantId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tenantId: input.tenantId,
    eventType: input.eventType,
    source: input.source,
    quantity: input.quantity,
    unit: input.unit,
    metadata: input.metadata ?? {},
    occurredAt: input.occurredAt ?? now,
    createdAt: input.createdAt ?? now
  };
}

export class DatabaseTenantUsageLedger {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseTenantUsageLedgerOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("tenant_usage_postgres_mode_required");
    }
  }

  async record(event: DbTenantUsageEventInput): Promise<DbTenantUsageEventRecord> {
    this.assertPersistenceSupported();
    const record = toDbRecord(event);
    const rows = await this.executor.query<TenantUsageEventRow>(
      `INSERT INTO tenant_usage_events (
        id, tenant_id, event_type, source, quantity, unit, metadata, occurred_at, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::timestamptz,$9::timestamptz)
      RETURNING id, tenant_id, event_type, source, quantity, unit, metadata, occurred_at, created_at`,
      mapTenantUsageDomainRecordToSqlParams(record)
    );

    if (!rows[0]) {
      throw new Error("tenant_usage_insert_failed");
    }
    return mapTenantUsageRowToDomainRecord(rows[0]);
  }

  async list(tenantId: string): Promise<DbTenantUsageEventRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    const rows = await this.executor.query<TenantUsageEventRow>(
      `SELECT id, tenant_id, event_type, source, quantity, unit, metadata, occurred_at, created_at
      FROM tenant_usage_events
      WHERE tenant_id = $1
      ORDER BY occurred_at ASC`,
      [tenantId]
    );
    return rows.map((row) => mapTenantUsageRowToDomainRecord(row));
  }

  async summarize(input: DbTenantUsageSummaryInput): Promise<DbTenantUsageSummary> {
    this.assertPersistenceSupported();
    assertNonEmpty(input.tenantId, "tenant_id");
    const params: unknown[] = [input.tenantId];
    const filters = ["tenant_id = $1"];

    if (input.from) {
      params.push(input.from);
      filters.push(`occurred_at >= $${params.length}::timestamptz`);
    }
    if (input.to) {
      params.push(input.to);
      filters.push(`occurred_at <= $${params.length}::timestamptz`);
    }
    if (input.eventType) {
      params.push(input.eventType);
      filters.push(`event_type = $${params.length}`);
    }
    if (input.source) {
      params.push(input.source);
      filters.push(`source = $${params.length}`);
    }

    const rows = await this.executor.query<TenantUsageEventRow>(
      `SELECT id, tenant_id, event_type, source, quantity, unit, metadata, occurred_at, created_at
      FROM tenant_usage_events
      WHERE ${filters.join(" AND ")}
      ORDER BY occurred_at ASC`,
      params
    );
    return summarizeDbTenantUsageEvents(rows.map((row) => mapTenantUsageRowToDomainRecord(row)), input);
  }
}

export function createDatabaseTenantUsageLedger(options: DatabaseTenantUsageLedgerOptions): DatabaseTenantUsageLedger {
  return new DatabaseTenantUsageLedger(options);
}
