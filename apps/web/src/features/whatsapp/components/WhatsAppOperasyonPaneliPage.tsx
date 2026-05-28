// @ts-nocheck
"use client";

import { useWhatsAppReferenceData } from "@/features/whatsapp/hooks/use-whatsapp-reference-data";
import type { WopConversationStatus, WopKpi } from "@/features/whatsapp/data/whatsapp-operasyon-mock";
import { WopConversationTablePanel } from "@/features/whatsapp/components/WopConversationTablePanel";
import { IconChevronDown, IconInfo, IconRefresh, IconSearch } from "@/components/reference/icons";

function WopKpiIcon({ icon }: { icon: WopKpi["icon"] }) {
  const props = {
    className: "wop-kpi-icon-svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (icon) {
    case "send":
      return (
        <svg {...props}>
          <path d="m22 2-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "warn":
      return (
        <svg {...props}>
          <path d="M12 3 2 20h20L12 3z" />
          <path d="M12 10v4" />
        </svg>
      );
    case "percent":
      return (
        <svg {...props}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M19 5 5 19" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
        </svg>
      );
  }
}

function statusClass(status: WopConversationStatus): string {
  switch (status) {
    case "Onay Bekliyor":
      return "wop-badge wop-badge--approval";
    case "Beklemede":
      return "wop-badge wop-badge--hold";
    case "Aktif":
      return "wop-badge wop-badge--active";
    default:
      return "wop-badge wop-badge--done";
  }
}

function trendClass(tone: WopKpi["trendTone"]): string {
  if (tone === "warn") return " wop-kpi-trend--warn";
  if (tone === "down") return " wop-kpi-trend--down";
  return " wop-kpi-trend--up";
}

export function WhatsAppOperasyonPaneliPage() {
  const { page, kpis, filters, conversations, pagination, detail, suggestedReplies } = useWhatsAppReferenceData();

  return (
    <div className="wop-home">
      <header className="wop-top">
        <div className="wop-head">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="wop-top-actions">
          <button type="button" className="wop-btn wop-btn--primary">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
            </svg>
            Yeni Konuşma
          </button>
          <button type="button" className="wop-btn wop-btn--ghost">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
            </svg>
            �?ablon Gönder
          </button>
          <button type="button" className="wop-btn wop-btn--ghost">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M12 3v12M8 11l4 4 4-4M4 21h16" />
            </svg>
            Dışa Aktar
          </button>
        </div>
      </header>

      <section className="wop-kpi-row" aria-label="Özet göstergeler">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`wop-kpi-card wop-kpi-card--${kpi.tone}`}>
            <div className={`wop-kpi-icon wop-kpi-icon--${kpi.tone}`}>
              <WopKpiIcon icon={kpi.icon} />
            </div>
            <div className="wop-kpi-body">
              <span className="wop-kpi-value">{kpi.value}</span>
              <span className="wop-kpi-label">{kpi.label}</span>
              <span className={`wop-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
              <span className="wop-kpi-compare">{page.kpiCompareLabel}</span>
            </div>
            <button type="button" className="wop-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="wop-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <section className="wop-filters" aria-label="Filtreler">
        <label className="wop-filter wop-filter--search">
          <IconSearch className="wop-filter-search-icon" />
          <input type="search" readOnly placeholder={filters.searchPlaceholder} aria-label="Arama" />
        </label>
        <label className="wop-filter">
          <span>Durum</span>
          <button type="button" className="wop-filter-select">
            {filters.status}
            <IconChevronDown className="wop-filter-chevron" />
          </button>
        </label>
        <label className="wop-filter">
          <span>Kanal</span>
          <button type="button" className="wop-filter-select">
            {filters.channel}
            <IconChevronDown className="wop-filter-chevron" />
          </button>
        </label>
        <label className="wop-filter">
          <span>Temsilci</span>
          <button type="button" className="wop-filter-select">
            {filters.agent}
            <IconChevronDown className="wop-filter-chevron" />
          </button>
        </label>
        <label className="wop-filter">
          <span>Tarih</span>
          <button type="button" className="wop-filter-select">
            {filters.date}
            <IconChevronDown className="wop-filter-chevron" />
          </button>
        </label>
        <button type="button" className="wop-filter-reset">
          <IconRefresh className="wop-filter-reset-icon" />
          Sıfırla
        </button>
      </section>

      <section className="wop-body" aria-label="Konuşma listesi ve bağlam">
        <WopConversationTablePanel conversations={conversations} pagination={pagination} />

        <aside className="wop-detail" aria-label="Konuşma bağlamı">
          <header className="wop-detail-head">
            <h2>Konuşma Bağlamı</h2>
          </header>

          <div className="wop-detail-meta">
            <div className="wop-detail-id">
              <strong>#{detail.code}</strong>
              <span className={statusClass(detail.status)}>{detail.status}</span>
            </div>
            <p className="wop-detail-customer">{detail.customer}</p>
            <p className="wop-detail-phone">{detail.phone}</p>
            <div className="wop-detail-agent">
              <span className="wop-detail-avatar">{detail.agentInitials}</span>
              <div>
                <span className="wop-detail-agent-label">Atanan Temsilci</span>
                <strong>{detail.agentName}</strong>
              </div>
            </div>
            <p className="wop-detail-started">
              <span>Başlangıç</span>
              <strong>{detail.startedAt}</strong>
            </p>
          </div>

          <div className="wop-alert">
            <p>{detail.alert}</p>
            <button type="button" className="wop-alert-btn">
              {detail.alertCta}
            </button>
          </div>

          <section className="wop-detail-block">
            <h3>Son Mesaj Özeti</h3>
            <p>{detail.lastSummary}</p>
            <p className="wop-detail-source">{detail.lastSource}</p>
          </section>

          <section className="wop-detail-block wop-detail-block--replies">
            <div className="wop-detail-block-head">
              <h3>{detail.suggestedTitle}</h3>
              <button type="button" className="wop-detail-link">
                {detail.suggestedViewAll}
              </button>
            </div>
            <ul className="wop-reply-list">
              {suggestedReplies.map((reply) => (
                <li key={reply.id}>
                  <p>{reply.text}</p>
                  <button type="button" className="wop-reply-send" aria-label="Gönder">
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                      <path d="m22 2-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="wop-detail-docs">
            <h3>{detail.documentTitle}</h3>
            <div className="wop-doc-actions">
              <button type="button" className="wop-btn wop-btn--primary wop-btn--sm">
                {detail.selectFile}
              </button>
              <button type="button" className="wop-btn wop-btn--ghost wop-btn--sm">
                {detail.selectTemplate}
              </button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}


