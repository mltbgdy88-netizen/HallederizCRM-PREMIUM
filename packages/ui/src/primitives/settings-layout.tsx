import type { ReactNode } from "react";

export type SettingsLayoutProps = {
  nav: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  dangerZone?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  className?: string;
};

/** Task 20 / Agent 03 — ayarlar: sol iç nav + sağ içerik. */
export function SettingsLayout({
  nav,
  title,
  subtitle,
  children,
  dangerZone,
  footer,
  isLoading = false,
  className = ""
}: SettingsLayoutProps) {
  return (
    <div
      className={["hz-settings-layout", "hz-settings-template-layout", className].filter(Boolean).join(" ")}
      aria-busy={isLoading || undefined}
    >
      <nav className="hz-settings-layout-nav hz-settings-template-nav" aria-label="Ayarlar iç navigasyon">
        {nav}
      </nav>
      <div className="hz-settings-layout-content hz-settings-template-content">
        {(title || subtitle) && (
          <header className="hz-settings-template-head">
            {title ? <h1 className="hz-settings-template-title">{title}</h1> : null}
            {subtitle ? <div className="hz-settings-template-subtitle">{subtitle}</div> : null}
          </header>
        )}
        {children}
        {dangerZone ? <div className="hz-settings-template-danger">{dangerZone}</div> : null}
        {footer ? <div className="hz-settings-template-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

