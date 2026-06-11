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

function allocationStatusLabel(openBalance: number): string {
  if (openBalance <= 0) {
    return "Tam";
  }
  return "Kısmi";
}

function allocationStatusClass(openBalance: number): string {
  if (openBalance <= 0) {
    return "tdf-badge tdf-badge--success";
  }
  return "tdf-badge tdf-badge--warning";
}

export function PaymentAllocationTable({ allocations }: { allocations: PaymentAllocation[] }) {
  const allocatedTotal = allocations.reduce((sum, row) => sum + row.allocatedAmount, 0);
  const currency = allocations[0]?.currency ?? "TRY";

  return (
    <section className="tdf-section" aria-label="Tahsilat dağılımı">
      <header className="tdf-section__head">
        <h2>Tahsilat dağılımı</h2>
      </header>
      <p className="tdf-section__desc">Tahsis satırları kayıt sonrası dağıtım ekranından yönetilir.</p>
      <div className="tdf-table-wrap">
        <table className="tdf-table">
          <thead>
            <tr>
              <th>Belge türü</th>
              <th>Belge no</th>
              <th>Hedef toplamı</th>
              <th>Açık bakiye</th>
              <th>Tahsis tutarı</th>
              <th>Durum</th>
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
                <td>
                  <span className={allocationStatusClass(allocation.openBalance)}>
                    {allocationStatusLabel(allocation.openBalance)}
                  </span>
                </td>
              </tr>
            ))}
            {allocations.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="tdf-table__empty">Tahsis satırı henüz eklenmedi.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
          {allocations.length > 0 ? (
            <tfoot>
              <tr className="tdf-table__foot">
                <td colSpan={4}>Toplam tahsis</td>
                <td colSpan={2}>{money(allocatedTotal, currency)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </section>
  );
}
