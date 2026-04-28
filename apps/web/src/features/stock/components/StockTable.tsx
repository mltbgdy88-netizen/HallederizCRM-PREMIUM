import type { StockRow } from "../mappers/map-stock-row";

export interface StockTableProps {
  rows: StockRow[];
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string | null;
}

export function StockTable({ rows, onSelectProduct, selectedProductId = null }: StockTableProps) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky stock-table">
          <thead>
            <tr>
              <th>Urun Kodu</th>
              <th>Urun Adi</th>
              <th>Marka</th>
              <th>Toplam Merkez Depo Stogu</th>
              <th>Fabrika Stok Toplami</th>
              <th>Kritik Stok Durumu</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.productId}
                onClick={() => onSelectProduct(row.productId)}
                className={`stock-table-row ${selectedProductId === row.productId ? "is-selected-row" : ""}`}
              >
                <td>{row.productCode}</td>
                <td>{row.productName}</td>
                <td>{row.brandName}</td>
                <td>{row.centerWarehouseStockTotal}</td>
                <td>{row.factoryStockTotal}</td>
                <td>
                  <span className={`hz-badge ${row.criticalStockStatus === "critical" ? "hz-badge-danger" : "hz-badge-success"}`}>
                    {row.criticalStockStatus === "critical" ? "Kritik" : "Saglikli"}
                  </span>
                </td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">Filtrelere uygun urun bulunamadi.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
