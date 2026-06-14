import type { PaymentReceipt } from "@hallederiz/types";
import { DetailKpiStrip } from "../../shared/detail-shell";
import { getPaymentMethodLabel, getPaymentStatusLabel, getPaymentSummary } from "../queries/payment-mock-data";
import { money } from "../utils";

function statusToneClass(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "tdf-kpi--success";
  if (status === "partially_allocated") return "tdf-kpi--warning";
  return "";
}

export function PaymentSummaryCards({ payment }: { payment: PaymentReceipt }) {
  const summary = getPaymentSummary(payment);

  return (
    <DetailKpiStrip ariaLabel="Tahsilat özeti">
      <article className="tdf-kpi tdf-kpi--success">
        <span className="tdf-kpi__label">Tahsilat tutarı</span>
        <strong className="tdf-kpi__value">{money(payment.amount, payment.currency)}</strong>
        <span className="tdf-kpi__hint">{payment.receiptNo}</span>
      </article>
      <article className={`tdf-kpi${summary.remainingAmount > 0 ? " tdf-kpi--warning" : " tdf-kpi--success"}`}>
        <span className="tdf-kpi__label">Kalan / açık</span>
        <strong className="tdf-kpi__value">{money(summary.remainingAmount, payment.currency)}</strong>
        <span className="tdf-kpi__hint">Tahsis bekleyen</span>
      </article>
      <article className={`tdf-kpi ${statusToneClass(payment.status)}`.trim()}>
        <span className="tdf-kpi__label">Durum</span>
        <strong className="tdf-kpi__value">{getPaymentStatusLabel(payment.status)}</strong>
        <span className="tdf-kpi__hint">{payment.confirmedAt ? "Onaylı" : "—"}</span>
      </article>
      <article className="tdf-kpi">
        <span className="tdf-kpi__label">Yöntem</span>
        <strong className="tdf-kpi__value">{getPaymentMethodLabel(payment.method)}</strong>
        <span className="tdf-kpi__hint">{payment.referenceNo ?? "—"}</span>
      </article>
      <article className="tdf-kpi">
        <span className="tdf-kpi__label">Tahsis sayısı</span>
        <strong className="tdf-kpi__value">{String(summary.allocationCount)}</strong>
        <span className="tdf-kpi__hint">
          {summary.allocationCount > 0 ? money(summary.allocatedTotal, payment.currency) : "—"}
        </span>
      </article>
    </DetailKpiStrip>
  );
}
