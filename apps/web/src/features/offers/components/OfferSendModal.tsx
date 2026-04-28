import type { Customer, Offer } from "@hallederiz/types";

export function OfferSendModal({
  open,
  offer,
  customer,
  onClose
}: {
  open: boolean;
  offer: Offer;
  customer: Customer | null;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Teklif Gonder</p>
            <h3>{offer.offerNo}</h3>
            <p className="muted">{customer?.name ?? "-"} icin gonderim kanali hazirlaniyor.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>PDF onizleme: placeholder hazir</li>
            <li>Gonderim kanali: WhatsApp / E-posta secilecek</li>
            <li>Son gonderim durumu belge teslim kaydina baglanacak</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
