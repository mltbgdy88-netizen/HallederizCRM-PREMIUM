// @ts-nocheck
export type RomTab = {
  id: string;
  label: string;
};

export type RomKpi = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "up" | "warn" | "down";
  tone: "green" | "orange" | "teal" | "gold" | "blue";
  icon: "revenue" | "collection" | "balance" | "stock" | "whatsapp" | "ai";
  sparkline: number[];
};

export type RomTableRow = {
  id: string;
  metric: string;
  segment: string;
  period: string;
  actual: string;
  target: string;
  diff: string;
  diffTone: "up" | "down" | "warn";
  icon: RomKpi["icon"];
};

export type RomContext = {
  reportTitle: string;
  metric: string;
  period: string;
  segment: string;
  createdAt: string;
  createdBy: string;
  goal: string;
  actual: string;
  diff: string;
  successRate: string;
  successPct: number;
  sourceLinks: { id: string; label: string }[];
  actions: { id: string; label: string; done?: boolean }[];
};

export const ROM_PAGE = {
  title: "Rapor Operasyon Merkezi",
  subtitle: "operasyonel metrikler"
};

export const ROM_TABS: RomTab[] = [
  { id: "genel", label: "Genel" },
  { id: "satis", label: "Satış" },
  { id: "tahsilat", label: "Tahsilat" },
  { id: "stok", label: "Stok" },
  { id: "iade", label: "İade" },
  { id: "whatsapp", label: "WhatsApp" }
];

export const ROM_KPIS: RomKpi[] = [
  {
    id: "ciro",
    label: "Ciro",
    value: "₺24.750.000",
    trend: "↗ %18,6",
    trendTone: "up",
    tone: "green",
    icon: "revenue",
    sparkline: [4, 6, 5, 8, 7, 10, 9, 12]
  },
  {
    id: "tahsilat",
    label: "Tahsilat",
    value: "₺21.460.000",
    trend: "↗ %16,2",
    trendTone: "up",
    tone: "teal",
    icon: "collection",
    sparkline: [5, 7, 6, 9, 8, 11, 10, 13]
  },
  {
    id: "acik",
    label: "Açık Bakiye",
    value: "₺3.290.000",
    trend: "↗ %7,8",
    trendTone: "warn",
    tone: "orange",
    icon: "balance",
    sparkline: [8, 7, 9, 8, 10, 9, 11, 10]
  },
  {
    id: "kritik",
    label: "Kritik Stok",
    value: "23",
    trend: "↗ %11,5",
    trendTone: "warn",
    tone: "orange",
    icon: "stock",
    sparkline: [6, 8, 7, 9, 8, 10, 9, 11]
  },
  {
    id: "whatsapp",
    label: "WhatsApp Dönüşüm",
    value: "%32,4",
    trend: "↗ %6,4",
    trendTone: "up",
    tone: "green",
    icon: "whatsapp",
    sparkline: [3, 5, 4, 7, 6, 8, 7, 10]
  },
  {
    id: "ai",
    label: "AI Tasarruf",
    value: "₺1.245.000",
    trend: "↗ %22,1",
    trendTone: "up",
    tone: "gold",
    icon: "ai",
    sparkline: [2, 4, 5, 6, 7, 9, 10, 12]
  }
];

export const ROM_FILTERS = {
  period: "01.05.2025 - 31.05.2025",
  comparison: "01.04.2025 - 30.04.2025",
  segment: "Tümü"
};

export const ROM_TABLE_ROWS: RomTableRow[] = [
  {
    id: "1",
    metric: "Ciro Raporu",
    segment: "Tümü",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺24.750.000",
    target: "₺22.000.000",
    diff: "+%12,5 ↑",
    diffTone: "up",
    icon: "revenue"
  },
  {
    id: "2",
    metric: "Tahsilat Raporu",
    segment: "Kurumsal",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺21.460.000",
    target: "₺20.100.000",
    diff: "+%7,3 ↑",
    diffTone: "up",
    icon: "collection"
  },
  {
    id: "3",
    metric: "Açık Bakiye Raporu",
    segment: "Tümü",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺3.290.000",
    target: "₺2.800.000",
    diff: "+%31,6 ↑",
    diffTone: "warn",
    icon: "balance"
  },
  {
    id: "4",
    metric: "Kritik Stok Raporu",
    segment: "Depo",
    period: "01.05.2025 - 31.05.2025",
    actual: "23",
    target: "18",
    diff: "+%53,3 ↑",
    diffTone: "warn",
    icon: "stock"
  },
  {
    id: "5",
    metric: "WhatsApp Dönüşüm Raporu",
    segment: "Kanal",
    period: "01.05.2025 - 31.05.2025",
    actual: "%32,4",
    target: "%28,0",
    diff: "+%8,0 ↑",
    diffTone: "up",
    icon: "whatsapp"
  },
  {
    id: "6",
    metric: "AI Tasarruf Raporu",
    segment: "Operasyon",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺1.245.000",
    target: "₺980.000",
    diff: "+%24,5 ↑",
    diffTone: "up",
    icon: "ai"
  },
  {
    id: "7",
    metric: "İade Raporu",
    segment: "Tümü",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺420.000",
    target: "₺500.000",
    diff: "+%2,5 ↑",
    diffTone: "up",
    icon: "balance"
  },
  {
    id: "8",
    metric: "Satış Raporu",
    segment: "Bölge",
    period: "01.05.2025 - 31.05.2025",
    actual: "₺18.920.000",
    target: "₺17.500.000",
    diff: "+%13,6 ↑",
    diffTone: "up",
    icon: "revenue"
  }
];

export const ROM_TABLE_TOTAL = "Toplam 8 kayıt";
export const ROM_PAGE_SIZE = "25 / sayfa";

export const ROM_CONTEXT_BY_ROW: Record<string, RomContext> = {
  "1": {
    reportTitle: "Ciro Raporu",
    metric: "Ciro",
    period: "01.05.2025 - 31.05.2025",
    segment: "Tümü",
    createdAt: "01.06.2025 09:41",
    createdBy: "Yusuf Kaya",
    goal: "₺22.000.000",
    actual: "₺24.750.000",
    diff: "+₺2.750.000",
    successRate: "%112,5",
    successPct: 100,
    sourceLinks: [
      { id: "s1", label: "Satış Raporu Detay" },
      { id: "s2", label: "Tahsilat Raporu Detay" },
      { id: "s3", label: "Açık Bakiye Raporu Detay" },
      { id: "s4", label: "Kritik Stok Raporu Detay" }
    ],
    actions: [
      { id: "a1", label: "Yüksek açık bakiye müşteri aramalarını hızlandırın", done: true },
      { id: "a2", label: "Kurumsal segment teklif dönüşümünü artırın", done: true },
      { id: "a3", label: "Kritik stok ürünlerinde tedarik planını güncelleyin" },
      { id: "a4", label: "WhatsApp kanal dönüşümünü izleyin" }
    ]
  }
};

export function getRomContext(rowId: string): RomContext {
  const base = ROM_CONTEXT_BY_ROW["1"]!;
  const row = ROM_TABLE_ROWS.find((r) => r.id === rowId);
  if (!row || rowId === "1") return base;
  return {
    ...base,
    reportTitle: row.metric,
    metric: row.metric.replace(" Raporu", ""),
    segment: row.segment,
    actual: row.actual,
    goal: row.target,
    diff: row.diff.replace("↑", "").replace("↓", "").trim(),
    successRate: row.diffTone === "down" ? "%84,0" : "%108,2",
    successPct: row.diffTone === "down" ? 84 : 108
  };
}
