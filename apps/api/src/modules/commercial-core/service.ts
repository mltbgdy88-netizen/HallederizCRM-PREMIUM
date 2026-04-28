import type { PaymentReceipt, SaleOrder, SaleOrderLine, WarehouseOrder } from "@hallederiz/types";
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

  listPayments() { return this.repository.listPayments(); }
  getPayment(id: string) { return this.repository.getPayment(id); }
  createPayment(payload: Partial<PaymentReceipt>) { return this.repository.createPayment(payload); }
  confirmPayment(id: string) { return this.repository.confirmPayment(id); }
  reversePayment(id: string, reason?: string) { return this.repository.reversePayment(id, reason); }
  getPaymentAllocations(id: string) { return this.repository.getPaymentAllocations(id); }

  listWarehouseOrders() { return this.repository.listWarehouseOrders(); }
  getWarehouseOrder(id: string) { return this.repository.getWarehouseOrder(id); }
  createWarehouseOrder(payload: Partial<WarehouseOrder>) { return this.repository.createWarehouseOrder(payload); }
  assignWarehouseOrder(id: string, assignedTo: string) { return this.repository.assignWarehouseOrder(id, assignedTo); }
  startWarehouseOrder(id: string) { return this.repository.startWarehouseOrder(id); }
  markWarehouseOrderPrepared(id: string) { return this.repository.markWarehouseOrderPrepared(id); }
  cancelWarehouseOrder(id: string) { return this.repository.cancelWarehouseOrder(id); }
}
