// @ts-nocheck
"use client";

import {
  EG_AI_GREETING,
  EG_QUICK_ACTIONS,
  EG_TASKS,
  EG_USER
} from "../data/ana-sayfa-emerald-gold-mock";
import { IconChevronDown, IconPlay, IconSparkle } from "../../../components/reference/icons";
import { useDashboardReferenceData } from "../hooks/use-dashboard-reference-data";

function taskBadgeClass(status: string): string {
  if (status === "Tamamlanacak") return "eg-badge eg-badge--green";
  if (status === "Devam Ediyor") return "eg-badge eg-badge--gold";
  return "eg-badge eg-badge--neutral";
}

function recentBadgeClass(tone: string): string {
  if (tone === "success") return "eg-badge eg-badge--green";
  if (tone === "ready") return "eg-badge eg-badge--teal";
  if (tone === "pending") return "eg-badge eg-badge--gold";
  if (tone === "review") return "eg-badge eg-badge--orange";
  return "eg-badge eg-badge--green-soft";
}

function FlowIcon({ kind }: { kind: string }) {
  const cls = "eg-flow-col-icon-svg";
  switch (kind) {
    case "cart":
      return (
        <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
          <path d="M3 3h2l2 12h11l2-8H7" />
        </svg>
      );
    case "truck":
      return (
        <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10z" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case "wallet":
      return (
        <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M4 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <path d="M18 12h2" />
        </svg>
      );
    case "return":
      return (
        <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M7 7h11M10 4 7 7l3 3M17 17H6M14 20l3-3-3-3" />
        </svg>
      );
    default:
      return (
        <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M7 4h10v16H7zM10 8h4M10 12h4" />
        </svg>
      );
  }
}

function AlertIcon({ tone }: { tone: string }) {
  const cls = "eg-alert-icon-svg";
  if (tone === "danger") {
    return (
      <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5M12 16h.01" />
      </svg>
    );
  }
  if (tone === "gold") {
    return (
      <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M6 3v6M18 3v6M6 9h12M8 21h8M10 9v12M14 9v12" />
      </svg>
    );
  }
  if (tone === "teal") {
    return (
      <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10z" />
      </svg>
    );
  }
  return (
    <svg className={cls} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3z" />
      <path d="M3 12.5 12 17l9-4.5" />
    </svg>
  );
}

export function AnaSayfaEmeraldGoldPage() {
  const { kpiCards, flowItems, aiQuickActions } = useDashboardReferenceData();
  const EG_ALERTS = kpiCards.slice(0, 4).map((card, i) => ({
    id: card.id,
    title: card.label,
    value: card.value,
    sub: "Reference veri",
    tone: (i === 0 ? "danger" : i === 1 ? "gold" : i === 2 ? "green" : "teal") as "danger" | "gold" | "green" | "teal"
  }));
  const EG_FLOW = flowItems.slice(0, 5).map((row, i) => ({
    id: row.id,
    title: row.title,
    subtitle: row.detail,
    count: String(i + 1),
    icon: (i === 0 ? "cart" : i === 1 ? "truck" : i === 2 ? "wallet" : i === 3 ? "return" : "offer") as
      | "cart"
      | "truck"
      | "wallet"
      | "return"
      | "offer"
  }));
  const EG_RECENT = flowItems.slice(0, 6).map((row) => ({
    id: row.id,
    date: row.time,
    type: row.status,
    record: row.id,
    customer: row.detail,
    amount: "â€”",
    status: row.status,
    statusTone: "done" as const
  }));
  const EG_AI_ACTIONS = aiQuickActions.map((a) => a.label);

  return (
    <div className="eg-home">
      <p className="eg-welcome">
        HoÅŸ geldiniz, <strong>{EG_USER.name}</strong>
      </p>

      <section className="eg-alerts" aria-label="Ã–zet kartlarÄ±">
        {EG_ALERTS.map((card) => (
          <article key={card.id} className={`eg-alert-card eg-alert-card--${card.tone}`}>
            <div className={`eg-alert-icon eg-alert-icon--${card.tone}`}>
              <AlertIcon tone={card.tone} />
            </div>
            <div className="eg-alert-body">
              <span className="eg-alert-title">{card.title}</span>
              <strong className="eg-alert-value">{card.value}</strong>
              <span className="eg-alert-sub">{card.sub}</span>
            </div>
            <span className="eg-alert-chevron" aria-hidden>
              â€º
            </span>
          </article>
        ))}
      </section>

      <section className="eg-mid-row">
        <article className="eg-panel eg-panel--tasks">
          <header className="eg-panel-head">
            <h2>BugÃ¼nkÃ¼ GÃ¶revlerim</h2>
            <button type="button" className="eg-panel-link">
              TÃ¼mÃ¼
            </button>
          </header>
          <ul className="eg-task-list">
            {EG_TASKS.map((task) => (
              <li key={task.id} className="eg-task-item">
                <span className="eg-task-time">{task.time}</span>
                <div className="eg-task-copy">
                  <strong>{task.text}</strong>
                  {task.meta ? <span>{task.meta}</span> : null}
                </div>
                <span className={taskBadgeClass(task.status)}>{task.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="eg-panel eg-panel--flow">
          <header className="eg-panel-head">
            <h2>Operasyon AkÄ±ÅŸ Ã–zeti</h2>
          </header>
          <div className="eg-flow-cols">
            {EG_FLOW.map((row) => (
              <div key={row.id} className="eg-flow-col">
                <span className="eg-flow-col-icon">
                  <FlowIcon kind={row.icon} />
                </span>
                <strong className="eg-flow-col-count">{row.count}</strong>
                <span className="eg-flow-col-title">{row.title}</span>
                <span className="eg-flow-col-sub">{row.subtitle}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="eg-panel eg-panel--ai">
          <header className="eg-panel-head">
            <h2>
              <IconSparkle className="eg-ai-sparkle" />
              Hallederiz AI Asistan
            </h2>
            <span className="eg-premium-pill">PREMIUM</span>
          </header>
          <p className="eg-ai-greeting">{EG_AI_GREETING}</p>
          <div className="eg-ai-actions">
            {EG_AI_ACTIONS.map((label) => (
              <button key={label} type="button" className="eg-ai-action">
                <span>{label}</span>
                <span className="eg-ai-action-arrow" aria-hidden>
                  â€º
                </span>
              </button>
            ))}
          </div>
          <div className="eg-ai-input-row">
            <input type="text" placeholder="Sorunuzu yazÄ±n..." readOnly aria-label="AI soru" />
            <button type="button" className="eg-ai-send" aria-label="GÃ¶nder">
              â†’
            </button>
          </div>
        </article>
      </section>

      <section className="eg-bottom-row">
        <article className="eg-panel eg-panel--table">
          <header className="eg-panel-head">
            <h2>Son Ä°ÅŸlemler</h2>
            <button type="button" className="eg-panel-link">
              TÃ¼mÃ¼
            </button>
          </header>
          <div className="eg-table-wrap">
            <table className="eg-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>TÃ¼r</th>
                  <th>KayÄ±t</th>
                  <th>Cari</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {EG_RECENT.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.record}</td>
                    <td>{row.customer}</td>
                    <td>{row.amount}</td>
                    <td>
                      <span className={recentBadgeClass(row.statusTone)}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="eg-promo">
          <div className="eg-promo-lines" aria-hidden />
          <div className="eg-promo-copy">
            <span className="eg-promo-brand">HALLEDERÄ°Z CRM PREMIUM</span>
            <strong>Daha AkÄ±llÄ± YÃ¶netim, Daha GÃ¼Ã§lÃ¼ Ä°ÅŸ SonuÃ§larÄ±</strong>
            <button type="button" className="eg-promo-btn">
              <IconPlay />
              Videoyu izle
            </button>
          </div>
          <div className="eg-promo-visual" aria-hidden>
            <div className="eg-promo-monitor" />
          </div>
        </article>
      </section>

      <footer className="eg-quickbar" aria-label="HÄ±zlÄ± iÅŸlemler">
        {EG_QUICK_ACTIONS.map((label) => (
          <button key={label} type="button" className="eg-quickbar-btn">
            <span className="eg-quickbar-icon" aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
}

