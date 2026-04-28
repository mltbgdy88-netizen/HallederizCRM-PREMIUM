import type {
  CategorySlotConfig,
  ExchangeRatePolicy,
  PriceSlotConfig,
  Product
} from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { ProductStockPricingRepository } from "./repository";

export class ProductStockPricingService {
  private readonly repository: ProductStockPricingRepository;
  constructor(context: RequestContext) {
    this.repository = new ProductStockPricingRepository(context);
  }

  listProducts(filters: Parameters<ProductStockPricingRepository["listProducts"]>[0]) {
    return this.repository.listProducts(filters);
  }
  getProductById(id: string) {
    return this.repository.getProductById(id);
  }
  createProduct(payload: Partial<Product>) {
    return this.repository.createProduct(payload);
  }
  patchProduct(id: string, payload: Partial<Product>) {
    return this.repository.patchProduct(id, payload);
  }
  getProductAvailability(id: string) {
    return this.repository.getProductAvailability(id);
  }
  getPriceSlots() {
    return this.repository.getPriceSlots();
  }
  patchPriceSlots(slots: PriceSlotConfig[]) {
    return this.repository.patchPriceSlots(slots);
  }
  getCategorySlots() {
    return this.repository.getCategorySlots();
  }
  patchCategorySlots(slots: CategorySlotConfig[]) {
    return this.repository.patchCategorySlots(slots);
  }
  getCurrentExchangeRates() {
    return this.repository.getCurrentExchangeRates();
  }
  patchExchangeRatePolicy(payload: Partial<ExchangeRatePolicy>) {
    return this.repository.patchExchangeRatePolicy(payload);
  }
  getStockLookupOptions() {
    return this.repository.getStockLookupOptions();
  }
}
