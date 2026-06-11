import type { WhatsAppConversation } from "@hallederiz/types";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { WA_QUEUE_META } from "../queries/whatsapp-mock-data";
import type { WhatsAppPageDetail } from "./build-whatsapp-api-page-detail";
import { waConversationQueueLine, waSyntheticContact } from "./wa-conversation-helpers";

export type WopReferenceStatus = "Onay Bekliyor" | "Beklemede" | "Aktif" | "Tamamlandı" | "SLA Aşımı";
export type WopSlaTone = "warn" | "ok" | "danger";
export type WopKpiTone = "green" | "teal" | "blue" | "orange" | "red" | "gold";
export type WopKpiIcon = "chat" | "send" | "mail" | "clock" | "warn" | "percent";

export type WopReferenceKpi = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "up" | "warn" | "neutral" | "down";
  tone: WopKpiTone;
  icon: WopKpiIcon;
};

export type WopReferenceTableRow = {
  id: string;
  code: string;
  phone: string;
  customer: string;
  lastMessage: string;
  lastTime: string;
  status: WopReferenceStatus;
  sla: string;
  slaTone: WopSlaTone;
};

export type WopReferenceSuggestedReply = {
  id: string;
  text: string;
};

export type WopReferenceDetail = {
  code: string;
  status: WopReferenceStatus;
  customer: string;
  phone: string;
  agentInitials: string;
  agentName: string;
  startedAt: string;
  alert: string | null;
  alertCta: string;
  lastSummary: string;
  lastSource: string;
  suggestedReplies: WopReferenceSuggestedReply[];
};

function conversationCode(conversation: WhatsAppConversation): string {
  return conversation.id.replace("wa_op_", "WA-").toUpperCase();
}

export function deskStatusForConversation(conversation: WhatsAppConversation): {
  label: WopReferenceStatus;
  tone: "approval" | "pending" | "ok" | "sla";
} {
  if (conversation.pendingActionCount > 0) {
    return { label: "Onay Bekliyor", tone: "approval" };
  }
  if (conversation.unreadCount > 0) {
    return { label: "Beklemede", tone: "pending" };
  }
  const risk = WA_QUEUE_META[conversation.id]?.risk ?? waConversationQueueLine(conversation).risk;
  if (risk === "kritik") {
    return { label: "SLA Aşımı", tone: "sla" };
  }
  return { label: "Aktif", tone: "ok" };
}

export function slaLabelForConversation(conversation: WhatsAppConversation): { text: string; tone: WopSlaTone } {
  const metaRisk = WA_QUEUE_META[conversation.id]?.risk ?? waConversationQueueLine(conversation).risk;
  if (metaRisk === "kritik") return { text: "Aşıldı", tone: "danger" };
  if (metaRisk === "orta") return { text: "2s 14dk", tone: "warn" };
  return { text: "Normal", tone: "ok" };
}

export function mapConversationToTableRow(conversation: WhatsAppConversation): WopReferenceTableRow {
  const customer = conversation.relatedCustomerId ? getCustomerById(conversation.relatedCustomerId) : null;
  const meta = WA_QUEUE_META[conversation.id];
  const queueLine = waConversationQueueLine(conversation);
  const contact = waSyntheticContact(conversation);
  const status = deskStatusForConversation(conversation);
  const sla = slaLabelForConversation(conversation);

  return {
    id: conversation.id,
    code: conversationCode(conversation),
    phone: contact.phone !== "—" ? contact.phone : conversation.title,
    customer: customer?.name ?? conversation.title,
    lastMessage: conversation.lastMessagePreview || meta?.subtitle || queueLine.subtitle,
    lastTime: meta?.timeLabel ?? queueLine.timeLabel,
    status: status.label,
    sla: sla.text,
    slaTone: sla.tone
  };
}

const FALLBACK_REPLIES: WopReferenceSuggestedReply[] = [
  { id: "fb-1", text: "Stok durumunu kontrol edip 15 dk içinde dönüş yapacağım." },
  { id: "fb-2", text: "Teklif PDF taslağını onay sonrası paylaşacağım." },
  { id: "fb-3", text: "Tahsilat planı için finans ekibine iletiyorum." }
];

export function mapConversationToDetailPanel(
  conversation: WhatsAppConversation | null,
  detail: WhatsAppPageDetail
): WopReferenceDetail | null {
  if (!conversation) return null;

  const customer = conversation.relatedCustomerId
    ? getCustomerById(conversation.relatedCustomerId)
    : detail.customer;
  const contact = detail.contact ?? waSyntheticContact(conversation);
  const meta = WA_QUEUE_META[conversation.id];
  const queueLine = waConversationQueueLine(conversation);
  const status = deskStatusForConversation(conversation);
  const updated = new Date(conversation.updatedAt);
  const startedAt = Number.isNaN(updated.getTime())
    ? "—"
    : updated.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

  const suggestedReplies: WopReferenceSuggestedReply[] = [];
  if (detail.suggestedReply?.trim()) {
    suggestedReplies.push({ id: "primary", text: detail.suggestedReply.trim() });
  }
  for (const reply of FALLBACK_REPLIES) {
    if (suggestedReplies.length >= 3) break;
    if (!suggestedReplies.some((item) => item.text === reply.text)) {
      suggestedReplies.push(reply);
    }
  }

  return {
    code: conversationCode(conversation),
    status: status.label,
    customer: customer?.name ?? conversation.title,
    phone: contact.phone !== "—" ? contact.phone : "—",
    agentInitials: "EA",
    agentName: "Emre Aydın",
    startedAt,
    alert:
      conversation.pendingActionCount > 0
        ? `Bu konuşma için onay bekleyen ${conversation.pendingActionCount} mesaj var.`
        : null,
    alertCta: "Onayları Görüntüle",
    lastSummary: conversation.lastMessagePreview || meta?.subtitle || queueLine.subtitle || "Önizleme metni yok.",
    lastSource: `Kaynak: WhatsApp • ${meta?.timeLabel ?? queueLine.timeLabel}`,
    suggestedReplies
  };
}

export function mapConversationsToReferenceKpis(
  conversations: WhatsAppConversation[],
  useDemo: boolean
): WopReferenceKpi[] {
  const unreadTotal = conversations.reduce((sum, item) => sum + item.unreadCount, 0);
  const approvalTotal = conversations.reduce((sum, item) => sum + item.pendingActionCount, 0);
  const slaBreaches = conversations.filter((item) => {
    const risk = WA_QUEUE_META[item.id]?.risk ?? waConversationQueueLine(item).risk;
    return risk === "kritik";
  }).length;

  const pendingDisplay = unreadTotal || (useDemo ? 24 : 0);
  const sentDisplay = useDemo ? 128 : 0;
  const unreadDisplay = unreadTotal || (useDemo ? 4 : 0);
  const approvalDisplay = approvalTotal || (useDemo ? 7 : 0);
  const slaDisplay = slaBreaches || (useDemo ? 2 : 0);

  return [
    {
      id: "pending",
      label: "Bekleyen Mesaj",
      value: String(pendingDisplay),
      trend: useDemo ? "%12 ↑" : "—",
      trendTone: useDemo ? "up" : "neutral",
      tone: "green",
      icon: "chat"
    },
    {
      id: "sent",
      label: "Bugün Giden",
      value: String(sentDisplay),
      trend: useDemo ? "%8 ↑" : "—",
      trendTone: useDemo ? "up" : "neutral",
      tone: "teal",
      icon: "send"
    },
    {
      id: "unread",
      label: "Okunmamış",
      value: String(unreadDisplay),
      trend: useDemo ? "%5 ↑" : "—",
      trendTone: useDemo ? "up" : "neutral",
      tone: "blue",
      icon: "mail"
    },
    {
      id: "approval",
      label: "Onay Bekleyen",
      value: String(approvalDisplay),
      trend: useDemo ? "%3 ↑" : "—",
      trendTone: useDemo ? "warn" : "neutral",
      tone: "orange",
      icon: "clock"
    },
    {
      id: "sla",
      label: "SLA Aşımı",
      value: String(slaDisplay),
      trend: useDemo ? "+2" : "—",
      trendTone: useDemo ? "warn" : "neutral",
      tone: "red",
      icon: "warn"
    },
    {
      id: "conversion",
      label: "Dönüşüm Oranı",
      value: useDemo ? "24,6%" : "—",
      trend: useDemo ? "%4,2 ↑" : "—",
      trendTone: useDemo ? "up" : "neutral",
      tone: "gold",
      icon: "percent"
    }
  ];
}

export function statusBadgeClass(status: WopReferenceStatus): string {
  switch (status) {
    case "Onay Bekliyor":
      return "wop-badge wop-badge--approval";
    case "Beklemede":
      return "wop-badge wop-badge--hold";
    case "Aktif":
      return "wop-badge wop-badge--active";
    case "Tamamlandı":
      return "wop-badge wop-badge--done";
    default:
      return "wop-badge wop-badge--hold";
  }
}
