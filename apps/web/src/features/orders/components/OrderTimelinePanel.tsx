import type { PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { dateLabel } from "../utils";

export function OrderTimelinePanel({ order, payments, warehouseOrders }: { order: SaleOrder; payments: PaymentReceipt[]; warehouseOrders: WarehouseOrder[] }) {
  const events = [
    { title: "Siparis olustu", date: order.createdAt },
    order.confirmedAt ? { title: "Siparis onaylandi", date: order.confirmedAt } : null,
    ...payments.map((payment) => ({ title: `${payment.receiptNo} tahsilat baglandi`, date: payment.receivedAt })),
    ...warehouseOrders.map((warehouseOrder) => ({ title: `${warehouseOrder.warehouseOrderNo} depo emri`, date: warehouseOrder.createdAt }))
  ].filter((event): event is { title: string; date: string } => Boolean(event));

  return (
    <div className="hz-tab-content">
      <h3>Timeline</h3>
      <ul className="hz-side-list">
        {events.map((event) => (
          <li key={`${event.title}-${event.date}`}>{dateLabel(event.date)} - {event.title}</li>
        ))}
      </ul>
    </div>
  );
}
