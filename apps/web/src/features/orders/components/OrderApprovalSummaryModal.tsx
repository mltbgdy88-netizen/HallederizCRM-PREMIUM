import { summarizeOrderOperationalImpact } from "@hallederiz/domain";
import type { SaleOrder } from "@hallederiz/types";

export function OrderApprovalSummaryModal({ open, order, onClose }: { open: boolean; order: SaleOrder; onClose: () => void }) {
  if (!open) {
    return null;
  }

  const impact = summarizeOrderOperationalImpact(order);

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Onay özeti</p>
            <h3>{impact.approvalMayBeRequired ? "Onay gerekebilir" : "Standart akış"}</h3>
            <p className="muted">Onay kararı canlıda politika ve onay kuyruğuna bağlanır.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>Yüksek tutar kontrolü: {order.grandTotal > 150000 ? "Gerekli" : "Gerekli değil"}</li>
            <li>Tahsilat eksiği: {impact.paymentMissing ? "Var" : "Yok"}</li>
            <li>Fabrika siparişi: {impact.needsFactoryOrder ? "Gerekli" : "Gerekli değil"}</li>
            <li>Denetim: onay veya red kararı kayıt zaman çizelgesine yazılır.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

