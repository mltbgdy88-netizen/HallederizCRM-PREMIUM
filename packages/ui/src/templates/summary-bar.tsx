import type { ReactNode } from "react";

export type SummaryBarProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/** Agent 03 — KPI / özet şeridi yuvası (içerik route tarafından gelir). */
export function SummaryBar({ children, className = "", "aria-label": ariaLabel = "Özet göstergeler" }: SummaryBarProps) {
  return (
    <div className={["hz-template-summary-bar", className].filter(Boolean).join(" ")} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
