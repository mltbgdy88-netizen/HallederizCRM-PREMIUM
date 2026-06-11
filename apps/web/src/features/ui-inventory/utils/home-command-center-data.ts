import {
  flattenProductRoutes,
  PRODUCT_MODULE_ROOT_HREFS
} from "../../../navigation/product-route-manifest";
import type { ProductModuleGroup, ProductRouteNode, RouteStatus } from "../../../navigation/product-route-types";

export type HomeScopeRow = {
  id: string;
  title: string;
  relatedEntity: string;
  status: RouteStatus;
  statusLabel: string;
  sourceRoute: string;
  moduleGroup: ProductModuleGroup;
  readinessChips: string[];
  description: string;
  existingFeature?: string;
};

export type HomeSummaryMetrics = {
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

function readinessChipsFor(node: ProductRouteNode): string[] {
  const chips: string[] = [STATUS_LABEL[node.status]];
  if (node.relatedApi) chips.push("API sözleşmesi tanımlı");
  if (node.existingFeature?.startsWith("redirect:")) chips.push("Yönlendirme");
  if (node.existingFeature?.startsWith("link:")) chips.push("Bağlantılı modül");
  if (node.suppressHeader) chips.push("Özel başlık");
  return chips;
}

export function buildHomeScopeRows(): HomeScopeRow[] {
  const map = flattenProductRoutes();
  return [...map.values()]
    .sort((a, b) => a.href.localeCompare(b.href, "tr"))
    .map((node) => ({
      id: node.id,
      title: node.label,
      relatedEntity: node.moduleGroup,
      status: node.status,
      statusLabel: STATUS_LABEL[node.status],
      sourceRoute: node.href,
      moduleGroup: node.moduleGroup,
      readinessChips: readinessChipsFor(node),
      description: node.description,
      existingFeature: node.existingFeature
    }));
}

export function computeHomeSummaryMetrics(rows: HomeScopeRow[]): HomeSummaryMetrics {
  const needsApi = rows.filter((r) => r.status === "needs-api").length;
  const shell = rows.filter((r) => r.status === "shell").length;
  const implemented = rows.filter((r) => r.status === "implemented").length;
  return {
    scopeTotal: rows.length,
    pendingShell: shell + needsApi,
    riskNeedsApi: needsApi,
    todayLabel: "—",
    todayHint: "Canlı operasyon sayısı API bağlanınca",
    needsApi,
    implemented
  };
}

export const HOME_NAV_TARGETS = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/onaylar", label: "Onaylar" },
  { href: "/raporlar", label: "Raporlar" },
  {
    href: PRODUCT_MODULE_ROOT_HREFS.find((h) => h === "/hizli-islem") ?? "/hizli-islem/satis-masasi",
    label: "Hızlı İşlem"
  }
] as const;

export const HOME_READINESS_DIMENSIONS = [
  { key: "api", label: "API bağlantısı", ready: false, hint: "Kiracı kapsamlı REST; sahte yanıt yok" },
  { key: "model", label: "Veri modeli", ready: false, hint: "Manifest + rota sözleşmesi" },
  { key: "rbac", label: "Yetki / RBAC", ready: false, hint: "Yetki kontrolü zorunlu" },
  { key: "audit", label: "Denetim izi", ready: false, hint: "Zaman akışı + denetim kaydı" },
  { key: "export", label: "Dışa aktar", ready: false, hint: "PDF/Excel hazırlık durumu ayrı" }
] as const;
