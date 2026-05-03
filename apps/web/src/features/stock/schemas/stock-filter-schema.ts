import type { StockDisplayStatus } from "../mappers/map-stock-row";

export interface StockFilters {
  searchText: string;
  brandId: string;
  factoryId: string;
  warehouseId: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  /** Boş: tümü; doluysa ürün durumu (liste ile aynı dil). */
  stockStatusFilter: "" | StockDisplayStatus;
  priceSlotNo: string;
  criticalOnly: boolean;
  inStockOnly: boolean;
}

export const defaultStockFilters: StockFilters = {
  searchText: "",
  brandId: "",
  factoryId: "",
  warehouseId: "",
  category1: "",
  category2: "",
  category3: "",
  category4: "",
  stockStatusFilter: "",
  priceSlotNo: "",
  criticalOnly: false,
  inStockOnly: false
};
