import type { Delivery } from "@hallederiz/types";
import { apiClient, dataSourceConfig } from "../../lib/data-source";

export async function createDeliveryRecord(payload: Partial<Delivery>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Delivery), id: payload.id ?? `delivery_${Date.now()}` } as Delivery;
  }
  const response = await apiClient.post<{ item: Delivery }>("/deliveries", payload);
  return response.item;
}

export async function validateDeliveryRecord(deliveryId: string) {
  const response = await apiClient.post<{ item: Delivery["validation"] }>(`/deliveries/${deliveryId}/validate`, {});
  return response.item;
}

export async function completeDeliveryRecord(deliveryId: string) {
  const response = await apiClient.post<{ item: Delivery }>(`/deliveries/${deliveryId}/complete`, {});
  return response.item;
}

export async function rollbackDeliveryRecord(deliveryId: string) {
  const response = await apiClient.post<{ item: Delivery }>(`/deliveries/${deliveryId}/rollback`, {});
  return response.item;
}

export async function notifyDeliveryCustomerRecord(deliveryId: string) {
  const response = await apiClient.post<{ item: Delivery }>(`/deliveries/${deliveryId}/notify-customer`, {});
  return response.item;
}
