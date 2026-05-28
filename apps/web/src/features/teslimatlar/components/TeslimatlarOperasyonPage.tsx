"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconInfo, IconRefresh, IconSearch, IconZap, KpiIcon } from "@/components/reference/icons";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import type { TeslimatStatus, TeslimatTableRow } from "@/features/teslimatlar/data/teslimatlar-operasyon-mock";
import { useTeslimatlarReferenceData } from "@/features/teslimatlar/hooks/use-teslimatlar-reference-data";

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

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function IconLabel({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    </svg>
  );
}

function statusClass(status: TeslimatStatus): string {
  switch (status) {
    case "Yolda":
      return " tsm-badge--onway";
    case "Planlanan":
      return " tsm-badge--planned";
    case "Tamamlandı":
      return " tsm-badge--done";
    case "Geciken":
      return " tsm-badge--delayed";
    default:
      return "";
  }
}

export function TeslimatlarOperasyonPage() {
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
  } = useTeslimatlarReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  useEffect(() => {
    if (!tableRows.some((row) => row.id === selectedId)) {
      setSelectedId(tableRows[0]?.id ?? "1");
    }
  }, [tableRows, selectedId]);

  return (
    <div className="tsm-home">
      <header className="tsm-head">
        <div className="tsm-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="tsm-head-actions">
          <Link href="/teslimatlar/yeni" className="tsm-btn tsm-btn--primary">
            <IconPlus className="tsm-btn-icon" />
            Yeni Teslim
          </Link>
          <button type="button" className="tsm-btn tsm-btn--gold" onClick={(e) => demoAction("Hızlı Teslim", e)}>
            <IconZap className="tsm-btn-icon" />
            Hızlı Teslim
          </button>
          <button type="button" className="tsm-btn tsm-btn--outline" onClick={(e) => demoAction("Dışa Aktar", e)}>
            <IconExport className="tsm-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="tsm-kpi-row" aria-label="Teslimat özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`tsm-kpi-card tsm-kpi-card--${kpi.tone}`}>
            <div className={`tsm-kpi-icon tsm-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="tsm-kpi-body">
              <span className="tsm-kpi-value">{kpi.value}</span>
              <span className="tsm-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="tsm-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="tsm-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="tsm-workspace">
        <section className="tsm-main" aria-label="Teslimat listesi">
          <div className="tsm-filters">
            <label className="tsm-filter-search">
              <IconSearch className="tsm-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Teslimat ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="tsm-filter-field">
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
            <button type="button" className="tsm-filter-reset">
              <IconRefresh className="tsm-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="tsm-table-panel">
            <div className="tsm-table-wrap">
              <table className="tsm-table">
                <thead>
                  <tr>
                    <th>Teslim No</th>
                    <th>Müşteri</th>
                    <th>Durum</th>
                    <th>Belge</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <TeslimatTableRowView
                      key={row.id}
                      row={row}
                      selected={selectedId === row.id}
                      onSelect={() => setSelectedId(row.id)}
                      onDemoAction={demoAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="tsm-table-foot">
              <span>{tableTotal}</span>
              <div className="tsm-pagination">
                <label className="tsm-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="tsm-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "tsm-page-btn tsm-page-btn--active" : "tsm-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="tsm-context" aria-label="Teslimat bağlamı">
          <header className="tsm-context-head">
            <h2>
              <IconPin className="tsm-context-pin" />
              Teslim Bağlamı
            </h2>
          </header>

          <div className="tsm-context-hero">
            <div>
              <span className="tsm-context-order">{context.deliveryNo}</span>
              <p className="tsm-context-customer">{context.customer}</p>
              <span className={`tsm-badge${statusClass(context.status)}`}>{context.status}</span>
            </div>
            <Link href={`/teslimatlar/detay?deliveryId=${encodeURIComponent(selectedId)}`} className="tsm-context-detail-btn">
              Detay
            </Link>
          </div>

          <dl className="tsm-context-dl">
            <div>
              <dt>Teslim Tarihi</dt>
              <dd>{context.deliveryDate}</dd>
            </div>
            <div>
              <dt>Planlanan Saat</dt>
              <dd>{context.plannedTime}</dd>
            </div>
            <div>
              <dt>Teslim Lokasyonu</dt>
              <dd>{context.location}</dd>
            </div>
            <div>
              <dt>Şoför</dt>
              <dd>{context.driver}</dd>
            </div>
            <div>
              <dt>Plaka</dt>
              <dd>{context.plate}</dd>
            </div>
            <div>
              <dt>Belge</dt>
              <dd>{context.documentId}</dd>
            </div>
          </dl>

          <article className="tsm-notice tsm-notice--warn">
            <IconAlert className="tsm-notice-icon" />
            <div>
              <p>{context.signatureWarning}</p>
              <p>{context.maintenanceWarning}</p>
            </div>
          </article>

          <article className="tsm-context-card">
            <h4>Teslimat Özeti</h4>
            <dl className="tsm-context-dl tsm-context-dl--compact">
              <div>
                <dt>Toplam Kalem</dt>
                <dd>{context.totalItems}</dd>
              </div>
              <div>
                <dt>Toplam Miktar</dt>
                <dd>{context.totalQuantity}</dd>
              </div>
              <div>
                <dt>Teslim Edilen</dt>
                <dd>{context.delivered}</dd>
              </div>
              <div>
                <dt>Kalan</dt>
                <dd>{context.remaining}</dd>
              </div>
              <div>
                <dt>Hasarlı</dt>
                <dd>{context.damaged}</dd>
              </div>
            </dl>
            <p className="tsm-context-note">{context.note}</p>
          </article>

          <footer className="tsm-context-actions">
            <button type="button" className="tsm-btn tsm-btn--primary tsm-btn--block" onClick={(e) => demoAction("Teslimatı Tamamla", e)}>
              Teslimatı Tamamla
            </button>
            <button type="button" className="tsm-btn tsm-btn--gold tsm-btn--block" onClick={(e) => demoAction("Belgeyi İndir", e)}>
              <IconDownload className="tsm-btn-icon" />
              Belgeyi İndir
            </button>
            <button type="button" className="tsm-btn tsm-btn--outline tsm-btn--block" onClick={(e) => demoAction("Etiket Yazdır", e)}>
              <IconLabel className="tsm-btn-icon" />
              Etiket Yazdır
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function TeslimatTableRowView({
  row,
  selected,
  onSelect,
  onDemoAction
}: {
  row: TeslimatTableRow;
  selected: boolean;
  onSelect: () => void;
  onDemoAction: (label: string, event?: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <tr className={selected ? "tsm-row tsm-row--selected" : "tsm-row"} onClick={onSelect}>
      <td className="tsm-cell-order">{row.deliveryNo}</td>
      <td className="tsm-cell-customer">{row.customer}</td>
      <td>
        <span className={`tsm-badge${statusClass(row.status)}`}>{row.status}</span>
      </td>
      <td>{row.document}</td>
      <td className="tsm-cell-actions">
        <Link href={`/teslimatlar/detay?deliveryId=${encodeURIComponent(row.id)}`}>Detay</Link>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDemoAction("Belge", e); }}>
          Belge
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDemoAction("Etiket", e); }}>
          Etiket
        </button>
      </td>
    </tr>
  );
}
