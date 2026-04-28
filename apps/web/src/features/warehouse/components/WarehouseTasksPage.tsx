"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { WarehouseTaskFilterBar } from "./WarehouseTaskFilterBar";
import { WarehouseTaskPreviewPanel } from "./WarehouseTaskPreviewPanel";
import { WarehouseTaskTable } from "./WarehouseTaskTable";
import { useWarehouseTaskFilters } from "../hooks/use-warehouse-task-filters";
import { useWarehouseTasksData } from "../hooks/use-warehouse-tasks-data";

export function WarehouseTasksPage() {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = useWarehouseTaskFilters();
  const { loading, customers, filteredWarehouseOrders, rows } = useWarehouseTasksData(filters);
  const [selectedWarehouseOrderId, setSelectedWarehouseOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);
  const selectedWarehouseOrder = useMemo(
    () => filteredWarehouseOrders.find((warehouseOrder) => warehouseOrder.id === selectedWarehouseOrderId) ?? filteredWarehouseOrders[0] ?? null,
    [filteredWarehouseOrders, selectedWarehouseOrderId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedWarehouseOrder?.customerId) ?? null,
    [customers, selectedWarehouseOrder?.customerId]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader title="Depo" description="Depo hazirlik emirleri, raf/lokasyon bilgileri ve WhatsApp gorev akisini yonetin." />
      <section className="hz-metric-grid">
        <MetricCard title="Acik Emir" value={String(filteredWarehouseOrders.length)} detail="Filtre kapsaminda" tone="info" />
        <MetricCard title="Kritik" value={String(filteredWarehouseOrders.filter((order) => order.tasks.some((task) => task.critical)).length)} detail="Oncelikli" tone="warning" />
        <MetricCard title="Hazir" value={String(filteredWarehouseOrders.filter((order) => order.status === "prepared").length)} detail="Teslime uygun" tone="success" />
        <MetricCard title="WhatsApp Gorev" value={String(filteredWarehouseOrders.reduce((total, order) => total + order.tasks.length, 0))} detail="Personel bildirimi" tone="info" />
      </section>
      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Yeni Depo Emri</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Toplama Listesi</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">WhatsApp Gorev Gonder</button>
      </PrimaryActionToolbar>
      <WarehouseTaskFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Depo gorevleri yukleniyor" message="Emirler, raflar ve toplama talimatlari hazirlaniyor." />
          ) : (
            <>
              <WarehouseTaskTable
                rows={pagedRows}
                selectedWarehouseOrderId={selectedWarehouseOrder?.id ?? null}
                onSelectWarehouseOrder={setSelectedWarehouseOrderId}
                onOpenWarehouseOrder={(warehouseOrderId) => router.push(`/depo/emirler/${warehouseOrderId}`)}
              />
              <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )
        }
        side={<WarehouseTaskPreviewPanel warehouseOrder={selectedWarehouseOrder} customer={selectedCustomer} />}
      />
    </div>
  );
}
