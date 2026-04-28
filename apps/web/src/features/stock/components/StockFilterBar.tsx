import type { Brand, CategorySlotConfig, Factory, Product } from "@hallederiz/types";
import type { StockFilters } from "../schemas/stock-filter-schema";

export interface StockFilterBarProps {
  filters: StockFilters;
  brands: Brand[];
  factories: Factory[];
  products: Product[];
  categorySlots: CategorySlotConfig[];
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

export function StockFilterBar({
  filters,
  brands,
  factories,
  products,
  categorySlots,
  onFilterChange,
  onReset
}: StockFilterBarProps) {
  const categoryValues = {
    1: getCategoryValues(products, 1),
    2: getCategoryValues(products, 2),
    3: getCategoryValues(products, 3),
    4: getCategoryValues(products, 4)
  };

  return (
    <section className="stock-filter-bar hz-filter-card">
      <div className="stock-filter-grid">
        <label>
          Urun Kodu / Ad / Barkod / QR
          <input
            value={filters.searchText}
            onChange={(event) => onFilterChange("searchText", event.target.value)}
            placeholder="Kod, isim, barkod veya QR ara"
          />
        </label>

        <label>
          Marka
          <select value={filters.brandId} onChange={(event) => onFilterChange("brandId", event.target.value)}>
            <option value="">Tum Markalar</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fabrika
          <select value={filters.factoryId} onChange={(event) => onFilterChange("factoryId", event.target.value)}>
            <option value="">Tum Fabrikalar</option>
            {factories.map((factory) => (
              <option key={factory.id} value={factory.id}>
                {factory.name}
              </option>
            ))}
          </select>
        </label>

        {[1, 2, 3, 4].map((slotNumber) => (
          <label key={slotNumber}>
            {getCategorySlotName(categorySlots, slotNumber as 1 | 2 | 3 | 4)}
            <select
              value={filters[`category${slotNumber}` as keyof StockFilters] as string}
              onChange={(event) =>
                onFilterChange(`category${slotNumber}` as keyof StockFilters, event.target.value as never)
              }
            >
              <option value="">Tum Degerler</option>
              {categoryValues[slotNumber as 1 | 2 | 3 | 4].map((value) => (
                <option key={`${slotNumber}_${value}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="stock-filter-actions">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.criticalOnly}
            onChange={(event) => onFilterChange("criticalOnly", event.target.checked)}
          />
          Kritik stok
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(event) => onFilterChange("inStockOnly", event.target.checked)}
          />
          Stokta olanlar
        </label>

        <button type="button" onClick={onReset} className="reset-btn">
          Filtreleri Temizle
        </button>
      </div>
    </section>
  );
}
