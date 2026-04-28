import type { Customer, Offer } from "@hallederiz/types";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferTotalsPanel({ offer, customer }: { offer: Offer; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Teklif Toplami</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Ara Toplam: {money(offer.subtotal, offer.currency)}</li>
        <li>Indirim: {money(offer.discountTotal, offer.currency)}</li>
        <li>KDV %{offer.taxRate}: {money(offer.taxTotal, offer.currency)}</li>
        <li>Genel Toplam: {money(offer.grandTotal, offer.currency)}</li>
        <li>Musteri: {customer?.name ?? "-"}</li>
        <li>Atanmis Fiyat Grubu: {customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot}</li>
        <li>AI Satis Notu: Musteri fiyat grubu ve stok uygunlugu standart teklif akisi icin uyumlu.</li>
      </ul>
    </section>
  );
}
