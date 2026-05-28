"use client";

import Link from "next/link";
import { useState } from "react";
import { IconInfo, IconRefresh, IconSearch, KpiIcon } from "@/components/reference/icons";
import {
  type GomPriority,
  type GomStatus,
  type GomTableRow
} from "@/features/gorevler/data/gorevler-operasyon-mock";
import { useGorevlerReferenceData } from "@/features/gorevler/hooks/use-gorevler-reference-data";

function gorevDetayHref(taskId: string): string {
  return `/gorevler/detay?taskId=${encodeURIComponent(taskId)}`;
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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

function priorityClass(p: GomPriority): string {
  if (p === "Yüksek") return " gom-badge--high";
  if (p === "Orta") return " gom-badge--mid";
  return " gom-badge--low";
}

function statusClass(s: GomStatus): string {
  if (s === "Gecikmiş") return " gom-badge--late";
  if (s === "Bugün Vade") return " gom-badge--today";
  if (s === "Devam Ediyor") return " gom-badge--prog";
  return " gom-badge--open";
}

export function GorevlerOperasyonPage() {
  const {
    data: {
      title: GOM_TITLE,
      subtitle: GOM_SUBTITLE,
      kpis: GOM_KPIS,
      filterSearch: GOM_FILTER_SEARCH,
      filters: GOM_FILTERS,
      tableRows: GOM_TABLE_ROWS,
      tableTotal: GOM_TABLE_TOTAL,
      pageNumbers: GOM_PAGE_NUMBERS,
      getContext: getGomContext
    }
  } = useGorevlerReferenceData();
  const [selectedId, setSelectedId] = useState("1");
  const [contextTab, setContextTab] = useState<"Açıklama" | "Detaylar">("Açıklama");
  const context = getGomContext(selectedId);
  const checklistPct = Math.round((context.checklistDone / context.checklistTotal) * 100);

  return (
    <div className="gom-home">
      <header className="gom-head">
        <div className="gom-head-text">
          <h1>{GOM_TITLE}</h1>
          <p>{GOM_SUBTITLE}</p>
        </div>
        <div className="gom-head-actions">
          <button type="button" className="gom-btn gom-btn--primary">
            <IconPlus className="gom-btn-icon" />
            Yeni Görev
          </button>
          <button type="button" className="gom-btn gom-btn--outline">
            Görev Takvimi
          </button>
          <button type="button" className="gom-btn gom-btn--outline">
            <IconExport className="gom-btn-icon" />
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="gom-kpi-row" aria-label="Görev özetleri">
        {GOM_KPIS.map((kpi) => (
          <article key={kpi.id} className={`gom-kpi-card gom-kpi-card--${kpi.tone}`}>
            <div className={`gom-kpi-icon gom-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "red" ? "orange" : kpi.tone === "orange" ? "orange" : kpi.tone === "teal" ? "teal" : "green"} />
            </div>
            <div className="gom-kpi-body">
              <span className="gom-kpi-value">{kpi.value}</span>
              <span className="gom-kpi-label">{kpi.label}</span>
              <span className="gom-kpi-trend">{kpi.trend}</span>
            </div>
            <button type="button" className="gom-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="gom-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="gom-workspace">
        <section className="gom-main" aria-label="Görev listesi">
          <div className="gom-filters">
            <label className="gom-filter-search">
              <IconSearch className="gom-filter-search-icon" />
              <input type="search" placeholder={GOM_FILTER_SEARCH} readOnly aria-label="Görev ara" />
            </label>
            {GOM_FILTERS.map((filter) => (
              <label key={filter.id} className="gom-filter-field">
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
            <button type="button" className="gom-filter-reset">
              <IconRefresh className="gom-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          <div className="gom-table-panel">
            <div className="gom-table-wrap">
              <table className="gom-table">
                <thead>
                  <tr>
                    <th>Görev Başlık</th>
                    <th>Atanan</th>
                    <th>Öncelik</th>
                    <th>Durum</th>
                    <th>Vade</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {GOM_TABLE_ROWS.map((row: GomTableRow) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "gom-row gom-row--selected" : "gom-row"}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>
                        <span className="gom-cell-title">{row.title}</span>
                        <span className="gom-cell-sub">{row.subtitle}</span>
                      </td>
                      <td>
                        <span className="gom-avatar">{row.initials}</span>
                        {row.assignee}
                      </td>
                      <td>
                        <span className={`gom-badge${priorityClass(row.priority)}`}>{row.priority}</span>
                      </td>
                      <td>
                        <span className={`gom-badge${statusClass(row.status)}`}>{row.status}</span>
                      </td>
                      <td>
                        <span className="gom-due">{row.due}</span>
                        <span className={`gom-due-note${row.status === "Gecikmiş" ? " gom-due-note--late" : ""}`}>
                          {row.dueNote}
                        </span>
                      </td>
                      <td className="gom-cell-actions">
                        <Link href={gorevDetayHref(row.id)} className="gom-row-link" aria-label="Görüntüle">
                          <IconEye className="gom-row-link-icon" />
                        </Link>
                        <button type="button" aria-label="Düzenle">
                          <IconEdit className="gom-row-link-icon" />
                        </button>
                        <button type="button" aria-label="Tamamla">
                          <IconCheck className="gom-row-link-icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="gom-table-foot">
              <span>{GOM_TABLE_TOTAL}</span>
              <div className="gom-pagination">
                <label className="gom-page-size">
                  <select defaultValue="10" aria-label="Sayfa boyutu">
                    <option value="10">10 satır</option>
                  </select>
                </label>
                <div className="gom-page-nums" aria-label="Sayfalama">
                  {GOM_PAGE_NUMBERS.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === "1" ? "gom-page-btn gom-page-btn--active" : "gom-page-btn"}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="gom-context" aria-label="Görev bağlamı">
          <header className="gom-context-head">
            <h2>
              <IconPin className="gom-context-pin" />
              Görev Bağlamı
            </h2>
          </header>

          <div className="gom-context-hero">
            <h3>{context.title}</h3>
            <span className={`gom-badge${statusClass(context.status)}`}>{context.status}</span>
          </div>

          <dl className="gom-context-dl">
            <div>
              <dt>Vade</dt>
              <dd>{context.due}</dd>
            </div>
            <div>
              <dt>Atanan</dt>
              <dd>
                <span className="gom-avatar">{context.initials}</span> {context.assignee}
              </dd>
            </div>
            <div>
              <dt>Öncelik</dt>
              <dd>
                <span className={`gom-badge${priorityClass(context.priority)}`}>{context.priority}</span>
              </dd>
            </div>
            <div>
              <dt>Durum</dt>
              <dd>
                <span className={`gom-badge${statusClass(context.status)}`}>{context.status}</span>
              </dd>
            </div>
          </dl>

          <div className="gom-context-tabs">
            {(["Açıklama", "Detaylar"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`gom-ctx-tab${contextTab === tab ? " gom-ctx-tab--active" : ""}`}
                onClick={() => setContextTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {contextTab === "Açıklama" ? <p className="gom-context-desc">{context.description}</p> : null}

          <article className="gom-context-card">
            <header className="gom-check-head">
              <h4>Görev Kontrol Listesi</h4>
              <span>
                {context.checklistDone} / {context.checklistTotal}
              </span>
            </header>
            <div className="gom-check-bar" aria-hidden>
              <span style={{ width: `${checklistPct}%` }} />
            </div>
            <ul className="gom-checklist">
              {context.checklist.map((item) => (
                <li key={item.label}>
                  <input type="checkbox" checked={item.done} readOnly aria-label={item.label} />
                  <span className={item.done ? "gom-check-done" : undefined}>{item.label}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="gom-attach">
            <h4>Ek Dosyalar</h4>
            <div className="gom-attach-row">
              <span aria-hidden>📎</span>
              <div>
                <strong>{context.attachment.name}</strong>
                <span>{context.attachment.size}</span>
              </div>
              <button type="button" aria-label="İndir">
                ↓
              </button>
            </div>
          </article>

          <footer className="gom-context-actions">
            <button type="button" className="gom-btn gom-btn--outline gom-btn--block">
              Görevi Düzenle
            </button>
            <button type="button" className="gom-btn gom-btn--primary gom-btn--block">
              Görevi Tamamla
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}
