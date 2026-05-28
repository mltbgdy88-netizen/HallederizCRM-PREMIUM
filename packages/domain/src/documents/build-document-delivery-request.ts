import type { Document, DocumentDelivery } from "@hallederiz/types";

export function buildDocumentDeliveryRequest(
  document: Document,
  channel: DocumentDelivery["channel"],
  recipient?: string
): DocumentDelivery {
  return {
    id: `document_delivery_${document.id}_${channel}`,
    tenantId: document.tenantId,
    documentId: document.id,
    channel,
    status: "queued",
    recipient,
    requestedAt: new Date().toISOString()
  };
}
