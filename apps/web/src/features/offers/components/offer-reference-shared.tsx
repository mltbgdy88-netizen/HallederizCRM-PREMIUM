"use client";

import Link from "next/link";
import type { Customer, Offer } from "@hallederiz/types";
import type { ReactNode } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  OFFER_PREFILL_NOTE,
  buildQuickOfferHref,
  buildQuickOrderFromOfferHref,
  offerInfoFields,
  offerTotalsFields,
  type OfferReferenceKpi,
  type OfferReferenceModel,
  type OfferTimelineEvent
} from "../utils/map-offer-detail-to-reference";

export function OfferReferenceShell({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ofd-page hz-offers-detail-page ${className}`.trim()}>
      <div className="ofd-shell">{children}</div>
    </section>
  );
}

export function OfferReferenceLoadingState() {
  return (
    <OfferReferenceShell>
      <div className="ofd-state" role="status" aria-live="polite">
        <div className="ofd-state__spinner" aria-hidden />
        <h2>Teklif yükleniyor</h2>
        <p>Fiyat slotları, satırlar ve follow-up kayıtları hazırlanıyor.</p>
      </div>
    </OfferReferenceShell>
  );
}

export function OfferReferenceNotFoundState() {
  return (
    <OfferReferenceShell>
      <div className="ofd-state" role="alert">
        <h2>Teklif bulunamadı</h2>
        <p>Seçilen teklif bulunamadı veya erişim kapsamında değil.</p>
        <Link href="/teklifler" className="ofd-state__link">
          Teklif listesine dön
        </Link>
      </div>
    </OfferReferenceShell>
  );
}

export function OfferReferenceHeader({
  title,
  meta,
  backHref = "/teklifler",
  backLabel = "← Listeye dön",
  quickHref
}: {
  title: string;
  meta: string;
  backHref?: string;
  backLabel?: string;
  quickHref?: string;
}) {
  return (
    <header className="ofd-header">
      <div className="ofd-header__main">
        <p className="ofd-header__eyebrow">Teklifler</p>
        <h1>{title}</h1>
        <p className="ofd-header__meta">{meta}</p>
      </div>
      <div className="ofd-header__actions">
        {quickHref ? (
          <Link href={quickHref} className="ofd-header__btn ofd-header__btn--primary">
            Hızlı İşlem
          </Link>
        ) : null}
        <Link href={backHref} className="ofd-header__btn">
          {backLabel}
        </Link>
      </div>
    </header>
  );
}

export function OfferReferenceDemoBand() {
  if (!dataSourceConfig.useDemoData) {
    return null;
  }
  return (
    <p className="ofd-demo-band" role="status">
      Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, gönder ve dönüşüm aksiyonları canlıda bağlı değildir.
    </p>
  );
}

export function OfferReferenceKpiStrip({ kpis }: { kpis: OfferReferenceKpi[] }) {
  return (
    <section className="ofd-kpi-strip" aria-label="Teklif özeti">
      {kpis.map((kpi) => (
        <article key={kpi.label} className={`ofd-kpi${kpi.tone ? ` ofd-kpi--${kpi.tone}` : ""}`}>
          <span className="ofd-kpi__label">{kpi.label}</span>
          <strong className="ofd-kpi__value">{kpi.value}</strong>
          <span className="ofd-kpi__hint">{kpi.hint}</span>
        </article>
      ))}
    </section>
  );
}

export function OfferReferenceFieldGrid({
  fields
}: {
  fields: Array<{ label: string; value: string; full?: boolean }>;
}) {
  return (
    <div className="ofd-field-grid">
      {fields.map((field) => (
        <label key={field.label} className={`ofd-field${field.full ? " ofd-field--full" : ""}`}>
          <span>{field.label}</span>
          <strong>{field.value || "—"}</strong>
        </label>
      ))}
    </div>
  );
}

export function OfferReferenceSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="ofd-section">
      <header className="ofd-section__head">
        <h2>{title}</h2>
      </header>
      {description ? <p className="ofd-section__desc">{description}</p> : null}
      {children}
    </section>
  );
}

export function OfferReferenceSideCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="ofd-side-card">
      <header className="ofd-side-card__head">
        <h3>{title}</h3>
      </header>
      {children}
    </section>
  );
}

export function OfferReferenceSideList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <ul className="ofd-side-list">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value || "—"}</strong>
        </li>
      ))}
    </ul>
  );
}

export function OfferReferenceSidePanel({
  offer,
  customer,
  model,
  onConvert,
  onSend,
  actions
}: {
  offer: Offer;
  customer: Customer | null;
  model: OfferReferenceModel;
  onConvert: () => void;
  onSend: () => void;
  actions?: ReactNode;
}) {
  const customerId = customer?.id ?? offer.customerId;

  return (
    <>
      <OfferReferenceSideCard title="Müşteri">
        <OfferReferenceSideList
          items={[
            { label: "Cari adı", value: customer?.name ?? "—" },
            { label: "Telefon", value: customer?.phone ?? "—" },
            { label: "E-posta", value: customer?.email ?? "—" },
            { label: "Fiyat grubu", value: customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot }
          ]}
        />
        {customer ? (
          <Link href={`/cariler/${customer.id}`} className="ofd-side-link">
            Cari detayına git →
          </Link>
        ) : null}
      </OfferReferenceSideCard>

      <OfferReferenceSideCard title="Toplamlar">
        <OfferReferenceSideList items={offerTotalsFields(offer).map((field) => ({ label: field.label, value: field.value }))} />
      </OfferReferenceSideCard>

      <OfferReferenceSideCard title="Gönderim / Belge">
        <OfferReferenceSideList
          items={[
            { label: "Belge durumu", value: model.documentStatusLabel },
            { label: "Gönderim", value: offer.sentAt ? "Gönderildi" : "Bekliyor" },
            { label: "Referans", value: offer.offerNo }
          ]}
        />
        <button type="button" className="ofd-inline-btn" onClick={onSend}>
          Gönderim paneli
        </button>
      </OfferReferenceSideCard>

      <OfferReferenceSideCard title="Dönüşüm">
        <OfferReferenceSideList
          items={[
            { label: "Durum", value: model.conversionStatusLabel },
            { label: "Satır sayısı", value: String(offer.lines.length) },
            { label: "Toplam", value: offer.grandTotal.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + ` ${offer.currency}` }
          ]}
        />
        <p className="ofd-note">{OFFER_PREFILL_NOTE}</p>
        <button type="button" className="ofd-inline-btn ofd-inline-btn--primary" onClick={onConvert}>
          Siparişe dönüştür
        </button>
        <Link href={buildQuickOrderFromOfferHref(offer.id, customerId)} className="ofd-side-link">
          Hızlı İşlem sipariş sekmesi →
        </Link>
      </OfferReferenceSideCard>

      {actions}
    </>
  );
}

export function OfferReferenceTimelineList({ events }: { events: OfferTimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="ofd-empty">Bu teklif için zaman akışı kaydı bulunmuyor.</p>;
  }

  return (
    <ul className="ofd-timeline">
      {events.map((event) => (
        <li key={event.id} className="ofd-timeline__item">
          <div className="ofd-timeline__meta">
            <strong>{event.title}</strong>
            <span>{event.date ? new Date(event.date).toLocaleString("tr-TR") : "—"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OfferReferenceCustomerPanel({ offer, customer }: { offer: Offer; customer: Customer | null }) {
  return (
    <OfferReferenceFieldGrid
      fields={[
        { label: "Cari adı", value: customer?.name ?? offer.customerId },
        { label: "Cari kodu", value: customer?.code ?? "—" },
        { label: "Telefon", value: customer?.phone ?? "—" },
        { label: "E-posta", value: customer?.email ?? "—" },
        { label: "Şehir", value: customer?.city ?? "—" },
        { label: "Vergi no", value: customer?.taxNumber ?? "—" },
        { label: "Risk", value: customer?.riskLevel ?? "—" },
        { label: "Fiyat grubu", value: customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot },
        { label: "Adres", value: customer?.addressLine ?? "—", full: true }
      ]}
    />
  );
}

export { offerInfoFields, offerTotalsFields, buildQuickOrderFromOfferHref, buildQuickOfferHref, OFFER_PREFILL_NOTE };
