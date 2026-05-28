import { REPORTS_DEMO_METRICS } from "../../reports/data/reports-demo-data";
import type { ReportCategoryChip, ReportDiffTone, ReportMetricRow } from "../../reports/types";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { formatTrDateTime } from "../../../lib/reference/formatters";
import {
  ROM_FILTERS,
  ROM_PAGE,
  ROM_PAGE_SIZE,
  ROM_TABS,
  type RomContext,
  type RomKpi,
  type RomTableRow
} from "../data/rapor-operasyon-mock";

/** PREMIUM ReportsPage üst KPI şeridi ile uyumlu */
const PREMIUM_KPI = {
  ciro: "₺1.284.500",
  tahsilat: "₺642.300",
  acik: "₺294.050",
  kritikStok: "12",
  waDonusum: "%38",
  aiTasarruf: "14 saat"
} as const;

export type RaporlarReferenceSnapshot = {
  page: typeof ROM_PAGE;
  kpis: RomKpi[];
  tabs: typeof ROM_TABS;
  filters: typeof ROM_FILTERS;
  tableRows: RomTableRow[];
  tableTotal: string;
  pageSize: string;
  demoBanner: string | null;
  getContext: (rowId: string) => RomContext;
};

function chipToIcon(chip: ReportCategoryChip): RomKpi["icon"] {
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
    default:
      return "balance";
  }
}

function diffToneToRom(tone: ReportDiffTone): RomTableRow["diffTone"] {
  if (tone === "positive") return "up";
  if (tone === "negative") return "down";
  return "warn";
}

function trendToneFromDiff(tone: ReportDiffTone): RomKpi["trendTone"] {
  if (tone === "positive") return "up";
  if (tone === "negative" || tone === "risk") return "warn";
  return "down";
}

function mapMetricRow(metric: ReportMetricRow, index: number): RomTableRow {
  return {
    id: metric.id || String(index + 1),
    metric: metric.title,
    segment: metric.segment,
    period: metric.periodLabel,
    actual: metric.actualDisplay,
    target: metric.targetDisplay,
    diff: metric.diffDisplay,
    diffTone: diffToneToRom(metric.diffTone),
    icon: chipToIcon(metric.chip)
  };
}

function buildKpis(metrics: ReportMetricRow[]): RomKpi[] {
  const find = (chip: ReportCategoryChip) => metrics.find((m) => m.chip === chip);
  const ciro = find("satis");
  const tahsilat = find("tahsilat");
  const acik = find("genel");
  const stok = find("stok");
  const wa = find("whatsapp");
  const ai = find("ai");

  return [
    {
      id: "ciro",
      label: "Ciro",
      value: ciro?.actualDisplay ?? PREMIUM_KPI.ciro,
      trend: ciro?.diffDisplay ?? "—",
      trendTone: trendToneFromDiff(ciro?.diffTone ?? "positive"),
      tone: "green",
      icon: "revenue",
      sparkline: [4, 6, 5, 8, 7, 10, 9, 12]
    },
    {
      id: "tahsilat",
      label: "Tahsilat",
      value: tahsilat?.actualDisplay ?? PREMIUM_KPI.tahsilat,
      trend: tahsilat?.diffDisplay ?? "—",
      trendTone: trendToneFromDiff(tahsilat?.diffTone ?? "negative"),
      tone: "teal",
      icon: "collection",
      sparkline: [5, 7, 6, 9, 8, 11, 10, 13]
    },
    {
      id: "acik",
      label: "Açık Bakiye",
      value: acik?.actualDisplay ?? PREMIUM_KPI.acik,
      trend: acik?.diffDisplay ?? "—",
      trendTone: "warn",
      tone: "orange",
      icon: "balance",
      sparkline: [8, 7, 9, 8, 10, 9, 11, 10]
    },
    {
      id: "kritik",
      label: "Kritik Stok",
      value: stok?.actualDisplay ?? PREMIUM_KPI.kritikStok,
      trend: stok?.diffDisplay ?? "—",
      trendTone: "warn",
      tone: "orange",
      icon: "stock",
      sparkline: [6, 8, 7, 9, 8, 10, 9, 11]
    },
    {
      id: "whatsapp",
      label: "WhatsApp Dönüşüm",
      value: wa?.actualDisplay ?? PREMIUM_KPI.waDonusum,
      trend: wa?.diffDisplay ?? "—",
      trendTone: trendToneFromDiff(wa?.diffTone ?? "positive"),
      tone: "green",
      icon: "whatsapp",
      sparkline: [3, 5, 4, 7, 6, 8, 7, 10]
    },
    {
      id: "ai",
      label: "AI Tasarruf",
      value: ai?.actualDisplay ?? PREMIUM_KPI.aiTasarruf,
      trend: ai?.diffDisplay ?? "—",
      trendTone: "up",
      tone: "gold",
      icon: "ai",
      sparkline: [2, 4, 5, 6, 7, 9, 10, 12]
    }
  ];
}

function buildContext(metric: ReportMetricRow): RomContext {
  const successPct =
    metric.diffTone === "positive" ? 108 : metric.diffTone === "negative" ? 84 : 95;
  return {
    reportTitle: metric.title,
    metric: metric.title,
    period: metric.periodLabel,
    segment: metric.segment,
    createdAt: formatTrDateTime(metric.updatedAtIso),
    createdBy: metric.updatedBy,
    goal: metric.targetDisplay,
    actual: metric.actualDisplay,
    diff: metric.diffDisplay,
    successRate: metric.diffDisplay,
    successPct,
    sourceLinks: [
      { id: "s1", label: metric.calculationType },
      { id: "s2", label: metric.dataPeriodNote }
    ],
    actions: [
      { id: "a1", label: metric.auditNote, done: true },
      { id: "a2", label: `Trend: ${metric.trendLabel}` }
    ]
  };
}

function buildSnapshot(metrics: ReportMetricRow[], demoBanner: string | null): RaporlarReferenceSnapshot {
  const rows = metrics.map(mapMetricRow);
  const metricById = new Map(metrics.map((m) => [m.id, m]));

  return {
    page: ROM_PAGE,
    kpis: buildKpis(metrics),
    tabs: ROM_TABS,
    filters: ROM_FILTERS,
    tableRows: rows,
    tableTotal: `Toplam ${rows.length} kayıt`,
    pageSize: ROM_PAGE_SIZE,
    demoBanner,
    getContext: (rowId: string) => {
      const metric = metricById.get(rowId) ?? metrics[0];
      if (!metric) {
        return buildContext({
          id: "empty",
          title: "Metrik yok",
          code: "—",
          segment: "—",
          periodLabel: "—",
          actualDisplay: "—",
          targetDisplay: "—",
          diffDisplay: "—",
          diffTone: "neutral",
          chip: "genel",
          trendLabel: "—",
          dataPeriodNote: "—",
          calculationType: "—",
          auditNote: "—",
          updatedBy: "—",
          updatedAtIso: new Date().toISOString()
        });
      }
      return buildContext(metric);
    }
  };
}

export const RAPORLAR_REFERENCE_INITIAL = buildSnapshot(REPORTS_DEMO_METRICS, null);

export function loadRaporlarReferenceDemo(): RaporlarReferenceSnapshot {
  return buildSnapshot(REPORTS_DEMO_METRICS, null);
}

export async function loadRaporlarReferenceLive(): Promise<RaporlarReferenceSnapshot> {
  // Canlı rapor API henüz yok; PREMIUM demo metrikleri referans şablona bağlanır.
  return buildSnapshot(REPORTS_DEMO_METRICS, REFERENCE_DEMO_BANNER);
}

