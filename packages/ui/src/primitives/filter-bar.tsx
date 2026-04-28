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
