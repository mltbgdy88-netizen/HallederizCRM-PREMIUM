import type { SaleOrder } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createOrderRecord(payload: Partial<SaleOrder>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as SaleOrder), id: payload.id ?? `order_${Date.now()}` } as SaleOrder;
  }
  const response = await api.post<{ item: SaleOrder }>("/orders", payload);
  return response.item;
}

export async function updateOrderRecord(orderId: string, payload: Partial<SaleOrder>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as SaleOrder), id: orderId } as SaleOrder;
  }
  const response = await api.patch<{ item: SaleOrder }>(`/orders/${orderId}`, payload);
  return response.item;
}
