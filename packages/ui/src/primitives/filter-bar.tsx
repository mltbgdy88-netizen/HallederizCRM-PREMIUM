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

export type FilterToolbarProps = {
  /** Composition mode: mevcut route’lar `FilterToolbarRow` vb. ile kullanmaya devam edebilir. */
  children?: ReactNode;
  label?: string;
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  secondaryActions?: ReactNode;
  meta?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
};

/** Task 05 / Agent 03 — liste filtre bandı (presentational, slot tabanlı). */
export function FilterToolbar({
  children,
  label,
  search,
  filters,
  actions,
  secondaryActions,
  meta,
  isLoading = false,
  isDisabled = false,
  className = ""
}: FilterToolbarProps) {
  const rootClass = [
    "hz-filter-card",
    "hz-filter-toolbar",
    "hz-layout-filter-toolbar",
    isLoading ? "hz-layout-filter-toolbar--loading" : "",
    isDisabled ? "hz-layout-filter-toolbar--disabled" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (children) {
    return (
      <section className={rootClass} aria-busy={isLoading || undefined}>
        {children}
      </section>
    );
  }

  return (
    <section className={rootClass} aria-busy={isLoading || undefined} aria-disabled={isDisabled || undefined}>
      {label ? <div className="hz-layout-filter-toolbar-label">{label}</div> : null}
      {(search || filters || meta) ? (
        <div className="hz-filter-toolbar-row">
          {search ? <div className="hz-filter-toolbar-search">{search}</div> : null}
          {filters ?? null}
          {meta ? <div className="hz-layout-filter-toolbar-meta">{meta}</div> : null}
        </div>
      ) : null}
      {(actions || secondaryActions) ? (
        <div className="hz-filter-toolbar-row">
          {secondaryActions ?? null}
          {actions ? <div className="hz-layout-filter-toolbar-actions">{actions}</div> : null}
        </div>
      ) : null}
    </section>
  );
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

