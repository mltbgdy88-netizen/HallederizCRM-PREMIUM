import type { ReactNode } from "react";

export type ProductPageShellAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "link";
};

export type ProductPageShellProps = {
  title: string;
  description?: string;
  badge?: ReactNode;
  statusLabel?: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  tertiaryAction?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const DEFAULT_TITLE = "Canlı veri bekleniyor";
const DEFAULT_DESCRIPTION =
  "Bu ekran için veri bağlantısı tamamlandığında burada içerik gösterilecek.";

/**
 * Agent 03 — placeholder / modül iskelet ekranları (presentational, framework-agnostic).
 * Route adoption: apps/web `ProductPageShell` Agent 04+ taşınacak; bu branch route değiştirmez.
 */
export function ProductPageShell({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  badge,
  statusLabel,
  icon,
  primaryAction,
  secondaryActions,
  tertiaryAction,
  children,
  className = ""
}: ProductPageShellProps) {
  return (
    <div className={["hz-product-shell-root", className].filter(Boolean).join(" ")}>
      <div className="hz-product-shell-card">
        <div className="hz-product-shell-header">
          {icon ? <div className="hz-product-shell-icon" aria-hidden="true">{icon}</div> : null}
          <div className="hz-product-shell-header-meta">
            {badge ?? (statusLabel ? <span className="hz-product-shell-badge">{statusLabel}</span> : null)}
          </div>
        </div>
        <h1 className="hz-product-shell-title">{title}</h1>
        {description ? <p className="hz-product-shell-desc">{description}</p> : null}
        {(primaryAction || secondaryActions || tertiaryAction) && (
          <div className="hz-product-shell-actions">
            {primaryAction}
            {secondaryActions}
            {tertiaryAction}
          </div>
        )}
        {children ? <div className="hz-product-shell-body">{children}</div> : null}
      </div>
    </div>
  );
}

