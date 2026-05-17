import type { ReactNode } from "react";

export type ReportAnalyticsShellProps = {
  filters: ReactNode;
  kpis: ReactNode;
  charts: ReactNode;
  table: ReactNode;
  className?: string;
};

/** Task 19 — rapor: filtre + KPI + grafik + tablo sırası. */
export function ReportAnalyticsShell({ filters, kpis, charts, table, className = "" }: ReportAnalyticsShellProps) {
  return (
    <div className={["hz-report-analytics-shell", className].filter(Boolean).join(" ")}>
      <div className="hz-report-analytics-filters">{filters}</div>
      <div className="hz-report-analytics-kpis">{kpis}</div>
      <div className="hz-report-analytics-charts">{charts}</div>
      <div className="hz-report-analytics-table">{table}</div>
    </div>
  );
}
