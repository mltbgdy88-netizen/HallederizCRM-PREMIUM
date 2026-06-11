"use client";

import { useReportsOperationsDeskState } from "../hooks/use-reports-operations-desk-state";
import {
  diffBadgeClass,
  ROM_CATEGORY_TABS,
  ROM_PAGE_COPY,
  trendClass
} from "../utils/map-reports-to-reference-desk";
import {
  IconClose,
  IconInfo,
  IconMore,
  IconRefresh,
  MetricIcon,
  RomKpiIconSvg,
  RomSparkline
} from "./reports-reference-icons";

export function ReportsReferenceLayout() {
  const desk = useReportsOperationsDeskState();

  const statusBandClass =
    desk.statusBand?.kind === "live"
      ? "rom-mode-band rom-mode-band--live"
      : "rom-demo-banner";

  return (
    <div className="rom-home rom-home--embedded" data-page="reports-reference-desk" aria-live="polite">
      <header className="rom-top">
        <div className="rom-head">
          <h1>{ROM_PAGE_COPY.title}</h1>
          <p>{ROM_PAGE_COPY.subtitle}</p>
        </div>
        <div className="rom-top-actions">
          <button
            type="button"
            className="rom-btn rom-btn--primary"
            disabled={!!desk.actionLocks.create}
            onClick={() => desk.lockAction("create", "Demo: rapor oluşturma kuyruğa alındı.")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Rapor Oluştur
          </button>
          <button
            type="button"
            className="rom-btn rom-btn--dark"
            disabled={!!desk.actionLocks.pdf}
            onClick={() => desk.lockAction("pdf", "Demo: PDF indirme hazırlanıyor.")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M7 4h10v16H7z" />
              <path d="M9 8h6M9 12h4" />
            </svg>
            PDF
          </button>
          <button
            type="button"
            className="rom-btn rom-btn--dark"
            disabled={!!desk.actionLocks.xls}
            onClick={() => desk.lockAction("xls", "Demo: Excel dışa aktarma hazırlanıyor.")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 10h8M8 14h5" />
            </svg>
            Excel
          </button>
        </div>
      </header>

      <nav className="rom-tabs" aria-label="Rapor kategorileri">
        {ROM_CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={desk.activeTab === tab.id ? "rom-tab rom-tab--active" : "rom-tab"}
            aria-selected={desk.activeTab === tab.id}
            onClick={() => desk.setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="rom-kpi-row" aria-label="Operasyonel metrikler">
        {desk.kpis.map((kpi) => (
          <article
            key={kpi.id}
            className={`rom-kpi-card rom-kpi-card--${kpi.tone}${desk.usingDemoData ? "" : " rom-kpi-card--no-spark"}`}
          >
            <div className={`rom-kpi-icon rom-kpi-icon--${kpi.tone}`}>
              <RomKpiIconSvg icon={kpi.icon} />
            </div>
            <div className="rom-kpi-body">
              <span className="rom-kpi-label">{kpi.label}</span>
              <span className={`rom-kpi-value${kpi.pendingLive ? " rom-kpi-value--pending" : ""}`}>{kpi.value}</span>
              <span className={`rom-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
              <span className="rom-kpi-compare">vs geçen dönem</span>
            </div>
            {desk.usingDemoData ? <RomSparkline points={kpi.sparkline} tone={kpi.tone} /> : null}
            <button type="button" className="rom-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="rom-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <div className="rom-workspace">
        <section className="rom-main" aria-label="Rapor listesi">
          <div className="rom-filters">
            <label className="rom-filter-field">
              <span>Dönem</span>
              <div className="rom-filter-date-pair">
                <input
                  type="date"
                  className="rom-filter-native"
                  aria-label="Başlangıç"
                  value={desk.dateFrom}
                  onChange={(event) => desk.setDateFrom(event.target.value)}
                />
                <span className="rom-filter-date-sep" aria-hidden>
                  –
                </span>
                <input
                  type="date"
                  className="rom-filter-native"
                  aria-label="Bitiş"
                  value={desk.dateTo}
                  onChange={(event) => desk.setDateTo(event.target.value)}
                />
              </div>
            </label>
            <label className="rom-filter-field">
              <span>Karşılaştırma</span>
              <select className="rom-filter-native" value={desk.compare} onChange={(event) => desk.setCompare(event.target.value)} aria-label="Karşılaştırma">
                <option value="prev">Önceki dönem</option>
                <option value="last-month">Geçen ay</option>
                <option value="last-year">Geçen yıl</option>
                <option value="target">Hedefe göre</option>
              </select>
            </label>
            <label className="rom-filter-field">
              <span>Segment</span>
              <select className="rom-filter-native" value={desk.segment} onChange={(event) => desk.setSegment(event.target.value)} aria-label="Segment">
                <option value="all">Tümü</option>
                <option value="bayi">Bayi</option>
                <option value="kurumsal">Kurumsal</option>
                <option value="perakende">Perakende</option>
                <option value="riskli">Riskli</option>
              </select>
            </label>
            <button
              type="button"
              className="rom-filter-reset"
              title="Filtreleri temizle"
              aria-label="Filtreleri temizle"
              onClick={desk.resetFilters}
            >
              <IconRefresh className="rom-filter-reset-icon" />
              Filtreleri Temizle
            </button>
          </div>

          {desk.showDemoBanner ? (
            <div className="rom-demo-banner" role="status">
              <span>{desk.statusBand?.message}</span>
              <button type="button" className="rom-demo-close" aria-label="Bildirimi kapat" onClick={desk.dismissDemoBanner}>
                <IconClose />
              </button>
            </div>
          ) : desk.statusBand ? (
            <div className={statusBandClass} role="status">
              <span>{desk.statusBand.message}</span>
            </div>
          ) : null}

          <div className="rom-table-panel">
            <div className="rom-table-wrap">
              <table className="rom-table">
                <thead>
                  <tr>
                    <th>Metrik Rapor</th>
                    <th>Segment</th>
                    <th>Dönem</th>
                    <th>Gerçekleşen</th>
                    <th>Hedef</th>
                    <th>Fark</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {!desk.tableRows.length ? (
                    <tr>
                      <td colSpan={7} className="rom-state">
                        {desk.usingDemoData
                          ? "Kayıt bulunamadı. Filtreleri gevşetin veya sıfırlayın."
                          : "Canlı rapor verisi bekleniyor. Metrik listesi API bağlandığında burada görünür."}
                      </td>
                    </tr>
                  ) : (
                    desk.tableRows.map((row) => (
                      <tr
                        key={row.id}
                        className={desk.selectedId === row.id ? "rom-row rom-row--selected" : "rom-row"}
                        onClick={() => desk.setSelectedId(row.id)}
                      >
                        <td className="rom-cell-metric">
                          <MetricIcon icon={row.icon} />
                          <span>{row.metric}</span>
                        </td>
                        <td>{row.segment}</td>
                        <td>{row.period}</td>
                        <td>{row.actual}</td>
                        <td>{row.target}</td>
                        <td>
                          <span className={diffBadgeClass(row.diffTone)}>{row.diff}</span>
                        </td>
                        <td className="rom-cell-actions" onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => desk.handleRowView(row.id)}>
                            Görüntüle
                          </button>
                          <button
                            type="button"
                            className="rom-menu-btn"
                            aria-label="Diğer"
                            disabled={!!desk.rowMoreLocks[row.id]}
                            onClick={() => desk.handleRowMore(row.id)}
                          >
                            <IconMore />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="rom-table-foot">
              <span>{desk.tableTotalLabel}</span>
              <div className="rom-pagination">
                <span className="rom-page-label">{desk.paginationLabel}</span>
                <div className="rom-page-nums" aria-label="Sayfalama">
                  {desk.pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={desk.page === pageNum ? "rom-page-btn rom-page-btn--active" : "rom-page-btn"}
                      onClick={() => desk.setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <label className="rom-page-size">
                  <select value={desk.pageSize} aria-label="Sayfa boyutu" disabled>
                    <option value={desk.pageSize}>{desk.pageSize} / sayfa</option>
                  </select>
                </label>
              </div>
            </footer>
          </div>
        </section>

        <aside className="rom-context" aria-label="Rapor bağlamı">
          <header className="rom-context-head">
            <h2>Rapor Bağlamı</h2>
            <p>{desk.contextPanel?.reportTitle ?? "Listeden bir metrik seçin."}</p>
          </header>

          {!desk.contextPanel ? (
            <div className="rom-context-empty" role="status">
              Listeden bir metrik seçin.
            </div>
          ) : (
            <>
              <dl className="rom-context-dl">
                <div>
                  <dt>Seçili metrik</dt>
                  <dd>{desk.contextPanel.metric}</dd>
                </div>
                <div>
                  <dt>Dönem</dt>
                  <dd>{desk.contextPanel.period}</dd>
                </div>
                <div>
                  <dt>Segment</dt>
                  <dd>{desk.contextPanel.segment}</dd>
                </div>
                <div>
                  <dt>Oluşturma</dt>
                  <dd>{desk.contextPanel.createdAt}</dd>
                </div>
                <div>
                  <dt>Oluşturan</dt>
                  <dd>{desk.contextPanel.createdBy}</dd>
                </div>
              </dl>

              <article className="rom-context-card">
                <h3>Hedef Karşılaştırma</h3>
                <dl className="rom-context-dl rom-context-dl--compact">
                  <div>
                    <dt>Hedef</dt>
                    <dd>{desk.contextPanel.goal}</dd>
                  </div>
                  <div>
                    <dt>Gerçekleşen</dt>
                    <dd>{desk.contextPanel.actual}</dd>
                  </div>
                  <div>
                    <dt>Fark</dt>
                    <dd className={diffBadgeClass(desk.contextPanel.diffTone)}>{desk.contextPanel.diff}</dd>
                  </div>
                  <div>
                    <dt>Başarı Oranı</dt>
                    <dd className="rom-success-rate">{desk.contextPanel.successRate}</dd>
                  </div>
                </dl>
                <div className="rom-progress" aria-label={`Başarı oranı ${desk.contextPanel.successRate}`}>
                  <span style={{ width: `${Math.min(desk.contextPanel.successPct, 100)}%` }} />
                </div>
              </article>

              <article className="rom-context-card">
                <h3>Kaynak Linkleri</h3>
                <ul className="rom-links">
                  {desk.contextPanel.sourceLinks.map((link) => (
                    <li key={link.id}>
                      <button type="button" className="rom-link-btn" onClick={() => desk.navigateSafe(link.href)}>
                        {link.label}
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                          <path d="M14 3h7v7M10 14 21 3M21 14v7h-7M3 10V3h7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rom-context-card">
                <h3>Önerilen Aksiyonlar</h3>
                <ul className="rom-actions">
                  {desk.contextPanel.actions.map((action) => (
                    <li key={action.id}>
                      <label className="rom-action-item">
                        <input type="checkbox" defaultChecked={action.done} readOnly />
                        <span>{action.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </article>

              <footer className="rom-context-foot">
                <button
                  type="button"
                  className="rom-btn rom-btn--dark rom-btn--block"
                  onClick={() => desk.pushToast("Demo: aksiyon planı taslağı oluşturuldu.")}
                >
                  Aksiyon Planı Oluştur
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
