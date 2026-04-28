import { MetricCard } from "@hallederiz/ui";
import type { PaymentReceipt } from "@hallederiz/types";
import { money } from "../utils";
import { getPaymentSummary } from "../queries/payment-mock-data";

export function PaymentSummaryCards({ payment }: { payment: PaymentReceipt }) {
  const summary = getPaymentSummary(payment);

  return (
    <section className="hz-metric-grid">
      <MetricCard title="Toplam Tahsilat" value={money(payment.amount, payment.currency)} detail={payment.receiptNo} tone="success" />
      <MetricCard title="Dagitilan" value={money(summary.allocatedTotal, payment.currency)} detail={`${summary.allocationCount} satir`} tone="info" />
      <MetricCard title="Kalan" value={money(summary.remainingAmount, payment.currency)} detail="Allocation bekleyen" tone={summary.remainingAmount > 0 ? "warning" : "success"} />
      <MetricCard title="Belge" value={String(payment.documentCount)} detail="Bagli belge" tone="neutral" />
    </section>
  );
}
