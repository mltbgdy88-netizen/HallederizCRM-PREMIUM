// @ts-nocheck
import { getDashboardLiveSnapshot } from "../queries/get-dashboard-live-snapshot";
import {
  DGP_AI_GREETING,
  DGP_AI_HIGHLIGHTS,
  DGP_AI_VIDEO_TITLE,
  DGP_ALERTS,
  DGP_DONUT,
  DGP_DONUT_TOTAL,
  DGP_KPIS,
  DGP_MOVEMENTS,
  DGP_QUICK_ACTIONS,
  DGP_SUMMARY,
  type CriticalAlert,
  type DonutSegment,
  type GostergeKpi,
  type StockMovement,
  type StockSummaryRow
} from "../data/dashboard-gosterge-paneli-mock";

export type DashboardGostergeReferenceSnapshot = {
  kpis: GostergeKpi[];
  quickActions: typeof DGP_QUICK_ACTIONS;
  movements: StockMovement[];
  alerts: CriticalAlert[];
  summary: StockSummaryRow[];
  donut: DonutSegment[];
  donutTotal: string;
  aiVideoTitle: string;
  aiHighlights: string[];
  aiGreeting: string;
  demoBanner: string | null;
};

function buildDemoSnapshot(): DashboardGostergeReferenceSnapshot {
  return {
    kpis: DGP_KPIS,
    quickActions: DGP_QUICK_ACTIONS,
    movements: DGP_MOVEMENTS,
    alerts: DGP_ALERTS,
    summary: DGP_SUMMARY,
    donut: DGP_DONUT,
    donutTotal: DGP_DONUT_TOTAL,
    aiVideoTitle: DGP_AI_VIDEO_TITLE,
    aiHighlights: DGP_AI_HIGHLIGHTS,
    aiGreeting: DGP_AI_GREETING,
    demoBanner: null
  };
}

function overlayLiveKpis(base: GostergeKpi[], cardValues: Record<string, string | undefined>): GostergeKpi[] {
  const byId: Record<string, string | undefined> = {
    total: cardValues.stock,
    critical: cardValues["critical-stock"],
    center: cardValues["center-stock"],
    factory: cardValues.factory,
    shelf: cardValues.shelf,
    price: cardValues["price-group"]
  };

  return base.map((kpi) => {
    const liveValue = byId[kpi.id];
    if (!liveValue || liveValue === "â€”") return kpi;
    return { ...kpi, value: liveValue };
  });
}

export const DASHBOARD_GOSTERGE_REFERENCE_INITIAL = buildDemoSnapshot();

export function loadDashboardGostergeReferenceDemo(): DashboardGostergeReferenceSnapshot {
  return buildDemoSnapshot();
}

export async function loadDashboardGostergeReferenceLive(): Promise<DashboardGostergeReferenceSnapshot> {
  const demo = buildDemoSnapshot();
  const snapshot = await getDashboardLiveSnapshot();
  const cardValues = snapshot.cardValues ?? {};

  return {
    ...demo,
    kpis: overlayLiveKpis(demo.kpis, cardValues),
    demoBanner: null
  };
}

