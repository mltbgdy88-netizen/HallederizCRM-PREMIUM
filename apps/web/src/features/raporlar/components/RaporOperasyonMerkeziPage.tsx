"use client";

import { useEffect, useState } from "react";
import { IconChevronDown, IconInfo, IconRefresh } from "@/components/reference/icons";
import { useRaporlarReferenceData } from "@/features/raporlar/hooks/use-raporlar-reference-data";
import type { RomKpi, RomTableRow } from "@/features/raporlar/data/rapor-operasyon-mock";

function RomKpiIcon({ icon }: { icon: RomKpi["icon"] }) {
  const props = {
    className: "rom-kpi-icon-svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (icon) {
    case "collection":
      return (
        <svg {...props}>
          <path d="M4 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <path d="M18 12h2" />
        </svg>
      );
    case "balance":
      return (
        <svg {...props}>
          <path d="M12 3v18M8 7l4-4 4 4M16 17l-4 4-4-4" />
        </svg>
      );
    case "stock":
      return (
        <svg {...props}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0 1 11.5 3h1A8.5 8.5 0 0 1 21 11.5z" />
        </svg>
      );
    case "ai":
      return (
        <svg {...props}>
          <path d="M12 3 2 12l10 9 10-9L12 3z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M4 20V4" />
          <path d="M4 20h16" />
          <rect x="8" y="10" width="3" height="7" />
          <rect x="13" y="7" width="3" height="10" />
        </svg>
      );
  }
}

function RomSparkline({ points, tone }: { points: number[]; tone: RomKpi["tone"] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 56;
      const y = 22 - ((p - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className={`rom-spark rom-spark--${tone}`} viewBox="0 0 56 24" aria-hidden>
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricIcon({ icon }: { icon: RomTableRow["icon"] }) {
  return (
    <span className="rom-metric-icon" aria-hidden>
      <RomKpiIcon icon={icon} />
    </span>
  );
}

function diffClass(tone: RomTableRow["diffTone"]): string {
  if (tone === "down") return " rom-diff--down";
  if (tone === "warn") return " rom-diff--warn";
  return " rom-diff--up";
}

function trendClass(tone: RomKpi["trendTone"]): string {
  if (tone === "warn") return " rom-kpi-trend--warn";
  if (tone === "down") return " rom-kpi-trend--down";
  return " rom-kpi-trend--up";
}

export function RaporOperasyonMerkeziPage() {
  const {
    page,
    kpis,
    tabs,
    filters,
    tableRows,
    tableTotal,
    pageSize,
    demoBanner,
    getContext
  } = useRaporlarReferenceData();
  const [activeTab, setActiveTab] = useState("genel");
  const [selectedId, setSelectedId] = useState(tableRows[0]?.id ?? "1");
  const [demoVisible, setDemoVisible] = useState(true);
  const context = getContext(selectedId);

  useEffect(() => {
    if (tableRows.length && !tableRows.some((r) => r.id === selectedId)) {
      setSelectedId(tableRows[0]!.id);
    }
  }, [tableRows, selectedId]);

  return (
    <div className="rom-home">
      <header className="rom-top">
        <div className="rom-head">
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <div className="rom-top-actions">
          <button type="button" className="rom-btn rom-btn--primary">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Rapor Oluştur
          </button>
          <button type="button" className="rom-btn rom-btn--dark">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M7 4h10v16H7z" />
              <path d="M9 8h6M9 12h4" />
            </svg>
            PDF
          </button>
          <button type="button" className="rom-btn rom-btn--dark">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 10h8M8 14h5" />
            </svg>
            Excel
          </button>
        </div>
      </header>

      <nav className="rom-tabs" aria-label="Rapor kategorileri">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "rom-tab rom-tab--active" : "rom-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="rom-kpi-row" aria-label="Operasyonel metrikler">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={`rom-kpi-card rom-kpi-card--${kpi.tone}`}>
            <div className={`rom-kpi-icon rom-kpi-icon--${kpi.tone}`}>
              <RomKpiIcon icon={kpi.icon} />
            </div>
            <div className="rom-kpi-body">
              <span className="rom-kpi-label">{kpi.label}</span>
              <span className="rom-kpi-value">{kpi.value}</span>
              <span className={`rom-kpi-trend${trendClass(kpi.trendTone)}`}>{kpi.trend}</span>
              <span className="rom-kpi-compare">vs geçen dönem</span>
            </div>
            <RomSparkline points={kpi.sparkline} tone={kpi.tone} />
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
              <button type="button" className="rom-filter-select">
                {filters.period}
                <IconChevronDown className="rom-filter-chevron" />
              </button>
            </label>
            <label className="rom-filter-field">
              <span>Karşılaştırma</span>
              <button type="button" className="rom-filter-select">
                {filters.comparison}
                <IconChevronDown className="rom-filter-chevron" />
              </button>
            </label>
            <label className="rom-filter-field">
              <span>Segment</span>
              <button type="button" className="rom-filter-select">
                {filters.segment}
                <IconChevronDown className="rom-filter-chevron" />
              </button>
            </label>
            <button type="button" className="rom-filter-reset">
              <IconRefresh className="rom-filter-reset-icon" />
              Filtreleri Temizle
            </button>
          </div>

          {demoVisible && demoBanner ? (
            <div className="rom-demo-banner" role="status">
              <span>{demoBanner}</span>
              <button type="button" className="rom-demo-close" aria-label="Bildirimi kapat" onClick={() => setDemoVisible(false)}>
                ×
              </button>
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
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? "rom-row rom-row--selected" : "rom-row"}
                      onClick={() => setSelectedId(row.id)}
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
                        <span className={`rom-diff${diffClass(row.diffTone)}`}>{row.diff}</span>
                      </td>
                      <td className="rom-cell-actions">
                        <button type="button">Görüntüle</button>
                        <button type="button" className="rom-menu-btn" aria-label="Diğer">
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="rom-table-foot">
              <span>{tableTotal}</span>
              <div className="rom-pagination">
                <label className="rom-page-size">
                  <select defaultValue="25" aria-label="Sayfa boyutu">
                    <option value="25">{pageSize}</option>
                  </select>
                </label>
                <div className="rom-page-nums" aria-label="Sayfalama">
                  <button type="button" className="rom-page-btn rom-page-btn--active">
                    1
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </section>

        <aside className="rom-context" aria-label="Rapor bağlamı">
          <header className="rom-context-head">
            <h2>Rapor Bağlamı</h2>
            <p>{context.reportTitle}</p>
          </header>

          <dl className="rom-context-dl">
            <div>
              <dt>Seçili metrik</dt>
              <dd>{context.metric}</dd>
            </div>
            <div>
              <dt>Dönem</dt>
              <dd>{context.period}</dd>
            </div>
            <div>
              <dt>Segment</dt>
              <dd>{context.segment}</dd>
            </div>
            <div>
              <dt>Oluşturma</dt>
              <dd>{context.createdAt}</dd>
            </div>
            <div>
              <dt>Oluşturan</dt>
              <dd>{context.createdBy}</dd>
            </div>
          </dl>

          <article className="rom-context-card">
            <h3>Hedef Karşılaştırma</h3>
            <dl className="rom-context-dl rom-context-dl--compact">
              <div>
                <dt>Hedef</dt>
                <dd>{context.goal}</dd>
              </div>
              <div>
                <dt>Gerçekleşen</dt>
                <dd>{context.actual}</dd>
              </div>
              <div>
                <dt>Fark</dt>
                <dd className="rom-diff rom-diff--up">{context.diff}</dd>
              </div>
              <div>
                <dt>Başarı Oranı</dt>
                <dd className="rom-success-rate">{context.successRate}</dd>
              </div>
            </dl>
            <div className="rom-progress" aria-label={`Başarı oranı ${context.successRate}`}>
              <span style={{ width: `${Math.min(context.successPct, 100)}%` }} />
            </div>
          </article>

          <article className="rom-context-card">
            <h3>Kaynak Linkleri</h3>
            <ul className="rom-links">
              {context.sourceLinks.map((link) => (
                <li key={link.id}>
                  <button type="button" className="rom-link-btn">
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
              {context.actions.map((action) => (
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
            <button type="button" className="rom-btn rom-btn--dark rom-btn--block">
              Aksiyon Planı Oluştur
            </button>
          </footer>
        </aside>
      </div>
    </div>
  );
}

