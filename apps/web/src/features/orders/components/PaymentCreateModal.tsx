import type { SaleOrder } from "@hallederiz/types";
import { money } from "../utils";

export function PaymentCreateModal({ open, order, onClose }: { open: boolean; order: SaleOrder; onClose: () => void }) {
  if (!open) {
    return null;
  }

  const openAmount = Math.max(order.grandTotal - order.paidTotal, 0);

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Tahsilat Ekle</p>
            <h3>{order.orderNo}</h3>
            <p className="muted">Allocation satiri siparis acik bakiyesine baglanir.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <div className="hz-filter-grid">
            <label>Musteri<input readOnly value={order.customerId} /></label>
            <label>Yontem<select defaultValue="transfer"><option value="transfer">Havale/EFT</option><option value="cash">Nakit</option><option value="card">Kart</option></select></label>
            <label>Tutar<input type="number" defaultValue={openAmount} /></label>
            <label>Aciklama<input defaultValue={`${order.orderNo} icin tahsilat`} /></label>
          </div>
          <p className="hz-content-card-description hz-margin-top-sm">Allocation hedefi: {order.orderNo} / acik bakiye {money(openAmount, order.currency)}</p>
        </div>
      </section>
    </div>
  );
}
