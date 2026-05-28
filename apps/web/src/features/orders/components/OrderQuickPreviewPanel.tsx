import { summarizeOrderOperationalImpact } from "@hallederiz/domain";
import type { Customer, SaleOrder } from "@hallederiz/types";
import { money } from "../utils";
import { getDeliveryStatusLabel, getPaymentStatusLabel } from "../queries/order-mock-data";

export function OrderQuickPreviewPanel({ order, customer }: { order: SaleOrder | null; customer: Customer | null }) {
  if (!order) {
    return (
      <section className="hz-content-card">
        <h3>Sipariş özeti</h3>
        <p className="hz-content-card-description">Bir sipariş seçildiğinde operasyon özeti burada görünür.</p>
      </section>
    );
  }

  const impact = summarizeOrderOperationalImpact(order);

  return (
    <section className="hz-content-card">
      <h3>{order.orderNo}</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Müşteri: {customer?.name ?? order.customerId}</li>
        <li>Toplam: {money(order.grandTotal, order.currency)}</li>
        <li>Ödeme: {getPaymentStatusLabel(order.paymentStatus)}</li>
        <li>Teslim: {getDeliveryStatusLabel(order.deliveryStatus)}</li>
        <li>Kaynak: {impact.needsFactoryOrder ? "Depo + Fabrika" : "Merkez depo"}</li>
        <li>Uyarı: {impact.paymentMissing ? "Tahsilat kontrolü gerekli" : "Finans akışı uygun"}</li>
      </ul>
    </section>
  );
}

