import type { WarehouseTaskRow } from "../mappers/map-warehouse-task-row";

export function WarehouseTaskTable({
  rows,
  selectedWarehouseOrderId,
  onSelectWarehouseOrder,
  onOpenWarehouseOrder
}: {
  rows: WarehouseTaskRow[];
  selectedWarehouseOrderId: string | null;
  onSelectWarehouseOrder: (warehouseOrderId: string) => void;
  onOpenWarehouseOrder: (warehouseOrderId: string) => void;
}) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Görev no</th>
              <th>Siparis No</th>
              <th>Müşteri</th>
              <th>Ürün sayısı</th>
              <th>Depo</th>
              <th>Durum</th>
              <th>Son Tarih</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.warehouseOrderId}
                className={`stock-table-row ${selectedWarehouseOrderId === row.warehouseOrderId ? "is-selected-row" : ""}`}
                onClick={() => onSelectWarehouseOrder(row.warehouseOrderId)}
                onDoubleClick={() => onOpenWarehouseOrder(row.warehouseOrderId)}
              >
                <td>{row.taskNo}</td>
                <td>{row.orderNo}</td>
                <td>{row.customerName}</td>
                <td>{row.productCountLabel}</td>
                <td>{row.warehouseName}</td>
                <td><span className={`hz-badge hz-badge-${row.statusTone}`}>{row.statusLabel}</span></td>
                <td>{row.dueAtLabel}</td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={7}><div className="table-empty">Filtrelere uygun depo gorevi bulunamadi.</div></td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
