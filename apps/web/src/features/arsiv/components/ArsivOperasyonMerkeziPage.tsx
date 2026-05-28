"use client";

import { useEffect, useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { useArsivReferenceData } from "@/features/arsiv/hooks/use-arsiv-reference-data";
import type { ArsivRecordStatus, ArsivTableRow } from "@/features/arsiv/data/arsiv-operasyon-mock";

function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 16V4M8 8l4-4 4 4M5 20h14" />
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

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v12M16 11l-4 4-4-4M5 21h14" />
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

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMore({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function RecordThumb() {
  return (
    <span className="aom-thumb" aria-hidden>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    </span>
  );
}

function statusClass(status: ArsivRecordStatus): string {
  if (status === "Onaylı") return " aom-badge--ok";
  if (status === "Beklemede") return " aom-badge--pending";
  return " aom-badge--await";
}

export function ArsivOperasyonMerkeziPage() {
  const {
    title,
    subtitle,
    kpis,
    categoryTabs,
    filterSearchPlaceholder,
    filters,
    demoBanner,
    tableRows,
    tableTotal,
    pageNumbers,
    pageSizeLabel,
    retentionNote,
    getContext
  } = useArsivReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const [activeTab, setActiveTab] = useState("all");
  const [demoVisible, setDemoVisible] = useState(true);
  const context = getContext(selectedId);

  useEffect(() => {
    if (tableRows.length && !tableRows.some((r) => r.id === selectedId)) {
      setSelectedId(tableRows[0]!.id);
    }
  }, [tableRows, selectedId]);

  return (
    <div className="aom-home">
      <header className="aom-head">
        <div className="aom-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="aom-head-actions">
          <button type="button" className="aom-btn aom-btn--primary">
            <IconUpload className="aom-btn-icon" />
            Belge Yükle
          </button>
          <button type="button" className="aom-btn aom-btn--outline">
            <IconExport className="aom-btn-icon" />
            Dışa Aktar
          </button>
          <button type="button" className="aom-btn aom-btn--outline">
            <IconDownload className="aom-btn-icon" />
            Toplu İndir
          </button>
        </div>
      </header>

      <section className="aom-kpi-row" aria-label="Arşiv özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`aom-kpi-card aom-kpi-card--${kpi.tone}`}>
            <div className={`aom-kpi-icon aom-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="aom-kpi-body">
              <span className="aom-kpi-value">{kpi.value}</span>
              <span className="aom-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="aom-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="aom-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="aom-workspace">
        <section className="aom-main" aria-label="Arşiv listesi">
          <div className="aom-tabs" role="tablist" aria-label="Kayıt kategorileri">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "aom-tab aom-tab--active" : "aom-tab"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="aom-filters">
            <label className="aom-filter-search">
              <IconSearch className="aom-filter-search-icon" />
              <input type="search" placeholder={filterSearchPlaceholder} readOnly aria-label="Arama" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="aom-filter-field">
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
            <button type="button" className="aom-filter-reset">
              <IconRefresh className="aom-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {demoVisible && demoBanner ? (
            <div className="aom-demo-banner" role="status">
              <span>{demoBanner}</span>
              <button type="button" className="aom-demo-close" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
                <IconClose />
              </button>
            </div>
          ) : null}

          <div className="aom-table-panel">
            <div className="aom-table-wrap">
              <table className="aom-table">
                <thead>
                  <tr>
                    <th>Kayıt</th>
                    <th>Cari Bağlam</th>
                    <th>Tür</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Sorumlu</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row: ArsivTableRow) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "aom-row aom-row--selected" : "aom-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="aom-cell-record">
                        <RecordThumb />
                        <span className="aom-record-id">{row.recordId}</span>
                      </td>
                      <td>{row.context}</td>
                      <td>{row.type}</td>
                      <td>{row.date}</td>
                      <td>
                        <span className={`aom-badge${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>{row.responsible}</td>
                      <td className="aom-cell-actions">
                        <button type="button" aria-label="Görüntüle">
                          <IconEye />
                        </button>
                        <button type="button" aria-label="İndir">
                          <IconDownload />
                        </button>
                        <button type="button" aria-label="Diğer">
                          <IconMore />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="aom-table-foot">
              <span>{tableTotal}</span>
              <div className="aom-pagination">
                <div className="aom-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "aom-page-btn aom-page-btn--active" : "aom-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <label className="aom-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">{pageSizeLabel}</option>
                  </select>
                </label>
              </div>
            </footer>
          </div>
        </section>

        <aside className="aom-context" aria-label="Arşiv bağlamı">
          <header className="aom-context-head">
            <h2>Arşiv Bağlamı</h2>
            <button type="button" className="aom-context-close" aria-label="Paneli kapat">
              <IconClose />
            </button>
          </header>

          <article className="aom-context-card">
            <h3>Kayıt Özeti</h3>
            <dl className="aom-context-dl aom-context-dl--compact">
              <div>
                <dt>Kayıt</dt>
                <dd>{context.recordId}</dd>
              </div>
              <div>
                <dt>Tür</dt>
                <dd>{context.type}</dd>
              </div>
              <div>
                <dt>Cari Bağlam</dt>
                <dd>{context.context}</dd>
              </div>
              <div>
                <dt>Tarih</dt>
                <dd>{context.date}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>
                  <span className={`aom-badge${statusClass(context.status)}`}>{context.status}</span>
                </dd>
              </div>
              <div>
                <dt>Sorumlu</dt>
                <dd>{context.responsible}</dd>
              </div>
            </dl>
          </article>

          <article className="aom-context-card">
            <h3>Denetim İzi</h3>
            <ol className="aom-timeline">
              {context.auditTrail.map((event) => (
                <li key={event.id}>
                  <span className="aom-timeline-dot" aria-hidden />
                  <div>
                    <strong>{event.title}</strong>
                    <p>
                      {event.actor} · {event.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="aom-context-card">
            <h3>Belge Bilgisi</h3>
            <dl className="aom-context-dl aom-context-dl--compact">
              <div>
                <dt>Dosya</dt>
                <dd className="aom-doc-name">{context.documentName}</dd>
              </div>
              <div>
                <dt>Boyut</dt>
                <dd>{context.documentSize}</dd>
              </div>
              <div>
                <dt>Tür</dt>
                <dd>{context.documentType}</dd>
              </div>
              <div>
                <dt>Sayfa</dt>
                <dd>{context.documentPages}</dd>
              </div>
            </dl>
            <div className="aom-tags">
              {context.documentTags.map((tag) => (
                <span key={tag} className="aom-tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <article className="aom-context-card">
            <h3>Hızlı Aksiyonlar</h3>
            <div className="aom-quick-grid">
              <button type="button" className="aom-btn aom-btn--outline">
                Belgeyi Görüntüle
              </button>
              <button type="button" className="aom-btn aom-btn--outline">
                Belgeyi İndir
              </button>
              <button type="button" className="aom-btn aom-btn--outline">
                Bağlantı Kopyala
              </button>
              <button type="button" className="aom-btn aom-btn--outline">
                Not Ekle
              </button>
            </div>
          </article>

          <footer className="aom-retention">
            <IconLock className="aom-retention-icon" />
            <span>{retentionNote}</span>
          </footer>
        </aside>
      </div>
    </div>
  );
}
