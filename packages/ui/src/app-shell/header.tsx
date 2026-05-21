import type { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  subtitle: string;
  /** true: sol başlık / breadcrumb / alt başlık gösterilmez (sayfa kendi başlığını kullanır). */
  suppressPageMeta?: boolean;
  breadcrumb?: string;
  searchPlaceholder?: string;
  /** Replaces the left title / breadcrumb / subtitle block (e.g. dashboard greeting). */
  leadingSlot?: ReactNode;
  /** Inserted between search and trailing actions (e.g. “+ Hızlı İşlem”). */
  toolbarSlot?: ReactNode;
  notificationSlot: ReactNode;
  themeSlot?: ReactNode;
  userSlot: ReactNode;
  /** Adds layout class for wider search + greeting row. */
  layout?: "default" | "dashboard";
  /** Emerald command-center chrome (dashboard). */
  variant?: "default" | "command";
}

export function Header({
  title,
  subtitle,
  suppressPageMeta = false,
  breadcrumb,
  searchPlaceholder = "Global arama (yakında)",
  leadingSlot,
  toolbarSlot,
  notificationSlot,
  themeSlot,
  userSlot,
  layout = "default",
  variant = "default"
}: HeaderProps) {
  const rootClass = [
    "hz-header-root",
    layout === "dashboard" ? "hz-header-root--dashboard" : "",
    variant === "command" ? "hz-header-root--command" : "",
    suppressPageMeta ? "hz-header-root--qop" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {leadingSlot ? (
        <div className="hz-header-leading">{leadingSlot}</div>
      ) : suppressPageMeta ? (
        <div className="hz-header-meta hz-header-meta--suppressed" aria-hidden="true" />
      ) : (
        <div className="hz-header-meta">
          {breadcrumb ? <p className="hz-header-breadcrumb">{breadcrumb}</p> : null}
          <h2>{title}</h2>
          <p className="hz-header-subtitle" title={subtitle}>
            {subtitle}
          </p>
        </div>
      )}

      <div className="hz-header-search-wrap">
        <input type="search" readOnly placeholder={searchPlaceholder} className="hz-header-search" />
      </div>

      <div className="hz-header-trailing">
        {toolbarSlot ? <div className="hz-header-toolbar">{toolbarSlot}</div> : null}
        <details className="hz-header-actions-drawer">
          <summary className="hz-header-actions-drawer-trigger" aria-label="Aksiyonlar">
            <span className="hz-sr-only">Aksiyonlar</span>
            <span aria-hidden>⋯</span>
          </summary>
          <div className="hz-header-actions">
            {notificationSlot}
            {themeSlot != null ? themeSlot : null}
          </div>
        </details>
        {userSlot}
      </div>
    </div>
  );
}
