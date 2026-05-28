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
        <h3>Sipariş özeti</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          <li>Müşteri: {customer?.name ?? order.customerId}</li>
          <li>Toplam: {money(order.grandTotal, order.currency)}</li>
          <li>Ödeme: {getPaymentStatusLabel(order.paymentStatus)}</li>
          <li>Teslim: {getDeliveryStatusLabel(order.deliveryStatus)}</li>
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>Operasyon etkisi</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          {impact.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>Risk / uyarılar</h3>
        <ul className="hz-side-list hz-margin-top-sm">
          {readiness.blockers.length > 0 ? (
            readiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)
          ) : (
            <li>Teslimata engel kritik blokaj yok.</li>
          )}
          <li>Tahsilat kaydı: {orderPayments.length}</li>
        </ul>
      </section>
      <section className="hz-content-card">
        <h3>Operasyon notu</h3>
        <p className="hz-content-card-description">
          Bu sipariş için tahsilat, kaynak planı ve teslim hazırlığı sinyalleri özetlenir; canlı kayıt onay gerektirir.
        </p>
      </section>
    </div>
  );
}

