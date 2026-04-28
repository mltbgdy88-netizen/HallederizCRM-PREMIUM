"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrderFilterBar } from "./OrderFilterBar";
import { OrderQuickPreviewPanel } from "./OrderQuickPreviewPanel";
import { OrderTable } from "./OrderTable";
import { useOrderFilters } from "../hooks/use-order-filters";
import { useOrdersData } from "../hooks/use-orders-data";

export function OrdersPage() {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = useOrderFilters();
  const { loading, customers, filteredOrders, rows } = useOrdersData(filters);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);
  const selectedOrder = useMemo(
    () => filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null,
    [filteredOrders, selectedOrderId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedOrder?.customerId) ?? null,
    [customers, selectedOrder?.customerId]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Siparisler"
        description="Siparis, kaynak plani, tahsilat ve depo etkisini tek operasyon listesinde yonetin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Acik Siparis" value={String(filteredOrders.length)} detail="Filtre kapsaminda" tone="info" />
        <MetricCard title="Tahsilat Eksik" value={String(filteredOrders.filter((order) => order.paymentStatus !== "paid").length)} detail="Finans kontrolu" tone="warning" />
        <MetricCard title="Depo Hazirlik" value={String(filteredOrders.filter((order) => order.deliveryStatus === "preparing").length)} detail="Aktif operasyon" tone="info" />
        <MetricCard title="Fabrika Gerekli" value={String(filteredOrders.filter((order) => order.sourcePlans.some((plan) => plan.factoryQuantity > 0)).length)} detail="Kaynak plani" tone="danger" />
      </section>

      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/siparisler/yeni")}>
          Yeni Siparis
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push("/teklifler")}>
          Tekliften Donustur
        </button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
          Toplu Durum Guncelle
        </button>
      </PrimaryActionToolbar>

      <OrderFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />

      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Siparisler yukleniyor" message="Kaynak plani, tahsilat ve depo etkisi hazirlaniyor." />
          ) : (
            <>
              <OrderTable
                rows={pagedRows}
                selectedOrderId={selectedOrder?.id ?? null}
                onSelectOrder={setSelectedOrderId}
                onOpenOrder={(orderId) => router.push(`/siparisler/${orderId}`)}
              />
              <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )
        }
        side={<OrderQuickPreviewPanel order={selectedOrder} customer={selectedCustomer} />}
      />
    </div>
  );
}
