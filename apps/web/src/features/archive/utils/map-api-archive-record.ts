import type { ArchiveRecord as ApiArchiveRecord } from "@hallederiz/types";
import type { ArchiveCategoryFilter, ArchiveRecord, ArchiveRecordStatus, ArchiveSourceKind } from "../types";

function mapSource(sourceType: ApiArchiveRecord["sourceType"]): ArchiveSourceKind {
  switch (sourceType) {
    case "offer":
    case "order":
    case "payment":
      return "crm";
    default:
      return "crm";
  }
}

function mapCategory(sourceType: ApiArchiveRecord["sourceType"]): Exclude<ArchiveCategoryFilter, "all"> {
  switch (sourceType) {
    case "offer":
      return "siparis";
    case "order":
      return "siparis";
    case "payment":
      return "tahsilat";
    default:
      return "belge";
  }
}

function mapStatus(status: ApiArchiveRecord["status"]): ArchiveRecordStatus {
  switch (status) {
    case "ready":
    case "archived":
      return "arsivlendi";
    case "failed":
      return "riskli";
    case "pending":
    default:
      return "bekliyor";
  }
}

function mapRecordType(sourceType: ApiArchiveRecord["sourceType"]): ArchiveRecord["recordType"] {
  switch (sourceType) {
    case "offer":
      return "Sipariş";
    case "order":
      return "Sipariş";
    case "payment":
      return "Tahsilat";
    default:
      return "Belge";
  }
}

export function mapApiArchiveRecordToUi(record: ApiArchiveRecord): ArchiveRecord {
  const entityNo = typeof record.metadata?.entityNo === "string" ? record.metadata.entityNo : record.sourceId;
  const links: ArchiveRecord["relatedLinks"] = [];
  if (record.documentId) {
    links.push({ label: "Belge", href: `/belgeler/${record.documentId}` });
  }
  links.push({ label: "Arşiv", href: `/archive?sourceId=${encodeURIComponent(record.sourceId)}` });

  return {
    id: record.id,
    documentNumber: entityNo,
    title: record.title,
    customerName: record.customerName ?? "—",
    contextRef: entityNo,
    recordType: mapRecordType(record.sourceType),
    categoryKey: mapCategory(record.sourceType),
    source: mapSource(record.sourceType),
    status: mapStatus(record.status),
    responsible: "Operasyon",
    createdAt: record.createdAt,
    fileName: record.fileName,
    fileTypeLabel: record.mimeType ?? "PDF",
    fileSizeLabel: record.fileSize ? `${Math.round(record.fileSize / 1024)} KB` : undefined,
    retentionYears: 5,
    auditCreatedBy: "Sistem",
    auditLastAction: record.status === "ready" ? "Dosya hazır" : "Dosya hazırlanıyor",
    auditApprovalInfo: record.archivedAt ? "Arşivlendi" : "Beklemede",
    relatedLinks: links
  };
}
