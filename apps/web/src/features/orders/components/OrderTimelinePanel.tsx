import type { PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { dateLabel } from "../utils";

export function OrderTimelinePanel({ order, payments, warehouseOrders }: { order: SaleOrder; payments: PaymentReceipt[]; warehouseOrders: WarehouseOrder[] }) {
  const events = [
    { title: "Sipariş oluştu", date: order.createdAt },
    order.confirmedAt ? { title: "Sipariş onaylandı", date: order.confirmedAt } : null,
    ...payments.map((payment) => ({ title: `${payment.receiptNo} tahsilat bağlandı`, date: payment.receivedAt })),
    ...warehouseOrders.map((warehouseOrder) => ({ title: `${warehouseOrder.warehouseOrderNo} depo emri`, date: warehouseOrder.createdAt }))
  ].filter((event): event is { title: string; date: string } => Boolean(event));

  return (
    <div className="hz-tab-content">
      <h3>Zaman çizelgesi</h3>
      <ul className="hz-side-list">
        {events.map((event) => (
          <li key={`${event.title}-${event.date}`}>
            {dateLabel(event.date)} — {event.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
