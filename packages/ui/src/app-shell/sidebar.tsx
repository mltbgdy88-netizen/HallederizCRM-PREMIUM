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

export interface SidebarStatusCard {
  title?: string;
  subtitle?: string;
  linkLabel?: string;
  onViewDetails?: () => void;
}

export interface SidebarProps {
  logoMarkLabel?: string;
  appTitle: string;
  appSubtitle?: string;
  primaryItems?: AppShellNavItem[];
  secondaryItems?: AppShellNavItem[];
  navSections?: SidebarNavSection[];
  activeHref: string;
  versionLabel?: string;
  companyCard?: SidebarCompanyCard;
  statusCard?: SidebarStatusCard;
  /** Emerald/gold command-center chrome */
  variant?: "default" | "command-center";
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
      aria-current={isActive ? "page" : undefined}
    >
      <span className="hz-sidebar-item-icon">{item.icon ?? <span className="hz-icon-placeholder" />}</span>
      <span className="hz-sidebar-item-label">{item.label}</span>
      {item.badge ? <span className="hz-sidebar-item-badge">{item.badge}</span> : null}
    </button>
  );
}

function CommandCenterBrand() {
  return (
    <div className="hz-sidebar-brand hz-sidebar-brand--command">
      <div className="hz-sidebar-logo-row">
        <div className="hz-sidebar-logo-monogram" aria-hidden>
          <span>H</span>
        </div>
        <div className="hz-sidebar-logo-text">
          <p className="hz-sidebar-logo-title">HALLEDERİZ</p>
          <p className="hz-sidebar-logo-sub">CRM</p>
        </div>
      </div>
    </div>
  );
}

function StatusCardBlock({ card, onNavigate }: { card: SidebarStatusCard; onNavigate?: (href: string) => void }) {
  return (
    <article className="hz-sidebar-status-card">
      <div className="hz-sidebar-status-icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div className="hz-sidebar-status-copy">
        <p className="hz-sidebar-status-title">{card.title ?? "Sistem Durumu"}</p>
        <p className="hz-sidebar-status-sub">{card.subtitle ?? "Tüm sistemler aktif"}</p>
        {card.onViewDetails ? (
          <button type="button" className="hz-sidebar-status-link" onClick={card.onViewDetails}>
            {card.linkLabel ?? "Detayları Görüntüle →"}
          </button>
        ) : (
          <button type="button" className="hz-sidebar-status-link" onClick={() => onNavigate?.("/ayarlar/kullanim-hazirligi")}>
            {card.linkLabel ?? "Detayları Görüntüle →"}
          </button>
        )}
      </div>
    </article>
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
  statusCard,
  variant = "default",
  onNavigate
}: SidebarProps) {
  const sections: SidebarNavSection[] =
    navSections && navSections.length > 0
      ? navSections
      : [
          ...(primaryItems.length > 0 ? [{ title: "Menü", items: primaryItems }] : []),
          ...(secondaryItems.length > 0 ? [{ title: "Sistem", items: secondaryItems }] : [])
        ];

  const rootClass = `hz-sidebar-root${variant === "command-center" ? " hz-sidebar-root--command" : ""}`;

  return (
    <div className={rootClass}>
      {variant === "command-center" ? (
        <CommandCenterBrand />
      ) : (
        <div className="hz-sidebar-brand">
          <div className="hz-sidebar-logo-slot" aria-hidden>
            <span className="hz-sidebar-logo-placeholder-glyph" />
            <span className="hz-sidebar-logo-placeholder-label">{logoMarkLabel}</span>
          </div>
          <h1 className="hz-sidebar-brand-app">{appTitle}</h1>
          {appSubtitle ? <p className="hz-sidebar-brand-tag">{appSubtitle}</p> : null}
        </div>
      )}

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
        {statusCard ? <StatusCardBlock card={statusCard} onNavigate={onNavigate} /> : null}
        {!statusCard && companyCard ? (
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
