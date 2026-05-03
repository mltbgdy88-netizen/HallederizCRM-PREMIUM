"use client";

import type { Brand, CategorySlotConfig, Factory, PriceSlotConfig, Product, Warehouse } from "@hallederiz/types";
import { IconFilter } from "../../dashboard/components/dashboard-inline-icons";
import type { StockDisplayStatus } from "../mappers/map-stock-row";
import type { StockFilters } from "../schemas/stock-filter-schema";

export interface StockFilterBarProps {
  filters: StockFilters;
  brands: Brand[];
  factories: Factory[];
  warehouses: Warehouse[];
  products: Product[];
  categorySlots: CategorySlotConfig[];
  priceSlots: PriceSlotConfig[];
  onFilterChange: <Key extends keyof StockFilters>(key: Key, value: StockFilters[Key]) => void;
  onReset: () => void;
}

function getCategoryValues(products: Product[], slotNumber: 1 | 2 | 3 | 4): string[] {
  const values = new Set<string>();
  for (const product of products) {
    const value = product.categoryValues.find((item) => item.slotNumber === slotNumber)?.value;
    if (value) {
      values.add(value);
    }
  }
  return Array.from(values.values()).sort((a, b) => a.localeCompare(b, "tr"));
}

function getCategorySlotName(categorySlots: CategorySlotConfig[], slotNumber: 1 | 2 | 3 | 4): string {
  return categorySlots.find((slot) => slot.slotNumber === slotNumber)?.slotName ?? `Kategori ${slotNumber}`;
}

const STATUS_OPTIONS: { value: "" | StockDisplayStatus; label: string }[] = [
  { value: "", label: "Tüm durumlar" },
  { value: "saglikli", label: "Sağlıklı" },
  { value: "kritik", label: "Kritik" },
  { value: "tukeniyor", label: "Tükeniyor" },
  { value: "blokeli", label: "Blokeli" }
];

export function StockFilterBar({
  filters,
  brands,
  factories,
  warehouses,
  products,
  categorySlots,
  priceSlots,
  onFilterChange,
  onReset
}: StockFilterBarProps) {
  const categoryValues1 = getCategoryValues(products, 1);
  const slot1Name = getCategorySlotName(categorySlots, 1);

  return (
    <div className="hz-stock-filter-bar" role="search">
      <div className="hz-stock-filter-row hz-stock-filter-row--primary">
        <div className="hz-stock-filter-field hz-stock-filter-field--grow">
          <span className="hz-stock-filter-label">Ürün kodu / ad / barkod</span>
          <input
            className="hz-stock-filter-input"
            value={filters.searchText}
            onChange={(e) => onFilterChange("searchText", e.target.value)}
            placeholder="Kod, isim veya barkod ara"
            aria-label="Ürün kodu ad barkod arama"
          />
        </div>
        <div className="hz-stock-filter-field">
          <span className="hz-stock-filter-label">Marka</span>
          <select
            className="hz-stock-filter-select"
            value={filters.brandId}
            onChange={(e) => onFilterChange("brandId", e.target.value)}
            aria-label="Marka"
          >
            <option value="">Tüm markalar</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hz-stock-filter-field">
          <span className="hz-stock-filter-label">Fabrika</span>
          <select
            className="hz-stock-filter-select"
            value={filters.factoryId}
            onChange={(e) => onFilterChange("factoryId", e.target.value)}
            aria-label="Fabrika"
          >
            <option value="">Tüm fabrikalar</option>
            {factories.map((factory) => (
              <option key={factory.id} value={factory.id}>
                {factory.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hz-stock-filter-field">
          <span className="hz-stock-filter-label">Depo</span>
          <select
            className="hz-stock-filter-select"
            value={filters.warehouseId}
            onChange={(e) => onFilterChange("warehouseId", e.target.value)}
            aria-label="Depo"
          >
            <option value="">Tüm depolar</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="hz-stock-filter-row hz-stock-filter-row--secondary">
        <div className="hz-stock-filter-field hz-stock-filter-field--grow">
          <span className="hz-stock-filter-label">{slot1Name}</span>
          <select
            className="hz-stock-filter-select"
            value={filters.category1}
            onChange={(e) => onFilterChange("category1", e.target.value)}
            aria-label={slot1Name}
          >
            <option value="">Tümü</option>
            {categoryValues1.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="hz-stock-filter-field">
          <span className="hz-stock-filter-label">Kritik durum</span>
          <select
            className="hz-stock-filter-select"
            value={filters.stockStatusFilter}
            onChange={(e) => onFilterChange("stockStatusFilter", e.target.value as StockFilters["stockStatusFilter"])}
            aria-label="Stok durumu"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="hz-stock-filter-field">
          <span className="hz-stock-filter-label">Fiyat grubu</span>
          <select
            className="hz-stock-filter-select"
            value={filters.priceSlotNo}
            onChange={(e) => onFilterChange("priceSlotNo", e.target.value)}
            aria-label="Fiyat slotu"
          >
            <option value="">Tüm slotlar</option>
            {priceSlots
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.slotNumber} value={String(s.slotNumber)}>
                  {s.slotName}
                </option>
              ))}
          </select>
        </div>
        <div className="hz-stock-filter-field hz-stock-filter-field--actions">
          <span className="hz-stock-filter-label hz-stock-filter-label--phantom" aria-hidden>
            .
          </span>
          <button type="button" className="hz-stock-filter-reset" onClick={onReset}>
            <IconFilter size={14} aria-hidden />
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
