import { stockCatalog } from "../../../demo";

export interface StockCatalogQueryResult {
  products: typeof stockCatalog.products;
  brands: typeof stockCatalog.brands;
  factories: typeof stockCatalog.factories;
  warehouses: typeof stockCatalog.warehouses;
  categorySlots: typeof stockCatalog.categorySlots;
  priceSlots: typeof stockCatalog.priceSlots;
  exchangeRates: typeof stockCatalog.exchangeRates;
  exchangeRatePolicy: typeof stockCatalog.exchangeRatePolicy;
  customerPricingProfiles: typeof stockCatalog.customerPricingProfiles;
}

export async function getStockCatalog(): Promise<StockCatalogQueryResult> {
  return stockCatalog;
}
