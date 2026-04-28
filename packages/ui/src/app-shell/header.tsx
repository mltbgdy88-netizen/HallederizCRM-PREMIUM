import type { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  subtitle: string;
  breadcrumb?: string;
  searchPlaceholder?: string;
  notificationSlot: ReactNode;
  themeSlot: ReactNode;
  userSlot: ReactNode;
}

export function Header({
  title,
  subtitle,
  breadcrumb,
  searchPlaceholder = "Global arama (yakinda)",
  notificationSlot,
  themeSlot,
  userSlot
}: HeaderProps) {
  return (
    <div className="hz-header-root">
      <div className="hz-header-meta">
        {breadcrumb ? <p className="hz-header-breadcrumb">{breadcrumb}</p> : null}
        <h2>{title}</h2>
        <p className="hz-header-subtitle" title={subtitle}>
          {subtitle}
        </p>
      </div>

      <div className="hz-header-search-wrap">
        <input type="text" readOnly placeholder={searchPlaceholder} className="hz-header-search" />
      </div>

      <div className="hz-header-actions">
        {notificationSlot}
        {themeSlot}
        {userSlot}
      </div>
    </div>
  );
}
