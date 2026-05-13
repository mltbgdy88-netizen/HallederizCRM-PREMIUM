"use client";

import { LoadingState, Pagination } from "@hallederiz/ui";
import type { Product } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconBarcode,
  IconBuilding,
  IconExternalLink,
  IconFileText,
  IconMapPin,
  IconPackage,
  IconPlus,
  IconSparkles,
  IconTag,
  IconTruck,
  IconUpload,
  IconWarehouse,
  IconZap
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
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
import { StockFilterBar } from "./StockFilterBar";
import { StockTable } from "./StockTable";

function statusBadgeClass(status: StockRow["displayStatus"]): string {
  switch (status) {
    case "kritik":
      return "hz-stock-badge hz-stock-badge--danger";
    case "tukeniyor":
      return "hz-stock-badge hz-stock-badge--warn";
    case "blokeli":
      return "hz-stock-badge hz-stock-badge--neutral";
    default:
      return "hz-stock-badge hz-stock-badge--ok";
  }
}

function statusLabel(status: StockRow["displayStatus"]): string {
  switch (status) {
    case "kritik":
      return "Kritik";
    case "tukeniyor":
      return "Tükeniyor";
    case "blokeli":
      return "Blokeli";
    default:
      return "Sağlıklı";
  }
}

function StockRadarPanel(props: {
  row: StockRow | null;
  radarDone: Record<string, boolean>;
  onFireRadar: (key: string, msg: string) => void;
  onOpenDetail: (row: StockRow) => void;
  onGoArchive: () => void;
  onGoQuickOp: () => void;
}) {
  const { row, radarDone, onFireRadar, onOpenDetail, onGoArchive, onGoQuickOp } = props;

  return (
    <aside className="hz-stock-side" aria-label="Stok radarı">
      <div className="hz-stock-side-inner">
        <header className="hz-stock-side-head">
          <h2 className="hz-stock-side-title">Stok Radarı</h2>
          <p className="hz-stock-side-sub">Seçili ürünün depo, fabrika, fiyat ve kritik stok özeti.</p>
        </header>

        {!row ? (
          <div className="hz-stock-empty hz-stock-empty--side" role="status">
            <p className="hz-stock-empty-title">Henüz seçim yok</p>
            <p className="hz-stock-empty-text">Listeden bir ürün seçin.</p>
          </div>
        ) : (
          <div className="hz-stock-side-stack">
            <article className="hz-stock-side-card">
              <h3 className="hz-stock-side-card-title">Ürün kimliği</h3>
              <p className="hz-stock-side-strong">{row.productName}</p>
              <dl className="hz-stock-dl">
                <div>
                  <dt>Ürün kodu</dt>
                  <dd>{row.productCode}</dd>
                </div>
                <div>
                  <dt>Marka</dt>
                  <dd>{row.brandName}</dd>
                </div>
                <div>
                  <dt>Kategori</dt>
                  <dd>{row.categorySummary}</dd>
                </div>
                <div>
                  <dt>Barkod / QR</dt>
                  <dd>
                    {row.primaryBarcode} / {row.qrCodeValue}
                  </dd>
                </div>
              </dl>
              <p className="hz-stock-side-badges">
                <span className={statusBadgeClass(row.displayStatus)}>{statusLabel(row.displayStatus)}</span>
                {!row.active ? <span className="hz-stock-badge hz-stock-badge--neutral">Pasif</span> : null}
              </p>
            </article>

            <article className="hz-stock-side-card">
              <h3 className="hz-stock-side-card-title">Stok özeti</h3>
              <dl className="hz-stock-dl">
                <div>
                  <dt>Merkez stok</dt>
                  <dd>{row.centerWarehouseStockTotal}</dd>
                </div>
                <div>
                  <dt>Fabrika stok</dt>
                  <dd>{row.factoryStockTotal}</dd>
                </div>
                <div>
                  <dt>Kritik eşik</dt>
                  <dd>{row.criticalLevel > 0 ? row.criticalLevel : "—"}</dd>
                </div>
                <div>
                  <dt>Rezerve / bekleyen</dt>
                  <dd>{row.reservedTotal}</dd>
                </div>
                <div>
                  <dt>Kullanılabilir stok</dt>
                  <dd>{row.availableTotal}</dd>
                </div>
              </dl>
            </article>

            <article className="hz-stock-side-card">
              <h3 className="hz-stock-side-card-title">Depo / raf</h3>
              <dl className="hz-stock-dl">
                <div>
                  <dt>Merkez depo</dt>
                  <dd>{row.depotDisplayName}</dd>
                </div>
                <div>
                  <dt>Raf no</dt>
                  <dd>{row.rackDisplayLine}</dd>
                </div>
                <div>
                  <dt>Fabrika lokasyonu</dt>
                  <dd>{row.factoryName}</dd>
                </div>
                <div>
                  <dt>Son sayım</dt>
                  <dd>{row.lastCountLine}</dd>
                </div>
                <div>
                  <dt>Son hareket</dt>
                  <dd>{row.lastMovementLine}</dd>
                </div>
              </dl>
            </article>

            <article className="hz-stock-side-card">
              <h3 className="hz-stock-side-card-title">Fiyat ve slotlar</h3>
              <dl className="hz-stock-dl">
                <div>
                  <dt>Liste fiyatı</dt>
                  <dd>{row.priceMainLine}</dd>
                </div>
                <div>
                  <dt>Bayi fiyatı</dt>
                  <dd>{row.dealerPriceLine}</dd>
                </div>
                <div>
                  <dt>Kurumsal fiyat</dt>
                  <dd>{row.corporatePriceLine}</dd>
                </div>
                <div>
                  <dt>Para birimi</dt>
                  <dd>{row.listPriceCurrency}</dd>
                </div>
                <div>
                  <dt>Fiyat grubu</dt>
                  <dd>{row.priceGroupLabel}</dd>
                </div>
              </dl>
            </article>

            <article className="hz-stock-side-card">
              <h3 className="hz-stock-side-card-title">Hızlı aksiyonlar</h3>
              <div className="hz-stock-side-actions">
                <button type="button" className="hz-stock-side-btn hz-stock-side-btn--primary" onClick={() => onOpenDetail(row)}>
                  <IconFileText size={14} aria-hidden />
                  Detay aç
                </button>
                <button
                  type="button"
                  className="hz-stock-side-btn"
                  disabled={Boolean(radarDone.move)}
                  onClick={() => onFireRadar("move", "Stok hareketi yalnız policy/onay ve execution zinciri tamamlanınca uygulanır.")}
                >
                  <IconTruck size={14} aria-hidden />
                  Stok hareketi
                </button>
                <button
                  type="button"
                  className="hz-stock-side-btn"
                  disabled={Boolean(radarDone.label)}
                  onClick={() => onFireRadar("label", "Etiket/barkod çıktısı bu ortamda canlı üretim için hazır değil.")}
                >
                  <IconBarcode size={14} aria-hidden />
                  Etiket / barkod
                </button>
                <button
                  type="button"
                  className="hz-stock-side-btn"
                  disabled={Boolean(radarDone.price)}
                  onClick={() => onFireRadar("price", "Fiyat güncellemesi policy/onay kontrolü olmadan canlıya alınmaz.")}
                >
                  <IconTag size={14} aria-hidden />
                  Fiyat güncelle
                </button>
                <button
                  type="button"
                  className="hz-stock-side-btn"
                  disabled={Boolean(radarDone.quick)}
                  onClick={() => {
                    onFireRadar("quick", "Hızlı İşlem ekranına yönlendirildi. Canlı mutation sonucu ayrı doğrulanır.");
                    onGoQuickOp();
                  }}
                >
                  <IconZap size={14} aria-hidden />
                  Hızlı işleme al
                </button>
                <button
                  type="button"
                  className="hz-stock-side-btn"
                  disabled={Boolean(radarDone.arch)}
                  onClick={() => {
                    onFireRadar("arch", "Arşiv ekranına yönlendirildi. Kayıt durumu backend yanıtına göre gösterilir.");
                    onGoArchive();
                  }}
                >
                  <IconExternalLink size={14} aria-hidden />
                  Arşivde gör
                </button>
              </div>
            </article>

            <article className="hz-stock-side-card hz-stock-risk-note">
              <h3 className="hz-stock-side-card-title">
                <IconSparkles size={14} aria-hidden /> Risk / AI notu
              </h3>
              <p>Kritik stok seviyesine yaklaşan ürünlerde yeni sipariş öncesi fabrika stok teyidi önerilir.</p>
              <p>AI yalnızca özet/öneri üretir; stok hareketi backend onay zincirinden geçer.</p>
            </article>
          </div>
        )}
      </div>
    </aside>
  );
}

export function StockPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = useStockFilters();
  const { loading, products, rows, brands, factories, warehouses, categorySlots, priceSlots } = useStockData(filters);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailModalProductId, setDetailModalProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [topCtaDone, setTopCtaDone] = useState<Record<string, boolean>>({});
  const [radarDone, setRadarDone] = useState<Record<string, boolean>>({});

  const pageSize = 20;

  const usingDemoFallback = !loading && products.length === 0;

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
    if (selectedProductId && !displayRows.some((r) => r.productId === selectedProductId)) {
      setSelectedProductId(null);
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

  const fireTopDemo = (key: string, msg: string) => {
    if (topCtaDone[key]) {
      return;
    }
    pushToast(msg);
    setTopCtaDone((d) => ({ ...d, [key]: true }));
  };

  const fireRadarDemo = useCallback(
    (key: string, msg: string) => {
      if (radarDone[key]) {
        return;
      }
      pushToast(msg);
      setRadarDone((d) => ({ ...d, [key]: true }));
    },
    [pushToast, radarDone]
  );

  const demoRowToast = useCallback(() => {
    pushToast("Bu satır örnek veri modunda. Production'da yalnız gerçek stok kaydıyla işlem açılır.");
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
      pushToast("Hızlı İşlem ekranına yönlendirildi. Canlı execution sonucu policy/onay durumuna bağlıdır.");
      router.push("/hizli-islem");
    },
    [demoRowToast, pushToast, router]
  );

  const handleStockMovement = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      fireTopDemo("stockMove", "Stok hareketi yalnız onay + execution zinciri ile canlı uygulanır.");
    },
    [demoRowToast, fireTopDemo]
  );

  const handleLabelAction = useCallback(
    (row: StockRow) => {
      if (isStockDemoRowId(row.productId)) {
        demoRowToast();
        return;
      }
      fireTopDemo("label", "Etiket/barkod çıktısı bu ortamda canlı olarak üretilemez.");
    },
    [demoRowToast, fireTopDemo]
  );

  const emptyFiltered = !usingDemoFallback && !loading && products.length > 0 && rows.length === 0;

  return (
    <div className="hz-stock-page">
      <div className="hz-stock-layout">
        <div className="hz-stock-main">
          {usingDemoFallback ? (
            <div className="hz-stock-preview-band" role="status">
              Önizleme modu: örnek stok kayıtları gösteriliyor.
            </div>
          ) : null}

          <header className="hz-stock-topbar">
            <div className="hz-stock-topbar-text">
              <h1 className="hz-stock-topbar-title">Ürün / Stok Merkezi</h1>
              <p className="hz-stock-topbar-sub">Merkez, fabrika, depo, raf ve fiyat görünürlüğünü tek ekranda yönetin.</p>
            </div>
            <div className="hz-stock-topbar-actions">
              <button
                type="button"
                className="hz-stock-toolbar-btn hz-stock-toolbar-btn--primary"
                disabled={Boolean(topCtaDone.newProduct)}
                onClick={() => fireTopDemo("newProduct", "Yeni ürün açma akışı henüz canlı konfigüre değil (blocked_not_configured).")}
              >
                <IconPlus size={16} aria-hidden />
                Yeni ürün
              </button>
              <button
                type="button"
                className="hz-stock-toolbar-btn hz-stock-toolbar-btn--outline"
                disabled={Boolean(topCtaDone.stockMoveTop)}
                onClick={() => fireTopDemo("stockMoveTop", "Stok hareketi yalnız onay + execution zinciri ile uygulanır.")}
              >
                <IconTruck size={16} aria-hidden />
                Stok hareketi
              </button>
              <button
                type="button"
                className="hz-stock-toolbar-btn hz-stock-toolbar-btn--outline"
                disabled={Boolean(topCtaDone.labelTop)}
                onClick={() => fireTopDemo("labelTop", "Etiket/barkod çıktısı canlı modda henüz not_configured.")}
              >
                <IconBarcode size={16} aria-hidden />
                Etiket / barkod
              </button>
              <button
                type="button"
                className="hz-stock-toolbar-btn hz-stock-toolbar-btn--outline"
                disabled={Boolean(topCtaDone.import)}
                onClick={() => fireTopDemo("import", "İçe aktarma bu modda canlıya açık değil; ayarlar/veri-yükleme üzerinden ilerleyin.")}
              >
                <IconUpload size={16} aria-hidden />
                İçe aktar
              </button>
            </div>
          </header>

          <div className="hz-stock-kpi-strip" aria-label="Stok KPI özeti">
            <div className="hz-stock-kpi hz-stock-kpi--info">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconPackage size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Toplam ürün</span>
                <span className="hz-stock-kpi-value">{kpi.totalProducts}</span>
              </div>
            </div>
            <div className="hz-stock-kpi hz-stock-kpi--danger">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconAlertTriangle size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Kritik stok</span>
                <span className="hz-stock-kpi-value">{kpi.criticalCount}</span>
              </div>
            </div>
            <div className="hz-stock-kpi hz-stock-kpi--ok">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconWarehouse size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Merkez stok</span>
                <span className="hz-stock-kpi-value">{kpi.totalCenterStock}</span>
              </div>
            </div>
            <div className="hz-stock-kpi hz-stock-kpi--warn">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconBuilding size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Fabrika stok</span>
                <span className="hz-stock-kpi-value">{kpi.totalFactoryStock}</span>
              </div>
            </div>
            <div className="hz-stock-kpi hz-stock-kpi--cyan">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconMapPin size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Depo / raf</span>
                <span className="hz-stock-kpi-value">{kpi.depotRafCount}</span>
              </div>
            </div>
            <div className="hz-stock-kpi hz-stock-kpi--primary">
              <span className="hz-stock-kpi-ico" aria-hidden>
                <IconTag size={16} />
              </span>
              <div>
                <span className="hz-stock-kpi-label">Fiyat grubu</span>
                <span className="hz-stock-kpi-value">{kpi.priceGroupCount}</span>
              </div>
            </div>
          </div>

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
            <LoadingState title="Stok verisi yükleniyor" message="Merkez depo ve fabrika özetleri getiriliyor." />
          ) : (
            <div className="hz-stock-list-wrap">
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
              <div className="hz-stock-pagination">
                <Pagination totalItems={displayRows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
              </div>
            </div>
          )}
        </div>

        <StockRadarPanel
          row={selectedRow}
          radarDone={radarDone}
          onFireRadar={fireRadarDemo}
          onOpenDetail={handleOpenDetail}
          onGoArchive={() => router.push("/archive")}
          onGoQuickOp={() => router.push("/hizli-islem")}
        />
      </div>

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
    </div>
  );
}
