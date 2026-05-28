"use client";

import { useState } from "react";
import type { TdmTab } from "@/features/teklifler/data/teklifler-detay-mock";
import { useTekliflerDetayReferenceData } from "@/features/teklifler/hooks/use-teklifler-detay-reference-data";
import { IconChevronDown } from "@/components/reference/icons";
import { useToast } from "@/providers/toast-provider";

type TdmKpiIcon = "calendar" | "money" | "tag" | "list";

function KpiIcon({ icon }: { icon: TdmKpiIcon }) {
  const props = {
    className: "tdm-kpi-icon-svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (icon) {
    case "calendar":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "money":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9 10h4a2 2 0 1 0 0-4H9M15 14h-4a2 2 0 1 0 0 4h4" />
        </svg>
      );
    case "tag":
      return (
        <svg {...props}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <path d="M7 7h.01" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
  }
}

function BtnIcon({ kind }: { kind: "edit" | "print" | "more" }) {
  const props = {
    className: "tdm-btn-icon",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "edit") {
    return (
      <svg {...props}>
        <path d="M12 20h9M4 20h2l9.5-9.5a2.1 2.1 0 0 0-3-3L3 17v3z" />
      </svg>
    );
  }
  if (kind === "print") {
    return (
      <svg {...props}>
        <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="7" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TekliflerDetayMasasiPage({ offerId }: { offerId?: string } = {}) {
  const { pushToast } = useToast();
  const { data } = useTekliflerDetayReferenceData(offerId);
  const { demoBanner } = data;
  const { page, hero, tabs, kpis, summaryFields, context, convert } = data;
  const [activeTab, setActiveTab] = useState<TdmTab>("Özet");

  return (
    <div className="tdm-home">
      {demoBanner ? (
        <p className="tdm-demo-banner" role="status">
          {demoBanner}
        </p>
      ) : null}
      <header className="tdm-head">
        <div className="tdm-head-copy">
          <nav className="tdm-crumb" aria-label="Konum">
            {page.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="tdm-crumb-sep">›</span> : null}
                <span className={i === page.breadcrumb.length - 1 ? "tdm-crumb-current" : ""}>
                  {part}
                </span>
              </span>
            ))}
          </nav>
          <h1>{page.title}</h1>
        </div>
        <div className="tdm-head-actions">
          <button
            type="button"
            className="tdm-btn tdm-btn--primary"
            onClick={() => pushToast("Teklif düzenleme onaylı backend akışında (demo).")}
          >
            <BtnIcon kind="edit" />
            Düzenle
          </button>
          <button type="button" className="tdm-btn tdm-btn--outline">
            <BtnIcon kind="print" />
            Yazdır
            <IconChevronDown className="tdm-btn-chevron" />
          </button>
          <button type="button" className="tdm-btn tdm-btn--outline">
            <BtnIcon kind="more" />
            Diğer
            <IconChevronDown className="tdm-btn-chevron" />
          </button>
        </div>
      </header>

      <section className="tdm-hero" aria-label="Teklif özeti üst kart">
        <div className="tdm-hero-left">
          <span className="tdm-hero-doc" aria-hidden>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M7 4h10v16H7z" />
              <path d="M9 8h6M9 12h4" />
            </svg>
          </span>
          <div>
            <p className="tdm-hero-number">{hero.number}</p>
            <p className="tdm-hero-number-label">{hero.numberLabel}</p>
          </div>
          <span className="tdm-status-badge">{hero.status}</span>
          <div className="tdm-hero-times">
            <span>{hero.created}</span>
            <span>{hero.updated}</span>
          </div>
        </div>
        <div className="tdm-hero-mid">
          <p className="tdm-hero-label">Müşteri</p>
          <p className="tdm-hero-customer">{hero.customer}</p>
          <p className="tdm-hero-label tdm-hero-label--spaced">Yetkili</p>
          <p className="tdm-hero-contact">{hero.contact}</p>
          <p className="tdm-hero-email">{hero.email}</p>
        </div>
        <div className="tdm-hero-right">
          <p className="tdm-hero-label">Toplam Tutar</p>
          <p className="tdm-hero-total">{hero.total}</p>
          <p className="tdm-hero-total-note">{hero.totalNote}</p>
        </div>
      </section>

      <div className="tdm-tabs" role="tablist" aria-label="Teklif katmanları">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`tdm-tab${activeTab === tab ? " tdm-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="tdm-kpi-row" aria-label="Teklif metrikleri">
        {kpis.map((kpi) => (
          <article key={kpi.id} className="tdm-kpi-card">
            <span className={`tdm-kpi-icon tdm-kpi-icon--${kpi.icon}`}>
              <KpiIcon icon={kpi.icon} />
            </span>
            <div>
              <p className="tdm-kpi-label">{kpi.label}</p>
              <p className="tdm-kpi-value">{kpi.value}</p>
              <p className={`tdm-kpi-sub${kpi.subTone === "warn" ? " tdm-kpi-sub--warn" : ""}`}>{kpi.sub}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="tdm-body">
        <section className="tdm-panel tdm-panel--summary" aria-labelledby="tdm-summary-title">
          <h2 id="tdm-summary-title">Teklif Özeti</h2>
          <dl className="tdm-fields">
            {summaryFields.map((field) => (
              <div
                key={field.label}
                className={`tdm-field${"full" in field && field.full ? " tdm-field--full" : ""}${
                  "tags" in field ? " tdm-field--tags" : ""
                }`}
              >
                <dt>{field.label}</dt>
                <dd>
                  {"tags" in field && field.tags ? (
                    <span className="tdm-tags">
                      {field.tags.map((tag) => (
                        <span key={tag} className="tdm-tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : "avatar" in field && field.avatar ? (
                    <span className="tdm-person">
                      <span className="tdm-avatar">{field.avatar}</span>
                      {field.value}
                    </span>
                  ) : (
                    field.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="tdm-aside">
          <section className="tdm-panel tdm-panel--context" aria-labelledby="tdm-context-title">
            <h2 id="tdm-context-title">{context.title}</h2>
            <dl className="tdm-context-rows">
              {context.rows.map((row) => (
                <div
                  key={row.label}
                  className={`tdm-context-row${"full" in row && row.full ? " tdm-context-row--full" : ""}`}
                >
                  <dt>{row.label}</dt>
                  <dd>
                    {"link" in row && row.link ? (
                      <a href="#" className="tdm-link">
                        {row.value}
                      </a>
                    ) : "avatar" in row && row.avatar ? (
                      <span className="tdm-person">
                        <span className="tdm-avatar">{row.avatar}</span>
                        {row.value}
                      </span>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tdm-convert" aria-label="Siparişe dönüştür">
            <span className="tdm-convert-icon" aria-hidden>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 4h2l2.4 12.4a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L20 8H6" />
              </svg>
            </span>
            <h3>{convert.title}</h3>
            <p>{convert.text}</p>
            <button type="button" className="tdm-convert-btn">
              {convert.cta}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

