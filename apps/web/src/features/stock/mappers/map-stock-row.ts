import { detectCriticalStock, resolveProductAvailability } from "@hallederiz/domain";
import type { Brand, CriticalStockStatus, Product, Warehouse } from "@hallederiz/types";

export interface StockRow {
  productId: string;
  productCode: string;
  productName: string;
  brandName: string;
  centerWarehouseStockTotal: number;
  factoryStockTotal: number;
  criticalStockStatus: CriticalStockStatus;
}

export function mapProductToStockRow(params: {
  product: Product;
  brands: Brand[];
  warehouses: Warehouse[];
}): StockRow {
  const { product, brands, warehouses } = params;
  const availability = resolveProductAvailability({ product, warehouses });
  const criticalStockStatus = detectCriticalStock(product, availability);
  const brandName = brands.find((brand) => brand.id === product.brandId)?.name ?? "-";

  return {
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    brandName,
    centerWarehouseStockTotal: availability.centerStockTotal,
    factoryStockTotal: availability.factoryStockTotal,
    criticalStockStatus
  };
}
