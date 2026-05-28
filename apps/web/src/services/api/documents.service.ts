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

export interface DocumentOutputJobRow {
  id: string;
  documentId: string;
  status: string;
  queuedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface LocalAgentHealthSnapshot {
  service: string;
  status: string;
  mode: string;
  configured: boolean;
  reason: string;
  lastCheckedAt: string;
}

export async function listDocumentOutputJobs(documentId: string): Promise<{ printJobs: DocumentOutputJobRow[]; fileSaveJobs: DocumentOutputJobRow[] }> {
  const [printResponse, fileResponse] = await Promise.all([
    api.get<{ items: DocumentOutputJobRow[] }>("/print-jobs"),
    api.get<{ items: DocumentOutputJobRow[] }>("/file-save-jobs")
  ]);

  return {
    printJobs: (printResponse.items ?? []).filter((job) => job.documentId === documentId),
    fileSaveJobs: (fileResponse.items ?? []).filter((job) => job.documentId === documentId)
  };
}

export async function getLocalAgentHealthSnapshot(): Promise<LocalAgentHealthSnapshot | null> {
  try {
    const response = await api.get<{ item: LocalAgentHealthSnapshot }>("/health/local-agent");
    return response.item ?? null;
  } catch {
    return null;
  }
}
