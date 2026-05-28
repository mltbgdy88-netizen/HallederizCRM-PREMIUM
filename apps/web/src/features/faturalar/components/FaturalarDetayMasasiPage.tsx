"use client";

import Link from "next/link";
import { useState } from "react";
import type { FdmTab } from "@/features/faturalar/data/faturalar-detay-mock";
import { useFaturalarDetayReferenceData } from "@/features/faturalar/hooks/use-faturalar-detay-reference-data";

export function FaturalarDetayMasasiPage() {
  const { data } = useFaturalarDetayReferenceData();
  const page = data.page;
  const hero = data.hero;
  const tabs = data.tabs;
  const customer = data.customer;
  const description = data.description;
  const notes = data.notes;
  const totals = data.totals;
  const payment = data.payment;
  const context = data.context;
  const [activeTab, setActiveTab] = useState<FdmTab>("Özet");

  return (
    <div className="fdm-home">
      <header className="fdm-head">
        <div className="fdm-head-copy">
          <nav className="fdm-crumb" aria-label="Konum">
            {page.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="fdm-crumb-sep">›</span> : null}
                <span className={i === page.breadcrumb.length - 1 ? "fdm-crumb-current" : ""}>{part}</span>
              </span>
            ))}
          </nav>
          <h1>{page.title}</h1>
        </div>
        <Link href="/faturalar" className="fdm-btn fdm-btn--outline">
          ← {page.backLabel}
        </Link>
      </header>

      <section className="fdm-hero" aria-label="Fatura üst bilgi">
        <div className="fdm-hero-left">
          <span className="fdm-hero-doc" aria-hidden>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path d="M14 2v6h6" />
            </svg>
          </span>
          <div>
            <p className="fdm-hero-number">{hero.invoiceId}</p>
            <p className="fdm-hero-number-label">Fatura ID</p>
          </div>
          <div className="fdm-hero-meta">
            <span>Fatura Tarihi: {hero.invoiceDate}</span>
            <span>
              Vade Tarihi: {hero.dueDate} ({hero.dueNote})
            </span>
            <span>Para Birimi: {hero.currency}</span>
          </div>
        </div>
        <div className="fdm-hero-right">
          <span className="fdm-status-badge">{hero.status}</span>
          <p className="fdm-status-note">{hero.statusNote}</p>
          <p className="fdm-creator">
            {hero.creator}, {hero.creatorRole}
          </p>
        </div>
      </section>

      <div className="fdm-tabs" role="tablist" aria-label="Fatura katmanları">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`fdm-tab${activeTab === tab ? " fdm-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="fdm-body">
        <div className="fdm-main-panels">
          <section className="fdm-panel" aria-labelledby="fdm-customer-title">
            <div className="fdm-panel-head">
              <h2 id="fdm-customer-title">{customer.title}</h2>
              <button type="button" className="fdm-mini-btn">
                {customer.detailBtn}
              </button>
            </div>
            <dl className="fdm-fields">
              {customer.fields.map((field) => (
                <div key={field.label} className="fdm-field">
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="fdm-split">
            <section className="fdm-panel" aria-labelledby="fdm-desc-title">
              <h2 id="fdm-desc-title">{description.title}</h2>
              <p className="fdm-text-block">{description.text}</p>
            </section>
            <section className="fdm-panel" aria-labelledby="fdm-notes-title">
              <h2 id="fdm-notes-title">{notes.title}</h2>
              <p className="fdm-text-block">{notes.text}</p>
            </section>
          </div>

          <div className="fdm-split">
            <section className="fdm-panel" aria-labelledby="fdm-totals-title">
              <h2 id="fdm-totals-title">{totals.title}</h2>
              <table className="fdm-totals-table">
                <thead>
                  <tr>
                    <th>Açıklama</th>
                    <th>Tutar (TRY)</th>
                  </tr>
                </thead>
                <tbody>
                  {totals.rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Genel Toplam</td>
                    <td>{totals.grandTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </section>

            <section className="fdm-panel" aria-labelledby="fdm-payment-title">
              <h2 id="fdm-payment-title">{payment.title}</h2>
              <dl className="fdm-fields">
                {payment.fields.map((field) => (
                  <div key={field.label} className="fdm-field">
                    <dt>{field.label}</dt>
                    <dd>
                      {"tone" in field && field.tone === "success" ? (
                        <span className="fdm-pay-ok">✓ {field.value}</span>
                      ) : (
                        field.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="fdm-mini-btn fdm-mini-btn--block">
                {payment.historyBtn}
              </button>
            </section>
          </div>
        </div>

        <aside className="fdm-aside">
          <section className="fdm-panel fdm-panel--context" aria-labelledby="fdm-context-title">
            <h2 id="fdm-context-title">{context.title}</h2>
            <p className="fdm-einvoice">{context.eInvoice}</p>
            <dl className="fdm-context-rows">
              {context.rows.map((row) => (
                <div key={row.label} className="fdm-context-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="fdm-actions" aria-label="Fatura işlemleri">
            {context.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`fdm-action-btn fdm-action-btn--${action.tone}`}
              >
                {action.label}
              </button>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
