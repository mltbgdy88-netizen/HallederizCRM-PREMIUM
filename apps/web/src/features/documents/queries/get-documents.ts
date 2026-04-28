import type { Customer, Document } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getDocumentById, getDocumentMockData } from "./document-mock-data";

export async function getDocuments(): Promise<{ documents: Document[]; customers: Customer[] }> {
  return {
    documents: await getDocumentMockData(),
    customers
  };
}

export async function getDocumentDetail(documentId?: string): Promise<{ document: Document | null; documents: Document[]; customers: Customer[] }> {
  return {
    document: await getDocumentById(documentId),
    documents: await getDocumentMockData(),
    customers
  };
}
