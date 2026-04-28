import type { SaleOrder } from "@hallederiz/types";

export function SourcingPlanModal({ open, order, onClose }: { open: boolean; order: SaleOrder; onClose: () => void }) {
  if (!open) {
    return null;
  }

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hz-modal offer-small-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Kaynak Plani</p>
            <h3>{order.orderNo}</h3>
            <p className="muted">Merkez depo, fabrika ve split kaynak kararlarini izleyin.</p>
          </div>
          <button type="button" className="hz-btn hz-btn-secondary" onClick={onClose}>Kapat</button>
        </header>
        <div className="hz-modal-content hz-tab-content">
          <ul className="hz-side-list">
            {order.sourcePlans.map((plan) => (
              <li key={plan.id}>{plan.productId}: depo {plan.warehouseQuantity}, fabrika {plan.factoryQuantity} - {plan.status}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
