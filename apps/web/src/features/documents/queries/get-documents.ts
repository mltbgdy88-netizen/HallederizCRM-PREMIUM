import type { Customer, Document } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { customers } from "../../customers/queries/customer-mock-data";
import { getDocumentById, getDocumentMockData } from "./document-mock-data";

export async function getDocuments(): Promise<{ documents: Document[]; customers: Customer[] }> {
  if (!dataSourceConfig.useDemoData) {
    const [documentsResponse, customersResponse] = await Promise.all([sdk.documents.list(), sdk.customers.list()]);
    return {
      documents: documentsResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    documents: await getDocumentMockData(),
    customers
  };
}

export async function getDocumentDetail(documentId?: string): Promise<{ document: Document | null; documents: Document[]; customers: Customer[] }> {
  if (!dataSourceConfig.useDemoData) {
    const [documentsResponse, customersResponse] = await Promise.all([sdk.documents.list(), sdk.customers.list()]);
    const document = documentId ? (await sdk.documents.detail(documentId)).item ?? null : null;

    return {
      document,
      documents: documentsResponse.items,
      customers: customersResponse.items
    };
  }

  return {
    document: await getDocumentById(documentId),
    documents: await getDocumentMockData(),
    customers
  };
}
