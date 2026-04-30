import type { QuickOperationTotals } from "../types";

interface Props {
  totals: QuickOperationTotals;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

export function QuickOperationTotalsPanel({ totals }: Props) {
  return (
    <section className="hz-side-panel">
      <h3>Toplamlar</h3>
      <ul className="hz-side-list">
        <li><strong>Ara Toplam:</strong> {formatMoney(totals.subtotal)}</li>
        <li><strong>Iskonto:</strong> {formatMoney(totals.discountTotal)}</li>
        <li><strong>Toplam KDV:</strong> {formatMoney(totals.taxTotal)}</li>
        <li><strong>Genel Toplam:</strong> {formatMoney(totals.grandTotal)}</li>
        <li><strong>Odenen:</strong> {formatMoney(totals.paidAmount)}</li>
        <li><strong>Kalan:</strong> {formatMoney(totals.remainingAmount)}</li>
      </ul>
    </section>
  );
}
