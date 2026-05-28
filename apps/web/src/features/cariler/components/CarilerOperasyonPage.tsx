"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, IconZap, KpiIcon } from "@/components/reference/icons";
import { useCarilerReferenceData } from "@/features/cariler/hooks/use-cariler-reference-data";
import type { CarilerRisk, CarilerTableRow } from "@/features/cariler/data/cariler-operasyon-mock";

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

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function riskClass(risk: CarilerRisk): string {
  if (risk === "Yüksek") return " com-badge--high";
  if (risk === "Orta") return " com-badge--mid";
  return " com-badge--low";
}

function QuickActionIcon({ id }: { id: string }) {
  const cls = "com-quick-icon";
  if (id === "collection") {
    return (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (id === "payment") {
    return (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  }
  if (id === "statement") {
    return (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  }
  if (id === "open-items") {
    return (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    );
  }
  return (
    <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function cariDetayHref(customerId: string): string {
  return `/cariler/detay?customerId=${encodeURIComponent(customerId)}`;
}

export function CarilerOperasyonPage() {
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
  } = useCarilerReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const [demoVisible, setDemoVisible] = useState(true);
  const context = getContext(selectedId);

  return (
    <div className="com-home">
      <header className="com-head">
        <div className="com-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="com-head-actions">
          <a href="/cariler/yeni" className="com-btn com-btn--primary">
            <IconPlus className="com-btn-icon" />
            Yeni Cari
          </a>
          <button type="button" className="com-btn com-btn--outline">
            <IconZap className="com-btn-icon" />
            Hızlı İşlem
          </button>
          <button type="button" className="com-btn com-btn--outline">
            <IconExport className="com-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="com-kpi-row" aria-label="Cari özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`com-kpi-card com-kpi-card--${kpi.tone}`}>
            <div className={`com-kpi-icon com-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "red" ? "orange" : kpi.tone} />
            </div>
            <div className="com-kpi-body">
              <span className="com-kpi-value">{kpi.value}</span>
              <span className="com-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="com-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="com-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="com-workspace">
        <section className="com-main" aria-label="Cari listesi">
          <div className="com-filters">
            <label className="com-filter-search">
              <IconSearch className="com-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Cari ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="com-filter-field">
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
            <button type="button" className="com-filter-reset">
              <IconRefresh className="com-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {demoBanner && demoVisible ? (
            <div className="com-demo-banner" role="status">
              <span>{demoBanner}</span>
              <button type="button" className="com-demo-close" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
                <IconClose />
              </button>
            </div>
          ) : null}

          <div className="com-table-panel">
            <div className="com-table-wrap">
              <table className="com-table">
                <thead>
                  <tr>
                    <th>Cari Kodu</th>
                    <th>Müşteri</th>
                    <th>Şehir</th>
                    <th>Bakiye</th>
                    <th>Risk</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row: CarilerTableRow) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "com-row com-row--selected" : "com-row"}
                      onClick={() => {
                        setSelectedId(row.id);
                        router.push(cariDetayHref(row.id));
                      }}
                    >
                      <td className="com-cell-code">{row.code}</td>
                      <td className="com-cell-customer">{row.customer}</td>
                      <td>{row.city}</td>
                      <td className="com-cell-balance">{row.balance}</td>
                      <td>
                        <span className={`com-badge${riskClass(row.risk)}`}>{row.risk}</span>
                      </td>
                      <td className="com-cell-actions" onClick={(event) => event.stopPropagation()}>
                        <Link href={cariDetayHref(row.id)} className="com-row-link">
                          Detay
                        </Link>
                        <button type="button">Tahsilat</button>
                        <button type="button">Ekstre</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="com-table-foot">
              <span>{tableTotal}</span>
              <div className="com-pagination">
                <label className="com-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="com-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "com-page-btn com-page-btn--active" : "com-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="com-context" aria-label="Cari bağlamı">
          <header className="com-context-head">
            <h2>
              <IconPin className="com-context-pin" />
              Cari Bağlamı
            </h2>
            <button type="button" className="com-context-expand" aria-label="Paneli genişlet">
              <IconChevron />
            </button>
          </header>

          <div className="com-context-hero">
            <div>
              <span className="com-context-code">{context.code}</span>
              <h3>{context.name}</h3>
              <span className="com-badge com-badge--active">{context.status}</span>
            </div>
          </div>

          <dl className="com-context-dl">
            <div>
              <dt>Vergi No</dt>
              <dd>{context.taxNo}</dd>
            </div>
            <div>
              <dt>Vergi Dairesi</dt>
              <dd>{context.taxOffice}</dd>
            </div>
            <div>
              <dt>Şehir</dt>
              <dd>{context.city}</dd>
            </div>
            <div>
              <dt>Grup</dt>
              <dd>{context.group}</dd>
            </div>
            <div>
              <dt>Cari Tipi</dt>
              <dd>{context.accountType}</dd>
            </div>
            <div>
              <dt>Açılış Tarihi</dt>
              <dd>{context.openedAt}</dd>
            </div>
            <div>
              <dt>Kredi Limiti</dt>
              <dd>{context.creditLimit}</dd>
            </div>
            <div>
              <dt>Kalan Limit</dt>
              <dd>{context.remainingLimit}</dd>
            </div>
          </dl>

          <article className="com-notice com-notice--warn">
            <IconAlert className="com-notice-icon" />
            <div>
              <strong>{context.financeWarningTitle}</strong>
              <p>{context.financeWarningDetail}</p>
            </div>
          </article>

          <article className="com-context-card">
            <h4>Hızlı İşlemler</h4>
            <ul className="com-quick-list">
              {context.quickActions.map((action) => (
                <li key={action.id}>
                  <button type="button">
                    <QuickActionIcon id={action.id} />
                    <span>{action.label}</span>
                    <IconChevron className="com-quick-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <footer className="com-context-actions">
            <button type="button" className="com-btn com-btn--primary com-btn--block">
              Cari Hareketleri Görüntüle
            </button>
            <button type="button" className="com-btn com-btn--outline com-btn--block">
              Cari Limit Düzenle
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
