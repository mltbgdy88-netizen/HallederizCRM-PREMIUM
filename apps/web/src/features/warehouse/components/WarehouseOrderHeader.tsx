import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { getWarehouseOrderStatusLabel } from "../queries/warehouse-mock-data";

export function WarehouseOrderHeader({ warehouseOrder, customer }: { warehouseOrder: WarehouseOrder; customer: Customer | null }) {
  return (
    <section className="crm-identity-header">
      <div>
        <p className="drawer-eyebrow">Depo Hazirlik Emri</p>
        <h2>{warehouseOrder.warehouseOrderNo}</h2>
        <p>{warehouseOrder.orderNo} / {customer?.name ?? warehouseOrder.customerId}</p>
      </div>
      <div className="stock-filter-actions">
        <span className="hz-badge hz-badge-info">{getWarehouseOrderStatusLabel(warehouseOrder.status)}</span>
        <span className="hz-badge hz-badge-warning">{warehouseOrder.warehouseName}</span>
      </div>
    </section>
  );
}
