// @ts-nocheck
export const AIC_PAGE = {
  title: "AI İçgörüler",
  subtitle: "Verilerinizden elde edilen yapay zeka destekli özetler ve öneriler."
};

export const AIC_KPIS = [
  { id: "risk", label: "Risk Özeti", value: "12 Yüksek Risk", amount: "₺478.250", tone: "gold" as const },
  { id: "opp", label: "Fırsat Özeti", value: "18 Yüksek Potansiyel", amount: "₺1.250.800", tone: "green" as const },
  { id: "order", label: "Cari Sipariş Özeti", value: "32 Açık Sipariş", amount: "₺2.145.600", tone: "teal" as const },
  {
    id: "segment",
    label: "Segment Dağılımı",
    segments: [
      { label: "A", pct: "%38", tone: "orange" },
      { label: "B", pct: "%27", tone: "mint" },
      { label: "C", pct: "%20", tone: "sand" },
      { label: "D", pct: "%15", tone: "green" }
    ],
    tone: "chart" as const
  }
];

export const AIC_TABS = ["Tümü", "Risk", "Fırsat", "Sipariş", "Segment"] as const;

export type AicInsightRow = {
  id: string;
  title: string;
  desc: string;
  date: string;
  priority: "Yüksek" | "Orta" | "Düşük";
  kind: "risk" | "opp" | "order" | "segment";
  selected?: boolean;
};

export const AIC_INSIGHTS: AicInsightRow[] = [
  {
    id: "1",
    title: "Vadesi Geçen Tahsilat Artıyor",
    desc: "Son 30 günde vadesi geçen tahsilat tutarı %12,5 arttı.",
    date: "16.05.2025",
    priority: "Yüksek",
    kind: "risk",
    selected: true
  },
  {
    id: "2",
    title: "Yüksek Potansiyelli Müşteriler",
    desc: "Segment A'da 8 müşteri için çapraz satış fırsatı.",
    date: "16.05.2025",
    priority: "Yüksek",
    kind: "opp"
  },
  {
    id: "3",
    title: "Açık Siparişlerde Gecikme Riski",
    desc: "12 sipariş teslimat tarihine 3 günden az kaldı.",
    date: "15.05.2025",
    priority: "Orta",
    kind: "order"
  },
  {
    id: "4",
    title: "Segment A Büyüme Trendi",
    desc: "Segment A cirosu geçen aya göre %8,2 arttı.",
    date: "15.05.2025",
    priority: "Orta",
    kind: "segment"
  },
  {
    id: "5",
    title: "Stok Devir Hızı Düşüşü",
    desc: "Kritik 6 üründe devir hızı eşik altında.",
    date: "14.05.2025",
    priority: "Yüksek",
    kind: "risk"
  },
  {
    id: "6",
    title: "Teklif Dönüşüm Oranı",
    desc: "Mayıs teklif dönüşümü %34 — hedef %40.",
    date: "14.05.2025",
    priority: "Orta",
    kind: "opp"
  },
  {
    id: "7",
    title: "Tahsilat Planı Önerisi",
    desc: "3 cari için kısmi ödeme planı önerildi.",
    date: "13.05.2025",
    priority: "Düşük",
    kind: "risk"
  },
  {
    id: "8",
    title: "Yeni Müşteri Segmenti",
    desc: "Son 90 günde 14 yeni cari Segment C'ye kaydı.",
    date: "12.05.2025",
    priority: "Düşük",
    kind: "segment"
  }
];

export const AIC_DETAIL = {
  title: "Vadesi Geçen Tahsilat Artıyor",
  date: "16.05.2025",
  priority: "Yüksek Öncelik",
  suggestion:
    "Vadesi geçen bakiyesi olan müşterilerle iletişime geçerek ödeme planı oluşturmayı değerlendirin.",
  checklist: [
    "Müşteri temsilcisi aracılığıyla ödeme hatırlatması gönderin.",
    "Kısmi ödeme teklifleriyle tahsilatı hızlandırın.",
    "Gerekirse kredi limitlerini gözden geçirin."
  ]
};

export const AIC_LIST_FOOTER = {
  total: "Toplam 8 kayıt",
  page: "1 / 1",
  rows: "10 satır"
};
