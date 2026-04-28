"use client";

import { LoadingState, MetricCard, PageHeader, Pagination, SplitContentLayout } from "@hallederiz/ui";
import type { Product } from "@hallederiz/types";
import { useMemo, useState } from "react";
import { StockFilterBar } from "./StockFilterBar";
import { ProductDetailModal } from "./ProductDetailModal";
import { StockTable } from "./StockTable";
import { StockToolbar } from "./StockToolbar";
import { useStockData } from "../hooks/use-stock-data";
import { useStockFilters } from "../hooks/use-stock-filters";
import type { StockRow } from "../mappers/map-stock-row";

function StockQuickSummaryPanel({ row }: { row: StockRow | null }) {
  return (
    <aside className="hz-side-panel">
      <p className="drawer-eyebrow">Urun Ozeti</p>
      <h3>{row ? `${row.productCode} - ${row.productName}` : "Secili urun yok"}</h3>
      <p className="muted">Secili kaydin merkez/fabrika stok gorunurlugu ve kritik durum ozeti.</p>
      <div className="detail-list">
        <span>Marka</span>
        <strong>{row?.brandName ?? "-"}</strong>
        <span>Merkez stok</span>
        <strong>{row?.centerWarehouseStockTotal ?? 0}</strong>
        <span>Fabrika stok</span>
        <strong>{row?.factoryStockTotal ?? 0}</strong>
        <span>Kritik durum</span>
        <strong>{row ? (row.criticalStockStatus === "critical" ? "Kritik" : "Saglikli") : "-"}</strong>
      </div>
    </aside>
  );
}

export function StockPage() {
  const { filters, updateFilter, resetFilters } = useStockFilters();
  const { loading, products, rows, brands, factories, warehouses, categorySlots, priceSlots } = useStockData(filters);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);

  const selectedProduct = useMemo<Product | null>(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );
  const selectedRow = useMemo<StockRow | null>(
    () => rows.find((row) => row.productId === selectedProductId) ?? pagedRows[0] ?? null,
    [pagedRows, rows, selectedProductId]
  );

  const criticalCount = useMemo(
    () => rows.filter((row) => row.criticalStockStatus === "critical").length,
    [rows]
  );

  const totalCenterStock = useMemo(
    () => rows.reduce((total, row) => total + row.centerWarehouseStockTotal, 0),
    [rows]
  );

  const totalFactoryStock = useMemo(
    () => rows.reduce((total, row) => total + row.factoryStockTotal, 0),
    [rows]
  );

  return (
    <div className="hz-page-stack stock-page">
      <PageHeader
        title="Stok"
        description="Urun, depo, barkod/QR, fiyat slotlari ve fabrika gorunurlugunu yaln ama guclu bir operasyon ekraninda yonetin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Toplam Urun" value={String(rows.length)} detail="Aktif katalog satiri" tone="info" />
        <MetricCard title="Kritik Stok" value={String(criticalCount)} detail="Oncelikli kontrol" tone="danger" pulse={criticalCount > 0} />
        <MetricCard title="Merkez Stok" value={String(totalCenterStock)} detail="Merkez depolar toplami" tone="success" />
        <MetricCard title="Fabrika Stogu" value={String(totalFactoryStock)} detail="Fabrika bildirimi" tone="warning" />
      </section>

      <div className="stock-summary-note">
        Stok listesi sade tutulur: tabloda sadece operasyon kararina etki eden alanlar gorunur. Detay seviyeleri urun
        modalinda acilir.
      </div>

      <StockToolbar onActionClick={() => undefined} />

      <StockFilterBar
        filters={filters}
        brands={brands}
        factories={factories}
        products={products}
        categorySlots={categorySlots}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {loading ? (
        <LoadingState title="Stok verisi yukleniyor" message="Merkez depo ve fabrika ozetleri getiriliyor." />
      ) : (
        <SplitContentLayout
          main={
            <>
              <StockTable rows={pagedRows} onSelectProduct={setSelectedProductId} selectedProductId={selectedRow?.productId ?? null} />
              <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          }
          side={<StockQuickSummaryPanel row={selectedRow} />}
        />
      )}

      <ProductDetailModal
        open={Boolean(selectedProduct)}
        product={selectedProduct}
        brands={brands}
        factories={factories}
        warehouses={warehouses}
        priceSlots={priceSlots}
        categorySlots={categorySlots}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
