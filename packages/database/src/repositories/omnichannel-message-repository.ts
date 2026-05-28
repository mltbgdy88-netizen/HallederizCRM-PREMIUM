import type { QueryExecutor, QueryResultRow } from "../types";

export interface DbOmnichannelMessageRecord {
  id: string;
  tenantId: string;
  conversationId: string;
  channel: "whatsapp" | "instagram" | "facebook" | "web_chat" | "email" | "sms" | "internal_note";
  externalMessageId?: string;
  direction: "inbound" | "outbound" | "internal";
  authorType: "customer" | "agent" | "ai" | "system";
  authorId?: string;
  text: string;
  attachments: Array<Record<string, unknown>>;
  status: "pending" | "sent" | "received" | "failed";
  policyDecision?: "allow" | "deny" | "require_approval" | "dry_run_only";
  approvalRequestId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface MessageRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  conversation_id: string;
  channel: DbOmnichannelMessageRecord["channel"];
  external_message_id: string | null;
  direction: DbOmnichannelMessageRecord["direction"];
  author_type: DbOmnichannelMessageRecord["authorType"];
  author_id: string | null;
  text: string;
  attachments: unknown;
  status: DbOmnichannelMessageRecord["status"];
  policy_decision: DbOmnichannelMessageRecord["policyDecision"] | null;
  approval_request_id: string | null;
  metadata: unknown;
  created_at: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function assertNonEmpty(value: string | undefined, field: string) {
  if (!value) throw new Error(`missing_${field}`);
}

function parseObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseArray(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)));
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapOmnichannelMessageRowToDomain(row: MessageRow): DbOmnichannelMessageRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    conversationId: row.conversation_id,
    channel: row.channel,
    externalMessageId: row.external_message_id ?? undefined,
    direction: row.direction,
    authorType: row.author_type,
    authorId: row.author_id ?? undefined,
    text: row.text,
    attachments: parseArray(row.attachments),
    status: row.status,
    policyDecision: row.policy_decision ?? undefined,
    approvalRequestId: row.approval_request_id ?? undefined,
    metadata: parseObject(row.metadata),
    createdAt: row.created_at
  };
}

export class DatabaseOmnichannelMessageRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") throw new Error("db_repository_postgres_mode_required");
  }

  async append(record: DbOmnichannelMessageRecord): Promise<DbOmnichannelMessageRecord> {
    this.assertPersistenceSupported();
    assertNonEmpty(record.id, "id");
    assertNonEmpty(record.tenantId, "tenant_id");
    assertNonEmpty(record.conversationId, "conversation_id");
    assertNonEmpty(record.channel, "channel");
    assertNonEmpty(record.direction, "direction");
    assertNonEmpty(record.authorType, "author_type");
    assertNonEmpty(record.text, "text");

    const rows = await this.executor.query<MessageRow>(
      `INSERT INTO omnichannel_messages (
        id, tenant_id, conversation_id, channel, external_message_id, direction, author_type, author_id,
        text, attachments, status, policy_decision, approval_request_id, metadata, created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14::jsonb,$15::timestamptz
      )
      ON CONFLICT (id)
      DO UPDATE SET
        external_message_id = EXCLUDED.external_message_id,
        text = EXCLUDED.text,
        attachments = EXCLUDED.attachments,
        status = EXCLUDED.status,
        policy_decision = EXCLUDED.policy_decision,
        approval_request_id = EXCLUDED.approval_request_id,
        metadata = EXCLUDED.metadata
      RETURNING id, tenant_id, conversation_id, channel, external_message_id, direction, author_type, author_id,
        text, attachments, status, policy_decision, approval_request_id, metadata, created_at`,
      [
        record.id,
        record.tenantId,
        record.conversationId,
        record.channel,
        record.externalMessageId ?? null,
        record.direction,
        record.authorType,
        record.authorId ?? null,
        record.text,
        JSON.stringify(record.attachments ?? []),
        record.status,
        record.policyDecision ?? null,
        record.approvalRequestId ?? null,
        JSON.stringify(record.metadata ?? {}),
        record.createdAt
      ]
    );

    if (!rows[0]) throw new Error("omnichannel_message_upsert_failed");
    return mapOmnichannelMessageRowToDomain(rows[0]);
  }

  async listByConversation(tenantId: string, conversationId: string): Promise<DbOmnichannelMessageRecord[]> {
    this.assertPersistenceSupported();
    assertNonEmpty(tenantId, "tenant_id");
    assertNonEmpty(conversationId, "conversation_id");

    const rows = await this.executor.query<MessageRow>(
      `SELECT id, tenant_id, conversation_id, channel, external_message_id, direction, author_type, author_id,
        text, attachments, status, policy_decision, approval_request_id, metadata, created_at
      FROM omnichannel_messages
      WHERE tenant_id = $1 AND conversation_id = $2
      ORDER BY created_at ASC`,
      [tenantId, conversationId]
    );

    return rows.map(mapOmnichannelMessageRowToDomain);
  }
}

export function createDatabaseOmnichannelMessageRepository(options: DatabaseRepositoryOptions) {
  return new DatabaseOmnichannelMessageRepository(options);
}
