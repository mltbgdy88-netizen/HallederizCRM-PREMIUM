import type { OmnichannelConversation, OmnichannelMessage } from "@hallederiz/sdk";
import { sdk } from "../../../lib/data-source";
import { loadWhatsAppReferenceDemo, loadWhatsAppReferenceLive } from "../../whatsapp/adapters/whatsapp-reference-adapter";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import {
  GKOP_ACTIVE_CHAT,
  GKOP_COMPOSER,
  GKOP_CONVERSATIONS,
  GKOP_CUSTOMER,
  GKOP_MESSAGES,
  GKOP_ORDERS,
  GKOP_PAGE,
  GKOP_QUICK_ACTIONS,
  GKOP_SUMMARY,
  GKOP_TABS,
  type GkopChannelTab,
  type GkopChatMessage,
  type GkopConversation
} from "../data/gelen-kutu-operasyon-mock";

export type GelenKutuReferenceSnapshot = {
  page: typeof GKOP_PAGE;
  tabs: typeof GKOP_TABS;
  conversations: GkopConversation[];
  activeChat: typeof GKOP_ACTIVE_CHAT;
  messages: GkopChatMessage[];
  customer: typeof GKOP_CUSTOMER;
  orders: typeof GKOP_ORDERS;
  summary: typeof GKOP_SUMMARY;
  quickActions: typeof GKOP_QUICK_ACTIONS;
  composer: typeof GKOP_COMPOSER;
  demoBanner: string | null;
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (name.length >= 2) return name.slice(0, 2).toUpperCase();
  return name.slice(0, 1).toUpperCase() || "?";
}

function mapOmnichannelChannel(channel: string): GkopConversation["channel"] {
  if (channel === "email") return "mail";
  if (channel === "sms") return "sms";
  return "whatsapp";
}

function formatMessageTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

function mapOmnichannelConversation(conv: OmnichannelConversation, index: number): GkopConversation {
  const name = conv.contactDisplayName ?? conv.contactHandle ?? conv.id;
  return {
    id: conv.id,
    name,
    initials: initialsFrom(name),
    channel: mapOmnichannelChannel(conv.channel),
    preview: `${conv.status} • ${conv.channel}`,
    time: formatMessageTime(conv.lastMessageAt),
    unread: conv.status === "open" ? 1 : undefined,
    read: conv.status === "resolved",
    selected: index === 0
  };
}

function mapMessages(messages: OmnichannelMessage[]): GkopChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    direction: m.direction === "outbound" || m.authorType === "agent" ? "out" : "in",
    text: m.text,
    time: formatMessageTime(m.createdAt),
    read: m.status === "read" || m.status === "delivered"
  }));
}

function buildTabs(conversations: GkopConversation[]): typeof GKOP_TABS {
  const wa = conversations.filter((c) => c.channel === "whatsapp").length;
  const mail = conversations.filter((c) => c.channel === "mail").length;
  const sms = conversations.filter((c) => c.channel === "sms").length;
  return [
    { id: "all" as GkopChannelTab, label: "Tümü", count: conversations.length },
    { id: "whatsapp", label: "", count: wa, icon: "whatsapp" },
    { id: "mail", label: "", count: mail, icon: "mail" },
    { id: "sms", label: "", count: sms, icon: "sms" }
  ];
}

function buildSnapshot(
  conversations: GkopConversation[],
  messages: GkopChatMessage[],
  demoBanner: string | null,
  customerOverride?: Partial<typeof GKOP_CUSTOMER>
): GelenKutuReferenceSnapshot {
  const active = conversations[0];
  const name = active?.name ?? GKOP_ACTIVE_CHAT.name;
  const phone = customerOverride?.phone ?? GKOP_CUSTOMER.phone;

  return {
    page: {
      ...GKOP_PAGE,
      listFooter: `Toplam ${conversations.length} sohbet`
    },
    tabs: buildTabs(conversations),
    conversations,
    activeChat: {
      initials: active?.initials ?? GKOP_ACTIVE_CHAT.initials,
      name,
      phone,
      tag: GKOP_ACTIVE_CHAT.tag,
      dateLabel: GKOP_ACTIVE_CHAT.dateLabel
    },
    messages: messages.length ? messages : GKOP_MESSAGES,
    customer: {
      ...GKOP_CUSTOMER,
      ...customerOverride,
      initials: active?.initials ?? GKOP_CUSTOMER.initials,
      name
    },
    orders: GKOP_ORDERS,
    summary: GKOP_SUMMARY,
    quickActions: GKOP_QUICK_ACTIONS,
    composer: GKOP_COMPOSER,
    demoBanner
  };
}

function mapWhatsAppToGkop(waRows: ReturnType<typeof loadWhatsAppReferenceDemo>["conversations"]): GkopConversation[] {
  return waRows.map((row, index) => ({
    id: row.id,
    name: row.customer,
    initials: initialsFrom(row.customer),
    channel: "whatsapp" as const,
    preview: row.lastMessage,
    time: row.lastTime,
    unread: row.status === "Beklemede" ? 1 : undefined,
    read: row.status === "Aktif",
    selected: index === 0
  }));
}

export const GELEN_KUTU_REFERENCE_INITIAL = buildSnapshot(GKOP_CONVERSATIONS, GKOP_MESSAGES, null);

/** Canlı modda seçili sohbet için mesajları SDK üzerinden yükler. */
export async function fetchGelenKutuMessagesForConversation(conversationId: string): Promise<GkopChatMessage[]> {
  const msgRes = await sdk.omnichannel.listMessages(conversationId);
  return mapMessages(Array.isArray(msgRes.items) ? msgRes.items : []);
}

export function loadGelenKutuReferenceDemo(): GelenKutuReferenceSnapshot {
  const wa = loadWhatsAppReferenceDemo();
  const waConv = mapWhatsAppToGkop(wa.conversations);
  const mailSms = GKOP_CONVERSATIONS.filter((c) => c.channel !== "whatsapp");
  const merged = [...waConv, ...mailSms].map((c, i) => ({ ...c, selected: i === 0 }));
  return buildSnapshot(merged, GKOP_MESSAGES, null);
}

export async function loadGelenKutuReferenceLive(): Promise<GelenKutuReferenceSnapshot> {
  try {
    const [conversationsBody, waLive] = await Promise.all([
      sdk.omnichannel.listConversations(),
      loadWhatsAppReferenceLive()
    ]);

    const items = Array.isArray(conversationsBody?.items) ? conversationsBody.items : [];
    if (items.length > 0) {
      const conversations = items.map(mapOmnichannelConversation);
      let messages: GkopChatMessage[] = [];
      try {
        messages = await fetchGelenKutuMessagesForConversation(conversations[0]!.id);
      } catch {
        messages = [];
      }

      const first = conversations[0];
      const customer = first
        ? {
            name: first.name,
            phone: first.channel === "whatsapp" ? (first.name.startsWith("+") ? first.name : GKOP_CUSTOMER.phone) : GKOP_CUSTOMER.phone
          }
        : undefined;

      return buildSnapshot(conversations, messages, null, customer);
    }

    const waConv = mapWhatsAppToGkop(waLive.conversations);
    if (waConv.length) {
      return buildSnapshot(waConv, GKOP_MESSAGES, waLive.demoBanner ?? REFERENCE_DEMO_BANNER);
    }

    return buildSnapshot(GKOP_CONVERSATIONS, GKOP_MESSAGES, REFERENCE_DEMO_BANNER);
  } catch {
    const wa = await loadWhatsAppReferenceLive().catch(() => loadWhatsAppReferenceDemo());
    const waConv = mapWhatsAppToGkop(wa.conversations);
    const first = wa.conversations[0];
    return buildSnapshot(
      waConv.length ? waConv : GKOP_CONVERSATIONS,
      GKOP_MESSAGES,
      REFERENCE_DEMO_BANNER,
      first
        ? {
            name: first.customer,
            phone: first.phone !== "—" ? first.phone : GKOP_CUSTOMER.phone
          }
        : undefined
    );
  }
}

