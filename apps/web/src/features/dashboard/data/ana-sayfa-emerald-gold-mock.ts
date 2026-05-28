// @ts-nocheck
export type AlertCard = {
  id: string;
  title: string;
  value: string;
  sub: string;
  tone: "danger" | "gold" | "green" | "teal";
};

export type TaskRow = {
  id: string;
  time: string;
  text: string;
  meta?: string;
  status: "Tamamlanacak" | "Devam Ediyor" | "Bekliyor";
};

export type FlowStat = {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  icon: "cart" | "truck" | "wallet" | "return" | "offer";
};

export type RecentRow = {
  id: string;
  date: string;
  type: string;
  record: string;
  customer: string;
  amount: string;
  status: string;
  statusTone: "success" | "ready" | "pending" | "done" | "review";
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export const EG_NAV: NavItem[] = [
  { id: "home", label: "Ana Sayfa", href: "/ana-sayfa", active: true },
  { id: "quick", label: "Hızlı İşlem", href: "#" },
  { id: "approvals", label: "Onaylar", href: "#" },
  { id: "orders", label: "Siparişler", href: "#" },
  { id: "payments", label: "Tahsilatlar", href: "/tahsilatlar" },
  { id: "offers", label: "Teklifler", href: "#" },
  { id: "customers", label: "Cariler", href: "#" },
  { id: "stock", label: "Stok & Depo", href: "#" },
  { id: "production", label: "Üretim", href: "#" },
  { id: "tasks", label: "Görevler", href: "#" },
  { id: "whatsapp", label: "WhatsApp", href: "#" },
  { id: "reports", label: "Raporlar", href: "#" },
  { id: "settings", label: "Ayarlar", href: "#" }
];

export const EG_USER = {
  name: "Mevlüt",
  role: "Yönetici",
  display: "Mevlüt (Yönetici)"
};

export const EG_ALERTS: AlertCard[] = [
  {
    id: "overdue",
    title: "Vadesi Geçen Tahsilatlar",
    value: "18",
    sub: "Toplam Tutar: 1.245.680,50 TL",
    tone: "danger"
  },
  {
    id: "approvals",
    title: "Onay Bekleyen İşlemler",
    value: "12",
    sub: "Toplam Tutar: 632.150,00 TL",
    tone: "gold"
  },
  {
    id: "stock",
    title: "Stokta Azalan Ürünler",
    value: "23",
    sub: "Ürün",
    tone: "green"
  },
  {
    id: "delivery",
    title: "Bugün Teslim Edilecek",
    value: "7",
    sub: "Toplam Sipariş: 7",
    tone: "teal"
  }
];

export const EG_TASKS: TaskRow[] = [
  {
    id: "1",
    time: "09:30",
    text: "ABC Ltd. ile teklif görüşmesi",
    status: "Tamamlanacak"
  },
  {
    id: "2",
    time: "11:00",
    text: "Tahsilat kontrolü ve mutabakat",
    status: "Devam Ediyor"
  },
  {
    id: "3",
    time: "13:30",
    text: "Yeni sipariş değerlendirmesi",
    status: "Tamamlanacak"
  },
  {
    id: "4",
    time: "15:00",
    text: "Stok azalan ürünleri kontrol et",
    status: "Devam Ediyor"
  },
  {
    id: "5",
    time: "17:00",
    text: "Gün sonu raporlarını incele",
    status: "Bekliyor"
  }
];

export const EG_FLOW: FlowStat[] = [
  { id: "orders", title: "Yeni Siparişler", subtitle: "Bugün", count: "14", icon: "cart" },
  { id: "ship", title: "Sevkiyat Bekleyen", subtitle: "Toplam", count: "9", icon: "truck" },
  {
    id: "pay",
    title: "Tahsilat Bekleyen",
    subtitle: "Bugün vadesi gelen",
    count: "18",
    icon: "wallet"
  },
  { id: "ret", title: "İade Talebi", subtitle: "Onay bekleyen", count: "3", icon: "return" },
  { id: "offer", title: "Teklif Bekleyen", subtitle: "Yanıt bekleyen", count: "11", icon: "offer" }
];

export const EG_AI_GREETING =
  "Merhaba Mevlüt, size bugün nasıl yardımcı olabilirim?";

export const EG_RECENT: RecentRow[] = [
  {
    id: "1",
    date: "24.05.2025 14:32",
    type: "Sipariş",
    record: "SIP-2025-0524-0142",
    customer: "ABC Ltd. Şti.",
    amount: "125.400,00 TL",
    status: "Onaylandı",
    statusTone: "success"
  },
  {
    id: "2",
    date: "24.05.2025 13:15",
    type: "Tahsilat",
    record: "TAH-2025-0524-0087",
    customer: "XYZ A.Ş.",
    amount: "48.650,00 TL",
    status: "Tahsil Edildi",
    statusTone: "success"
  },
  {
    id: "3",
    date: "24.05.2025 11:48",
    type: "Teklif",
    record: "TEK-2025-0524-0056",
    customer: "DEF Tic. Ltd.",
    amount: "67.890,00 TL",
    status: "Beklemede",
    statusTone: "pending"
  },
  {
    id: "4",
    date: "24.05.2025 10:05",
    type: "Sevkiyat",
    record: "SEV-2025-0524-0039",
    customer: "GHI San. ve Tic. A.Ş.",
    amount: "92.300,00 TL",
    status: "Sevkiyata Hazır",
    statusTone: "ready"
  },
  {
    id: "5",
    date: "24.05.2025 09:12",
    type: "İade Talebi",
    record: "IADE-2025-0524-0012",
    customer: "JKL Ltd. Şti.",
    amount: "15.750,00 TL",
    status: "İncelemede",
    statusTone: "review"
  },
  {
    id: "6",
    date: "23.05.2025 17:45",
    type: "Stok Girişi",
    record: "STG-2025-0523-0098",
    customer: "Merkez Depo",
    amount: "210.000,00 TL",
    status: "Tamamlandı",
    statusTone: "done"
  }
];

export const EG_AI_ACTIONS = [
  "Günlük özet raporu oluştur",
  "Vadesi geçen tahsilatları listele",
  "Stokta azalan ürünleri göster"
];

export const EG_QUICK_ACTIONS = [
  "Yeni Sipariş Oluştur",
  "Tahsilat Ekle",
  "Teklif Hazırla",
  "Müşteri Ekle",
  "Stok Girişi",
  "Girdi Belgesi",
  "Görev Oluştur"
];
