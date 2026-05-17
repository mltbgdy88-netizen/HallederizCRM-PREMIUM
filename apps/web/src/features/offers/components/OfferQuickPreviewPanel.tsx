import { buildOfferFollowUpSummary } from "@hallederiz/domain";
import type { Customer, Offer } from "@hallederiz/types";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferQuickPreviewPanel({ offer, customer }: { offer: Offer | null; customer: Customer | null }) {
  if (!offer || !customer) {
    return (
      <section className="hz-content-card">
        <h3>Teklif özeti</h3>
        <p className="hz-content-card-description">Tablodan bir teklif seçildiğinde follow-up ve belge özeti görünür.</p>
      </section>
    );
  }

  const followUp = buildOfferFollowUpSummary(offer.followUps);

  return (
    <section className="hz-content-card">
      <h3>{offer.offerNo}</h3>
      <p className="hz-content-card-description">{customer.name} için teklif özeti</p>

      <ul className="hz-side-list hz-margin-top-sm">
        <li>Toplam: {money(offer.grandTotal, offer.currency)}</li>
        <li>Durum: {getOfferStatusLabel(offer.status)}</li>
        <li>Fiyat grubu: {offer.priceSlotLabelSnapshot}</li>
        <li>Follow-up: {followUp.latestNote}</li>
        <li>Son gönderim: {offer.sentAt ? new Date(offer.sentAt).toLocaleString("tr-TR") : "Henüz gönderilmedi"}</li>
      </ul>
    </section>
  );
}
