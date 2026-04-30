import { applyWhatsAppTicketCommand, type WhatsAppTicketCommand, type WhatsAppTicketCommandApproverContext } from "@hallederiz/domain";
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

  async handleApprovalCommand(
    tenantId: TenantId,
    input: {
      referenceCode: string;
      command: WhatsAppTicketCommand;
      rawToken: string;
      fromPhone: string;
      now?: string;
      approverContext?: WhatsAppTicketCommandApproverContext;
    }
  ) {
    const store = await this.repository.loadStore(tenantId);
    const result = applyWhatsAppTicketCommand({ store, ...input });
    await this.repository.saveStore(tenantId, result.store);

    const outboundMessage = buildApprovalCommandOutboundMessage(result);
    return {
      auditId: result.auditId,
      command: result.command,
      ok: result.ok,
      outboundMessage,
      reason: result.reason,
      referenceCode: result.referenceCode,
      status: result.status,
      ticketId: result.ticketId
    };
  }

  clear(tenantId?: TenantId): void {
    this.repository.clear?.(tenantId);
  }
}

export const whatsAppWorkflowStoreService = new WhatsAppWorkflowStoreService();

function buildApprovalCommandOutboundMessage(result: {
  ok: boolean;
  command: WhatsAppTicketCommand;
  reason?: string;
  referenceCode: string;
}): string {
  if (result.ok && result.command === "approve") return `${result.referenceCode} icin onay alindi. Islem ic ekibin kontrolunde ilerleyecek.`;
  if (result.ok && result.command === "reject") return `${result.referenceCode} icin red kaydedildi. Islem otomatik calistirilmadi.`;
  if (result.ok && result.command === "review") return `${result.referenceCode} icin inceleme istegi kaydedildi. Ekibimiz talebi kontrol edecek.`;
  if (result.reason === "ticket_not_found") return "Komut dogrulanamadi. Referans kodu icin bekleyen bir onay bulunamadi.";
  if (result.reason === "ticket_expired") return "Komut dogrulanamadi. Onay suresi dolmus.";
  if (result.reason === "token_invalid") return "Komut dogrulanamadi. Guvenlik kodu hatali.";
  if (result.reason === "approver_not_allowed") return "Komut dogrulanamadi. Bu telefon numarasi bu onay icin yetkili degil.";
  if (result.reason === "ticket_already_resolved") return "Bu onay talebi daha once sonuclandirilmis.";
  return "Komut dogrulanamadi. Lutfen referans ve guvenlik kodunu kontrol edin.";
}
