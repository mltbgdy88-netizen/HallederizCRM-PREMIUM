"use client";

import type { SaleOrder, WarehouseOrder } from "@hallederiz/types";
import { useMemo, useState } from "react";

export function WarehouseOrderPanel({ order, warehouseOrders }: { order: SaleOrder; warehouseOrders: WarehouseOrder[] }) {
  const existingOrder = useMemo(() => warehouseOrders.find((warehouseOrder) => warehouseOrder.orderId === order.id) ?? null, [warehouseOrders, order.id]);
  const [created, setCreated] = useState(Boolean(existingOrder));
  const shownOrder = existingOrder;

  return (
    <div className="hz-tab-content">
      <h3>Depo Hazirlik</h3>
      <p className="hz-content-card-description">Siparis satirlari depo emri ile baglanir; gercek persistence sonraki backend adiminda devreye girer.</p>
      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => setCreated(true)}>
          Depo Emri Olustur
        </button>
        <span className={`hz-badge hz-badge-${created ? "success" : "warning"}`}>{created ? "Depo emri hazir" : "Depo emri bekliyor"}</span>
      </div>
      {created ? (
        <ul className="hz-side-list hz-margin-top-sm">
          <li>Emir No: {shownOrder?.warehouseOrderNo ?? `WO-${order.orderNo.replace(/\D/g, "")}`}</li>
          <li>Satir Sayisi: {shownOrder?.lines.length ?? order.lines.filter((line) => line.sourcePreference !== "factory").length}</li>
          <li>Depo: {shownOrder?.warehouseName ?? "Merkez Depo"}</li>
          <li>WhatsApp gorev bildirimi placeholder olarak hazir.</li>
        </ul>
      ) : null}
    </div>
  );
}
