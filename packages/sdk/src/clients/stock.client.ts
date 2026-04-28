import type {
  CategorySlotConfig,
  ExchangeRate,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product
} from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export class StockClient {
  constructor(private readonly api: ApiClient) {}

  list(query = "") {
    return this.api.get<ListResponse<Product> & { options?: unknown }>(`/products${query}`);
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Product>>(`/products/${id}`);
  }

  availability(id: string) {
    return this.api.get<unknown>(`/products/${id}/availability`);
  }

  priceSlots() {
    return this.api.get<{ items: PriceSlotConfig[] }>("/price-slots");
  }

  categorySlots() {
    return this.api.get<{ items: CategorySlotConfig[] }>("/category-slots");
  }

  exchangeRates() {
    return this.api.get<{ rates: ExchangeRate[]; policy: ExchangeRatePolicy }>("/exchange-rates/current");
  }
}
