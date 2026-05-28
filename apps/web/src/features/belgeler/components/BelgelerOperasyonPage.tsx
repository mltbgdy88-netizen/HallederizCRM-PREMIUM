"use client";

import Link from "next/link";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import { useBelgelerReferenceData } from "@/features/belgeler/hooks/use-belgeler-reference-data";
import type { BomDocStatus, BomTableRow } from "@/features/belgeler/data/belgeler-operasyon-mock";

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

function belgeDetayHref(documentId: string): string {
  return `/belgeler/detay?documentId=${encodeURIComponent(documentId)}`;
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 17v5M8 3h8l-1 7h2l-3 7-3-7h2L8 3z" />
    </svg>
  );
}

function statusClass(status: BomDocStatus): string {
  if (status === "Yüklendi") return " bom-badge--ok";
  if (status === "Bekliyor") return " bom-badge--wait";
  return " bom-badge--arch";
}

export function BelgelerOperasyonPage() {
  const {
    title,
    subtitle,
    kpis,
    filterSearch,
    filters,
    tableRows,
    tableTotal,
    pageNumbers,
    getContext
  } = useBelgelerReferenceData();
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const context = getContext(selectedId);

  return (
    <div className="bom-home">
      <header className="bom-head">
        <div className="bom-head-text">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="bom-head-actions">
          <a href="/belgeler/yeni" className="bom-btn bom-btn--primary">
            <IconPlus className="bom-btn-icon" />
            Belge Yükle
          </a>
          <button type="button" className="bom-btn bom-btn--outline">
            Toplu İşlemler
          </button>
          <button type="button" className="bom-btn bom-btn--outline">
            <IconExport className="bom-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="bom-kpi-row bom-kpi-row--four" aria-label="Belge özetleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`bom-kpi-card bom-kpi-card--${kpi.tone}`}>
            <div className={`bom-kpi-icon bom-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "orange" ? "orange" : kpi.tone === "slate" ? "teal" : kpi.tone === "teal" ? "teal" : "green"} />
            </div>
            <div className="bom-kpi-body">
              <span className="bom-kpi-value">{kpi.value}</span>
              <span className="bom-kpi-label">{kpi.label}</span>
            </div>
            <button type="button" className="bom-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="bom-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="bom-workspace">
        <section className="bom-main" aria-label="Belge listesi">
          <div className="bom-filters bom-filters--three">
            <label className="bom-filter-search">
              <IconSearch className="bom-filter-search-icon" />
              <input type="search" placeholder={filterSearch} readOnly aria-label="Belge ara" />
            </label>
            {filters.map((filter) => (
              <label key={filter.id} className="bom-filter-field">
                <span>{filter.label}</span>
                <select defaultValue={filter.options[0]?.value} aria-label={filter.label}>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button type="button" className="bom-filter-reset">
              <IconRefresh className="bom-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="bom-table-panel">
            <div className="bom-table-wrap">
              <table className="bom-table">
                <thead>
                  <tr>
                    <th>Belge No</th>
                    <th>Tür</th>
                    <th>Cari</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row: BomTableRow) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "bom-row bom-row--selected" : "bom-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="bom-cell-code">{row.docNo}</td>
                      <td>{row.type}</td>
                      <td className="bom-cell-customer">{row.customer}</td>
                      <td>{row.date}</td>
                      <td>
                        <span className={`bom-badge${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="bom-cell-actions">
                        <Link href={belgeDetayHref(row.id)} className="bom-row-link">
                          Görüntüle
                        </Link>
                        <button type="button">İndir</button>
                        <button type="button" aria-label="Diğer">
                          ⋮
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="bom-table-foot">
              <span>{tableTotal}</span>
              <div className="bom-pagination">
                <label className="bom-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="bom-page-nums" aria-label="Sayfalama">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "bom-page-btn bom-page-btn--active" : "bom-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="bom-context" aria-label="Belge bağlamı">
          <header className="bom-context-head">
            <h2>
              <IconPin className="bom-context-pin" />
              Belge Bağlamı
            </h2>
          </header>

          <div className="bom-file-hero">
            <span className="bom-pdf-icon" aria-hidden>
              PDF
            </span>
            <div>
              <strong>{context.fileName}</strong>
              <span>{context.fileSize}</span>
              <span className={`bom-badge${statusClass(context.status)}`}>{context.status}</span>
            </div>
          </div>

          <dl className="bom-context-dl">
            <div>
              <dt>Tür</dt>
              <dd>{context.type}</dd>
            </div>
            <div>
              <dt>Belge No</dt>
              <dd>{context.docNo}</dd>
            </div>
            <div>
              <dt>Cari</dt>
              <dd>{context.customer}</dd>
            </div>
            <div>
              <dt>Tarih</dt>
              <dd>{context.date}</dd>
            </div>
            <div>
              <dt>Yükleyen</dt>
              <dd>{context.uploader}</dd>
            </div>
            <div>
              <dt>Açıklama</dt>
              <dd>{context.description}</dd>
            </div>
          </dl>

          <div className="bom-tags">
            <span className="bom-tags-label">Etiketler</span>
            <div className="bom-tag-list">
              {context.tags.map((tag) => (
                <span key={tag} className="bom-tag">
                  {tag}
                </span>
              ))}
              <button type="button" className="bom-tag-add" aria-label="Etiket ekle">
                +
              </button>
            </div>
          </div>

          <div className="bom-preview-thumb" aria-hidden />

          <article className="bom-context-card">
            <h4>Hızlı İşlemler</h4>
            <div className="bom-quick-grid">
              <button type="button">Görüntüle</button>
              <button type="button">İndir</button>
              <button type="button">Paylaş</button>
              <button type="button">Arşivle</button>
              <button type="button" className="bom-quick-danger">
                Sil
              </button>
            </div>
          </article>

          <article className="bom-context-card">
            <h4>Geçmiş</h4>
            <ul className="bom-history">
              {context.history.map((item) => (
                <li key={item.time}>
                  <strong>{item.text}</strong>
                  <span>{item.time}</span>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>
    </div>
  );
}
