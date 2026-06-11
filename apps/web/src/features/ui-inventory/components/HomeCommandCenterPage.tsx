"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { getModuleGroupLabel, MODULE_GROUP_LABELS } from "../../../navigation/module-group-labels";
import type { ProductModuleGroup, RouteStatus } from "../../../navigation/product-route-types";
import {
  buildHomeScopeRows,
  computeHomeSummaryMetrics,
  HOME_NAV_TARGETS,
  HOME_READINESS_DIMENSIONS,
  type HomeScopeRow
} from "../utils/home-command-center-data";

const MODULE_GROUPS: ProductModuleGroup[] = [
  "Panel",
  "Omnichannel",
  "AI Operator",
  "Core CRM",
  "Operations",
  "Field & WMS",
  "Approvals",
  "Tasks",
  "Workflows",
  "Integrations",
  "Analytics",
  "Compliance",
  "Setup",
  "Settings"
];

const STATUS_FILTERS: Array<{ value: "all" | RouteStatus; label: string }> = [
  { value: "all", label: "Tüm durumlar" },
  { value: "implemented", label: "UI hazır" },
  { value: "shell", label: "İskelet" },
  { value: "needs-api", label: "API bekleniyor" },
  { value: "planned", label: "Planlandı" }
];

function statusBadgeClass(status: RouteStatus): string {
  if (status === "implemented") return "hz-root-center__badge--success";
  if (status === "needs-api") return "hz-root-center__badge--needs-api";
  if (status === "shell") return "hz-root-center__badge--warning";
  return "hz-root-center__badge--muted";
}

function resolveRowHref(row: HomeScopeRow): string | null {
  if (row.existingFeature?.startsWith("redirect:")) {
    return row.existingFeature.replace("redirect:", "");
  }
  if (row.existingFeature?.startsWith("link:")) {
    return row.existingFeature.replace("link:", "");
  }
  if (row.status === "implemented" || row.status === "shell") {
    return row.sourceRoute;
  }
  return null;
}

export function HomeCommandCenterPage() {
  const allRows = useMemo(() => buildHomeScopeRows(), []);
  const summary = useMemo(() => computeHomeSummaryMetrics(allRows), [allRows]);

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<"all" | ProductModuleGroup>("all");
  const [status, setStatus] = useState<"all" | RouteStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (group !== "all" && row.moduleGroup !== group) return false;
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.sourceRoute.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.moduleGroup.toLowerCase().includes(q)
      );
    });
  }, [allRows, group, search, status]);

  const selected =
    filteredRows.find((r) => r.id === selectedId) ??
    filteredRows[0] ??
    allRows[0] ??
    null;

  const effectiveSelectedId = selected?.id ?? null;

  return (
    <div className="hz-root-center" data-page="home-command-center">
      <header className="hz-root-center__intro">
        <div className="hz-root-center__title-row">
          <span className="hz-root-center__icon" aria-hidden>
            <LucideIcon name="home" size={20} />
          </span>
          <div>
            <h1 className="hz-root-center__page-title">Ana giriş / gösterge paneli yönlendirme</h1>
            <p className="hz-root-center__page-sub">
              Bu ekranı gerçek API sonuçları uydurmadan, operasyon ve hazırlık durumu sözleşmesi görünürlüğüyle
              yönetin.
            </p>
          </div>
        </div>
        <nav className="hz-root-center__actions" aria-label="Hızlı gezinme">
          {HOME_NAV_TARGETS.map((item) => (
            <Link key={item.href} href={item.href} className="hz-root-center__button-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="hz-root-center__summary" aria-label="Özet bant">
        <article className="hz-root-center__summary-card">
          <span className="hz-root-center__summary-label">Kapsam</span>
          <strong className="hz-root-center__summary-value">{summary.scopeTotal}</strong>
          <span className="hz-root-center__summary-hint">Manifest route</span>
        </article>
        <article className="hz-root-center__summary-card">
          <span className="hz-root-center__summary-label">Bekleyen</span>
          <strong className="hz-root-center__summary-value">{summary.pendingShell}</strong>
          <span className="hz-root-center__summary-hint">İskelet + API</span>
        </article>
        <article className="hz-root-center__summary-card">
          <span className="hz-root-center__summary-label">Risk</span>
          <strong className="hz-root-center__summary-value">{summary.riskNeedsApi}</strong>
          <span className="hz-root-center__summary-hint">API bekleyen</span>
        </article>
        <article className="hz-root-center__summary-card">
          <span className="hz-root-center__summary-label">Bugün</span>
          <strong className="hz-root-center__summary-value">{summary.todayLabel}</strong>
          <span className="hz-root-center__summary-hint">{summary.todayHint}</span>
        </article>
        <article className="hz-root-center__summary-card hz-root-center__summary-card--accent">
          <span className="hz-root-center__summary-label">API bekleyen</span>
          <strong className="hz-root-center__summary-value">{summary.needsApi}</strong>
          <span className="hz-root-center__summary-hint">{summary.implemented} UI hazır</span>
        </article>
      </section>

      <div className="hz-root-center__grid">
        <section className="hz-root-center__card hz-root-center__main" aria-label="Rota kapsamı">
          <div className="hz-root-center__card-head">
            <h2 className="hz-root-center__card-title">Rota hazırlık durumu matrisi</h2>
            <span className="hz-root-center__badge hz-root-center__badge--info">
              {dataSourceConfig.useDemoData ? "Demo modu" : "Canlı mod"}
            </span>
          </div>
          <div className="hz-root-center__card-body">
            <div className="hz-root-center__filter-grid">
              <label className="hz-root-center__field">
                <span className="hz-root-center__field-label">Ara</span>
                <input
                  type="search"
                  className="hz-root-center__input"
                  placeholder="Rota, modül veya açıklama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="hz-root-center__field">
                <span className="hz-root-center__field-label">Grup</span>
                <select
                  className="hz-root-center__select"
                  value={group}
                  onChange={(e) => setGroup(e.target.value as typeof group)}
                >
                  <option value="all">Tüm gruplar</option>
                  {MODULE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {MODULE_GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="hz-root-center__field">
                <span className="hz-root-center__field-label">Durum</span>
                <select
                  className="hz-root-center__select"
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
              <p className="hz-root-center__empty" role="status">
                Filtreye uyan rota yok. Arama veya durum filtresini gevşetin.
              </p>
            ) : (
              <div className="hz-root-center__table" role="list">
                <div className="hz-root-center__table-head" aria-hidden>
                  <span>Rota</span>
                  <span>Modül</span>
                  <span>Durum</span>
                  <span>Hazırlık durumu</span>
                </div>
                {filteredRows.map((row) => {
                  const isSelected = row.id === effectiveSelectedId;
                  const navHref = resolveRowHref(row);
                  return (
                    <div
                      key={row.id}
                      role="listitem"
                      className={`hz-root-center__row${isSelected ? " hz-root-center__row--selected" : ""}`}
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
                      <span className="hz-root-center__row-title">{row.title}</span>
                      <span className="hz-root-center__row-entity">{getModuleGroupLabel(row.moduleGroup)}</span>
                      <span className={`hz-root-center__badge ${statusBadgeClass(row.status)}`}>
                        {row.statusLabel}
                      </span>
                      <span className="hz-root-center__row-chips">
                        {row.readinessChips.slice(0, 2).map((chip) => (
                          <span key={chip} className="hz-root-center__badge hz-root-center__badge--route-readiness">
                            {chip}
                          </span>
                        ))}
                      </span>
                      {navHref ? (
                        <Link href={navHref} className="hz-root-center__row-link">
                          Aç
                        </Link>
                      ) : (
                        <span className="hz-root-center__badge hz-root-center__badge--disabled-not-configured">
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

        <aside className="hz-root-center__insight" aria-label="İçgörü paneli">
          <article className="hz-root-center__card">
            <div className="hz-root-center__card-head">
              <h2 className="hz-root-center__card-title">Hazırlık durumu matrisi</h2>
            </div>
            <div className="hz-root-center__card-body hz-root-center__scope-grid">
              {HOME_READINESS_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="hz-root-center__scope-card">
                  <span className="hz-root-center__scope-label">{dim.label}</span>
                  <span
                    className={`hz-root-center__badge ${
                      dim.ready ? "hz-root-center__badge--success" : "hz-root-center__badge--needs-api"
                    }`}
                  >
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="hz-root-center__scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="hz-root-center__card">
            <div className="hz-root-center__card-head">
              <h2 className="hz-root-center__card-title">Kapsam özeti</h2>
            </div>
            <div className="hz-root-center__card-body">
              <p className="hz-root-center__muted-line">
                Manifest kaynağı: <code>product-route-manifest.ts</code>
              </p>
              <p className="hz-root-center__muted-line">
                Filtrelenen: <strong>{filteredRows.length}</strong> / {allRows.length} rota
              </p>
            </div>
          </article>

          <article className="hz-root-center__card hz-root-center__card--policy">
            <div className="hz-root-center__card-head">
              <h2 className="hz-root-center__card-title">Sahte veri yok ilkesi</h2>
            </div>
            <p className="hz-root-center__card-body hz-root-center__policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma durumu
              üretmez.
            </p>
          </article>
        </aside>

        <aside className="hz-root-center__side" aria-label="Seçili kapsam">
          {selected ? (
            <>
              <section className="hz-root-center__side-section">
                <h2 className="hz-root-center__card-title">{selected.title}</h2>
                <p className="hz-root-center__muted-line">{selected.description}</p>
                <div className="hz-root-center__side-meta">
                  <span className={`hz-root-center__badge ${statusBadgeClass(selected.status)}`}>
                    {selected.statusLabel}
                  </span>
                  <span className="hz-root-center__badge hz-root-center__badge--source-linked">
                    {selected.sourceRoute}
                  </span>
                </div>
              </section>

              <section className="hz-root-center__side-section">
                <h3 className="hz-root-center__side-heading">Gelecek API sözleşmesi</h3>
                <dl className="hz-root-center__contract-list">
                  {[
                    ["tenantId", dataSourceConfig.tenantId],
                    ["sourceRoute", selected.sourceRoute],
                    ["status", selected.status],
                    ["entityId", "—"],
                    ["relatedCustomerId", "—"],
                    ["relatedOrderId", "—"],
                    ["relatedApprovalId", "—"],
                    ["exportPdfStatus", "devre dışı"],
                    ["exportExcelStatus", "devre dışı"]
                  ].map(([k, v]) => (
                    <div key={k} className="hz-root-center__contract-row">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="hz-root-center__side-section">
                <h3 className="hz-root-center__side-heading">Kaynak gezinme</h3>
                <div className="hz-root-center__source-grid">
                  {resolveRowHref(selected) ? (
                    <Link href={resolveRowHref(selected)!} className="hz-root-center__button-primary">
                      Rotayı aç
                    </Link>
                  ) : (
                    <span className="hz-root-center__badge hz-root-center__badge--disabled-not-configured">
                      Navigasyon henüz tanımlı değil
                    </span>
                  )}
                  <Link href="/dashboard" className="hz-root-center__button-secondary">
                    Gösterge Paneli
                  </Link>
                </div>
              </section>

              <section className="hz-root-center__side-section">
                <h3 className="hz-root-center__side-heading">Güvenli aksiyonlar</h3>
                <div className="hz-root-center__action-stack">
                  <button
                    type="button"
                    className="hz-root-center__button-disabled"
                    disabled
                    title="API bağlanmadan yeni kayıt oluşturulamaz"
                    aria-label="Yeni kayıt — API bekleniyor"
                  >
                    Yeni Kayıt
                  </button>
                  {resolveRowHref(selected) ? (
                    <Link href={resolveRowHref(selected)!} className="hz-root-center__button-secondary">
                      Detay Aç
                    </Link>
                  ) : (
                    <button type="button" className="hz-root-center__button-disabled" disabled>
                      Detay Aç
                    </button>
                  )}
                  <button type="button" className="hz-root-center__button-disabled" disabled title="Export API yok">
                    Hazırlık durumunu dışa aktar
                  </button>
                  <button type="button" className="hz-root-center__button-disabled" disabled title="Denetim izi API yok">
                    Denetim izini izle
                  </button>
                </div>
              </section>
            </>
          ) : (
            <p className="hz-root-center__empty" role="status">
              Gösterilecek rota kaydı yok.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
