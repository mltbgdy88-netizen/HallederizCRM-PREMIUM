import type { WarehouseOrderLine } from "@hallederiz/types";

export function WarehouseOrderLinesTable({ lines }: { lines: WarehouseOrderLine[] }) {
  return (
    <section className="hz-content-card">
      <h3>Toplama Satirlari</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Ürün kodu</th>
              <th>Ürün adı</th>
              <th>Istenen Adet</th>
              <th>Hazirlanan</th>
              <th>Depo</th>
              <th>Raf No</th>
              <th>Lokasyon</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.requestedQuantity}</td>
                <td>{line.preparedQuantity}</td>
                <td>{line.warehouseName}</td>
                <td>{line.rackNo ?? "-"}</td>
                <td>{line.locationCode ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
