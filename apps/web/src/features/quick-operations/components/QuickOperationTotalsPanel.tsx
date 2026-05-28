import type { QuickOperationTotals } from "../types";

interface Props {
  totals: QuickOperationTotals;
  layout?: "card" | "bare" | "finance";
}

function formatMoney(value: number) {
  return `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function QuickOperationTotalsPanel({ totals, layout = "card" }: Props) {
  if (layout === "finance") {
    return (
      <dl className="hz-qop-wb-finance">
        <div>
          <dt>Ara toplam</dt>
          <dd>{formatMoney(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>İskonto</dt>
          <dd>{formatMoney(totals.discountTotal)}</dd>
        </div>
        <div>
          <dt>KDV</dt>
          <dd>{formatMoney(totals.taxTotal)}</dd>
        </div>
        <div className="hz-qop-wb-finance-net">
          <dt>Net toplam</dt>
          <dd>{formatMoney(totals.grandTotal)}</dd>
        </div>
      </dl>
    );
  }

  const list = (
    <ul className={layout === "bare" ? "hz-qop-totals-list" : "hz-side-list"}>
      <li>
        <strong>Ara Toplam:</strong> {formatMoney(totals.subtotal)}
      </li>
      <li>
        <strong>İskonto:</strong> {formatMoney(totals.discountTotal)}
      </li>
      <li>
        <strong>Toplam KDV:</strong> {formatMoney(totals.taxTotal)}
      </li>
      <li>
        <strong>Genel Toplam:</strong> {formatMoney(totals.grandTotal)}
      </li>
      <li>
        <strong>Ödenen:</strong> {formatMoney(totals.paidAmount ?? 0)}
      </li>
      <li>
        <strong>Kalan:</strong> {formatMoney(totals.remainingAmount ?? totals.grandTotal)}
      </li>
    </ul>
  );

  if (layout === "bare") {
    return list;
  }

  return (
    <section className="hz-side-panel">
      <h3>Toplamlar</h3>
      {list}
    </section>
  );
}
