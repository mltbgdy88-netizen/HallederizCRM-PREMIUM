import type { OrderRow } from "../mappers/map-order-row";

export function OrderTable({
  rows,
  selectedOrderId,
  onSelectOrder,
  onOpenOrder
}: {
  rows: OrderRow[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onOpenOrder: (orderId: string) => void;
}) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Toplam</th>
              <th>Ödeme</th>
              <th>Teslim</th>
              <th>Kanal</th>
              <th>Kaynak Özeti</th>
              <th>Son İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.orderId}
                className={`stock-table-row ${selectedOrderId === row.orderId ? "is-selected-row" : ""}`}
                onClick={() => onSelectOrder(row.orderId)}
                onDoubleClick={() => onOpenOrder(row.orderId)}
              >
                <td>{row.orderNo}</td>
                <td>{row.customerName}</td>
                <td>{row.totalLabel}</td>
                <td><span className={`hz-badge hz-badge-${row.statusTone}`}>{row.paymentStatusLabel}</span></td>
                <td>{row.deliveryStatusLabel}</td>
                <td>{row.channelLabel}</td>
                <td>{row.sourceSummary}</td>
                <td>{row.lastActionLabel}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}><div className="table-empty">Filtrelere uygun sipariş bulunamadı.</div></td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
