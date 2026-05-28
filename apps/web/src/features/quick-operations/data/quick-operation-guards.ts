import { HZ_CUSTOMERS_DEMO_PREFIX } from "../../customers/data/customers-demo-rows";
import { isStockDemoRowId } from "../../stock/data/stock-demo-rows";

/** Cariler onizleme satir ID'si — gercek islem yapilmaz. */
export function isQuickOpPreviewCustomerId(customerId: string): boolean {
  return customerId.startsWith(HZ_CUSTOMERS_DEMO_PREFIX);
}

/** Stok onizleme satir ID'si. */
export function isQuickOpPreviewProductId(productId: string): boolean {
  return isStockDemoRowId(productId);
}

