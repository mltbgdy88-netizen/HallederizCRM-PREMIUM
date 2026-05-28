// @ts-nocheck
"use client";

import type { CriticalAlert, DonutSegment } from "@/features/dashboard/data/dashboard-gosterge-paneli-mock";
import { IconArrowRight, IconInfo, IconPlay, IconSparkle, KpiIcon } from "@/components/reference/icons";
import { useDashboardGostergeReferenceData } from "@/features/dashboard/hooks/use-dashboard-gosterge-reference-data";

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

function AlertIcon({ kind }: { kind: CriticalAlert["icon"] }) {
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
  if (kind === "transfer" || kind === "warehouse") {
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

export function DashboardGostergePaneliPage() {
  const {
    kpis,
    quickActions,
    movements,
    alerts,
    summary,
    donut,
    donutTotal,
    aiVideoTitle,
    aiHighlights,
    aiGreeting,
    demoBanner,
    isDemo,
    loadFailed
  } = useDashboardGostergeReferenceData();

  const previewMessage =
    demoBanner ??
    (isDemo ? "Demo gÃ¶sterge verisi â€” canlÄ± mod iÃ§in NEXT_PUBLIC_USE_DEMO_DATA=false" : null) ??
    (loadFailed ? "CanlÄ± veri yÃ¼klenemedi; Ã¶nizleme verisi gÃ¶steriliyor" : null);

  return (
    <div className="dgp-home">
      {previewMessage ? (
        <p className="dgp-demo-band" role="status">
          {previewMessage}
        </p>
      ) : null}

      <header className="dgp-head">
        <h1>GÃ¶sterge Paneli</h1>
        <p>Ä°ÅŸ sÃ¼reÃ§lerinizi anlÄ±k olarak takip edin ve hÄ±zlÄ±ca aksiyon alÄ±n.</p>
      </header>

      <section className="dgp-kpi-row" aria-label="Ã–zet gÃ¶stergeler">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`dgp-kpi-card dgp-kpi-card--${kpi.tone}`}>
            <div className={`dgp-kpi-icon dgp-kpi-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone} />
            </div>
            <div className="dgp-kpi-body">
              <span className="dgp-kpi-value">{kpi.value}</span>
              <span className="dgp-kpi-label">{kpi.label}</span>
              {kpi.trend ? (
                <>
                  <span className={`dgp-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
                  <span className="dgp-kpi-compare">GeÃ§en aya gÃ¶re</span>
                </>
              ) : null}
            </div>
            <button type="button" className="dgp-kpi-info" aria-label={`${kpi.label} bilgisi`}>
              <IconInfo className="dgp-kpi-info-icon" />
            </button>
          </article>
        ))}
      </section>

      <section className="dgp-grid" aria-label="Panel iÃ§eriÄŸi">
        <div className="dgp-col dgp-col--left">
          <article className="dgp-panel dgp-panel--quick">
            <header className="dgp-panel-head">
              <h2>HÄ±zlÄ± Ä°ÅŸlemler</h2>
            </header>
            <div className="dgp-quick-actions">
              {quickActions.map((action) => (
                <button key={action.id} type="button" className="dgp-quick-btn">
                  <span className="dgp-quick-icon">
                    <QuickActionIcon kind={action.icon} />
                  </span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="dgp-panel dgp-panel--table">
            <header className="dgp-panel-head">
              <h2>Son Stok Hareketleri</h2>
              <button type="button" className="dgp-panel-link">
                TÃ¼mÃ¼nÃ¼ GÃ¶r
                <IconArrowRight className="dgp-panel-link-icon" />
              </button>
            </header>
            <div className="dgp-table-wrap">
              <table className="dgp-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>ÃœrÃ¼n</th>
                    <th>Hareket Tipi</th>
                    <th>Miktar</th>
                    <th>Depo</th>
                    <th>KullanÄ±cÄ±</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td className="dgp-table-product">{row.product}</td>
                      <td>
                        <span className={`dgp-badge dgp-badge--${row.type === "GiriÅŸ" ? "in" : "out"}`}>
                          {row.type}
                        </span>
                      </td>
                      <td
                        className={
                          row.qty.startsWith("+") || row.type === "GiriÅŸ"
                            ? "dgp-qty--in"
                            : "dgp-qty--out"
                        }
                      >
                        {row.qty}
                      </td>
                      <td>{row.warehouse}</td>
                      <td>{row.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="dgp-col dgp-col--mid">
          <article className="dgp-panel dgp-panel--alerts">
            <header className="dgp-panel-head">
              <h2>Kritik UyarÄ±lar</h2>
              <button type="button" className="dgp-panel-link">
                TÃ¼mÃ¼nÃ¼ GÃ¶r
                <IconArrowRight className="dgp-panel-link-icon" />
              </button>
            </header>
            <ul className="dgp-alert-list">
              {alerts.map((a) => (
                <li key={a.id} className={`dgp-alert-item dgp-alert-item--${a.icon}`}>
                  <span className={`dgp-alert-icon dgp-alert-icon--${a.icon === "warehouse" || a.icon === "factory" || a.icon === "delivery" || a.icon === "cargo" ? "transfer" : a.icon === "price" ? "price" : "warn"}`}>
                    <AlertIcon kind={a.icon} />
                  </span>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="dgp-panel dgp-panel--summary">
            <header className="dgp-panel-head">
              <h2>Stok Ã–zeti</h2>
            </header>
            <ul className="dgp-summary-list">
              {summary.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="dgp-panel dgp-panel--donut">
            <header className="dgp-panel-head">
              <h2>Depo DaÄŸÄ±lÄ±mÄ±</h2>
            </header>
            <div className="dgp-donut-wrap">
              <div className="dgp-donut" style={{ background: donutGradient(donut) }}>
                <div className="dgp-donut-hole">
                  <span className="dgp-donut-hole-label">Toplam</span>
                  <strong>{donutTotal}</strong>
                </div>
              </div>
              <ul className="dgp-donut-legend">
                {donut.map((s) => (
                  <li key={s.label}>
                    <span className="dgp-donut-swatch" style={{ background: s.color }} />
                    <span>{s.label}</span>
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
              <button type="button" className="dgp-ai-play" aria-label="Videoyu oynat">
                <IconPlay />
              </button>
            </div>
            <div className="dgp-ai-video-bar">
              <span>01:24</span>
              <div className="dgp-ai-track">
                <div className="dgp-ai-progress" />
              </div>
              <span>03:15</span>
              <span className="dgp-ai-vol" aria-hidden>
                â™ª
              </span>
              <span className="dgp-ai-fs" aria-hidden>
                â›¶
              </span>
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

          <button type="button" className="dgp-ai-cta">
            <IconSparkle className="dgp-ai-cta-icon" />
            Yeni Analiz OluÅŸtur
          </button>
        </article>
      </section>
    </div>
  );
}

