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
  filters?: ReactNode;
  bulkBar?: ReactNode;
  list: ReactNode;
  pagination?: ReactNode;
  /** Sağ önizleme / detay kolonu */
  preview?: ReactNode;
  /** `preview` varken `SplitContentLayout` sağ genişliği */
  previewSideWidth?: SplitSideWidth;
};

/**
 * Task 12 — liste sayfaları için bileşim şablonu (shell içi).
 * - Üst: `header` **veya** `PageHeader` (`title` + `description` …)
 * - `preview` varsa: `SplitContentLayout` ile ana kolon (`filters` + `bulkBar` + liste gövdesi) | sağ panel
 * Kök: `hz-entity-list-page` + isteğe `className` (ör. `hz-customers-page`).
 */
export function EntityListPageTemplate({
  className = "",
  title,
  description,
  breadcrumb,
  headerActions,
  header,
  filters,
  bulkBar,
  list,
  pagination,
  preview,
  previewSideWidth = "detail"
}: EntityListPageTemplateProps) {
  const mainColumn = (
    <div className="hz-entity-list-page-main">
      {filters ?? null}
      {bulkBar ?? null}
      <div className="hz-entity-list-page-body">
        {list}
        {pagination ?? null}
      </div>
    </div>
  );

  return (
    <div className={["hz-entity-list-page", className].filter(Boolean).join(" ")}>
      {header ?? <PageHeader title={title ?? "Liste"} description={description} breadcrumb={breadcrumb} actions={headerActions} />}
      {preview ? (
        <SplitContentLayout sideWidth={previewSideWidth} main={mainColumn} side={preview} />
      ) : (
        mainColumn
      )}
    </div>
  );
}
