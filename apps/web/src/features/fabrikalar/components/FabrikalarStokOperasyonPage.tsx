"use client";

import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { fstIntegrationClass } from "@/features/fabrikalar/data/fabrikalar-stok-operasyon-mock";
import { useFabrikalarStokReferenceData } from "@/features/fabrikalar/hooks/use-fabrikalar-stok-reference-data";

function ProductThumb() {
  return (
    <span className="fst-thumb" aria-hidden>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    </span>
  );
}

export function FabrikalarStokOperasyonPage() {
  const {
    data: {
      title: FST_TITLE,
      subtitle: FST_SUBTITLE,
      kpis: FST_KPIS,
      warnBanner: FST_WARN_BANNER,
      filterSearch: FST_FILTER_SEARCH,
      filters: FST_FILTERS,
      tableRows: FST_TABLE_ROWS,
      tableTotal: FST_TABLE_TOTAL,
      pageNumbers: FST_PAGE_NUMBERS,
      context: FST_CONTEXT
    }
  } = useFabrikalarStokReferenceData();
  const [selectedId, setSelectedId] = useState("1");
  const ctx = FST_CONTEXT;

  return (
    <div className="fst-home">
      <header className="fst-head">
        <div className="fst-head-text">
          <h1>{FST_TITLE}</h1>
          <p>{FST_SUBTITLE}</p>
        </div>
        <div className="fst-head-actions">
          <button type="button" className="fst-btn fst-btn--primary">
            + Yeni Entegrasyon
          </button>
          <button type="button" className="fst-btn fst-btn--outline">
            Senkronizasyonu Başlat
          </button>
          <button type="button" className="fst-btn fst-btn--outline">
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="fst-kpi-row">
        {FST_KPIS.map((kpi) => (
          <article key={kpi.id} className={`fst-kpi-card fst-kpi-card--${kpi.tone}`}>
            <div className={`fst-kpi-icon fst-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="fst-kpi-body">
              <span className="fst-kpi-value">{kpi.value}</span>
              <span className="fst-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="fst-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="fst-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="fst-workspace">
        <section className="fst-main">
          <div className="fst-warn-banner" role="status">
            {FST_WARN_BANNER}
          </div>
          <div className="fst-filters">
            <label className="fst-filter-search">
              <IconSearch className="fst-filter-search-icon" />
              <input type="search" placeholder={FST_FILTER_SEARCH} readOnly aria-label="Ürün ara" />
            </label>
            {FST_FILTERS.map((f) => (
              <label key={f.id} className="fst-filter-field">
                <span>{f.label}</span>
                <select defaultValue="all" aria-label={f.label}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="fst-filter-reset">
              <IconRefresh className="fst-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="fst-table-panel">
            <div className="fst-table-wrap">
              <table className="fst-table">
                <thead>
                  <tr>
                    <th>Ürün Kodu</th>
                    <th>Fabrika Mevcut</th>
                    <th>Senkron</th>
                    <th>Entegrasyon</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {FST_TABLE_ROWS.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "fst-row fst-row--selected" : "fst-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="fst-cell-product">
                        <ProductThumb />
                        <div>
                          <span className="fst-product-code">{row.code}</span>
                          <span className="fst-product-name">{row.name}</span>
                        </div>
                      </td>
                      <td>{row.factoryQty}</td>
                      <td>
                        {row.syncQty} <span className="fst-sync-pct">{row.syncPct}</span>
                      </td>
                      <td>
                        <span className={`fst-badge${fstIntegrationClass(row.integration)}`}>{row.integration}</span>
                        <span className="fst-last-sync">{row.lastSync}</span>
                      </td>
                      <td className="fst-cell-actions">
                        <button type="button">Detay</button>
                        <button type="button">Senkron</button>
                        <button type="button">Eşleştir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="fst-table-foot">
              <span>{FST_TABLE_TOTAL}</span>
              <div className="fst-pagination">
                <label className="fst-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="fst-page-nums">
                  {FST_PAGE_NUMBERS.map((p) => (
                    <button key={p} type="button" className={p === "1" ? "fst-page-btn fst-page-btn--active" : "fst-page-btn"}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="fst-context" aria-label="Fabrika stok bağlamı">
          <h2>Fabrika Stok Bağlamı</h2>
          <div className="fst-context-hero">
            <strong>{ctx.factory}</strong>
            <span className="fst-badge fst-badge--ok">{ctx.status}</span>
          </div>
          <p className="fst-context-source">{ctx.source}</p>
          <dl className="fst-context-dl">
            <div>
              <dt>Son Senkron</dt>
              <dd>{ctx.lastSync}</dd>
            </div>
            <div>
              <dt>Sonraki Senkron</dt>
              <dd>{ctx.nextSync}</dd>
            </div>
          </dl>
          <button type="button" className="fst-btn fst-btn--outline fst-btn--block">
            Bağlantı Ayarları
          </button>
          <article className="fst-health-card">
            <h3>Entegrasyon Sağlığı</h3>
            <div className="fst-donut" aria-label={`%${ctx.healthPct} sağlıklı`}>
              <span>{ctx.healthPct}%</span>
              <small>Sağlıklı</small>
            </div>
            <ul className="fst-health-legend">
              {ctx.health.map((h) => (
                <li key={h.label}>
                  <span className={`fst-dot fst-dot--${h.tone}`} aria-hidden />
                  {h.label}: {h.value}
                </li>
              ))}
            </ul>
            <button type="button" className="fst-btn fst-btn--outline fst-btn--block">
              Detaylı Rapor
            </button>
          </article>
          <article className="fst-quick-card">
            <h3>Hızlı İşlemler</h3>
            {ctx.quickActions.map((a) => (
              <button key={a} type="button" className="fst-btn fst-btn--outline fst-btn--block">
                {a}
              </button>
            ))}
          </article>
          <p className="fst-info-note">{ctx.infoNote}</p>
        </aside>
      </div>
    </div>
  );
}

