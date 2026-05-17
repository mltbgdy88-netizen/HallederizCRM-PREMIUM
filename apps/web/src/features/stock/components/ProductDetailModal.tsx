"use client";

import { resolveProductAvailability } from "@hallederiz/domain";
import { TabSwitcher } from "@hallederiz/ui";
import type { Brand, CategorySlotConfig, Factory, PriceSlotConfig, Product, Warehouse } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { usePricingPreview } from "../../pricing/hooks/use-pricing-preview";
import { formatCurrency } from "../../pricing/utils/format-currency";

type ProductTabKey = "general" | "prices" | "categories" | "warehouses" | "barcode" | "factory" | "movements";

const TAB_ITEMS: { key: ProductTabKey; label: string }[] = [
  { key: "general", label: "Genel" },
  { key: "prices", label: "Fiyatlar" },
  { key: "categories", label: "Kategoriler" },
  { key: "warehouses", label: "Depolar" },
  { key: "barcode", label: "Barkod / QR" },
  { key: "factory", label: "Fabrika" },
  { key: "movements", label: "Hareketler" }
];

const MSG_MODAL_SAVE = "Ürün kaydı henüz canlı API ve onay zincirine bağlı değil.";
const MSG_MODAL_LABEL =
  "Etiket ve barkod çıktısı bu ortamda kapalı. Canlı üretim için modül API bağlantısı gerekiyor.";
const MSG_MODAL_PRINT = "Yazdırma çıktısı bu ortamda henüz kullanıma açık değil.";

export interface ProductDetailModalProps {
  open: boolean;
  product: Product | null;
  brands: Brand[];
  factories: Factory[];
  warehouses: Warehouse[];
  priceSlots: PriceSlotConfig[];
  categorySlots: CategorySlotConfig[];
  onClose: () => void;
}

function renderGeneralTab(product: Product, brandName: string, factoryName: string, centerStockTotal: number) {
  return (
    <div className="hz-modal-panel-grid hz-tab-content">
      <article className="hz-kv-item">
        <span>Ürün kodu</span>
        <strong>{product.code}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Ürün adı</span>
        <strong>{product.name}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Marka</span>
        <strong>{brandName}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Fabrika</span>
        <strong>{factoryName}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Üretici entegrasyon kodu</span>
        <strong>{product.manufacturerIntegrationCode ?? "—"}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Varsayılan kaynak</span>
        <strong>{product.defaultSource}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Durum</span>
        <strong>{product.active ? "Aktif" : "Pasif"}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Kritik stok seviyesi</span>
        <strong>{product.criticalStockLevel}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Toplam merkez stok</span>
        <strong>{centerStockTotal}</strong>
      </article>
    </div>
  );
}

export function ProductDetailModal({
  open,
  product,
  brands,
  factories,
  warehouses,
  priceSlots,
  categorySlots,
  onClose
}: ProductDetailModalProps) {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<ProductTabKey>("general");

  const notifyNotLive = useCallback(
    (message: string) => {
      pushToast(message);
    },
    [pushToast]
  );

  useEffect(() => {
    if (open) {
      setActiveTab("general");
    }
  }, [open, product?.id]);

  const priceRows = usePricingPreview(priceSlots, product?.priceTiers ?? []);

  const generalInfo = useMemo(() => {
    if (!product) {
      return null;
    }

    const brand = brands.find((item) => item.id === product.brandId);
    const factory = factories.find((item) => item.id === product.factoryId);
    const availability = resolveProductAvailability({ product, warehouses });

    return {
      brandName: brand?.name ?? "—",
      factoryName: factory?.name ?? "—",
      centerStockTotal: availability.centerStockTotal
    };
  }, [product, brands, factories, warehouses]);

  if (!open || !product || !generalInfo) {
    return null;
  }

  return (
    <div className="hz-modal-overlay" role="presentation" onClick={onClose}>
      <aside className="hz-modal stock-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header stock-drawer-header">
          <div>
            <p className="drawer-eyebrow">Ürün kartı</p>
            <h3>
              {product.code} - {product.name}
            </h3>
            <p className="muted">
              {generalInfo.brandName} | {product.active ? "Aktif" : "Pasif"}
            </p>
          </div>

          <div className="hz-modal-actions">
            <button
              type="button"
              className="hz-btn hz-btn-primary hz-toolbar-btn"
              title="Kayıt henüz canlıya bağlı değil"
              onClick={() => notifyNotLive(MSG_MODAL_SAVE)}
            >
              Kaydet
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              title="Etiket çıktısı bu ortamda kapalı"
              onClick={() => notifyNotLive(MSG_MODAL_LABEL)}
            >
              Barkod etiketi
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              title="QR etiket çıktısı bu ortamda kapalı"
              onClick={() => notifyNotLive(MSG_MODAL_LABEL)}
            >
              QR etiketi
            </button>
            <button
              type="button"
              className="hz-btn hz-btn-secondary hz-toolbar-btn"
              title="Yazdırma henüz kullanıma açık değil"
              onClick={() => notifyNotLive(MSG_MODAL_PRINT)}
            >
              Yazdır
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onClose}>
              Kapat
            </button>
          </div>
        </header>

        <div className="stock-drawer-tabs">
          <TabSwitcher
            items={TAB_ITEMS.map((item) => ({ key: item.key, label: item.label }))}
            activeKey={activeTab}
            onChange={(nextTab) => setActiveTab(nextTab as ProductTabKey)}
          />
        </div>

        <div className="stock-drawer-content hz-modal-content">
          {activeTab === "general"
            ? renderGeneralTab(product, generalInfo.brandName, generalInfo.factoryName, generalInfo.centerStockTotal)
            : null}

          {activeTab === "prices" ? (
            <div className="hz-tab-content table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Slot adı</th>
                    <th>Tutar</th>
                    <th>Para Birimi</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map((row) => (
                    <tr key={row.slotNumber}>
                      <td>{row.slotName}</td>
                      <td>{formatCurrency(row.amount, row.currency)}</td>
                      <td>{row.currency}</td>
                      <td>
                        <span className={`hz-badge ${row.active ? "hz-badge-success" : "hz-badge-warning"}`}>
                          {row.active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === "categories" ? (
            <div className="hz-tab-content hz-modal-panel-grid">
              {categorySlots.map((slot) => {
                const value = product.categoryValues.find((item) => item.slotNumber === slot.slotNumber)?.value ?? "-";
                return (
                  <article key={slot.slotNumber} className="hz-kv-item">
                    <span>{slot.slotName}</span>
                    <strong>{value}</strong>
                  </article>
                );
              })}
            </div>
          ) : null}

          {activeTab === "warehouses" ? (
            warehouses.length === 0 ? (
              <div className="hz-tab-content hz-content-card" role="status">
                <p>Depo ve raf verisi bu ortamda bağlı değil. Merkez stok özeti ürün kaydından okunur.</p>
              </div>
            ) : (
            <div className="hz-tab-content table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Depo adı</th>
                    <th>Stok</th>
                    <th>Rezerve</th>
                    <th>Kullanılabilir</th>
                    <th>Raf no</th>
                    <th>Lokasyon kodu</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => {
                    const stock = product.warehouseStocks.find((item) => item.warehouseId === warehouse.id);
                    const location = product.locations.find((item) => item.warehouseId === warehouse.id);
                    const onHand = stock?.onHand ?? 0;
                    const reserved = stock?.reserved ?? 0;

                    return (
                      <tr key={warehouse.id}>
                        <td>{warehouse.name}</td>
                        <td>{onHand}</td>
                        <td>{reserved}</td>
                        <td>{Math.max(onHand - reserved, 0)}</td>
                        <td>{location?.rackNo ?? "-"}</td>
                        <td>{location?.locationCode ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )
          ) : null}

          {activeTab === "barcode" ? (
            <div className="hz-tab-content hz-page-stack">
              <div className="hz-modal-panel-grid">
                <article className="hz-kv-item">
                  <span>Ana Barkod</span>
                  <strong>{product.primaryBarcode}</strong>
                </article>
                <article className="hz-kv-item">
                  <span>QR değeri</span>
                  <strong>{product.qrCodeValue}</strong>
                </article>
              </div>

              <div className="hz-content-card">
                <h3>Alias Barkodlar</h3>
                <div className="hz-pill-grid hz-margin-top-sm">
                  {product.barcodeAliases.map((alias) => (
                    <span key={alias.id} className="hz-pill">
                      {alias.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hz-modal-panel-grid">
                <div className="preview-placeholder">Barkod �nizlemesi bu ortamda kullan�lam�yor.</div>
                <div className="preview-placeholder">QR �nizlemesi bu ortamda kullan�lam�yor.</div>
              </div>
            </div>
          ) : null}

          {activeTab === "factory" ? (
            <div className="hz-tab-content hz-modal-panel-grid">
              <article className="hz-kv-item">
                <span>Fabrika adı</span>
                <strong>{generalInfo.factoryName}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Fabrika stok özeti</span>
                <strong>{product.factoryStockSummary.totalStock}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Son Senkron</span>
                <strong>{product.factoryStockSummary.lastSyncedAt ?? "Henüz yok"}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Entegrasyon kodu</span>
                <strong>{product.manufacturerIntegrationCode ?? "—"}</strong>
              </article>
            </div>
          ) : null}

          {activeTab === "movements" ? (
            <div className="hz-tab-content hz-content-card">
              <h3>Stok Hareketleri</h3>
              <ul className="hz-side-list hz-margin-top-sm">
                <li>Stok hareket geçmişi henüz canlı kullanıma bağlı değil.</li>
                <li>Bu alanda giriş, çıkış, rezervasyon ve transfer olayları görünecek.</li>
                <li>Onay ve denetim kaydı timeline ile birlikte sunulacak.</li>
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
