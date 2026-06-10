// @ts-nocheck
"use client";

import Link from "next/link";
import type { AohPlanRow } from "@/features/ai/data/ai-operator-hub-mock";
import { AOH_KPIS } from "@/features/ai/data/ai-operator-hub-mock";
import { useAiOperatorReferenceData } from "@/features/ai/hooks/use-ai-operator-reference-data";

function KpiIcon({ kind }: { kind: (typeof AOH_KPIS)[number]["icon"] }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true as const };
  if (kind === "ai") {
    return (
      <svg {...props}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  }
  if (kind === "db") {
    return (
      <svg {...props}>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      </svg>
    );
  }
  if (kind === "shield") {
    return (
      <svg {...props}>
        <path d="M12 3 4 7v6c0 5 4 9 8 10 4-1 8-5 8-10V7l-8-4z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PlanRow({ row }: { row: AohPlanRow }) {
  return (
    <article className="aoh-plan">
      <div className="aoh-plan-main">
        <strong>{row.title}</strong>
        <p>{row.desc}</p>
        <div className="aoh-plan-meta">
          <span className="aoh-tag aoh-tag--module">{row.module}</span>
          <span className={row.priority === "Yüksek" ? "aoh-tag aoh-tag--high" : "aoh-tag aoh-tag--mid"}>
            {row.priority}
          </span>
          <span className="aoh-plan-date">
            Öneri Tarihi {row.date} {row.time}
          </span>
        </div>
      </div>
      <div className="aoh-plan-side">
        <span className="aoh-local">
          <span className="aoh-local-dot" aria-hidden />
          Yerel — İnceleme Bekliyor
        </span>
        <button type="button" className="aoh-review-btn">
          Öneri İncele
        </button>
      </div>
    </article>
  );
}

export function AiOperatorHubPage() {
  const {
    data: {
      page: AOH_PAGE,
      kpis: AOH_KPIS,
      tabs: AOH_TABS,
      sync: AOH_SYNC,
      filters: AOH_FILTERS,
      plans: AOH_PLANS,
      footer: AOH_FOOTER
    }
  } = useAiOperatorReferenceData();

  return (
    <div className="aoh-home">
      <header className="aoh-head">
        <div>
          <h1>{AOH_PAGE.title}</h1>
          <p>{AOH_PAGE.subtitle}</p>
        </div>
        <nav className="aoh-head-links" aria-label="Yapay zeka kapıları">
          <Link href="/ai/icgoruler" className="aoh-head-link">
            İçgörüler
          </Link>
          <Link href="/ai/onaylar" className="aoh-head-link">
            AI Onayları
          </Link>
          <Link href="/onaylar" className="aoh-head-link">
            Onay Masası
          </Link>
        </nav>
      </header>

      <section className="aoh-kpis" aria-label="Özet kartlar">
        {AOH_KPIS.map((kpi) => (
          <article key={kpi.id} className="aoh-kpi">
            <span className="aoh-kpi-icon">
              <KpiIcon kind={kpi.icon} />
            </span>
            <div>
              <strong>{kpi.value}</strong>
              <span>{kpi.label}</span>
              <small>{kpi.hint}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="aoh-panel">
        <div className="aoh-tabs-row">
          <div className="aoh-tabs">
            {AOH_TABS.map((tab) => (
              <button key={tab.id} type="button" className={tab.active ? "aoh-tab aoh-tab--active" : "aoh-tab"}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="aoh-sync">
            <span>
              <span className="aoh-sync-dot" aria-hidden />
              {AOH_SYNC.local}
            </span>
            <span>{AOH_SYNC.last}</span>
          </div>
        </div>

        <div className="aoh-filters">
          {AOH_FILTERS.map((label) => (
            <button key={label} type="button" className="aoh-filter">
              {label}
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          ))}
          <button type="button" className="aoh-filter aoh-filter--sort">
            Öneri Tarihi (Yeni)
          </button>
        </div>

        <div className="aoh-list">
          {AOH_PLANS.map((row) => (
            <PlanRow key={row.id} row={row} />
          ))}
        </div>
      </section>

      <footer className="aoh-foot">
        <p>{AOH_FOOTER.security}</p>
        <p>
          <span className="aoh-sync-dot" aria-hidden />
          {AOH_FOOTER.status}
        </p>
      </footer>
    </div>
  );
}


