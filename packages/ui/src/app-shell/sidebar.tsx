import type { AppShellNavItem } from "./types";

export type SidebarNavSection = {
  title: string;
  items: AppShellNavItem[];
};

export interface SidebarCompanyCard {
  name: string;
  branch: string;
  status: string;
}

export interface SidebarProps {
  /** Text inside the logo placeholder tile. */
  logoMarkLabel?: string;
  appTitle: string;
  appSubtitle?: string;
  /** Legacy flat nav; used when `navSections` is empty. */
  primaryItems?: AppShellNavItem[];
  secondaryItems?: AppShellNavItem[];
  /** Grouped navigation (preferred for premium shell). */
  navSections?: SidebarNavSection[];
  activeHref: string;
  versionLabel?: string;
  companyCard?: SidebarCompanyCard;
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
  logoMarkLabel = "LOGO ALANI",
  appTitle,
  appSubtitle,
  primaryItems = [],
  secondaryItems = [],
  navSections,
  activeHref,
  versionLabel,
  companyCard,
  onNavigate
}: SidebarProps) {
  const sections: SidebarNavSection[] =
    navSections && navSections.length > 0
      ? navSections
      : [
          ...(primaryItems.length > 0 ? [{ title: "Menü", items: primaryItems }] : []),
          ...(secondaryItems.length > 0 ? [{ title: "Sistem", items: secondaryItems }] : [])
        ];

  return (
    <div className="hz-sidebar-root">
      <div className="hz-sidebar-brand">
        <div className="hz-sidebar-logo-slot" aria-hidden>
          <span className="hz-sidebar-logo-placeholder-glyph" />
          <span className="hz-sidebar-logo-placeholder-label">{logoMarkLabel}</span>
        </div>
        <h1 className="hz-sidebar-brand-app">{appTitle}</h1>
        {appSubtitle ? <p className="hz-sidebar-brand-tag">{appSubtitle}</p> : null}
      </div>

      <div className="hz-sidebar-scroll">
        {sections.map((section) => (
          <section key={section.title} className="hz-sidebar-section">
            <p className="hz-sidebar-section-title">{section.title}</p>
            <nav className="hz-sidebar-nav">
              {section.items.map((item) => (
                <SidebarItem key={item.key} item={item} activeHref={activeHref} onNavigate={onNavigate} />
              ))}
            </nav>
          </section>
        ))}
      </div>

      <div className="hz-sidebar-footer">
        {companyCard ? (
          <div className="hz-sidebar-company">
            <p className="hz-sidebar-company-name">{companyCard.name}</p>
            <p className="hz-sidebar-company-branch">{companyCard.branch}</p>
            <p className="hz-sidebar-company-status">
              <span className="hz-sidebar-status-dot" aria-hidden />
              {companyCard.status}
            </p>
          </div>
        ) : null}
        {versionLabel ? <p className="hz-sidebar-version">{versionLabel}</p> : null}
      </div>
    </div>
  );
}
