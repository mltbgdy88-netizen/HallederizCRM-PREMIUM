// @ts-nocheck
"use client";

import Link from "next/link";
import type {
  CriticalAlert,
  DonutSegment,
  GostergeKpi,
  GostergeQuickAction,
  StockSummaryRow
} from "../data/dashboard-gosterge-paneli-mock";
import { DGP_ALERTS_VIEW_ALL_HREF } from "../data/dashboard-gosterge-paneli-mock";
import { IconArrowRight, IconInfo, IconPlay, IconSparkle, KpiIcon } from "../../../components/reference/icons";
import { useDashboardGostergeReferenceData } from "../hooks/use-dashboard-gosterge-reference-data";
import { WopConversationTablePanel } from "../../whatsapp/components/WopConversationTablePanel";
import { useWhatsAppReferenceData } from "../../whatsapp/hooks/use-whatsapp-reference-data";
import { useReferenceToast } from "../../../lib/reference/use-reference-demo-action";

function QuickActionIcon({ kind }: { kind: string }) {
  const props = {
    className: "dgp-quick-icon-svg",
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (kind) {
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "move":
      return (
        <svg {...props}>
          <path d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
        </svg>
      );
    case "transfer":
      return (
        <svg {...props}>
          <path d="M12 3v18M8 7l4-4 4 4M16 17l-4 4-4-4" />
        </svg>
      );
    case "label":
      return (
        <svg {...props}>
          <path d="M7 7h10v10H7zM10 10h4" />
        </svg>
      );
    case "report":
      return (
        <svg {...props}>
          <path d="M4 20V4" />
          <path d="M4 20h16" />
          <rect x="8" y="10" width="3" height="7" />
          <rect x="13" y="7" width="3" height="10" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}

function AlertIcon({
  kind
}: {
  kind: "warn" | "transfer" | "price" | "factory" | "warehouse" | "delivery" | "cargo";
}) {
  const props = {
    className: "dgp-alert-icon-svg",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "factory") {
    return (
      <svg {...props}>
        <path d="M3 21h18M5 21V9l7-4 7 4v12M9 21v-6h6v6" />
      </svg>
    );
  }
  if (kind === "warehouse") {
    return (
      <svg {...props}>
        <path d="M3 9l9-5 9 5v12H3V9z" />
        <path d="M9 21V12h6v9" />
      </svg>
    );
  }
  if (kind === "delivery") {
    return (
      <svg {...props}>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7v-5z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }
  if (kind === "cargo") {
    return (
      <svg {...props}>
        <path d="M8 6h8l2 4v9H6V6z" />
        <path d="M8 6V4h8v2M10 14h4" />
      </svg>
    );
  }
  if (kind === "transfer") {
    return (
      <svg {...props}>
        <path d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
      </svg>
    );
  }
  if (kind === "price") {
    return (
      <svg {...props}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
    </svg>
  );
}

function alertIconClass(kind: CriticalAlert["icon"]): string {
  switch (kind) {
    case "factory":
      return " dgp-alert-icon--factory";
    case "warehouse":
      return " dgp-alert-icon--warehouse";
    case "delivery":
      return " dgp-alert-icon--delivery";
    case "cargo":
      return " dgp-alert-icon--cargo";
    case "price":
      return " dgp-alert-icon--price";
    case "transfer":
      return " dgp-alert-icon--transfer";
    default:
      return " dgp-alert-icon--warn";
  }
}

function donutGradient(segments: DonutSegment[]): string {
  let acc = 0;
  const parts = segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

function trendClass(tone?: string): string {
  if (tone === "warn") return " dgp-kpi-trend--warn";
  if (tone === "neutral") return " dgp-kpi-trend--neutral";
  return " dgp-kpi-trend--up";
}

function DgpQuickActionButton({
  action,
  onDemo
}: {
  action: GostergeQuickAction;
  onDemo: (message: string, target?: EventTarget | null) => void;
}) {
  const body = (
    <>
      <span className="dgp-quick-icon">
        <QuickActionIcon kind={action.icon} />
      </span>
      <span>{action.label}</span>
    </>
  );

  if (action.href) {
    return (
      <Link href={(action.href) ?? "#"} className="dgp-quick-btn">
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="dgp-quick-btn"
      onClick={(e) => onDemo(action.demoToast ?? `${action.label} demo modunda.`, e.currentTarget)}
    >
      {body}
    </button>
  );
}

function DgpKpiCard({
  kpi,
  onInfo
}: {
  kpi: GostergeKpi;
  onInfo: (label: string, target?: EventTarget | null) => void;
}) {
  return (
    <article className={`dgp-kpi-card dgp-kpi-card--${kpi.tone}`}>
      <Link href={(kpi.href) ?? "#"} className="dgp-kpi-card-link" aria-label={`${kpi.label} â€” listeye git`}>
        <div className={`dgp-kpi-icon dgp-kpi-icon--${kpi.tone}`}>
          <KpiIcon tone={kpi.tone} />
        </div>
        <div className="dgp-kpi-body">
          <span className="dgp-kpi-value">{kpi.value}</span>
          <span className="dgp-kpi-label">{kpi.label}</span>
          {kpi.trend ? (
            <>
              <span className={`dgp-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
              <span className="dgp-kpi-compare">{kpi.compareLabel ?? "Acil takip"}</span>
            </>
          ) : null}
        </div>
      </Link>
      <button
        type="button"
        className="dgp-kpi-info"
        aria-label={`${kpi.label} bilgisi`}
        onClick={(e) => onInfo(kpi.label, e.currentTarget)}
      >
        <IconInfo className="dgp-kpi-info-icon" />
      </button>
    </article>
  );
}

function DgpSummaryRow({ row }: { row: StockSummaryRow }) {
  return (
    <li>
      <Link href={(row.href) ?? "#"} className="dgp-summary-link">
        <span>
          {row.label}
          {row.hint ? <small className="dgp-summary-hint">{row.hint}</small> : null}
        </span>
        <strong>{row.value}</strong>
      </Link>
    </li>
  );
}

function DgpAlertRow({ alert }: { alert: CriticalAlert }) {
  return (
    <li>
      <Link href={(alert.href) ?? "#"} className={`dgp-alert-item dgp-alert-item--${alert.icon}`}>
        <span className={`dgp-alert-icon${alertIconClass(alert.icon)}`}>
          <AlertIcon kind={alert.icon} />
        </span>
        <span className="dgp-alert-text">{alert.text}</span>
      </Link>
    </li>
  );
}

export function DashboardGostergePaneliPage() {
  const pushReferenceToast = useReferenceToast();
  const {
    kpis,
    quickActions,
    alerts,
    summary,
    donut,
    donutTotal,
    aiVideoTitle,
    aiHighlights,
    aiGreeting
  } = useDashboardGostergeReferenceData();
  const { conversations, pagination } = useWhatsAppReferenceData();

  const showDemoToast = (message: string, target?: EventTarget | null) =>
    pushReferenceToast(message, target);

  return (
    <div className="dgp-home">
      <section className="dgp-kpi-row" aria-label="Ã–zet gÃ¶stergeler">
        {kpis.map((kpi) => (
          <DgpKpiCard
            key={kpi.id}
            kpi={kpi}
            onInfo={(label, target) =>
              showDemoToast(`${label} â€” acil iÅŸ listesine yÃ¶nlendiriliyorsunuz.`, target)
            }
          />
        ))}
      </section>

      <div className="dgp-col dgp-col--left" aria-label="KonuÅŸma listesi ve hÄ±zlÄ± iÅŸlemler">
          <WopConversationTablePanel
            className="dgp-wop-table-panel"
            conversations={conversations}
            pagination={pagination}
          />

          <article className="dgp-panel dgp-panel--quick">
            <header className="dgp-panel-head">
              <h2>HÄ±zlÄ± Ä°ÅŸlemler</h2>
            </header>
            <div className="dgp-quick-actions">
              {quickActions.map((action) => (
                <DgpQuickActionButton key={action.id} action={action} onDemo={showDemoToast} />
              ))}
            </div>
          </article>
        </div>

        <div className="dgp-col dgp-col--mid" aria-label="UyarÄ±lar ve Ã¶zet">
          <article className="dgp-panel dgp-panel--alerts">
            <header className="dgp-panel-head">
              <h2>Acil Takip UyarÄ±larÄ±</h2>
              <Link href={(DGP_ALERTS_VIEW_ALL_HREF) ?? "#"} className="dgp-panel-link">
                TÃ¼mÃ¼nÃ¼ GÃ¶r
                <IconArrowRight className="dgp-panel-link-icon" />
              </Link>
            </header>
            <ul className="dgp-alert-list">
              {alerts.map((a) => (
                <DgpAlertRow key={a.id} alert={a} />
              ))}
            </ul>
          </article>

          <article className="dgp-panel dgp-panel--summary">
            <header className="dgp-panel-head">
              <h2>Acil Ä°ÅŸ Ã–zeti</h2>
            </header>
            <ul className="dgp-summary-list">
              {summary.map((row) => (
                <DgpSummaryRow key={row.label} row={row} />
              ))}
            </ul>
          </article>

          <article className="dgp-panel dgp-panel--donut">
            <header className="dgp-panel-head">
              <h2>Acil Ä°ÅŸ DaÄŸÄ±lÄ±mÄ±</h2>
            </header>
            <div className="dgp-donut-wrap">
              <div className="dgp-donut" style={{ background: donutGradient(donut) }}>
                <div className="dgp-donut-hole">
                  <span className="dgp-donut-hole-label">Acil iÅŸ</span>
                  <strong>{donutTotal}</strong>
                </div>
              </div>
              <ul className="dgp-donut-legend">
                {donut.map((s) => (
                  <li key={s.label}>
                    <span className="dgp-donut-swatch" style={{ background: s.color }} />
                    <span>
                      {s.label}
                      {s.detail ? <small className="dgp-donut-detail">{s.detail}</small> : null}
                    </span>
                    <strong>%{s.pct}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>

      <article className="dgp-panel dgp-panel--ai" aria-label="AI Asistan">
        <header className="dgp-panel-head dgp-panel-head--ai">
          <h2>
            <IconSparkle className="dgp-ai-sparkle" />
            AI Asistan
          </h2>
        </header>

        <div className="dgp-ai-video">
          <div className="dgp-ai-video-inner">
            <p className="dgp-ai-video-title">{aiVideoTitle}</p>
            <button
              type="button"
              className="dgp-ai-play"
              aria-label="Videoyu oynat"
              onClick={(e) => showDemoToast("Ã–zet video oynatÄ±lÄ±yor (demo).", e.currentTarget)}
            >
              <IconPlay />
            </button>
          </div>
          <div className="dgp-ai-video-bar">
            <span>01:24</span>
            <div className="dgp-ai-track">
              <div className="dgp-ai-progress" />
            </div>
            <span>03:15</span>
          </div>
        </div>

        <p className="dgp-ai-greeting">{aiGreeting}</p>

        <div className="dgp-ai-highlights">
          <h3>Ã–ne Ã‡Ä±kanlar</h3>
          <ul>
            {aiHighlights.map((item) => (
              <li key={item}>
                <span className="dgp-ai-check" aria-hidden>
                  âœ“
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/ai" className="dgp-ai-cta">
          <IconSparkle className="dgp-ai-cta-icon" />
          Yeni Analiz OluÅŸtur
        </Link>
      </article>
    </div>
  );
}


