import type { Document, DocumentAvailabilitySummary, DocumentEntityType, DocumentType } from "@hallederiz/types";

const expectedTypesByEntity: Record<DocumentEntityType, DocumentType[]> = {
  offer: ["offer_pdf"],
  order: ["order_pdf"],
  payment: ["payment_receipt_pdf"],
  warehouse_order: ["warehouse_note_pdf"],
  delivery: ["delivery_note_pdf", "dispatch_note_pdf"],
  dispatch: ["dispatch_note_pdf"],
  invoice: ["invoice_pdf"],
  statement: ["statement_pdf"],
  return: ["return_note_pdf"]
};

export function summarizeDocumentAvailability(entityType: DocumentEntityType, entityId: string, documents: Document[]): DocumentAvailabilitySummary {
  const related = documents.filter((document) => document.entityType === entityType && document.entityId === entityId);
  const expected = expectedTypesByEntity[entityType];
  const availableTypes = related.map((document) => document.type);

  return {
    entityType,
    entityId,
    availableTypes,
    missingTypes: expected.filter((type) => !availableTypes.includes(type)),
    latestDocument: related[0]
  };
}
