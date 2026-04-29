export type ImportType = "customers" | "products" | "pricing" | "warehouses" | "stock-locations";

export type ImportStatus = "previewed" | "applied" | "failed";

export interface ImportTemplateDefinition {
  type: ImportType;
  fileName: string;
  contentType: "text/csv";
  description: string;
  columns: string[];
  sampleRows: string[][];
}

export interface ImportFilePayload {
  fileName: string;
  contentBase64: string;
}

export interface ImportPreviewIssue {
  rowNumber: number;
  field: string;
  severity: "error" | "warning";
  message: string;
}

export interface ImportPreviewRecord {
  rowNumber: number;
  data: Record<string, string>;
}

export interface ImportPreviewResult {
  importType: ImportType;
  fileName: string;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  records: ImportPreviewRecord[];
  issues: ImportPreviewIssue[];
}

export interface ImportApplyResult {
  importId: string;
  importType: ImportType;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  status: ImportStatus;
  errors: string[];
}

export interface ImportHistoryRecord {
  id: string;
  tenantId: string;
  type: ImportType;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  previewRecordCount: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  status: ImportStatus;
  summary: string;
}
