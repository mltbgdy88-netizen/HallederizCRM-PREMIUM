"use client";

import {
  SiparisKatmanContextPanel,
  SiparislerKatmanTabs,
  SiparisEntityCardsWithData,
  SiparisKatmanHeaderWithData,
  SkmKpiIcon
} from "./SiparislerKatmanShared";
import { SiparisFulfillmentLinks } from "@/features/siparisler/components/SiparisFulfillmentLinks";
import { useSiparislerKatmanReferenceData } from "@/features/siparisler/hooks/use-siparisler-katman-reference-data";

export function SiparislerKatmanOzetPage() {
  const { data } = useSiparislerKatmanReferenceData();
  const { header, layer } = data;
  const entityHeader = {
    ...layer.header,
    orderId: header.orderId,
    orderDate: header.orderDateLabel,
    status: header.status,
    customer: header.customerName,
    currency: header.currency
  };

  return (
    <div className="skm-home">
      <SiparisKatmanHeaderWithData header={entityHeader} />
      <SiparisFulfillmentLinks
        fulfillment={data.fulfillment}
        salesOrderId={data.orderId}
        className="skm-fulfillment-bar"
      />
      <SiparisEntityCardsWithData header={entityHeader} />

      <SiparislerKatmanTabs active="ozet" tabs={layer.tabs} />

      <div className="skm-workspace">
        <div className="skm-main">
          <section className="skm-kpi-row" aria-label="Sipariş finansal özet">
            {data.kpis.map((kpi) => (
              <article key={kpi.id} className={`skm-kpi-card skm-kpi-card--${kpi.tone}`}>
                <SkmKpiIcon tone={kpi.tone ?? "green"} />
                <div>
                  <span className="skm-kpi-value">{kpi.value}</span>
                  <span className="skm-kpi-label">{kpi.label}</span>
                  <span className="skm-kpi-sub">{kpi.sub}</span>
                </div>
              </article>
            ))}
          </section>

          <div className="skm-ozet-grid">
            <section className="skm-panel" aria-labelledby="skm-ozet-info">
              <h2 id="skm-ozet-info">Sipariş Özeti</h2>
              <h3>Sipariş Bilgileri</h3>
              <dl className="skm-detail-list">
                {layer.ozetInfo.map((row) => (
                  <div key={row.label} className={"full" in row && row.full ? "skm-detail-row--full" : undefined}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="skm-panel" aria-labelledby="skm-status-title">
              <h2 id="skm-status-title">Sipariş Durumu</h2>
              <ol className="skm-stepper">
                {layer.statusSteps.map((step) => (
                  <li
                    key={step.label}
                    className={[
                      step.done ? "skm-step--done" : "",
                      "active" in step && step.active ? "skm-step--active" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="skm-step-dot" aria-hidden />
                    <span>{step.label}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="skm-panel skm-panel--extra" aria-labelledby="skm-extra-title">
              <h2 id="skm-extra-title">Ek Bilgiler</h2>
              <dl className="skm-detail-list">
                {layer.extraInfo.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        <SiparisKatmanContextPanel context={layer.context} />
      </div>
    </div>
  );
}

