export type ArchiveCategoryFilter =
  | "all"
  | "siparis"
  | "tahsilat"
  | "fatura"
  | "iade"
  | "whatsapp"
  | "stok"
  | "onay"
  | "belge";

export type ArchiveSourceKind = "crm" | "whatsapp" | "ai" | "kullanici" | "sistem" | "ice_aktar";

export type ArchiveRecordStatus = "onaylandi" | "bekliyor" | "reddedildi" | "riskli" | "arsivlendi";

export type ArchiveRecordType = "Sipariş" | "Tahsilat" | "Belge" | "WhatsApp" | "Stok" | "Fatura" | "İade" | "Onay";

export interface ArchiveRelatedLink {
  label: string;
  href: string;
}

export interface ArchiveRecord {
  id: string;
  documentNumber: string;
  title: string;
  customerName: string;
  contextRef: string;
  recordType: ArchiveRecordType;
  categoryKey: Exclude<ArchiveCategoryFilter, "all">;
  source: ArchiveSourceKind;
  status: ArchiveRecordStatus;
  responsible: string;
  createdAt: string;
  fileName?: string;
  fileTypeLabel?: string;
  fileSizeLabel?: string;
  retentionYears?: number;
  hashPreview?: string;
  auditCreatedBy: string;
  auditLastAction: string;
  auditApprovalInfo: string;
  auditIpDevice?: string;
  relatedLinks: ArchiveRelatedLink[];
}

