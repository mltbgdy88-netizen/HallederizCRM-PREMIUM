import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbOmnichannelConversationRecord {
  id: string;
  tenantId: string;
  channel: "whatsapp" | "instagram" | "facebook" | "web_chat" | "email" | "sms" | "internal_note";
  externalConversationId: string;
  customerId?: string;
  contactHandle?: string;
  contactDisplayName?: string;
  status: "open" | "pending" | "waiting_customer" | "waiting_agent" | "resolved" | "archived";
  assignedUserId?: string;
  tags: string[];
  lastMessageAt: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ConversationRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  channel: DbOmnichannelConversationRecord["channel"];
  external_conversation_id: string;
  customer_id: string | null;
  contact_handle: string | null;
  contact_display_name: string | null;
  status: DbOmnichannelConversationRecord["status"];
  assigned_user_id: string | null;
  tags: unknown;
  last_message_at: string;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function assertNonEmpty(value: string | undefined, field: string) {
  if (!value) throw new Error(`missing_${field}`);
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapOmnichannelConversationRowToDomain(row: ConversationRow): DbOmnichannelConversationRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    channel: row.channel,
    externalConversationId: row.external_conversation_id,
    customerId: row.customer_id ?? undefined,
    contactHandle: row.contact_handle ?? undefined,
    contactDisplayName: row.contact_display_name ?? undefined,
    status: row.status,
    assignedUserId: row.assigned_user_id ?? undefined,
    tags: parseStringArray(row.tags),
    lastMessageAt: row.last_message_at,
    metadata: parseJsonObject(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function params(record: DbOmnichannelConversationRecord): unknown[] {
  assertNonEmpty(record.id, "id");
  assertNonEmpty(record.tenantId, "tenant_id");
  assertNonEmpty(record.channel, "channel");
  assertNonEmpty(record.externalConversationId, "external_conversation_id");
  assertNonEmpty(record.status, "status");
  assertNonEmpty(record.lastMessageAt, "last_message_at");

  return [
    record.id,
    record.tenantId,
    record.channel,
    record.externalConversationId,
    record.customerId ?? null,
    record.contactHandle ?? null,
    record.contactDisplayName ?? null,
    record.status,
    record.assignedUserId ?? null,
    JSON.stringify(record.tags ?? []),
    record.lastMessageAt,
    JSON.stringify(record.metadata ?? {}),
    record.createdAt,
    record.updatedAt
  ];
}

export class DatabaseOmnichannelConversationRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async save(record: DbOmnichannelConversationRecord): Promise<DbOmnichannelConversationRecord> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<ConversationRow>(
      `INSERT INTO omnichannel_conversations (
        id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::timestamptz,$12::jsonb,$13::timestamptz,$14::timestamptz
      )
      ON CONFLICT (id)
      DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        contact_handle = EXCLUDED.contact_handle,
        contact_display_name = EXCLUDED.contact_display_name,
        status = EXCLUDED.status,
        assigned_user_id = EXCLUDED.assigned_user_id,
        tags = EXCLUDED.tags,
        last_message_at = EXCLUDED.last_message_at,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at`,
      params(record)
    );
    if (!rows[0]) throw new Error("omnichannel_conversation_upsert_failed");
    return mapOmnichannelConversationRowToDomain(rows[0]);
  }

  async listByTenant(tenantId: string, filters?: { channel?: string; status?: string }): Promise<DbOmnichannelConversationRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    const conditions = ["tenant_id = $1"];
    const values: unknown[] = [tenantId];
    if (filters?.channel) {
      values.push(filters.channel);
      conditions.push(`channel = $${values.length}`);
    }
    if (filters?.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }

    const rows = await this.executor.query<ConversationRow>(
      `SELECT id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at
      FROM omnichannel_conversations
      WHERE ${conditions.join(" AND ")}
      ORDER BY updated_at DESC`,
      values
    );
    return rows.map(mapOmnichannelConversationRowToDomain);
  }

  async getById(tenantId: string, conversationId: string): Promise<DbOmnichannelConversationRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(conversationId, "conversation_id");
    const rows = await this.executor.query<ConversationRow>(
      `SELECT id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at
      FROM omnichannel_conversations
      WHERE tenant_id = $1 AND id = $2
      LIMIT 1`,
      [tenantId, conversationId]
    );
    return rows[0] ? mapOmnichannelConversationRowToDomain(rows[0]) : undefined;
  }

  async assign(tenantId: string, conversationId: string, assignedUserId: string): Promise<DbOmnichannelConversationRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(conversationId, "conversation_id");
    assertNonEmpty(assignedUserId, "assigned_user_id");

    const rows = await this.executor.query<ConversationRow>(
      `UPDATE omnichannel_conversations
      SET assigned_user_id = $3, updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2
      RETURNING id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at`,
      [tenantId, conversationId, assignedUserId]
    );

    return rows[0] ? mapOmnichannelConversationRowToDomain(rows[0]) : undefined;
  }

  async resolve(tenantId: string, conversationId: string): Promise<DbOmnichannelConversationRecord | undefined> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(conversationId, "conversation_id");

    const rows = await this.executor.query<ConversationRow>(
      `UPDATE omnichannel_conversations
      SET status = 'resolved', updated_at = NOW()
      WHERE tenant_id = $1 AND id = $2
      RETURNING id, tenant_id, channel, external_conversation_id, customer_id, contact_handle, contact_display_name,
        status, assigned_user_id, tags, last_message_at, metadata, created_at, updated_at`,
      [tenantId, conversationId]
    );

    return rows[0] ? mapOmnichannelConversationRowToDomain(rows[0]) : undefined;
  }
}

export function createDatabaseOmnichannelConversationRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseOmnichannelConversationRepository(options);
}
