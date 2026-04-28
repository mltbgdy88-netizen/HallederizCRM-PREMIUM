import type { Customer, SaleOrder } from "@hallederiz/types";
import { money } from "../utils";
import { getOrderStatusLabel } from "../queries/order-mock-data";

export function OrderHeaderInfo({ order, customer }: { order: SaleOrder; customer: Customer | null }) {
  return (
    <section className="crm-identity-header">
      <div>
        <p className="drawer-eyebrow">{order.source === "teklif_donusumu" ? "Tekliften Siparis" : "Siparis"}</p>
        <h2>{order.orderNo}</h2>
        <p>{customer?.name ?? order.customerId} icin {money(order.grandTotal, order.currency)} tutarli operasyon kaydi.</p>
      </div>
      <div className="stock-filter-actions">
        <span className="hz-badge hz-badge-info">{getOrderStatusLabel(order.status)}</span>
        <span className="hz-badge hz-badge-warning">{order.priceSlotLabelSnapshot}</span>
      </div>
    </section>
  );
}
