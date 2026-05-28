import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductModuleGroup, RouteStatus } from "../navigation/product-route-types";

export interface ProductPageShellLink {
  href: string;
  label: string;
}

export interface ProductPageShellProps {
  title: string;
  description: string;
  moduleGroup: ProductModuleGroup;
  status: RouteStatus;
  primaryHref?: string;
  primaryLabel?: string;
  relatedLinks?: ProductPageShellLink[];
  requiredBackend?: string;
  nextActions?: string[];
  children?: ReactNode;
}

const STATUS_LABEL: Record<RouteStatus, string> = {
  implemented: "Uygulandı",
  shell: "Production modül iskeleti",
  "needs-api": "Modül API bağlantısı eksik",
  planned: "Yol haritasında"
};

export function ProductPageShell({
  title,
  description,
  moduleGroup,
  status,
  primaryHref,
  primaryLabel = "İlgili modüle git",
  relatedLinks,
  requiredBackend,
  nextActions,
  children
}: ProductPageShellProps) {
  return (
    <div className="hz-product-shell-root">
      <div className="hz-product-shell-card">
        <div className="hz-product-shell-header">
          <span className="hz-product-shell-group">{moduleGroup}</span>
          <span className={`hz-product-status hz-product-status--${status}`}>{STATUS_LABEL[status]}</span>
        </div>
        <h1 className="hz-product-shell-title">{title}</h1>
        <p className="hz-product-shell-desc">{description}</p>
        {requiredBackend ? (
          <p className="hz-product-shell-backend">
            <strong>Backend gereksinimi:</strong> {requiredBackend}
          </p>
        ) : null}
        {nextActions?.length ? (
          <ul className="hz-product-shell-actions">
            {nextActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : null}
        <div className="hz-product-shell-cta">
          {primaryHref ? (
            <Link className="hz-product-shell-primary" href={primaryHref}>
              {primaryLabel}
            </Link>
          ) : null}
          {relatedLinks?.map((l) => (
            <Link key={l.href} className="hz-product-shell-link" href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        {children ? <div className="hz-product-shell-body">{children}</div> : null}
      </div>
    </div>
  );
}

