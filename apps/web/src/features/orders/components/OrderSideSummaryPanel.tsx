import { summarizeOrderOperationalImpact, validateDeliveryReadiness } from "@hallederiz/domain";
import type { Customer, PaymentReceipt, SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { money } from "../utils";
import { getDeliveryStatusLabel, getPaymentStatusLabel } from "../queries/order-mock-data";

export function OrderSideSummaryPanel({
  order,
  customer,
  payments,
  warehouseOrders
}: {
  order: SaleOrder;
  customer: Customer | null;
  payments: PaymentReceipt[];
  warehouseOrders: WarehouseOrder[];
}) {
  const impact = summarizeOrderOperationalImpact(order);
  const readiness = validateDeliveryReadiness(order, warehouseOrders);
  const orderPayments = payments.filter((payment) => payment.allocations.some((allocation) => allocation.targetId === order.id));

  return (
    <div className="hz-page-stack">
      <section className="hz-content-card">
        <h3>Siparis Ozeti</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          <li>Musteri: {customer?.name ?? order.customerId}</li>
          <li>Toplam: {money(order.grandTotal, order.currency)}</li>
          <li>Odeme: {getPaymentStatusLabel(order.paymentStatus)}</li>
          <li>Teslim: {getDeliveryStatusLabel(order.deliveryStatus)}</li>
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>Operasyon Etkisi</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          {impact.messages.map((message) => <li key={message}>{message}</li>)}
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>Risk / Uyarilar</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          {readiness.blockers.length > 0 ? readiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>) : <li>Teslimata engel kritik blokaj yok.</li>}
          <li>Tahsilat Kaydi: {orderPayments.length}</li>
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>AI Aciklamasi</h3>
        <p className="hz-content-card-description">
          AI varsayilan read-only modda; bu siparis icin tahsilat, kaynak plani ve teslim hazirligi sinyallerini ozetler.
        </p>
      </section>
    </div>
  );
}
