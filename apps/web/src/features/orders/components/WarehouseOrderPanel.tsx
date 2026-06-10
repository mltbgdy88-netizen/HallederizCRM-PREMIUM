"use client";

import type { SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { useMemo } from "react";
import { useToast } from "../../../providers/toast-provider";

export function WarehouseOrderPanel({ order, warehouseOrders }: { order: SaleOrder; warehouseOrders: WarehouseOrder[] }) {
  const { pushToast } = useToast();
  const existingOrder = useMemo(
    () => warehouseOrders.find((warehouseOrder) => warehouseOrder.orderId === order.id) ?? null,
    [warehouseOrders, order.id]
  );

  return (
    <div className="hz-tab-content">
      <h3>Depo hazırlık</h3>
      <p className="hz-content-card-description">Sipariş satırları depo emri ile bağlanır; canlı kayıt onay gerektirir.</p>
      <div className="stock-filter-actions hz-margin-top-sm">
        <button
          type="button"
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          disabled={Boolean(existingOrder)}
          onClick={() => pushToast("Depo emri taslağı işaretlendi; canlı kayıt henüz bağlı değil.")}
        >
          Depo emri oluştur
        </button>
        <span className={`hz-badge hz-badge-${existingOrder ? "success" : "warning"}`}>
          {existingOrder ? "Depo emri mevcut" : "Depo emri bekliyor"}
        </span>
      </div>
      {existingOrder ? (
        <ul className="hz-side-list hz-margin-top-sm">
          <li>Emir no: {existingOrder.warehouseOrderNo}</li>
          <li>Satır sayısı: {existingOrder.lines.length}</li>
          <li>Depo: {existingOrder.warehouseName ?? "Merkez Depo"}</li>
        </ul>
      ) : null}
    </div>
  );
}

