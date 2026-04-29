import type { Return } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createReturnRecord(payload: Partial<Return>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Return), id: payload.id ?? `return_${Date.now()}` } as Return;
  }
  const response = await api.post<{ item: Return }>("/returns", payload);
  return response.item;
}

export async function approveReturnRecord(returnId: string) {
  const response = await api.post<{ item: Return }>(`/returns/${returnId}/approve`, {});
  return response.item;
}

export async function completeReturnRecord(returnId: string) {
  const response = await api.post<{ item: Return }>(`/returns/${returnId}/complete`, {});
  return response.item;
}
