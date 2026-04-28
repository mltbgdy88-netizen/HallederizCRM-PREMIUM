import type { CategorySlotConfig, PriceSlotConfig, Product } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createProductRecord(payload: Partial<Product>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Product), id: payload.id ?? `product_${Date.now()}` } as Product;
  }
  const response = await api.post<{ item: Product }>("/products", payload);
  return response.item;
}

export async function updateProductRecord(productId: string, payload: Partial<Product>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Product), id: productId } as Product;
  }
  const response = await api.patch<{ item: Product }>(`/products/${productId}`, payload);
  return response.item;
}

export async function updatePriceSlotConfigs(slots: PriceSlotConfig[]) {
  if (dataSourceConfig.useDemoData) return slots;
  const response = await api.patch<{ items: PriceSlotConfig[] }>("/price-slots", { slots });
  return response.items;
}

export async function updateCategorySlotConfigs(slots: CategorySlotConfig[]) {
  if (dataSourceConfig.useDemoData) return slots;
  const response = await api.patch<{ items: CategorySlotConfig[] }>("/category-slots", { slots });
  return response.items;
}
