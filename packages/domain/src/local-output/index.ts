import type { DocumentId, FileSaveJob, LocalOutputRule, LocalOutputType, PrintJob, TenantId } from "@hallederiz/types";

export function buildLocalOutputRule(input: { tenantId: TenantId; documentType: LocalOutputType; subfolder?: string; printerName?: string; autoSave?: boolean; autoPrint?: boolean }): LocalOutputRule {
  return { id: `local_rule_${input.documentType}`, tenantId: input.tenantId, documentType: input.documentType, destination: input.autoPrint ? "both" : "local_folder", subfolder: input.subfolder ?? input.documentType, autoSave: input.autoSave ?? true, autoPrint: input.autoPrint ?? false, printerName: input.printerName, copies: 1, safeMode: true, active: true };
}

export function resolveLocalOutputTarget(rule: LocalOutputRule, rootFolder: string): string {
  return `${rootFolder.replace(/[\\/]$/, "")}\\${rule.subfolder}`;
}

export function buildDocumentSaveJob(input: { tenantId: TenantId; documentId: DocumentId; documentType: LocalOutputType; rootFolder: string; fileName?: string; rule: LocalOutputRule }): FileSaveJob {
  return { id: `file_save_${input.documentId}`, tenantId: input.tenantId, documentId: input.documentId, documentType: input.documentType, status: "queued", targetFolder: resolveLocalOutputTarget(input.rule, input.rootFolder), fileName: input.fileName ?? `${input.documentId}.pdf`, queuedAt: new Date().toISOString() };
}

export function buildPrintJob(input: { tenantId: TenantId; documentId: DocumentId; documentType: LocalOutputType; rule: LocalOutputRule }): PrintJob {
  return { id: `print_${input.documentId}`, tenantId: input.tenantId, documentId: input.documentId, documentType: input.documentType, status: "queued", printerName: input.rule.printerName ?? "Varsayilan Yazici", copies: input.rule.copies, queuedAt: new Date().toISOString() };
}

export function summarizePrintFilePolicy(rules: LocalOutputRule[]): string {
  const autoSave = rules.filter((rule) => rule.autoSave).length;
  const autoPrint = rules.filter((rule) => rule.autoPrint).length;
  return `${autoSave} belge tipi otomatik kaydediliyor, ${autoPrint} belge tipi otomatik yazdiriliyor.`;
}
