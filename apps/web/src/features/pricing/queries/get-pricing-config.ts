import { getStockCatalog } from "../../stock/queries/get-stock-catalog";

export async function getPricingConfig() {
  const catalog = await getStockCatalog();
  return {
    slots: catalog.priceSlots,
    exchangeRates: catalog.exchangeRates,
    exchangeRatePolicy: catalog.exchangeRatePolicy
  };
}
