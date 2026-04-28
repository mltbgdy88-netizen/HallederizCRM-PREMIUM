import type { Invoice, InvoiceLine, SaleOrder } from "@hallederiz/types";
import { calculateInvoiceTotals } from "./calculate-invoice-totals";

export function buildInvoiceFromOrder(order: SaleOrder): Invoice {
  const invoiceId = `invoice_${order.id}`;
  const lines: InvoiceLine[] = order.lines.map((line) => {
    const taxTotal = Number(((line.tlLineTotal * order.taxRate) / 100).toFixed(2));

    return {
      id: `invoice_line_${line.id}`,
      invoiceId,
      orderLineId: line.id,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.tlUnitPrice,
      currency: "TRY",
      taxRate: order.taxRate,
      taxTotal,
      lineTotal: Number((line.tlLineTotal + taxTotal).toFixed(2))
    };
  });
  const totals = calculateInvoiceTotals(lines, "TRY");

  return {
    id: invoiceId,
    tenantId: order.tenantId,
    invoiceNo: `INV-${order.orderNo.replace(/\D/g, "") || order.id}`,
    customerId: order.customerId,
    orderId: order.id,
    orderNo: order.orderNo,
    status: "draft",
    deliveryStatus: "not_sent",
    paymentStatus: order.paymentStatus === "paid" || order.paymentStatus === "overpaid" ? "paid" : order.paymentStatus === "partial" ? "partial" : "unpaid",
    ...totals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lines
  };
}
