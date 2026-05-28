"use client";

import type { AicInsightRow } from "@/features/ai/data/ai-icgoruler-mock";
import { useAiIcgorulerReferenceData } from "@/features/ai/hooks/use-ai-icgoruler-reference-data";

function priorityClass(p: AicInsightRow["priority"]): string {
  if (p === "Yüksek") return "aic-pri aic-pri--high";
  if (p === "Orta") return "aic-pri aic-pri--mid";
  return "aic-pri aic-pri--low";
}

export function AiIcgorulerPage() {
  const {
    data: {
      page: AIC_PAGE,
      kpis: AIC_KPIS,
      tabs: AIC_TABS,
      insights: AIC_INSIGHTS,
      detail: AIC_DETAIL,
      listFooter: AIC_LIST_FOOTER
    }
  } = useAiIcgorulerReferenceData();

  return (
    <div className="aic-home">
      <header className="aic-head">
        <h1>{AIC_PAGE.title}</h1>
        <p>{AIC_PAGE.subtitle}</p>
      </header>

      <section className="aic-kpis" aria-label="Özet">
        {AIC_KPIS.map((kpi) =>
          kpi.tone === "chart" ? (
            <article key={kpi.id} className="aic-kpi aic-kpi--chart">
              <span>{kpi.label}</span>
              <div className="aic-donut" aria-hidden />
              <ul>
                {kpi.segments.map((s) => (
                  <li key={s.label}>
                    <span className={`aic-seg aic-seg--${s.tone}`} />
                    {s.label} {s.pct}
                  </li>
                ))}
              </ul>
            </article>
          ) : (
            <article key={kpi.id} className={`aic-kpi aic-kpi--${kpi.tone}`}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.amount}</small>
            </article>
          )
        )}
      </section>

      <div className="aic-grid">
        <section className="aic-list-panel">
          <div className="aic-tabs">
            {AIC_TABS.map((tab, i) => (
              <button key={tab} type="button" className={i === 0 ? "aic-tab aic-tab--active" : "aic-tab"}>
                {tab}
              </button>
            ))}
            <button type="button" className="aic-priority-filter">
              Öncelik: Yüksek
            </button>
          </div>

          <ul className="aic-insights">
            {AIC_INSIGHTS.map((row) => (
              <li key={row.id} className={row.selected ? "aic-insight aic-insight--selected" : "aic-insight"}>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.desc}</p>
                </div>
                <div className="aic-insight-meta">
                  <span>{row.date}</span>
                  <span className={priorityClass(row.priority)}>{row.priority}</span>
                </div>
              </li>
            ))}
          </ul>

          <footer className="aic-list-foot">
            <span>{AIC_LIST_FOOTER.total}</span>
            <span>{AIC_LIST_FOOTER.page}</span>
            <span>{AIC_LIST_FOOTER.rows}</span>
          </footer>
        </section>

        <aside className="aic-detail">
          <header>
            <h2>Seçili İçgörü Detayı</h2>
            <button type="button" aria-label="Kapat">
              ×
            </button>
          </header>
          <div className="aic-detail-body">
            <span className="aic-detail-pri">{AIC_DETAIL.priority}</span>
            <h3>{AIC_DETAIL.title}</h3>
            <time>{AIC_DETAIL.date}</time>
            <div className="aic-suggestion">
              <strong>Öneri</strong>
              <p>{AIC_DETAIL.suggestion}</p>
            </div>
            <ul>
              {AIC_DETAIL.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
