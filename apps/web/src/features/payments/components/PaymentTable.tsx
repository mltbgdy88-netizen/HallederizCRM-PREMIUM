import type { PaymentRow } from "../mappers/map-payment-row";

export function PaymentTable({
  rows,
  selectedPaymentId,
  onSelectPayment,
  onOpenPayment
}: {
  rows: PaymentRow[];
  selectedPaymentId: string | null;
  onSelectPayment: (paymentId: string) => void;
  onOpenPayment: (paymentId: string) => void;
}) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Fiş no</th>
              <th>Müşteri</th>
              <th>Tutar</th>
              <th>Yöntem</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Bağlı belge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.paymentId}
                className={`stock-table-row ${selectedPaymentId === row.paymentId ? "is-selected-row" : ""}`}
                onClick={() => onSelectPayment(row.paymentId)}
                onDoubleClick={() => onOpenPayment(row.paymentId)}
              >
                <td>{row.receiptNo}</td>
                <td>{row.customerName}</td>
                <td>{row.amountLabel}</td>
                <td>{row.methodLabel}</td>
                <td><span className={`hz-badge hz-badge-${row.statusTone}`}>{row.statusLabel}</span></td>
                <td>{row.receivedAtLabel}</td>
                <td>{row.documentCountLabel}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={7}><div className="table-empty">Filtrelere uygun tahsilat bulunamadı.</div></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
