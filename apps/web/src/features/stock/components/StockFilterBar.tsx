// @ts-nocheck
"use client";

import type { Brand, CategorySlotConfig, Factory, PriceSlotConfig, Product, Warehouse } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
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

const STATUS_OPTIONS: { value: "" | StockDisplayStatus; label: string }[] = [
  { value: "", label: "Tümü" },
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
  onFilterChange,
  onReset
}: StockFilterBarProps) {
  const categoryValues1 = getCategoryValues(products, 1);
  const categoryLabel = categorySlots.find((slot) => slot.slotNumber === 1)?.slotName ?? "Kategori";

  return (
    <div className="hz-stock-filter-bar" role="search" aria-label="Stok filtreleri">
      <label className="hz-stock-filter-field hz-stock-filter-field--search">
        <span className="hz-stock-filter-search-shell">
          <LucideIcon name="search" size={14} />
          <input
            value={filters.searchText}
            onChange={(e) => onFilterChange("searchText", e.target.value)}
            placeholder="Ürün kodu, ad veya barkod ara"
            aria-label="Ürün kodu ad barkod arama"
          />
        </span>
      </label>

      <label className="hz-stock-filter-field">
        <span>Marka</span>
        <select value={filters.brandId} onChange={(e) => onFilterChange("brandId", e.target.value)} aria-label="Marka">
          <option value="">Tümü</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="hz-stock-filter-field">
        <span>Fabrika</span>
        <select value={filters.factoryId} onChange={(e) => onFilterChange("factoryId", e.target.value)} aria-label="Fabrika">
          <option value="">Tümü</option>
          {factories.map((factory) => (
            <option key={factory.id} value={factory.id}>
              {factory.name}
            </option>
          ))}
        </select>
      </label>

      <label className="hz-stock-filter-field">
        <span>Depo</span>
        <select value={filters.warehouseId} onChange={(e) => onFilterChange("warehouseId", e.target.value)} aria-label="Depo">
          <option value="">Tümü</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </label>

      <label className="hz-stock-filter-field">
        <span>{categoryLabel}</span>
        <select value={filters.category1} onChange={(e) => onFilterChange("category1", e.target.value)} aria-label={categoryLabel}>
          <option value="">Tümü</option>
          {categoryValues1.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="hz-stock-filter-field">
        <span>Durum</span>
        <select
          value={filters.stockStatusFilter}
          onChange={(e) => onFilterChange("stockStatusFilter", e.target.value as StockFilters["stockStatusFilter"])}
          aria-label="Durum"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="hz-stock-filter-reset" onClick={onReset} title="Filtreleri sıfırla" aria-label="Filtreleri sıfırla">
        <LucideIcon name="x" size={13} />
      </button>
    </div>
  );
}


