import type { SaleOrderLine } from "@hallederiz/types";
import { money } from "../utils";

export function OrderLinesTable({
  lines,
  variant = "default",
  compact = false
}: {
  lines: SaleOrderLine[];
  variant?: "default" | "reference";
  compact?: boolean;
}) {
  if (variant === "reference") {
    const columns = compact
      ? ["Ürün Kodu", "Ürün Adı", "Adet", "Birim Fiyat", "Kaynak", "Toplam"]
      : ["Ürün Kodu", "Ürün Adı", "Adet", "Birim Fiyat", "Para Birimi", "Kaynak", "Merkez Stok", "Fabrika Stok", "Toplam"];

    return (
      <div className="spd-table-wrap">
        <table className="spd-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>{money(line.unitPrice, line.currency)}</td>
                {!compact ? <td>{line.currency}</td> : null}
                <td>{line.sourcePreference}</td>
                {!compact ? <td>{line.centerStockSnapshot}</td> : null}
                {!compact ? <td>{line.factoryStockSnapshot}</td> : null}
                <td>{money(line.tlLineTotal, "TRY")}</td>
              </tr>
            ))}
            {lines.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="spd-table__empty">Sipariş satırı bulunmuyor.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="hz-tab-content">
      <h3>Sipariş satırları</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Ürün Kodu</th>
              <th>Ürün Adı</th>
              <th>Adet</th>
              <th>Birim Fiyat</th>
              <th>Para Birimi</th>
              <th>Kur</th>
              <th>TL Karşılığı</th>
              <th>Kaynak</th>
              <th>Merkez Stok</th>
              <th>Fabrika Stok</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>{money(line.unitPrice, line.currency)}</td>
                <td>{line.currency}</td>
                <td>{line.exchangeRate}</td>
                <td>{money(line.tlUnitPrice, "TRY")}</td>
                <td>{line.sourcePreference}</td>
                <td>{line.centerStockSnapshot}</td>
                <td>{line.factoryStockSnapshot}</td>
                <td>{money(line.tlLineTotal, "TRY")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
