import type {
  ImportApplyResult,
  ImportFilePayload,
  ImportHistoryRecord,
  ImportPreviewResult,
  ImportTemplateDefinition,
  ImportType
} from "@hallederiz/types";
import type { ApiClient } from "../base";

export class ImportsClient {
  constructor(private readonly apiClient: ApiClient) {}

  listTemplates(): Promise<{ items: ImportTemplateDefinition[] }> {
    return this.apiClient.get("/imports/templates");
  }

  getTemplate(type: ImportType): Promise<{ item: ImportTemplateDefinition; csv: string }> {
    return this.apiClient.get(`/imports/templates/${type}`);
  }

  preview(type: ImportType, file: ImportFilePayload): Promise<{ item: ImportPreviewResult }> {
    return this.apiClient.post(`/imports/${type}/preview`, { file });
  }

  apply(type: ImportType, file: ImportFilePayload): Promise<{ item: ImportApplyResult }> {
    return this.apiClient.post(`/imports/${type}/apply`, { file });
  }

  listHistory(type?: ImportType): Promise<{ items: ImportHistoryRecord[]; total: number }> {
    const query = type ? `?type=${type}` : "";
    return this.apiClient.get(`/imports/history${query}`);
  }

  getHistoryById(id: string): Promise<{ item: ImportHistoryRecord }> {
    return this.apiClient.get(`/imports/history/${id}`);
  }
}
