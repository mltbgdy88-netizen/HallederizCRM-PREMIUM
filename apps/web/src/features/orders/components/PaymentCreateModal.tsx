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
            <p className="drawer-eyebrow">Tahsilat ekle</p>
            <h3>{order.orderNo}</h3>
            <p className="muted">Tahsis satırı sipariş açık bakiyesine bağlanır.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <div className="hz-filter-grid">
            <label>
              Müşteri
              <input readOnly value={order.customerId} />
            </label>
            <label>
              Yöntem
              <select defaultValue="transfer" disabled>
                <option value="transfer">Havale/EFT</option>
                <option value="cash">Nakit</option>
                <option value="card">Kart</option>
              </select>
            </label>
            <label>
              Tutar
              <input type="number" defaultValue={openAmount} readOnly />
            </label>
            <label>
              Açıklama
              <input defaultValue={`${order.orderNo} için tahsilat`} readOnly />
            </label>
          </div>
          <p className="hz-content-card-description hz-margin-top-sm">
            Tahsis hedefi: {order.orderNo} / açık bakiye {money(openAmount, order.currency)}
          </p>
        </div>
      </section>
    </div>
  );
}

