import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { money } from "../utils";
import { getPaymentMethodLabel, getPaymentStatusLabel, getPaymentSummary } from "../queries/payment-mock-data";

export function PaymentPreviewPanel({ payment, customer }: { payment: PaymentReceipt | null; customer: Customer | null }) {
  if (!payment) {
    return (
      <section className="hz-content-card">
        <h3>Tahsilat Preview</h3>
        <p className="hz-content-card-description">Bir tahsilat secildiginde allocation ozeti burada gorunur.</p>
      </section>
    );
  }

  const summary = getPaymentSummary(payment);

  return (
    <section className="hz-content-card">
      <h3>Tahsilat Preview</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Musteri: {customer?.name ?? payment.customerId}</li>
        <li>Tutar: {money(payment.amount, payment.currency)}</li>
        <li>Yontem: {getPaymentMethodLabel(payment.method)}</li>
        <li>Durum: {getPaymentStatusLabel(payment.status)}</li>
        <li>Dagitilan: {money(summary.allocatedTotal, payment.currency)}</li>
        <li>Kalan: {money(summary.remainingAmount, payment.currency)}</li>
      </ul>
    </section>
  );
}
