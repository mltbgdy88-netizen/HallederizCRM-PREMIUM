"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, IconZap, KpiIcon } from "@/components/reference/icons";
import { useTekliflerReferenceData } from "@/features/teklifler/hooks/use-teklifler-reference-data";
import type { TeklifStatus, TeklifTableRow } from "@/features/teklifler/data/teklifler-operasyon-mock";

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

function statusClass(status: TeklifStatus): string {
  switch (status) {
    case "Açık":
      return " tom-badge--open";
    case "Onay Bekliyor":
      return " tom-badge--pending";
    case "Cevap Bekliyor":
      return " tom-badge--waiting";
    case "Reddedildi":
      return " tom-badge--rejected";
    default:
      return "";
  }
}

function teklifDetayHref(offerId: string): string {
  return `/teklifler/detay?offerId=${encodeURIComponent(offerId)}`;
}

function teklifKatmanHref(offerId: string): string {
  return `/teklifler/katman/ozet?offerId=${encodeURIComponent(offerId)}`;
}

export function TekliflerOperasyonPage() {
  const router = useRouter();
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
  } = useTekliflerReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const [demoVisible, setDemoVisible] = useState(true);
  const context = getContext(selectedId);

  return (
    <div className="tom-home">
      <header className="tom-head">
        <div className="tom-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="tom-head-actions">
          <button type="button" className="tom-btn tom-btn--primary">
            <IconPlus className="tom-btn-icon" />
            Yeni Teklif
          </button>
          <button type="button" className="tom-btn tom-btn--gold">
            <IconZap className="tom-btn-icon" />
            Hızlı Teklif
          </button>
          <button type="button" className="tom-btn tom-btn--gold">
            <IconExport className="tom-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="tom-kpi-row" aria-label="Teklif özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`tom-kpi-card tom-kpi-card--${kpi.tone}`}>
            <div className={`tom-kpi-icon tom-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="tom-kpi-body">
              <span className="tom-kpi-value">{kpi.value}</span>
              <span className="tom-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="tom-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="tom-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="tom-workspace">
        <section className="tom-main" aria-label="Teklif listesi">
          <div className="tom-filters">
            <label className="tom-filter-search">
              <IconSearch className="tom-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Teklif ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="tom-filter-field">
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
            <button type="button" className="tom-filter-reset">
              <IconRefresh className="tom-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {demoBanner && demoVisible ? (
            <div className="tom-demo-banner" role="status">
              <span>{demoBanner}</span>
              <button type="button" className="tom-demo-close" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
                <IconClose />
              </button>
            </div>
          ) : null}

          <div className="tom-table-panel">
            <div className="tom-table-wrap">
              <table className="tom-table">
                <thead>
                  <tr>
                    <th>Teklif No</th>
                    <th>Müşteri</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Geçerlilik</th>
                    <th>Takip</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <TeklifTableRowView
                      key={row.id}
                      row={row}
                      selected={selectedId === row.id}
                      onSelect={() => {
                        setSelectedId(row.id);
                        router.push(teklifDetayHref(row.id));
                      }}
                      detailHref={teklifDetayHref(row.id)}
                      layerHref={teklifKatmanHref(row.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="tom-table-foot">
              <span>{tableTotal}</span>
              <div className="tom-pagination">
                <label className="tom-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="tom-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "tom-page-btn tom-page-btn--active" : "tom-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="tom-context" aria-label="Teklif bağlamı">
          <header className="tom-context-head">
            <h2>
              <IconPin className="tom-context-pin" />
              Teklif Bağlamı
            </h2>
          </header>

          <div className="tom-context-hero">
            <div>
              <span className="tom-context-code">{context.offerNo}</span>
              <div className="tom-context-hero-meta">
                <span className={`tom-badge${statusClass(context.status)}`}>{context.status}</span>
                <span className="tom-context-date">Oluşturulma: {context.createdAt}</span>
              </div>
            </div>
          </div>

          <dl className="tom-context-dl">
            <div>
              <dt>Müşteri</dt>
              <dd>{context.customer}</dd>
            </div>
            <div>
              <dt>Yetkili</dt>
              <dd>{context.contact}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{context.phone}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{context.email}</dd>
            </div>
            <div>
              <dt>Tutar</dt>
              <dd>{context.amount}</dd>
            </div>
            <div>
              <dt>Geçerlilik</dt>
              <dd>{context.validity}</dd>
            </div>
          </dl>

          <section className="tom-context-section" aria-label="Uyarılar">
            <h3>Uyarılar</h3>
            <article className="tom-notice tom-notice--warn">
              <IconAlert className="tom-notice-icon" />
              <div>
                <strong>{context.validityAlertTitle}</strong>
                <p>{context.validityAlertDetail}</p>
              </div>
            </article>
            <article className="tom-notice tom-notice--info">
              <IconInfoSmall className="tom-notice-icon" />
              <div>
                <strong>{context.responseAlertTitle}</strong>
                <p>{context.responseAlertDetail}</p>
              </div>
            </article>
          </section>

          <article className="tom-context-card">
            <h4>Sonraki Adımlar</h4>
            <ul className="tom-steps">
              {context.nextSteps.map((step) => (
                <li key={step.id}>
                  <span className="tom-step-title">{step.title}</span>
                  <span className="tom-step-date">{step.date}</span>
                </li>
              ))}
            </ul>
          </article>

          <footer className="tom-context-actions">
            <button type="button" className="tom-btn tom-btn--primary tom-btn--block">
              <IconPlus className="tom-btn-icon" />
              Takip Ekle
            </button>
            <button type="button" className="tom-btn tom-btn--gold tom-btn--block">
              Müşteriye E-posta Gönder
            </button>
            <button type="button" className="tom-btn tom-btn--gold tom-btn--block">
              Teklifi Kopyala
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function TeklifTableRowView({
  row,
  selected,
  onSelect,
  detailHref,
  layerHref
}: {
  row: TeklifTableRow;
  selected: boolean;
  onSelect: () => void;
  detailHref: string;
  layerHref: string;
}) {
  return (
    <tr className={selected ? "tom-row tom-row--selected" : "tom-row"} onClick={onSelect}>
      <td className="tom-cell-offer">{row.offerNo}</td>
      <td>{row.customer}</td>
      <td className="tom-cell-amount">{row.amount}</td>
      <td>
        <span className={`tom-badge${statusClass(row.status)}`}>{row.status}</span>
      </td>
      <td>{row.validity}</td>
      <td>{row.followUp}</td>
      <td className="tom-cell-actions" onClick={(event) => event.stopPropagation()}>
        <Link href={detailHref}>Detay</Link>
        <Link href={layerHref}>Katman</Link>
        <button type="button">Düzenle</button>
      </td>
    </tr>
  );
}

