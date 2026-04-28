import type { Product, Warehouse } from "@hallederiz/types";

export interface ProductAvailabilitySummary {
  centerStockTotal: number;
  factoryStockTotal: number;
  warehouseStockTotal: number;
  reservedTotal: number;
  availableTotal: number;
}

export function resolveProductAvailability(params: {
  product: Product;
  warehouses: Warehouse[];
}): ProductAvailabilitySummary {
  const { product, warehouses } = params;

  const centerWarehouseIds = new Set(warehouses.filter((warehouse) => warehouse.isCentral).map((warehouse) => warehouse.id));

  let centerStockTotal = 0;
  let warehouseStockTotal = 0;
  let reservedTotal = 0;

  for (const stock of product.warehouseStocks) {
    warehouseStockTotal += stock.onHand;
    reservedTotal += stock.reserved;

    if (centerWarehouseIds.has(stock.warehouseId)) {
      centerStockTotal += stock.onHand;
    }
  }

  const availableTotal = Math.max(warehouseStockTotal - reservedTotal, 0);

  return {
    centerStockTotal,
    factoryStockTotal: product.factoryStockSummary.totalStock,
    warehouseStockTotal,
    reservedTotal,
    availableTotal
  };
}
