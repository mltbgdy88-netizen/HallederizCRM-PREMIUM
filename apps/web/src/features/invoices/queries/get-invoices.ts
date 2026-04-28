import type { Customer, Invoice } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getInvoiceById, getInvoiceMockData } from "./invoice-mock-data";

export async function getInvoices(): Promise<{ invoices: Invoice[]; customers: Customer[] }> {
  return {
    invoices: await getInvoiceMockData(),
    customers
  };
}

export async function getInvoiceDetail(invoiceId?: string): Promise<{ invoice: Invoice | null; invoices: Invoice[]; customers: Customer[] }> {
  return {
    invoice: await getInvoiceById(invoiceId),
    invoices: await getInvoiceMockData(),
    customers
  };
}
