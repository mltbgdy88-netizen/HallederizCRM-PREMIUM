import type {
  ImportApplyResult,
  ImportFilePayload,
  ImportHistoryRecord,
  ImportPreviewResult,
  ImportTemplateDefinition,
  ImportType
} from "@hallederiz/types";
import { sdk } from "../../lib/data-source";

export async function listImportTemplatesApi(): Promise<ImportTemplateDefinition[]> {
  const response = await sdk.imports.listTemplates();
  return response.items;
}

export async function getImportTemplateApi(type: ImportType): Promise<{ item: ImportTemplateDefinition; csv: string }> {
  return sdk.imports.getTemplate(type);
}

export async function previewImportApi(type: ImportType, file: ImportFilePayload): Promise<ImportPreviewResult> {
  const response = await sdk.imports.preview(type, file);
  return response.item;
}

export async function applyImportApi(type: ImportType, file: ImportFilePayload): Promise<ImportApplyResult> {
  const response = await sdk.imports.apply(type, file);
  return response.item;
}

export async function listImportHistoryApi(type?: ImportType): Promise<ImportHistoryRecord[]> {
  const response = await sdk.imports.listHistory(type);
  return response.items;
}

export async function retryImportHistoryApi(id: string): Promise<ImportHistoryRecord> {
  const response = await sdk.imports.retryHistory(id);
  return response.item;
}

export async function getImportErrorReportApi(id: string): Promise<string[]> {
  const response = await sdk.imports.getErrorReport(id);
  return response.item.errorReport;
}
