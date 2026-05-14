import type { WhatsAppContact, WhatsAppConversation } from "@hallederiz/types";

const INTENT_LABEL: Record<WhatsAppConversation["intent"], string> = {
  stok: "Stok",
  fiyat: "Fiyat",
  ekstre: "Ekstre",
  siparis: "Sipariş",
  odeme: "Ödeme",
  iade: "İade",
  fatura: "Fatura",
  hatali_urun: "Ürün",
  diger: "Genel"
};

export type WaQueueLineMeta = {
  subtitle: string;
  intentLabel: string;
  statusLine: string;
  timeLabel: string;
  risk: "none" | "orta" | "kritik";
};

export function waConversationQueueLine(conversation: WhatsAppConversation): WaQueueLineMeta {
  const updated = new Date(conversation.updatedAt);
  const timeLabel = Number.isNaN(updated.getTime())
    ? "—"
    : updated.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const risk: WaQueueLineMeta["risk"] =
    conversation.pendingActionCount > 1 ? "kritik" : conversation.pendingActionCount > 0 ? "orta" : "none";
  return {
    subtitle: conversation.lastMessagePreview || "—",
    intentLabel: INTENT_LABEL[conversation.intent] ?? conversation.intent,
    statusLine: (conversation.ruleResolution?.reason ?? "—").slice(0, 56),
    timeLabel,
    risk
  };
}

export function waSyntheticContact(conversation: WhatsAppConversation): WhatsAppContact {
  return {
    id: conversation.contactId,
    tenantId: conversation.tenantId,
    displayName: conversation.title,
    phone: "—",
    type: "customer",
    customerId: conversation.relatedCustomerId,
    registered: Boolean(conversation.relatedCustomerId),
    active: true
  };
}
