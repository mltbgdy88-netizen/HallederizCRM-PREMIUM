"use client";

import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { useWhatsAppOperationsDeskState, type WhatsAppDeskStatusFilter } from "../hooks/use-whatsapp-operations-desk-state";
import { statusBadgeClass, type WopReferenceTableRow } from "../utils/map-conversation-to-reference-desk";
import {
  IconInfo,
  IconRefresh,
  IconSearch,
  trendClass,
  WopKpiIconSvg
} from "./whatsapp-reference-icons";

const PAGE_COPY = {
  title: "WhatsApp Operasyon Paneli",
  subtitle: "Kanal mesajları, onay bekleyenler ve SLA takibini tek ekranda yönetin.",
  kpiCompareLabel: "Geçen güne göre"
} as const;

function ConversationRow({
  row,
  selected,
  onSelect,
  onOpenInbox,
  onOpenApprovals
}: {
  row: WopReferenceTableRow;
  selected: boolean;
  onSelect: () => void;
  onOpenInbox: () => void;
  onOpenApprovals: () => void;
}) {
  return (
    <tr className={selected ? "wop-row wop-row--selected" : "wop-row"} onClick={onSelect}>
      <td>
        <div className="wop-conv-cell">
          <strong>#{row.code}</strong>
          <span>{row.phone}</span>
        </div>
      </td>
      <td className="wop-td-customer">{row.customer}</td>
      <td>
        <div className="wop-msg-cell">
          <span className="wop-msg-text">{row.lastMessage}</span>
          <span className="wop-msg-time">{row.lastTime}</span>
        </div>
      </td>
      <td>
        <span className={statusBadgeClass(row.status)}>{row.status}</span>
      </td>
      <td>
        <span className={`wop-sla wop-sla--${row.slaTone}`}>
          <span className="wop-sla-dot" aria-hidden />
          {row.sla}
        </span>
      </td>
      <td onClick={(event) => event.stopPropagation()}>
        <div className="wop-row-actions">
          <button type="button" className="wop-icon-btn" aria-label="Detay" title="Detay" onClick={onSelect}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button type="button" className="wop-icon-btn" aria-label="Mesaj akışı" title="Mesaj akışı" onClick={onOpenInbox}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
          </button>
          <button type="button" className="wop-icon-btn" aria-label="Onaylar" title="Onaylar" onClick={onOpenApprovals}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M5 12l5 5L20 7" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export function WhatsAppReferenceLayout({ initialCustomerId }: { initialCustomerId?: string | null }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const desk = useWhatsAppOperationsDeskState(initialCustomerId);

  return (
    <div className="wop-home wop-home--embedded" data-page="whatsapp-reference-desk" aria-live="polite">
      <header className="wop-top">
        <div className="wop-head">
          <h1>{PAGE_COPY.title}</h1>
          <p>{PAGE_COPY.subtitle}</p>
        </div>
        <div className="wop-top-actions">
          <button
            type="button"
            className="wop-btn wop-btn--primary"
            onClick={() => pushToast("Yeni konuşma henüz canlıya bağlı değil.")}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
            Yeni Konuşma
          </button>
          <button type="button" className="wop-btn wop-btn--ghost" onClick={() => pushToast("Şablon gönderimi onay zincirinden geçer.")}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
            </svg>
            Şablon Gönder
          </button>
          <button type="button" className="wop-btn wop-btn--ghost" onClick={() => pushToast("Dışa aktarım taslağı hazırlandı.")}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />
            </svg>
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="wop-kpi-row" aria-label="Özet göstergeler">
        {desk.kpis.map((kpi) => (
          <article key={kpi.id} className={`wop-kpi-card wop-kpi-card--${kpi.tone}`}>
            <div className={`wop-kpi-icon wop-kpi-icon--${kpi.tone}`}>
              <WopKpiIconSvg icon={kpi.icon} />
            </div>
            <div className="wop-kpi-body">
              <span className="wop-kpi-value">{kpi.value}</span>
              <span className="wop-kpi-label">{kpi.label}</span>
              <span className={`wop-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
              <span className="wop-kpi-compare">{PAGE_COPY.kpiCompareLabel}</span>
            </div>
            <button type="button" className="wop-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="wop-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      {desk.useDemo ? (
        <p className="wop-mode-band" role="status">
          Önizleme modu: konuşma listesi demo amaçlıdır; canlı gönderim onay zincirinden geçer.
        </p>
      ) : desk.listError ? (
        <p className="wop-mode-band wop-mode-band--error" role="alert">
          {desk.listError}
          <button type="button" onClick={() => desk.reloadList()}>
            Tekrar dene
          </button>
        </p>
      ) : desk.detailLoading ? (
        <p className="wop-mode-band" role="status">
          Seçili konuşma detayı güncelleniyor…
        </p>
      ) : desk.detailError ? (
        <p className="wop-mode-band wop-mode-band--error" role="alert">
          {desk.detailError}
        </p>
      ) : null}

      <section className="wop-filters" aria-label="Filtreler">
        <label className="wop-filter wop-filter--search">
          <IconSearch className="wop-filter-search-icon" />
          <input
            type="search"
            value={desk.search}
            onChange={(event) => desk.setSearch(event.target.value)}
            placeholder="Konuşma, cari veya telefon ara…"
            aria-label="Arama"
          />
        </label>
        <label className="wop-filter">
          <span>Durum</span>
          <select
            className="wop-filter-select-native"
            value={desk.statusFilter}
            onChange={(event) => desk.setStatusFilter(event.target.value as WhatsAppDeskStatusFilter)}
            aria-label="Durum"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="approval">Onay Bekliyor</option>
            <option value="active">Aktif</option>
          </select>
        </label>
        <label className="wop-filter">
          <span>Kanal</span>
          <select className="wop-filter-select-native" value={desk.channel} onChange={(event) => desk.setChannel(event.target.value)} aria-label="Kanal">
            <option value="all">Tümü</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        <label className="wop-filter">
          <span>Temsilci</span>
          <select className="wop-filter-select-native" value={desk.agent} onChange={(event) => desk.setAgent(event.target.value)} aria-label="Temsilci">
            <option value="all">Tümü</option>
            <option value="emre">Emre Aydın</option>
          </select>
        </label>
        <label className="wop-filter">
          <span>Tarih</span>
          <select className="wop-filter-select-native" defaultValue="week" aria-label="Tarih">
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
        <button
          type="button"
          className="wop-filter-reset"
          title="Filtreleri sıfırla"
          aria-label="Filtreleri sıfırla"
          onClick={() => {
            desk.resetFilters();
            pushToast("Filtreler sıfırlandı.");
          }}
        >
          <IconRefresh className="wop-filter-reset-icon" />
          Sıfırla
        </button>
      </section>

      <section className="wop-body" aria-label="Konuşma listesi ve bağlam">
        <article className="wop-table-panel">
          {desk.listLoading ? (
            <div className="wop-state">Konuşmalar yükleniyor…</div>
          ) : (
            <>
              <div className="wop-table-wrap">
                <table className="wop-table">
                  <thead>
                    <tr>
                      <th>Konuşma</th>
                      <th>Cari</th>
                      <th>Son Mesaj</th>
                      <th>Durum</th>
                      <th>SLA</th>
                      <th>Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desk.tableRows.map((row) => (
                      <ConversationRow
                        key={row.id}
                        row={row}
                        selected={desk.selectedId === row.id}
                        onSelect={() => desk.setSelectedId(row.id)}
                        onOpenInbox={() => router.push(`/gelen-kutu?channel=whatsapp&conversation=${row.id}`)}
                        onOpenApprovals={() => router.push("/onaylar")}
                      />
                    ))}
                    {desk.tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="wop-state wop-state--empty">Filtrelere uygun konuşma bulunamadı.</div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <footer className="wop-table-foot">
                <span>{desk.paginationLabel}</span>
                <nav className="wop-pager" aria-label="Sayfalama">
                  <button
                    type="button"
                    className="wop-pager-btn"
                    aria-label="Önceki"
                    disabled={desk.page <= 1}
                    onClick={() => desk.setPage((current) => Math.max(1, current - 1))}
                  >
                    ‹
                  </button>
                  <button type="button" className="wop-pager-num wop-pager-num--active">
                    {desk.page}
                  </button>
                  <button
                    type="button"
                    className="wop-pager-btn"
                    aria-label="Sonraki"
                    disabled={desk.page >= desk.totalPages}
                    onClick={() => desk.setPage((current) => Math.min(desk.totalPages, current + 1))}
                  >
                    ›
                  </button>
                </nav>
              </footer>
            </>
          )}
        </article>

        <aside className="wop-detail" aria-label="Konuşma bağlamı">
          {!desk.detailPanel ? (
            <div className="wop-detail-empty">Tablodan bir konuşma seçildiğinde özet, uyarı ve önerilen yanıtlar görünür.</div>
          ) : (
            <>
              <header className="wop-detail-head">
                <h2>Konuşma Bağlamı</h2>
              </header>

              <div className="wop-detail-meta">
                <div className="wop-detail-id">
                  <strong>#{desk.detailPanel.code}</strong>
                  <span className={statusBadgeClass(desk.detailPanel.status)}>{desk.detailPanel.status}</span>
                </div>
                <p className="wop-detail-customer">{desk.detailPanel.customer}</p>
                <p className="wop-detail-phone">{desk.detailPanel.phone}</p>
                <div className="wop-detail-agent">
                  <span className="wop-detail-avatar">{desk.detailPanel.agentInitials}</span>
                  <div>
                    <span className="wop-detail-agent-label">Atanan Temsilci</span>
                    <strong>{desk.detailPanel.agentName}</strong>
                  </div>
                </div>
                <p className="wop-detail-started">
                  <span>Başlangıç</span>
                  <strong>{desk.detailPanel.startedAt}</strong>
                </p>
              </div>

              {desk.detailPanel.alert ? (
                <div className="wop-alert">
                  <p>{desk.detailPanel.alert}</p>
                  <button type="button" className="wop-alert-btn" onClick={() => router.push("/onaylar")}>
                    {desk.detailPanel.alertCta}
                  </button>
                </div>
              ) : null}

              <section className="wop-detail-block">
                <h3>Son Mesaj Özeti</h3>
                <p>{desk.detailPanel.lastSummary}</p>
                <p className="wop-detail-source">{desk.detailPanel.lastSource}</p>
              </section>

              <section className="wop-detail-block wop-detail-block--replies">
                <div className="wop-detail-block-head">
                  <h3>Önerilen Yanıtlar</h3>
                </div>
                <ul className="wop-reply-list">
                  {desk.detailPanel.suggestedReplies.map((reply) => (
                    <li key={reply.id}>
                      <p>{reply.text}</p>
                      <button
                        type="button"
                        className="wop-reply-send"
                        aria-label="Gönder"
                        onClick={() => pushToast("Gönderim onay zincirinden geçer.")}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                          <path d="m22 2-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="wop-detail-docs">
                <h3>Belge Gönder</h3>
                <div className="wop-doc-actions">
                  <button
                    type="button"
                    className="wop-btn wop-btn--primary wop-btn--sm"
                    onClick={() => pushToast("Belge gönderimi onay zincirinden geçer.")}
                  >
                    Dosya Seç
                  </button>
                  <button
                    type="button"
                    className="wop-btn wop-btn--ghost wop-btn--sm"
                    onClick={() => pushToast("Şablon seçimi onay sonrası uygulanır.")}
                  >
                    Şablondan Seç
                  </button>
                </div>
              </section>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
