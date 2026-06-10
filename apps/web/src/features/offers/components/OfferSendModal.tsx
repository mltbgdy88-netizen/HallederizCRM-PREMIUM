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
            <p className="drawer-eyebrow">Teklif Gönder</p>
            <h3>{offer.offerNo}</h3>
            <p className="muted">{customer?.name ?? "—"} için gönderim kanalı hazırlanıyor.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>PDF önizleme: taslak hazırlanır</li>
            <li>Gönderim kanalı: WhatsApp / E-posta seçilecek</li>
            <li>Son gönderim durumu belge teslim kaydına bağlanacak</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

