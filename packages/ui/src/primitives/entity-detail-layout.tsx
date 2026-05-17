import type { ReactNode } from "react";

export type EntityDetailLayoutProps = {
  summary: ReactNode;
  sections: ReactNode;
  sidebar?: ReactNode;
  className?: string;
};

/**
 * Task 15 — detay sayfası: üst özet + orta bölüm kartları + sağ zaman çizelgesi / ilişkili kayıtlar.
 */
export function EntityDetailLayout({ summary, sections, sidebar, className = "" }: EntityDetailLayoutProps) {
  return (
    <div
      className={["hz-entity-detail-layout", sidebar ? "" : "hz-entity-detail-layout--single", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="hz-entity-detail-main">
        <div className="hz-entity-detail-summary">{summary}</div>
        <div className="hz-entity-detail-sections">{sections}</div>
      </div>
      {sidebar ? <aside className="hz-entity-detail-aside">{sidebar}</aside> : null}
    </div>
  );
}
