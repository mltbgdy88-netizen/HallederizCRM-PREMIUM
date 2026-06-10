// @ts-nocheck
export type GostergeKpi = {
  id: string;
  label: string;
  value: string;
  href: string;
  trend?: string;
  trendTone?: "up" | "warn" | "neutral";
  compareLabel?: string;
  tone: "green" | "gold" | "teal" | "orange" | "blue" | "slate";
};

export type StockMovement = {
  id: string;
  date: string;
  product: string;
  type: "Giriş" | "Çıkış";
  qty: string;
  warehouse: string;
  user: string;
};

export type CriticalAlert = {
  id: string;
  text: string;
  href: string;
  icon: "warn" | "transfer" | "price" | "factory" | "warehouse" | "delivery" | "cargo";
};

export type StockSummaryRow = {
  label: string;
  value: string;
  href: string;
  hint?: string;
};

export type GostergeQuickAction = {
  id: string;
  label: string;
  icon: "plus" | "move" | "transfer" | "label" | "report";
  href?: string;
  demoToast?: string;
};

export type DonutSegment = {
  label: string;
  pct: number;
  color: string;
  detail?: string;
};

/** Stok gösterge paneli — referans KPI şeridi */
export const DGP_KPIS: GostergeKpi[] = [
  {
    id: "total",
    label: "Toplam Ürün",
    value: "2.458",
    href: "/stok",
    trend: "%12,5 ↑",
    trendTone: "up",
    tone: "green"
  },
  {
    id: "critical",
    label: "Kritik Stok",
    value: "86",
    href: "/stok",
    trend: "%8,3 ↑",
    trendTone: "warn",
    tone: "orange"
  },
  {
    id: "center",
    label: "Merkez Stok",
    value: "125.430",
    href: "/stok",
    trend: "%15,7 ↑",
    trendTone: "up",
    tone: "teal"
  },
  {
    id: "factory",
    label: "Fabrika Stok",
    value: "98.210",
    href: "/stok",
    trend: "%11,4 ↑",
    trendTone: "up",
    tone: "blue"
  },
  {
    id: "shelf",
    label: "Depo Raf",
    value: "76.880",
    href: "/stok",
    trend: "%9,8 ↑",
    trendTone: "up",
    tone: "slate"
  },
  {
    id: "price",
    label: "Fiyat Grubu",
    value: "12",
    href: "/stok",
    trend: "%0,0 Değişim yok",
    trendTone: "neutral",
    tone: "gold"
  }
];

export const DGP_QUICK_ACTIONS = [
  { id: "new", label: "Yeni Ürün", icon: "plus" as const },
  { id: "move", label: "Stok Hareketi", icon: "move" as const },
  { id: "transfer", label: "Transfer Talebi", icon: "transfer" as const },
  { id: "label", label: "Etiket Yazdır", icon: "label" as const },
  { id: "report", label: "Rapor Oluştur", icon: "report" as const }
];

export const DGP_MOVEMENTS: StockMovement[] = [
  {
    id: "1",
    date: "21.05.2026 14:32",
    product: "UR-10008 · Premium Duvar Kağıdı",
    type: "Giriş",
    qty: "+240",
    warehouse: "Merkez Depo",
    user: "Ayşe K."
  },
  {
    id: "2",
    date: "21.05.2026 13:18",
    product: "UR-1042 · Kritik Stok Ürün",
    type: "Çıkış",
    qty: "-86",
    warehouse: "Fabrika A",
    user: "Mehmet D."
  },
  {
    id: "3",
    date: "21.05.2026 11:45",
    product: "UR-1021 · Standart Rulo",
    type: "Giriş",
    qty: "+120",
    warehouse: "Depo Raf B",
    user: "Zeynep A."
  },
  {
    id: "4",
    date: "21.05.2026 10:22",
    product: "UR-10015 · Altın Seri",
    type: "Çıkış",
    qty: "-45",
    warehouse: "Merkez Depo",
    user: "Yusuf K."
  },
  {
    id: "5",
    date: "21.05.2026 09:08",
    product: "UR-10002 · Klasik Desen",
    type: "Giriş",
    qty: "+500",
    warehouse: "Fabrika B",
    user: "Ayşe K."
  }
];

export const DGP_ALERTS: CriticalAlert[] = [
  { id: "1", text: "86 ürün kritik stok seviyesinde", href: "/stok", icon: "warn" },
  { id: "2", text: "3 transfer talebi onay bekliyor", href: "/depo", icon: "transfer" },
  { id: "3", text: "12 ürünün fiyatı güncel değil", href: "/stok", icon: "price" }
];

export const DGP_SUMMARY: StockSummaryRow[] = [
  { label: "Merkez Stok", value: "125.430", href: "/stok" },
  { label: "Fabrika Stok", value: "98.210", href: "/stok" },
  { label: "Depo Raf", value: "76.880", href: "/stok" },
  { label: "Rezerv", value: "12.340", href: "/stok" }
];

export const DGP_ALERTS_VIEW_ALL_HREF = "/stok";

export const DGP_DONUT: DonutSegment[] = [
  { label: "Merkez Depo", pct: 48, color: "#047857" },
  { label: "Fabrika Depo", pct: 28, color: "#0f766e" },
  { label: "Depo Raf", pct: 16, color: "#d4af37" },
  { label: "Diğer", pct: 8, color: "#94a3b8" }
];

export const DGP_DONUT_TOTAL = "125.430";

export const DGP_AI_VIDEO_TITLE = "Stok analiz videonuz hazır!";

export const DGP_AI_HIGHLIGHTS = [
  "86 ürün kritik stok seviyesinde",
  "Bugün 14 yeni stok hareketi kaydedildi",
  "3 transfer talebi onay bekliyor",
  "Merkez depo doluluk oranı optimal aralıkta"
];

export const DGP_AI_GREETING =
  "Merhaba Yusuf Bey, Stok hareketlerinizi analiz ettim. Kritik stok ve transfer önerileri videoda özetlendi.";

