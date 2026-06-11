"use client";

import type { StockDisplayStatus } from "../mappers/map-stock-row";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "../../../providers/toast-provider";
import { isStockDemoRowId } from "../data/stock-demo-rows";
import { useStockOperationsDeskState } from "../hooks/use-stock-operations-desk-state";
import type { SomReferenceTableRow } from "../utils/map-stock-to-reference-desk";
import { statusBadgeClass } from "../utils/map-stock-to-reference-desk";
import { ProductDetailModal } from "./ProductDetailModal";
import {
  IconAlert,
  IconClose,
  IconExport,
  IconInfo,
  IconInfoSmall,
  IconMove,
  IconPin,
  IconPlus,
  IconRefresh,
  IconSearch,
  ProductThumbIcon,
  SomKpiIconSvg
} from "./stock-reference-icons";

const MSG_STOCK_MOVE =
  "Stok hareketi henüz canlı kullanıma bağlı değil. Onay ve işlem kuyruğu bağlantısı tamamlandığında uygulanır.";
const MSG_LABEL =
  "Etiket ve barkod çıktısı bu ortamda kapalı. Canlı üretim için modül API bağlantısı gerekiyor.";
const MSG_NEW_PRODUCT = "Yeni ürün oluşturma henüz canlı API ve onay zincirine bağlı değil.";
const MSG_IMPORT_HINT = "Toplu ürün aktarımı için Veri yükleme ekranını kullanın.";

const PAGE_COPY = {
  title: "Stok Operasyon Masası",
  subtitle: "Merkez, fabrika, depo ve raf bazında stok yönetimi ve operasyon ekranı.",
  searchPlaceholder: "Ürün ara (kod, ad, barkod)...",
  demoBanner: "Demo Verisi: Bu ekran demo amaçlıdır. Gerçek veriler farklılık gösterebilir."
} as const;

function StockTableRow({
  row,
  selected,
  onSelect,
  onDetail,
  onStock,
  onLabel
}: {
  row: SomReferenceTableRow;
  selected: boolean;
  onSelect: () => void;
  onDetail: () => void;
  onStock: () => void;
  onLabel: () => void;
}) {
  return (
    <tr className={selected ? "som-row som-row--selected" : "som-row"} onClick={onSelect}>
      <td className="som-cell-product">
        <ProductThumbIcon />
        <div>
          <span className="som-product-code">{row.code}</span>
          <span className="som-product-name">{row.name}</span>
        </div>
      </td>
      <td>{row.centerStock}</td>
      <td>{row.factoryStock}</td>
      <td>
        <span className="som-depot-main">{row.depotRaf}</span>
        <span className="som-depot-sub">/ {row.depotRafSub}</span>
      </td>
      <td>{row.price}</td>
      <td>
        <span className={statusBadgeClass(row.status)}>{row.status}</span>
      </td>
      <td className="som-cell-actions" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onDetail}>
          Detay
        </button>
        <button type="button" onClick={onStock}>
          Stok
        </button>
        <button type="button" onClick={onLabel}>
          Etiket
        </button>
      </td>
    </tr>
  );
}

export function StockReferenceLayout() {
  const router = useRouter();
  const { pushToast } = useToast();
  const desk = useStockOperationsDeskState();

  const demoRowToast = useCallback(() => {
    pushToast("Bu kayıt önizleme verisidir; gerçek stok kaydı ile işlem yapılmaz.");
  }, [pushToast]);

  const guardDemo = useCallback(
    (productId: string, action: () => void) => {
      if (isStockDemoRowId(productId)) {
        demoRowToast();
        return;
      }
      action();
    },
    [demoRowToast]
  );

  const openDetail = (productId: string) => {
    guardDemo(productId, () => desk.openDetailModal(productId));
  };

  const openStockMovement = (productId: string) => {
    guardDemo(productId, () => pushToast(MSG_STOCK_MOVE));
  };

  const openLabel = (productId: string) => {
    guardDemo(productId, () => pushToast(MSG_LABEL));
  };

  const handleTransfer = (productId: string) => {
    guardDemo(productId, () => pushToast("Transfer talebi onay sonrası işlenir."));
  };

  return (
    <>
      <div className="som-home som-home--embedded" data-page="stok-reference-desk" aria-live="polite">
        <header className="som-head">
          <div className="som-head-text">
            <h1>{PAGE_COPY.title}</h1>
            <p>{PAGE_COPY.subtitle}</p>
          </div>
          <div className="som-head-actions">
            <button type="button" className="som-btn som-btn--primary" onClick={() => pushToast(MSG_NEW_PRODUCT)}>
              <IconPlus className="som-btn-icon" />
              Yeni Ürün
            </button>
            <button type="button" className="som-btn som-btn--outline" onClick={() => pushToast(MSG_STOCK_MOVE)}>
              <IconMove className="som-btn-icon" />
              Stok Hareketi
            </button>
            <button
              type="button"
              className="som-btn som-btn--outline"
              onClick={() => {
                pushToast(MSG_IMPORT_HINT);
                router.push("/ayarlar/veri-yukleme");
              }}
            >
              <IconExport className="som-btn-icon" />
              Dışa Aktar
            </button>
          </div>
        </header>

        <section className="som-kpi-row" aria-label="Stok özetleri">
          {desk.kpis.map((kpi) => (
            <article key={kpi.id} className={`som-kpi-card som-kpi-card--${kpi.tone}`}>
              <div className={`som-kpi-icon som-kpi-icon--${kpi.tone}`}>
                <SomKpiIconSvg icon={kpi.icon} />
              </div>
              <div className="som-kpi-body">
                <span className="som-kpi-value">{kpi.value}</span>
                <span className="som-kpi-label">{kpi.label}</span>
              </div>
              <button type="button" className="som-kpi-info" aria-label={`${kpi.label} bilgisi`}>
                <IconInfo className="som-kpi-info-icon" />
              </button>
            </article>
          ))}
        </section>

        {desk.showDemoBanner ? (
          <p className="som-mode-band" role="status">
            {PAGE_COPY.demoBanner}
          </p>
        ) : !desk.usingDemoFallback && !desk.loading && desk.displayRowsCount > 0 ? (
          <p className="som-mode-band som-mode-band--live" role="status">
            Canlı stok kataloğu yüklendi.
          </p>
        ) : null}

        <div className="som-workspace">
          <section className="som-main" aria-label="Stok listesi">
            <div className="som-filters">
              <label className="som-filter-search">
                <IconSearch className="som-filter-search-icon" />
                <input
                  type="search"
                  value={desk.filters.searchText}
                  onChange={(event) => desk.updateFilter("searchText", event.target.value)}
                  placeholder={PAGE_COPY.searchPlaceholder}
                  aria-label="Ürün ara"
                />
              </label>
              <label className="som-filter-field">
                <span>Marka</span>
                <select
                  value={desk.filters.brandId}
                  onChange={(event) => desk.updateFilter("brandId", event.target.value)}
                  aria-label="Marka"
                >
                  <option value="">Tümü</option>
                  {desk.brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="som-filter-field">
                <span>Fabrika</span>
                <select
                  value={desk.filters.factoryId}
                  onChange={(event) => desk.updateFilter("factoryId", event.target.value)}
                  aria-label="Fabrika"
                >
                  <option value="">Tümü</option>
                  {desk.factories.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="som-filter-field">
                <span>Depo</span>
                <select
                  value={desk.filters.warehouseId}
                  onChange={(event) => desk.updateFilter("warehouseId", event.target.value)}
                  aria-label="Depo"
                >
                  <option value="">Tümü</option>
                  {desk.warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="som-filter-field">
                <span>{desk.categoryLabel}</span>
                <select
                  value={desk.filters.category1}
                  onChange={(event) => desk.updateFilter("category1", event.target.value)}
                  aria-label={desk.categoryLabel}
                >
                  <option value="">Tümü</option>
                  {desk.categoryOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="som-filter-field">
                <span>Durum</span>
                <select
                  value={desk.filters.stockStatusFilter}
                  onChange={(event) =>
                    desk.updateFilter("stockStatusFilter", event.target.value as StockDisplayStatus | "")
                  }
                  aria-label="Durum"
                >
                  <option value="">Tümü</option>
                  <option value="saglikli">Sağlıklı</option>
                  <option value="kritik">Kritik</option>
                  <option value="tukeniyor">Tükeniyor</option>
                  <option value="blokeli">Blokeli</option>
                </select>
              </label>
              <button
                type="button"
                className="som-filter-reset"
                title="Filtreleri sıfırla"
                aria-label="Filtreleri sıfırla"
                onClick={() => {
                  desk.resetAllFilters();
                  pushToast("Filtreler sıfırlandı.");
                }}
              >
                <IconRefresh className="som-filter-reset-icon" />
                Sıfırla
              </button>
            </div>

            {desk.showDemoBanner ? (
              <div className="som-demo-banner" role="note">
                <span>Önizleme modu: örnek stok kayıtları gösteriliyor.</span>
                <button type="button" className="som-demo-close" aria-label="Bildirimi kapat" onClick={desk.dismissDemoBanner}>
                  <IconClose />
                </button>
              </div>
            ) : null}

            <div className="som-table-panel">
              {desk.loading ? (
                <div className="som-state">Stok verisi yükleniyor…</div>
              ) : (
                <>
                  <div className="som-table-wrap">
                    <table className="som-table">
                      <thead>
                        <tr>
                          <th>Ürün</th>
                          <th>Merkez Stok</th>
                          <th>Fabrika Stok</th>
                          <th>Depo Raf</th>
                          <th>Fiyat</th>
                          <th>Durum</th>
                          <th>Aksiyon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {desk.tableRows.map((row) => (
                          <StockTableRow
                            key={row.id}
                            row={row}
                            selected={desk.selectedProductId === row.id}
                            onSelect={() => desk.setSelectedProductId(row.id)}
                            onDetail={() => openDetail(row.id)}
                            onStock={() => openStockMovement(row.id)}
                            onLabel={() => openLabel(row.id)}
                          />
                        ))}
                        {desk.tableRows.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <div className="som-state som-state--empty">
                                {desk.emptyFiltered ? "Filtrelere uygun ürün bulunamadı." : "Kayıt bulunamadı."}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  <footer className="som-table-foot">
                    <span>{desk.tableTotalLabel}</span>
                    <div className="som-pagination">
                      <span className="som-page-label">{desk.paginationLabel}</span>
                      <div className="som-page-nums" aria-label="Sayfalama">
                        <button
                          type="button"
                          className="som-page-btn"
                          aria-label="Önceki"
                          disabled={desk.page <= 1}
                          onClick={() => desk.setPage((current) => Math.max(1, current - 1))}
                        >
                          ‹
                        </button>
                        <button type="button" className="som-page-btn som-page-btn--active">
                          {desk.page}
                        </button>
                        <button
                          type="button"
                          className="som-page-btn"
                          aria-label="Sonraki"
                          disabled={desk.page >= desk.totalPages}
                          onClick={() => desk.setPage((current) => Math.min(desk.totalPages, current + 1))}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </footer>
                </>
              )}
            </div>
          </section>

          <aside className="som-context" aria-label="Stok bağlamı">
            {!desk.contextPanel ? (
              <div className="som-context-empty">Tablodan bir ürün seçildiğinde stok, depo ve fiyat özeti görünür.</div>
            ) : (
              <>
                <header className="som-context-head">
                  <h2>
                    <IconPin className="som-context-pin" />
                    Stok Bağlamı
                  </h2>
                </header>

                <div className="som-context-hero">
                  <ProductThumbIcon />
                  <div>
                    <span className="som-context-code">{desk.contextPanel.code}</span>
                    <h3>{desk.contextPanel.name}</h3>
                    <span className={statusBadgeClass(desk.contextPanel.status)}>{desk.contextPanel.status}</span>
                  </div>
                </div>

                <dl className="som-context-dl">
                  <div>
                    <dt>Barkod</dt>
                    <dd>{desk.contextPanel.barcode}</dd>
                  </div>
                  <div>
                    <dt>Marka</dt>
                    <dd>{desk.contextPanel.brand}</dd>
                  </div>
                  <div>
                    <dt>Kategori</dt>
                    <dd>{desk.contextPanel.category}</dd>
                  </div>
                  <div>
                    <dt>Fiyat</dt>
                    <dd>{desk.contextPanel.price}</dd>
                  </div>
                  <div>
                    <dt>Fiyat Grubu</dt>
                    <dd>{desk.contextPanel.priceGroup}</dd>
                  </div>
                  <div>
                    <dt>Birim</dt>
                    <dd>{desk.contextPanel.unit}</dd>
                  </div>
                </dl>

                {desk.contextPanel.status === "Kritik" ? (
                  <article className="som-notice som-notice--warn">
                    <IconAlert className="som-notice-icon" />
                    <div>
                      <strong>{desk.contextPanel.factoryAlertTitle}</strong>
                      <p>{desk.contextPanel.factoryAlertDetail}</p>
                    </div>
                  </article>
                ) : null}

                <article className="som-notice som-notice--info">
                  <IconInfoSmall className="som-notice-icon" />
                  <div>
                    <strong>{desk.contextPanel.depotAlertTitle}</strong>
                    <p>{desk.contextPanel.depotAlertDetail}</p>
                  </div>
                </article>

                <article className="som-context-card">
                  <h4>Stok Özeti</h4>
                  <dl className="som-context-dl som-context-dl--compact">
                    {desk.contextPanel.summary.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>

                <article className="som-context-card">
                  <h4>Depo Raf Bilgileri</h4>
                  <dl className="som-context-dl som-context-dl--compact">
                    {desk.contextPanel.depotInfo.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="som-capacity">
                    <div className="som-capacity-bar" aria-label={`Kapasite %${desk.contextPanel.capacityPct}`}>
                      <span style={{ width: `${desk.contextPanel.capacityPct}%` }} />
                    </div>
                    <p className="som-capacity-label">
                      {desk.contextPanel.capacityCurrent} / {desk.contextPanel.capacityMax} %{desk.contextPanel.capacityPct}
                    </p>
                  </div>
                </article>

                <footer className="som-context-actions">
                  <button
                    type="button"
                    className="som-btn som-btn--primary som-btn--block"
                    onClick={() => openStockMovement(desk.contextPanel!.productId)}
                  >
                    <IconPlus className="som-btn-icon" />
                    Stok Hareketi Oluştur
                  </button>
                  <button
                    type="button"
                    className="som-btn som-btn--outline som-btn--block"
                    onClick={() => handleTransfer(desk.contextPanel!.productId)}
                  >
                    Transfer Talebi Oluştur
                  </button>
                  <button
                    type="button"
                    className="som-btn som-btn--outline som-btn--block"
                    onClick={() => openLabel(desk.contextPanel!.productId)}
                  >
                    Etiket Yazdır
                  </button>
                </footer>
              </>
            )}
          </aside>
        </div>
      </div>

      <ProductDetailModal
        open={Boolean(desk.selectedProduct)}
        product={desk.selectedProduct}
        brands={desk.brands}
        factories={desk.factories}
        warehouses={desk.warehouses}
        priceSlots={desk.priceSlots}
        categorySlots={desk.categorySlots}
        onClose={desk.closeDetailModal}
      />
    </>
  );
}
