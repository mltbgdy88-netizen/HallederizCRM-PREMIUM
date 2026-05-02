import type { AppShellNavItem } from "./types";

export interface SidebarProps {
  appTitle: string;
  appSubtitle: string;
  primaryItems: AppShellNavItem[];
  secondaryItems: AppShellNavItem[];
  activeHref: string;
  versionLabel: string;
  onNavigate: (href: string) => void;
}

function SidebarItem({
  item,
  activeHref,
  onNavigate
}: {
  item: AppShellNavItem;
  activeHref: string;
  onNavigate: (href: string) => void;
}) {
  const isActive = activeHref === item.href;

  return (
    <button
      key={item.key}
      type="button"
      onClick={() => onNavigate(item.href)}
      className={`hz-sidebar-item ${isActive ? "is-active" : ""} ${item.pulse ? "is-pulse" : ""}`}
    >
      <span className="hz-sidebar-item-icon">{item.icon ?? <span className="hz-icon-placeholder" />}</span>
      <span className="hz-sidebar-item-label">{item.label}</span>
      {item.badge ? <span className="hz-sidebar-item-badge">{item.badge}</span> : null}
    </button>
  );
}

export function Sidebar({
  appTitle,
  appSubtitle,
  primaryItems,
  secondaryItems,
  activeHref,
  versionLabel,
  onNavigate
}: SidebarProps) {
  return (
    <div className="hz-sidebar-root">
      <div className="hz-sidebar-brand">
        <p className="hz-sidebar-brand-kicker">Hallederiz Platform</p>
        <h1>{appTitle}</h1>
        <p>{appSubtitle}</p>
      </div>

      <div className="hz-sidebar-scroll">
        {primaryItems.length > 0 ? (
          <section className="hz-sidebar-section">
            <p className="hz-sidebar-section-title">Menü</p>
            <nav className="hz-sidebar-nav">
              {primaryItems.map((item) => (
                <SidebarItem key={item.key} item={item} activeHref={activeHref} onNavigate={onNavigate} />
              ))}
            </nav>
          </section>
        ) : null}

        {secondaryItems.length > 0 ? (
          <section className="hz-sidebar-section">
            <p className="hz-sidebar-section-title">Sistem</p>
            <nav className="hz-sidebar-nav">
              {secondaryItems.map((item) => (
                <SidebarItem key={item.key} item={item} activeHref={activeHref} onNavigate={onNavigate} />
              ))}
            </nav>
          </section>
        ) : null}
      </div>

      <div className="hz-sidebar-footer">
        <p>{versionLabel}</p>
      </div>
    </div>
  );
}
