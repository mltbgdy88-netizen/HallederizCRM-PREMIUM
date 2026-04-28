import type { Document, DocumentEntityType, DocumentType } from "@hallederiz/types";
import type { ItemResponse, ListResponse } from "../base";
import { ApiClient } from "../base";

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

  queueSave(id: string) {
    return this.api.post<ItemResponse<unknown>>(`/documents/${id}/queue-save`);
  }

  queuePrint(id: string) {
    return this.api.post<ItemResponse<unknown>>(`/documents/${id}/queue-print`);
  }
}
