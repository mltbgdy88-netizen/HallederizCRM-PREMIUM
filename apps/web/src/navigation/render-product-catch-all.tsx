import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ProductModuleLanding } from "../components/product-module-landing";
import { ProductPageShell } from "../components/product-page-shell";
import { AiInsightsPage as AiInsightsFeaturePage } from "../features/ai/components";
import { ReportDetailPage } from "../features/reports/components/ReportDetailPage";
import { WhatsAppPage } from "../features/whatsapp/components";
import { PRODUCT_ROUTE_FOREST, getProductRouteNode } from "./product-route-manifest";
import type { ProductRouteNode } from "./product-route-types";

function normalizeProductPath(segments: string[]): string {
  const clean = segments.map((s) => s.trim()).filter(Boolean);
  if (!clean.length) return "/";
  return `/${clean.join("/")}`;
}

function moduleRootForPath(path: string): ProductRouteNode | undefined {
  return PRODUCT_ROUTE_FOREST.find((m) => path === m.href || path.startsWith(`${m.href}/`));
}

export function renderProductCatchAll(slug: string[]): ReactNode {
  const path = normalizeProductPath(slug);
  const node = getProductRouteNode(path);

  if (node?.existingFeature?.startsWith("redirect:")) {
    redirect(node.existingFeature.slice("redirect:".length));
  }

  if (node?.existingFeature === "whatsapp-page") {
    return <WhatsAppPage />;
  }

  if (node?.existingFeature === "ai-insights-page") {
    return <AiInsightsFeaturePage />;
  }

  if (path.startsWith("/raporlar/") && path !== "/raporlar") {
    const tail = slug.filter(Boolean).slice(1);
    return <ReportDetailPage slugSegments={tail} />;
  }

  if (PRODUCT_ROUTE_FOREST.some((m) => m.href === path)) {
    return <ProductModuleLanding moduleHref={path} />;
  }

  if (node) {
    const primaryHref = node.existingFeature?.startsWith("link:") ? node.existingFeature.slice("link:".length) : undefined;
    return (
      <ProductPageShell
        title={node.label}
        description={node.description}
        moduleGroup={node.moduleGroup}
        status={node.status}
        primaryHref={primaryHref}
        primaryLabel={primaryHref ? "İlgili ekrana git" : undefined}
        requiredBackend={
          node.status === "needs-api" || node.status === "shell"
            ? "Bu görünüm için tenant kapsamlı modül API uçları ve yetki modeli tamamlanmalıdır."
            : undefined
        }
      />
    );
  }

  const root = moduleRootForPath(path);
  if (root) {
    const tail = slug.filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") ?? "Alt rota";
    return (
      <ProductPageShell
        title={tail}
        description="Bu alt rota üretim bilgi mimarisinde tanımlıdır. Canlı veri görüntülemek için modül API bağlantısı veya kayıt detayı uçları gereklidir."
        moduleGroup={root.moduleGroup}
        status="needs-api"
        primaryHref={root.href}
        primaryLabel="Modül özetine dön"
      />
    );
  }

  notFound();
}

