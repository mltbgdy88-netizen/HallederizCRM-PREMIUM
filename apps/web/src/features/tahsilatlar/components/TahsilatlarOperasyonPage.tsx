"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, IconZap, KpiIcon } from "@/components/reference/icons";
import { useTahsilatlarReferenceData } from "@/features/tahsilatlar/hooks/use-tahsilatlar-reference-data";
import type { TahsilatStatus, TahsilatTableRow } from "@/features/tahsilatlar/data/tahsilatlar-operasyon-mock";

type TahsilatlarOperasyonPageProps = {
  backdrop?: boolean;
};

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

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
    </svg>
  );
}

function IconView({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function IconPrint({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function statusClass(status: TahsilatStatus): string {
  switch (status) {
    case "Tahsil Edildi":
      return " thm-badge--collected";
    case "Beklemede":
      return " thm-badge--pending";
    case "Vadesi Geçti":
      return " thm-badge--overdue";
    default:
      return "";
  }
}

function tahsilatDetayHref(paymentId: string): string {
  return `/tahsilatlar/detay?paymentId=${encodeURIComponent(paymentId)}`;
}

export function TahsilatlarOperasyonPage({ backdrop = false }: TahsilatlarOperasyonPageProps) {
  const router = useRouter();
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
  } = useTahsilatlarReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  return (
    <div className={backdrop ? "thm-home thm-home--backdrop" : "thm-home"}>
      <header className="thm-head">
        <div className="thm-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="thm-head-actions">
          <Link href="/tahsilatlar/yeni" className="thm-btn thm-btn--primary">
            <IconPlus className="thm-btn-icon" />
            Yeni Tahsilat
          </Link>
          <button type="button" className="thm-btn thm-btn--gold">
            <IconZap className="thm-btn-icon" />
            Hızlı Tahsilat
          </button>
          <button type="button" className="thm-btn thm-btn--gold">
            <IconExport className="thm-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="thm-kpi-row" aria-label="Tahsilat özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`thm-kpi-card thm-kpi-card--${kpi.tone}`}>
            <div className={`thm-kpi-icon thm-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "gold" ? "orange" : kpi.tone} />
            </div>
            <div className="thm-kpi-body">
              <span className="thm-kpi-value">{kpi.value}</span>
              <span className="thm-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="thm-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="thm-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="thm-workspace">
        <section className="thm-main" aria-label="Tahsilat listesi">
          <div className="thm-filters">
            <label className="thm-filter-search">
              <IconSearch className="thm-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Tahsilat ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="thm-filter-field">
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
            <button type="button" className="thm-filter-reset">
              <IconRefresh className="thm-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="thm-table-panel">
            <div className="thm-table-wrap">
              <table className="thm-table">
                <thead>
                  <tr>
                    <th>Makbuz No</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <TahsilatTableRowView
                      key={row.id}
                      row={row}
                      selected={selectedId === row.id}
                      onSelect={() => {
                        setSelectedId(row.id);
                        router.push(tahsilatDetayHref(row.id));
                      }}
                      detailHref={tahsilatDetayHref(row.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="thm-table-foot">
              <span>{tableTotal}</span>
              <div className="thm-pagination">
                <label className="thm-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="thm-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "thm-page-btn thm-page-btn--active" : "thm-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="thm-context" aria-label="Tahsilat bağlamı">
          <header className="thm-context-head">
            <h2>
              <IconPin className="thm-context-pin" />
              Tahsilat Bağlamı
            </h2>
          </header>

          <div className="thm-context-hero">
            <div>
              <span className="thm-context-code">{context.customerCode}</span>
              <h3>{context.customerName}</h3>
            </div>
            <Link href={tahsilatDetayHref(selectedId)} className="thm-context-detail-btn">
              Detay
            </Link>
          </div>

          <dl className="thm-context-dl thm-context-dl--finance">
            <div>
              <dt>Açık Bakiye</dt>
              <dd>{context.openBalance}</dd>
            </div>
            <div>
              <dt>Tahsil Edilen</dt>
              <dd>{context.collected}</dd>
            </div>
            <div>
              <dt>Kalan</dt>
              <dd>{context.remaining}</dd>
            </div>
            <div>
              <dt>Vadesi Geçen</dt>
              <dd>{context.overdue}</dd>
            </div>
          </dl>

          <article className="thm-notice thm-notice--warn">
            <IconAlert className="thm-notice-icon" />
            <div>
              <p>{context.overdueInvoiceAlert}</p>
              <button type="button" className="thm-notice-action">
                Hatırlat Gönder
              </button>
            </div>
          </article>

          <article className="thm-context-card">
            <h4>Tahsilat Dağılımı</h4>
            <dl className="thm-dist-grid">
              {context.distribution.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
              <div>
                <dt>Ödeme Yöntemi</dt>
                <dd>{context.paymentMethod}</dd>
              </div>
              <div>
                <dt>Tahsilat Türü</dt>
                <dd>{context.collectionType}</dd>
              </div>
              <div>
                <dt>Açıklama</dt>
                <dd>{context.description}</dd>
              </div>
            </dl>
          </article>

          <footer className="thm-context-actions">
            <button type="button" className="thm-btn thm-btn--primary thm-btn--block">
              <IconCheck className="thm-btn-icon" />
              Makbuza Onayla
            </button>
            <button type="button" className="thm-btn thm-btn--gold thm-btn--block">
              <IconPrint className="thm-btn-icon" />
              Makbuz Taslağı Oluştur
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function TahsilatTableRowView({
  row,
  selected,
  onSelect,
  detailHref
}: {
  row: TahsilatTableRow;
  selected: boolean;
  onSelect: () => void;
  detailHref: string;
}) {
  return (
    <tr className={selected ? "thm-row thm-row--selected" : "thm-row"} onClick={onSelect}>
      <td className="thm-cell-receipt">{row.receiptNo}</td>
      <td className="thm-cell-customer">{row.customer}</td>
      <td className="thm-cell-amount">{row.amount}</td>
      <td>
        <span className={`thm-badge${statusClass(row.status)}`}>{row.status}</span>
      </td>
      <td>{row.date}</td>
      <td className="thm-cell-actions" onClick={(event) => event.stopPropagation()}>
        <Link href={detailHref}>
          <IconView className="thm-action-icon" />
          Görüntüle
        </Link>
        <button type="button">
          <IconPrint className="thm-action-icon" />
          Yazdır
        </button>
      </td>
    </tr>
  );
}

