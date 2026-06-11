import type { OfferLine } from "@hallederiz/types";

function money(amount: number, currency: string): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function OfferLineTable({
  lines,
  variant = "default",
  compact = false
}: {
  lines: OfferLine[];
  variant?: "default" | "reference";
  compact?: boolean;
}) {
  if (variant === "reference") {
    const columns = compact
      ? ["Ürün Kodu", "Ürün Adı", "Adet", "Birim Fiyat", "İskonto", "Toplam"]
      : ["Ürün Kodu", "Ürün Adı", "Adet", "Fiyat Slotu", "Birim Fiyat", "Para Birimi", "İskonto", "Toplam", "Kaynak"];

    return (
      <div className="ofd-table-wrap">
        <table className="ofd-table">
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
                {!compact ? <td>{line.priceSlotLabelSnapshot}</td> : null}
                <td>{money(line.unitPrice, line.currency)}</td>
                {compact ? <td>{line.discountPercent ? `%${line.discountPercent}` : "—"}</td> : <td>{line.currency}</td>}
                {!compact ? <td>{line.discountPercent ? `%${line.discountPercent}` : "—"}</td> : null}
                <td>{money(line.lineTotal, line.currency)}</td>
                {!compact ? <td>{line.sourcePreference}</td> : null}
              </tr>
            ))}
            {lines.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="ofd-table__empty">Teklif satırı bulunmuyor.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {lines.some((line) => line.pricingWarning) ? (
          <p className="ofd-note">{lines.find((line) => line.pricingWarning)?.pricingWarning}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="hz-tab-content">
      <h3>Teklif satırları</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Ürün Kodu</th>
              <th>Ürün Adı</th>
              <th>Adet</th>
              <th>Fiyat Slotu</th>
              <th>Birim Fiyat</th>
              <th>Para Birimi</th>
              <th>Kur</th>
              <th>Satır Toplamı</th>
              <th>Kaynak</th>
              <th>Merkez Stok</th>
              <th>Fabrika Stok</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>
                  {line.priceSlotLabelSnapshot}
                  {line.priceOverride ? <span className="hz-badge hz-badge-warning offer-inline-badge">Override</span> : null}
                </td>
                <td>{money(line.unitPrice, line.currency)}</td>
                <td>{line.currency}</td>
                <td>{line.exchangeRate || "-"}</td>
                <td>{money(line.lineTotal, line.currency)}</td>
                <td>{line.sourcePreference}</td>
                <td>{line.centerStockSnapshot}</td>
                <td>{line.factoryStockSnapshot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lines.some((line) => line.pricingWarning) ? (
        <div className="hz-state-card hz-margin-top-sm">
          <h4>Fiyat uyarısı</h4>
          <p>{lines.find((line) => line.pricingWarning)?.pricingWarning}</p>
        </div>
      ) : null}
    </div>
  );
}
