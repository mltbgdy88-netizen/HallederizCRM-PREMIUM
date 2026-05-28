import type { Customer, Offer, PriceSlotConfig } from "@hallederiz/types";

export function OfferLineEditor({
  offer,
  customer,
  priceSlots
}: {
  offer: Offer;
  customer: Customer | null;
  priceSlots: PriceSlotConfig[];
}) {
  return (
    <section className="hz-content-card">
      <h3>Satır Ekleme</h3>
      <p className="hz-content-card-description">
        Varsayılan fiyat grubu: {customer?.pricingProfile.priceSlotLabelSnapshot ?? offer.priceSlotLabelSnapshot}
      </p>

      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Ürün Kodu / Barkod / QR
          <input placeholder="Ürün ara" readOnly />
        </label>
        <label>
          Adet
          <input type="number" defaultValue={1} min={1} />
        </label>
        <label>
          Fiyat Slotu
          <select defaultValue={customer?.pricingProfile.selectedPriceSlotNo ?? offer.priceSlotNoSnapshot}>
            {priceSlots.map((slot) => (
              <option key={slot.slotNumber} value={slot.slotNumber}>{slot.slotName}</option>
            ))}
          </select>
        </label>
        <label>
          Para Birimi
          <select defaultValue={offer.currency}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label>
          İndirim %
          <input type="number" defaultValue={0} min={0} max={100} />
        </label>
      </div>

      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" disabled>
          Satıra ekle
        </button>
        <span className="hz-badge hz-badge-info">Fiyat değişirse satırda işaretlenir</span>
      </div>
    </section>
  );
}
