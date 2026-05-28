import type { PaymentAllocation } from "@hallederiz/types";
import { money } from "../utils";

function allocationTargetLabel(targetType: PaymentAllocation["targetType"]): string {
  if (targetType === "order") {
    return "Sipariş";
  }
  if (targetType === "invoice") {
    return "Fatura";
  }
  if (targetType === "open_account") {
    return "Açık hesap";
  }
  return targetType;
}

export function PaymentAllocationTable({ allocations }: { allocations: PaymentAllocation[] }) {
  return (
    <section className="hz-content-card">
      <h3>Tahsis tablosu</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Hedef tipi</th>
              <th>Hedef no</th>
              <th>Hedef toplamı</th>
              <th>Açık bakiye</th>
              <th>Ayrılan tutar</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td>{allocationTargetLabel(allocation.targetType)}</td>
                <td>{allocation.targetNo}</td>
                <td>{money(allocation.targetTotal, allocation.currency)}</td>
                <td>{money(allocation.openBalance, allocation.currency)}</td>
                <td>{money(allocation.allocatedAmount, allocation.currency)}</td>
              </tr>
            ))}
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="table-empty">Tahsis satırı henüz eklenmedi.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
