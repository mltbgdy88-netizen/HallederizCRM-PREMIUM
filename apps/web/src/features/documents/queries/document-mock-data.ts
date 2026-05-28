import { buildDocumentDeliveryRequest, buildDocumentRecord } from "@hallederiz/domain";
import type { Document, DocumentDeliveryStatus, DocumentType } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getDeliveryMockData } from "../../deliveries/queries/delivery-mock-data";
import { getInvoiceMockData } from "../../invoices/queries/invoice-mock-data";
import { getOfferMockData } from "../../offers/queries/offer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";
import { getPaymentMockData } from "../../payments/queries/payment-mock-data";
import { getReturnMockData } from "../../returns/queries/return-mock-data";
import { getWarehouseOrderMockData } from "../../warehouse/queries/warehouse-mock-data";

const tenantId = "tenant_1";
const createdBy = "user_1";

export async function getDocumentMockData(): Promise<Document[]> {
  const [offers, orders, payments, warehouseOrders, deliveries, invoices, returns] = await Promise.all([
    getOfferMockData(),
    getOrderMockData(),
    getPaymentMockData(),
    getWarehouseOrderMockData(),
    getDeliveryMockData(),
    getInvoiceMockData(),
    getReturnMockData()
  ]);

  const records: Document[] = [
    offers[0]
      ? buildDocumentRecord({
          tenantId,
          type: "offer_pdf",
          entityType: "offer",
          entityId: offers[0].id,
          entityNo: offers[0].offerNo,
          customerId: offers[0].customerId,
          createdBy,
          title: "Teklif PDF"
        })
      : null,
    orders[0]
      ? buildDocumentRecord({
          tenantId,
          type: "order_pdf",
          entityType: "order",
          entityId: orders[0].id,
          entityNo: orders[0].orderNo,
          customerId: orders[0].customerId,
          createdBy,
          title: "Siparis PDF"
        })
      : null,
    payments[0]
      ? buildDocumentRecord({
          tenantId,
          type: "payment_receipt_pdf",
          entityType: "payment",
          entityId: payments[0].id,
          entityNo: payments[0].receiptNo,
          customerId: payments[0].customerId,
          createdBy,
          title: "Tahsilat Makbuzu"
        })
      : null,
    warehouseOrders[0]
      ? buildDocumentRecord({
          tenantId,
          type: "warehouse_note_pdf",
          entityType: "warehouse_order",
          entityId: warehouseOrders[0].id,
          entityNo: warehouseOrders[0].warehouseOrderNo,
          customerId: warehouseOrders[0].customerId,
          createdBy,
          title: "Depo Hazirlik Notu"
        })
      : null,
    deliveries[0]
      ? buildDocumentRecord({
          tenantId,
          type: "delivery_note_pdf",
          entityType: "delivery",
          entityId: deliveries[0].id,
          entityNo: deliveries[0].deliveryNo,
          customerId: deliveries[0].customerId,
          createdBy,
          title: "Teslim Fisi"
        })
      : null,
    deliveries[0]
      ? buildDocumentRecord({
          tenantId,
          type: "dispatch_note_pdf",
          entityType: "dispatch",
          entityId: deliveries[0].id,
          entityNo: `IRS-${deliveries[0].deliveryNo}`,
          customerId: deliveries[0].customerId,
          createdBy,
          title: "Irsaliye"
        })
      : null,
    invoices[0]
      ? buildDocumentRecord({
          tenantId,
          type: "invoice_pdf",
          entityType: "invoice",
          entityId: invoices[0].id,
          entityNo: invoices[0].invoiceNo,
          customerId: invoices[0].customerId,
          createdBy,
          title: "Fatura PDF"
        })
      : null,
    returns[0]
      ? buildDocumentRecord({
          tenantId,
          type: "return_note_pdf",
          entityType: "return",
          entityId: returns[0].id,
          entityNo: returns[0].returnNo,
          customerId: returns[0].customerId,
          createdBy,
          title: "Iade Notu"
        })
      : null
    ,
    customers[0]
      ? buildDocumentRecord({
          tenantId,
          type: "statement_pdf",
          entityType: "statement",
          entityId: customers[0].id,
          entityNo: `EXT-${customers[0].code}`,
          customerId: customers[0].id,
          createdBy,
          title: "Cari Ekstre"
        })
      : null,
    customers[1]
      ? buildDocumentRecord({
          tenantId,
          type: "statement_pdf",
          entityType: "statement",
          entityId: customers[1].id,
          entityNo: `EXT-${customers[1].code}`,
          customerId: customers[1].id,
          createdBy,
          title: "Cari Ekstre"
        })
      : null
  ].filter((document): document is Document => Boolean(document));

  return records.map((document, index) => ({
    ...document,
    id: `document_${index + 1}`,
    documentNo: `DOC-${112 + index}`,
    deliveries:
      index % 2 === 0
        ? [{ ...buildDocumentDeliveryRequest(document, "whatsapp", "0532 111 22 33"), id: `document_delivery_${index + 1}`, status: "sent", sentAt: "2026-04-28T12:00:00.000Z" }]
        : []
  }));
}

export async function getDocumentById(documentId?: string): Promise<Document | null> {
  const documents = await getDocumentMockData();
  if (!documentId) {
    return documents[0] ?? null;
  }
  return documents.find((document) => document.id === documentId || document.documentNo === documentId) ?? null;
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    offer_pdf: "Teklif PDF",
    order_pdf: "Sipariş PDF",
    payment_receipt_pdf: "Tahsilat makbuzu",
    warehouse_note_pdf: "Depo notu",
    delivery_note_pdf: "Teslim fişi",
    dispatch_note_pdf: "İrsaliye",
    invoice_pdf: "Fatura PDF",
    statement_pdf: "Cari ekstre",
    return_note_pdf: "İade notu"
  };
  return labels[type];
}

export function getDocumentDeliveryStatusLabel(status?: DocumentDeliveryStatus): string {
  const labels: Record<DocumentDeliveryStatus | "none", string> = {
    queued: "Kuyrukta",
    sent: "İletim kaydı",
    delivered: "Teslim kaydı",
    failed: "Başarısız",
    none: "Kayıt yok"
  };
  return labels[status ?? "none"];
}

export { customers };

