import type { ReactNode } from "react";
import { PageHeader } from "./page-header";
import { SplitContentLayout, type SplitSideWidth } from "./split-content-layout";

export type EntityListPageTemplateProps = {
  /** Kök `className` (örn. `hz-customers-page`) */
  className?: string;
  /** `header` yoksa `PageHeader` için başlık */
  title?: string;
  description?: string;
  breadcrumb?: string;
  headerActions?: ReactNode;
  /** Özel üst blok (KPI, araç çubuğu vb.) — verilirse `PageHeader` çizilmez */
  header?: ReactNode;
  /** KPI / özet şeridi (liste üstü, kompakt) */
  summary?: ReactNode;
  filters?: ReactNode;
  bulkBar?: ReactNode;
  list: ReactNode;
  pagination?: ReactNode;
  /** Sağ önizleme / detay kolonu */
  preview?: ReactNode;
  /** `preview` varken `SplitContentLayout` sağ genişliği */
  previewSideWidth?: SplitSideWidth;
  pageState?: ReactNode;
  isLoading?: boolean;
};

/**
 * Task 12 / Agent 03 — liste sayfaları için bileşim şablonu (shell içi).
 */
export function EntityListPageTemplate({
  className = "",
  title,
  description,
  breadcrumb,
  headerActions,
  header,
  summary,
  filters,
  bulkBar,
  list,
  pagination,
  preview,
  previewSideWidth = "detail",
  pageState,
  isLoading = false
}: EntityListPageTemplateProps) {
  const mainColumn = (
    <div className="hz-entity-list-page-main hz-list-template-main">
      {filters ?? null}
      {bulkBar ?? null}
      <div className="hz-entity-list-page-body hz-list-template-body">
        {pageState ?? list}
        {pagination ?? null}
      </div>
    </div>
  );

  return (
    <div
      className={["hz-entity-list-page", "hz-list-template-page", className].filter(Boolean).join(" ")}
      aria-busy={isLoading || undefined}
    >
      {header ?? (
        <PageHeader title={title ?? "Liste"} description={description} breadcrumb={breadcrumb} actions={headerActions} />
      )}
      {summary ? <div className="hz-list-template-summary">{summary}</div> : null}
      {preview ? (
        <SplitContentLayout sideWidth={previewSideWidth} main={mainColumn} side={preview} />
      ) : (
        mainColumn
      )}
    </div>
  );
}
