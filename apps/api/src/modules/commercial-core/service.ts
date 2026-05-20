import type { Delivery, Document, DocumentType, Invoice, PaymentReceipt, Return, SaleOrder, SaleOrderLine, WarehouseOrder } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { CommercialCoreRepository } from "./repository";

export class CommercialCoreService {
  private readonly repository: CommercialCoreRepository;
  constructor(context: RequestContext) {
    this.repository = new CommercialCoreRepository(context);
  }

  listOrders() { return this.repository.listOrders(); }
  getOrder(id: string) { return this.repository.getOrder(id); }
  createOrder(payload: Partial<SaleOrder>) { return this.repository.createOrder(payload); }
  patchOrder(id: string, payload: Partial<SaleOrder>) { return this.repository.patchOrder(id, payload); }
  addOrderLine(id: string, payload: Partial<SaleOrderLine>) { return this.repository.addOrderLine(id, payload); }
  patchOrderLine(id: string, lineId: string, payload: Partial<SaleOrderLine>) { return this.repository.patchOrderLine(id, lineId, payload); }
  confirmOrder(id: string) { return this.repository.confirmOrder(id); }
  planSourcing(id: string) { return this.repository.planSourcing(id); }
  createWarehouseOrderFromOrder(id: string) { return this.repository.createWarehouseOrderFromOrder(id); }
  createFactoryOrders(id: string) { return this.repository.createFactoryOrders(id); }
  cancelOrder(id: string) { return this.repository.cancelOrder(id); }

  listDeliveries() { return this.repository.listDeliveries(); }
  getDelivery(id: string) { return this.repository.getDelivery(id); }
  createDelivery(payload: Partial<Delivery>) { return this.repository.createDelivery(payload); }
  validateDelivery(id: string) { return this.repository.validateDelivery(id); }
  completeDelivery(id: string) { return this.repository.completeDelivery(id); }
  rollbackDelivery(id: string) { return this.repository.rollbackDelivery(id); }
  notifyDeliveryCustomer(id: string) { return this.repository.notifyDeliveryCustomer(id); }

  listInvoices() { return this.repository.listInvoices(); }
  getInvoice(id: string) { return this.repository.getInvoice(id); }
  createInvoice(payload: Partial<Invoice>) { return this.repository.createInvoice(payload); }
  issueInvoice(id: string) { return this.repository.issueInvoice(id); }
  cancelInvoice(id: string) { return this.repository.cancelInvoice(id); }
  sendInvoice(id: string) { return this.repository.sendInvoice(id); }

  listReturns() { return this.repository.listReturns(); }
  getReturn(id: string) { return this.repository.getReturn(id); }
  createReturn(payload: Partial<Return>) { return this.repository.createReturn(payload); }
  approveReturn(id: string) { return this.repository.approveReturn(id); }
  receiveReturn(id: string) { return this.repository.receiveReturn(id); }
  completeReturn(id: string) { return this.repository.completeReturn(id); }
  cancelReturn(id: string) { return this.repository.cancelReturn(id); }

  listDocuments() { return this.repository.listDocuments(); }
  getDocument(id: string) { return this.repository.getDocument(id); }
  renderDocument(payload: { type: DocumentType; entityType: Document["entityType"]; entityId: string; entityNo: string; customerId?: string }) {
    return this.repository.renderDocument(payload);
  }
  regenerateDocument(id: string) { return this.repository.regenerateDocument(id); }
  sendDocumentWhatsApp(id: string) { return this.repository.sendDocumentWhatsApp(id); }
  sendDocumentEmail(id: string) { return this.repository.sendDocumentEmail(id); }

  listPayments() { return this.repository.listPayments(); }
  getPayment(id: string) { return this.repository.getPayment(id); }
  createPayment(payload: Partial<PaymentReceipt>) { return this.repository.createPayment(payload); }
  confirmPayment(id: string) { return this.repository.confirmPayment(id); }
  reversePayment(id: string, reason?: string) { return this.repository.reversePayment(id, reason); }
  getPaymentAllocations(id: string) { return this.repository.getPaymentAllocations(id); }
  listPaymentReversals(paymentId: string) { return this.repository.listPaymentReversals(paymentId); }
  createPaymentReversal(
    paymentId: string,
    input: { amount: number; currency?: string; reason: string; idempotencyKey?: string }
  ) {
    return this.repository.createPaymentReversal(paymentId, input);
  }
  listDocumentDeliveries(documentId: string) { return this.repository.listDocumentDeliveries(documentId); }
  listDeliveryLines(deliveryId: string) { return this.repository.listDeliveryLines(deliveryId); }
  listInvoiceLines(invoiceId: string) { return this.repository.listInvoiceLines(invoiceId); }
  listReturnLines(returnId: string) { return this.repository.listReturnLines(returnId); }

  listWarehouseOrders() { return this.repository.listWarehouseOrders(); }
  getWarehouseOrder(id: string) { return this.repository.getWarehouseOrder(id); }
  createWarehouseOrder(payload: Partial<WarehouseOrder>) { return this.repository.createWarehouseOrder(payload); }
  assignWarehouseOrder(id: string, assignedTo: string) { return this.repository.assignWarehouseOrder(id, assignedTo); }
  startWarehouseOrder(id: string) { return this.repository.startWarehouseOrder(id); }
  markWarehouseOrderPrepared(id: string) { return this.repository.markWarehouseOrderPrepared(id); }
  cancelWarehouseOrder(id: string) { return this.repository.cancelWarehouseOrder(id); }
}
