import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { getWarehouseOrderPrepLabel } from "../utils/warehouse-prep-status";

export function WarehouseTaskPreviewPanel({ warehouseOrder, customer }: { warehouseOrder: WarehouseOrder | null; customer: Customer | null }) {
  if (!warehouseOrder) {
    return (
      <section className="hz-content-card">
        <h3>Depo Preview</h3>
        <p className="hz-content-card-description">Bir depo emri secildiginde toplama ozeti burada gorunur.</p>
      </section>
    );
  }

  const requestedTotal = warehouseOrder.lines.reduce((total, line) => total + line.requestedQuantity, 0);
  const preparedTotal = warehouseOrder.lines.reduce((total, line) => total + line.preparedQuantity, 0);

  return (
    <section className="hz-content-card">
      <h3>Depo Preview</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Müşteri: {customer?.name ?? warehouseOrder.customerId}</li>
        <li>Siparis: {warehouseOrder.orderNo}</li>
        <li>Depo: {warehouseOrder.warehouseName}</li>
        <li>Durum: {getWarehouseOrderPrepLabel(warehouseOrder)}</li>
        <li>Hazirlanan: {preparedTotal} / {requestedTotal}</li>
        <li>WhatsApp: depocu gorev bildirimi placeholder.</li>
      </ul>
    </section>
  );
}

