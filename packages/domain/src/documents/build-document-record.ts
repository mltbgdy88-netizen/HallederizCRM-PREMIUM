import type { Document, DocumentEntityType, DocumentType, TenantId, UserId } from "@hallederiz/types";

export function buildDocumentRecord({
  tenantId,
  type,
  entityType,
  entityId,
  entityNo,
  customerId,
  createdBy,
  title
}: {
  tenantId: TenantId;
  type: DocumentType;
  entityType: DocumentEntityType;
  entityId: string;
  entityNo: string;
  customerId?: string;
  createdBy: UserId;
  title?: string;
}): Document {
  return {
    id: `document_${entityType}_${entityId}_${type}`,
    tenantId,
    documentNo: `DOC-${Math.abs(`${entityType}-${entityId}-${type}`.split("").reduce((total, char) => total + char.charCodeAt(0), 0))}`,
    type,
    entityType,
    entityId,
    entityNo,
    customerId,
    title: title ?? `${entityNo} ${type}`,
    previewText: "PDF/print icerigi local agent ve document renderer ile uretilecek.",
    createdAt: new Date().toISOString(),
    createdBy,
    deliveries: []
  };
}
