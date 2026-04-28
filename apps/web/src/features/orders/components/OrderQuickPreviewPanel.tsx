import { summarizeOrderOperationalImpact } from "@hallederiz/domain";
import type { Customer, SaleOrder } from "@hallederiz/types";
import { money } from "../utils";
import { getDeliveryStatusLabel, getPaymentStatusLabel } from "../queries/order-mock-data";

export function OrderQuickPreviewPanel({ order, customer }: { order: SaleOrder | null; customer: Customer | null }) {
  if (!order) {
    return (
      <section className="hz-content-card">
        <h3>Siparis Preview</h3>
        <p className="hz-content-card-description">Bir siparis secildiginde operasyon ozeti burada gorunur.</p>
      </section>
    );
  }

  const impact = summarizeOrderOperationalImpact(order);

  return (
    <section className="hz-content-card">
      <h3>Siparis Preview</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Musteri: {customer?.name ?? order.customerId}</li>
        <li>Toplam: {money(order.grandTotal, order.currency)}</li>
        <li>Odeme: {getPaymentStatusLabel(order.paymentStatus)}</li>
        <li>Teslim: {getDeliveryStatusLabel(order.deliveryStatus)}</li>
        <li>Kaynak: {impact.needsFactoryOrder ? "Depo + Fabrika" : "Merkez Depo"}</li>
        <li>Uyari: {impact.paymentMissing ? "Tahsilat kontrolu gerekli" : "Finans akisi uygun"}</li>
      </ul>
    </section>
  );
}
