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
  if (status === "implemented") return "homef-badge--success";
  if (status === "needs-api") return "homef-badge--needs-api";
  if (status === "shell") return "homef-badge--warning";
  return "homef-badge--muted";
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

export function HomeReferenceLayout() {
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
    filteredRows.find((r) => r.id === selectedId) ?? filteredRows[0] ?? allRows[0] ?? null;
  const effectiveSelectedId = selected?.id ?? null;

  return (
    <div className="homef-page" data-page="home-reference">
      <header className="homef-intro">
        <div className="homef-title-row">
          <span className="homef-icon" aria-hidden>
            <LucideIcon name="home" size={20} />
          </span>
          <div>
            <h1 className="homef-page-title">Ana giriş / gösterge paneli yönlendirme</h1>
            <p className="homef-page-sub">
              Bu ekranı gerçek API sonuçları uydurmadan, operasyon ve hazırlık durumu sözleşmesi görünürlüğüyle yönetin.
            </p>
          </div>
        </div>
        <nav className="homef-actions" aria-label="Hızlı gezinme">
          {HOME_NAV_TARGETS.map((item) => (
            <Link key={item.href} href={item.href} className="homef-btn-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="homef-summary" aria-label="Özet bant">
        <article className="homef-summary-card">
          <span className="homef-summary-label">Kapsam</span>
          <strong className="homef-summary-value">{summary.scopeTotal}</strong>
          <span className="homef-summary-hint">Manifest rotası</span>
        </article>
        <article className="homef-summary-card">
          <span className="homef-summary-label">Bekleyen</span>
          <strong className="homef-summary-value">{summary.pendingShell}</strong>
          <span className="homef-summary-hint">İskelet + API</span>
        </article>
        <article className="homef-summary-card">
          <span className="homef-summary-label">Risk</span>
          <strong className="homef-summary-value">{summary.riskNeedsApi}</strong>
          <span className="homef-summary-hint">API bekleyen</span>
        </article>
        <article className="homef-summary-card">
          <span className="homef-summary-label">Bugün</span>
          <strong className="homef-summary-value">{summary.todayLabel}</strong>
          <span className="homef-summary-hint">{summary.todayHint}</span>
        </article>
        <article className="homef-summary-card homef-summary-card--accent">
          <span className="homef-summary-label">API bekleyen</span>
          <strong className="homef-summary-value">{summary.needsApi}</strong>
          <span className="homef-summary-hint">{summary.implemented} UI hazır</span>
        </article>
      </section>

      <div className="homef-grid">
        <section className="homef-card homef-main" aria-label="Rota kapsamı">
          <div className="homef-card-head">
            <h2 className="homef-card-title">Rota hazırlık durumu matrisi</h2>
            <span className="homef-badge homef-badge--info">
              {dataSourceConfig.useDemoData ? "Demo modu" : "Canlı mod"}
            </span>
          </div>
          <div className="homef-card-body">
            <div className="homef-filter-grid">
              <label className="homef-field">
                <span className="homef-field-label">Ara</span>
                <input
                  type="search"
                  className="homef-input"
                  placeholder="Rota, modül veya açıklama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="homef-field">
                <span className="homef-field-label">Grup</span>
                <select className="homef-select" value={group} onChange={(e) => setGroup(e.target.value as typeof group)}>
                  <option value="all">Tüm gruplar</option>
                  {MODULE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {MODULE_GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="homef-field">
                <span className="homef-field-label">Durum</span>
                <select
                  className="homef-select"
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
              <p className="homef-empty" role="status">
                Filtreye uyan route yok.
              </p>
            ) : (
              <>
                <div className="homef-table-head" aria-hidden>
                  <span>Rota</span>
                  <span>Modül</span>
                  <span>Durum</span>
                  <span>Hazırlık durumu</span>
                  <span />
                </div>
                {filteredRows.map((row) => {
                  const isSelected = row.id === effectiveSelectedId;
                  const navHref = resolveRowHref(row);
                  return (
                    <div
                      key={row.id}
                      className={`homef-row${isSelected ? " homef-row--selected" : ""}`}
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
                      <span className="homef-row-title">{row.title}</span>
                      <span className="homef-row-entity">{row.moduleGroup}</span>
                      <span className={`homef-badge ${statusBadgeClass(row.status)}`}>{row.statusLabel}</span>
                      <span className="homef-row-chips">
                        {row.readinessChips.slice(0, 2).map((chip) => (
                          <span key={chip} className="homef-badge homef-badge--route-readiness">
                            {chip}
                          </span>
                        ))}
                      </span>
                      {navHref ? (
                        <Link href={navHref} className="homef-row-link">
                          Aç
                        </Link>
                      ) : (
                        <span className="homef-badge homef-badge--disabled-not-configured">Nav yok</span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <aside className="homef-insight" aria-label="İçgörü paneli">
          <article className="homef-card">
            <div className="homef-card-head">
              <h2 className="homef-card-title">Hazırlık durumu matrisi</h2>
            </div>
            <div className="homef-card-body homef-scope-grid">
              {HOME_READINESS_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="homef-scope-card">
                  <span className="homef-scope-label">{dim.label}</span>
                  <span className={`homef-badge ${dim.ready ? "homef-badge--success" : "homef-badge--needs-api"}`}>
                    {dim.ready ? "Hazır" : "Bekleniyor"}
                  </span>
                  <p className="homef-scope-hint">{dim.hint}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="homef-card">
            <div className="homef-card-head">
              <h2 className="homef-card-title">Sahte veri yok ilkesi</h2>
            </div>
            <p className="homef-card-body homef-policy-copy">
              Bu ekran gerçek API sonucu olmadan canlı kayıt, başarı sonucu veya tamamlanma durumu üretmez.
            </p>
          </article>
        </aside>

        <aside className="homef-side" aria-label="Seçili kapsam">
          {selected ? (
            <>
              <section className="homef-side-section">
                <h2 className="homef-card-title">{selected.title}</h2>
                <p className="homef-muted-line">{selected.description}</p>
                <div className="homef-side-meta">
                  <span className={`homef-badge ${statusBadgeClass(selected.status)}`}>{selected.statusLabel}</span>
                  <span className="homef-badge homef-badge--source-linked">{selected.sourceRoute}</span>
                </div>
              </section>
              <section className="homef-side-section">
                <h3 className="homef-side-heading">Gelecek API sözleşmesi</h3>
                <dl className="homef-contract-list">
                  {[
                    ["tenantId", dataSourceConfig.tenantId],
                    ["sourceRoute", selected.sourceRoute],
                    ["status", selected.status]
                  ].map(([k, v]) => (
                    <div key={k} className="homef-contract-row">
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="homef-side-section">
                <h3 className="homef-side-heading">Kaynak gezinme</h3>
                <div className="homef-source-grid">
                  {resolveRowHref(selected) ? (
                    <Link href={resolveRowHref(selected)!} className="homef-btn-primary">
                      Rotayı aç
                    </Link>
                  ) : null}
                  <Link href="/dashboard" className="homef-btn-secondary">
                    Gösterge Paneli
                  </Link>
                </div>
              </section>
            </>
          ) : (
            <p className="homef-empty" role="status">
              Gösterilecek rota kaydı yok.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
