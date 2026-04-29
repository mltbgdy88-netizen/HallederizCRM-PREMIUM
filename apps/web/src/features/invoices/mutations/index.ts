import type { Invoice } from "@hallederiz/types";
import { cancelInvoiceRecord, createInvoiceRecord, issueInvoiceRecord } from "../../../services/api/invoices.service";

export async function createInvoiceMutation(payload: Partial<Invoice>) {
  return createInvoiceRecord(payload);
}

export async function issueInvoiceMutation(invoiceId: string) {
  return issueInvoiceRecord(invoiceId);
}

export async function cancelInvoiceMutation(invoiceId: string) {
  return cancelInvoiceRecord(invoiceId);
}
