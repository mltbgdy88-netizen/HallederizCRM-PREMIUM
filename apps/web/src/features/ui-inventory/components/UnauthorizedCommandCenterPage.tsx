"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import {
  computeUnauthorizedSummaryMetrics,
  UNAUTHORIZED_NAV_TARGETS,
  UNAUTHORIZED_READINESS_DIMENSIONS,
  UNAUTHORIZED_SCOPE_ROWS,
  type AccessScopeStatus,
  type UnauthorizedScopeRow
} from "../utils/unauthorized-command-center-data";

const STATUS_FILTERS: Array<{ value: "all" | AccessScopeStatus; label: string }> = [
  { value: "all", label: "Tüm durumlar" },
  { value: "ready", label: "Hazır" },
  { value: "shell", label: "İskelet" },
  { value: "needs-api", label: "API bekleniyor" },
  { value: "blocked", label: "Engelli" }
];

function statusBadgeClass(status: AccessScopeStatus): string {
  if (status === "ready") return "hz-unauthorized-center__badge--success";
  if (status === "needs-api") return "hz-unauthorized-center__badge--needs-api";
  if (status === "shell") return "hz-unauthorized-center__badge--warning";
  if (status === "blocked") return "hz-unauthorized-center__badge--disabled-not-allowed";
  return "hz-unauthorized-center__badge--muted";
}

function resolveRowHref(row: UnauthorizedScopeRow): string | null {
  return row.navHref ?? null;
}

export function UnauthorizedCommandCenterPage() {
  const allRows = UNAUTHORIZED_SCOPE_ROWS;
  const summary = useMemo(() => computeUnauthorizedSummaryMetrics(allRows), [allRows]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AccessScopeStatus>("all");
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
    <div className="hz-unauthorized-center" data-page="unauthorized-command-center" role="alert">
      <header className="hz-unauthorized-center__intro">
        <div className="hz-unauthorized-center__title-row">
          <span className="hz-unauthorized-center__icon" aria-hidden>
            <LucideIcon name="shield-alert" size={20} />
          </span>
          <div>
            <h1 className="hz-unauthorized-center__page-title">Yetkisiz erişim</h1>
            <p className="hz-unauthorized-center__page-sub">
              Bu ekranı gerçek API sonuçları uydurmadan, erişim reddi ve readiness contract
              görünürlüğüyle yönetin.
            </p>
          </div>
        </div>
        <nav className="hz-unauthorized-center__actions" aria-label="Güvenli gezinme">
          {UNAUTHORIZED_NAV_TARGETS.map((item) => (
            <Link key={item.href} href={item.href} className="hz-unauthorized-center__button-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hz-unauthorized-center__summary" aria-label="Özet bant">
        <article className="hz-unauthorized-center__summary-card">
          <span className="hz-unauthorized-center__summary-label">Kapsam</span>
          <strong className="hz-unauthorized-center__summary-value">{summary.scopeTotal}</strong>
          <span className="hz-unauthorized-center__summary-hint">Erişim senaryosu</span>
        </article>
        <article className="hz-unauthorized-center__summary-card">
          <span className="hz-unauthorized-center__summary-label">Bekleyen</span>
          <strong className="hz-unauthorized-center__summary-value">{summary.pendingShell}</strong>
          <span className="hz-unauthorized-center__summary-hint">İskelet + API</span>
        </article>
        <article className="hz-unauthorized-center__summary-card">
          <span className="hz-unauthorized-center__summary-label">Risk</span>
          <strong className="hz-unauthorized-center__summary-value">{summary.riskNeedsApi}</strong>
          <span className="hz-unauthorized-center__summary-hint">API bekleyen</span>
        </article>
        <article className="hz-unauthorized-center__summary-card">
          <span className="hz-unauthorized-center__summary-label">Bugün</span>
          <strong className="hz-unauthorized-center__summary-value">{summary.todayLabel}</strong>
          <span className="hz-unauthorized-center__summary-hint">{summary.todayHint}</span>
        </article>
        <article className="hz-unauthorized-center__summary-card hz-unauthorized-center__summary-card--accent">
          <span className="hz-unauthorized-center__summary-label">Needs API</span>
          <strong className="hz-unauthorized-center__summary-value">{summary.needsApi}</strong>
          <span className="hz-unauthorized-center__summary-hint">{summary.ready} hazır</span>
        </article>
      </section>

      <div className="hz-unauthorized-center__grid">
        <section className="hz-unauthorized-center__card hz-unauthorized-center__main" aria-label="Erişim senaryoları">
          <div className="hz-unauthorized-center__card-head">
            <h2 className="hz-unauthorized-center__card-title">Erişim reddi matrisi</h2>
            <span className="hz-unauthorized-center__badge hz-unauthorized-center__badge--danger">
              Erişim yok
            </span>
          </div>
          <div className="hz-unauthorized-center__card-body">
            <p className="hz-unauthorized-center__alert-copy">
              Bu sayfaya erişim yetkiniz yok. Farklı bir hesap gerekiyorsa yöneticinizle iletişime geçin.
            </p>
            <div className="hz-unauthorized-center__filter-grid">
              <label className="hz-unauthorized-center__field">
                <span className="hz-unauthorized-center__field-label">Ara</span>
                <input
                  type="search"
                  className="hz-unauthorized-center__input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Senaryo veya modül..."
                />
              </label>
              <label className="hz-unauthorized-center__field">
                <span className="hz-unauthorized-center__field-label">Durum</span>
                <select
                  className="hz-unauthorized-center__select"
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
            <div className="hz-unauthorized-center__table" role="list">
              {filteredRows.map((row) => {
                const isSelected = row.id === effectiveSelectedId;
                const navHref = resolveRowHref(row);
                return (
                  <div
                    key={row.id}
                    role="listitem"
                    className={`hz-unauthorized-center__row${isSelected ? " hz-unauthorized-center__row--selected" : ""}`}
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
                    <span className="hz-unauthorized-center__row-title">{row.title}</span>
                    <span className="hz-unauthorized-center__row-entity">{row.relatedEntity}</span>
                    <span className={`hz-unauthorized-center__badge ${statusBadgeClass(row.status)}`}>
                      {row.statusLabel}
                    </span>
                    {navHref ? (
                      <Link href={navHref} className="hz-unauthorized-center__row-link">
                        Git
                      </Link>
                    ) : (
                      <span className="hz-unauthorized-center__badge hz-unauthorized-center__badge--muted">
                        —
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="hz-unauthorized-center__insight" aria-label="İçgörü">
          <article className="hz-unauthorized-center__card">
            <div className="hz-unauthorized-center__card-head">
              <h2 className="hz-unauthorized-center__card-title">Readiness matrisi</h2>
            </div>
            <div className="hz-unauthorized-center__card-body hz-unauthorized-center__scope-grid">
              {UNAUTHORIZED_READINESS_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="hz-unauthorized-center__scope-card">
                  <span className="hz-unauthorized-center__scope-label">{dim.label}</span>
                  <span
                    className={`hz-unauthorized-center__badge ${
                      dim.ready
                        ? "hz-unauthorized-center__badge--success"
                        : "hz-unauthorized-center__badge--needs-api"
                    }`}
                  >
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="hz-unauthorized-center__scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="hz-unauthorized-center__card hz-unauthorized-center__card--policy">
            <div className="hz-unauthorized-center__card-head">
              <h2 className="hz-unauthorized-center__card-title">No-fake policy</h2>
            </div>
            <p className="hz-unauthorized-center__card-body hz-unauthorized-center__policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma state&apos;i
              üretmez.
            </p>
          </article>
        </aside>

        <aside className="hz-unauthorized-center__side" aria-label="Seçili senaryo">
          {selected ? (
            <>
              <section className="hz-unauthorized-center__side-section">
                <h2 className="hz-unauthorized-center__card-title">{selected.title}</h2>
                <p className="hz-unauthorized-center__muted-line">{selected.description}</p>
                <div className="hz-unauthorized-center__side-meta">
                  <span className={`hz-unauthorized-center__badge ${statusBadgeClass(selected.status)}`}>
                    {selected.statusLabel}
                  </span>
                  <span className="hz-unauthorized-center__badge hz-unauthorized-center__badge--source-linked">
                    {selected.sourceRoute}
                  </span>
                </div>
              </section>
              <section className="hz-unauthorized-center__side-section">
                <h3 className="hz-unauthorized-center__side-heading">Kaynak gezinme</h3>
                <div className="hz-unauthorized-center__source-grid">
                  <Link href="/dashboard" className="hz-unauthorized-center__button-primary">
                    Gösterge paneline dön
                  </Link>
                  <Link href="/ayarlar" className="hz-unauthorized-center__button-secondary">
                    Ayarları aç
                  </Link>
                  {resolveRowHref(selected) ? (
                    <Link href={resolveRowHref(selected)!} className="hz-unauthorized-center__button-secondary">
                      İlgili ekran
                    </Link>
                  ) : null}
                </div>
              </section>
              <section className="hz-unauthorized-center__side-section">
                <h3 className="hz-unauthorized-center__side-heading">Güvenli aksiyonlar</h3>
                <div className="hz-unauthorized-center__action-stack">
                  <button type="button" className="hz-unauthorized-center__button-disabled" disabled>
                    Yeni Kayıt
                  </button>
                  <button type="button" className="hz-unauthorized-center__button-disabled" disabled>
                    Export Readiness
                  </button>
                  <button type="button" className="hz-unauthorized-center__button-disabled" disabled>
                    Audit İzle
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
