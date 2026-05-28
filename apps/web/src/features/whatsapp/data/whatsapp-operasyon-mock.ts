// @ts-nocheck
export type WopKpi = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "up" | "warn" | "neutral" | "down";
  tone: "green" | "teal" | "blue" | "orange" | "red" | "gold";
  icon: "chat" | "send" | "mail" | "clock" | "warn" | "percent";
};

export type WopConversationStatus = "Onay Bekliyor" | "Beklemede" | "Aktif" | "Tamamlandı";

export type WopConversation = {
  id: string;
  code: string;
  phone: string;
  customer: string;
  lastMessage: string;
  lastTime: string;
  status: WopConversationStatus;
  sla: string;
  slaTone: "warn" | "ok" | "danger";
  selected?: boolean;
};

export type WopSuggestedReply = {
  id: string;
  text: string;
};

export const WOP_PAGE = {
  title: "WhatsApp Operasyon Paneli",
  subtitle: "Kanal mesaj ve onay takibi",
  kpiCompareLabel: "Geçen güne göre"
};

export const WOP_KPIS: WopKpi[] = [
  { id: "pending", label: "Bekleyen Mesaj", value: "24", trend: "%12 ↑", trendTone: "up", tone: "green", icon: "chat" },
  { id: "sent", label: "Bugün Giden", value: "152", trend: "%8 ↑", trendTone: "up", tone: "teal", icon: "send" },
  { id: "unread", label: "Okunmamış", value: "37", trend: "%5 ↑", trendTone: "up", tone: "blue", icon: "mail" },
  { id: "approval", label: "Onay Bekleyen", value: "18", trend: "%3 ↑", trendTone: "warn", tone: "orange", icon: "clock" },
  { id: "sla", label: "SLA Aşımı", value: "6", trend: "+2", trendTone: "warn", tone: "red", icon: "warn" },
  { id: "conversion", label: "Dönüşüm Oranı", value: "24,6%", trend: "%4,2 ↑", trendTone: "up", tone: "gold", icon: "percent" }
];

export const WOP_FILTERS = {
  searchPlaceholder: "Konuşma, cari veya telefon ara…",
  status: "Tümü",
  channel: "WhatsApp",
  agent: "Tümü",
  date: "Son 7 Gün"
};

export const WOP_CONVERSATIONS: WopConversation[] = [
  {
    id: "1",
    code: "WAP-1587",
    phone: "905*******34",
    customer: "Demir Yapı A.Ş.",
    lastMessage: "Merhaba, teklifimiz hakkında bilgi alabilir miyim?",
    lastTime: "10:24",
    status: "Onay Bekliyor",
    sla: "2s 15dk",
    slaTone: "warn",
    selected: true
  },
  {
    id: "2",
    code: "WAP-1582",
    phone: "+90 533 210 44 11",
    customer: "Nova İnşaat Ltd.",
    lastMessage: "Sevkiyat tarihini netleştirebilir misiniz?",
    lastTime: "14:08",
    status: "Beklemede",
    sla: "28 dk",
    slaTone: "warn"
  },
  {
    id: "3",
    code: "WAP-1576",
    phone: "+90 542 880 12 03",
    customer: "Kuzey Mobilya",
    lastMessage: "Stok listesini WhatsApp üzerinden paylaştık.",
    lastTime: "13:54",
    status: "Aktif",
    sla: "1s 04dk",
    slaTone: "ok"
  },
  {
    id: "4",
    code: "WAP-1569",
    phone: "+90 536 991 77 45",
    customer: "Atlas Dekor",
    lastMessage: "Ödeme planı onaylandı, teşekkürler.",
    lastTime: "13:31",
    status: "Tamamlandı",
    sla: "Tamam",
    slaTone: "ok"
  },
  {
    id: "5",
    code: "WAP-1561",
    phone: "+90 505 332 19 88",
    customer: "Ege Yapı Market",
    lastMessage: "Şablon mesajı müşteriye iletildi.",
    lastTime: "12:47",
    status: "Aktif",
    sla: "45 dk",
    slaTone: "ok"
  },
  {
    id: "6",
    code: "WAP-1554",
    phone: "+90 531 774 02 16",
    customer: "Vadi Seramik",
    lastMessage: "İade süreci için onay bekleniyor.",
    lastTime: "12:15",
    status: "Onay Bekliyor",
    sla: "6 dk",
    slaTone: "danger"
  },
  {
    id: "7",
    code: "WAP-1548",
    phone: "+90 544 660 55 90",
    customer: "Merkez Toptan",
    lastMessage: "Fiyat revizyonu paylaşıldı.",
    lastTime: "11:58",
    status: "Beklemede",
    sla: "1s 22dk",
    slaTone: "warn"
  },
  {
    id: "8",
    code: "WAP-1541",
    phone: "+90 538 120 44 73",
    customer: "Park Yapı Malzeme",
    lastMessage: "Teslimat adresi güncellendi.",
    lastTime: "11:36",
    status: "Tamamlandı",
    sla: "Tamam",
    slaTone: "ok"
  }
];

export const WOP_PAGINATION = {
  range: "1–8",
  total: "120 konuşma",
  page: 1
};

export const WOP_DETAIL = {
  code: "WAP-1587",
  status: "Onay Bekliyor" as WopConversationStatus,
  customer: "Demir Yapı A.Ş.",
  phone: "905*******34",
  agentInitials: "EA",
  agentName: "Emre Aydın",
  startedAt: "22.05.2025 09:12",
  alert: "Bu konuşma için onay bekleyen 2 mesaj var.",
  alertCta: "Onayları Görüntüle",
  lastSummary:
    "Cari, sunulan teklif hakkında detaylı bilgi talep etti. Fiyat ve teslimat süresi konusunda netleme bekliyor.",
  lastSource: "Kaynak: WhatsApp • 22.05.2025 10:24",
  suggestedTitle: "Önerilen Yanıtlar",
  suggestedViewAll: "Tümünü Görüntüle",
  documentTitle: "Belge Gönder",
  selectFile: "Dosya Seç",
  selectTemplate: "Şablondan Seç"
};

export const WOP_SUGGESTED_REPLIES: WopSuggestedReply[] = [
  { id: "1", text: "Teklif detaylarını içeren dosyayı iletiyorum." },
  { id: "2", text: "Teslimat süresi ortalama 7-10 iş günüdür." },
  { id: "3", text: "Size nasıl yardımcı olabilirim?" }
];
