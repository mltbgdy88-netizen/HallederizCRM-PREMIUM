import { buildInvoiceFromOrder } from "@hallederiz/domain";
import type { Invoice, InvoiceStatus } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";

export async function getInvoiceMockData(): Promise<Invoice[]> {
  const orders = await getOrderMockData();

  return orders.slice(0, 3).map((order, index) => {
    const invoice = buildInvoiceFromOrder(order);

    if (index === 0) {
      return {
        ...invoice,
        id: "invoice_1",
        invoiceNo: "INV-1201",
        status: "issued",
        deliveryStatus: "sent",
        issueDate: "2026-04-28T12:00:00.000Z",
        documentId: "document_invoice_1"
      };
    }

    if (index === 1) {
      return { ...invoice, id: "invoice_2", invoiceNo: "INV-1194", status: "draft", deliveryStatus: "not_sent" };
    }

    return { ...invoice, id: "invoice_3", invoiceNo: "INV-1188", status: "cancelled", deliveryStatus: "failed" };
  });
}

export async function getInvoiceById(invoiceId?: string): Promise<Invoice | null> {
  const invoices = await getInvoiceMockData();
  return invoices.find((invoice) => invoice.id === invoiceId || invoice.invoiceNo === invoiceId) ?? invoices[0] ?? null;
}

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    draft: "Taslak",
    issued: "Kesildi",
    cancelled: "Iptal"
  };
  return labels[status];
}

export { customers };
