import { flattenProductRoutes } from "../../../navigation/product-route-manifest";
import type { ProductRouteNode, RouteStatus } from "../../../navigation/product-route-types";

export type PanelScopeRow = {
  id: string;
  title: string;
  relatedEntity: string;
  status: RouteStatus;
  statusLabel: string;
  sourceRoute: string;
  readinessChips: string[];
  description: string;
  existingFeature?: string;
};

export type PanelSummaryMetrics = {
  scopeTotal: number;
  pendingShell: number;
  riskNeedsApi: number;
  todayLabel: string;
  todayHint: string;
  needsApi: number;
  implemented: number;
};

const STATUS_LABEL: Record<RouteStatus, string> = {
  implemented: "UI hazır",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  planned: "Planlandı"
};

const PANEL_PREFIX = "/panel";

function readinessChipsFor(node: ProductRouteNode): string[] {
  const chips: string[] = [STATUS_LABEL[node.status]];
  if (node.relatedApi) chips.push("API sözleşmesi");
  if (node.existingFeature?.startsWith("redirect:")) chips.push("Yönlendirme");
  if (node.existingFeature?.startsWith("link:")) chips.push("Bağlantılı modül");
  return chips;
}

export function buildPanelScopeRows(): PanelScopeRow[] {
  const map = flattenProductRoutes();
  return [...map.values()]
    .filter((node) => node.href === PANEL_PREFIX || node.href.startsWith(`${PANEL_PREFIX}/`))
    .sort((a, b) => a.href.localeCompare(b.href, "tr"))
    .map((node) => ({
      id: node.id,
      title: node.label,
      relatedEntity: "Panel",
      status: node.status,
      statusLabel: STATUS_LABEL[node.status],
      sourceRoute: node.href,
      readinessChips: readinessChipsFor(node),
      description: node.description,
      existingFeature: node.existingFeature
    }));
}

export function computePanelSummaryMetrics(rows: PanelScopeRow[]): PanelSummaryMetrics {
  const needsApi = rows.filter((r) => r.status === "needs-api").length;
  const shell = rows.filter((r) => r.status === "shell").length;
  const implemented = rows.filter((r) => r.status === "implemented").length;
  return {
    scopeTotal: rows.length,
    pendingShell: shell + needsApi,
    riskNeedsApi: needsApi,
    todayLabel: "—",
    todayHint: "Günlük panel metrikleri API bağlanınca",
    needsApi,
    implemented
  };
}

export const PANEL_NAV_TARGETS = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/onaylar", label: "Onaylar" },
  { href: "/hizli-islem", label: "Hızlı İşlem" },
  { href: "/raporlar", label: "Raporlar" }
] as const;

export const PANEL_READINESS_DIMENSIONS = [
  { key: "api", label: "API bağlantısı", ready: false, hint: "Panel özet API bekleniyor" },
  { key: "model", label: "Veri modeli", ready: true, hint: "Manifest /panel ağacı" },
  { key: "rbac", label: "Yetki / RBAC", ready: false, hint: "Operasyon guard" },
  { key: "audit", label: "Audit", ready: false, hint: "Panel aksiyon izi" },
  { key: "export", label: "Export", ready: false, hint: "Devre dışı" }
] as const;

