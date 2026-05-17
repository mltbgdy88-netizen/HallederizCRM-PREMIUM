import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <section className="hz-filter-card">{children}</section>;
}

export function FilterGrid({ children }: { children: ReactNode }) {
  return <div className="hz-filter-grid">{children}</div>;
}

export function FilterActions({ children }: { children: ReactNode }) {
  return <div className="hz-filter-actions">{children}</div>;
}

export function FilterToggleRow({ children }: { children: ReactNode }) {
  return <div className="hz-filter-toggle-row">{children}</div>;
}

export function FilterResetButton({ onClick, label = "Temizle" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="reset-btn" onClick={onClick}>
      {label}
    </button>
  );
}

/** Task 05 — üst filtre bandı: `hz-filter-card` + ek ızgara (`hz-filter-toolbar`). */
export function FilterToolbar({ children }: { children: ReactNode }) {
  return <section className="hz-filter-card hz-filter-toolbar">{children}</section>;
}

export function FilterToolbarRow({ children }: { children: ReactNode }) {
  return <div className="hz-filter-toolbar-row">{children}</div>;
}

export function FilterToolbarSearch({ children }: { children: ReactNode }) {
  return <div className="hz-filter-toolbar-search">{children}</div>;
}

export function FilterToolbarChips({ children }: { children: ReactNode }) {
  return (
    <div className="hz-filter-toolbar-chips" role="list">
      {children}
    </div>
  );
}

export type FilterChipProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function FilterChip({ children, active = false, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      role="listitem"
      className={["hz-filter-chip", active ? "is-active" : ""].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function FilterToolbarTabs({ children }: { children: ReactNode }) {
  return <div className="hz-filter-toolbar-tabs">{children}</div>;
}

export function FilterToolbarViews({ children }: { children: ReactNode }) {
  return <div className="hz-filter-toolbar-views">{children}</div>;
}

export function FilterToolbarBulk({ children }: { children: ReactNode }) {
  return (
    <div className="hz-filter-toolbar-bulk" role="region" aria-label="Toplu işlemler">
      {children}
    </div>
  );
}
