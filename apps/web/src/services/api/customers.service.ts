import type { Customer, CustomerPricingProfile } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";
const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createCustomerRecord(payload: Partial<Customer>) {
  if (dataSourceConfig.useDemoData) {
    return {
      ...(payload as Customer),
      id: payload.id ?? `customer_${Date.now()}`,
      tenantId: payload.tenantId ?? dataSourceConfig.tenantId
    } as Customer;
  }
  const response = await api.post<{ item: Customer }>("/customers", payload);
  return response.item;
}

export async function updateCustomerRecord(customerId: string, payload: Partial<Customer>) {
  if (dataSourceConfig.useDemoData) {
    return {
      ...(payload as Customer),
      id: customerId,
      tenantId: payload.tenantId ?? dataSourceConfig.tenantId
    } as Customer;
  }
  const response = await api.patch<{ item: Customer }>(`/customers/${customerId}`, payload);
  return response.item;
}

export async function updateCustomerPricingProfile(customerId: string, payload: Partial<CustomerPricingProfile>) {
  if (dataSourceConfig.useDemoData) {
    return {
      ...(payload as CustomerPricingProfile),
      id: payload.id ?? `${customerId}_pricing`,
      customerId
    } as CustomerPricingProfile;
  }
  const response = await api.patch<{ item: CustomerPricingProfile }>(`/customers/${customerId}/pricing-profile`, payload);
  return response.item;
}
