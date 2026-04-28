"use client";

import { resolveProductAvailability } from "@hallederiz/domain";
import { TabSwitcher } from "@hallederiz/ui";
import type { Brand, CategorySlotConfig, Factory, PriceSlotConfig, Product, Warehouse } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
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
        <span>Urun Kodu</span>
        <strong>{product.code}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Urun Adi</span>
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
        <span>Uretici Entegrasyon Kodu</span>
        <strong>{product.manufacturerIntegrationCode ?? "-"}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Varsayilan Kaynak</span>
        <strong>{product.defaultSource}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Durum</span>
        <strong>{product.active ? "Aktif" : "Pasif"}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Kritik Stok Seviyesi</span>
        <strong>{product.criticalStockLevel}</strong>
      </article>
      <article className="hz-kv-item">
        <span>Toplam Merkez Stok</span>
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
  const [activeTab, setActiveTab] = useState<ProductTabKey>("general");

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
      brandName: brand?.name ?? "-",
      factoryName: factory?.name ?? "-",
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
            <p className="drawer-eyebrow">Urun Karti</p>
            <h3>
              {product.code} - {product.name}
            </h3>
            <p className="muted">
              {generalInfo.brandName} | {product.active ? "Aktif" : "Pasif"}
            </p>
          </div>

          <div className="hz-modal-actions">
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">
              Kaydet
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              Barkod Etiketi
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              QR Etiketi
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              Yazdir
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
                    <th>Slot Adi</th>
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
            <div className="hz-tab-content table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Depo Adi</th>
                    <th>Stok</th>
                    <th>Rezerve</th>
                    <th>Kullanilabilir</th>
                    <th>Raf No</th>
                    <th>Lokasyon Kodu</th>
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
          ) : null}

          {activeTab === "barcode" ? (
            <div className="hz-tab-content hz-page-stack">
              <div className="hz-modal-panel-grid">
                <article className="hz-kv-item">
                  <span>Ana Barkod</span>
                  <strong>{product.primaryBarcode}</strong>
                </article>
                <article className="hz-kv-item">
                  <span>QR Degeri</span>
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
                <div className="preview-placeholder">Barkod Onizleme Placeholder</div>
                <div className="preview-placeholder">QR Onizleme Placeholder</div>
              </div>
            </div>
          ) : null}

          {activeTab === "factory" ? (
            <div className="hz-tab-content hz-modal-panel-grid">
              <article className="hz-kv-item">
                <span>Fabrika Adi</span>
                <strong>{generalInfo.factoryName}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Fabrika Stok Ozeti</span>
                <strong>{product.factoryStockSummary.totalStock}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Son Senkron</span>
                <strong>{product.factoryStockSummary.lastSyncedAt ?? "Henuz yok"}</strong>
              </article>
              <article className="hz-kv-item">
                <span>Entegrasyon Kodu</span>
                <strong>{product.manufacturerIntegrationCode ?? "-"}</strong>
              </article>
            </div>
          ) : null}

          {activeTab === "movements" ? (
            <div className="hz-tab-content hz-content-card">
              <h3>Stok Hareketleri</h3>
              <ul className="hz-side-list hz-margin-top-sm">
                <li>Stok timeline entegrasyonu bir sonraki fazda acilacak.</li>
                <li>Bu alanda giris, cikis, rezervasyon ve transfer olaylari gorunecek.</li>
                <li>Entity timeline baglantisi ile denetlenebilir gecmis sunulacak.</li>
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
