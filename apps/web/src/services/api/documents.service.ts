import type { Document, DocumentType } from "@hallederiz/types";
import { ApiClient } from "@hallederiz/sdk";
import { dataSourceConfig } from "../../lib/data-source";

const api = new ApiClient({ baseUrl: dataSourceConfig.apiBaseUrl, tenantId: dataSourceConfig.tenantId, userId: dataSourceConfig.userId });

export interface RenderDocumentPayload {
  type: DocumentType;
  entityType: Document["entityType"];
  entityId: string;
  entityNo: string;
  customerId?: string;
}

export async function renderDocumentRecord(payload: RenderDocumentPayload) {
  const response = await api.post<{ item: Document }>("/documents/render", payload);
  return response.item;
}

export async function regenerateDocumentRecord(documentId: string) {
  const response = await api.post<{ item: Document }>(`/documents/${documentId}/regenerate`, {});
  return response.item;
}

export async function sendDocumentWhatsAppRecord(documentId: string) {
  const response = await api.post<{ item: Document }>(`/documents/${documentId}/send-whatsapp`, {});
  return response.item;
}

export async function sendDocumentEmailRecord(documentId: string) {
  const response = await api.post<{ item: Document }>(`/documents/${documentId}/send-email`, {});
  return response.item;
}
