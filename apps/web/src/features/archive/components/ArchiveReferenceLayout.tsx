"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  AOM_CATEGORY_TABS,
  useArchiveOperationsDeskState
} from "../hooks/use-archive-operations-desk-state";
import { statusBadgeClass } from "../utils/map-archive-to-reference-desk";
import {
  AomKpiIconSvg,
  IconClose,
  IconDownload,
  IconExport,
  IconEye,
  IconInfo,
  IconLock,
  IconMore,
  IconRefresh,
  IconSearch,
  IconUpload,
  RecordThumbIcon
} from "./archive-reference-icons";

const PAGE_COPY = {
  title: "Arşiv Operasyon Merkezi",
  subtitle: "Geçmiş işlemler, belgeler ve denetim kayıtlarını tek ekranda yönetin.",
  searchPlaceholder: "Belge no, cari, işlem, etiket"
} as const;

export function ArchiveReferenceLayout() {
  const router = useRouter();
  const desk = useArchiveOperationsDeskState();

  const navigateSafe = useCallback(
    (href: string) => {
      desk.pushToast("Yönlendiriliyor…");
      router.push(href);
    },
    [desk, router]
  );

  const handleView = (rowId: string) => {
    desk.setSelectedId(rowId);
    desk.pushToast("Kayıt seçildi; detay sağ panelde.");
  };

  const handleMore = (rowId: string, relatedHref?: string) => {
    desk.setSelectedId(rowId);
    if (relatedHref) {
      navigateSafe(relatedHref);
      return;
    }
    desk.pushToast("Bu kayıt için ek bağlantı henüz tanımlı değil.");
  };

  const statusBandClass =
    desk.statusBand?.kind === "live"
      ? "aom-mode-band aom-mode-band--live"
      : desk.statusBand?.kind === "error"
        ? "aom-mode-band aom-mode-band--error"
        : desk.statusBand?.kind === "loading"
          ? "aom-mode-band aom-mode-band--loading"
          : "aom-demo-banner";

  return (
    <div className="aom-home aom-home--embedded" data-page="archive-reference-desk" aria-live="polite">
      <header className="aom-head">
        <div className="aom-head-text">
          <h1>{PAGE_COPY.title}</h1>
          <p>{PAGE_COPY.subtitle}</p>
        </div>
        <div className="aom-head-actions">
          <button
            type="button"
            className="aom-btn aom-btn--primary"
            disabled={!!desk.actionLocks.upload}
            onClick={() => desk.notLiveAction("upload", "Belge yükleme bağlantısı gerekir.")}
          >
            <IconUpload className="aom-btn-icon" />
            Belge Yükle
          </button>
          <button
            type="button"
            className="aom-btn aom-btn--outline"
            disabled={!!desk.actionLocks.export}
            onClick={() => desk.notLiveAction("export", "Dışa aktarma henüz bağlı değil.")}
          >
            <IconExport className="aom-btn-icon" />
            Dışa Aktar
          </button>
          <button
            type="button"
            className="aom-btn aom-btn--outline"
            disabled={!!desk.actionLocks.bulk}
            onClick={() => desk.notLiveAction("bulk", "Toplu indirme henüz bağlı değil.")}
          >
            <IconDownload className="aom-btn-icon" />
            Toplu İndir
          </button>
        </div>
      </header>

      <section className="aom-kpi-row" aria-label="Arşiv özetleri">
        {desk.kpis.map((kpi) => (
          <article key={kpi.id} className={`aom-kpi-card aom-kpi-card--${kpi.tone}`}>
            <div className={`aom-kpi-icon aom-kpi-icon--${kpi.tone}`}>
              <AomKpiIconSvg icon={kpi.icon} />
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
            {AOM_CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={desk.activeTab === tab.id}
                className={desk.activeTab === tab.id ? "aom-tab aom-tab--active" : "aom-tab"}
                onClick={() => desk.setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="aom-filters">
            <label className="aom-filter-search">
              <IconSearch className="aom-filter-search-icon" />
              <input
                type="search"
                value={desk.search}
                onChange={(event) => desk.setSearch(event.target.value)}
                placeholder={PAGE_COPY.searchPlaceholder}
                aria-label="Arama"
              />
            </label>
            <label className="aom-filter-field">
              <span>Kaynak</span>
              <select
                value={desk.source}
                onChange={(event) => desk.setSource(event.target.value as typeof desk.source)}
                aria-label="Kaynak"
              >
                <option value="all">Tümü</option>
                <option value="crm">CRM</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="ai">AI</option>
                <option value="kullanici">Kullanıcı</option>
                <option value="sistem">Sistem</option>
                <option value="ice_aktar">İçe aktar</option>
              </select>
            </label>
            <label className="aom-filter-field">
              <span>Durum</span>
              <select
                value={desk.status}
                onChange={(event) => desk.setStatus(event.target.value as typeof desk.status)}
                aria-label="Durum"
              >
                <option value="all">Tümü</option>
                <option value="onaylandi">Onaylandı</option>
                <option value="bekliyor">Bekliyor</option>
                <option value="reddedildi">Reddedildi</option>
                <option value="riskli">Riskli</option>
                <option value="arsivlendi">Arşivlendi</option>
              </select>
            </label>
            <label className="aom-filter-field">
              <span>Tarih</span>
              <select
                value={desk.datePreset}
                onChange={(event) => desk.setDatePreset(event.target.value as typeof desk.datePreset)}
                aria-label="Tarih"
              >
                <option value="all">Tümü</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 gün</option>
                <option value="month">Bu ay</option>
              </select>
            </label>
            <label className="aom-filter-field">
              <span>Kullanıcı</span>
              <input
                type="text"
                value={desk.userFilter}
                onChange={(event) => desk.setUserFilter(event.target.value)}
                placeholder="Sorumlu"
                aria-label="Kullanıcı"
              />
            </label>
            <button
              type="button"
              className="aom-filter-reset"
              title="Filtreleri sıfırla"
              aria-label="Filtreleri sıfırla"
              onClick={desk.resetFilters}
            >
              <IconRefresh className="aom-filter-reset-icon" />
              Sıfırla
            </button>
          </div>

          {desk.showDemoBanner ? (
            <div className="aom-demo-banner" role="status">
              <span>{desk.statusBand?.message}</span>
              <button
                type="button"
                className="aom-demo-close"
                aria-label="Bildirimi kapat"
                onClick={desk.dismissDemoBanner}
              >
                <IconClose />
              </button>
            </div>
          ) : desk.statusBand && desk.statusBand.kind !== "demo" ? (
            <div className={statusBandClass} role="status">
              <span>{desk.statusBand.message}</span>
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
                  {!desk.tableRows.length ? (
                    <tr>
                      <td colSpan={7} className="aom-state">
                        Kayıt bulunamadı. Filtreleri gevşetin veya sıfırlayın.
                      </td>
                    </tr>
                  ) : (
                    desk.tableRows.map((row) => (
                      <tr
                        key={row.id}
                        className={desk.selectedId === row.id ? "aom-row aom-row--selected" : "aom-row"}
                        onClick={() => desk.setSelectedId(row.id)}
                      >
                        <td className="aom-cell-record">
                          <RecordThumbIcon />
                          <span className="aom-record-id">{row.recordId}</span>
                        </td>
                        <td>{row.context}</td>
                        <td>{row.type}</td>
                        <td>{row.date}</td>
                        <td>
                          <span className={statusBadgeClass(row.status)}>{row.status}</span>
                        </td>
                        <td>{row.responsible}</td>
                        <td className="aom-cell-actions" onClick={(event) => event.stopPropagation()}>
                          <button type="button" aria-label="Görüntüle" onClick={() => handleView(row.id)}>
                            <IconEye />
                          </button>
                          <button
                            type="button"
                            aria-label="İndir"
                            disabled={!!desk.rowDownloadLocks[row.id]}
                            onClick={() => desk.lockRowDownload(row.id)}
                          >
                            <IconDownload />
                          </button>
                          <button type="button" aria-label="Diğer" onClick={() => handleMore(row.id, row.relatedHref)}>
                            <IconMore />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="aom-table-foot">
              <span>{desk.tableTotalLabel}</span>
              <div className="aom-pagination">
                <span className="aom-page-label">{desk.paginationLabel}</span>
                <div className="aom-page-nums" aria-label="Sayfalama">
                  {desk.pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={desk.page === pageNum ? "aom-page-btn aom-page-btn--active" : "aom-page-btn"}
                      onClick={() => desk.setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <label className="aom-page-size">
                  <select value={desk.pageSize} aria-label="Sayfa boyutu" disabled>
                    <option value={desk.pageSize}>{desk.pageSize} / sayfa</option>
                  </select>
                </label>
              </div>
            </footer>
          </div>
        </section>

        <aside className="aom-context" aria-label="Arşiv bağlamı">
          <header className="aom-context-head">
            <h2>Arşiv Bağlamı</h2>
            <button
              type="button"
              className="aom-context-close"
              aria-label="Paneli kapat"
              onClick={() => desk.pushToast("Bağlam paneli bu ekranda sabit kalır.")}
            >
              <IconClose />
            </button>
          </header>

          {!desk.contextPanel ? (
            <div className="aom-context-empty" role="status">
              Listeden bir kayıt seçin.
            </div>
          ) : (
            <>
              <article className="aom-context-card">
                <h3>Kayıt Özeti</h3>
                <dl className="aom-context-dl aom-context-dl--compact">
                  <div>
                    <dt>Kayıt</dt>
                    <dd>{desk.contextPanel.recordId}</dd>
                  </div>
                  <div>
                    <dt>Tür</dt>
                    <dd>{desk.contextPanel.type}</dd>
                  </div>
                  <div>
                    <dt>Cari Bağlam</dt>
                    <dd>{desk.contextPanel.context}</dd>
                  </div>
                  <div>
                    <dt>Tarih</dt>
                    <dd>{desk.contextPanel.date}</dd>
                  </div>
                  <div>
                    <dt>Durum</dt>
                    <dd>
                      <span className={statusBadgeClass(desk.contextPanel.status)}>{desk.contextPanel.status}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Sorumlu</dt>
                    <dd>{desk.contextPanel.responsible}</dd>
                  </div>
                </dl>
              </article>

              <article className="aom-context-card">
                <h3>Denetim İzi</h3>
                <ol className="aom-timeline">
                  {desk.contextPanel.auditTrail.map((event) => (
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
                    <dd className="aom-doc-name">{desk.contextPanel.documentName}</dd>
                  </div>
                  <div>
                    <dt>Boyut</dt>
                    <dd>{desk.contextPanel.documentSize}</dd>
                  </div>
                  <div>
                    <dt>Tür</dt>
                    <dd>{desk.contextPanel.documentType}</dd>
                  </div>
                  <div>
                    <dt>Sayfa</dt>
                    <dd>{desk.contextPanel.documentPages}</dd>
                  </div>
                </dl>
                <div className="aom-tags">
                  {desk.contextPanel.documentTags.map((tag) => (
                    <span key={tag} className="aom-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <article className="aom-context-card">
                <h3>Hızlı Aksiyonlar</h3>
                <div className="aom-quick-grid">
                  <button
                    type="button"
                    className="aom-btn aom-btn--outline"
                    onClick={() => desk.pushToast("Belge önizleme demo modunda.")}
                  >
                    Belgeyi Görüntüle
                  </button>
                  <button
                    type="button"
                    className="aom-btn aom-btn--outline"
                    disabled={!!desk.actionLocks.sideDl}
                    onClick={() => desk.notLiveAction("sideDl", "Belge indirme henüz bağlı değil.")}
                  >
                    Belgeyi İndir
                  </button>
                  <button
                    type="button"
                    className="aom-btn aom-btn--outline"
                    onClick={() => desk.pushToast("Bağlantı panoya kopyalandı (demo).")}
                  >
                    Bağlantı Kopyala
                  </button>
                  <button
                    type="button"
                    className="aom-btn aom-btn--outline"
                    disabled={!!desk.actionLocks.sideNote}
                    onClick={() => desk.notLiveAction("sideNote", "Arşiv notu kaydı henüz bağlı değil.")}
                  >
                    Not Ekle
                  </button>
                </div>
              </article>

              <footer className="aom-retention">
                <IconLock className="aom-retention-icon" />
                <span>{desk.contextPanel.retentionNote}</span>
              </footer>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
