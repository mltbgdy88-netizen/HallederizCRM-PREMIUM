import type { Customer, Offer } from "@hallederiz/types";
import { getOfferStatusLabel } from "../queries/offer-mock-data";

export function OfferHeaderInfo({ offer, customers }: { offer: Offer; customers: Customer[] }) {
  const customer = customers.find((item) => item.id === offer.customerId);

  return (
    <section className="hz-content-card crm-identity-header">
      <div>
        <p className="drawer-eyebrow">Teklif Bilgisi</p>
        <h3>{offer.offerNo}</h3>
        <p className="hz-content-card-description">
          {customer?.name ?? "-"} | {getOfferStatusLabel(offer.status)} | Gecerlilik: {new Date(offer.validUntil).toLocaleDateString("tr-TR")}
        </p>
      </div>

      <div className="hz-modal-panel-grid offer-header-form">
        <label className="hz-field-label">
          Musteri
          <select className="hz-control" value={offer.customerId} disabled>
            {customers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="hz-field-label">
          Not
          <input className="hz-control" value={offer.note ?? ""} readOnly />
        </label>
      </div>
    </section>
  );
}
