import type { TenantId, TenantWhatsAppWorkflowStore, WhatsAppWorkflowCommandAudit, WhatsAppWorkflowPendingTicket } from "@hallederiz/types";
import {
  createWhatsAppWorkflowRepository,
  type WhatsAppInboundWorkflowPayload,
  type WhatsAppWorkflowRepository,
  type WhatsAppWorkflowReserveResult
} from "./repository";

export class WhatsAppWorkflowStoreService {
  constructor(private readonly repository: WhatsAppWorkflowRepository = createWhatsAppWorkflowRepository()) {}

  load(tenantId: TenantId): Promise<TenantWhatsAppWorkflowStore> {
    return this.repository.loadStore(tenantId);
  }

  save(tenantId: TenantId, store: TenantWhatsAppWorkflowStore): Promise<void> {
    return this.repository.saveStore(tenantId, store);
  }

  reserveInboundMessage(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<WhatsAppWorkflowReserveResult> {
    return this.repository.reserveInboundMessage(tenantId, payload);
  }

  markProcessed(tenantId: TenantId, payload: WhatsAppInboundWorkflowPayload): Promise<void> {
    return this.repository.markProcessed(tenantId, payload);
  }

  releaseProcessing(tenantId: TenantId, payload: Pick<WhatsAppInboundWorkflowPayload, "id">): Promise<void> {
    return this.repository.releaseProcessing(tenantId, payload);
  }

  appendTicket(tenantId: TenantId, ticket: WhatsAppWorkflowPendingTicket): Promise<void> {
    return this.repository.appendTicket(tenantId, ticket);
  }

  addCommandAudit(tenantId: TenantId, audit: WhatsAppWorkflowCommandAudit): Promise<void> {
    return this.repository.addCommandAudit(tenantId, audit);
  }

  clear(tenantId?: TenantId): void {
    this.repository.clear?.(tenantId);
  }
}

export const whatsAppWorkflowStoreService = new WhatsAppWorkflowStoreService();
