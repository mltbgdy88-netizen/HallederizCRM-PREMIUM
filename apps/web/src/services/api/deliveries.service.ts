import type { Delivery } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createDeliveryRecord(payload: Partial<Delivery>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Delivery), id: payload.id ?? `delivery_${Date.now()}` } as Delivery;
  }
  const response = await api.post<{ item: Delivery }>("/deliveries", payload);
  return response.item;
}

export async function validateDeliveryRecord(deliveryId: string) {
  const response = await api.post<{ item: Delivery["validation"] }>(`/deliveries/${deliveryId}/validate`, {});
  return response.item;
}

export async function completeDeliveryRecord(deliveryId: string) {
  const response = await api.post<{ item: Delivery }>(`/deliveries/${deliveryId}/complete`, {});
  return response.item;
}

export async function rollbackDeliveryRecord(deliveryId: string) {
  const response = await api.post<{ item: Delivery }>(`/deliveries/${deliveryId}/rollback`, {});
  return response.item;
}

export async function notifyDeliveryCustomerRecord(deliveryId: string) {
  const response = await api.post<{ item: Delivery }>(`/deliveries/${deliveryId}/notify-customer`, {});
  return response.item;
}
