"use client";

import { useState } from "react";
import type { CdmTab } from "@/features/cariler/data/cariler-detay-mock";
import { useCarilerDemoAction } from "@/features/cariler/hooks/use-cariler-demo-action";
import { useCarilerDetayReferenceData } from "@/features/cariler/hooks/use-cariler-detay-reference-data";
import { IconChevronDown } from "@/components/reference/icons";

function BtnIcon({ kind }: { kind: "edit" | "more" | "plus" }) {
  const props = {
    className: "cdm-btn-icon",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (kind === "edit") {
    return (
      <svg {...props}>
        <path d="M12 20h9M4 20h2l9.5-9.5a2.1 2.1 0 0 0-3-3L3 17v3z" />
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

type PerfIconKind = "wallet" | "cart" | "calendar" | "chart" | "open" | "avg";

function PerfIcon({ icon }: { icon: PerfIconKind }) {
  const props = {
    className: "cdm-perf-icon-svg",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (icon === "wallet") {
    return (
      <svg {...props}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (icon === "cart") {
    return (
      <svg {...props}>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 4h2l2.4 12.4a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L20 8H6" />
      </svg>
    );
  }
  if (icon === "calendar") {
    return (
      <svg {...props}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (icon === "open") {
    return (
      <svg {...props}>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    );
  }
  if (icon === "avg") {
    return (
      <svg {...props}>
        <path d="M4 19h16M7 16l3-4 3 3 4-6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" />
    </svg>
  );
}

function ContactIcon({ id }: { id: string }) {
  const props = {
    className: "cdm-contact-icon",
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (id === "phone" || id === "mobile") {
    return (
      <svg {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (id === "email") {
    return (
      <svg {...props}>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
    </svg>
  );
}

export function CarilerDetayMasasiPage({ customerId }: { customerId?: string } = {}) {
  const { data, loading, loadFailed, isDemo } = useCarilerDetayReferenceData(customerId);
  const demoAction = useCarilerDemoAction();
  const { hero, tabs, summary, commercial, performance, risk, context, warnings, nextSteps } = data;
  const [activeTab, setActiveTab] = useState<CdmTab>("Özet");

  return (
    <div className="cdm-home">
      {data.demoBanner ? (
        <p className="cdm-demo-banner" role="status">
          {data.demoBanner}
        </p>
      ) : null}
      {loadFailed ? (
        <p className="cdm-demo-banner cdm-demo-banner--warn" role="alert">
          Canlı cari detayı yüklenemedi; önizleme verisi gösteriliyor.
        </p>
      ) : null}
      {loading && !isDemo ? (
        <p className="cdm-demo-banner" aria-live="polite">
          Cari detayı yükleniyor…
        </p>
      ) : null}
      <header className="cdm-hero" aria-label="Cari üst bilgi">
        <a href="/cariler" className="cdm-back" aria-label="Cariler listesine dön">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </a>
        <span className="cdm-avatar">{hero.initials}</span>
        <div className="cdm-hero-main">
          <div className="cdm-hero-title-row">
            <h1>{hero.title}</h1>
            <span className="cdm-status">{hero.status}</span>
          </div>
          <p className="cdm-hero-meta">
            {hero.meta.map((item, i) => (
              <span key={item.label}>
                {i > 0 ? <span className="cdm-meta-sep">·</span> : null}
                <span className="cdm-meta-label">{item.label}:</span> {item.value}
              </span>
            ))}
          </p>
        </div>
        <div className="cdm-hero-actions">
          <button type="button" className="cdm-btn cdm-btn--primary" onClick={(e) => demoAction("Yeni işlem", e)}>
            <BtnIcon kind="plus" />
            Yeni İşlem
            <IconChevronDown className="cdm-btn-chevron" />
          </button>
          <button type="button" className="cdm-btn cdm-btn--outline" onClick={(e) => demoAction("Düzenle", e)}>
            <BtnIcon kind="edit" />
            Düzenle
          </button>
          <button type="button" className="cdm-btn cdm-btn--outline" onClick={(e) => demoAction("Diğer işlemler", e)}>
            <BtnIcon kind="more" />
            Diğer
          </button>
        </div>
      </header>

      <div className="cdm-tabs" role="tablist" aria-label="Cari katmanları">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`cdm-tab${activeTab === tab ? " cdm-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="cdm-grid">
        <section className="cdm-panel cdm-panel--summary" aria-labelledby="cdm-summary-title">
          <h2 id="cdm-summary-title">{summary.title}</h2>
          <dl className="cdm-fields cdm-fields--2">
            {summary.fields.map((field) => (
              <div key={field.label} className="cdm-field">
                <dt>{field.label}</dt>
                <dd>
                  {"badge" in field && field.badge ? (
                    <span className="cdm-status cdm-status--inline">{field.value}</span>
                  ) : (
                    field.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="cdm-address">
            <span className="cdm-address-pin" aria-hidden>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <p className="cdm-address-label">Adres</p>
              <p className="cdm-address-text">{summary.address}</p>
              <div className="cdm-tags">
                <span className="cdm-tags-label">Etiketler</span>
                {summary.tags.map((tag) => (
                  <span key={tag.label} className={`cdm-tag cdm-tag--${tag.tone}`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cdm-panel cdm-panel--commercial" aria-labelledby="cdm-commercial-title">
          <h2 id="cdm-commercial-title">{commercial.title}</h2>
          <dl className="cdm-fields cdm-fields--2">
            {commercial.fields.map((field) => (
              <div key={field.label} className="cdm-field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="cdm-rep">
            <p className="cdm-subhead">Satış Temsilcisi</p>
            <span className="cdm-person">
              <span className="cdm-person-avatar">{commercial.rep.initials}</span>
              {commercial.rep.name}
            </span>
          </div>
          <div className="cdm-contacts">
            <p className="cdm-subhead">İletişim Bilgileri</p>
            <ul>
              {commercial.contacts.map((c) => (
                <li key={c.id}>
                  <ContactIcon id={c.id} />
                  <span>{c.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cdm-note">
            <p className="cdm-subhead">Not</p>
            <p>{commercial.note}</p>
          </div>
        </section>

        <section className="cdm-panel cdm-panel--perf" aria-labelledby="cdm-perf-title">
          <h2 id="cdm-perf-title">{performance.title}</h2>
          <ul className="cdm-perf-list">
            {performance.rows.map((row) => (
              <li key={row.label}>
                <span className="cdm-perf-icon">
                  <PerfIcon icon={row.icon} />
                </span>
                <div>
                  <p className="cdm-perf-label">{row.label}</p>
                  <p className="cdm-perf-value">{row.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="cdm-panel cdm-panel--risk" aria-labelledby="cdm-risk-title">
          <h2 id="cdm-risk-title">{risk.title}</h2>
          <dl className="cdm-fields cdm-fields--1">
            {risk.fields.map((field) => (
              <div key={field.label} className="cdm-field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="cdm-usage">
            <div className="cdm-usage-head">
              <span>{risk.usageLabel}</span>
              <strong>{risk.usagePct}</strong>
            </div>
            <div
              className="cdm-usage-bar"
              role="progressbar"
              aria-valuenow={risk.usageValue}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="cdm-usage-fill" style={{ width: `${risk.usageValue}%` }} />
            </div>
          </div>
        </section>

        <section className="cdm-panel cdm-panel--context" aria-labelledby="cdm-context-title">
          <h2 id="cdm-context-title">{context.title}</h2>
          <dl className="cdm-fields cdm-fields--1">
            {context.rows.map((row) => (
              <div key={row.label} className="cdm-field">
                <dt>{row.label}</dt>
                <dd>
                  {"live" in row && row.live ? (
                    <span className="cdm-live">
                      <span className="cdm-live-dot" aria-hidden />
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

        <section className="cdm-panel cdm-panel--warn" aria-labelledby="cdm-warn-title">
          <h2 id="cdm-warn-title">{warnings.title}</h2>
          <ul className="cdm-warn-list">
            {warnings.items.map((item) => (
              <li key={item.title}>
                <span className="cdm-warn-icon" aria-hidden>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 3 2 20h20L12 3z" />
                    <path d="M12 10v4" />
                  </svg>
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="cdm-panel cdm-panel--steps" aria-labelledby="cdm-steps-title">
          <h2 id="cdm-steps-title">{nextSteps.title}</h2>
          <ul className="cdm-steps-list">
            {nextSteps.items.map((item) => (
              <li key={item.label}>
                <span className="cdm-step-check" aria-hidden>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </span>
                <div>
                  <p>{item.label}</p>
                  <span className="cdm-step-date">{item.date}</span>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="cdm-steps-cta" onClick={(e) => demoAction(nextSteps.cta, e)}>
            {nextSteps.cta}
          </button>
        </section>
      </div>
    </div>
  );
}

