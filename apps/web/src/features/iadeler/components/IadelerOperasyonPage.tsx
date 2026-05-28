"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { iadStatusBadgeClass } from "@/features/iadeler/data/iadeler-operasyon-mock";
import { useIadelerReferenceData } from "@/features/iadeler/hooks/use-iadeler-reference-data";

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

function IconSwap({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 16V4M7 4 3 8l4 4M17 8v12M17 20l4-4-4-4" />
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

export function IadelerOperasyonPage() {
  const demoAction = useCarilerDemoAction();
  const {
    title,
    subtitle,
    kpis,
    filterSearchPlaceholder,
    filters,
    tableRows,
    tableTotal,
    pageNumbers,
    getContext
  } = useIadelerReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  useEffect(() => {
    if (!tableRows.some((row) => row.id === selectedId)) {
      setSelectedId(tableRows[0]?.id ?? "1");
    }
  }, [tableRows, selectedId]);

  return (
    <div className="iad-home">
      <header className="iad-head">
        <div className="iad-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="iad-head-actions">
          <Link href="/iadeler/yeni" className="iad-btn iad-btn--primary">
            <IconPlus className="iad-btn-icon" />
            Yeni İade
          </Link>
          <button type="button" className="iad-btn iad-btn--outline" onClick={(e) => demoAction("İade Hareketi", e)}>
            <IconSwap className="iad-btn-icon" />
            İade Hareketi
          </button>
          <button type="button" className="iad-btn iad-btn--outline" onClick={(e) => demoAction("Dışa Aktar", e)}>
            <IconExport className="iad-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="iad-kpi-row" aria-label="İade özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`iad-kpi-card iad-kpi-card--${kpi.tone}`}>
            <div className={`iad-kpi-icon iad-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "red" ? "orange" : kpi.tone === "gold" ? "orange" : kpi.tone} />
            </div>
            <div className="iad-kpi-body">
              <span className="iad-kpi-value">{kpi.value}</span>
              <span className="iad-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="iad-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="iad-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="iad-workspace">
        <section className="iad-main" aria-label="İade listesi">
          <div className="iad-filters">
            <label className="iad-filter-search">
              <IconSearch className="iad-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="İade ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="iad-filter-field">
                <span>{filter.label}</span>
                <select defaultValue={filter.options[0]?.value ?? "all"} aria-label={filter.label}>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="iad-filter-reset">
              <IconRefresh className="iad-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="iad-table-panel">
            <div className="iad-table-wrap">
              <table className="iad-table">
                <thead>
                  <tr>
                    <th>İade No</th>
                    <th>Sipariş No</th>
                    <th>Cari</th>
                    <th>Tarih</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "iad-row iad-row--selected" : "iad-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="iad-cell-return">
                        <span className="iad-cell-return-no">{row.returnNo}</span>
                        <span className="iad-cell-return-meta">{row.returnMeta}</span>
                      </td>
                      <td>{row.orderNo}</td>
                      <td className="iad-cell-customer">{row.customer}</td>
                      <td>{row.date}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span className={`iad-badge${iadStatusBadgeClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="iad-cell-actions">
                        <Link href={`/iadeler/detay?id=${encodeURIComponent(row.id)}`}>Detay</Link>
                        {row.status === "Bekliyor" ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                demoAction("Onayla");
                              }}
                            >
                              Onayla
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                demoAction("Reddet");
                              }}
                            >
                              Reddet
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              demoAction("İşlemler");
                            }}
                          >
                            İşlemler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="iad-table-foot">
              <span>{tableTotal}</span>
              <div className="iad-pagination">
                <label className="iad-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="iad-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "iad-page-btn iad-page-btn--active" : "iad-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="iad-context" aria-label="İade bağlamı">
          <header className="iad-context-head">
            <h2>
              <IconPin className="iad-context-pin" />
              İade Bağlamı
            </h2>
          </header>

          <div className="iad-context-hero">
            <span className="iad-context-order">{context.returnNo}</span>
            <span className={`iad-badge${iadStatusBadgeClass(context.status)}`}>{context.status}</span>
            <span className="iad-context-time">{context.createdAt}</span>
          </div>

          <dl className="iad-context-dl">
            <div>
              <dt>Sipariş No</dt>
              <dd>{context.orderNo}</dd>
            </div>
            <div>
              <dt>Cari</dt>
              <dd>{context.customer}</dd>
            </div>
            <div>
              <dt>Yetkili</dt>
              <dd>{context.contact}</dd>
            </div>
            <div>
              <dt>Toplam Tutar</dt>
              <dd>{context.amount}</dd>
            </div>
            <div>
              <dt>İade Nedeni</dt>
              <dd>{context.reason}</dd>
            </div>
            <div className="iad-context-full">
              <dt>Açıklama</dt>
              <dd>{context.description}</dd>
            </div>
          </dl>

          <article className="iad-context-card">
            <h4>İade Etkisi</h4>
            <dl className="iad-context-dl iad-context-dl--compact">
              <div>
                <dt>Finansal Etki</dt>
                <dd>{context.financialImpact}</dd>
              </div>
              <div>
                <dt>Stok Etkisi</dt>
                <dd>{context.stockImpact}</dd>
              </div>
              <div>
                <dt>Net Etki</dt>
                <dd>{context.netImpact}</dd>
              </div>
            </dl>
          </article>

          <article className="iad-context-card">
            <h4>Ürün Özeti</h4>
            <dl className="iad-context-dl iad-context-dl--compact">
              {context.productSummary.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="iad-context-card">
            <h4>Onay Süreci</h4>
            <dl className="iad-context-dl iad-context-dl--compact">
              {context.approval.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <footer className="iad-context-actions">
            <button type="button" className="iad-btn iad-btn--primary iad-btn--block" onClick={(e) => demoAction("İadeyi Onayla", e)}>
              İadeyi Onayla
            </button>
            <button type="button" className="iad-btn iad-btn--warn iad-btn--block" onClick={(e) => demoAction("İade Talebini Reddet", e)}>
              İade Talebini Reddet
            </button>
            <button type="button" className="iad-btn iad-btn--outline iad-btn--block" onClick={(e) => demoAction("Not Ekle", e)}>
              Not Ekle
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

