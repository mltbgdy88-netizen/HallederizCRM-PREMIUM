import { buildWhatsAppSuggestedReply, resolveWhatsAppIntent, resolveWhatsAppRule } from "@hallederiz/domain";
import type { WhatsAppActionRequest, WhatsAppContact, WhatsAppConversation, WhatsAppMessage, WhatsAppTemplate } from "@hallederiz/types";
import { getCustomerById } from "../../customers/queries/customer-mock-data";

const tenantId = "tenant_1";

export const whatsappContacts: WhatsAppContact[] = [
  { id: "wa_contact_1", tenantId, displayName: "Aydin Dekor", phone: "+905321112233", type: "dealer", customerId: "customer_1", registered: true, active: true },
  { id: "wa_contact_2", tenantId, displayName: "Mira Yapi", phone: "+905334445566", type: "customer", customerId: "customer_2", registered: true, active: true },
  { id: "wa_contact_3", tenantId, displayName: "Mehmet Depo", phone: "+905551112233", type: "staff", userId: "user_warehouse", registered: true, active: true },
  { id: "wa_contact_4", tenantId, displayName: "Yonetici Kanal", phone: "+905559990000", type: "manager", userId: "user_manager", registered: true, active: true }
];

export const whatsappTemplates: WhatsAppTemplate[] = [
  { id: "wa_tpl_1", tenantId, code: "STOCK_REPLY", name: "Stok Bilgisi", type: "dealer_self_service", intent: "stok", body: "Urun stok bilgisini kontrol ettik. Merkez ve fabrika durumunu asagida paylasiyoruz.", active: true },
  { id: "wa_tpl_2", tenantId, code: "PAYMENT_FOLLOWUP", name: "Tahsilat Hatirlatma", type: "manager_approval", intent: "odeme", body: "Cari bakiyeniz icin odeme planinizi teyit edebilir misiniz?", active: true },
  { id: "wa_tpl_3", tenantId, code: "TASK_PICKING", name: "Depo Gorevi", type: "staff_task", intent: "siparis", body: "Depo toplama gorevi acildi. Raf ve lokasyon bilgisi sistemde hazir.", active: true }
];

const messagesByConversation: Record<string, WhatsAppMessage[]> = {
  wa_conv_1: [
    { id: "wa_msg_1", tenantId, conversationId: "wa_conv_1", direction: "inbound", type: "text", body: "SO-2481 siparisimiz ne durumda? Teslim fisini de alabilir miyiz?", sentAt: "2026-04-28T10:15:00.000Z", status: "received" },
    { id: "wa_msg_2", tenantId, conversationId: "wa_conv_1", direction: "outbound", type: "document", body: "Teslimat hazirlik bilgisi ve belge linki paylasildi.", attachmentTitle: "DOC-112 Teslim Fisi", sentAt: "2026-04-28T10:17:00.000Z", status: "delivered" }
  ],
  wa_conv_2: [
    { id: "wa_msg_3", tenantId, conversationId: "wa_conv_2", direction: "inbound", type: "text", body: "Ekstre ve son bakiye bilgisini iletir misiniz?", sentAt: "2026-04-28T09:50:00.000Z", status: "received" },
    { id: "wa_msg_4", tenantId, conversationId: "wa_conv_2", direction: "outbound", type: "template", body: "Finansal bilgi icin cari eslesmesi dogrulandi. Ekstre gonderimi onay bekliyor.", sentAt: "2026-04-28T09:54:00.000Z", status: "sent" }
  ],
  wa_conv_3: [
    { id: "wa_msg_5", tenantId, conversationId: "wa_conv_3", direction: "outbound", type: "template", body: "WO-114 toplama gorevi baslatildi. A1/A2 raflari kontrol edilecek.", sentAt: "2026-04-28T11:10:00.000Z", status: "delivered" },
    { id: "wa_msg_6", tenantId, conversationId: "wa_conv_3", direction: "inbound", type: "text", body: "Ilk satir hazir, ikinci satir icin fabrika teyidi bekliyorum.", sentAt: "2026-04-28T11:30:00.000Z", status: "received" }
  ]
};

export const whatsappActionRequests: WhatsAppActionRequest[] = [
  { id: "wa_action_1", tenantId, conversationId: "wa_conv_2", contactId: "wa_contact_2", intent: "ekstre", status: "pending", title: "Ekstre gonderimi onayi", payloadSummary: "Mira Yapi icin statement_pdf gonderimi", targetEntityType: "customer", targetEntityId: "customer_2", approvalId: "approval_1", createdAt: "2026-04-28T09:54:00.000Z" },
  { id: "wa_action_2", tenantId, conversationId: "wa_conv_3", contactId: "wa_contact_3", intent: "siparis", status: "confirmed", title: "Depo gorevi teyidi", payloadSummary: "WO-114 gorev mesajinin personel tarafindan teyidi", targetEntityType: "warehouse_order", targetEntityId: "warehouse_order_1", createdAt: "2026-04-28T11:12:00.000Z", confirmedAt: "2026-04-28T11:20:00.000Z" }
];

export function getWhatsAppConversations(): WhatsAppConversation[] {
  return [
    { id: "wa_conv_1", tenantId, contactId: "wa_contact_1", title: "Aydin Dekor - Siparis ve belge", lastMessagePreview: "Teslimat hazirlik bilgisi ve belge linki paylasildi.", intent: "siparis", unreadCount: 0, pendingActionCount: 0, relatedCustomerId: "customer_1", relatedOrderId: "order_1", relatedDocumentId: "document_1", updatedAt: "2026-04-28T10:17:00.000Z", ruleResolution: resolveWhatsAppRule({ intent: "siparis", contact: whatsappContacts[0], customer: getCustomerById("customer_1") }) },
    { id: "wa_conv_2", tenantId, contactId: "wa_contact_2", title: "Mira Yapi - Ekstre talebi", lastMessagePreview: "Ekstre gonderimi onay bekliyor.", intent: "ekstre", unreadCount: 2, pendingActionCount: 1, relatedCustomerId: "customer_2", relatedPaymentId: "payment_1", updatedAt: "2026-04-28T09:54:00.000Z", ruleResolution: resolveWhatsAppRule({ intent: "ekstre", contact: whatsappContacts[1], customer: getCustomerById("customer_2") }) },
    { id: "wa_conv_3", tenantId, contactId: "wa_contact_3", title: "Mehmet Depo - Gorev akisi", lastMessagePreview: "Ilk satir hazir, fabrika teyidi bekleniyor.", intent: "siparis", unreadCount: 1, pendingActionCount: 1, relatedOrderId: "order_1", updatedAt: "2026-04-28T11:30:00.000Z", ruleResolution: resolveWhatsAppRule({ intent: "siparis", contact: whatsappContacts[2] }) }
  ];
}

export function getWhatsAppConversationById(id?: string) {
  const conversations = getWhatsAppConversations();
  const conversation = conversations.find((item) => item.id === id) ?? conversations[0];
  const contact = whatsappContacts.find((item) => item.id === conversation?.contactId) ?? null;
  const messages = conversation ? messagesByConversation[conversation.id] ?? [] : [];
  const customer = conversation?.relatedCustomerId ? getCustomerById(conversation.relatedCustomerId) : null;
  const template = whatsappTemplates.find((item) => item.intent === conversation?.intent);
  const suggestedReply = conversation ? buildWhatsAppSuggestedReply(conversation.ruleResolution, template) : "";
  return { conversation, contact, messages, customer, suggestedReply, actionRequests: whatsappActionRequests.filter((item) => item.conversationId === conversation?.id), detectedIntent: resolveWhatsAppIntent(messages.at(-1)?.body ?? "") };
}

export function getWhatsAppTemplates() {
  return whatsappTemplates;
}
