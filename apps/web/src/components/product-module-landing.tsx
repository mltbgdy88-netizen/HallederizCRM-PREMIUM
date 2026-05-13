import Link from "next/link";
import { PRODUCT_ROUTE_FOREST } from "../navigation/product-route-manifest";
import type { ProductRouteNode, RouteStatus } from "../navigation/product-route-types";

const STATUS_LABEL: Record<RouteStatus, string> = {
  implemented: "Uygulandı",
  shell: "İskelet",
  "needs-api": "API bekleniyor",
  planned: "Planlı"
};

function RouteCard({ node }: { node: ProductRouteNode }) {
  return (
    <Link href={node.href} className="hz-product-route-card">
      <div className="hz-product-route-card-head">
        <span className={`hz-product-status hz-product-status--${node.status}`}>{STATUS_LABEL[node.status]}</span>
      </div>
      <h3 className="hz-product-route-card-title">{node.label}</h3>
      <p className="hz-product-route-card-desc">{node.description}</p>
    </Link>
  );
}

export function ProductModuleLanding({ moduleHref }: { moduleHref: string }) {
  const mod = PRODUCT_ROUTE_FOREST.find((m) => m.href === moduleHref);
  if (!mod) return null;
  const children = mod.children ?? [];

  return (
    <div className="hz-product-shell-root">
      <div className="hz-product-shell-card hz-product-shell-card--landing">
        <div className="hz-product-shell-header">
          <span className="hz-product-shell-group">{mod.moduleGroup}</span>
          <span className={`hz-product-status hz-product-status--${mod.status}`}>{STATUS_LABEL[mod.status]}</span>
        </div>
        <h1 className="hz-product-shell-title">{mod.label}</h1>
        <p className="hz-product-shell-desc">{mod.description}</p>
        <section className="hz-product-landing-grid" aria-label="Alt ekranlar">
          {children.map((c) => (
            <RouteCard key={c.id} node={c} />
          ))}
        </section>
      </div>
    </div>
  );
}
