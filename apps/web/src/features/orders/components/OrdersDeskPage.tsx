"use client";

import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { useOrderFilters } from "../hooks/use-order-filters";
import { useOrdersData } from "../hooks/use-orders-data";
import {
  buildOrdersDeskStats,
  mapOrdersDeskRow,
  matchesOrdersDeskChip,
  type OrdersDeskChip
} from "../utils/orders-desk-view-model";
import { OrdersDeskIntro } from "./OrdersDeskIntro";
import { OrdersDeskList } from "./OrdersDeskList";
import { OrdersDeskPreview } from "./OrdersDeskPreview";
import { OrdersStatsStrip } from "./OrdersStatsStrip";

export function OrdersDeskPage() {
  const { filters, updateFilter, resetFilters } = useOrderFilters();
  const { loading, customers, filteredOrders, orders } = useOrdersData(filters);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deskChip, setDeskChip] = useState<OrdersDeskChip>("all");

  const deskFilteredOrders = useMemo(
    () => filteredOrders.filter((order) => matchesOrdersDeskChip(order, deskChip)),
    [filteredOrders, deskChip]
  );

  const rows = useMemo(
    () => deskFilteredOrders.map((order) => mapOrdersDeskRow(order, customers)),
    [deskFilteredOrders, customers]
  );

  const stats = useMemo(() => buildOrdersDeskStats(orders), [orders]);

  const selectedOrder = useMemo(
    () => deskFilteredOrders.find((order) => order.id === selectedOrderId) ?? deskFilteredOrders[0] ?? null,
    [deskFilteredOrders, selectedOrderId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedOrder?.customerId) ?? null,
    [customers, selectedOrder?.customerId]
  );

  useEffect(() => {
    if (!deskFilteredOrders.length) {
      setSelectedOrderId(null);
      return;
    }

    const first = deskFilteredOrders[0];
    if (!first) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !deskFilteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(first.id);
    }
  }, [deskFilteredOrders, selectedOrderId]);

  function handleResetFilters() {
    resetFilters();
    setDeskChip("all");
  }

  return (
    <main className="hz-orders-page hz-orders-desk hz-commercial-desk-standard" aria-live="polite">
      <div className="hz-orders-desk-shell hz-commercial-desk-shell">
        <OrdersDeskIntro />

        <OrdersStatsStrip stats={stats} />

        {dataSourceConfig.useDemoData ? (
          <p className="hz-orders-preview-band hz-commercial-preview-band" role="status">
            Demo sipariş verileri gösteriliyor. Canlı modda kayıtlar SDK üzerinden listelenir.
          </p>
        ) : null}

        <div className="hz-orders-desk-body hz-commercial-desk-body">
          <OrdersDeskList
            rows={rows}
            totalCount={deskFilteredOrders.length}
            selectedOrderId={selectedOrder?.id ?? null}
            searchQuery={filters.customer}
            deskChip={deskChip}
            loading={loading}
            onSearchChange={(value) => updateFilter("customer", value)}
            onDeskChipChange={setDeskChip}
            onResetFilters={handleResetFilters}
            onSelectOrder={setSelectedOrderId}
          />
          <div className="hz-orders-desk-side hz-commercial-desk-side">
            <OrdersDeskPreview order={selectedOrder} customer={selectedCustomer} />
          </div>
        </div>
      </div>
    </main>
  );
}
