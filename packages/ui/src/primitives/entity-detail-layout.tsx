import type { ReactNode } from "react";

export type EntityDetailLayoutProps = {
  /** Üst: geri / aksiyonlar */
  header?: ReactNode;
  summary: ReactNode;
  sections: ReactNode;
  sidebar?: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  pageState?: ReactNode;
  isLoading?: boolean;
  className?: string;
};

/**
 * Task 15 / Agent 03 — detay sayfası: üst özet + orta bölüm + sağ zaman çizelgesi / ilişkili kayıtlar.
 */
export function EntityDetailLayout({
  header,
  summary,
  sections,
  sidebar,
  tabs,
  footer,
  pageState,
  isLoading = false,
  className = ""
}: EntityDetailLayoutProps) {
  if (pageState) {
    return (
      <div className={["hz-detail-template-layout", "hz-entity-detail-layout", className].filter(Boolean).join(" ")} aria-busy={isLoading || undefined}>
        {pageState}
      </div>
    );
  }

  return (
    <div
      className={[
        "hz-detail-template-layout",
        "hz-entity-detail-layout",
        sidebar ? "" : "hz-detail-template-layout--single hz-entity-detail-layout--single",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={isLoading || undefined}
    >
      {header ? <div className="hz-detail-template-header">{header}</div> : null}
      <div className="hz-detail-template-summary hz-entity-detail-summary">{summary}</div>
      <div className="hz-detail-template-main hz-entity-detail-main">
        {tabs ? <div className="hz-detail-template-tabs">{tabs}</div> : null}
        <div className="hz-entity-detail-sections">{sections}</div>
      </div>
      {sidebar ? <aside className="hz-detail-template-aside hz-entity-detail-aside">{sidebar}</aside> : null}
      {footer ? <div className="hz-detail-template-footer">{footer}</div> : null}
    </div>
  );
}
