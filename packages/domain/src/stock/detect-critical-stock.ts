import type { CriticalStockStatus, Product } from "@hallederiz/types";
import type { ProductAvailabilitySummary } from "./resolve-product-availability";

export function detectCriticalStock(product: Product, availability: ProductAvailabilitySummary): CriticalStockStatus {
  if (availability.centerStockTotal <= product.criticalStockLevel) {
    return "critical";
  }

  return "ok";
}
