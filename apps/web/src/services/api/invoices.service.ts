import type { Invoice } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export async function createInvoiceRecord(payload: Partial<Invoice>) {
  if (dataSourceConfig.useDemoData) {
    return { ...(payload as Invoice), id: payload.id ?? `invoice_${Date.now()}` } as Invoice;
  }
  const response = await api.post<{ item: Invoice }>("/invoices", payload);
  return response.item;
}

export async function issueInvoiceRecord(invoiceId: string) {
  const response = await api.post<{ item: Invoice }>(`/invoices/${invoiceId}/issue`, {});
  return response.item;
}

export async function cancelInvoiceRecord(invoiceId: string) {
  const response = await api.post<{ item: Invoice }>(`/invoices/${invoiceId}/cancel`, {});
  return response.item;
}
