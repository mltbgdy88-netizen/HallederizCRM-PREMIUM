import type { Customer, WhatsAppActionRequest, WhatsAppContact, WhatsAppIntent, WhatsAppRuleResolution, WhatsAppTemplate } from "@hallederiz/types";

export * from "./rule-resolver";
export * from "./workflow-store";

export function resolveWhatsAppIntent(text: string): WhatsAppIntent {
  const normalized = text.toLocaleLowerCase("tr-TR");
  if (normalized.includes("stok")) return "stok";
  if (normalized.includes("fiyat") || normalized.includes("liste")) return "fiyat";
  if (normalized.includes("ekstre") || normalized.includes("bakiye")) return "ekstre";
  if (normalized.includes("siparis") || normalized.includes("sipariş")) return "siparis";
  if (normalized.includes("odeme") || normalized.includes("ödeme") || normalized.includes("tahsilat")) return "odeme";
  if (normalized.includes("iade")) return "iade";
  if (normalized.includes("fatura")) return "fatura";
  if (normalized.includes("hata") || normalized.includes("defolu") || normalized.includes("urun sorun")) return "hatali_urun";
  return "diger";
}

export function validateWhatsAppRegisteredPhone(contact?: Pick<WhatsAppContact, "registered" | "active"> | null): boolean {
  return Boolean(contact?.registered && contact.active);
}

export function validateWhatsAppFinanceAccess(contact: Pick<WhatsAppContact, "registered" | "customerId">, customer?: Pick<Customer, "id"> | null): boolean {
  return Boolean(contact.registered && contact.customerId && customer?.id === contact.customerId);
}

export function resolveWhatsAppRule({ intent, contact, customer }: { intent: WhatsAppIntent; contact?: WhatsAppContact | null; customer?: Customer | null }): WhatsAppRuleResolution {
  if (intent === "stok") {
    return { intent, allowed: true, policyMode: "none", requiresRegisteredPhone: false, requiresCustomerLink: false, reason: "Stok intent'i self-service icin serbesttir." };
  }

  const registered = validateWhatsAppRegisteredPhone(contact);
  const financeIntent = intent === "fiyat" || intent === "ekstre";
  const linked = contact && customer ? validateWhatsAppFinanceAccess(contact, customer) : false;
  const mutationIntent = ["siparis", "odeme", "iade", "fatura", "hatali_urun"].includes(intent);

  if (financeIntent && !linked) {
    return { intent, allowed: false, policyMode: "confirmation_required", requiresRegisteredPhone: true, requiresCustomerLink: true, reason: "Fiyat/ekstre icin kayitli telefon ve bagli cari gerekir.", fallbackMessage: "Guvenlik nedeniyle cari eslesmesi dogrulanmadan finansal bilgi paylasilmaz." };
  }

  if (mutationIntent) {
    return { intent, allowed: registered, policyMode: "approval_required", requiresRegisteredPhone: true, requiresCustomerLink: true, reason: "Mutation etkili WhatsApp aksiyonu approval/confirmation zincirine baglanir." };
  }

  return { intent, allowed: registered, policyMode: registered ? "none" : "confirmation_required", requiresRegisteredPhone: true, requiresCustomerLink: false, reason: registered ? "Kural gecildi." : "Kayitli telefon dogrulamasi gerekli." };
}

export function buildWhatsAppSuggestedReply(resolution: WhatsAppRuleResolution, template?: WhatsAppTemplate): string {
  if (!resolution.allowed) return resolution.fallbackMessage ?? "Bu islem icin dogrulama gerekiyor. Ekibimiz sizi bilgilendirecek.";
  if (template) return template.body;
  if (resolution.intent === "stok") return "Stok bilgisini kontrol ediyorum. Urun kodunu paylasabilir misiniz?";
  if (resolution.policyMode === "approval_required") return "Talebinizi aldik. Islem baslatilmadan once ic onay surecine aktarilacak.";
  return "Talebinizi aldik, ilgili kayitlari kontrol edip size donus yapacagiz.";
}

export function buildWhatsAppOrderRequest(input: Omit<WhatsAppActionRequest, "id" | "status" | "intent" | "createdAt">): WhatsAppActionRequest {
  return { ...input, id: `wa_action_order_${input.targetEntityId}`, intent: "siparis", status: "pending", createdAt: new Date().toISOString() };
}

export function buildWhatsAppTaskRequest(input: Omit<WhatsAppActionRequest, "id" | "status" | "createdAt">): WhatsAppActionRequest {
  return { ...input, id: `wa_action_task_${input.targetEntityId}`, status: "pending", createdAt: new Date().toISOString() };
}

export function buildWhatsAppApprovalRequest(actionRequest: WhatsAppActionRequest, approvalId: string): WhatsAppActionRequest {
  return { ...actionRequest, approvalId, status: "pending" };
}
