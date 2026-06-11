import type { ReportCategoryChip, ReportDiffTone, ReportMetricRow } from "../types";

export type RomTabId = "genel" | "satis" | "tahsilat" | "stok" | "iade" | "whatsapp";

export type RomKpiIcon = "revenue" | "collection" | "balance" | "stock" | "whatsapp" | "ai";

export type RomKpiTone = "green" | "teal" | "orange" | "gold" | "blue";

export type RomReferenceKpi = {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "up" | "warn" | "down";
  tone: RomKpiTone;
  icon: RomKpiIcon;
  sparkline: number[];
  pendingLive?: boolean;
};

export type RomReferenceTableRow = {
  id: string;
  metric: string;
  segment: string;
  period: string;
  actual: string;
  target: string;
  diff: string;
  diffTone: "up" | "down" | "warn";
  icon: RomKpiIcon;
};

export type RomSourceLink = {
  id: string;
  label: string;
  href: string;
};

export type RomSuggestedAction = {
  id: string;
  label: string;
  done?: boolean;
};

export type RomReferenceContext = {
  reportTitle: string;
  metric: string;
  period: string;
  segment: string;
  createdAt: string;
  createdBy: string;
  goal: string;
  actual: string;
  diff: string;
  diffTone: "up" | "down" | "warn";
  successRate: string;
  successPct: number;
  sourceLinks: RomSourceLink[];
  actions: RomSuggestedAction[];
};

export const ROM_PAGE_COPY = {
  title: "Rapor Operasyon Merkezi",
  subtitle: "Operasyonel metrikler, hedef karşılaştırma ve karar destek raporları."
} as const;

export const ROM_CATEGORY_TABS: { id: RomTabId; label: string }[] = [
  { id: "genel", label: "Genel" },
  { id: "satis", label: "Satış" },
  { id: "tahsilat", label: "Tahsilat" },
  { id: "stok", label: "Stok" },
  { id: "iade", label: "İade" },
  { id: "whatsapp", label: "WhatsApp" }
];

const DEMO_KPI_VALUES = {
  ciro: "₺1.284.500",
  tahsilat: "₺642.300",
  acik: "₺294.050",
  kritikStok: "12",
  waDonusum: "%38",
  aiTasarruf: "14 saat"
} as const;

const DEMO_SPARKLINES: Record<string, number[]> = {
  ciro: [4, 6, 5, 8, 7, 10, 9, 12],
  tahsilat: [5, 7, 6, 9, 8, 11, 10, 13],
  acik: [8, 7, 9, 8, 10, 9, 11, 10],
  kritik: [6, 8, 7, 9, 8, 10, 9, 11],
  whatsapp: [3, 5, 4, 7, 6, 8, 7, 10],
  ai: [2, 4, 5, 6, 7, 9, 10, 12]
};

const STATIC_SUGGESTED_ACTIONS: RomSuggestedAction[] = [
  { id: "a1", label: "Yüksek açık bakiye müşteri aramalarını hızlandırın.", done: true },
  { id: "a2", label: "Kritik stok kalemleri için tedarik planı oluşturun." },
  { id: "a3", label: "WhatsApp dönüşüm düşük segmente şablon gönderin." },
  { id: "a4", label: "AI tasarruf raporunu operasyon toplantısında paylaşın." }
];

const SOURCE_LINKS: RomSourceLink[] = [
  { id: "satis", label: "Satış", href: "/siparisler" },
  { id: "tahsilat", label: "Tahsilat", href: "/tahsilatlar" },
  { id: "stok", label: "Stok", href: "/stok" },
  { id: "whatsapp", label: "WhatsApp", href: "/whatsapp" },
  { id: "ai", label: "AI", href: "/onaylar" },
  { id: "belgeler", label: "Belgeler", href: "/belgeler" },
  { id: "arsiv", label: "Arşiv", href: "/archive" }
];

export function romTabToChip(tab: RomTabId): ReportCategoryChip | "all" {
  if (tab === "genel") return "all";
  return tab;
}

export function chipToRomTab(chip: ReportCategoryChip | "all"): RomTabId {
  if (chip === "all" || chip === "genel") return "genel";
  if (chip === "ai") return "genel";
  return chip;
}

function mapDiffTone(tone: ReportDiffTone): RomReferenceTableRow["diffTone"] {
  if (tone === "negative") return "down";
  if (tone === "warning" || tone === "risk") return "warn";
  return "up";
}

function mapChipToIcon(chip: ReportCategoryChip): RomKpiIcon {
  switch (chip) {
    case "satis":
      return "revenue";
    case "tahsilat":
      return "collection";
    case "stok":
      return "stock";
    case "whatsapp":
      return "whatsapp";
    case "ai":
      return "ai";
    case "iade":
      return "balance";
    default:
      return "revenue";
  }
}

function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

function estimateSuccessPct(row: ReportMetricRow): number {
  if (row.diffTone === "negative") return 72;
  if (row.diffTone === "risk" || row.diffTone === "warning") return 84;
  return 108;
}

function estimateSuccessRate(row: ReportMetricRow): string {
  const pct = estimateSuccessPct(row);
  return `%${pct.toFixed(1).replace(".", ",")}`;
}

const EMPTY_SPARKLINE = [0, 0, 0, 0, 0, 0, 0, 0] as const;

export function buildReportsReferenceKpis(useDemo: boolean): RomReferenceKpi[] {
  const pending = !useDemo;
  return [
    {
      id: "ciro",
      label: "Ciro",
      value: useDemo ? DEMO_KPI_VALUES.ciro : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "up" : "warn",
      tone: "green",
      icon: "revenue",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.ciro ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    },
    {
      id: "tahsilat",
      label: "Tahsilat",
      value: useDemo ? DEMO_KPI_VALUES.tahsilat : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "up" : "warn",
      tone: "teal",
      icon: "collection",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.tahsilat ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    },
    {
      id: "acik",
      label: "Açık Bakiye",
      value: useDemo ? DEMO_KPI_VALUES.acik : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "warn" : "warn",
      tone: "orange",
      icon: "balance",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.acik ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    },
    {
      id: "kritik",
      label: "Kritik Stok",
      value: useDemo ? DEMO_KPI_VALUES.kritikStok : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "warn" : "warn",
      tone: "orange",
      icon: "stock",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.kritik ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    },
    {
      id: "whatsapp",
      label: "WhatsApp Dönüşüm",
      value: useDemo ? DEMO_KPI_VALUES.waDonusum : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "up" : "warn",
      tone: "green",
      icon: "whatsapp",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.whatsapp ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    },
    {
      id: "ai",
      label: "AI Tasarruf",
      value: useDemo ? DEMO_KPI_VALUES.aiTasarruf : "—",
      trend: useDemo ? "↗ demo" : "Canlı veri bekleniyor",
      trendTone: useDemo ? "up" : "warn",
      tone: "gold",
      icon: "ai",
      sparkline: useDemo ? [...(DEMO_SPARKLINES.ai ?? EMPTY_SPARKLINE)] : [...EMPTY_SPARKLINE],
      pendingLive: pending
    }
  ];
}

export function mapMetricToTableRow(row: ReportMetricRow): RomReferenceTableRow {
  return {
    id: row.id,
    metric: row.title,
    segment: row.segment,
    period: row.periodLabel,
    actual: row.actualDisplay,
    target: row.targetDisplay,
    diff: row.diffDisplay,
    diffTone: mapDiffTone(row.diffTone),
    icon: mapChipToIcon(row.chip)
  };
}

export function mapMetricToContext(row: ReportMetricRow | null): RomReferenceContext | null {
  if (!row) return null;
  const diffTone = mapDiffTone(row.diffTone);
  const successPct = estimateSuccessPct(row);
  return {
    reportTitle: row.title,
    metric: row.title,
    period: row.periodLabel,
    segment: row.segment,
    createdAt: formatUpdated(row.updatedAtIso),
    createdBy: row.updatedBy,
    goal: row.targetDisplay,
    actual: row.actualDisplay,
    diff: row.diffDisplay,
    diffTone,
    successRate: estimateSuccessRate(row),
    successPct,
    sourceLinks: SOURCE_LINKS,
    actions: STATIC_SUGGESTED_ACTIONS
  };
}

export function diffBadgeClass(tone: RomReferenceTableRow["diffTone"]): string {
  if (tone === "down") return "rom-diff rom-diff--down";
  if (tone === "warn") return "rom-diff rom-diff--warn";
  return "rom-diff rom-diff--up";
}

export function trendClass(tone: RomReferenceKpi["trendTone"]): string {
  if (tone === "warn") return " rom-kpi-trend--warn";
  if (tone === "down") return " rom-kpi-trend--down";
  return " rom-kpi-trend--up";
}

export function formatPeriodRange(dateFrom: string, dateTo: string): string {
  const fmt = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}.${m}.${y}`;
  };
  if (!dateFrom && !dateTo) return "—";
  if (dateFrom && dateTo) return `${fmt(dateFrom)} - ${fmt(dateTo)}`;
  return fmt(dateFrom || dateTo);
}
