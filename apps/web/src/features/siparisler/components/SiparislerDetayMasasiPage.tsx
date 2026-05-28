"use client";

import Link from "next/link";
import { useState } from "react";
import { KpiIcon } from "@/components/reference/icons";
import type { SdmTab } from "@/features/siparisler/data/siparisler-detay-mock";
import { useSiparislerDetayReferenceData } from "@/features/siparisler/hooks/use-siparisler-detay-reference-data";
import { useToast } from "@/providers/toast-provider";
import { SiparisFulfillmentLinks } from "@/features/siparisler/components/SiparisFulfillmentLinks";
import { SiparisBadge } from "./SiparislerKatmanShared";

export function SiparislerDetayMasasiPage({ orderId }: { orderId?: string } = {}) {
  const { pushToast } = useToast();
  const { data } = useSiparislerDetayReferenceData(orderId);
  const { demoBanner } = data;
  const {
    fulfillment,
    page,
    finKpis,
    tabs,
    infoLeft,
    infoRight,
    lines,
    lineTotals,
    approval,
    delivery,
    invoice,
    notes,
    asideCustomer
  } = data;
  const [activeTab, setActiveTab] = useState<SdmTab>("Özet");

  return (
    <div className="sdm-home">
      {demoBanner ? (
        <p className="sdm-demo-banner" role="status">
          {demoBanner}
        </p>
      ) : null}
      <header className="sdm-head">
        <div className="sdm-head-copy">
          <nav className="sdm-crumb" aria-label="Konum">
            {page.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="sdm-crumb-sep">›</span> : null}
                <span className={i === page.breadcrumb.length - 1 ? "sdm-crumb-current" : ""}>{part}</span>
              </span>
            ))}
          </nav>
          <div className="sdm-title-row">
            <h1>
              {page.title} / <span>{page.orderId}</span>
            </h1>
            <SiparisBadge>{page.status}</SiparisBadge>
            <span className="sdm-date">{page.orderDate}</span>
          </div>
        </div>
        <div className="sdm-head-actions">
          <Link href="/siparisler/yeni" className="sdm-btn sdm-btn--primary">
            + Yeni Sipariş
          </Link>
          <button
            type="button"
            className="sdm-btn sdm-btn--outline"
            onClick={() => pushToast("Sipariş düzenleme yalnızca onaylı backend akışında (demo).")}
          >
            Düzenle
          </button>
          <button
            type="button"
            className="sdm-btn sdm-btn--outline"
            onClick={() => pushToast("Ek işlemler menüsü demo modunda.")}
          >
            Diğer İşlemler ▾
          </button>
        </div>
      </header>

      <SiparisFulfillmentLinks
        fulfillment={fulfillment}
        salesOrderId={data.orderId}
        className="sdm-fulfillment-bar"
      />

      <section className="sdm-fin-row" aria-label="Finansal özet kartları">
        {finKpis.map((kpi) => (
          <article key={kpi.id} className={`sdm-fin-card sdm-fin-card--${kpi.tone}`}>
            <span className={`sdm-fin-icon sdm-fin-icon--${kpi.tone}`}>
              <KpiIcon tone={kpi.tone === "gold" ? "gold" : kpi.tone === "teal" ? "teal" : kpi.tone === "orange" ? "orange" : kpi.tone === "blue" ? "blue" : "green"} />
            </span>
            <div>
              <p className="sdm-fin-label">{kpi.label}</p>
              <p className="sdm-fin-value">{kpi.value}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="sdm-tabs" role="tablist" aria-label="Sipariş katmanları">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`sdm-tab${activeTab === tab ? " sdm-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="sdm-body">
        <div className="sdm-main">
          <section className="sdm-panel" aria-labelledby="sdm-info-title">
            <h2 id="sdm-info-title">Sipariş Bilgileri</h2>
            <div className="sdm-info-grid">
              <dl className="sdm-fields">
                {infoLeft.map((field) => (
                  <div key={field.label} className={"full" in field && field.full ? "sdm-field--full" : undefined}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
              <dl className="sdm-fields">
                {infoRight.map((field) => (
                  <div key={field.label}>
                    <dt>{field.label}</dt>
                    <dd>
                      {"badge" in field ? <SiparisBadge>{field.value}</SiparisBadge> : null}
                      {"avatar" in field ? (
                        <span className="sdm-person">
                          <span className="sdm-avatar">{field.avatar}</span>
                          {field.value}
                        </span>
                      ) : (
                        !("badge" in field) && field.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="sdm-panel sdm-panel--lines" aria-labelledby="sdm-lines-title">
            <header className="sdm-lines-head">
              <h2 id="sdm-lines-title">Sipariş Satırları</h2>
            </header>
            <div className="sdm-table-wrap">
              <table className="sdm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ürün Kodu</th>
                    <th>Ürün Adı</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Birim Fiyat</th>
                    <th>İndirim (%)</th>
                    <th>KDV (%)</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row) => (
                    <tr key={row.no}>
                      <td>{row.no}</td>
                      <td>{row.code}</td>
                      <td>{row.name}</td>
                      <td>{row.qty}</td>
                      <td>{row.unit}</td>
                      <td>{row.price}</td>
                      <td>{row.disc}</td>
                      <td>{row.tax}</td>
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="sdm-lines-foot">
              <span>Toplam {lines.length} satır</span>
              <div className="sdm-pagination">
                <select defaultValue="10" aria-label="Sayfa boyutu">
                  <option value="10">10 satır</option>
                </select>
                <span>1 / 1</span>
              </div>
              <dl className="sdm-line-totals">
                {lineTotals.map((row) => (
                  <div
                    key={row.label}
                    className={[
                      "strong" in row && row.strong ? "sdm-total--strong" : "",
                      "warn" in row && row.warn ? "sdm-total--warn" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </footer>
          </section>
        </div>

        <aside className="sdm-aside" aria-label="Sipariş bağlamı">
          <section className="sdm-aside-panel">
            <h2>Sipariş Bağlamı</h2>
            <dl className="sdm-aside-dl">
              <div>
                <dt>Sipariş No</dt>
                <dd>{page.orderId}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>
                  <SiparisBadge>{page.status}</SiparisBadge>
                </dd>
              </div>
              <div>
                <dt>Müşteri</dt>
                <dd>{asideCustomer}</dd>
              </div>
            </dl>
          </section>

          <section className="sdm-aside-panel">
            <h2>Onay Süreci</h2>
            <ol className="sdm-approval">
              {approval.map((step) => (
                <li
                  key={step.title}
                  className={[
                    step.done ? "sdm-approval--done" : "",
                    "active" in step && step.active ? "sdm-approval--active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="sdm-approval-dot" aria-hidden />
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="sdm-aside-panel">
            <h2>Teslimat Bilgileri</h2>
            <dl className="sdm-aside-dl">
              <div>
                <dt>Durum</dt>
                <dd>{delivery.status}</dd>
              </div>
              <div>
                <dt>Planlanan</dt>
                <dd>{delivery.planned}</dd>
              </div>
              <div>
                <dt>İlerleme</dt>
                <dd>{delivery.progress}</dd>
              </div>
            </dl>
            <button type="button" className="sdm-btn sdm-btn--outline sdm-btn--block">
              {delivery.cta}
            </button>
          </section>

          <section className="sdm-aside-panel">
            <h2>Fatura Bilgileri</h2>
            <p className="sdm-muted">{invoice.text}</p>
            <button
              type="button"
              className="sdm-btn sdm-btn--primary sdm-btn--block"
              onClick={() => pushToast("Fatura oluşturma onay akışı gerektirir (demo).")}
            >
              {invoice.cta}
            </button>
          </section>

          <section className="sdm-aside-panel">
            <h2>Notlar</h2>
            <textarea className="sdm-notes-input" placeholder={notes.placeholder} defaultValue={notes.sample} readOnly />
          </section>
        </aside>
      </div>
    </div>
  );
}

