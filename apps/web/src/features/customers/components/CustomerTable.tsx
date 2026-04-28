import type { CustomerRow } from "../mappers/map-customer-row";

export interface CustomerTableProps {
  rows: CustomerRow[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
  onOpenCustomer: (customerId: string) => void;
}

export function CustomerTable({ rows, selectedCustomerId, onSelectCustomer, onOpenCustomer }: CustomerTableProps) {
  return (
    <section className="hz-content-card">
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Cari Kodu</th>
              <th>Cari Adi</th>
              <th>Tip</th>
              <th>Telefon</th>
              <th>Sehir</th>
              <th>Bakiye</th>
              <th>Risk</th>
              <th>Fiyat Grubu</th>
              <th>Son Siparis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.customerId}
                className={`stock-table-row ${selectedCustomerId === row.customerId ? "is-selected-row" : ""}`}
                onClick={() => onSelectCustomer(row.customerId)}
                onDoubleClick={() => onOpenCustomer(row.customerId)}
              >
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td>{row.typeLabel}</td>
                <td>{row.phone}</td>
                <td>{row.city}</td>
                <td>{row.balanceLabel}</td>
                <td>
                  <span className={`hz-badge hz-badge-${row.riskTone}`}>{row.riskLabel}</span>
                </td>
                <td>{row.priceGroupLabel}</td>
                <td>{row.lastOrderLabel}</td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="table-empty">Filtrelere uygun cari bulunamadi.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
