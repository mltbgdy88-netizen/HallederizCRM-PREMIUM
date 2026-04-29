import type { Document, DocumentType } from "@hallederiz/types";
import {
  regenerateDocumentRecord,
  renderDocumentRecord,
  sendDocumentEmailRecord,
  sendDocumentWhatsAppRecord
} from "../../../services/api/documents.service";

export async function renderDocumentMutation(payload: {
  type: DocumentType;
  entityType: Document["entityType"];
  entityId: string;
  entityNo: string;
  customerId?: string;
}) {
  return renderDocumentRecord(payload);
}

export async function regenerateDocumentMutation(documentId: string) {
  return regenerateDocumentRecord(documentId);
}

export async function sendDocumentWhatsAppMutation(documentId: string) {
  return sendDocumentWhatsAppRecord(documentId);
}

export async function sendDocumentEmailMutation(documentId: string) {
  return sendDocumentEmailRecord(documentId);
}
