import type { WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import {
  createWhatsAppActionRequest,
  getWhatsAppConversation,
  listWhatsAppConversations,
  listWhatsAppTemplates,
  receiveWhatsAppInbound,
  sendWhatsAppOutbound,
  updateWhatsAppActionRequest
} from "../../../integrations/mock-store";

function requiresStrictPolicy(message: Partial<WhatsAppMessage>): boolean {
  const text = `${message.body ?? ""}`.toLocaleLowerCase("tr-TR");
  return /fiyat|ekstre|odeme|fatura|iade/.test(text);
}

export class WhatsAppAdapter {
  constructor(private readonly context: RequestContext) {}

  listConversations() {
    return listWhatsAppConversations().filter((item) => item.tenantId === this.context.tenantId);
  }

  getConversation(id: string) {
    const payload = getWhatsAppConversation(id);
    if (payload.conversation?.tenantId !== this.context.tenantId) {
      return { conversation: undefined, messages: [] };
    }
    return payload;
  }

  inbound(message: Partial<WhatsAppMessage>) {
    const next = receiveWhatsAppInbound(message);
    if (requiresStrictPolicy(message)) {
      next.status = "queued";
    }
    return next;
  }

  outbound(message: Partial<WhatsAppMessage>) {
    const next = sendWhatsAppOutbound(message);
    if (requiresStrictPolicy(message)) {
      next.status = "queued";
    }
    return next;
  }

  createActionRequest(payload: Partial<WhatsAppActionRequest>) {
    return createWhatsAppActionRequest({
      ...payload,
      status: "pending",
      createdAt: new Date().toISOString()
    });
  }

  confirmActionRequest(id: string) {
    return updateWhatsAppActionRequest(id, "confirmed");
  }

  rejectActionRequest(id: string) {
    return updateWhatsAppActionRequest(id, "rejected");
  }

  listTemplates() {
    return listWhatsAppTemplates().filter((item) => item.tenantId === this.context.tenantId);
  }
}
