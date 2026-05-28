// @ts-nocheck
"use client";

import { useDashboardReferenceData } from "@/features/dashboard/hooks/use-dashboard-reference-data";
import {
  ChevronRightSmall,
  FlowIcon,
  IconArrowRight,
  IconChat,
  IconChevronDown,
  IconInfo,
  IconPlay,
  IconRefresh,
  IconSparkle,
  KpiIcon
} from "@/components/reference/icons";

function statusClass(status: string): string {
  if (status === "BaÅŸarÄ±lÄ±") return "ref-badge ref-badge--success";
  if (status === "UyarÄ±") return "ref-badge ref-badge--warn";
  return "ref-badge ref-badge--info";
}

export function DashboardReferencePage() {
  const { kpiCards, flowItems, aiQuickActions } = useDashboardReferenceData();

  return (
    <div className="ref-dashboard">
      <header className="ref-dashboard-head">
        <div>
          <h1>GÃ¶sterge Paneli</h1>
          <p>GÃ¼nlÃ¼k operasyon vitrini; stok KPI, akÄ±ÅŸ ve AI asistan.</p>
        </div>
      </header>

      <section className="ref-kpi-row" aria-label="Ã–zet gÃ¶stergeler">
        {kpiCards.map((card) => (
          <article key={card.id} className={`ref-kpi-card ref-kpi-card--${card.tone}`}>
            <div className={`ref-kpi-icon ref-kpi-icon--${card.tone}`}>
              <KpiIcon tone={card.tone} />
            </div>
            <div className="ref-kpi-body">
              <span className="ref-kpi-value">{card.value}</span>
              <span className="ref-kpi-label">{card.label}</span>
            </div>
            <button type="button" className="ref-kpi-info" aria-label={`${card.label} bilgisi`}>
              <IconInfo className="ref-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <section className="ref-dashboard-split">
        <article className="ref-flow-panel">
          <header className="ref-panel-head">
            <div>
              <h2>Operasyon AkÄ±ÅŸÄ±</h2>
              <p>GÃ¼ncel stok, hareket ve sistem bildirimleri.</p>
            </div>
            <div className="ref-panel-tools">
              <button type="button" className="ref-tool-btn">
                TÃ¼mÃ¼
                <IconChevronDown className="ref-tool-btn-icon" />
              </button>
              <button type="button" className="ref-tool-btn ref-tool-btn--primary">
                <IconRefresh className="ref-tool-btn-icon" />
                Yenile
              </button>
            </div>
          </header>

          <ul className="ref-flow-list">
            {flowItems.map((item) => (
              <li key={item.id} className="ref-flow-item">
                <span className={`ref-flow-icon ref-flow-icon--${item.icon}`}>
                  <FlowIcon kind={item.icon} />
                </span>
                <div className="ref-flow-text">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className="ref-flow-time">{item.time}</span>
                <span className={statusClass(item.status)}>{item.status}</span>
              </li>
            ))}
          </ul>

          <button type="button" className="ref-flow-footer-btn">
            TÃ¼m AkÄ±ÅŸÄ± GÃ¶rÃ¼ntÃ¼le
            <IconArrowRight className="ref-flow-footer-icon" />
          </button>
        </article>

        <article className="ref-ai-panel">
          <header className="ref-panel-head ref-panel-head--compact">
            <div>
              <h2>
                <IconSparkle className="ref-ai-title-icon" />
                AI Asistan
              </h2>
              <p>Operasyonel sÃ¼reÃ§lerinizi kolaylaÅŸtÄ±rÄ±n</p>
            </div>
          </header>

          <div className="ref-ai-video">
            <div className="ref-ai-video-inner">
              <span className="ref-ai-video-logo">PREMIUM CRM</span>
              <p>Operasyon AkÄ±llÄ± YÃ¶netim AsistanÄ±</p>
              <button type="button" className="ref-ai-play" aria-label="Videoyu oynat">
                <IconPlay />
              </button>
            </div>
            <div className="ref-ai-video-bar">
              <span>00:00</span>
              <div className="ref-ai-video-track">
                <div className="ref-ai-video-progress" />
              </div>
              <span>01:45</span>
            </div>
          </div>

          <p className="ref-ai-prompt">
            Stok, hareket, transfer ve raporlama sÃ¼reÃ§lerinizde size nasÄ±l yardÄ±mcÄ± olabilirim?
          </p>

          <ul className="ref-ai-actions">
            {aiQuickActions.map((action) => (
              <li key={action.id}>
                <button type="button" className="ref-ai-action-btn">
                  <span>{action.label}</span>
                  <ChevronRightSmall />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="ref-ai-chat-btn">
            <IconChat className="ref-ai-chat-icon" />
            AI Asistan ile Sohbet BaÅŸlat
          </button>
        </article>
      </section>
    </div>
  );
}

