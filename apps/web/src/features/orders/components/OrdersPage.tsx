"use client";

import { EntityListPageTemplate, LoadingState, MetricCard, Pagination, PrimaryActionToolbar } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OrderFilterBar } from "./OrderFilterBar";
import { OrderQuickPreviewPanel } from "./OrderQuickPreviewPanel";
import { OrderTable } from "./OrderTable";
import { useOrderFilters } from "../hooks/use-order-filters";
import { useOrdersData } from "../hooks/use-orders-data";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";

export function OrdersPage() {
  const router = useRouter();
  const { pushToast } = useToast();
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

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedOrderId(null);
      return;
    }
    const first = filteredOrders[0];
    if (!first) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !filteredOrders.some((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(first.id);
    }
  }, [filteredOrders, selectedOrderId]);

  return (
    <EntityListPageTemplate
      className="hz-orders-page"
      header={
        <div className="hz-orders-head">
          <div className="hz-orders-head-text">
            <h1 className="hz-orders-head-title">Siparişler</h1>
            <p className="hz-orders-head-sub">Sipariş, kaynak planı, tahsilat ve depo etkisini tek operasyon listesinde yönetin.</p>
          </div>
          <section className="hz-metric-grid">
            <MetricCard title="Açık sipariş" value={String(filteredOrders.length)} detail="Filtre kapsamında" tone="info" />
            <MetricCard
              title="Tahsilat eksik"
              value={String(filteredOrders.filter((order) => order.paymentStatus !== "paid").length)}
              detail="Finans kontrolü"
              tone="warning"
            />
            <MetricCard
              title="Depo hazırlık"
              value={String(filteredOrders.filter((order) => order.deliveryStatus === "preparing").length)}
              detail="Aktif operasyon"
              tone="info"
            />
            <MetricCard
              title="Fabrika gerekli"
              value={String(filteredOrders.filter((order) => order.sourcePlans.some((plan) => plan.factoryQuantity > 0)).length)}
              detail="Kaynak planı"
              tone="danger"
            />
          </section>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-orders-preview-band" role="status">
              Örnek veri modu: liste kayıtları demo amaçlıdır.
            </p>
          ) : null}
          <PrimaryActionToolbar>
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/siparisler/yeni")}>
              Yeni sipariş
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push("/teklifler")}>
              Tekliften dönüştür
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              onClick={() => pushToast("Toplu durum güncellemesi canlıda onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
            >
              Toplu durum güncelle
            </button>
          </PrimaryActionToolbar>
        </div>
      }
      filters={<OrderFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />}
      list={
        loading ? (
          <LoadingState title="Siparişler yükleniyor" message="Kaynak planı, tahsilat ve depo etkisi hazırlanıyor." />
        ) : (
          <OrderTable
            rows={pagedRows}
            selectedOrderId={selectedOrder?.id ?? null}
            onSelectOrder={setSelectedOrderId}
            onOpenOrder={(orderId) => router.push(`/siparisler/${orderId}`)}
          />
        )
      }
      pagination={
        loading ? null : <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
      }
      preview={
        <div className="hz-orders-side">
          <OrderQuickPreviewPanel order={selectedOrder} customer={selectedCustomer} />
        </div>
      }
    />
  );
}

