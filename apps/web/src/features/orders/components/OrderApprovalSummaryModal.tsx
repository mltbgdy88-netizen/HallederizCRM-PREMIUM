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
            <p className="drawer-eyebrow">Approval Ozeti</p>
            <h3>{impact.approvalMayBeRequired ? "Onay Gerekebilir" : "Standart Akis"}</h3>
            <p className="muted">Policy engine baglantisi icin foundation kaydi.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            <li>Yuksek tutar kontrolu: {order.grandTotal > 150000 ? "Gerekli" : "Gerekli degil"}</li>
            <li>Tahsilat eksigi: {impact.paymentMissing ? "Var" : "Yok"}</li>
            <li>Fabrika siparisi: {impact.needsFactoryOrder ? "Gerekli" : "Gerekli degil"}</li>
            <li>Audit: onay veya red karari entity timeline'a yazilacak.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
