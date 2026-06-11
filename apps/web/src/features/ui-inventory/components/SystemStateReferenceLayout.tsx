"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  DEFAULT_NAV,
  DEFAULT_READINESS,
  type InventoryPageConfig,
  type InventoryScopeRow,
  type InventoryScopeStatus
} from "../utils/system-state-command-center-data";

const STATUS_FILTERS: Array<{ value: "all" | InventoryScopeStatus; label: string }> = [
  { value: "all", label: "Tüm durumlar" },
  { value: "ready", label: "Hazır" },
  { value: "shell", label: "İskelet" },
  { value: "needs-api", label: "API bekleniyor" },
  { value: "blocked", label: "Kapalı" }
];

function badgeClass(status: InventoryScopeStatus): string {
  if (status === "ready") return "sysf-badge--success";
  if (status === "needs-api") return "sysf-badge--needs-api";
  if (status === "shell") return "sysf-badge--warning";
  if (status === "blocked") return "sysf-badge--disabled-not-allowed";
  return "sysf-badge--muted";
}

function mainBadgeClass(tone: "danger" | "info" | "warning"): string {
  if (tone === "danger") return "sysf-badge--danger";
  if (tone === "warning") return "sysf-badge--warning";
  return "sysf-badge--info";
}

function resolveRowHref(row: InventoryScopeRow): string | null {
  if (row.navHref) return row.navHref;
  if (row.sourceRoute.startsWith("/")) return row.sourceRoute;
  return null;
}

export function SystemStateReferenceLayout({
  config,
  mainActions
}: {
  config: InventoryPageConfig;
  mainActions?: ReactNode;
}) {
  const { summary, rows: allRows } = config;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | InventoryScopeStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.relatedEntity.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, status]);

  const selected =
    filteredRows.find((r) => r.id === selectedId) ?? filteredRows[0] ?? allRows[0] ?? null;
  const effectiveSelectedId = selected?.id ?? null;

  return (
    <div className="sysf-page" data-page={config.dataPage} role={config.role}>
      <header className="sysf-intro">
        <div className="sysf-title-row">
          <span className="sysf-icon" aria-hidden>
            <LucideIcon name={config.icon} size={20} />
          </span>
          <div>
            <h1 className="sysf-page-title">{config.title}</h1>
            <p className="sysf-page-sub">{config.subtitle}</p>
          </div>
        </div>
        {!config.navItems ? (
          <nav className="sysf-actions" aria-label="Hızlı gezinme">
            {DEFAULT_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="sysf-btn-gold">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <section className="sysf-summary" aria-label="Özet bant">
        <article className="sysf-summary-card">
          <span className="sysf-summary-label">Kapsam</span>
          <strong className="sysf-summary-value">{summary.scopeTotal}</strong>
          <span className="sysf-summary-hint">Contract</span>
        </article>
        <article className="sysf-summary-card">
          <span className="sysf-summary-label">Bekleyen</span>
          <strong className="sysf-summary-value">{summary.pendingShell}</strong>
          <span className="sysf-summary-hint">İskelet + API</span>
        </article>
        <article className="sysf-summary-card">
          <span className="sysf-summary-label">Risk</span>
          <strong className="sysf-summary-value">{summary.riskNeedsApi}</strong>
          <span className="sysf-summary-hint">API bekleyen</span>
        </article>
        <article className="sysf-summary-card">
          <span className="sysf-summary-label">Bugün</span>
          <strong className="sysf-summary-value">{summary.todayLabel}</strong>
          <span className="sysf-summary-hint">{summary.todayHint}</span>
        </article>
        <article className="sysf-summary-card sysf-summary-card--accent">
          <span className="sysf-summary-label">Needs API</span>
          <strong className="sysf-summary-value">{summary.needsApi}</strong>
          <span className="sysf-summary-hint">{summary.ready} hazır</span>
        </article>
      </section>

      <div className="sysf-grid">
        <section className="sysf-card sysf-main" aria-label="Ana panel">
          <div className="sysf-card-head">
            <h2 className="sysf-card-title">Hazırlık durumu matrisi</h2>
            {config.mainBadge ? (
              <span className={`sysf-badge ${mainBadgeClass(config.mainBadge.tone)}`}>{config.mainBadge.text}</span>
            ) : (
              <span className="sysf-badge sysf-badge--info">
                {dataSourceConfig.useDemoData ? "Önizleme modu" : "Canlı mod"}
              </span>
            )}
          </div>
          <div className="sysf-card-body">
            {config.alertCopy ? <p className="sysf-alert-copy">{config.alertCopy}</p> : null}
            {mainActions ? <div className="sysf-main-actions">{mainActions}</div> : null}
            <div className="sysf-filter-grid">
              <label className="sysf-field">
                <span className="sysf-field-label">Ara</span>
                <input
                  type="search"
                  className="sysf-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Senaryo ara..."
                />
              </label>
              <label className="sysf-field">
                <span className="sysf-field-label">Durum</span>
                <select
                  className="sysf-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div role="list">
              {filteredRows.map((row) => {
                const isSelected = row.id === effectiveSelectedId;
                const navHref = resolveRowHref(row);
                return (
                  <div
                    key={row.id}
                    role="listitem"
                    className={`sysf-row${isSelected ? " sysf-row--selected" : ""}`}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedId(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(row.id);
                      }
                    }}
                  >
                    <span className="sysf-row-title">{row.title}</span>
                    <span className="sysf-row-entity">{row.relatedEntity}</span>
                    <span className={`sysf-badge ${badgeClass(row.status)}`}>{row.statusLabel}</span>
                    {navHref ? (
                      <Link href={navHref} className="sysf-row-link">
                        Aç
                      </Link>
                    ) : (
                      <span className="sysf-badge sysf-badge--muted">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="sysf-insight" aria-label="İçgörü">
          <article className="sysf-card">
            <div className="sysf-card-head">
              <h2 className="sysf-card-title">Hazırlık durumu</h2>
            </div>
            <div className="sysf-card-body sysf-scope-grid">
              {DEFAULT_READINESS.map((dim) => (
                <div key={dim.key} className="sysf-scope-card">
                  <span className="sysf-scope-label">{dim.label}</span>
                  <span className={`sysf-badge ${dim.ready ? "sysf-badge--success" : "sysf-badge--needs-api"}`}>
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="sysf-scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="sysf-card">
            <div className="sysf-card-head">
              <h2 className="sysf-card-title">Sahte veri yok ilkesi</h2>
            </div>
            <p className="sysf-card-body sysf-policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma state&apos;i üretmez.
            </p>
          </article>
        </aside>

        <aside className="sysf-side" aria-label="Seçili kapsam">
          {selected ? (
            <>
              <section className="sysf-side-section">
                <h2 className="sysf-card-title">{selected.title}</h2>
                <p className="sysf-muted-line">{selected.description}</p>
                <div className="sysf-side-meta">
                  <span className={`sysf-badge ${badgeClass(selected.status)}`}>{selected.statusLabel}</span>
                  <span className="sysf-badge sysf-badge--source-linked">{selected.sourceRoute}</span>
                </div>
              </section>
              <section className="sysf-side-section">
                <h3 className="sysf-side-heading">Güvenli aksiyonlar</h3>
                <div className="sysf-action-stack">
                  <button type="button" className="sysf-btn-disabled" disabled>
                    Hazırlık durumunu dışa aktar
                  </button>
                  <button type="button" className="sysf-btn-disabled" disabled>
                    Denetim izini izle
                  </button>
                  <Link href="/dashboard" className="sysf-btn-secondary">
                    Ana Sayfa
                  </Link>
                </div>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
