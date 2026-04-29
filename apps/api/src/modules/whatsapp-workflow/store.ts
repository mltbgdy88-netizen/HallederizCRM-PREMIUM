import {
  addCommandAudit,
  appendTicket,
  createEmptyWhatsAppWorkflowStore,
  findMessageDuplicate,
  markProcessedMessage,
  releaseProcessingMessage,
  reserveProcessingMessage,
  withStoreCleanup
} from "@hallederiz/domain";
import type {
  TenantId,
  TenantWhatsAppWorkflowStore,
  WhatsAppWorkflowCommandAudit,
  WhatsAppWorkflowDuplicateReason,
  WhatsAppWorkflowPendingTicket
} from "@hallederiz/types";

type InboundMessagePayload = {
  id: string;
  from: string;
  contentHash: string;
  at: string;
};

type ReserveInboundResult =
  | { reserved: true; store: TenantWhatsAppWorkflowStore }
  | { reserved: false; reason: WhatsAppWorkflowDuplicateReason; store: TenantWhatsAppWorkflowStore };

const stores = new Map<string, TenantWhatsAppWorkflowStore>();

export class WhatsAppWorkflowStoreService {
  load(tenantId: TenantId): TenantWhatsAppWorkflowStore {
    const existing = stores.get(tenantId) ?? createEmptyWhatsAppWorkflowStore();
    const cleaned = withStoreCleanup(existing);
    stores.set(tenantId, cleaned);
    return cleaned;
  }

  save(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): void {
    stores.set(tenantId, withStoreCleanup(store));
  }

  reserveInboundMessage(tenantId: TenantId, payload: InboundMessagePayload): ReserveInboundResult {
    const store = this.load(tenantId);
    const duplicateReason = findMessageDuplicate(store, payload);
    if (duplicateReason) {
      return { reserved: false, reason: duplicateReason, store };
    }

    const reservedStore = reserveProcessingMessage(store, payload);
    this.save(tenantId, reservedStore);
    return { reserved: true, store: reservedStore };
  }

  markProcessed(tenantId: TenantId, payload: InboundMessagePayload): void {
    const store = this.load(tenantId);
    this.save(tenantId, markProcessedMessage(store, payload));
  }

  releaseProcessing(tenantId: TenantId, payload: Pick<InboundMessagePayload, "id">): void {
    const store = this.load(tenantId);
    this.save(tenantId, releaseProcessingMessage(store, payload.id));
  }

  appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): void {
    const store = this.load(tenantId);
    this.save(tenantId, appendTicket(store, ticket));
  }

  addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): void {
    const store = this.load(tenantId);
    this.save(tenantId, addCommandAudit(store, audit));
  }

  clear(tenantId?: TenantId): void {
    if (tenantId) stores.delete(tenantId);
    else stores.clear();
  }
}

export const whatsAppWorkflowStoreService = new WhatsAppWorkflowStoreService();
