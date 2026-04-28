import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <section className="hz-filter-card">{children}</section>;
}
