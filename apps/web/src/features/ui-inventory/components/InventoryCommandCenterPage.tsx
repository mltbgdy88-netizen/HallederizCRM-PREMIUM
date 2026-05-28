"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { EntityLayerNav } from "./EntityLayerNav";
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

function badgeClass(prefix: string, status: InventoryScopeStatus): string {
  if (status === "ready") return `${prefix}__badge--success`;
  if (status === "needs-api") return `${prefix}__badge--needs-api`;
  if (status === "shell") return `${prefix}__badge--warning`;
  if (status === "blocked") return `${prefix}__badge--disabled-not-allowed`;
  return `${prefix}__badge--muted`;
}

function mainBadgeClass(prefix: string, tone: "danger" | "info" | "warning"): string {
  if (tone === "danger") return `${prefix}__badge--danger`;
  if (tone === "warning") return `${prefix}__badge--warning`;
  return `${prefix}__badge--info`;
}

function resolveRowHref(row: InventoryScopeRow): string | null {
  if (row.navHref) return row.navHref;
  if (row.sourceRoute.startsWith("/")) return row.sourceRoute;
  return null;
}

export function InventoryCommandCenterPage({
  config,
  mainActions
}: {
  config: InventoryPageConfig;
  mainActions?: ReactNode;
}) {
  const p = config.prefix;
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
    <div className={`${p} hz-entity-layer-desk`} data-page={config.dataPage} role={config.role}>
      <header className={`${p}__intro`}>
        <div className={`${p}__title-row`}>
          <span className={`${p}__icon`} aria-hidden>
            <LucideIcon name={config.icon} size={20} />
          </span>
          <div>
            <h1 className={`${p}__page-title`}>{config.title}</h1>
            <p className={`${p}__page-sub`}>{config.subtitle}</p>
          </div>
        </div>
        {!config.navItems ? (
          <nav className={`${p}__actions`} aria-label="Hızlı gezinme">
            {DEFAULT_NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`${p}__button-gold`}>
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      {config.navItems && config.listNav ? (
        <EntityLayerNav
          items={config.navItems}
          activeHref={config.activeNavHref}
          listHref={config.listNav.href}
          listLabel={config.listNav.label}
        />
      ) : config.listNav ? (
        <nav className="hz-entity-layer-nav hz-entity-layer-nav--solo" aria-label="Liste bağlantısı">
          <Link href={config.listNav.href} className="hz-entity-layer-nav__back">
            {config.listNav.label}
          </Link>
        </nav>
      ) : null}

      <section className={`${p}__summary`} aria-label="Özet bant">
        <article className={`${p}__summary-card`}>
          <span className={`${p}__summary-label`}>Kapsam</span>
          <strong className={`${p}__summary-value`}>{summary.scopeTotal}</strong>
          <span className={`${p}__summary-hint`}>Contract</span>
        </article>
        <article className={`${p}__summary-card`}>
          <span className={`${p}__summary-label`}>Bekleyen</span>
          <strong className={`${p}__summary-value`}>{summary.pendingShell}</strong>
          <span className={`${p}__summary-hint`}>İskelet + API</span>
        </article>
        <article className={`${p}__summary-card`}>
          <span className={`${p}__summary-label`}>Risk</span>
          <strong className={`${p}__summary-value`}>{summary.riskNeedsApi}</strong>
          <span className={`${p}__summary-hint`}>API bekleyen</span>
        </article>
        <article className={`${p}__summary-card`}>
          <span className={`${p}__summary-label`}>Bugün</span>
          <strong className={`${p}__summary-value`}>{summary.todayLabel}</strong>
          <span className={`${p}__summary-hint`}>{summary.todayHint}</span>
        </article>
        <article className={`${p}__summary-card ${p}__summary-card--accent`}>
          <span className={`${p}__summary-label`}>Needs API</span>
          <strong className={`${p}__summary-value`}>{summary.needsApi}</strong>
          <span className={`${p}__summary-hint`}>{summary.ready} hazır</span>
        </article>
      </section>

      <div className={`${p}__grid`}>
        <section className={`${p}__card ${p}__main`} aria-label="Ana panel">
          <div className={`${p}__card-head`}>
            <h2 className={`${p}__card-title`}>Readiness matrisi</h2>
            {config.mainBadge ? (
              <span className={`${p}__badge ${mainBadgeClass(p, config.mainBadge.tone)}`}>
                {config.mainBadge.text}
              </span>
            ) : (
              <span className={`${p}__badge ${p}__badge--info`}>
                {dataSourceConfig.useDemoData ? "Önizleme modu" : "Canlı mod"}
              </span>
            )}
          </div>
          <div className={`${p}__card-body`}>
            {config.alertCopy ? <p className={`${p}__alert-copy`}>{config.alertCopy}</p> : null}
            {mainActions ? <div className={`${p}__main-actions`}>{mainActions}</div> : null}
            <div className={`${p}__filter-grid`}>
              <label className={`${p}__field`}>
                <span className={`${p}__field-label`}>Ara</span>
                <input
                  type="search"
                  className={`${p}__input`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Senaryo ara..."
                />
              </label>
              <label className={`${p}__field`}>
                <span className={`${p}__field-label`}>Durum</span>
                <select
                  className={`${p}__select`}
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
            <div className={`${p}__table`} role="list">
              {filteredRows.map((row) => {
                const isSelected = row.id === effectiveSelectedId;
                const navHref = resolveRowHref(row);
                return (
                  <div
                    key={row.id}
                    role="listitem"
                    className={`${p}__row${isSelected ? ` ${p}__row--selected` : ""}`}
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
                    <span className={`${p}__row-title`}>{row.title}</span>
                    <span className={`${p}__row-entity`}>{row.relatedEntity}</span>
                    <span className={`${p}__badge ${badgeClass(p, row.status)}`}>{row.statusLabel}</span>
                    {navHref ? (
                      <Link href={navHref} className={`${p}__row-link`}>
                        Aç
                      </Link>
                    ) : (
                      <span className={`${p}__badge ${p}__badge--muted`}>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={`${p}__insight`} aria-label="İçgörü">
          <article className={`${p}__card`}>
            <div className={`${p}__card-head`}>
              <h2 className={`${p}__card-title`}>Readiness</h2>
            </div>
            <div className={`${p}__card-body ${p}__scope-grid`}>
              {DEFAULT_READINESS.map((dim) => (
                <div key={dim.key} className={`${p}__scope-card`}>
                  <span className={`${p}__scope-label`}>{dim.label}</span>
                  <span
                    className={`${p}__badge ${
                      dim.ready ? `${p}__badge--success` : `${p}__badge--needs-api`
                    }`}
                  >
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className={`${p}__scope-hint`}>{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className={`${p}__card ${p}__card--policy`}>
            <div className={`${p}__card-head`}>
              <h2 className={`${p}__card-title`}>No-fake policy</h2>
            </div>
            <p className={`${p}__card-body ${p}__policy-copy`}>
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma state&apos;i
              üretmez.
            </p>
          </article>
        </aside>

        <aside className={`${p}__side`} aria-label="Seçili kapsam">
          {selected ? (
            <>
              <section className={`${p}__side-section`}>
                <h2 className={`${p}__card-title`}>{selected.title}</h2>
                <p className={`${p}__muted-line`}>{selected.description}</p>
                <div className={`${p}__side-meta`}>
                  <span className={`${p}__badge ${badgeClass(p, selected.status)}`}>
                    {selected.statusLabel}
                  </span>
                  <span className={`${p}__badge ${p}__badge--source-linked`}>{selected.sourceRoute}</span>
                </div>
              </section>
              <section className={`${p}__side-section`}>
                <h3 className={`${p}__side-heading`}>Güvenli aksiyonlar</h3>
                <div className={`${p}__action-stack`}>
                  <button type="button" className={`${p}__button-disabled`} disabled>
                    Export Readiness
                  </button>
                  <button type="button" className={`${p}__button-disabled`} disabled>
                    Audit İzle
                  </button>
                  <Link href="/dashboard" className={`${p}__button-secondary`}>
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
