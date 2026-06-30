import type { CategorySlotConfig, PriceSlotConfig, Product } from "@hallederiz/types";
import { apiClient, dataSourceConfig } from "../../lib/data-source";

export async function createProductRecord(payload: Partial<Product>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Product), id: payload.id ?? `product_${Date.now()}` } as Product;
  }
  const response = await apiClient.post<{ item: Product }>("/products", payload);
  return response.item;
}

export async function updateProductRecord(productId: string, payload: Partial<Product>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Product), id: productId } as Product;
  }
  const response = await apiClient.patch<{ item: Product }>(`/products/${productId}`, payload);
  return response.item;
}

export async function updatePriceSlotConfigs(slots: PriceSlotConfig[]) {
  if (dataSourceConfig.useDemoData) return slots;
  const response = await apiClient.patch<{ items: PriceSlotConfig[] }>("/price-slots", { slots });
  return response.items;
}

export async function updateCategorySlotConfigs(slots: CategorySlotConfig[]) {
  if (dataSourceConfig.useDemoData) return slots;
  const response = await apiClient.patch<{ items: CategorySlotConfig[] }>("/category-slots", { slots });
  return response.items;
}
