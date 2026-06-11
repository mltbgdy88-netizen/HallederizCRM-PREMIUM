"use client";

import { convertOfferToOrderDraft } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../providers/toast-provider";
import { buildQuickOrderFromOfferHref, OFFER_PREFILL_NOTE } from "../utils/map-offer-detail-to-reference";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferConversionPanel({
  offer,
  customer,
  embedded = false
}: {
  offer: Offer;
  customer: Customer | null;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const draft = convertOfferToOrderDraft(offer, customer ?? undefined);
  const customerId = customer?.id ?? offer.customerId;
  const quickHref = buildQuickOrderFromOfferHref(offer.id, customerId);

  function handleConvert() {
    pushToast("Sipariş hazırlığı Hızlı İşlem'de açıldı; canlı kayıt onay gerektirir.");
    router.push(quickHref);
  }

  return (
    <section className={`ofd-conversion${embedded ? " ofd-conversion--embedded" : ""}`} aria-label="Siparişe dönüşüm">
      <header className="ofd-conversion__head">
        <h2>{embedded ? "Dönüşüm paneli" : "Siparişe dönüşüm özeti"}</h2>
        <span className="ofd-badge ofd-badge--gold">{offer.offerNo}</span>
      </header>
      <p className="ofd-section__desc">
        Sipariş taslağı Hızlı İşlem workbench üzerinden hazırlanır; canlı kayıt onay gerektirir.
      </p>
      <div className="ofd-field-grid">
        <label className="ofd-field">
          <span>Müşteri</span>
          <strong>{draft.customer.name ?? draft.customerId}</strong>
        </label>
        <label className="ofd-field">
          <span>Satır sayısı</span>
          <strong>{String(draft.lines.length)}</strong>
        </label>
        <label className="ofd-field">
          <span>Toplam</span>
          <strong>{money(offer.grandTotal, offer.currency)}</strong>
        </label>
        <label className="ofd-field">
          <span>Fiyat slotu</span>
          <strong>{draft.priceSlotLabelSnapshot}</strong>
        </label>
        <label className="ofd-field ofd-field--full">
          <span>Uyarı / not</span>
          <strong>{draft.warning || "—"}</strong>
        </label>
      </div>
      {draft.lines.length > 0 ? (
        <div className="ofd-table-wrap ofd-table-wrap--compact">
          <table className="ofd-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {draft.lines.slice(0, 6).map((line) => (
                <tr key={line.productId}>
                  <td>{line.productCode ?? line.productId}</td>
                  <td>{line.quantity}</td>
                  <td>{money(line.linePriceSnapshot.lineTotal, line.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="ofd-note">{OFFER_PREFILL_NOTE}</p>
      <div className="ofd-conversion__actions">
        <button type="button" className="ofd-actions__btn ofd-actions__btn--primary" onClick={handleConvert}>
          Hızlı İşlem&apos;de hazırla
        </button>
        <Link href={quickHref} className="ofd-inline-cta">
          Sipariş sekmesine git →
        </Link>
      </div>
    </section>
  );
}
