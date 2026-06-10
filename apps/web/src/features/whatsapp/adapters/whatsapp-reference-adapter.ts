import type { WhatsAppConversation } from "@hallederiz/types";
import { sdk } from "../../../lib/data-source";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import {
  WOP_CONVERSATIONS,
  WOP_DETAIL,
  WOP_FILTERS,
  WOP_KPIS,
  WOP_PAGE,
  WOP_PAGINATION,
  WOP_SUGGESTED_REPLIES,
  type WopConversation,
  type WopConversationStatus,
  type WopKpi
} from "../data/whatsapp-operasyon-mock";

export type WhatsAppReferenceSnapshot = {
  page: typeof WOP_PAGE;
  kpis: WopKpi[];
  filters: typeof WOP_FILTERS;
  conversations: WopConversation[];
  pagination: typeof WOP_PAGINATION;
  detail: typeof WOP_DETAIL;
  suggestedReplies: typeof WOP_SUGGESTED_REPLIES;
  demoBanner: string | null;
};

function mapConversationStatus(conv: WhatsAppConversation): WopConversationStatus {
  if (conv.pendingActionCount > 0) return "Onay Bekliyor";
  if (conv.unreadCount > 0) return "Beklemede";
  return "Aktif";
}

function mapConversation(conv: WhatsAppConversation, index: number): WopConversation {
  const customer = conv.relatedCustomerId ? getCustomerById(conv.relatedCustomerId) : null;
  const updated = new Date(conv.updatedAt);
  return {
    id: conv.id,
    code: conv.title.split(" ")[0] ?? `WAP-${index + 1}`,
    phone: customer?.phone ?? "—",
    customer: customer?.name ?? conv.title,
    lastMessage: conv.lastMessagePreview,
    lastTime: Number.isNaN(updated.getTime())
      ? "—"
      : updated.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    status: mapConversationStatus(conv),
    sla: conv.pendingActionCount > 0 ? `${conv.pendingActionCount} bekleyen` : "—",
    slaTone: conv.pendingActionCount > 0 ? "warn" : "ok",
    selected: index === 0
  };
}

function buildLiveSnapshot(conversations: WhatsAppConversation[]): WhatsAppReferenceSnapshot {
  const rows = conversations.map(mapConversation);
  const pending = rows.filter((r) => r.status === "Onay Bekliyor").length;

  return {
    page: WOP_PAGE,
    kpis: [
      { id: "pending", label: "Bekleyen Mesaj", value: String(rows.filter((r) => r.status === "Beklemede").length), trend: "—", trendTone: "neutral", tone: "green", icon: "chat" },
      { id: "sent", label: "Toplam Konuşma", value: String(rows.length), trend: "—", trendTone: "neutral", tone: "teal", icon: "send" },
      { id: "unread", label: "Okunmamış", value: String(conversations.reduce((s, c) => s + c.unreadCount, 0)), trend: "—", trendTone: "neutral", tone: "blue", icon: "mail" },
      { id: "approval", label: "Onay Bekleyen", value: String(pending), trend: "—", trendTone: "warn", tone: "orange", icon: "clock" },
      { id: "sla", label: "SLA Aşımı", value: "—", trend: "—", trendTone: "neutral", tone: "red", icon: "warn" },
      { id: "conversion", label: "Dönüşüm Oranı", value: "—", trend: "—", trendTone: "neutral", tone: "gold", icon: "percent" }
    ],
    filters: WOP_FILTERS,
    conversations: rows,
    pagination: {
      range: rows.length ? `1–${rows.length}` : "0",
      total: `${conversations.length} konuşma`,
      page: 1
    },
    detail: rows[0]
      ? {
          code: rows[0].code,
          status: rows[0].status,
          customer: rows[0].customer,
          phone: rows[0].phone,
          agentInitials: "—",
          agentName: "—",
          startedAt: formatTrDateTime(conversations[0]?.updatedAt),
          alert: rows[0].status === "Onay Bekliyor" ? "Bu konuşma için onay bekleyen mesajlar var." : "Canlı konuşma özeti.",
          alertCta: "Onayları Görüntüle",
          lastSummary: rows[0].lastMessage,
          lastSource: `Kaynak: WhatsApp • ${rows[0].lastTime}`,
          suggestedTitle: WOP_DETAIL.suggestedTitle,
          suggestedViewAll: WOP_DETAIL.suggestedViewAll,
          documentTitle: WOP_DETAIL.documentTitle,
          selectFile: WOP_DETAIL.selectFile,
          selectTemplate: WOP_DETAIL.selectTemplate
        }
      : WOP_DETAIL,
    suggestedReplies: WOP_SUGGESTED_REPLIES,
    demoBanner: null
  };
}

export function loadWhatsAppReferenceDemo(): WhatsAppReferenceSnapshot {
  return {
    page: WOP_PAGE,
    kpis: WOP_KPIS,
    filters: WOP_FILTERS,
    conversations: WOP_CONVERSATIONS,
    pagination: WOP_PAGINATION,
    detail: WOP_DETAIL,
    suggestedReplies: WOP_SUGGESTED_REPLIES,
    demoBanner: null
  };
}

export async function loadWhatsAppReferenceLive(): Promise<WhatsAppReferenceSnapshot> {
  const response = await sdk.whatsapp.listConversations();
  return buildLiveSnapshot(response.items ?? []);
}

export const WHATSAPP_REFERENCE_INITIAL = loadWhatsAppReferenceDemo();

