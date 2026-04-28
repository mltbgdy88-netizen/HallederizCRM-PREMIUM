export interface StockFilters {
  searchText: string;
  brandId: string;
  factoryId: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  criticalOnly: boolean;
  inStockOnly: boolean;
}

export const defaultStockFilters: StockFilters = {
  searchText: "",
  brandId: "",
  factoryId: "",
  category1: "",
  category2: "",
  category3: "",
  category4: "",
  criticalOnly: false,
  inStockOnly: false
};
