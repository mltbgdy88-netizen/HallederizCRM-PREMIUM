"use client";

import Link from "next/link";
import { useState } from "react";
import { resolveFabrikaSiparisDetayHref } from "@/lib/siparis-fulfillment-links";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { fsoStatusClass } from "@/features/fabrikalar/data/fabrikalar-siparis-operasyon-mock";
import { useFabrikalarSiparisReferenceData } from "@/features/fabrikalar/hooks/use-fabrikalar-siparis-reference-data";

function BtnIcon({ d }: { d: string }) {
  return (
    <svg className="fso-btn-icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function FabrikalarSiparisOperasyonPage() {
  const {
    data: {
      title: FSO_TITLE,
      subtitle: FSO_SUBTITLE,
      kpis: FSO_KPIS,
      filterSearch: FSO_FILTER_SEARCH,
      filters: FSO_FILTERS,
      statusChips: FSO_STATUS_CHIPS,
      tableRows: FSO_TABLE_ROWS,
      tableTotal: FSO_TABLE_TOTAL,
      pageNumbers: FSO_PAGE_NUMBERS,
      getContext: getFsoContext
    }
  } = useFabrikalarSiparisReferenceData();
  const [chip, setChip] = useState<string>("Tüm Durumlar");
  const [selectedId, setSelectedId] = useState("1");
  const ctx = getFsoContext();

  return (
    <div className="fso-home">
      <header className="fso-head">
        <div className="fso-head-text">
          <h1>{FSO_TITLE}</h1>
          <p>{FSO_SUBTITLE}</p>
        </div>
        <div className="fso-head-actions">
          <button type="button" className="fso-btn fso-btn--primary">
            <BtnIcon d="M12 5v14M5 12h14" />
            Yeni Sipariş
          </button>
          <button type="button" className="fso-btn fso-btn--outline">
            <BtnIcon d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
            Sipariş Aktar
          </button>
          <button type="button" className="fso-btn fso-btn--outline">
            <BtnIcon d="M12 3v12M8 11l4 4 4-4M5 21h14" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="fso-kpi-row" aria-label="Sipariş özetleri">
        {FSO_KPIS.map((kpi) => (
          <article key={kpi.id} className={`fso-kpi-card fso-kpi-card--${kpi.tone}`}>
            <div className={`fso-kpi-icon fso-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="fso-kpi-body">
              <span className="fso-kpi-value">{kpi.value}</span>
              <span className="fso-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="fso-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="fso-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="fso-workspace">
        <section className="fso-main">
          <div className="fso-filters">
            <label className="fso-filter-search">
              <IconSearch className="fso-filter-search-icon" />
              <input type="search" placeholder={FSO_FILTER_SEARCH} readOnly aria-label="Sipariş ara" />
            </label>
            {FSO_FILTERS.map((f) => (
              <label key={f.id} className="fso-filter-field">
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
            <button type="button" className="fso-filter-reset">
              <IconRefresh className="fso-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="fso-chips" role="tablist" aria-label="Durum filtreleri">
            {FSO_STATUS_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                className={chip === c ? "fso-chip fso-chip--active" : "fso-chip"}
                onClick={() => setChip(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="fso-table-panel">
            <div className="fso-table-wrap">
              <table className="fso-table">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Fabrika</th>
                    <th>Bağlı Satış</th>
                    <th>Durum</th>
                    <th>Oluşturma</th>
                    <th>Teslim</th>
                    <th>Tutar</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {FSO_TABLE_ROWS.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "fso-row fso-row--selected" : "fso-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="fso-cell-strong">{row.orderNo}</td>
                      <td>{row.factory}</td>
                      <td>{row.salesRef}</td>
                      <td>
                        <span className={`fso-badge${fsoStatusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.created}</td>
                      <td>{row.delivery}</td>
                      <td>{row.amount}</td>
                      <td className="fso-cell-actions" onClick={(event) => event.stopPropagation()}>
                        <Link href={resolveFabrikaSiparisDetayHref(row.factoryOrderId)}>Gör</Link>
                        {row.salesOrderId ? (
                          <Link href={`/siparisler/detay?orderId=${encodeURIComponent(row.salesOrderId)}`}>
                            Satış
                          </Link>
                        ) : null}
                        <button type="button">Düzenle</button>
                        <button type="button">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="fso-table-foot">
              <span>{FSO_TABLE_TOTAL}</span>
              <div className="fso-pagination">
                <label className="fso-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="fso-page-nums">
                  {FSO_PAGE_NUMBERS.map((p) => (
                    <button key={p} type="button" className={p === "1" ? "fso-page-btn fso-page-btn--active" : "fso-page-btn"}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="fso-context" aria-label="Fabrika sipariş senkronizasyonu">
          <header className="fso-context-head">
            <h2>Fabrika Sipariş Senkronizasyonu</h2>
            <span className="fso-badge fso-badge--green">{ctx.syncStatus}</span>
          </header>
          <p className="fso-sync-time">Son senkronizasyon: {ctx.lastSync}</p>
          <ul className="fso-sync-paths">
            {ctx.paths.map((p) => (
              <li key={p.id}>
                <span>{p.label}</span>
                <span className="fso-badge fso-badge--green">{p.status}</span>
              </li>
            ))}
          </ul>
          <dl className="fso-context-dl">
            {ctx.summary.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <footer className="fso-context-actions">
            <button type="button" className="fso-btn fso-btn--primary fso-btn--block">
              Senkronizasyonu Başlat
            </button>
            <button type="button" className="fso-btn fso-btn--outline fso-btn--block">
              Senkron Geçmişi
            </button>
            <button type="button" className="fso-btn fso-btn--outline fso-btn--block">
              Hata Kayıtlarını İncele
            </button>
            <button type="button" className="fso-btn fso-btn--outline fso-btn--block">
              Senkron Ayarları
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

