import { buildWhatsAppSuggestedReply, resolveWhatsAppIntent, resolveWhatsAppRule } from "@hallederiz/domain";
import type {
  WhatsAppActionRequest,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate
} from "@hallederiz/types";
import { getCustomerById } from "../../customers/queries/customer-mock-data";

const tenantId = "tenant_1";

/** Kuyruk kartlarında gösterilen ek alanlar (filtre için risk bilgisi). */
export const WA_QUEUE_META: Record<
  string,
  { intentLabel: string; statusLine: string; timeLabel: string; risk: "none" | "orta" | "kritik"; subtitle: string }
> = {
  wa_op_delta: {
    subtitle: "Sipariş ve stok sorusu",
    intentLabel: "Sipariş",
    statusLine: "Cari eşleşti",
    timeLabel: "10:42",
    risk: "orta"
  },
  wa_op_nova: {
    subtitle: "Tahsilat planı talebi",
    intentLabel: "Tahsilat",
    statusLine: "Risk: Orta",
    timeLabel: "10:31",
    risk: "orta"
  },
  wa_op_liman: {
    subtitle: "Teklif PDF istiyor",
    intentLabel: "Belge",
    statusLine: "Onay bekliyor",
    timeLabel: "09:58",
    risk: "none"
  },
  wa_op_ghi: {
    subtitle: "İade talebi açılacak",
    intentLabel: "İade",
    statusLine: "Kritik",
    timeLabel: "09:22",
    risk: "kritik"
  },
  wa_op_kuzey: {
    subtitle: "Depo teslim durumu",
    intentLabel: "Teslimat",
    statusLine: "Cari eşleşti",
    timeLabel: "08:47",
    risk: "none"
  },
  wa_op_abc: {
    subtitle: "Fiyat revizyonu",
    intentLabel: "Fiyat",
    statusLine: "Onay gerekli",
    timeLabel: "Dün",
    risk: "none"
  }
};

export type WaRichBlock =
  | { kind: "msg"; id: string; dir: "in" | "out"; body: string; badges?: string[] }
  | { kind: "ai"; id: string; title: string; body: string; badge: string }
  | { kind: "quote"; id: string; title: string; sub: string; status: string; actionLabel: string };

const DELTA_THREAD: WaRichBlock[] = [
  {
    kind: "msg",
    id: "b1",
    dir: "in",
    body: "Merhaba, URN-001 ve URN-056 stokta var mı?\nMümkünse bugün teklif de rica ederiz.",
    badges: ["Sipariş", "Fiyat"]
  },
  {
    kind: "msg",
    id: "b2",
    dir: "out",
    body: "Merhaba, kontrol ediyorum. Stok ve fiyat bilgisini teyit edip size dönüyorum."
  },
  {
    kind: "ai",
    id: "b3",
    title: "AI önerisi",
    body: "Stok kontrolü ve fiyat teklifi için işlem taslağı hazırlanabilir. Canlı gönderim onay gerektirir.",
    badge: "Onay gerekli"
  },
  {
    kind: "msg",
    id: "b4",
    dir: "in",
    body: "Stok uygunsa 12 adet URN-001, 30 adet URN-056 için sipariş taslağı oluşturabilirsiniz.",
    badges: ["Sipariş taslağı"]
  },
  {
    kind: "quote",
    id: "b5",
    title: "Teklif taslağı hazırlandı",
    sub: "TF-2026-0189 • 2 ürün • ₺18.420",
    status: "Gönderim için onay bekliyor.",
    actionLabel: "Onaya gönder"
  }
];

export function getWhatsAppThreadBlocks(conversationId: string): WaRichBlock[] | undefined {
  if (conversationId === "wa_op_delta") {
    return DELTA_THREAD;
  }
  return undefined;
}

export const whatsappContacts: WhatsAppContact[] = [
  {
    id: "wa_c_delta",
    tenantId,
    displayName: "Delta A.Ş.",
    phone: "+90 312 555 01 48",
    type: "dealer",
    customerId: "customer_1",
    registered: true,
    active: true
  },
  {
    id: "wa_c_nova",
    tenantId,
    displayName: "Nova Gıda",
    phone: "+90 216 444 22 11",
    type: "customer",
    customerId: "customer_2",
    registered: true,
    active: true
  },
  {
    id: "wa_c_liman",
    tenantId,
    displayName: "Liman Gıda",
    phone: "+90 232 333 90 77",
    type: "dealer",
    registered: true,
    active: true
  },
  {
    id: "wa_c_ghi",
    tenantId,
    displayName: "GHI Mobilya",
    phone: "+90 224 222 18 90",
    type: "customer",
    registered: true,
    active: true
  },
  {
    id: "wa_c_kuzey",
    tenantId,
    displayName: "Kuzey Lojistik",
    phone: "+90 362 111 45 60",
    type: "dealer",
    customerId: "customer_1",
    registered: true,
    active: true
  },
  {
    id: "wa_c_abc",
    tenantId,
    displayName: "ABC Ltd.",
    phone: "+90 312 900 12 34",
    type: "customer",
    registered: true,
    active: true
  }
];

export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: "wa_tpl_1",
    tenantId,
    code: "STOCK_REPLY",
    name: "Stok Bilgisi",
    type: "dealer_self_service",
    intent: "stok",
    body: "Ürün stok bilgisini kontrol ettik. Merkez ve fabrika durumunu aşağıda paylaşıyoruz.",
    active: true
  },
  {
    id: "wa_tpl_2",
    tenantId,
    code: "PAYMENT_FOLLOWUP",
    name: "Tahsilat Hatırlatma",
    type: "manager_approval",
    intent: "odeme",
    body: "Cari bakiyeniz için ödeme planınızı teyit edebilir misiniz?",
    active: true
  },
  {
    id: "wa_tpl_3",
    tenantId,
    code: "TASK_PICKING",
    name: "Depo Görevi",
    type: "staff_task",
    intent: "siparis",
    body: "Depo toplama görevi açıldı. Raf ve lokasyon bilgisi sistemde hazır.",
    active: true
  }
];

const messagesByConversation: Record<string, WhatsAppMessage[]> = {
  wa_op_delta: [],
  wa_op_nova: [
    {
      id: "wa_m_n1",
      tenantId,
      conversationId: "wa_op_nova",
      direction: "inbound",
      type: "text",
      body: "Tahsilat planı için görüşme talep ediyoruz.",
      sentAt: "2026-05-02T07:31:00.000Z",
      status: "received"
    }
  ],
  wa_op_liman: [
    {
      id: "wa_m_l1",
      tenantId,
      conversationId: "wa_op_liman",
      direction: "inbound",
      type: "text",
      body: "Teklif PDF paylaşabilir misiniz?",
      sentAt: "2026-05-02T06:58:00.000Z",
      status: "received"
    }
  ],
  wa_op_ghi: [
    {
      id: "wa_m_g1",
      tenantId,
      conversationId: "wa_op_ghi",
      direction: "inbound",
      type: "text",
      body: "İade sürecini başlatmak istiyoruz.",
      sentAt: "2026-05-02T06:22:00.000Z",
      status: "received"
    }
  ],
  wa_op_kuzey: [
    {
      id: "wa_m_k1",
      tenantId,
      conversationId: "wa_op_kuzey",
      direction: "inbound",
      type: "text",
      body: "Depo teslimi için durum bilgisi rica ederiz.",
      sentAt: "2026-05-02T05:47:00.000Z",
      status: "received"
    }
  ],
  wa_op_abc: [
    {
      id: "wa_m_a1",
      tenantId,
      conversationId: "wa_op_abc",
      direction: "inbound",
      type: "text",
      body: "Liste dışı fiyat revizyonu talebimiz var.",
      sentAt: "2026-05-01T15:00:00.000Z",
      status: "received"
    }
  ]
};

export const whatsappActionRequests: WhatsAppActionRequest[] = [
  {
    id: "wa_act_1",
    tenantId,
    conversationId: "wa_op_delta",
    contactId: "wa_c_delta",
    intent: "siparis",
    status: "pending",
    title: "Sipariş taslağı hazırlandı",
    payloadSummary: "URN-001 / URN-056 satırları",
    targetEntityType: "order",
    targetEntityId: "order_draft_1",
    createdAt: "2026-05-02T07:50:00.000Z"
  },
  {
    id: "wa_act_2",
    tenantId,
    conversationId: "wa_op_delta",
    contactId: "wa_c_delta",
    intent: "fiyat",
    status: "pending",
    title: "Teklif gönderimi onay bekliyor",
    payloadSummary: "TF-2026-0189",
    targetEntityType: "document",
    targetEntityId: "doc_tf_0189",
    createdAt: "2026-05-02T07:55:00.000Z"
  },
  {
    id: "wa_act_3",
    tenantId,
    conversationId: "wa_op_nova",
    contactId: "wa_c_nova",
    intent: "odeme",
    status: "pending",
    title: "Tahsilat riski işaretlendi",
    payloadSummary: "Vadesi yakın bakiye",
    targetEntityType: "customer",
    targetEntityId: "customer_2",
    createdAt: "2026-05-02T07:31:00.000Z"
  }
];

function conv(
  id: string,
  contactId: string,
  intent: WhatsAppConversation["intent"],
  relatedCustomerId: string | undefined,
  extras: Partial<WhatsAppConversation>
): WhatsAppConversation {
  const contact = whatsappContacts.find((c) => c.id === contactId)!;
  const customer = relatedCustomerId ? getCustomerById(relatedCustomerId) : null;
  return {
    id,
    tenantId,
    contactId,
    title: customer?.name ?? contact.displayName,
    lastMessagePreview: WA_QUEUE_META[id]?.subtitle ?? "",
    intent,
    unreadCount: 0,
    pendingActionCount: 0,
    updatedAt: "2026-05-02T08:00:00.000Z",
    ruleResolution: resolveWhatsAppRule({ intent, contact, customer: customer ?? null }),
    relatedCustomerId,
    ...extras
  };
}

export function getWhatsAppConversations(): WhatsAppConversation[] {
  return [
    conv("wa_op_delta", "wa_c_delta", "siparis", "customer_1", {
      unreadCount: 0,
      pendingActionCount: 2,
      relatedOrderId: "order_1",
      updatedAt: "2026-05-02T07:42:00.000Z"
    }),
    conv("wa_op_nova", "wa_c_nova", "odeme", "customer_2", {
      unreadCount: 1,
      pendingActionCount: 1,
      updatedAt: "2026-05-02T07:31:00.000Z"
    }),
    conv("wa_op_liman", "wa_c_liman", "fatura", undefined, {
      unreadCount: 0,
      pendingActionCount: 1,
      updatedAt: "2026-05-02T06:58:00.000Z"
    }),
    conv("wa_op_ghi", "wa_c_ghi", "iade", undefined, {
      unreadCount: 2,
      pendingActionCount: 0,
      updatedAt: "2026-05-02T06:22:00.000Z"
    }),
    conv("wa_op_kuzey", "wa_c_kuzey", "siparis", "customer_1", {
      unreadCount: 0,
      pendingActionCount: 0,
      updatedAt: "2026-05-02T05:47:00.000Z"
    }),
    conv("wa_op_abc", "wa_c_abc", "fiyat", undefined, {
      unreadCount: 1,
      pendingActionCount: 1,
      updatedAt: "2026-05-01T15:00:00.000Z"
    })
  ];
}

export function getWhatsAppConversationById(id?: string) {
  const conversations = getWhatsAppConversations();
  const conversation = conversations.find((item) => item.id === id) ?? conversations[0];
  const contact = whatsappContacts.find((item) => item.id === conversation?.contactId) ?? null;
  const messages = conversation ? messagesByConversation[conversation.id] ?? [] : [];
  const richBlocks = conversation ? getWhatsAppThreadBlocks(conversation.id) : undefined;
  const customer = conversation?.relatedCustomerId ? getCustomerById(conversation.relatedCustomerId) : null;
  const template = whatsappTemplates.find((item) => item.intent === conversation?.intent);
  const suggestedReply = conversation ? buildWhatsAppSuggestedReply(conversation.ruleResolution, template) : "";
  const lastBody = messages.at(-1)?.body ?? "";
  return {
    conversation,
    contact,
    messages,
    richBlocks: richBlocks?.length ? richBlocks : undefined,
    customer,
    suggestedReply,
    actionRequests: whatsappActionRequests.filter((item) => item.conversationId === conversation?.id),
    detectedIntent: resolveWhatsAppIntent(lastBody)
  };
}

export function getWhatsAppTemplates() {
  return whatsappTemplates;
}
