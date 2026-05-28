"use client";

import Link from "next/link";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { useStokReferenceData } from "@/features/stok/hooks/use-stok-reference-data";
import type { StokTableRow } from "@/features/stok/data/stok-operasyon-mock";

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconMove({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
    </svg>
  );
}

function IconExport({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 17v5M8 3h8l-1 7h2l-3 7-3-7h2L8 3z" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
    </svg>
  );
}

function IconInfoSmall({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

function ProductThumb() {
  return (
    <span className="som-thumb" aria-hidden>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    </span>
  );
}

function statusClass(status: StokTableRow["status"]): string {
  return status === "Kritik" ? " som-badge--warn" : " som-badge--ok";
}

export function StokOperasyonPage() {
  const {
    title,
    subtitle,
    kpis,
    filterSearchPlaceholder,
    filters,
    demoBanner,
    tableRows,
    tableTotal,
    pageNumbers,
    getContext
  } = useStokReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const [demoVisible, setDemoVisible] = useState(true);
  const context = getContext(selectedId);

  return (
    <div className="som-home">
      <header className="som-head">
        <div className="som-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="som-head-actions">
          <button type="button" className="som-btn som-btn--primary">
            <IconPlus className="som-btn-icon" />
            Yeni Ürün
          </button>
          <button type="button" className="som-btn som-btn--outline">
            <IconMove className="som-btn-icon" />
            Stok Hareketi
          </button>
          <button type="button" className="som-btn som-btn--outline">
            <IconExport className="som-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="som-kpi-row" aria-label="Stok özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`som-kpi-card som-kpi-card--${kpi.tone}`}>
            <div className={`som-kpi-icon som-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="som-kpi-body">
              <span className="som-kpi-value">{kpi.value}</span>
              <span className="som-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="som-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="som-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="som-workspace">
        <section className="som-main" aria-label="Stok listesi">
          <div className="som-filters">
            <label className="som-filter-search">
              <IconSearch className="som-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Ürün ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="som-filter-field">
                <span>{filter.label}</span>
                <select defaultValue="all" aria-label={filter.label}>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="som-filter-reset">
              <IconRefresh className="som-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {demoBanner && demoVisible ? (
            <div className="som-demo-banner" role="status">
              <span>{demoBanner}</span>
              <button type="button" className="som-demo-close" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
                <IconClose />
              </button>
            </div>
          ) : null}

          <div className="som-table-panel">
            <div className="som-table-wrap">
              <table className="som-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Merkez Stok</th>
                    <th>Fabrika Stok</th>
                    <th>Depo Raf</th>
                    <th>Fiyat</th>
                    <th>Durum</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "som-row som-row--selected" : "som-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="som-cell-product">
                        <ProductThumb />
                        <div>
                          <span className="som-product-code">{row.code}</span>
                          <span className="som-product-name">{row.name}</span>
                        </div>
                      </td>
                      <td>{row.centerStock}</td>
                      <td>{row.factoryStock}</td>
                      <td>
                        <span className="som-depot-main">{row.depotRaf}</span>
                        <span className="som-depot-sub">/ {row.depotRafSub}</span>
                      </td>
                      <td>{row.price}</td>
                      <td>
                        <span className={`som-badge${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="som-cell-actions">
                        <button type="button">Detay</button>
                        <button type="button">Stok</button>
                        <button type="button">Etiket</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="som-table-foot">
              <span>{tableTotal}</span>
              <div className="som-pagination">
                <label className="som-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="som-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "som-page-btn som-page-btn--active" : "som-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="som-context" aria-label="Stok bağlamı">
          <header className="som-context-head">
            <h2>
              <IconPin className="som-context-pin" />
              Stok Bağlamı
            </h2>
          </header>

          <div className="som-context-hero">
            <ProductThumb />
            <div>
              <span className="som-context-code">{context.code}</span>
              <h3>{context.name}</h3>
              <span className={`som-badge${statusClass(context.status)}`}>{context.status}</span>
            </div>
          </div>

          <dl className="som-context-dl">
            <div>
              <dt>Barkod</dt>
              <dd>{context.barcode}</dd>
            </div>
            <div>
              <dt>Marka</dt>
              <dd>{context.brand}</dd>
            </div>
            <div>
              <dt>Kategori</dt>
              <dd>{context.category}</dd>
            </div>
            <div>
              <dt>Fiyat</dt>
              <dd>{context.price}</dd>
            </div>
            <div>
              <dt>Fiyat Grubu</dt>
              <dd>{context.priceGroup}</dd>
            </div>
            <div>
              <dt>Birim</dt>
              <dd>{context.unit}</dd>
            </div>
          </dl>

          <article className="som-notice som-notice--warn">
            <IconAlert className="som-notice-icon" />
            <div>
              <strong>{context.factoryAlertTitle}</strong>
              <p>{context.factoryAlertDetail}</p>
            </div>
          </article>

          <article className="som-notice som-notice--info">
            <IconInfoSmall className="som-notice-icon" />
            <div>
              <strong>{context.depotAlertTitle}</strong>
              <p>{context.depotAlertDetail}</p>
            </div>
          </article>

          <article className="som-context-card">
            <h4>Stok Özeti</h4>
            <dl className="som-context-dl som-context-dl--compact">
              {context.summary.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="som-context-card">
            <h4>Depo Raf Bilgileri</h4>
            <dl className="som-context-dl som-context-dl--compact">
              {context.depotInfo.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="som-capacity">
              <div className="som-capacity-bar" aria-label={`Kapasite %${context.capacityPct}`}>
                <span style={{ width: `${context.capacityPct}%` }} />
              </div>
              <p className="som-capacity-label">
                {context.capacityCurrent} / {context.capacityMax} %{context.capacityPct}
              </p>
            </div>
          </article>

          <footer className="som-context-actions">
            <Link href="/depo" className="som-btn som-btn--outline som-btn--block">
              Depo Hazırlık
            </Link>
            <Link href="/fabrikalar/stok" className="som-btn som-btn--outline som-btn--block">
              Fabrika Stok
            </Link>
            <button type="button" className="som-btn som-btn--primary som-btn--block">
              <IconPlus className="som-btn-icon" />
              Stok Hareketi Oluştur
            </button>
            <button type="button" className="som-btn som-btn--outline som-btn--block">
              Transfer Talebi Oluştur
            </button>
            <button type="button" className="som-btn som-btn--outline som-btn--block">
              Etiket Yazdır
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

