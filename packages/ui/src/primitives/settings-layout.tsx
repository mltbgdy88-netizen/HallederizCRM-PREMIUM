import type { ReactNode } from "react";

export type SettingsLayoutProps = {
  nav: ReactNode;
  children: ReactNode;
};

/** Task 20 — ayarlar: sol iç nav + sağ içerik. */
export function SettingsLayout({ nav, children }: SettingsLayoutProps) {
  return (
    <div className="hz-settings-layout">
      <nav className="hz-settings-layout-nav" aria-label="Ayarlar iç navigasyon">
        {nav}
      </nav>
      <div className="hz-settings-layout-content">{children}</div>
    </div>
  );
}
