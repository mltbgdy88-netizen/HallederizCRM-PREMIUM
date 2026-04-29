import type { ImportHistoryRecord, ImportStatus, ImportType } from "@hallederiz/types";

const importHistory: ImportHistoryRecord[] = [];

export function addImportHistoryRecord(
  input: Omit<ImportHistoryRecord, "id" | "uploadedAt"> & { uploadedAt?: string }
): ImportHistoryRecord {
  const record: ImportHistoryRecord = {
    ...input,
    id: `import_${importHistory.length + 1}`,
    uploadedAt: input.uploadedAt ?? new Date().toISOString()
  };
  importHistory.unshift(record);
  return record;
}

export function listImportHistory(tenantId: string, type?: ImportType): ImportHistoryRecord[] {
  return importHistory.filter((record) => record.tenantId === tenantId && (!type || record.type === type));
}

export function getImportHistoryById(tenantId: string, id: string): ImportHistoryRecord | null {
  return importHistory.find((record) => record.tenantId === tenantId && record.id === id) ?? null;
}

export function buildImportSummary(status: ImportStatus, totalRows: number, successCount: number, errorCount: number): string {
  if (status === "failed") {
    return `Import basarisiz: ${errorCount}/${totalRows} hata`;
  }
  if (status === "applied") {
    return `Import tamamlandi: ${successCount}/${totalRows} satir`;
  }
  return `Onizleme hazir: ${successCount}/${totalRows} satir gecerli`;
}
