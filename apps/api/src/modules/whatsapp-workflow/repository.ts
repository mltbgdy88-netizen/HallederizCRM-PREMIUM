import {
  addCommandAudit as addCommandAuditToStore,
  appendTicket as appendTicketToStore,
  createEmptyWhatsAppWorkflowStore,
  findMessageDuplicate,
  markProcessedMessage,
  normalizeTenantWhatsAppWorkflowStore,
  releaseProcessingMessage,
  reserveProcessingMessage,
  withStoreCleanup
} from "@hallederiz/domain";
import { createQueryExecutor, type QueryExecutor, type QueryResultRow } from "@hallederiz/database";
import type {
  TenantId,
  TenantWhatsAppWorkflowStore,
  WhatsAppWorkflowCommandAudit,
  WhatsAppWorkflowDuplicateReason,
  WhatsAppWorkflowPendingTicket
} from "@hallederiz/types";
import { buildPersistenceUnavailableError, getPersistencePolicy } from "../../shared/persistence-policy";

export type WhatsAppInboundWorkflowPayload = {
  id: string;
  from: string;
  contentHash: string;
  at: string;
};

export type WhatsAppWorkflowReserveResult =
  | { reserved: true; store: TenantWhatsAppWorkflowStore }
  | { reserved: false; reason: WhatsAppWorkflowDuplicateReason; store: TenantWhatsAppWorkflowStore };

export interface WhatsAppWorkflowRepository {
  loadStore(tenantId: TenantId): Promise<TenantWhatsAppWorkflowStore>;
  saveStore(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): Promise<void>;
  reserveInboundMessage(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<WhatsAppWorkflowReserveResult>;
  markProcessed(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<void>;
  releaseProcessing(tenantId: TenantId, payload: Pick<WhatsAppInboundWorkflowPayload, "id">): Promise<void>;
  appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): Promise<void>;
  addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): Promise<void>;
  clear?(tenantId?: TenantId): void;
}

type WorkflowStoreRow = QueryResultRow & {
  store_json?: unknown;
};

const memoryStores = new Map<string, TenantWhatsAppWorkflowStore>();

export class InMemoryWhatsAppWorkflowRepository implements WhatsAppWorkflowRepository {
  loadStore(tenantId: TenantId): Promise<TenantWhatsAppWorkflowStore> {
    const existing = memoryStores.get(tenantId) ?? createEmptyWhatsAppWorkflowStore();
    const cleaned = normalizeTenantWhatsAppWorkflowStore(existing);
    memoryStores.set(tenantId, cleaned);
    return Promise.resolve(cleaned);
  }

  async saveStore(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): Promise<void> {
    memoryStores.set(tenantId, normalizeTenantWhatsAppWorkflowStore(store));
  }

  async reserveInboundMessage(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<WhatsAppWorkflowReserveResult> {
    const store = await this.loadStore(tenantId);
    const duplicateReason = findMessageDuplicate(store, payload);
    if (duplicateReason) return { reserved: false, reason: duplicateReason, store };

    const reservedStore = reserveProcessingMessage(store, payload);
    await this.saveStore(tenantId, reservedStore);
    return { reserved: true, store: reservedStore };
  }

  async markProcessed(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<void> {
    const store = await this.loadStore(tenantId);
    await this.saveStore(tenantId, markProcessedMessage(store, payload));
  }

  async releaseProcessing(tenantId: TenantId, payload: Pick<WhatsAppInboundWorkflowPayload, "id">): Promise<void> {
    const store = await this.loadStore(tenantId);
    await this.saveStore(tenantId, releaseProcessingMessage(store, payload.id));
  }

  async appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): Promise<void> {
    const store = await this.loadStore(tenantId);
    await this.saveStore(tenantId, appendTicketToStore(store, ticket));
  }

  async addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): Promise<void> {
    const store = await this.loadStore(tenantId);
    await this.saveStore(tenantId, addCommandAuditToStore(store, audit));
  }

  clear(tenantId?: TenantId): void {
    if (tenantId) memoryStores.delete(tenantId);
    else memoryStores.clear();
  }
}

export class PostgresWhatsAppWorkflowRepository implements WhatsAppWorkflowRepository {
  constructor(private readonly executor: QueryExecutor) {}

  async loadStore(tenantId: TenantId): Promise<TenantWhatsAppWorkflowStore> {
    const rows = await this.executor.query<WorkflowStoreRow>("SELECT store_json FROM tenant_whatsapp_workflows WHERE tenant_id = $1", [tenantId]);
    return normalizeTenantWhatsAppWorkflowStore(rows[0]?.store_json);
  }

  async saveStore(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): Promise<void> {
    const normalized = normalizeTenantWhatsAppWorkflowStore(store);
    await this.executor.query(
      `
      INSERT INTO tenant_whatsapp_workflows (tenant_id, store_json, created_at, updated_at)
      VALUES ($1, $2::jsonb, NOW(), NOW())
      ON CONFLICT (tenant_id)
      DO UPDATE SET store_json = EXCLUDED.store_json, updated_at = NOW()
      `,
      [tenantId, JSON.stringify(normalized)]
    );
  }

  async reserveInboundMessage(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<WhatsAppWorkflowReserveResult> {
    return this.executor.transaction(async (tx) => {
      await tx.query(
        `
        INSERT INTO tenant_whatsapp_workflows (tenant_id, store_json, created_at, updated_at)
        VALUES ($1, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (tenant_id) DO NOTHING
        `,
        [tenantId]
      );
      const rows = await tx.query<WorkflowStoreRow>("SELECT store_json FROM tenant_whatsapp_workflows WHERE tenant_id = $1 FOR UPDATE", [tenantId]);
      const store = normalizeTenantWhatsAppWorkflowStore(rows[0]?.store_json);
      const duplicateReason = findMessageDuplicate(store, payload);
      if (duplicateReason) return { reserved: false, reason: duplicateReason, store };

      const reservedStore = reserveProcessingMessage(store, payload);
      await tx.query("UPDATE tenant_whatsapp_workflows SET store_json = $2::jsonb, updated_at = NOW() WHERE tenant_id = $1", [
        tenantId,
        JSON.stringify(reservedStore)
      ]);
      return { reserved: true, store: reservedStore };
    });
  }

  async markProcessed(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<void> {
    await this.updateStore(tenantId, (store) => markProcessedMessage(store, payload));
  }

  async releaseProcessing(tenantId: TenantId, payload: Pick<WhatsAppInboundWorkflowPayload, "id">): Promise<void> {
    await this.updateStore(tenantId, (store) => releaseProcessingMessage(store, payload.id));
  }

  async appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): Promise<void> {
    await this.updateStore(tenantId, (store) => appendTicketToStore(store, ticket));
  }

  async addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): Promise<void> {
    await this.updateStore(tenantId, (store) => addCommandAuditToStore(store, audit));
  }

  private async updateStore(tenantId: TenantId, update: (store: TenantWhatsAppWorkflowStore) => TenantWhatsAppWorkflowStore): Promise<void> {
    await this.executor.transaction(async (tx) => {
      await tx.query(
        `
        INSERT INTO tenant_whatsapp_workflows (tenant_id, store_json, created_at, updated_at)
        VALUES ($1, '{}'::jsonb, NOW(), NOW())
        ON CONFLICT (tenant_id) DO NOTHING
        `,
        [tenantId]
      );
      const rows = await tx.query<WorkflowStoreRow>("SELECT store_json FROM tenant_whatsapp_workflows WHERE tenant_id = $1 FOR UPDATE", [tenantId]);
      const nextStore = withStoreCleanup(update(normalizeTenantWhatsAppWorkflowStore(rows[0]?.store_json)));
      await tx.query("UPDATE tenant_whatsapp_workflows SET store_json = $2::jsonb, updated_at = NOW() WHERE tenant_id = $1", [
        tenantId,
        JSON.stringify(nextStore)
      ]);
    });
  }
}

export class PolicyAwareWhatsAppWorkflowRepository implements WhatsAppWorkflowRepository {
  constructor(
    private readonly primary: WhatsAppWorkflowRepository,
    private readonly fallback: WhatsAppWorkflowRepository,
    private readonly options: { dbEnabled: boolean; fallbackAllowed: boolean; persistenceMode: string; hasPostgresUrl: boolean }
  ) {}

  loadStore(tenantId: TenantId): Promise<TenantWhatsAppWorkflowStore> {
    return this.run(() => this.primary.loadStore(tenantId), () => this.fallback.loadStore(tenantId));
  }

  saveStore(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): Promise<void> {
    return this.run(() => this.primary.saveStore(tenantId, store), () => this.fallback.saveStore(tenantId, store));
  }

  reserveInboundMessage(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<WhatsAppWorkflowReserveResult> {
    return this.run(() => this.primary.reserveInboundMessage(tenantId, payload), () => this.fallback.reserveInboundMessage(tenantId, payload));
  }

  markProcessed(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<void> {
    return this.run(() => this.primary.markProcessed(tenantId, payload), () => this.fallback.markProcessed(tenantId, payload));
  }

  releaseProcessing(tenantId: TenantId, payload: Pick<WhatsAppInboundWorkflowPayload, "id">): Promise<void> {
    return this.run(() => this.primary.releaseProcessing(tenantId, payload), () => this.fallback.releaseProcessing(tenantId, payload));
  }

  appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): Promise<void> {
    return this.run(() => this.primary.appendTicket(tenantId, ticket), () => this.fallback.appendTicket(tenantId, ticket));
  }

  addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): Promise<void> {
    return this.run(() => this.primary.addCommandAudit(tenantId, audit), () => this.fallback.addCommandAudit(tenantId, audit));
  }

  clear(tenantId?: TenantId): void {
    this.fallback.clear?.(tenantId);
  }

  private async run<T>(operation: () => Promise<T>, fallbackOperation: () => Promise<T>): Promise<T> {
    if (!this.options.dbEnabled) return fallbackOperation();
    try {
      return await operation();
    } catch (error) {
      if (this.options.fallbackAllowed) return fallbackOperation();
      throw buildPersistenceUnavailableError(error, {
        hasPostgresUrl: this.options.hasPostgresUrl,
        persistenceMode: this.options.persistenceMode
      });
    }
  }
}

export function createWhatsAppWorkflowRepository(env: NodeJS.ProcessEnv = process.env): WhatsAppWorkflowRepository {
  const persistenceMode = env.PERSISTENCE_MODE === "postgres" ? "postgres" : "demo";
  const postgresUrl = env.POSTGRES_URL ?? env.DATABASE_URL;
  const policy = getPersistencePolicy(env);
  const fallback = new InMemoryWhatsAppWorkflowRepository();
  if (persistenceMode !== "postgres") return fallback;

  return new PolicyAwareWhatsAppWorkflowRepository(new PostgresWhatsAppWorkflowRepository(createQueryExecutor({ mode: "postgres", postgresUrl })), fallback, {
    dbEnabled: true,
    fallbackAllowed: policy.dbFallbackAllowed,
    hasPostgresUrl: Boolean(postgresUrl),
    persistenceMode
  });
}
