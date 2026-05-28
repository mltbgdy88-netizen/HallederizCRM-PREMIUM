import type { Customer, Offer } from "@hallederiz/types";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferTotalsPanel({ offer, customer }: { offer: Offer; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Teklif toplamı</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Ara toplam: {money(offer.subtotal, offer.currency)}</li>
        <li>İndirim: {money(offer.discountTotal, offer.currency)}</li>
        <li>KDV %{offer.taxRate}: {money(offer.taxTotal, offer.currency)}</li>
        <li>Genel toplam: {money(offer.grandTotal, offer.currency)}</li>
        <li>Müşteri: {customer?.name ?? "—"}</li>
        <li>Atanmış fiyat grubu: {customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot}</li>
        <li>Operasyon notu: Müşteri fiyat grubu ve stok uygunluğu standart teklif akışı için uygun görünüyor.</li>
      </ul>
    </section>
  );
}
