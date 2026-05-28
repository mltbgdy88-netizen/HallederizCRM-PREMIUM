import { MetricCard } from "@hallederiz/ui";
import type { PaymentReceipt } from "@hallederiz/types";
import { money } from "../utils";
import { getPaymentSummary } from "../queries/payment-mock-data";

export function PaymentSummaryCards({ payment }: { payment: PaymentReceipt }) {
  const summary = getPaymentSummary(payment);

  return (
    <section className="hz-metric-grid">
      <MetricCard title="Toplam tahsilat" value={money(payment.amount, payment.currency)} detail={payment.receiptNo} tone="success" />
      <MetricCard title="Dağıtılan" value={money(summary.allocatedTotal, payment.currency)} detail={`${summary.allocationCount} satır`} tone="info" />
      <MetricCard
        title="Kalan"
        value={money(summary.remainingAmount, payment.currency)}
        detail="Tahsis bekleyen"
        tone={summary.remainingAmount > 0 ? "warning" : "success"}
      />
      <MetricCard title="Belge" value={String(payment.documentCount)} detail="Bağlı belge" tone="neutral" />
    </section>
  );
}

