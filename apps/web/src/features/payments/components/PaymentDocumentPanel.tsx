import type { PaymentReceipt } from "@hallederiz/types";
import { getPaymentStatusLabel } from "../queries/payment-mock-data";

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return `${padTwo(d.getDate())}.${padTwo(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function PaymentDocumentPanel({ payment }: { payment: PaymentReceipt }) {
  const receiptState = payment.status === "draft" ? "Taslak önizleme" : "Önizleme hazırlanabilir";

  return (
    <section className="tdf-side-card" aria-label="Belge ve makbuz">
      <header className="tdf-side-card__head">
        <h3>Belge / Makbuz</h3>
      </header>
      <ul className="tdf-side-list">
        <li>
          <span>Makbuz no</span>
          <strong>{payment.receiptNo}</strong>
        </li>
        <li>
          <span>Referans no</span>
          <strong>{payment.referenceNo ?? "—"}</strong>
        </li>
        <li>
          <span>Tahsilat tarihi</span>
          <strong>{fmtDate(payment.receivedAt)}</strong>
        </li>
        <li>
          <span>Bağlı belge</span>
          <strong>{String(payment.documentCount)}</strong>
        </li>
        <li>
          <span>Makbuz durumu</span>
          <strong>{receiptState}</strong>
        </li>
        <li>
          <span>Kayıt durumu</span>
          <strong>{getPaymentStatusLabel(payment.status)}</strong>
        </li>
      </ul>
    </section>
  );
}
