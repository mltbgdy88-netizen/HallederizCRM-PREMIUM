import type { SaleOrder } from "@hallederiz/types";
import { apiClient, dataSourceConfig } from "../../lib/data-source";

export async function createOrderRecord(payload: Partial<SaleOrder>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as SaleOrder), id: payload.id ?? `order_${Date.now()}` } as SaleOrder;
  }
  const response = await apiClient.post<{ item: SaleOrder }>("/orders", payload);
  return response.item;
}

export async function updateOrderRecord(orderId: string, payload: Partial<SaleOrder>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as SaleOrder), id: orderId } as SaleOrder;
  }
  const response = await apiClient.patch<{ item: SaleOrder }>(`/orders/${orderId}`, payload);
  return response.item;
}
