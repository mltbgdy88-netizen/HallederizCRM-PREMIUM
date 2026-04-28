"use client";

import {
  ContentSection,
  EmptyState,
  FilterBar,
  MetricCard,
  PageHeader,
  PrimaryActionToolbar,
  SplitContentLayout,
  TabSwitcher
} from "@hallederiz/ui";
import { useMemo, useState } from "react";

export interface SkeletonMetric {
  title: string;
  value: string;
  detail?: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  pulse?: boolean;
}

export interface SkeletonFilterField {
  label: string;
  type?: "text" | "select" | "toggle";
  options?: string[];
  placeholder?: string;
}

export interface RouteSkeletonPageProps {
  title: string;
  description: string;
  tabs?: string[];
  actions?: string[];
  filters?: SkeletonFilterField[];
  tableTitle?: string;
  tableColumns: string[];
  tableRows: string[][];
  sideTitle?: string;
  sideItems?: string[];
  metrics?: SkeletonMetric[];
  emptyMessage?: string;
}

function renderFilterField(field: SkeletonFilterField) {
  if (field.type === "toggle") {
    return (
      <label key={field.label} className="hz-toggle">
        <input type="checkbox" />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label key={field.label}>
        {field.label}
        <select defaultValue="">
          <option value="">Tum secenekler</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label key={field.label}>
      {field.label}
      <input type="text" placeholder={field.placeholder ?? `${field.label} ara`} />
    </label>
  );
}

export function RouteSkeletonPage({
  title,
  description,
  tabs = [],
  actions = [],
  filters = [],
  tableTitle,
  tableColumns,
  tableRows,
  sideTitle,
  sideItems = [],
  metrics = [],
  emptyMessage = "Kayit bulunamadi. Filtreleri guncelleyerek tekrar deneyin."
}: RouteSkeletonPageProps) {
  const firstTab = tabs[0] ?? "";
  const [activeTab, setActiveTab] = useState(firstTab);

  const tabItems = useMemo(() => tabs.map((tab) => ({ key: tab, label: tab })), [tabs]);

  const mainContent = (
    <div className="hz-page-stack">
      <PageHeader title={title} description={description} />

      {tabs.length > 0 ? <TabSwitcher items={tabItems} activeKey={activeTab} onChange={setActiveTab} /> : null}

      {metrics.length > 0 ? (
        <section className="hz-metric-grid">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              detail={metric.detail}
              tone={metric.tone ?? "neutral"}
              pulse={metric.pulse ?? false}
            />
          ))}
        </section>
      ) : null}

      {actions.length > 0 ? (
        <PrimaryActionToolbar>
          {actions.map((action, index) => (
            <button
              key={action}
              type="button"
              className={`hz-btn hz-toolbar-btn ${index === 0 ? "hz-btn-primary" : "hz-btn-secondary"}`}
            >
              {action}
            </button>
          ))}
        </PrimaryActionToolbar>
      ) : null}

      {filters.length > 0 ? (
        <FilterBar>
          <div className="hz-filter-grid">{filters.map((field) => renderFilterField(field))}</div>
        </FilterBar>
      ) : null}

      <ContentSection title={tableTitle ?? `${title} Listesi`}>
        {tableRows.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="table-wrap hz-table-wrap">
            <table className="table hz-table hz-table-sticky">
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr key={`${row.join("-")}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentSection>
    </div>
  );

  if (!sideTitle) {
    return mainContent;
  }

  return (
    <SplitContentLayout
      main={mainContent}
      side={
        <ContentSection title={sideTitle}>
          <ul className="hz-side-list">
            {sideItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ContentSection>
      }
    />
  );
}
