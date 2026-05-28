import type { Document, DocumentDownloadLink, DocumentEntityType, DocumentType, FileSaveJob } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

export type DocumentDownloadUrlResult = {
  status: number;
  item?: DocumentDownloadLink;
};

export interface RenderDocumentInput {
  type: DocumentType;
  entityType: DocumentEntityType;
  entityId: string;
  entityNo: string;
  customerId?: string;
}

export class DocumentsClient {
  constructor(private readonly api: ApiClient) {}

  list() {
    return this.api.get<ListResponse<Document>>("/documents");
  }

  detail(id: string) {
    return this.api.get<ItemResponse<Document>>(`/documents/${id}`);
  }

  listDeliveries(documentId: string) {
    return this.api.get<ListResponse<Record<string, unknown>>>(`/documents/${documentId}/deliveries`);
  }

  render(input: RenderDocumentInput) {
    return this.api.post<ItemResponse<Document>>("/documents/render", input);
  }

  regenerate(id: string) {
    return this.api.post<ItemResponse<Document>>(`/documents/${id}/regenerate`);
  }

  sendWhatsApp(id: string) {
    return this.api.post<ItemResponse<Document>>(`/documents/${id}/send-whatsapp`);
  }

  sendEmail(id: string) {
    return this.api.post<ItemResponse<Document>>(`/documents/${id}/send-email`);
  }

  getDownloadUrl(id: string) {
    return this.api
      .getWithStatus<ItemResponse<DocumentDownloadLink>>(`/documents/${id}/download-url`)
      .then((response) => ({
        status: response.status,
        item: response.data.item
      }) satisfies DocumentDownloadUrlResult);
  }

  queueSave(id: string) {
    return this.api.post<ItemResponse<FileSaveJob>>(`/documents/${id}/queue-save`);
  }

  queuePrint(id: string) {
    return this.api.post<ItemResponse<unknown>>(`/documents/${id}/queue-print`);
  }
}
