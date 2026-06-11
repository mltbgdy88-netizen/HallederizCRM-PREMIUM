"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import type { RouteStatus } from "../../../navigation/product-route-types";
import {
  buildPanelScopeRows,
  computePanelSummaryMetrics,
  PANEL_NAV_TARGETS,
  PANEL_READINESS_DIMENSIONS,
  type PanelScopeRow
} from "../utils/panel-command-center-data";

const STATUS_FILTERS: Array<{ value: "all" | RouteStatus; label: string }> = [
  { value: "all", label: "Tüm durumlar" },
  { value: "implemented", label: "UI hazır" },
  { value: "shell", label: "İskelet" },
  { value: "needs-api", label: "API bekleniyor" },
  { value: "planned", label: "Planlandı" }
];

function statusBadgeClass(status: RouteStatus): string {
  if (status === "implemented") return "hz-panel-center__badge--success";
  if (status === "needs-api") return "hz-panel-center__badge--needs-api";
  if (status === "shell") return "hz-panel-center__badge--warning";
  return "hz-panel-center__badge--muted";
}

function resolveRowHref(row: PanelScopeRow): string | null {
  if (row.existingFeature?.startsWith("redirect:")) {
    return row.existingFeature.replace("redirect:", "");
  }
  if (row.existingFeature?.startsWith("link:")) {
    return row.existingFeature.replace("link:", "");
  }
  if (row.sourceRoute === "/panel") {
    return "/dashboard";
  }
  if (row.status === "implemented" || row.status === "shell") {
    return row.sourceRoute;
  }
  return null;
}

export function PanelCommandCenterPage() {
  const allRows = useMemo(() => buildPanelScopeRows(), []);
  const summary = useMemo(() => computePanelSummaryMetrics(allRows), [allRows]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | RouteStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.sourceRoute.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, status]);

  const selected =
    filteredRows.find((r) => r.id === selectedId) ?? filteredRows[0] ?? allRows[0] ?? null;
  const effectiveSelectedId = selected?.id ?? null;

  return (
    <div className="hz-panel-center" data-page="panel-command-center">
      <header className="hz-panel-center__intro">
        <div className="hz-panel-center__title-row">
          <span className="hz-panel-center__icon" aria-hidden>
            <LucideIcon name="grid-3x3" size={20} />
          </span>
          <div>
            <h1 className="hz-panel-center__page-title">Panel dashboard redirect</h1>
            <p className="hz-panel-center__page-sub">
              Panel modül katmanlarını gerçek API sonuçları uydurmadan readiness contract ile yönetin.
              Ana operasyon ekranı için Ana Sayfa kullanılır.
            </p>
          </div>
        </div>
        <nav className="hz-panel-center__actions" aria-label="Hızlı gezinme">
          {PANEL_NAV_TARGETS.map((item) => (
            <Link key={item.href} href={item.href} className="hz-panel-center__button-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hz-panel-center__summary" aria-label="Özet bant">
        <article className="hz-panel-center__summary-card">
          <span className="hz-panel-center__summary-label">Kapsam</span>
          <strong className="hz-panel-center__summary-value">{summary.scopeTotal}</strong>
          <span className="hz-panel-center__summary-hint">Panel route</span>
        </article>
        <article className="hz-panel-center__summary-card">
          <span className="hz-panel-center__summary-label">Bekleyen</span>
          <strong className="hz-panel-center__summary-value">{summary.pendingShell}</strong>
          <span className="hz-panel-center__summary-hint">İskelet + API</span>
        </article>
        <article className="hz-panel-center__summary-card">
          <span className="hz-panel-center__summary-label">Risk</span>
          <strong className="hz-panel-center__summary-value">{summary.riskNeedsApi}</strong>
          <span className="hz-panel-center__summary-hint">API bekleyen</span>
        </article>
        <article className="hz-panel-center__summary-card">
          <span className="hz-panel-center__summary-label">Bugün</span>
          <strong className="hz-panel-center__summary-value">{summary.todayLabel}</strong>
          <span className="hz-panel-center__summary-hint">{summary.todayHint}</span>
        </article>
        <article className="hz-panel-center__summary-card hz-panel-center__summary-card--accent">
          <span className="hz-panel-center__summary-label">Needs API</span>
          <strong className="hz-panel-center__summary-value">{summary.needsApi}</strong>
          <span className="hz-panel-center__summary-hint">{summary.implemented} UI hazır</span>
        </article>
      </section>

      <div className="hz-panel-center__grid">
        <section className="hz-panel-center__card hz-panel-center__main" aria-label="Panel katmanları">
          <div className="hz-panel-center__card-head">
            <h2 className="hz-panel-center__card-title">Panel readiness matrisi</h2>
            <span className="hz-panel-center__badge hz-panel-center__badge--info">
              {dataSourceConfig.useDemoData ? "Önizleme modu" : "Canlı mod"}
            </span>
          </div>
          <div className="hz-panel-center__card-body">
            <p className="hz-panel-center__route-notice" role="status">
              Eski davranış: otomatik <code>/dashboard</code> yönlendirmesi kaldırıldı; katmanlar burada
              listelenir. Ana operasyon için Ana Sayfa bağlantısını kullanın.
            </p>
            <div className="hz-panel-center__filter-grid">
              <label className="hz-panel-center__field">
                <span className="hz-panel-center__field-label">Ara</span>
                <input
                  type="search"
                  className="hz-panel-center__input"
                  placeholder="Panel katmanı veya route..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="hz-panel-center__field">
                <span className="hz-panel-center__field-label">Durum</span>
                <select
                  className="hz-panel-center__select"
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
            {filteredRows.length === 0 ? (
              <p className="hz-panel-center__empty" role="status">
                Filtreye uyan panel katmanı yok.
              </p>
            ) : (
              <div className="hz-panel-center__table" role="list">
                {filteredRows.map((row) => {
                  const isSelected = row.id === effectiveSelectedId;
                  const navHref = resolveRowHref(row);
                  return (
                    <div
                      key={row.id}
                      role="listitem"
                      className={`hz-panel-center__row${isSelected ? " hz-panel-center__row--selected" : ""}`}
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
                      <span className="hz-panel-center__row-title">{row.title}</span>
                      <span className="hz-panel-center__row-entity">{row.sourceRoute}</span>
                      <span className={`hz-panel-center__badge ${statusBadgeClass(row.status)}`}>
                        {row.statusLabel}
                      </span>
                      <span className="hz-panel-center__row-chips">
                        {row.readinessChips.slice(0, 2).map((chip) => (
                          <span key={chip} className="hz-panel-center__badge hz-panel-center__badge--route-readiness">
                            {chip}
                          </span>
                        ))}
                      </span>
                      {navHref ? (
                        <Link href={navHref} className="hz-panel-center__row-link">
                          Aç
                        </Link>
                      ) : (
                        <span className="hz-panel-center__badge hz-panel-center__badge--disabled-not-configured">
                          Nav yok
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="hz-panel-center__insight" aria-label="İçgörü">
          <article className="hz-panel-center__card">
            <div className="hz-panel-center__card-head">
              <h2 className="hz-panel-center__card-title">Hazırlık durumu matrisi</h2>
            </div>
            <div className="hz-panel-center__card-body hz-panel-center__scope-grid">
              {PANEL_READINESS_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="hz-panel-center__scope-card">
                  <span className="hz-panel-center__scope-label">{dim.label}</span>
                  <span
                    className={`hz-panel-center__badge ${
                      dim.ready ? "hz-panel-center__badge--success" : "hz-panel-center__badge--needs-api"
                    }`}
                  >
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="hz-panel-center__scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="hz-panel-center__card hz-panel-center__card--policy">
            <div className="hz-panel-center__card-head">
              <h2 className="hz-panel-center__card-title">Sahte veri yok ilkesi</h2>
            </div>
            <p className="hz-panel-center__card-body hz-panel-center__policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma state&apos;i
              üretmez.
            </p>
          </article>
        </aside>

        <aside className="hz-panel-center__side" aria-label="Seçili katman">
          {selected ? (
            <>
              <section className="hz-panel-center__side-section">
                <h2 className="hz-panel-center__card-title">{selected.title}</h2>
                <p className="hz-panel-center__muted-line">{selected.description}</p>
                <div className="hz-panel-center__side-meta">
                  <span className={`hz-panel-center__badge ${statusBadgeClass(selected.status)}`}>
                    {selected.statusLabel}
                  </span>
                  <span className="hz-panel-center__badge hz-panel-center__badge--source-linked">
                    {selected.sourceRoute}
                  </span>
                </div>
              </section>
              <section className="hz-panel-center__side-section">
                <h3 className="hz-panel-center__side-heading">Kaynak gezinme</h3>
                <div className="hz-panel-center__source-grid">
                  <Link href="/dashboard" className="hz-panel-center__button-primary">
                    Ana Sayfa (Gösterge Paneli)
                  </Link>
                  {resolveRowHref(selected) && resolveRowHref(selected) !== "/dashboard" ? (
                    <Link href={resolveRowHref(selected)!} className="hz-panel-center__button-secondary">
                      Katmanı aç
                    </Link>
                  ) : null}
                </div>
              </section>
              <section className="hz-panel-center__side-section">
                <h3 className="hz-panel-center__side-heading">Güvenli aksiyonlar</h3>
                <div className="hz-panel-center__action-stack">
                  <button type="button" className="hz-panel-center__button-disabled" disabled>
                    Yeni Kayıt
                  </button>
                  <button type="button" className="hz-panel-center__button-disabled" disabled>
                    Hazırlık durumunu dışa aktar
                  </button>
                </div>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
