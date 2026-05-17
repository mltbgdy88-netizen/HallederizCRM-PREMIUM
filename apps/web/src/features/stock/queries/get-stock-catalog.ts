import { stockCatalog } from "../../../demo";
import { dataSourceConfig, sdk } from "../../../lib/data-source";

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

const emptyProductionReference = {
  brands: [] as typeof stockCatalog.brands,
  factories: [] as typeof stockCatalog.factories,
  warehouses: [] as typeof stockCatalog.warehouses,
  customerPricingProfiles: [] as typeof stockCatalog.customerPricingProfiles
};

export async function getStockCatalog(): Promise<StockCatalogQueryResult> {
  if (!dataSourceConfig.useDemoData) {
    const [productsResponse, priceSlotsResponse, categorySlotsResponse, exchangeRatesResponse] = await Promise.all([
      sdk.stock.list(),
      sdk.stock.priceSlots(),
      sdk.stock.categorySlots(),
      sdk.stock.exchangeRates()
    ]);

    return {
      products: productsResponse.items as typeof stockCatalog.products,
      priceSlots: priceSlotsResponse.items as typeof stockCatalog.priceSlots,
      categorySlots: categorySlotsResponse.items as typeof stockCatalog.categorySlots,
      exchangeRates: exchangeRatesResponse.rates as typeof stockCatalog.exchangeRates,
      exchangeRatePolicy: exchangeRatesResponse.policy as typeof stockCatalog.exchangeRatePolicy,
      ...emptyProductionReference
    };
  }

  return stockCatalog;
}
