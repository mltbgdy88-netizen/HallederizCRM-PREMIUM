"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { fatPaymentBadgeClass, fatStatusBadgeClass } from "@/features/faturalar/data/faturalar-operasyon-mock";
import { useFaturalarReferenceData } from "@/features/faturalar/hooks/use-faturalar-reference-data";

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

function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function FaturalarOperasyonPage() {
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
  } = useFaturalarReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  useEffect(() => {
    if (!tableRows.some((row) => row.id === selectedId)) {
      setSelectedId(tableRows[0]?.id ?? "1");
    }
  }, [tableRows, selectedId]);

  return (
    <div className="fat-home">
      <header className="fat-head">
        <div className="fat-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="fat-head-actions">
          <Link href="/faturalar/yeni" className="fat-btn fat-btn--primary">
            <IconPlus className="fat-btn-icon" />
            Yeni Fatura
          </Link>
          <button type="button" className="fat-btn fat-btn--outline" onClick={(e) => demoAction("Fatura Taslağı Oluştur", e)}>
            <IconDoc className="fat-btn-icon" />
            Fatura Taslağı Oluştur
          </button>
          <button type="button" className="fat-btn fat-btn--outline" onClick={(e) => demoAction("Dışa Aktar", e)}>
            <IconExport className="fat-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="fat-kpi-row" aria-label="Fatura özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`fat-kpi-card fat-kpi-card--${kpi.tone}`}>
            <div className={`fat-kpi-icon fat-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "gold" ? "orange" : kpi.tone} />
            </div>
            <div className="fat-kpi-body">
              <span className="fat-kpi-value">{kpi.value}</span>
              <span className="fat-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="fat-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="fat-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="fat-workspace">
        <section className="fat-main" aria-label="Fatura listesi">
          <div className="fat-filters">
            <label className="fat-filter-search">
              <IconSearch className="fat-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Fatura ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="fat-filter-field">
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
            <button type="button" className="fat-filter-reset">
              <IconRefresh className="fat-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="fat-table-panel">
            <div className="fat-table-wrap">
              <table className="fat-table">
                <thead>
                  <tr>
                    <th>Fatura No</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Ödeme</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "fat-row fat-row--selected" : "fat-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="fat-cell-invoice">
                        <span className="fat-cell-invoice-no">{row.invoiceNo}</span>
                        <span className="fat-cell-invoice-meta">{row.invoiceMeta}</span>
                      </td>
                      <td className="fat-cell-customer">{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span className={`fat-badge${fatStatusBadgeClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>
                        <span className={`fat-badge${fatPaymentBadgeClass(row.payment)}`}>{row.payment}</span>
                      </td>
                      <td className="fat-cell-actions">
                        <Link href={`/faturalar/detay?id=${encodeURIComponent(row.id)}`}>Görüntüle</Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            demoAction("Düzenle");
                          }}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          aria-label="Diğer işlemler"
                          onClick={(e) => {
                            e.stopPropagation();
                            demoAction("Diğer işlemler");
                          }}
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="fat-table-foot">
              <span>{tableTotal}</span>
              <div className="fat-pagination">
                <label className="fat-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="fat-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "fat-page-btn fat-page-btn--active" : "fat-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="fat-context" aria-label="Fatura bağlamı">
          <header className="fat-context-head">
            <h2>
              <IconPin className="fat-context-pin" />
              Fatura Bağlamı
            </h2>
          </header>

          <div className="fat-context-hero">
            <span className="fat-context-order">{context.invoiceNo}</span>
            <span className={`fat-badge${fatStatusBadgeClass(context.status)}`}>{context.status}</span>
            <span className="fat-context-time">{context.createdAt}</span>
          </div>

          <dl className="fat-context-dl">
            <div>
              <dt>Müşteri</dt>
              <dd>{context.customer}</dd>
            </div>
            <div>
              <dt>Cari Kod</dt>
              <dd>{context.accountCode}</dd>
            </div>
            <div>
              <dt>Tutar</dt>
              <dd>{context.amount}</dd>
            </div>
            <div>
              <dt>Para Birimi</dt>
              <dd>{context.currency}</dd>
            </div>
            <div>
              <dt>Vade Tarihi</dt>
              <dd>{context.dueDate}</dd>
            </div>
            <div>
              <dt>Ödeme Durumu</dt>
              <dd>
                <span className={`fat-badge${fatPaymentBadgeClass(context.payment)}`}>{context.payment}</span>
              </dd>
            </div>
          </dl>

          <article className="fat-context-card">
            <h4>Belge İşlemleri</h4>
            <ul className="fat-context-links">
              {context.docActions.map((action) => (
                <li key={action}>
                  <button type="button" onClick={(e) => demoAction(action, e)}>
                    {action}
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="fat-context-card">
            <h4>Ödeme İşlemleri</h4>
            <ul className="fat-context-links">
              {context.paymentActions.map((action) => (
                <li key={action}>
                  <button type="button" onClick={(e) => demoAction(action, e)}>
                    {action}
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <footer className="fat-context-actions">
            <button type="button" className="fat-btn fat-btn--primary fat-btn--block" onClick={(e) => demoAction("Tahsilat Talebi Oluştur", e)}>
              Tahsilat Talebi Oluştur
            </button>
            <button type="button" className="fat-btn fat-btn--outline fat-btn--block" onClick={(e) => demoAction("Hatırlatma Gönder", e)}>
              Hatırlatma Gönder
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
