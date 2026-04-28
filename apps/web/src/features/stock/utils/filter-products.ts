import { detectCriticalStock, normalizeBarcode, resolveProductAvailability } from "@hallederiz/domain";
import type { Product, Warehouse } from "@hallederiz/types";
import type { StockFilters } from "../schemas/stock-filter-schema";

function matchesSearch(product: Product, searchText: string): boolean {
  if (!searchText) {
    return true;
  }

  const lowered = searchText.toLowerCase().trim();
  if (product.code.toLowerCase().includes(lowered) || product.name.toLowerCase().includes(lowered)) {
    return true;
  }

  const normalizedInput = normalizeBarcode(searchText);
  const barcodePool = [product.primaryBarcode, product.qrCodeValue, ...product.barcodeAliases.map((item) => item.value)];

  return barcodePool.some((value) => normalizeBarcode(value).includes(normalizedInput));
}

function matchesCategory(product: Product, slotNumber: 1 | 2 | 3 | 4, value: string): boolean {
  if (!value) {
    return true;
  }

  return product.categoryValues.some((item) => item.slotNumber === slotNumber && item.value === value);
}

export function filterProducts(params: {
  products: Product[];
  filters: StockFilters;
  warehouses: Warehouse[];
}): Product[] {
  const { products, filters, warehouses } = params;

  return products.filter((product) => {
    if (!matchesSearch(product, filters.searchText)) {
      return false;
    }

    if (filters.brandId && product.brandId !== filters.brandId) {
      return false;
    }

    if (filters.factoryId && product.factoryId !== filters.factoryId) {
      return false;
    }

    if (!matchesCategory(product, 1, filters.category1)) {
      return false;
    }

    if (!matchesCategory(product, 2, filters.category2)) {
      return false;
    }

    if (!matchesCategory(product, 3, filters.category3)) {
      return false;
    }

    if (!matchesCategory(product, 4, filters.category4)) {
      return false;
    }

    const availability = resolveProductAvailability({ product, warehouses });
    const criticalStatus = detectCriticalStock(product, availability);

    if (filters.criticalOnly && criticalStatus !== "critical") {
      return false;
    }

    if (filters.inStockOnly && availability.centerStockTotal <= 0) {
      return false;
    }

    return true;
  });
}
