import type { PaymentAllocation } from "@hallederiz/types";
import { money } from "../utils";

export function PaymentAllocationTable({ allocations }: { allocations: PaymentAllocation[] }) {
  return (
    <section className="hz-content-card">
      <h3>Allocation Tablosu</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table hz-table-sticky">
          <thead>
            <tr>
              <th>Hedef Tipi</th>
              <th>Hedef No</th>
              <th>Hedef Toplami</th>
              <th>Acik Bakiye</th>
              <th>Ayrilan Tutar</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td>{allocation.targetType}</td>
                <td>{allocation.targetNo}</td>
                <td>{money(allocation.targetTotal, allocation.currency)}</td>
                <td>{money(allocation.openBalance, allocation.currency)}</td>
                <td>{money(allocation.allocatedAmount, allocation.currency)}</td>
              </tr>
            ))}
            {allocations.length === 0 ? <tr><td colSpan={5}><div className="table-empty">Allocation satiri henuz eklenmedi.</div></td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
