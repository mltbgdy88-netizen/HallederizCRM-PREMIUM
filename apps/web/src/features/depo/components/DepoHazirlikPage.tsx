"use client";

import Link from "next/link";
import { useState } from "react";
import { IconInfo, IconPlay, IconSearch, KpiIcon } from "@/components/reference/icons";
import { type DhmStatus, type DhmTableRow } from "@/features/depo/data/depo-hazirlik-mock";
import { useDepoReferenceData } from "@/features/depo/hooks/use-depo-reference-data";

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
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

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function depoDetayHref(warehouseOrderId: string): string {
  return `/depo/detay?warehouseOrderId=${encodeURIComponent(warehouseOrderId)}`;
}

function statusClass(status: DhmStatus): string {
  if (status === "Bekleyen") return " dhm-badge--wait";
  if (status === "Eksik") return " dhm-badge--miss";
  return " dhm-badge--ready";
}

export function DepoHazirlikPage() {
  const {
    data: {
      title: DHM_TITLE,
      subtitle: DHM_SUBTITLE,
      kpis: DHM_KPIS,
      tabs: DHM_TABS,
      filterSearch: DHM_FILTER_SEARCH,
      filters: DHM_FILTERS,
      tableRows: DHM_TABLE_ROWS,
      tableTotal: DHM_TABLE_TOTAL,
      pageNumbers: DHM_PAGE_NUMBERS,
      getContext: getDhmContext
    }
  } = useDepoReferenceData();
  const [selectedId, setSelectedId] = useState("1");
  const [activeTab, setActiveTab] = useState<(typeof DHM_TABS)[number]>("Bekleyenler");
  const context = getDhmContext(selectedId);

  return (
    <div className="dhm-home">
      <header className="dhm-head">
        <div className="dhm-head-text">
          <h1>{DHM_TITLE}</h1>
          <p>{DHM_SUBTITLE}</p>
        </div>
        <div className="dhm-head-actions">
          <button type="button" className="dhm-btn dhm-btn--primary">
            <IconPlus className="dhm-btn-icon" />
            Yeni Hazırlık
          </button>
          <button type="button" className="dhm-btn dhm-btn--outline">
            <IconExport className="dhm-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="dhm-kpi-row" aria-label="Depo hazırlık özetleri">
        {DHM_KPIS.map((kpi) => (
          <article key={kpi.id} className={`dhm-kpi-card dhm-kpi-card--${kpi.tone}`}>
            <div className={`dhm-kpi-icon dhm-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "red" ? "orange" : kpi.tone === "gold" ? "gold" : kpi.tone === "teal" ? "teal" : kpi.tone === "orange" ? "orange" : "green"} />
            </div>
            <div className="dhm-kpi-body">
              <span className="dhm-kpi-value">{kpi.value}</span>
              <span className="dhm-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="dhm-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="dhm-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="dhm-workspace">
        <section className="dhm-main" aria-label="Hazırlık listesi">
          <div className="dhm-tabs" role="tablist" aria-label="Liste sekmeleri">
            {DHM_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`dhm-tab${activeTab === tab ? " dhm-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="dhm-filters">
            <label className="dhm-filter-search">
              <IconSearch className="dhm-filter-search-icon" />
              <input type="search" placeholder={DHM_FILTER_SEARCH} readOnly aria-label="Ara" />
            </label>
            {DHM_FILTERS.map((filter) => (
              <label key={filter.id} className="dhm-filter-field">
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
            <button type="button" className="dhm-filter-reset">
              Temizle
            </button>
          </div>

          <div className="dhm-table-panel">
            <div className="dhm-table-wrap">
              <table className="dhm-table">
                <thead>
                  <tr>
                    <th>Belge No</th>
                    <th>Cari</th>
                    <th>Durum</th>
                    <th>Raf</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {DHM_TABLE_ROWS.map((row: DhmTableRow) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "dhm-row dhm-row--selected" : "dhm-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>
                        <span className="dhm-cell-code">{row.docNo}</span>
                        <span className="dhm-cell-sub">{row.docDate}</span>
                      </td>
                      <td>
                        <span className="dhm-cell-customer">{row.customer}</span>
                        <span className="dhm-cell-sub">{row.customerCode}</span>
                      </td>
                      <td>
                        <span className={`dhm-badge${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.shelf}</td>
                      <td className="dhm-cell-actions">
                        <Link href={depoDetayHref(row.id)} className="dhm-row-link">
                          Detay
                        </Link>
                        <button type="button" className="dhm-row-primary">
                          {row.primaryAction}
                        </button>
                        <button type="button" className="dhm-row-more" aria-label="Diğer işlemler">
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="dhm-table-foot">
              <span>{DHM_TABLE_TOTAL}</span>
              <div className="dhm-pagination">
                <label className="dhm-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="dhm-page-nums" aria-label="Sayfalama">
                  {DHM_PAGE_NUMBERS.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "dhm-page-btn dhm-page-btn--active" : "dhm-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="dhm-context" aria-label="Fiş bağlamı">
          <header className="dhm-context-head">
            <h2>
              <IconPin className="dhm-context-pin" />
              Fiş Bağlamı
            </h2>
            <button type="button" className="dhm-context-expand" aria-label="Paneli genişlet">
              <IconChevron />
            </button>
          </header>

          <div className="dhm-context-hero">
            <span className="dhm-context-code">{context.docNo}</span>
            <p className="dhm-context-meta">{context.docMeta}</p>
            <span className={`dhm-badge${statusClass(context.status)}`}>{context.status}</span>
          </div>

          <dl className="dhm-context-dl">
            <div>
              <dt>Cari</dt>
              <dd>
                {context.customer}
                <span className="dhm-context-sub">{context.customerCode}</span>
              </dd>
            </div>
            <div>
              <dt>Depo</dt>
              <dd>{context.warehouse}</dd>
            </div>
            <div>
              <dt>Sevkiyat Tarihi</dt>
              <dd>{context.shipDate}</dd>
            </div>
          </dl>

          <article className="dhm-context-card">
            <h4>Raf Bilgisi</h4>
            <p className="dhm-shelf-main">{context.shelf}</p>
            <p className="dhm-shelf-sub">{context.shelfZone}</p>
          </article>

          <article className="dhm-context-card">
            <h4>Raf Kapasitesi</h4>
            <div className="dhm-capacity-bar" aria-hidden>
              <span style={{ width: `${context.capacityPct}%` }} />
            </div>
            <p className="dhm-capacity-text">
              {context.capacityUsed}/{context.capacityMax} kullanıldı · {context.capacityMax - context.capacityUsed} boş (%{context.capacityPct})
            </p>
          </article>

          <footer className="dhm-context-actions">
            <button type="button" className="dhm-btn dhm-btn--primary dhm-btn--block">
              <IconPlay className="dhm-btn-icon" />
              Toplama Başlat
            </button>
            <Link href={depoDetayHref(selectedId)} className="dhm-btn dhm-btn--outline dhm-btn--block">
              Fiş Detayı
            </Link>
            <button type="button" className="dhm-btn dhm-btn--outline dhm-btn--block">
              Eksik Ürünleri Göster
            </button>
            <button type="button" className="dhm-btn dhm-btn--outline dhm-btn--block">
              Sevke Hazırla
            </button>
            <button type="button" className="dhm-btn dhm-btn--outline dhm-btn--block">
              Etiket Yazdır
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
