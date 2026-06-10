"use client";

import {
  OzetKpiIcon,
  TeklifBadge,
  TeklifKatmanContextPanel,
  TekliflerKatmanTabs,
  UserAvatar
} from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

export function TekliflerKatmanOzetPage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { header, layer } = data;

  return (
    <div className="tkm-home">
      <header className="tkm-page-head">
        <div className="tkm-page-head-top">
          <nav className="tkm-breadcrumb" aria-label="Breadcrumb">
            {header.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="tkm-breadcrumb-sep">/</span> : null}
                {part}
              </span>
            ))}
          </nav>
          <a className="tkm-back" href="/teklifler">
            ← Teklifler Listesine Dön
          </a>
        </div>
        <div className="tkm-page-head-main">
          <div>
            <h1>{header.title}</h1>
            <div className="tkm-customer-row">
              <strong>{header.customer}</strong>
              <TeklifBadge>{header.status}</TeklifBadge>
              <span className="tkm-muted">Teklif: {header.quoteId}</span>
              <span className="tkm-muted">Geçerlilik: {header.validUntil}</span>
            </div>
          </div>
          <div className="tkm-head-actions">
            <button type="button" className="tkm-btn tkm-btn--primary">
              + Yeni Teklif
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Diğer İşlemler ▾
            </button>
          </div>
        </div>
      </header>

      <TekliflerKatmanTabs active="ozet" tabs={layer.tabs} />

      <div className="tkm-workspace">
        <div className="tkm-main">
          <section className="tkm-kpi-row" aria-label="Teklif özet kartları">
            {(data.summary.length > 0
              ? [
                  { id: "subtotal", label: data.summary[0]?.label ?? "Ara Toplam", value: data.summary[0]?.value ?? "—", sub: "KDV Hariç", tone: "green" as const },
                  { id: "discount", label: data.summary[1]?.label ?? "Toplam İskonto", value: data.summary[1]?.value ?? "—", sub: "İskonto", tone: "teal" as const },
                  { id: "vat", label: data.summary[2]?.label ?? "KDV", value: data.summary[2]?.value ?? "—", sub: "KDV", tone: "teal" as const },
                  { id: "total", label: data.summary.find((s) => s.strong)?.label ?? "Genel Toplam", value: data.summary.find((s) => s.strong)?.value ?? header.total, sub: "KDV Dahil", tone: "green" as const }
                ]
              : layer.ozetKpis
            ).map((kpi) => (
              <article key={kpi.id} className={`tkm-kpi-card tkm-kpi-card--${kpi.tone}`}>
                <OzetKpiIcon tone={kpi.tone} />
                <div>
                  <span className="tkm-kpi-value">{kpi.value}</span>
                  <span className="tkm-kpi-label">{kpi.label}</span>
                  <span className="tkm-kpi-sub">{kpi.sub}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="tkm-detail-grid" aria-label="Teklif detayları">
            <div className="tkm-detail-col">
              {layer.ozetDetailsLeft.map((row) => {
                const mappedValue =
                  row.label === "Teklif Numarası"
                    ? header.quoteId
                    : row.label === "Teklif Tarihi"
                      ? header.offerDate
                      : row.label === "Geçerlilik Tarihi"
                        ? header.validUntil
                        : row.label === "Para Birimi"
                          ? header.currency
                          : row.value;
                return (
                <div key={row.label} className="tkm-detail-row">
                  <span className="tkm-detail-label">{row.label}</span>
                  <span className="tkm-detail-value">
                    {row.badge ? <TeklifBadge>{mappedValue}</TeklifBadge> : null}
                    {row.avatar ? (
                      <>
                        <UserAvatar name={mappedValue} />
                        {mappedValue}
                      </>
                    ) : (
                      !row.badge && mappedValue
                    )}
                  </span>
                </div>
              )})}
            </div>
            <div className="tkm-detail-col">
              {layer.ozetDetailsRight.map((row) => {
                const mappedValue =
                  row.label === "Teklif Durumu"
                    ? header.status
                    : row.value;
                return (
                <div key={row.label} className="tkm-detail-row">
                  <span className="tkm-detail-label">{row.label}</span>
                  <span className="tkm-detail-value">
                    {row.badge ? <TeklifBadge>{mappedValue}</TeklifBadge> : mappedValue}
                  </span>
                </div>
              )})}
            </div>
          </section>
        </div>

        <TeklifKatmanContextPanel context={layer.context} />
      </div>
    </div>
  );
}

