// @ts-nocheck
"use client";

import { LoadingState, Pagination } from "@hallederiz/ui";
import type { Product } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { useToast } from "../../../providers/toast-provider";
import { dataSourceConfig } from "../../../lib/data-source";
import {
  computeStockKpisFromDisplayedRows,
  filterStockDemoRows,
  isStockDemoRowId,
  STOCK_OPERATION_DEMO_ROWS
} from "../data/stock-demo-rows";
import { useStockData } from "../hooks/use-stock-data";
import { useStockFilters } from "../hooks/use-stock-filters";
import type { StockRow } from "../mappers/map-stock-row";
import { ProductDetailModal } from "./ProductDetailModal";
import { StockDeskPreview } from "./StockDeskPreview";
import { StockFilterBar } from "./StockFilterBar";
import { StockTable } from "./StockTable";

const MSG_STOCK_MOVE =
  "Stok hareketi henÃ¼z canlÄ± kullanÄ±ma baÄŸlÄ± deÄŸil. Onay ve iÅŸlem kuyruÄŸu baÄŸlantÄ±sÄ± tamamlandÄ±ÄŸÄ±nda uygulanÄ±r.";
const MSG_LABEL =
  "Etiket ve barkod Ã§Ä±ktÄ±sÄ± bu ortamda kapalÄ±. CanlÄ± Ã¼retim iÃ§in modÃ¼l API baÄŸlantÄ±sÄ± gerekiyor.";
const MSG_NEW_PRODUCT = "Yeni Ã¼rÃ¼n oluÅŸturma henÃ¼z canlÄ± API ve onay zincirine baÄŸlÄ± deÄŸil.";
const MSG_IMPORT_HINT = "Toplu Ã¼rÃ¼n aktarÄ±mÄ± iÃ§in Veri yÃ¼kleme ekranÄ±nÄ± kullanÄ±n.";

export function StockPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = useStockFilters();
  const { loading, products, rows, brands, factories, warehouses, categorySlots, priceSlots } = useStockData(filters);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailModalProductId, setDetailModalProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const usingDemoFallback = dataSourceConfig.useDemoData && !loading && products.length === 0;

  const displayRows = useMemo(() => {
    if (usingDemoFallback) {
      return filterStockDemoRows(STOCK_OPERATION_DEMO_ROWS, filters, factories, brands, warehouses);
    }
    return rows;
  }, [usingDemoFallback, rows, filters, factories, brands, warehouses]);

  const pagedRows = useMemo(() => displayRows.slice((page - 1) * pageSize, page * pageSize), [page, displayRows, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!displayRows.length) {
      setSelectedProductId(null);
      return;
    }
    const first = displayRows[0];
    if (!first) {
      setSelectedProductId(null);
      return;
    }
    if (!selectedProductId || !displayRows.some((r) => r.productId === selectedProductId)) {
      setSelectedProductId(first.productId);
    }
  }, [displayRows, selectedProductId]);

  const selectedProduct = useMemo<Product | null>(() => {
    if (!detailModalProductId || isStockDemoRowId(detailModalProductId)) {
      return null;
    }
    return products.find((p) => p.id === detailModalProductId) ?? null;
  }, [products, detailModalProductId]);

  const selectedRow = useMemo(() => {
    if (!selectedProductId) {
      return null;
    }
    return displayRows.find((r) => r.productId === selectedProductId) ?? null;
  }, [displayRows, selectedProductId]);

  const priceSlotActiveCount = useMemo(() => priceSlots.filter((s) => s.active).length, [priceSlots]);

  const kpi = useMemo(
    () => computeStockKpisFromDisplayedRows(displayRows, priceSlotActiveCount),
    [displayRows, priceSlotActiveCount]
  );

  const demoRowToast = useCallback(() => {
    pushToast("Bu kayÄ±t Ã¶nizleme verisidir; gerÃ§ek stok kaydÄ± ile iÅŸlem yapÄ±lmaz.");
  }, [pushToast]);

  const handleOpenDetail = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      setSelectedProductId(row.productId);
      setDetailModalProductId(row.productId);
    },
    [demoRowToast]
  );

  const handleQuickOperationFromRow = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      setSelectedProductId(row.productId);
      router.push(`/hizli-islem?product=${row.productId}`);
    },
    [demoRowToast, router]
  );

  const handleStockMovement = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      pushToast(MSG_STOCK_MOVE);
    },
    [demoRowToast, pushToast]
  );

  const handleLabelAction = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      pushToast(MSG_LABEL);
    },
    [demoRowToast, pushToast]
  );

  const emptyFiltered = !usingDemoFallback && !loading && products.length > 0 && rows.length === 0;

  return (
    <>
      <main className="hz-stock-page hz-stock-page--desk">
        <header className="hz-stock-desk-head">
          <div className="hz-stock-desk-head__text">
            <h1>Stok Operasyon MasasÄ±</h1>
            <p>Merkez, fabrika, depo, raf ve fiyat gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼nÃ¼ tek ekranda yÃ¶netin.</p>
          </div>
          <div className="hz-stock-desk-head__actions">
            <button type="button" className="hz-stock-desk-btn hz-stock-desk-btn--primary" onClick={() => pushToast(MSG_NEW_PRODUCT)}>
              <LucideIcon name="plus-square" size={14} />
              Yeni ÃœrÃ¼n
            </button>
            <button type="button" className="hz-stock-desk-btn" onClick={() => pushToast(MSG_STOCK_MOVE)}>
              <LucideIcon name="truck" size={14} />
              Stok Hareketi
            </button>
            <button
              type="button"
              className="hz-stock-desk-btn"
              onClick={() => {
                pushToast(MSG_IMPORT_HINT);
                router.push("/ayarlar/veri-yukleme");
              }}
            >
              <LucideIcon name="file-text" size={14} />
              DÄ±ÅŸa Aktar
            </button>
          </div>
        </header>

        <section className="hz-stock-desk-stats" aria-label="Stok Ã¶zetleri">
          <article>
            <span className="hz-stock-stat-ico" aria-hidden>
              <LucideIcon name="package" size={18} />
            </span>
            <div>
              <span>Toplam ÃœrÃ¼n</span>
              <strong>{kpi.totalProducts}</strong>
              <small>Aktif katalog</small>
            </div>
          </article>
          <article>
            <span className="hz-stock-stat-ico hz-stock-stat-ico--warn" aria-hidden>
              <LucideIcon name="alert-triangle" size={18} />
            </span>
            <div>
              <span>Kritik Stok</span>
              <strong>{kpi.criticalCount}</strong>
              <small>EÅŸik altÄ±</small>
            </div>
          </article>
          <article>
            <span className="hz-stock-stat-ico" aria-hidden>
              <LucideIcon name="package" size={18} />
            </span>
            <div>
              <span>Merkez Stok</span>
              <strong>{kpi.totalCenterStock}</strong>
              <small>Toplam adet</small>
            </div>
          </article>
          <article>
            <span className="hz-stock-stat-ico" aria-hidden>
              <LucideIcon name="building-2" size={18} />
            </span>
            <div>
              <span>Fabrika Stok</span>
              <strong>{kpi.totalFactoryStock}</strong>
              <small>Ãœretim hattÄ±</small>
            </div>
          </article>
          <article>
            <span className="hz-stock-stat-ico" aria-hidden>
              <LucideIcon name="building-2" size={14} />
            </span>
            <div>
              <span>Depo / Raf</span>
              <strong>{kpi.depotRafCount}</strong>
              <small>Lokasyon</small>
            </div>
          </article>
          <article>
            <span className="hz-stock-stat-ico hz-stock-stat-ico--gold" aria-hidden>
              <LucideIcon name="file-text" size={18} />
            </span>
            <div>
              <span>Fiyat Grubu</span>
              <strong>{kpi.priceGroupCount}</strong>
              <small>Aktif slot</small>
            </div>
          </article>
        </section>

        <div className="hz-stock-desk-grid">
          <section className="hz-stock-desk-main">
            {usingDemoFallback ? (
              <p className="hz-stock-preview-band" role="status">
                Ã–nizleme modu: Ã¶rnek stok kayÄ±tlarÄ± gÃ¶steriliyor.
              </p>
            ) : null}
            <StockFilterBar
              filters={filters}
              brands={brands}
              factories={factories}
              warehouses={warehouses}
              products={products}
              categorySlots={categorySlots}
              priceSlots={priceSlots}
              onFilterChange={updateFilter}
              onReset={resetFilters}
            />
            {loading ? (
              <LoadingState title="Stok verisi yÃ¼kleniyor" message="Merkez depo ve fabrika Ã¶zetleri getiriliyor." />
            ) : (
              <>
                <StockTable
                  rows={pagedRows}
                  selectedProductId={selectedProductId}
                  onSelectProduct={setSelectedProductId}
                  onOpenDetail={handleOpenDetail}
                  onStockMovement={handleStockMovement}
                  onLabelAction={handleLabelAction}
                  onQuickOperation={handleQuickOperationFromRow}
                  emptyFiltered={emptyFiltered}
                />
                <div className="hz-stock-desk-pagination">
                  <Pagination totalItems={displayRows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
                </div>
              </>
            )}
          </section>

          <StockDeskPreview
            row={selectedRow}
            onOpenDetail={handleOpenDetail}
            onStockMovement={handleStockMovement}
            onLabelAction={handleLabelAction}
            onTransfer={() => pushToast("Transfer talebi onay sonrasÄ± iÅŸlenir.")}
          />
        </div>
      </main>

      <ProductDetailModal
        open={Boolean(selectedProduct)}
        product={selectedProduct}
        brands={brands}
        factories={factories}
        warehouses={warehouses}
        priceSlots={priceSlots}
        categorySlots={categorySlots}
        onClose={() => setDetailModalProductId(null)}
      />
    </>
  );
}

