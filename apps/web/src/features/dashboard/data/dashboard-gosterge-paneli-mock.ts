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

/** Acil takip — mağaza operasyonu KPI şeridi */
export const DGP_KPIS: GostergeKpi[] = [
  {
    id: "factory-order",
    label: "Fabrikaya Verilecek",
    value: "7",
    href: "/fabrikalar/siparis",
    trend: "2 sipariş · 3+ gün",
    trendTone: "warn",
    compareLabel: "Acil takip",
    tone: "orange"
  },
  {
    id: "warehouse-prep",
    label: "Depoda Hazırlanacak",
    value: "11",
    href: "/depo",
    trend: "4 iş · bugün kapanmalı",
    trendTone: "warn",
    compareLabel: "Acil takip",
    tone: "teal"
  },
  {
    id: "customer-delivery",
    label: "Müşteriye Teslim",
    value: "6",
    trend: "3 müşteri · randevu geçti",
    trendTone: "warn",
    compareLabel: "Acil takip",
    tone: "green"
  },
  {
    id: "cargo-wait",
    label: "Kargo Bekliyor",
    value: "4",
    href: "/teslimatlar",
    trend: "1 paket · 5. gün",
    trendTone: "warn",
    compareLabel: "Acil takip",
    tone: "blue"
  },
  {
    id: "approval-wait",
    label: "Onay Bekleyen",
    value: "3",
    href: "/onaylar",
    trend: "iskonto + tahsilat",
    trendTone: "neutral",
    compareLabel: "Acil takip",
    tone: "gold"
  },
  {
    id: "overdue",
    label: "Geciken İş",
    value: "8",
    href: "/siparisler",
    trend: "öncelikli liste",
    trendTone: "warn",
    compareLabel: "2+ gün bekleyen",
    tone: "slate"
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
    date: "27.05.2026 14:32",
    product: "SP-2412 · Demiröz Elekt. · fabrika emri",
    type: "Çıkış",
    qty: "Bekliyor",
    warehouse: "Fabrika",
    user: "Ayşe K."
  },
  {
    id: "2",
    date: "27.05.2026 13:18",
    product: "SP-2409 · Kaya Yapı · depo hazırlık",
    type: "Çıkış",
    qty: "2. gün",
    warehouse: "Merkez Depo",
    user: "Mehmet D."
  },
  {
    id: "3",
    date: "27.05.2026 11:45",
    product: "SP-2405 · Akdeniz Oto. · kargo",
    type: "Çıkış",
    qty: "5. gün",
    warehouse: "Sevkiyat",
    user: "Zeynep A."
  },
  {
    id: "4",
    date: "27.05.2026 10:22",
    product: "SP-2401 · ABC İnşaat · teslim",
    type: "Çıkış",
    qty: "Bugün",
    warehouse: "Mağaza",
    user: "Yusuf K."
  },
  {
    id: "5",
    date: "27.05.2026 09:08",
    product: "SP-2398 · Sarılar Petrol · onay",
    type: "Giriş",
    qty: "Bekliyor",
    warehouse: "Onay",
    user: "Ayşe K."
  }
];

/** Yalnızca acil takip — kısa müşteri adı + gün */
export const DGP_ALERTS: CriticalAlert[] = [
  {
    id: "1",
    text: "Demiröz Elekt. · SP-2412 · fabrikaya verilmedi · 3. gün",
    href: "/fabrikalar/siparis",
    icon: "factory"
  },
  {
    id: "2",
    text: "Kaya Yapı · SP-2409 · depo hazırlığı yarım · 2. gün",
    href: "/depo",
    icon: "warehouse"
  },
  {
    id: "3",
    text: "Akdeniz Oto. · SP-2405 · kargo çıkışı yok · 5. gün",
    href: "/teslimatlar",
    icon: "cargo"
  },
  {
    id: "4",
    text: "ABC İnşaat · SP-2401 · mağazada teslim bekliyor · 1. gün",
    href: "/teslimatlar",
    icon: "delivery"
  },
  {
    id: "5",
    text: "Yılmaz Gıda · SP-2396 · fabrika + depo bölünmüş · 4. gün",
    href: "/siparisler",
    icon: "warn"
  },
  {
    id: "6",
    text: "Mega Market · SP-2392 · iskonto onayı · 2. gün",
    href: "/onaylar",
    icon: "price"
  }
];

/** Acil iş kuyrukları — stok özeti paneli */
export const DGP_SUMMARY: StockSummaryRow[] = [
  {
    label: "Fabrikaya verilecek",
    value: "7 sipariş",
    href: "/fabrikalar/siparis",
    hint: "3 tanesi 3+ gün bekliyor"
  },
  {
    label: "Depoda hazırlanacak",
    value: "11 sipariş",
    href: "/depo",
    hint: "4 iş bugün kapanmalı"
  },
  {
    label: "Müşteriye teslim",
    value: "6 müşteri",
    href: "/teslimatlar",
    hint: "3 randevu saati geçti"
  },
  {
    label: "Kargo çıkışı bekleyen",
    value: "4 paket",
    href: "/teslimatlar",
    hint: "1 paket 5. günde"
  }
];

export const DGP_ALERTS_VIEW_ALL_HREF = "/siparisler";

/** Acil iş dağılımı — depo dağılımı paneli */
export const DGP_DONUT: DonutSegment[] = [
  { label: "Fabrika emri", pct: 25, color: "#c2410c", detail: "7 iş" },
  { label: "Depo hazırlık", pct: 39, color: "#0f766e", detail: "11 iş" },
  { label: "Teslimat", pct: 22, color: "#047857", detail: "6 müşteri" },
  { label: "Kargo bekliyor", pct: 14, color: "#1d4ed8", detail: "4 paket" }
];

export const DGP_DONUT_TOTAL = "28 acil iş";

export const DGP_AI_VIDEO_TITLE = "Acil iş ve geciken sipariş özeti hazır!";

export const DGP_AI_HIGHLIGHTS = [
  "Demiröz Elekt. fabrika emri 3. günde — önce fabrikaya ver",
  "Akdeniz Oto. kargo 5. gün — müşteriyi bilgilendir",
  "4 depo hazırlığı bugün kapanmalı",
  "3 teslim randevusu saati geçti"
];

export const DGP_AI_GREETING =
  "Merhaba Yusuf Bey, bugün 28 acil iş var. Fabrika emri ve kargo bekleyenleri önce videoda özetledim.";
